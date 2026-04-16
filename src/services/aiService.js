import { GoogleGenerativeAI } from "@google/generative-ai";
import { OPERATIONAL_LOGS } from "./operationalService";
import { GLOBAL_KNOWLEDGE } from "./knowledgeService";
// Dynamic context will be passed from the UI components

// Jitro Engine Configuration
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const modelOptions = { apiVersion: "v1" };

/**
 * Jitro AI Simulation Engine: Curated fallback knowledge
 */
const JITRO_SIMS = {
  getAdminInsights: [
    "Worker retention is up 12% following the recent wage adjustment in Logistics.",
    "Madipakkam hub shows a 94% fulfillment rate today."
  ],
  chatFeedback: "I'm currently optimizing my strategic models. How else can I assist with operations?",
  magicCreateJob: {
    title: "Express Warehouse Packer",
    description: "Handle high-priority logistics packing in Madipakkam hub.",
    wage: "750",
    workerCount: "8",
    type: "day",
    startTime: "09:00",
    endTime: "18:00",
    category: "Logistics",
    pricingModel: "daily",
    pincode: "600091",
    locationName: "Madipakkam",
    requirementsTags: ["Aadhaar Card", "Safety Shoes"],
    gender: "Any",
    incentives: "Bonus for 100% attendance"
  }
};

const getSim = (key) => {
  const sim = JITRO_SIMS[key];
  if (Array.isArray(sim)) return sim[Math.floor(Math.random() * sim.length)];
  return sim;
};

/**
 * Helper to extract and sanitize JSON from model responses
 */
const extractJSON = (text) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return null;
  } catch (e) {
    return null;
  }
};

export const aiService = {
  /**
   * Internal helper for robust model initialization and execution.
   */
  async runSafeQuery(message, systemInstruction, history = []) {
    if (!genAI) throw new Error("AI Engine Offline");

    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName }, modelOptions);
        const fullPrompt = systemInstruction ? `${systemInstruction}\n\nUSER MESSAGE: ${message}` : message;

        const chatSession = model.startChat({
          history: history,
          generationConfig: { maxOutputTokens: 2000, temperature: 0.7 }
        });

        const result = await chatSession.sendMessage(fullPrompt);
        return result.response.text();
      } catch (err) {
        console.warn(`Jitro Fallback: ${modelName} failed.`, err);
        lastError = err;
      }
    }
    throw lastError || new Error("All models failed");
  },

  /**
   * Universal Chat function with Hybrid AI
   */
  async chat(message, history = [], isAdmin = false, userContext = null) {
    if (!genAI) return { type: 'text', content: "The Jitro AI Engine is offline." };

    let systemInstruction = "";
    if (isAdmin) {
      systemInstruction = `You are "Genie Ops" Assistant. Return JSON output only. Context: ${JSON.stringify(GLOBAL_KNOWLEDGE)}`;
    } else {
      systemInstruction = `You are "Job Genie" Assistant. Return JSON output only. User Context: ${JSON.stringify(userContext)}. Current Market Data: ${JSON.stringify(userContext?.availableJobs || [])}`;
    }

    try {
      const formattedHistory = [];
      const realMessages = history.filter(h => h.rawText || h.text);
      const startIdx = realMessages.length > 0 && realMessages[0].isBot ? 1 : 0;
      for (let i = startIdx; i < realMessages.length; i++) {
        const h = realMessages[i];
        formattedHistory.push({
          role: h.isBot ? 'model' : 'user',
          parts: [{ text: h.rawText || h.text }],
        });
      }

      const textResponse = await this.runSafeQuery(message, systemInstruction, formattedHistory);
      const jsonResponse = extractJSON(textResponse);
      if (jsonResponse) return jsonResponse;
      return { type: 'text', content: textResponse };

    } catch (error) {
      console.warn("Jitro Hybrid-Local Mode engaged:", error);
      const msg = message.toLowerCase();
      
      if (msg.includes("job") || msg.includes("find") || msg.includes("search")) {
        return {
          type: "navigation",
          screen: "Find Job",
          params: { search: msg.includes("madipakkam") ? "Madipakkam" : "" },
          message: "Opening the Job Portal for you... 🧞✨"
        };
      }
      
      if (msg.includes("earn") || msg.includes("salary") || msg.includes("pay") || msg.includes("earnings")) {
        return { type: "navigation", screen: "Earnings", message: "Opening your earnings dashboard locally. 💰" };
      }

      if (msg.includes("xp") || msg.includes("level") || msg.includes("role")) {
        if (userContext) {
          return { type: "text", content: `You are a ${userContext.role} with ${userContext.xp || 0} XP.` };
        }
      }

      return { type: 'text', content: "Local Mode active. Try 'Find a job' or 'Check XP'." };
    }
  },

  async getJobMatches(profile, availableJobs) {
    try {
      const prompt = `Match profile to jobs. Return JSON. Profile: ${JSON.stringify(profile)}`;
      const text = await this.runSafeQuery(prompt, "You are a Job Match Engine.");
      return extractJSON(text) || availableJobs.slice(0, 2);
    } catch (e) {
      return availableJobs.slice(0, 2);
    }
  },

  async getAdminInsights(statsData) {
    try {
      return await this.runSafeQuery(`Stats: ${JSON.stringify(statsData)}`, "Provide 1 admin insight.");
    } catch (e) {
      return getSim('getAdminInsights');
    }
  },

  async processVoiceCommand(transcript) {
    try {
      const text = await this.runSafeQuery(`Transcript: ${transcript}`, "Extract intent: [FIND_JOBS, VIEW_EARNINGS]. Result JSON.");
      return extractJSON(text) || { intent: 'UNKNOWN', feedback: "Didn't catch that." };
    } catch (e) {
      return { intent: 'UNKNOWN', feedback: "Didn't catch that." };
    }
  },

  async getEarningsForecast(goal, currentXP) {
    return { advice: "Keep working consistently!" };
  },

  async getHeatmapData() {
    return [
      { id: 'sz1', lat: 35, long: 25, intensity: 0.8, label: 'Chennai South' },
      { id: 'sz2', lat: 65, long: 75, intensity: 0.6, label: 'Ambattur Hub' }
    ];
  },

  async magicCreateJob(userPrompt) {
    try {
      const text = await this.runSafeQuery(`Create job for: ${userPrompt}`, "Return JSON structure.");
      return extractJSON(text) || getSim('magicCreateJob');
    } catch (e) {
      return getSim('magicCreateJob');
    }
  }
};
