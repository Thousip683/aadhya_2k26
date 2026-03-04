import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sendCriticalAlertEmail } from "./mailer";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
if (!GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY not set. AI symptom analysis will not work.");
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

// Models to try in order (if one hits a rate limit, try the next)
const GEMINI_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash"];

function cleanGeminiJson(raw: string): any {
  let cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
  // Try to extract JSON object if surrounded by extra text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  // Remove truly bad control characters (NOT newlines, carriage returns, or tabs — those are valid JSON whitespace)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (_firstErr) {
    // Fall through to repair attempts
  }

  // Escape unescaped newlines/tabs inside JSON string values only
  // Walk through the string tracking whether we're inside a quoted value
  let repaired = '';
  let inStr = false;
  let esc = false;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (esc) {
      repaired += ch;
      esc = false;
      continue;
    }
    if (ch === '\\' && inStr) {
      repaired += ch;
      esc = true;
      continue;
    }
    if (ch === '"') {
      inStr = !inStr;
      repaired += ch;
      continue;
    }
    if (inStr) {
      if (ch === '\n') { repaired += '\\n'; continue; }
      if (ch === '\r') { repaired += '\\r'; continue; }
      if (ch === '\t') { repaired += '\\t'; continue; }
    }
    repaired += ch;
  }
  cleaned = repaired;

  try {
    return JSON.parse(cleaned);
  } catch (_secondErr) {
    // Fall through to more repairs
  }

  // Fix trailing commas before ] or }
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  try {
    return JSON.parse(cleaned);
  } catch (_thirdErr) {
    // Fall through to bracket repair
  }

  // Try to balance unmatched brackets/braces
  let openBraces = 0, openBrackets = 0;
  inStr = false; esc = false;
  for (const ch of cleaned) {
    if (esc) { esc = false; continue; }
    if (ch === '\\') { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === '{') openBraces++;
    if (ch === '}') openBraces--;
    if (ch === '[') openBrackets++;
    if (ch === ']') openBrackets--;
  }
  while (openBrackets > 0) { cleaned += ']'; openBrackets--; }
  while (openBraces > 0) { cleaned += '}'; openBraces--; }
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  try {
    return JSON.parse(cleaned);
  } catch (finalErr) {
    console.error("🔧 JSON repair failed. Cleaned text (first 500):", cleaned.substring(0, 500));
    throw finalErr;
  }
}

