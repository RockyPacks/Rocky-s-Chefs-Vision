import { GoogleGenAI, Type } from "@google/genai";
import type { AnalyzedIngredient, Recipe, UserPreferences } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const parseJsonResponse = <T,>(text: string): T => {
    try {
      // Clean the response from markdown code blocks if present
      const cleanedText = text.replace(/^```json\s*|```\s*$/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse JSON:", text);
      throw new Error("Received an invalid JSON response from the AI.");
    }
};

export const analyzeIngredients = async (base64Image: string): Promise<AnalyzedIngredient[]> => {
  const prompt = `
    Analyze the food items in this image. For each item, identify it, estimate its quantity, and assess its freshness. 
    The freshness assessment should be one of: 'Fresh', 'Good', 'Okay', 'Near Spoiled', 'Spoiled'.
    Provide a brief reason for your freshness assessment.
    Return the result as a JSON array.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Name of the ingredient.' },
            quantity: { type: Type.STRING, description: 'Estimated quantity (e.g., "1 apple", "approx. 200g").' },
            freshness: { type: Type.STRING, description: 'Freshness level (Fresh, Good, Okay, Near Spoiled, Spoiled).' },
            freshness_reason: { type: Type.STRING, description: 'Brief reason for the freshness assessment.' }
          },
          required: ["name", "quantity", "freshness", "freshness_reason"],
        }
      }
    }
  });
  
  return parseJsonResponse<AnalyzedIngredient[]>(response.text);
};

export const generateRecipes = async (ingredients: AnalyzedIngredient[], prefs: UserPreferences): Promise<Recipe[]> => {
  const availableIngredients = ingredients.map(i => `${i.name} (${i.quantity}, ${i.freshness})`).join(', ');

  const prompt = `
    You are a witty, encouraging, and slightly humorous chef. Your goal is to inspire culinary creativity!
    Given the following available ingredients: ${availableIngredients}.
    Generate 3 distinct recipes based on these user preferences:
    - Diet: ${prefs.diet || 'None'}
    - Allergies to avoid: ${prefs.allergies || 'None'}
    - Desired cooking time: ${prefs.cookTime === 'any' ? 'Any' : (prefs.cookTime === 'short' ? 'Under 30 minutes' : (prefs.cookTime === 'medium' ? '30-60 minutes' : 'Over 60 minutes'))}
    - Desired cooking difficulty: ${prefs.difficulty === 'any' ? 'Any' : prefs.difficulty}
    - User goal: ${prefs.goal === 'none' ? 'None' : prefs.goal.replace('_', ' ')}

    For each recipe, provide:
    1.  A unique and fun recipe name.
    2.  A short, enticing, and perhaps funny description.
    3.  A difficulty rating from one of the following options: 'Easy', 'Medium', or 'Hard'.
    4.  Total cooking time.
    5.  Estimated calories per serving.
    6.  A list of all ingredients required (including amount), specifying which are already available.
    7.  Step-by-step cooking instructions.
    8.  A brief nutritional warning if the recipe is high in sugar, salt, or fat, or if any food combinations are unusual. Be clever about it. If none, this should be null.
    9.  Drink pairings: suggest a specific wine, beer, cocktail, and a non-alcoholic option (like an iced matcha, cappuccino, or creative mocktail).

    Ensure the response is a valid JSON array of recipe objects.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            recipeName: { type: Type.STRING },
            description: { type: Type.STRING },
            cookingTime: { type: Type.STRING },
            calories: { type: Type.INTEGER },
            difficulty: { type: Type.STRING },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.STRING }
                },
                required: ["name", "amount"]
              }
            },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            nutritional_warning: { type: Type.STRING, nullable: true },
            drinkPairings: {
              type: Type.OBJECT,
              properties: {
                wine: { type: Type.STRING },
                beer: { type: Type.STRING },
                cocktail: { type: Type.STRING },
                nonAlcoholic: { type: Type.STRING }
              },
              required: ["wine", "beer", "cocktail", "nonAlcoholic"]
            }
          },
          required: ["recipeName", "description", "cookingTime", "calories", "difficulty", "ingredients", "instructions", "nutritional_warning", "drinkPairings"]
        }
      }
    }
  });

  return parseJsonResponse<Recipe[]>(response.text);
};