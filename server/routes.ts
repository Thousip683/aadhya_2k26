import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAL0IFPGfcNMMLP--zZvuUTvrkJa-G7Nx0";

async function analyzeSymptoms(symptoms: string[], description?: string) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

const prompt = `
You are an AI triage assistant designed for early health risk screening, not for diagnosing diseases.

Your job is to estimate the urgency of the situation based on symptoms. 
Most everyday illnesses should be categorized as LOW or MEDIUM risk unless symptoms indicate serious danger.

Patient Information:
Symptoms: ${symptoms.join(", ")}
Description: ${description || "None provided"}

Use the following guidelines when assigning risk:

Risk Score Guide:
0–20 → Minor or common symptoms (cold, mild headache, mild fatigue)
21–40 → Moderate but common illness (flu-like symptoms, fever without complications)
41–60 → Concerning symptoms needing medical consultation
61–80 → High risk symptoms needing prompt medical attention
81–100 → Emergency symptoms (possible heart attack, stroke, severe breathing difficulty)

Important Rules:
- Do NOT exaggerate risk.
- Common illnesses like cold, mild fever, or headache should usually stay under 30 risk score.
- Only assign scores above 70 if symptoms strongly indicate a serious or life-threatening condition.
- If symptoms are vague or mild, keep the risk conservative.

Respond with a JSON object containing:

- riskScore: integer from 0 to 100
- riskLevel: "Low", "Medium", "High", or "Critical"
- possibleConditions: array of up to 3 possible conditions
- recommendedAction: clear advice for the patient
- explanation: a string of short bullet points separated by newlines, each starting with "•". Example: "• Point one\n• Point two\n• Point three". Each point should be one concise sentence covering a key reasoning factor (duration, severity, related risks, what to watch for, etc.)

Risk Level Mapping:
Low → 0–25
Medium → 26–50
High → 51–75
Critical → 76–100

Return ONLY valid JSON.
No markdown.
No code blocks.
Only the JSON object.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini API error:", err);
    // Fallback mock
    return {
      riskScore: 42,
      riskLevel: "Medium",
      possibleConditions: ["Condition based on " + symptoms[0], "General Illness"],
      recommendedAction: "Consult a healthcare professional as soon as possible.",
      explanation: `• Based on reported symptoms: ${symptoms.join(", ")}\n• AI analysis encountered an error.`,
    };
  }
}

async function generateFollowUpQuestions(symptoms: string[], description?: string): Promise<{ question: string; options: string[] }[]> {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are a medical triage AI assistant. A patient has reported the following:
    Symptoms: ${symptoms.join(", ")}
    Description: ${description || "None provided"}

    Generate 3-4 important follow-up questions that a doctor would ask to narrow down the diagnosis.
    Each question should have 2-4 answer options (short, clear choices).

    Return ONLY a valid JSON array with this structure:
    [
      {
        "question": "Is the pain spreading to your arm or jaw?",
        "options": ["Yes, to my left arm", "Yes, to my jaw", "No, localized only"]
      }
    ]

    Guidelines:
    - Questions should be medically relevant to the reported symptoms
    - Options should be mutually exclusive and cover common scenarios
    - Keep questions simple and patient-friendly
    - Focus on severity, duration, location, and associated symptoms

    IMPORTANT: Return ONLY the JSON array, no markdown, no code fences.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    throw new Error("Invalid response structure");
  } catch (err) {
    console.error("Gemini follow-up questions error:", err);
    // Fallback: generate contextual mock questions based on symptoms
    return getDefaultFollowUps(symptoms);
  }
}

function getDefaultFollowUps(symptoms: string[]): { question: string; options: string[] }[] {
  const symptomsLower = symptoms.map(s => s.toLowerCase());
  const questions: { question: string; options: string[] }[] = [];

  if (symptomsLower.some(s => s.includes("chest") || s.includes("heart"))) {
    questions.push(
      { question: "Is the pain spreading to your arm, jaw, or back?", options: ["Yes, to my left arm", "Yes, to my jaw/back", "No, localized to chest only"] },
      { question: "How long have you had this chest pain?", options: ["Less than 30 minutes", "30 minutes to 2 hours", "More than 2 hours", "Comes and goes"] },
      { question: "Are you experiencing sweating or nausea along with it?", options: ["Yes, both", "Only sweating", "Only nausea", "Neither"] }
    );
  } else if (symptomsLower.some(s => s.includes("fever") || s.includes("headache"))) {
    questions.push(
      { question: "How high is your temperature?", options: ["99-100°F (mild)", "100-102°F (moderate)", "Above 102°F (high)", "Not measured"] },
      { question: "How long have you had these symptoms?", options: ["Less than 24 hours", "1-3 days", "More than 3 days", "More than a week"] },
      { question: "Do you have any body aches or chills?", options: ["Yes, body aches", "Yes, chills", "Both aches and chills", "Neither"] }
    );
  } else if (symptomsLower.some(s => s.includes("breath") || s.includes("cough"))) {
    questions.push(
      { question: "Is your cough dry or producing mucus?", options: ["Dry cough", "Producing clear mucus", "Producing colored mucus", "Producing blood"] },
      { question: "Does the breathing difficulty worsen with activity?", options: ["Yes, significantly", "Slightly worse", "No, constant", "Only when lying down"] },
      { question: "Do you have any wheezing or chest tightness?", options: ["Yes, wheezing", "Yes, chest tightness", "Both", "Neither"] }
    );
  } else if (symptomsLower.some(s => s.includes("dizz") || s.includes("nausea") || s.includes("vomit"))) {
    questions.push(
      { question: "Does the dizziness happen when you stand up?", options: ["Yes, when standing", "Yes, when moving head", "Constant", "Random episodes"] },
      { question: "Have you been able to keep food and water down?", options: ["Yes, eating normally", "Liquids only", "Can't keep anything down", "Haven't tried eating"] },
      { question: "Have you experienced any recent head injury?", options: ["Yes, recently", "Yes, in the past week", "No"] }
    );
  } else {
    questions.push(
      { question: "When did the symptoms first start?", options: ["Today", "1-3 days ago", "About a week ago", "More than a week ago"] },
      { question: "How severe are your symptoms on a scale?", options: ["Mild - manageable", "Moderate - uncomfortable", "Severe - hard to function", "Very severe - need immediate help"] },
      { question: "Have you taken any medication for these symptoms?", options: ["Yes, over-the-counter", "Yes, prescription", "No medication taken"] }
    );
  }

  return questions;
}

// Auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ── Auth Routes ─────────────────────────────────────────
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, username, password } = req.body;
      if (!name || !username || !password) {
        return res.status(400).json({ message: "Name, username, and password are required" });
      }
      if (username.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      const user = storage.createUser(name, username, password);
      if (!user) {
        return res.status(409).json({ message: "Username already taken" });
      }
      req.session.userId = user.id;
      res.status(201).json({ user });
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const user = storage.verifyLogin(username, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.session.userId = user.id;
      res.json({ user });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = storage.getUserById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(user);
  });

  app.patch("/api/auth/update-profile", requireAuth, (req, res) => {
    try {
      const { name } = req.body;
      if (!name || typeof name !== "string" || name.trim().length < 1) {
        return res.status(400).json({ message: "Name is required" });
      }
      const updated = storage.updateUserName(req.session.userId!, name.trim());
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updated);
    } catch (err) {
      console.error("Update profile error:", err);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // ── Data Routes (require auth) ──────────────────────────
  app.get(api.stats.get.path, requireAuth, async (req, res) => {
    try {
      const stats = await storage.getStats(req.session.userId!);
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get(api.symptomChecks.list.path, requireAuth, async (req, res) => {
    try {
      const checks = await storage.getSymptomChecks(req.session.userId!);
      res.json(checks);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch symptom checks" });
    }
  });

  app.get(api.symptomChecks.get.path, requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) {
        return res.status(404).json({ message: "Invalid ID" });
      }
      const check = await storage.getSymptomCheck(id);
      if (!check) {
        return res.status(404).json({ message: "Symptom check not found" });
      }
      res.json(check);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch symptom check" });
    }
  });

  app.post(api.symptomChecks.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.symptomChecks.create.input.parse(req.body);
      
      const analysis = await analyzeSymptoms(input.symptoms, input.description);
      
      const newCheck = await storage.createSymptomCheck(req.session.userId!, {
        symptoms: input.symptoms,
        description: input.description || null,
        riskScore: analysis.riskScore || Math.floor(Math.random() * 100),
        riskLevel: analysis.riskLevel || "Medium",
        possibleConditions: analysis.possibleConditions || ["Unknown Condition"],
        recommendedAction: analysis.recommendedAction || "Please consult a healthcare professional.",
        explanation: analysis.explanation || "Based on the provided symptoms."
      });
      
      res.status(201).json(newCheck);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Error creating symptom check:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/symptom-checks/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const deleted = await storage.deleteSymptomCheck(id, req.session.userId!);
      if (!deleted) {
        return res.status(404).json({ message: "Symptom check not found" });
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting symptom check:", err);
      res.status(500).json({ message: "Failed to delete symptom check" });
    }
  });

  app.post("/api/follow-up-questions", requireAuth, async (req, res) => {
    try {
      const { symptoms, description } = req.body;
      if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
        return res.status(400).json({ message: "At least one symptom is required" });
      }
      const questions = await generateFollowUpQuestions(symptoms, description);
      res.json({ questions });
    } catch (err) {
      console.error("Error generating follow-up questions:", err);
      res.status(500).json({ message: "Failed to generate follow-up questions" });
    }
  });

  return httpServer;
}
