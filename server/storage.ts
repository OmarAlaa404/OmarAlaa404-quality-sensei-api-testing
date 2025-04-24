import { users, type User, type InsertUser, boards, type Board, type InsertBoard, lists, type List, type InsertList, cards, type Card, type InsertCard } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Board operations
  getBoards(userId: number, options?: { page?: number; limit?: number }): Promise<{ boards: Board[]; total: number }>;
  searchBoards(userId: number, query: { name?: string; description?: string }): Promise<Board[]>;
  getBoard(id: number): Promise<Board | undefined>;
  createBoard(board: InsertBoard): Promise<Board>;
  updateBoard(id: number, board: Partial<Board>): Promise<Board | undefined>;
  deleteBoard(id: number): Promise<boolean>;
  
  // List operations
  getLists(boardId: number, options?: { page?: number; limit?: number }): Promise<{ lists: List[]; total: number }>;
  getList(id: number): Promise<List | undefined>;
  createList(list: InsertList): Promise<List>;
  updateList(id: number, list: Partial<List>): Promise<List | undefined>;
  deleteList(id: number): Promise<boolean>;
  
  // Card operations
  getCards(listId: number, options?: { page?: number; limit?: number; sort?: string; order?: 'asc' | 'desc' }): Promise<{ cards: Card[]; total: number }>;
  searchCards(userId: number, query: { title?: string; description?: string; label?: string; due?: string }): Promise<Card[]>;
  getCard(id: number): Promise<Card | undefined>;
  createCard(card: InsertCard): Promise<Card>;
  updateCard(id: number, card: Partial<Card>): Promise<Card | undefined>;
  deleteCard(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private boards: Map<number, Board>;
  private lists: Map<number, List>;
  private cards: Map<number, Card>;
  private userId: number;
  private boardId: number;
  private listId: number;
  private cardId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.boards = new Map();
    this.lists = new Map();
    this.cards = new Map();
    this.userId = 1;
    this.boardId = 1;
    this.listId = 1;
    this.cardId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Board methods
  async getBoards(userId: number, options?: { page?: number; limit?: number }): Promise<{ boards: Board[]; total: number }> {
    const allBoards = Array.from(this.boards.values()).filter(board => board.userId === userId);
    const total = allBoards.length;
    
    if (options?.page !== undefined && options?.limit !== undefined) {
      const startIndex = (options.page - 1) * options.limit;
      const endIndex = startIndex + options.limit;
      return { 
        boards: allBoards.slice(startIndex, endIndex), 
        total 
      };
    }
    
    return { boards: allBoards, total };
  }
  
  async searchBoards(userId: number, query: { name?: string; description?: string }): Promise<Board[]> {
    const allBoards = Array.from(this.boards.values()).filter(board => board.userId === userId);
    
    return allBoards.filter(board => {
      // If name query exists, check if board name includes it (case insensitive)
      if (query.name && !board.name.toLowerCase().includes(query.name.toLowerCase())) {
        return false;
      }
      
      // If description query exists, check if board description includes it (case insensitive)
      if (query.description && board.description) {
        return board.description.toLowerCase().includes(query.description.toLowerCase());
      } else if (query.description) {
        return false;
      }
      
      return true;
    });
  }

  async getBoard(id: number): Promise<Board | undefined> {
    return this.boards.get(id);
  }

  async createBoard(board: InsertBoard): Promise<Board> {
    const id = this.boardId++;
    const newBoard: Board = { ...board, id };
    this.boards.set(id, newBoard);
    return newBoard;
  }

  async updateBoard(id: number, board: Partial<Board>): Promise<Board | undefined> {
    const existingBoard = this.boards.get(id);
    if (!existingBoard) return undefined;
    
    const updatedBoard = { ...existingBoard, ...board };
    this.boards.set(id, updatedBoard);
    return updatedBoard;
  }

  async deleteBoard(id: number): Promise<boolean> {
    return this.boards.delete(id);
  }

  // List methods
  async getLists(boardId: number, options?: { page?: number; limit?: number }): Promise<{ lists: List[]; total: number }> {
    const allLists = Array.from(this.lists.values()).filter(list => list.boardId === boardId);
    const total = allLists.length;
    
    if (options?.page !== undefined && options?.limit !== undefined) {
      const startIndex = (options.page - 1) * options.limit;
      const endIndex = startIndex + options.limit;
      return { 
        lists: allLists.slice(startIndex, endIndex), 
        total 
      };
    }
    
    return { lists: allLists, total };
  }

  async getList(id: number): Promise<List | undefined> {
    return this.lists.get(id);
  }

  async createList(list: InsertList): Promise<List> {
    const id = this.listId++;
    const newList: List = { ...list, id };
    this.lists.set(id, newList);
    return newList;
  }

  async updateList(id: number, list: Partial<List>): Promise<List | undefined> {
    const existingList = this.lists.get(id);
    if (!existingList) return undefined;
    
    const updatedList = { ...existingList, ...list };
    this.lists.set(id, updatedList);
    return updatedList;
  }

  async deleteList(id: number): Promise<boolean> {
    return this.lists.delete(id);
  }

  // Card methods
  async getCards(listId: number, options?: { page?: number; limit?: number; sort?: string; order?: 'asc' | 'desc' }): Promise<{ cards: Card[]; total: number }> {
    let allCards = Array.from(this.cards.values())
      .filter(card => card.listId === listId && !card.isDeleted);
    
    const total = allCards.length;
    
    // Apply sorting if requested
    if (options?.sort) {
      const sortField = options.sort as keyof Card;
      const sortOrder = options?.order || 'asc';
      
      allCards = allCards.sort((a, b) => {
        const valueA = a[sortField];
        const valueB = b[sortField];
        
        // Handle null values
        if (valueA === null && valueB === null) return 0;
        if (valueA === null) return sortOrder === 'asc' ? 1 : -1;
        if (valueB === null) return sortOrder === 'asc' ? -1 : 1;
        
        // Compare values based on their type
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortOrder === 'asc' 
            ? valueA.localeCompare(valueB) 
            : valueB.localeCompare(valueA);
        } else if (valueA instanceof Date && valueB instanceof Date) {
          return sortOrder === 'asc' 
            ? valueA.getTime() - valueB.getTime() 
            : valueB.getTime() - valueA.getTime();
        } else {
          // Default comparison for other types
          return sortOrder === 'asc'
            ? String(valueA).localeCompare(String(valueB))
            : String(valueB).localeCompare(String(valueA));
        }
      });
    }
    
    // Apply pagination if requested
    if (options?.page !== undefined && options?.limit !== undefined) {
      const startIndex = (options.page - 1) * options.limit;
      const endIndex = startIndex + options.limit;
      return {
        cards: allCards.slice(startIndex, endIndex),
        total
      };
    }
    
    return { cards: allCards, total };
  }
  
  async searchCards(userId: number, query: { title?: string; description?: string; label?: string; due?: string }): Promise<Card[]> {
    // First get all the user's boards
    const userBoards = Array.from(this.boards.values())
      .filter(board => board.userId === userId);
    
    // Get all lists belonging to user's boards
    const boardIds = userBoards.map(board => board.id);
    const userLists = Array.from(this.lists.values())
      .filter(list => boardIds.includes(list.boardId));
    
    // Get all cards from the user's lists
    const listIds = userLists.map(list => list.id);
    const userCards = Array.from(this.cards.values())
      .filter(card => listIds.includes(card.listId) && !card.isDeleted);
    
    // Filter cards based on search criteria
    return userCards.filter(card => {
      // Title search
      if (query.title && !card.title.toLowerCase().includes(query.title.toLowerCase())) {
        return false;
      }
      
      // Description search
      if (query.description && card.description) {
        if (!card.description.toLowerCase().includes(query.description.toLowerCase())) {
          return false;
        }
      } else if (query.description) {
        return false;
      }
      
      // Label search
      if (query.label && card.labels) {
        const hasMatchingLabel = card.labels.some(label => 
          label.toLowerCase().includes(query.label!.toLowerCase())
        );
        if (!hasMatchingLabel) {
          return false;
        }
      } else if (query.label) {
        return false;
      }
      
      // Due date search
      if (query.due && card.dueDate) {
        // Support search terms like 'overdue', 'today', 'upcoming', 'completed', etc.
        const now = new Date();
        const dueDate = new Date(card.dueDate);
        
        if (query.due === 'overdue') {
          return dueDate < now;
        } else if (query.due === 'today') {
          return dueDate.toDateString() === now.toDateString();
        } else if (query.due === 'upcoming') {
          return dueDate > now;
        } else {
          // Assume it's a date string to match
          return card.dueDate.includes(query.due);
        }
      } else if (query.due) {
        return false;
      }
      
      return true;
    });
  }

  async getCard(id: number): Promise<Card | undefined> {
    const card = this.cards.get(id);
    if (card && card.isDeleted) return undefined;
    return card;
  }

  async createCard(card: InsertCard): Promise<Card> {
    const id = this.cardId++;
    const newCard: Card = { 
      ...card, 
      id, 
      isDeleted: false,
      labels: card.labels || [],
      attachments: card.attachments || []
    };
    this.cards.set(id, newCard);
    return newCard;
  }

  async updateCard(id: number, card: Partial<Card>): Promise<Card | undefined> {
    const existingCard = this.cards.get(id);
    if (!existingCard || existingCard.isDeleted) return undefined;
    
    const updatedCard = { ...existingCard, ...card };
    this.cards.set(id, updatedCard);
    return updatedCard;
  }

  async deleteCard(id: number): Promise<boolean> {
    const card = this.cards.get(id);
    if (!card) return false;
    
    // Implement soft delete
    card.isDeleted = true;
    this.cards.set(id, card);
    return true;
  }
}

export const storage = new MemStorage();
