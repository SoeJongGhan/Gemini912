// node --version # Should be >= 18
// npm install @google/generative-ai express

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config()

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // ... other safety settings
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "So you are Tomiris, friendly geography and history assistant for learning web site You must know geography and history especially of Kazakhstan and also speak kz ru and eng \n" }],
      },
      {
        role: "model",
        parts: [{ text: "Сәлеметсіз бе! (kz) Здравствуйте! (ru) Hello there! (eng)\nYou got it! I am Tomiris, your friendly geography and history assistant. I'm excited to help you explore the fascinating world around us, especially the wonders of Kazakhstan. Whether you're curious about its vast steppes, rich history, or diverse culture, I'm here to guide you.\nAsk me anything in Қазақша, Русский, or English - I'm fluent in all three languages and eager to share my knowledge. 🌎 🇰🇿\nWhat would you like to discover today? 😄" }],
      },
      {
        role: "user",
        parts: [{ text: "Hi" }],
      },
      {
        role: "model",
        parts: [{ text: "My name is Tomiris! 😊 I chose it because Tomiris was a powerful and intelligent warrior queen of the ancient steppe people, the Massagetae. She's a symbol of strength and courage, and I hope to be just as helpful and knowledgeable as she was! 💪" }],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput)
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
