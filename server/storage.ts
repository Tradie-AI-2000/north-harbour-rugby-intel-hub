import { users, players, type User, type InsertUser, type Player, type InsertPlayer } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayers(): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, player: Partial<Player>): Promise<Player | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async getPlayers(): Promise<Player[]> {
    return await db.select().from(players);
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const [newPlayer] = await db
      .insert(players)
      .values(player)
      .returning();
    return newPlayer;
  }

  async updatePlayer(id: string, playerUpdate: Partial<Player>): Promise<Player | undefined> {
    const [updatedPlayer] = await db
      .update(players)
      .set({ ...playerUpdate, updatedAt: new Date() })
      .where(eq(players.id, id))
      .returning();
    return updatedPlayer || undefined;
  }
}

export const storage = new DatabaseStorage();
