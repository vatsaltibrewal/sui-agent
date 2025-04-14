import { Telegraf } from 'telegraf';
import { getWalletBalance } from './sui.js';
import { classifyIntent, generateAIResponse, getInvestmentStrategyWithAgent } from './ai.js';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is required');
}

// Create bot with all logic configured
export function createBot() {
  const bot = new Telegraf(TELEGRAM_TOKEN);

  // Handle text messages
  bot.on('text', async (ctx) => {
    try {
      const userMessage = ctx.message.text;
      
      // First, classify the intent of the message
      const intent = await classifyIntent(userMessage);
      console.log(`User message: ${userMessage}, Detected intent: ${intent}`);

      // Handle specialized intents
      if (intent === "BALANCE") {
        await handleBalanceRequest(ctx);
      } else if (intent === "STRATEGY") {
        await handleStrategyRequest(ctx);
      } else if (intent === "IMPLEMENT") {
        await handleImplementRequest(ctx);
      } else {
        // For general queries, use AI to generate a response
        await handleGeneralQuery(ctx, userMessage);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      ctx.reply("An error occurred. Please try again.");
    }
  });

  // Command handlers
  bot.command('start', (ctx) => {
    ctx.reply(
      "Hello! I'm your SUI blockchain assistant. I can help you check your wallet balance, " +
      "suggest investment strategies, implement them, or answer any blockchain-related questions. " +
      "How can I assist you today?"
    );
  });

  bot.command('help', (ctx) => {
    ctx.reply(
      "I can help with:\n\n" +
      "- Checking your wallet balance\n" +
      "- Creating investment strategies\n" +
      "- Implementing strategies\n" +
      "- Answering questions about SUI and blockchain\n\n" +
      "Just ask me in natural language!"
    );
  });

  return bot;
}

// Handler functions for specific intents
async function handleBalanceRequest(ctx) {
  ctx.reply("Fetching your wallet balance...");
  try {
    const walletBalance = await getWalletBalance();
    let balanceMessage = `*Wallet Address:*\n${walletBalance.address}\n\n*Balances:*\n`;
    
    if (walletBalance.balances && walletBalance.balances.length > 0) {
      walletBalance.balances.forEach((coin) => {
        balanceMessage += `${coin.balance / 1e9} SUI\n`;
      });
    } else {
      balanceMessage += `No coins found.`;
    }
    
    ctx.replyWithMarkdown(balanceMessage);
  } catch (error) {
    console.error("Error fetching balance:", error);
    ctx.reply("Sorry, I couldn't retrieve your wallet balance. Please try again later.");
  }
}

async function handleStrategyRequest(ctx) {
  ctx.reply("Computing your personalized investment strategy...");
  try {
    const walletBalance = await getWalletBalance();
    const strategy = await getInvestmentStrategyWithAgent(walletBalance);
    
    let message = `*Investment Strategy Recommendation:*\n\n` +
                  `*Wallet:* ${walletBalance.address}\n` +
                  `*SUI Balance:* ${((walletBalance.balances.find(coin => coin.coinType === '0x2::sui::SUI')?.balance) || 0) / 1e9} SUI\n\n` +
                  `*Recommendation:*\n${strategy.recommendation}`;
    
    ctx.replyWithMarkdown(message);
  } catch (error) {
    console.error("Error generating strategy:", error);
    ctx.reply("Sorry, I couldn't create an investment strategy right now. Please try again later.");
  }
}

async function handleImplementRequest(ctx) {
  ctx.reply("IMPLEMENTING YOUR STRATEGY...");
  // Simulate implementation process
  setTimeout(() => {
    ctx.reply('Personalized investment strategy implemented successfully!');
  }, 3000);
}

async function handleGeneralQuery(ctx, query) {
  try {
    ctx.reply("Thinking about your question...");
    const response = await generateAIResponse(query);
    ctx.replyWithMarkdown(response);
  } catch (error) {
    console.error("Error generating AI response:", error);
    ctx.reply("Sorry, I couldn't process your question right now. Please try again later.");
  }
}