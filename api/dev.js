import 'dotenv/config';
import { createBot } from '../lib/bot.js';

const bot = createBot();

// Start the bot in polling mode
console.log('Starting bot in polling mode...');
bot.launch()
  .then(() => console.log('Bot is running!'))
  .catch(err => console.error('Failed to start bot:', err));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));