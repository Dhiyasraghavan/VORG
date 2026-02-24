
import { GoogleGenerativeAI } from "@google/generative-ai";
import { EventDetails, VolunteerDepartment } from "../types";

export const getVolunteerSuggestions = async (event: EventDetails): Promise<VolunteerDepartment[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ API Key is missing. Using fallback logic.");
    return getFallbackSuggestions(event);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `As an expert volunteer coordinator, suggest the number of volunteers needed for each department for the following event:
  Event Name: ${event.eventName}
  Theme: ${event.theme}
  Place: ${event.eventPlace}
  Estimated Attendees: ${event.attendeesCount}
  Event Area: ${event.area}
  Requested Skill Departments: ${event.requiredSkills.join(", ")}
  
  Return a JSON array of objects with keys: "name", "suggestedCount", and "description".`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const results = JSON.parse(jsonText);
    return results.map((r: any) => ({
      name: r.name || "Unnamed Dept",
      suggestedCount: parseInt(r.suggestedCount) || 0,
      finalCount: parseInt(r.suggestedCount) || 0,
      description: r.description || "No description provided."
    }));
  } catch (error) {
    console.error("Gemini suggestion error:", error);
    return getFallbackSuggestions(event);
  }
};

const getFallbackSuggestions = (event: EventDetails): VolunteerDepartment[] => {
  return event.requiredSkills.map(skill => ({
    name: skill,
    suggestedCount: Math.ceil(event.attendeesCount / 50),
    finalCount: Math.ceil(event.attendeesCount / 50),
    description: "Default fallback calculation (1 volunteer per 50 attendees)."
  }));
};

export const analyzeVolunteerExperience = async (essay: string): Promise<number> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return Math.min(essay.length / 5, 100);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this volunteer experience essay and provide a score from 0-100 based on the depth of commitment, impact described, and skills demonstrated. 
  Experience Essay: "${essay}"
  Return ONLY the number.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const scoreText = response.text().trim();
    const score = parseInt(scoreText.replace(/[^0-9]/g, ''));
    return isNaN(score) ? 50 : Math.min(score, 100);
  } catch (error) {
    console.error("Experience analysis error:", error);
    return 50;
  }
};

export const calculateSuitability = (event: any, userScore: number): number => {
  // Logic to calculate how suitable a volunteer is for an event
  // We use the user's base audit score (0-100) and mix it with a random skill-match factor for variety
  const baseSuitability = Math.floor(Math.random() * 30) + 30; // 30-60 base
  const finalSuitability = Math.min(baseSuitability + (userScore / 3), 100);
  return Math.round(finalSuitability);
};