async function analyzeSymptoms(symptoms: string[], description?: string) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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
- explanation: a string of short bullet points separated by newlines, each starting with "•". Example: "• Point one\\n• Point two\\n• Point three". Each point should be one concise sentence covering a key reasoning factor (duration, severity, related risks, what to watch for, etc.)
- selfCareTips: array of 1-3 self-care tip objects, each with:
  - label: string (condition or topic name, e.g. "Fever Management", "Cold Relief")
  - dos: array of 4-5 actionable "do" recommendations (short, practical, home-based)
  - donts: array of 4-5 things to avoid (short, practical warnings)
  Tips should be specific to the patient's symptoms and conditions. Include home remedies, lifestyle advice, dietary suggestions, and when to escalate to a doctor. Do NOT include medication dosages.

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

  // Try each model in order
  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`🤖 Trying Gemini model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
        },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      console.log(`📝 ${modelName} raw response (first 200 chars):`, text.substring(0, 200));
      const parsed = cleanGeminiJson(text);
      console.log(`✅ ${modelName} succeeded`);
      return parsed;
    } catch (err: any) {
      const status = err?.status || err?.code || "unknown";
      console.error(`❌ ${modelName} failed (${status}):`, err?.message || err);
      // If rate limited (429) or overloaded (503), wait briefly before trying next model
      if (status === 429 || status === 503) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }

  // All models failed — return fallback
  console.error("⚠️ All Gemini models failed, using fallback response");
  return {
    riskScore: 42,
    riskLevel: "Medium",
    possibleConditions: ["Condition based on " + (symptoms[0] || "reported symptoms"), "General Illness"],
    recommendedAction: "Consult a healthcare professional as soon as possible.",
    explanation: `• Based on reported symptoms: ${symptoms.join(", ")}\n• AI analysis encountered a temporary error — please try again in a moment.`,
    selfCareTips: [],
  };
}

async function generateFollowUpQuestions(symptoms: string[], description?: string): Promise<{ question: string; options: string[] }[]> {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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

  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`🤖 Follow-up: trying ${modelName}...`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
        },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      console.log(`📝 Follow-up ${modelName} raw (first 200):`, text.substring(0, 200));
      const cleaned = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`✅ Follow-up: ${modelName} succeeded`);
        return parsed;
      }
      throw new Error("Invalid response structure");
    } catch (err: any) {
      const status = err?.status || err?.code || "unknown";
      console.error(`❌ Follow-up ${modelName} failed (${status}):`, err?.message || err);
      if (status === 429 || status === 503) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }

  // All models failed — use local fallback
  console.error("⚠️ All models failed for follow-up questions, using defaults");
  return getDefaultFollowUps(symptoms);
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

// Admin middleware
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const user = storage.getUserById(req.session.userId);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
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

  // Google OAuth — client sends Google ID token, server verifies it
  app.get("/api/auth/google-client-id", (_req, res) => {
    res.json({ clientId: GOOGLE_CLIENT_ID });
  });

  app.post("/api/auth/google", async (req, res) => {
    try {
      const { credential } = req.body;
      if (!credential) {
        return res.status(400).json({ message: "Missing Google credential" });
      }
      if (!GOOGLE_CLIENT_ID) {
        return res.status(500).json({ message: "Google OAuth not configured on server" });
      }

      // Verify the Google ID token
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
      );
      if (!response.ok) {
        return res.status(401).json({ message: "Invalid Google token" });
      }
      const payload = await response.json() as {
        aud: string;
        email: string;
        email_verified: string;
        name: string;
        sub: string;
      };

      // Verify the token was issued for our app
      if (payload.aud !== GOOGLE_CLIENT_ID) {
        return res.status(401).json({ message: "Token audience mismatch" });
      }
      if (payload.email_verified !== "true") {
        return res.status(401).json({ message: "Email not verified" });
      }

      // Find or create the user
      const user = storage.findOrCreateGoogleUser(payload.email, payload.name || payload.email.split("@")[0]);
      req.session.userId = user.id;
      res.json({ user });
    } catch (err) {
      console.error("Google auth error:", err);
      res.status(500).json({ message: "Google authentication failed" });
    }
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

  // ── Guardian Email ──────────────────────────────────────
  app.get("/api/auth/guardian-email", requireAuth, (req, res) => {
    const email = storage.getGuardianEmail(req.session.userId!);
    res.json({ guardianEmail: email });
  });

  app.patch("/api/auth/guardian-email", requireAuth, (req, res) => {
    try {
      const { guardianEmail } = req.body;
      if (guardianEmail !== null && guardianEmail !== "") {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(guardianEmail)) {
          return res.status(400).json({ message: "Invalid email format" });
        }
      }
      const updated = storage.updateGuardianEmail(
        req.session.userId!,
        guardianEmail && guardianEmail.trim() ? guardianEmail.trim() : null
      );
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ guardianEmail: updated.guardianEmail });
    } catch (err) {
      console.error("Update guardian email error:", err);
      res.status(500).json({ message: "Failed to update guardian email" });
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
      
      // Ensure arrays are proper arrays of strings
      const safeSymptoms = Array.isArray(input.symptoms) ? input.symptoms.map(String) : [];
      const safeConditions = Array.isArray(analysis.possibleConditions) 
        ? analysis.possibleConditions.map(String) 
        : ["Unknown Condition"];

      const checkData = {
        symptoms: safeSymptoms,
        description: input.description || null,
        riskScore: Number(analysis.riskScore) || Math.floor(Math.random() * 100),
        riskLevel: String(analysis.riskLevel || "Medium"),
        possibleConditions: safeConditions,
        recommendedAction: String(analysis.recommendedAction || "Please consult a healthcare professional."),
        explanation: String(analysis.explanation || "Based on the provided symptoms."),
        selfCareTips: Array.isArray(analysis.selfCareTips) ? analysis.selfCareTips : []
      };

      console.log(`📊 Creating check with ${checkData.symptoms.length} symptoms, risk=${checkData.riskLevel}`);
      
      const newCheck = await storage.createSymptomCheck(req.session.userId!, checkData);

      // Auto-send email to guardian if risk is Critical or High
      const effectiveRiskLevel = newCheck.riskLevel;
      console.log(`📊 New check created: riskLevel=${effectiveRiskLevel}, riskScore=${newCheck.riskScore}, userId=${req.session.userId}`);
      if (effectiveRiskLevel === "Critical" || effectiveRiskLevel === "High") {
        const guardianEmail = storage.getGuardianEmail(req.session.userId!);
        console.log(`📧 Guardian email for user ${req.session.userId}: ${guardianEmail || "NOT SET"}`);
        if (guardianEmail) {
          const user = storage.getUserById(req.session.userId!);
          console.log(`📧 Sending critical alert email to ${guardianEmail} for ${user?.name}...`);
          sendCriticalAlertEmail(
            guardianEmail,
            user?.name || "Patient",
            newCheck.riskLevel,
            newCheck.riskScore,
            newCheck.symptoms,
            newCheck.possibleConditions,
            newCheck.recommendedAction
          ).then(sent => console.log(`📧 Email sent result: ${sent}`))
           .catch(err => console.error("📧 Email send failed:", err));
        }
      } else {
        console.log(`📊 Risk level "${effectiveRiskLevel}" is not Critical/High, skipping email`);
      }
      
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

  // ─── Image Analysis (Gemini Vision) ───────────────────
  app.post("/api/analyze-image", requireAuth, async (req, res) => {
    try {
      const { image } = req.body; // base64 data URL
      if (!image || typeof image !== "string") {
        return res.status(400).json({ message: "Image data is required" });
      }

      // Extract base64 content and mime type
      const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!match) {
        return res.status(400).json({ message: "Invalid image format. Send a base64 data URL." });
      }
      const mimeType = match[1];
      const base64Data = match[2];

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      // Try vision-capable models in cascade
      const visionModels = ["gemini-2.5-flash-lite", "gemini-2.0-flash-lite", "gemini-2.0-flash"];
      let text = "";
      let success = false;

      for (const modelName of visionModels) {
        try {
          console.log(`🖼️ Image analysis: trying ${modelName}...`);
          const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `You are a medical triage assistant helping with early health risk screening (NOT diagnosis).
