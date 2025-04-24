import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertBoardSchema, insertListSchema, insertCardSchema } from "@shared/schema";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./swagger";
import jwt from "jsonwebtoken";
import { User as SelectUser } from "@shared/schema";

// JWT Secret key
const JWT_SECRET = process.env.JWT_SECRET || "quality-sensei-jwt-secret";

// Auth middleware to check if user is authenticated via any method
const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check session authentication first
    if (req.isAuthenticated()) {
      return next();
    }
    
    // Then check for token authentication (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded && decoded.id) {
          const user = await storage.getUser(decoded.id);
          if (user) {
            // Set user in request object
            req.user = user;
            return next();
          }
        }
      } catch (error) {
        // Token verification failed, continue to next auth method
      }
    }
    
    // Check for Basic authentication
    if (authHeader && authHeader.startsWith('Basic ')) {
      try {
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
        const [username, password] = credentials.split(':');
        
        // Manually check credentials
        const user = await storage.getUserByUsername(username);
        if (user) {
          // Password check should be done via proper password comparison function
          // This is a simplified example
          const compare = await import('./auth').then(m => m.comparePasswords);
          if (await compare(password, user.password)) {
            // Set user in request object
            req.user = user;
            return next();
          }
        }
      } catch (error) {
        // Basic auth failed, continue to next step
      }
    }
    
    // If no authentication method succeeded
    return res.status(401).json({ message: "Unauthorized" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error during authentication" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Swagger documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  
  // Direct access to Swagger JSON for Postman import
  app.get("/swagger.json", (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });

  // Board routes
  app.get("/api/boards", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Extract pagination parameters if present
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const pagination = (page && limit) ? { page, limit } : undefined;
      const result = await storage.getBoards(userId, pagination);
      
      // Set pagination headers
      if (pagination) {
        res.setHeader('X-Total-Count', result.total.toString());
        res.setHeader('X-Page', page.toString());
        res.setHeader('X-Per-Page', limit.toString());
        res.setHeader('X-Total-Pages', Math.ceil(result.total / limit).toString());
      }
      
      res.json(result.boards);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Board search with query parameters
  app.get("/api/boards/search", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const query = {
        name: req.query.name as string | undefined,
        description: req.query.description as string | undefined
      };
      
      const boards = await storage.searchBoards(userId, query);
      res.json(boards);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/boards", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const parseResult = insertBoardSchema.safeParse({ ...req.body, userId });
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid board data", errors: parseResult.error.flatten() });
      }
      
      const board = await storage.createBoard(parseResult.data);
      res.status(201).json(board);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.get("/api/boards/:id", isAuthenticated, async (req, res) => {
    try {
      const board = await storage.getBoard(Number(req.params.id));
      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }
      
      // Check if board belongs to user
      if (board.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(board);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.put("/api/boards/:id", isAuthenticated, async (req, res) => {
    try {
      const boardId = Number(req.params.id);
      const board = await storage.getBoard(boardId);
      
      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }
      
      // Check if board belongs to user
      if (board.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedBoard = await storage.updateBoard(boardId, req.body);
      res.json(updatedBoard);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/boards/:id", isAuthenticated, async (req, res) => {
    try {
      const boardId = Number(req.params.id);
      const board = await storage.getBoard(boardId);
      
      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }
      
      // Check if board belongs to user
      if (board.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteBoard(boardId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // List routes
  app.get("/api/boards/:boardId/lists", isAuthenticated, async (req, res) => {
    try {
      const boardId = Number(req.params.boardId);
      const board = await storage.getBoard(boardId);
      
      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }
      
      // Check if board belongs to user
      if (board.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Extract pagination parameters if present
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const pagination = (page && limit) ? { page, limit } : undefined;
      const result = await storage.getLists(boardId, pagination);
      
      // Set pagination headers
      if (pagination) {
        res.setHeader('X-Total-Count', result.total.toString());
        res.setHeader('X-Page', page.toString());
        res.setHeader('X-Per-Page', limit.toString());
        res.setHeader('X-Total-Pages', Math.ceil(result.total / limit).toString());
      }
      
      res.json(result.lists);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/boards/:boardId/lists", isAuthenticated, async (req, res) => {
    try {
      const boardId = Number(req.params.boardId);
      const board = await storage.getBoard(boardId);
      
      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }
      
      // Check if board belongs to user
      if (board.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const parseResult = insertListSchema.safeParse({ ...req.body, boardId });
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid list data", errors: parseResult.error.flatten() });
      }
      
      const list = await storage.createList(parseResult.data);
      res.status(201).json(list);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.put("/api/boards/:boardId/lists/:listId", isAuthenticated, async (req, res) => {
    try {
      const boardId = Number(req.params.boardId);
      const listId = Number(req.params.listId);
      
      const board = await storage.getBoard(boardId);
      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }
      
      // Check if board belongs to user
      if (board.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const list = await storage.getList(listId);
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }
      
      if (list.boardId !== boardId) {
        return res.status(400).json({ message: "List does not belong to this board" });
      }
      
      const updatedList = await storage.updateList(listId, req.body);
      res.json(updatedList);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/boards/:boardId/lists/:listId", isAuthenticated, async (req, res) => {
    try {
      const boardId = Number(req.params.boardId);
      const listId = Number(req.params.listId);
      
      const board = await storage.getBoard(boardId);
      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }
      
      // Check if board belongs to user
      if (board.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const list = await storage.getList(listId);
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }
      
      if (list.boardId !== boardId) {
        return res.status(400).json({ message: "List does not belong to this board" });
      }
      
      await storage.deleteList(listId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Card routes
  app.get("/api/lists/:listId/cards", isAuthenticated, async (req, res) => {
    try {
      const listId = Number(req.params.listId);
      const list = await storage.getList(listId);
      
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }
      
      // Check if board belongs to user
      const board = await storage.getBoard(list.boardId);
      if (!board || board.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Extract pagination and sorting parameters if present
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const sort = req.query.sort as string | undefined;
      const order = req.query.order as 'asc' | 'desc' | undefined;
      
      const options = {
        ...(page !== undefined && limit !== undefined ? { page, limit } : {}),
        ...(sort !== undefined ? { sort } : {}),
        ...(order !== undefined ? { order } : {})
      };
      
      // Only pass options if they're not empty
      const result = Object.keys(options).length > 0 
        ? await storage.getCards(listId, options) 
        : await storage.getCards(listId);
      
      // Set pagination headers if pagination was requested
      if (page !== undefined && limit !== undefined) {
        res.setHeader('X-Total-Count', result.total.toString());
        res.setHeader('X-Page', page.toString());
        res.setHeader('X-Per-Page', limit.toString());
        res.setHeader('X-Total-Pages', Math.ceil(result.total / limit).toString());
      }
      
      res.json(result.cards);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Card search endpoint
  app.get("/api/cards/search", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const query = {
        title: req.query.title as string | undefined,
        description: req.query.description as string | undefined,
        label: req.query.label as string | undefined,
        due: req.query.due as string | undefined
      };
      
      const cards = await storage.searchCards(userId, query);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/lists/:listId/cards", isAuthenticated, async (req, res) => {
    try {
      const listId = Number(req.params.listId);
      const list = await storage.getList(listId);
      
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }
      
      // Check if board belongs to user
      const board = await storage.getBoard(list.boardId);
      if (!board || board.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const parseResult = insertCardSchema.safeParse({ ...req.body, listId });
      
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid card data", errors: parseResult.error.flatten() });
      }
      
      const card = await storage.createCard(parseResult.data);
      res.status(201).json(card);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.patch("/api/lists/:listId/cards/:cardId", isAuthenticated, async (req, res) => {
    try {
      const listId = Number(req.params.listId);
      const cardId = Number(req.params.cardId);
      
      const list = await storage.getList(listId);
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }
      
      // Check if board belongs to user
      const board = await storage.getBoard(list.boardId);
      if (!board || board.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const card = await storage.getCard(cardId);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      
      if (card.listId !== listId) {
        return res.status(400).json({ message: "Card does not belong to this list" });
      }
      
      const updatedCard = await storage.updateCard(cardId, req.body);
      res.json(updatedCard);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/lists/:listId/cards/:cardId", isAuthenticated, async (req, res) => {
    try {
      const listId = Number(req.params.listId);
      const cardId = Number(req.params.cardId);
      
      const list = await storage.getList(listId);
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }
      
      // Check if board belongs to user
      const board = await storage.getBoard(list.boardId);
      if (!board || board.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const card = await storage.getCard(cardId);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      
      if (card.listId !== listId) {
        return res.status(400).json({ message: "Card does not belong to this list" });
      }
      
      await storage.deleteCard(cardId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
