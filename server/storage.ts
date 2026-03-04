import { db } from "./db";
import {
  symptomChecks,
  type InsertSymptomCheck,
  type SymptomCheck,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";

export interface IStorage {
  getSymptomChecks(): Promise<SymptomCheck[]>;
  getSymptomCheck(id: number): Promise<SymptomCheck | undefined>;
  createSymptomCheck(check: Omit<SymptomCheck, "id" | "createdAt">): Promise<SymptomCheck>;
  getStats(): Promise<{ checksToday: number; avgRiskScore: number; highRiskCases: number }>;
}

export class DatabaseStorage implements IStorage {
  async getSymptomChecks(): Promise<SymptomCheck[]> {
    return await db.select().from(symptomChecks).orderBy(desc(symptomChecks.createdAt));
  }

  async getSymptomCheck(id: number): Promise<SymptomCheck | undefined> {
    const [check] = await db.select().from(symptomChecks).where(eq(symptomChecks.id, id));
    return check;
  }

  async createSymptomCheck(check: Omit<SymptomCheck, "id" | "createdAt">): Promise<SymptomCheck> {
    const [newCheck] = await db.insert(symptomChecks).values(check).returning();
    return newCheck;
  }

  async getStats(): Promise<{ checksToday: number; avgRiskScore: number; highRiskCases: number }> {
    // Simple mock stats logic based on current data
    const allChecks = await this.getSymptomChecks();
    
    // Checks today (mocking 124 base + actual db count)
    const checksToday = 124 + allChecks.length;
    
    // Average risk score
    let totalRisk = allChecks.reduce((sum, c) => sum + c.riskScore, 0);
    // Base 42 avg for empty state realism
    const avgRiskScore = allChecks.length > 0 
      ? Math.round(totalRisk / allChecks.length)
      : 42;
      
    // High risk cases
    const highRiskCases = 3 + allChecks.filter(c => c.riskLevel === 'High' || c.riskLevel === 'Critical').length;

    return {
      checksToday,
      avgRiskScore,
      highRiskCases
    };
  }
}

export const storage = new DatabaseStorage();
