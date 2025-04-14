import { GoogleGenAI } from '@google/genai';

const GOOGLE_GENAI_API_KEY = process.env.GOOGLE_GENAI_API_KEY;

if (!GOOGLE_GENAI_API_KEY) {
  throw new Error('GOOGLE_GENAI_API_KEY is required');
}

// Initialize the AI agent
const ai = new GoogleGenAI({ apiKey: GOOGLE_GENAI_API_KEY });

/**
 * Classify the intent of the user message
 */
export async function classifyIntent(message) {
  try {
    const intentPrompt = `Determine the intent of the following user request. 
    If the request asks for wallet balance information, respond with "BALANCE". 
    If it asks for an investment strategy, respond with "STRATEGY". 
    If it asks to implement a strategy, respond with "IMPLEMENT". 
    For any other queries, respond with "GENERAL".
    Request: "${message}"`;
    
    const intentResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: intentPrompt,
    });
    
    return intentResponse.text.trim().toUpperCase();
  } catch (error) {
    console.error('Error classifying intent:', error);
    return "GENERAL"; // Default to general query on error
  }
}

/**
 * Generate a response to a general query
 */
export async function generateAIResponse(query) {
  try {
    const prompt = `As a helpful SUI blockchain assistant, please respond to the following query from a user. 
    Provide accurate, helpful information. If the query is about blockchain or cryptocurrency concepts, 
    explain them clearly. If you don't know something specific, say so rather than making up information.
    Remember to keep the response concise as per telegram message text limit and relevant to the user's needs.
    
    Query: ${query}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

/**
 * Generate investment strategy with AI
 */
export async function getInvestmentStrategyWithAgent(walletBalance) {
  try {
    // Find native SUI coin balance
    const nativeCoin = walletBalance.balances.find(coin => coin.coinType === '0x2::sui::SUI')?.balance || 0;
    const suiBalanceDisplay = nativeCoin / 1e9;
    
    const prompt = `Based on my SUI wallet with address ${walletBalance.address} and a native SUI coin balance of ${suiBalanceDisplay} SUI, 
    generate a personalized investment strategy. The strategy should include proposals for investing in protocols such as Cetus, 
    with allocations for liquidity pools, staking, and risk management. Provide clear recommendations and details. 
    Also keep the message concise within the telegram message limit and easy to understand as you are acting as a Telegram Bot for strategies.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    
    return { recommendation: response.text };
  } catch (error) {
    console.error('Error fetching investment strategy via agent:', error);
    return {
      recommendation: "Failed to generate investment strategy. Please try again later."
    };
  }
}