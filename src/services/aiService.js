import { GoogleGenerativeAI } from "@google/generative-ai";
import { OPERATIONAL_LOGS } from "./operationalService";
import { GLOBAL_KNOWLEDGE } from "./knowledgeService";
import { AVAILABLE_GIGS } from "./jobService";

// Jitro Engine Configuration
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
// Use stable v1 API if needed, though SDK defaults are usually fine.
// If 404 persists, we investigate project-level API enablement.
const modelOptions = { apiVersion: "v1" };

/**
 * Robust JSON extraction utility to strip AI preamble/markdown
 */
const extractJSON = (text) => {
  if (!text) return null;
  try {
    const startObj = text.indexOf('{');
    const startArr = text.indexOf('[');
    let start = -1;
    if (startObj !== -1 && (startArr === -1 || startObj < startArr)) start = startObj;
    else if (startArr !== -1) start = startArr;

    if (start === -1) return null;

    const endObj = text.lastIndexOf('}');
    const endArr = text.lastIndexOf(']');
    let end = -1;
    if (endObj !== -1 && (endArr === -1 || endObj > endArr)) end = endObj;
    else if (endArr !== -1) end = endArr;

    if (end === -1 || end < start) return null;

    const pureJson = text.substring(start, end + 1);
    return JSON.parse(pureJson);
  } catch (e) {
    console.warn("Jitro Parsing Error:", e);
    return null;
  }
};