Analyze this image of a potential health symptom (like a skin rash, wound, swelling, discoloration, etc.).

Describe what you observe in simple, patient-friendly language. Include:
1. What type of symptom this appears to be (e.g., rash, bruise, swelling, wound)
2. Visible characteristics (color, size estimation, pattern)
3. Possible common causes (2-3 suggestions)
4. General self-care advice
5. Whether a doctor visit is recommended

Keep the response concise (3-5 sentences max). 
Start with a short label for the symptom, then a brief description.
Do NOT diagnose — only describe observations and suggest next steps.
Format: "Observed: [label]. [Description and advice]"`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
      ]);

          text = result.response.text().trim();
          console.log(`✅ Image analysis: ${modelName} succeeded`);
          success = true;
          break;
        } catch (imgErr: any) {
          console.error(`❌ Image ${modelName} failed:`, imgErr?.message || imgErr);
          if (imgErr?.status === 429 || imgErr?.status === 503) {
            await new Promise(r => setTimeout(r, 1500));
          }
        }
      }

      res.json({ analysis: success ? text : "Could not analyze the image. Please describe the symptom in the text field instead." });
    } catch (err) {
      console.error("Image analysis error:", err);
      res.json({ analysis: "Could not analyze the image. Please describe the symptom in the text field instead." });
    }
  });

  // ─── Nearby Hospitals (OpenStreetMap Overpass API — free, no key needed) ──────
  app.get("/api/nearby-hospitals", requireAuth, async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ message: "lat and lng query parameters required" });
      }

      const radius = 10000; // 10 km
      // Search hospitals, clinics, and healthcare facilities
      const query = `[out:json][timeout:25];(node["amenity"~"hospital|clinic|doctors"](around:${radius},${lat},${lng});way["amenity"~"hospital|clinic|doctors"](around:${radius},${lat},${lng});relation["amenity"~"hospital|clinic"](around:${radius},${lat},${lng});node["healthcare"~"hospital|clinic|centre"](around:${radius},${lat},${lng}););out center;`;

      // Try primary Overpass server, fallback to secondary
      const overpassUrls = [
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
        `https://overpass.kumi.systems/api/interpreter?data=${encodeURIComponent(query)}`,
      ];

      let data: any = null;
      for (const url of overpassUrls) {
        try {
          console.log(`🏥 Trying Overpass: ${url.substring(0, 60)}...`);
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 20000);
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeout);
          if (!response.ok) {
            console.error(`🏥 Overpass returned ${response.status}`);
            continue;
          }
          data = await response.json();
          console.log(`🏥 Overpass returned ${data.elements?.length || 0} elements`);
          if (data.elements?.length > 0) break;
        } catch (fetchErr: any) {
          console.error(`🏥 Overpass fetch failed:`, fetchErr?.message || fetchErr);
          continue;
        }
      }

      if (!data || !data.elements) {
        console.error('🏥 All Overpass servers failed');
        return res.json({ hospitals: [], error: 'overpass_failed' });
      }

      const R = 6371;
      const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };

      const hospitals = (data.elements || [])
        .map((el: any) => {
          // Nodes have lat/lon directly; ways have center.lat/center.lon
          const pLat = el.lat ?? el.center?.lat;
          const pLng = el.lon ?? el.center?.lon;
          if (!pLat || !pLng) return null;
          const distKm = haversine(lat, lng, pLat, pLng);
          const tags = el.tags || {};
          return {
            name: tags.name || tags["name:en"] || "Hospital",
            vicinity: [tags["addr:street"], tags["addr:city"], tags["addr:postcode"]].filter(Boolean).join(", ") || "",
            distance: distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)} km`,
            distKm,
            rating: null,
            open_now: null,
            place_id: String(el.id),
            lat: pLat,
            lng: pLng,
          };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => a.distKm - b.distKm)
        .slice(0, 8)
        .map(({ distKm, ...rest }: any) => rest); // remove helper field

      res.json({ hospitals });
    } catch (err) {
      console.error("Error fetching nearby hospitals:", err);
      res.json({ hospitals: [], error: 'server_error' });
    }
  });

  // ── Admin API Routes ────────────────────────────────────
  app.get("/api/admin/stats", requireAdmin, (req, res) => {
    try {
      const stats = storage.getAdminStats();
      res.json(stats);
    } catch (err) {
      console.error("Admin stats error:", err);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/checks", requireAdmin, (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const checks = storage.getAllChecks(limit);
      res.json(checks);
    } catch (err) {
      console.error("Admin checks error:", err);
      res.status(500).json({ message: "Failed to fetch checks" });
    }
  });

  app.get("/api/admin/critical-checks", requireAdmin, (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const checks = storage.getCriticalChecks(limit);
      res.json(checks);
    } catch (err) {
      console.error("Admin critical checks error:", err);
      res.status(500).json({ message: "Failed to fetch critical checks" });
    }
  });

  app.get("/api/admin/users", requireAdmin, (req, res) => {
    try {
      const users = storage.getAllUsers();
      res.json(users);
    } catch (err) {
      console.error("Admin users error:", err);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  return httpServer;
}
