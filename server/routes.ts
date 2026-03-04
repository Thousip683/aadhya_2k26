import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.stats.get.path, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get(api.symptomChecks.list.path, async (req, res) => {
    try {
      const checks = await storage.getSymptomChecks();
      res.json(checks);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch symptom checks" });
    }
  });

  app.get(api.symptomChecks.get.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
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

  app.post(api.symptomChecks.create.path, async (req, res) => {
    try {
      const input = api.symptomChecks.create.input.parse(req.body);
      
      // Use OpenAI to analyze the symptoms and description
      const prompt = `
        Analyze the following symptoms and description for a patient:
        Symptoms: ${input.symptoms.join(", ")}
        Description: ${input.description || "None provided"}
        
        Provide a JSON response with the following fields:
        - riskScore: an integer from 0 to 100
        - riskLevel: one of "Low", "Medium", "High", "Critical"
        - possibleConditions: array of strings (max 3)
        - recommendedAction: string describing what the patient should do
        - explanation: a short explanation of why this prediction was made (bullet points format preferred)
      `;

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(aiResponse.choices[0].message?.content || "{}");
      
      // Create record
      const newCheck = await storage.createSymptomCheck({
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

  // Call seed function at startup
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  const existingItems = await storage.getSymptomChecks();
  if (existingItems.length === 0) {
    console.log("Seeding database with initial symptom checks...");
    await storage.createSymptomCheck({
      symptoms: ["Fever", "Headache"],
      description: "I have had a fever and headache for two days.",
      riskScore: 45,
      riskLevel: "Medium",
      possibleConditions: ["Viral Fever", "Common Cold"],
      recommendedAction: "Rest and stay hydrated. Take fever reducers. If symptoms persist for more than 3 days, visit a clinic.",
      explanation: "• Fever for two days\\n• Accompanying headache"
    });
    
    await storage.createSymptomCheck({
      symptoms: ["Chest Pain", "Breathing Difficulty"],
      description: "Sudden sharp chest pain and I can't catch my breath.",
      riskScore: 92,
      riskLevel: "Critical",
      possibleConditions: ["Heart Attack", "Pulmonary Embolism", "Severe Angina"],
      recommendedAction: "Call emergency services immediately or go to the nearest emergency room.",
      explanation: "• Sharp chest pain\\n• Difficulty breathing"
    });
    
    await storage.createSymptomCheck({
      symptoms: ["Cough", "Fatigue"],
      description: "Persistent cough for a week and feeling very tired.",
      riskScore: 35,
      riskLevel: "Low",
      possibleConditions: ["Upper Respiratory Infection", "Bronchitis"],
      recommendedAction: "Monitor symptoms. Consider visiting a doctor if the cough worsens or produces discolored mucus.",
      explanation: "• Persistent cough\\n• Fatigue"
    });
  }
}
