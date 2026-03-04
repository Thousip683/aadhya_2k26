import session from "express-session";
import { sqliteDb } from "./sqlite";

/**
 * A SQLite-backed session store for express-session.
 * Sessions persist across server restarts.
 */
export class SQLiteSessionStore extends session.Store {
  private getStmt = sqliteDb.prepare("SELECT sess FROM sessions WHERE sid = ? AND expired > ?");
  private setStmt = sqliteDb.prepare(
    "INSERT OR REPLACE INTO sessions (sid, sess, expired) VALUES (?, ?, ?)"
  );
  private destroyStmt = sqliteDb.prepare("DELETE FROM sessions WHERE sid = ?");
  private cleanupStmt = sqliteDb.prepare("DELETE FROM sessions WHERE expired <= ?");

  constructor() {
    super();
    // Clean up expired sessions every 15 minutes
    this.cleanup();
    setInterval(() => this.cleanup(), 15 * 60 * 1000);
  }

  private cleanup() {
    this.cleanupStmt.run(Date.now());
  }

  get(sid: string, callback: (err?: any, session?: session.SessionData | null) => void) {
    try {
      const row = this.getStmt.get(sid, Date.now()) as { sess: string } | undefined;
      if (!row) return callback(null, null);
      const sess = JSON.parse(row.sess);
      callback(null, sess);
    } catch (err) {
      callback(err);
    }
  }

  set(sid: string, sessionData: session.SessionData, callback?: (err?: any) => void) {
    try {
      const maxAge = sessionData.cookie?.maxAge ?? 7 * 24 * 60 * 60 * 1000;
      const expired = Date.now() + maxAge;
      this.setStmt.run(sid, JSON.stringify(sessionData), expired);
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }

  destroy(sid: string, callback?: (err?: any) => void) {
    try {
      this.destroyStmt.run(sid);
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }
}
