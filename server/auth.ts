import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);
const JWT_SECRET = process.env.JWT_SECRET || "quality-sensei-jwt-secret";
const TOKEN_EXPIRY = '24h';

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Generate JWT token
function generateToken(user: SelectUser) {
  const { password, ...tokenData } = user;
  return jwt.sign(tokenData, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// Authorize with Basic Auth credentials
async function basicAuth(req: Request): Promise<SelectUser | null> {
  // Get auth header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return null;
  }

  // Extract and decode credentials from Basic auth
  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
    const [username, password] = credentials.split(':');
    
    // Verify credentials
    const user = await storage.getUserByUsername(username);
    if (!user || !(await comparePasswords(password, user.password))) {
      return null;
    }
    
    return user;
  } catch (error) {
    return null;
  }
}

// Authorize with Bearer token
async function bearerAuth(req: Request): Promise<SelectUser | null> {
  // Get auth header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  // Extract token
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || !decoded.id) {
      return null;
    }
    
    // Get user
    const user = await storage.getUser(decoded.id);
    if (!user) {
      return null;
    }
    
    return user;
  } catch (error) {
    return null;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "quality-sensei-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send password back to client
        const { password, ...safeUser } = user;
        res.status(201).json(safeUser);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: { message?: string } | undefined) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Authentication failed" });
      
      req.login(user, (err: any) => {
        if (err) return next(err);
        // Don't send password back to client
        const { password, ...safeUser } = user;
        
        // Generate JWT token
        const token = generateToken(user);
        
        // Return user info and token
        res.status(200).json({
          ...safeUser,
          token
        });
      });
    })(req, res, next);
  });

  // Token generation endpoint
  app.post("/api/token", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Generate token
      const token = generateToken(user);
      
      // Don't send password back to client
      const { password: _, ...safeUser } = user;
      
      res.status(200).json({
        ...safeUser,
        token
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err: any) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", async (req, res) => {
    try {
      // First try session authentication
      if (req.isAuthenticated()) {
        const { password, ...safeUser } = req.user as SelectUser;
        return res.json(safeUser);
      }
      
      // Then try token authentication
      let user = await bearerAuth(req);
      
      // If not authenticated with Bearer token, try Basic auth
      if (!user) {
        user = await basicAuth(req);
      }
      
      // If any auth method worked, return user info
      if (user) {
        const { password, ...safeUser } = user;
        return res.json(safeUser);
      }
      
      // If no auth method succeeded
      return res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
}
