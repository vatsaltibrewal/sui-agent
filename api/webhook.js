import 'dotenv/config';
import { createBot } from '../lib/bot.js';

// Vercel serverless function to handle webhook requests
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const bot = createBot();
  
  try {
    // Process the update from Telegram
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
}