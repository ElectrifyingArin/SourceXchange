import { 
  users, type User, type InsertUser,
  codeConversions, type CodeConversion, type InsertCodeConversion
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCodeConversion(id: number): Promise<CodeConversion | undefined>;
  createCodeConversion(conversion: InsertCodeConversion): Promise<CodeConversion>;
  getCodeConversionsByUserId(userId: number): Promise<CodeConversion[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private codeConversions: Map<number, CodeConversion>;
  private userIdCounter: number;
  private conversionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.codeConversions = new Map();
    this.userIdCounter = 1;
    this.conversionIdCounter = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCodeConversion(id: number): Promise<CodeConversion | undefined> {
    return this.codeConversions.get(id);
  }

  async createCodeConversion(insertConversion: InsertCodeConversion): Promise<CodeConversion> {
    const id = this.conversionIdCounter++;
    const conversion: CodeConversion = { ...insertConversion, id };
    this.codeConversions.set(id, conversion);
    return conversion;
  }

  async getCodeConversionsByUserId(userId: number): Promise<CodeConversion[]> {
    return Array.from(this.codeConversions.values()).filter(
      (conversion) => conversion.userId === userId
    );
  }
}

export const storage = new MemStorage();
