import { sqliteDb, hashPassword, verifyPassword, type DbUser } from "./sqlite";

export type SymptomCheck = {
  id: number;
  symptoms: string[];
  description: string | null;
  riskScore: number;
  riskLevel: string;
  possibleConditions: string[];
  recommendedAction: string;
  explanation: string;
  createdAt: Date;
};

export type User = {
  id: number;
  name: string;
  username: string;
  isAdmin: boolean;
};

interface DbCheckRow {
  id: number;
  user_id: number;
  symptoms: string;
  description: string | null;
  risk_score: number;
  risk_level: string;
  possible_conditions: string;
  recommended_action: string;
  explanation: string;
  created_at: string;
}

function mapRowToCheck(row: DbCheckRow): SymptomCheck {
  return {
    id: row.id,
    symptoms: JSON.parse(row.symptoms),
    description: row.description,
    riskScore: row.risk_score,
    riskLevel: row.risk_level,
    possibleConditions: JSON.parse(row.possible_conditions),
    recommendedAction: row.recommended_action,
    explanation: row.explanation,
    createdAt: new Date(row.created_at + "Z"),
  };
}

class SQLiteStorage {
  // ── Auth ──────────────────────────────────────────
  createUser(name: string, username: string, password: string): User | null {
    try {
      const hashed = hashPassword(password);
      const stmt = sqliteDb.prepare(
        "INSERT INTO users (name, username, password) VALUES (?, ?, ?)"
      );
      const result = stmt.run(name, username, hashed);
      return { id: result.lastInsertRowid as number, name, username, isAdmin: false };
    } catch (err: any) {
      if (err.code === "SQLITE_CONSTRAINT_UNIQUE") return null;
      throw err;
    }
  }

  getUserByUsername(username: string): DbUser | null {
    const row = sqliteDb
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username) as DbUser | undefined;
    return row || null;
  }

  getUserById(id: number): User | null {
    const row = sqliteDb
      .prepare("SELECT id, name, username, is_admin FROM users WHERE id = ?")
      .get(id) as { id: number; name: string; username: string; is_admin: number } | undefined;
    if (!row) return null;
    return { id: row.id, name: row.name, username: row.username, isAdmin: row.is_admin === 1 };
  }

  updateUserName(id: number, name: string): User | null {
    sqliteDb.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, id);
    return this.getUserById(id);
  }

  verifyLogin(username: string, password: string): User | null {
    const user = this.getUserByUsername(username);
    if (!user) return null;
    if (!verifyPassword(password, user.password)) return null;
    return { id: user.id, name: user.name, username: user.username, isAdmin: user.is_admin === 1 };
  }

  // ── Symptom Checks ───────────────────────────────
  async getSymptomChecks(userId: number): Promise<SymptomCheck[]> {
    const rows = sqliteDb
      .prepare(
        "SELECT * FROM symptom_checks WHERE user_id = ? ORDER BY created_at DESC"
      )
      .all(userId) as DbCheckRow[];
    return rows.map(mapRowToCheck);
  }

  async getSymptomCheck(id: number): Promise<SymptomCheck | undefined> {
    const row = sqliteDb
      .prepare("SELECT * FROM symptom_checks WHERE id = ?")
      .get(id) as DbCheckRow | undefined;
    return row ? mapRowToCheck(row) : undefined;
  }

  async createSymptomCheck(
    userId: number,
    check: Omit<SymptomCheck, "id" | "createdAt">
  ): Promise<SymptomCheck> {
    const stmt = sqliteDb.prepare(`
      INSERT INTO symptom_checks (user_id, symptoms, description, risk_score, risk_level, possible_conditions, recommended_action, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      userId,
      JSON.stringify(check.symptoms),
      check.description,
      check.riskScore,
      check.riskLevel,
      JSON.stringify(check.possibleConditions),
      check.recommendedAction,
      check.explanation
    );

    const newRow = sqliteDb
      .prepare("SELECT * FROM symptom_checks WHERE id = ?")
      .get(result.lastInsertRowid) as DbCheckRow;
    return mapRowToCheck(newRow);
  }

  async deleteSymptomCheck(id: number, userId: number): Promise<boolean> {
    const result = sqliteDb
      .prepare("DELETE FROM symptom_checks WHERE id = ? AND user_id = ?")
      .run(id, userId);
    return result.changes > 0;
  }

  async getStats(
    userId: number
  ): Promise<{ checksToday: number; avgRiskScore: number; highRiskCases: number }> {
    const checks = await this.getSymptomChecks(userId);
    const today = new Date().toISOString().slice(0, 10);
    const checksToday = checks.filter(
      (c) => c.createdAt.toISOString().slice(0, 10) === today
    ).length;
    const totalRisk = checks.reduce((sum, c) => sum + c.riskScore, 0);
    const avgRiskScore =
      checks.length > 0 ? Math.round(totalRisk / checks.length) : 0;
    const highRiskCases = checks.filter(
      (c) => c.riskLevel === "High" || c.riskLevel === "Critical"
    ).length;
    return { checksToday, avgRiskScore, highRiskCases };
  }
}

export const storage = new SQLiteStorage();
