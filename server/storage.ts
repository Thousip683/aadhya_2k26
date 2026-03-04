import { sqliteDb, hashPassword, verifyPassword, type DbUser } from "./sqlite";

export type SelfCareTip = {
  label: string;
  dos: string[];
  donts: string[];
};

export type SymptomCheck = {
  id: number;
  symptoms: string[];
  description: string | null;
  riskScore: number;
  riskLevel: string;
  possibleConditions: string[];
  recommendedAction: string;
  explanation: string;
  selfCareTips: SelfCareTip[];
  createdAt: Date;
};

export type User = {
  id: number;
  name: string;
  username: string;
  isAdmin: boolean;
  guardianEmail: string | null;
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
  self_care_tips: string | null;
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
    selfCareTips: row.self_care_tips ? JSON.parse(row.self_care_tips) : [],
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
      return { id: result.lastInsertRowid as number, name, username, isAdmin: false, guardianEmail: null };
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
      .prepare("SELECT id, name, username, is_admin, guardian_email FROM users WHERE id = ?")
      .get(id) as { id: number; name: string; username: string; is_admin: number; guardian_email: string | null } | undefined;
    if (!row) return null;
    return { id: row.id, name: row.name, username: row.username, isAdmin: row.is_admin === 1, guardianEmail: row.guardian_email };
  }

  updateUserName(id: number, name: string): User | null {
    sqliteDb.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, id);
    return this.getUserById(id);
  }

  updateGuardianEmail(id: number, guardianEmail: string | null): User | null {
    sqliteDb.prepare("UPDATE users SET guardian_email = ? WHERE id = ?").run(guardianEmail, id);
    return this.getUserById(id);
  }

  getGuardianEmail(userId: number): string | null {
    const row = sqliteDb
      .prepare("SELECT guardian_email FROM users WHERE id = ?")
      .get(userId) as { guardian_email: string | null } | undefined;
    return row?.guardian_email || null;
  }

  verifyLogin(username: string, password: string): User | null {
    const user = this.getUserByUsername(username);
    if (!user) return null;
    if (!verifyPassword(password, user.password)) return null;
    return { id: user.id, name: user.name, username: user.username, isAdmin: user.is_admin === 1, guardianEmail: (user as any).guardian_email ?? null };
  }

  /** Find or create a user from Google OAuth. Username = email, password = random placeholder. */
  findOrCreateGoogleUser(email: string, name: string): User {
    const existing = this.getUserByUsername(email);
    if (existing) {
      return {
        id: existing.id,
        name: existing.name,
        username: existing.username,
        isAdmin: existing.is_admin === 1,
        guardianEmail: (existing as any).guardian_email ?? null,
      };
    }
    // Create with a random password (user can't login with password, only via Google)
    const randomPass = require("crypto").randomBytes(32).toString("hex");
    const hashed = hashPassword(randomPass);
    const stmt = sqliteDb.prepare(
      "INSERT INTO users (name, username, password) VALUES (?, ?, ?)"
    );
    const result = stmt.run(name, email, hashed);
    return { id: result.lastInsertRowid as number, name, username: email, isAdmin: false, guardianEmail: null };
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
      INSERT INTO symptom_checks (user_id, symptoms, description, risk_score, risk_level, possible_conditions, recommended_action, explanation, self_care_tips)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      userId,
      JSON.stringify(check.symptoms),
      check.description,
      check.riskScore,
      check.riskLevel,
      JSON.stringify(check.possibleConditions),
      check.recommendedAction,
      check.explanation,
      typeof check.selfCareTips === 'string' ? check.selfCareTips : JSON.stringify(check.selfCareTips || [])
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

  // ── Admin Methods ─────────────────────────────────
  getAllUsers(): (User & { checkCount: number; lastActive: string | null })[] {
    const rows = sqliteDb.prepare(`
      SELECT u.id, u.name, u.username, u.is_admin, u.guardian_email,
             COUNT(sc.id) as check_count,
             MAX(sc.created_at) as last_active
      FROM users u
      LEFT JOIN symptom_checks sc ON sc.user_id = u.id
      GROUP BY u.id
      ORDER BY u.id
    `).all() as any[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      username: r.username,
      isAdmin: r.is_admin === 1,
      guardianEmail: r.guardian_email,
      checkCount: r.check_count || 0,
      lastActive: r.last_active || null,
    }));
  }

  getAllChecks(limit = 100): (SymptomCheck & { userId: number; userName: string })[] {
    const rows = sqliteDb.prepare(`
      SELECT sc.*, u.name as user_name
      FROM symptom_checks sc
      JOIN users u ON u.id = sc.user_id
      ORDER BY sc.created_at DESC
      LIMIT ?
    `).all(limit) as any[];
    return rows.map((row) => ({
      ...mapRowToCheck(row),
      userId: row.user_id,
      userName: row.user_name,
    }));
  }

  getAdminStats(): {
    totalUsers: number;
    totalChecks: number;
    checksToday: number;
    avgRiskScore: number;
    highRiskCases: number;
    criticalCases: number;
    riskDistribution: { low: number; medium: number; high: number; critical: number };
    topConditions: { name: string; count: number }[];
    recentTrend: { day: string; score: number; cases: number }[];
  } {
    const totalUsers = (sqliteDb.prepare("SELECT COUNT(*) as c FROM users WHERE is_admin = 0").get() as any).c;
    const totalChecks = (sqliteDb.prepare("SELECT COUNT(*) as c FROM symptom_checks").get() as any).c;

    const today = new Date().toISOString().slice(0, 10);
    const checksToday = (sqliteDb.prepare("SELECT COUNT(*) as c FROM symptom_checks WHERE DATE(created_at) = ?").get(today) as any).c;

    const avgRow = sqliteDb.prepare("SELECT AVG(risk_score) as avg FROM symptom_checks").get() as any;
    const avgRiskScore = Math.round(avgRow.avg || 0);

    const highRiskCases = (sqliteDb.prepare("SELECT COUNT(*) as c FROM symptom_checks WHERE risk_level IN ('High', 'Critical')").get() as any).c;
    const criticalCases = (sqliteDb.prepare("SELECT COUNT(*) as c FROM symptom_checks WHERE risk_level = 'Critical'").get() as any).c;

    // Risk distribution
    const distRows = sqliteDb.prepare(`
      SELECT risk_level, COUNT(*) as c FROM symptom_checks GROUP BY risk_level
    `).all() as any[];
    const riskDistribution = { low: 0, medium: 0, high: 0, critical: 0 };
    distRows.forEach((r) => {
      const level = (r.risk_level || '').toLowerCase();
      if (level === 'low') riskDistribution.low = r.c;
      else if (level === 'medium') riskDistribution.medium = r.c;
      else if (level === 'high') riskDistribution.high = r.c;
      else if (level === 'critical') riskDistribution.critical = r.c;
    });

    // Top conditions
    const allChecks = sqliteDb.prepare("SELECT possible_conditions FROM symptom_checks").all() as any[];
    const condFreq: Record<string, number> = {};
    allChecks.forEach((row) => {
      try {
        const conditions = JSON.parse(row.possible_conditions);
        conditions.forEach((c: string) => {
          const key = c.trim();
          if (key) condFreq[key] = (condFreq[key] || 0) + 1;
        });
      } catch {}
    });
    const topConditions = Object.entries(condFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    // Recent 7-day trend
    const trendRows = sqliteDb.prepare(`
      SELECT DATE(created_at) as day, AVG(risk_score) as avg_score, COUNT(*) as cases
      FROM symptom_checks
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `).all() as any[];
    const recentTrend = trendRows.map((r) => ({
      day: r.day,
      score: Math.round(r.avg_score || 0),
      cases: r.cases,
    }));

    return {
      totalUsers,
      totalChecks,
      checksToday,
      avgRiskScore,
      highRiskCases,
      criticalCases,
      riskDistribution,
      topConditions,
      recentTrend,
    };
  }

  getCriticalChecks(limit = 20): (SymptomCheck & { userId: number; userName: string })[] {
    const rows = sqliteDb.prepare(`
      SELECT sc.*, u.name as user_name
      FROM symptom_checks sc
      JOIN users u ON u.id = sc.user_id
      WHERE sc.risk_level IN ('High', 'Critical')
      ORDER BY sc.risk_score DESC, sc.created_at DESC
      LIMIT ?
    `).all(limit) as any[];
    return rows.map((row) => ({
      ...mapRowToCheck(row),
      userId: row.user_id,
      userName: row.user_name,
    }));
  }
}

export const storage = new SQLiteStorage();