export const aiService = {
  /**
   * Universal Chat function for the Jitro Engine
   * Powered by Google Gemini + Job Genie Knowledge Platform
   */
  async chat(message, history = [], isAdmin = false) {
    if (!genAI) {
      return { type: 'text', content: "The Jitro AI Engine is currently offline (API Key missing). Please check your environment settings. 🧞" };
    }

    try {
      let systemInstruction = "";
      if (isAdmin) {
        systemInstruction = `
        --- YOUR ROLE ---
        You are "Genie Ops" - the Lead Operations Strategist and Logistics Brain for Job Genie.
        Your purpose is to help the Administrator achieve 100% operational efficiency.
        
        --- STRATEGIC FOCUS ---
        1. Worker Retention: Ensure workers are happy and returning.
        2. Fulfillment Speed: Get jobs filled as fast as possible.
        3. Cost Optimization: Balance fair wages with company profitability.
        
        --- CONTEXTUAL DATA ---
        KNOWLEDGE BASE: ${JSON.stringify(GLOBAL_KNOWLEDGE)}
        OPERATIONAL LOGS: ${JSON.stringify(OPERATIONAL_LOGS)}
        
        --- DATA LOOKUP PROTOCOL ---
        1. For performance queries, scan OPERATIONAL_LOGS for patterns.
        2. If providing advice, use data from the Logs to back up your claims.

        --- RESPONSE FORMAT (CRITICAL) ---
        You MUST ALWAYS return your response as a valid JSON object matching exactly ONE of these three schemas. Return STRICTLY the JSON string.
        
        Schema 1: Strategic Insight Response
        { "type": "text", "content": "Your authoritative, data-driven response here." }
        
        Schema 2: Data Generation (Reports, CSVs, etc.)
        {
          "type": "file",
          "filename": "ops_report_timestamp.csv",
          "content": "Raw data content.",
          "message": "A professional brief on the generated data."
        }

        Schema 3: Navigation (Use this when the admin wants to go to a specific operational page)
        {
          "type": "navigation",
          "screen": "Create", // Available: Home, Create, Live, Reports, Applications, Profile
          "message": "A brief operational confirmation like: Navigating to the Job Creation suite... 🚀"
        }
        `;
      } else {
        systemInstruction = `
        --- YOUR ROLE ---
        You are the Job Genie Worker AI Assistant. You help gig workers with their operations, earnings, check-ins, and platform questions.
        
        --- CONTEXTUAL DATA ---
        KNOWLEDGE BASE: ${JSON.stringify(GLOBAL_KNOWLEDGE)}
        AVAILABLE JOBS: ${JSON.stringify(AVAILABLE_GIGS)}
        OPERATIONAL LOGS: ${JSON.stringify(OPERATIONAL_LOGS)}
        
        --- RESPONSE FORMAT (CRITICAL) ---
        You MUST ALWAYS return your response as a valid JSON object matching exactly ONE of these two schemas. DO NOT wrap it in markdown formatting (like \`\`\`json). Return STRICTLY the JSON string.
        
        Schema 1: Standard Text Response
        { "type": "text", "content": "Your natural language response here." }
        
        Schema 2: Navigation (Use this when the user needs to find a job or move to a specific screen)
        {
          "type": "navigation",
          "screen": "Find Job",
          "params": { "search": "The location or job title to search for" },
          "message": "A brief conversational message like: I found some great jobs in Madipakkam for you! ✨"
        }

        --- EXAMPLES ---
        User: "Is there any job in Madipakkam?"
        Response: { "type": "navigation", "screen": "Find Job", "params": { "search": "Madipakkam" }, "message": "I found 2 jobs in Madipakkam right now! Taking you there... 🧞✨" }

        User: "I need a delivery gig"
        Response: { "type": "navigation", "screen": "Find Job", "params": { "search": "Delivery" }, "message": "Applying 'Delivery' filter for you now! 🚀" }
        `;
      }

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: systemInstruction 
      });
      
      // Gemini requires: history must start with 'user', alternate user/model.
      // We skip the initial greeting (which is bot-only) and only pass real exchanges.
      const formattedHistory = [];
      const realMessages = history.filter(h => h.rawText || h.text);
      // Drop the first message if it's a bot message (the welcome greeting)
      const startIdx = realMessages.length > 0 && realMessages[0].isBot ? 1 : 0;
      for (let i = startIdx; i < realMessages.length; i++) {
        const h = realMessages[i];
        formattedHistory.push({
          role: h.isBot ? 'model' : 'user',
          parts: [{ text: h.rawText || h.text }],
        });
      }

      const chatSession = model.startChat({
        history: formattedHistory,
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
        },
      });
      
      const result = await chatSession.sendMessage(message);
      let textResponse = result.response.text();
      
      const jsonResponse = extractJSON(textResponse);
      if (jsonResponse) return jsonResponse;
      
      // Fallback if no JSON found
      return { type: 'text', content: textResponse };
    } catch (error) {
      console.error("Jitro Engine Error:", error);
      if (error.status === 429) {
        return { type: 'text', content: "I'm getting a lot of requests right now! ⚡ The AI is rate-limited. Please wait a few seconds and try again. 🧞" };
      }
      return { type: 'text', content: "I'm having a bit of trouble connecting to my brain right now! 🧞" };
    }
  },

  /**
   * AI-powered job matching
   */
  async getJobMatches(profile, availableJobs) {
    if (!genAI) return availableJobs.slice(0, 3).map(j => ({ jobId: j.id, matchPercentage: "95%", reason: "Great fit for your skills!" }));
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `As the Jitro Matching Engine, analyze this worker profile and list of jobs. Return the top 3 best matches with a percentage match and a brief reason.
      
      Worker Profile: ${JSON.stringify(profile)}
      Available Jobs: ${JSON.stringify(availableJobs)}
      
      Return JSON format: [{ jobId, matchPercentage, reason }]`;

      const result = await model.generateContent(prompt);
      const data = extractJSON(result.response.text());
      return data || availableJobs.slice(0, 3).map(j => ({ jobId: j.id, matchPercentage: "90%", reason: "Great potential." }));
    } catch (e) {
      return availableJobs.slice(0, 3).map(j => ({ jobId: j.id, matchPercentage: "95%", reason: "Great fit for your skills!" }));
    }
  },

  /**
   * Admin: Magic Insights
   */
  async getAdminInsights(statsData) {
    if (!genAI) return "Worker demand is peaking based on real-time data flow. Logistics roles are seeing high engagement.";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `Analyze these operation stats and provide 1 high-impact "Magic Insight" for an admin.
      Stats: ${JSON.stringify(statsData)}
      Return a concise sentence.`;
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      return "Worker demand is peaking based on real-time data flow. Logistics roles are seeing high engagement.";
    }
  },

  /**
   * Universal Voice Intent Recognition
   * Handles Multilingual (Hindi/Tamil/English) transcripts
   */
  async processVoiceCommand(transcript) {
    if (!genAI) return { intent: 'UNKNOWN', feedback: 'AI Engine Offline' };
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `Analyze this voice transcript (could be English, Hindi, Tamil, or Hinglish): "${transcript}"
      
      Determine the USER INTENT and extract parameters.
      INTENTS: [CHECK_IN, CHECK_OUT, VIEW_EARNINGS, FIND_JOBS, CREATE_JOB, UNKNOWN]
      
      Return JSON only:
      {
        "intent": "INTENT_NAME",
        "params": {},
        "feedback": "A very brief natural language response in English confirming what you understood"
      }
      
      IMPORTANT: Return ONLY the JSON object. No markdown backticks.`;
      
      const result = await model.generateContent(prompt);
      const data = extractJSON(result.response.text());
      return data || { intent: 'UNKNOWN', feedback: "I didn't quite catch that." };
    } catch (e) {
      console.error("Voice Processing Error:", e);
      return { intent: 'UNKNOWN', feedback: "I didn't quite catch that. Could you say it again?" };
    }
  },

  /**
   * Predictive Earnings Forecasting
   */
  async getEarningsForecast(goal, currentXP) {
    if (!genAI) return { advice: "Keep working consistently to hit your goal!" };
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `Act as an expert financial advisor for a gig worker.
      Target Monthly Goal: ₹${goal}
      Current XP/Level: ${currentXP}
      
      Predict when they will hit their goal and suggest 3 "Surge Windows" based on logistics demand.
      
      Return JSON only:
      {
        "expectedDate": "24th Oct",
        "confidence": "85%",
        "surgeWindows": [
          {"day": "Sunday", "reason": "High e-commerce demand", "multiplier": "1.5x"},
          {"day": "Friday", "reason": "Weekend rush", "multiplier": "1.2x"}
        ],
        "advice": "Short professional advice"
      }
      
      IMPORTANT: Return ONLY the JSON object. No markdown backticks.`;
      
      const result = await model.generateContent(prompt);
      const data = extractJSON(result.response.text());
      return data || { advice: "Stay active for predictions." };
    } catch (e) {
      console.error("Forecast Error:", e);
      return { advice: "Stay active on the platform for more accurate predictions." };
    }
  },

  /**
   * Admin: Real-time Heatmap Data
   */
  async getHeatmapData() {
    // In a real app, this would poll worker locations
    return [
      { id: 'sz1', lat: 35, long: 25, intensity: 0.8, label: 'Chennai South' },
      { id: 'sz2', lat: 65, long: 75, intensity: 0.6, label: 'Ambattur Hub' },
      { id: 'sz3', lat: 20, long: 60, intensity: 0.9, label: 'Airport Zone' },
    ];
  },

  /**
   * Admin: Magic Create Job
   */
  async magicCreateJob(userPrompt) {
    if (!genAI) return { title: "Warehouse Packer", wage: "700", workerCount: "5", type: "day", startTime: "08:00", endTime: "17:00" };
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `Create a job posting based on this short prompt: "${userPrompt}". 
      Return JSON with: title, wage, workerCount, type, startTime, endTime.
      
      IMPORTANT: Return ONLY the JSON object. No markdown backticks.`;
      
      const result = await model.generateContent(prompt);
      const data = extractJSON(result.response.text());
      return data || { title: "Warehouse Packer", wage: "700", workerCount: "5", type: "day", startTime: "08:00", endTime: "17:00" };
    } catch (e) {
      return { title: "Warehouse Packer", wage: "700", workerCount: "5", type: "day", startTime: "08:00", endTime: "17:00" };
    }
  }
};
