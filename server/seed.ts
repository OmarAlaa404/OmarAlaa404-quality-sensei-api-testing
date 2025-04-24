import { storage } from "./storage";
import { hashPassword } from "./auth";

export async function seedDefaultUser() {
  try {
    // Check if user already exists
    const existingUser = await storage.getUserByUsername("QualitySensei");
    
    if (!existingUser) {
      // Create default user
      const hashedPassword = await hashPassword("12345678");
      
      const user = await storage.createUser({
        username: "QualitySensei",
        password: hashedPassword
      });
      
      console.log(`Default user created: ${user.username} (ID: ${user.id})`);
    } else {
      console.log("Default user already exists, skipping seed");
    }
  } catch (error) {
    console.error("Error seeding default user:", error);
  }
}