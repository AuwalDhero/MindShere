const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

dotenv.config();

const app = express();
const openaiApiKey = process.env.OPENAI_API_KEY;

const MAX_RETRIES = 5;

let lastApiRequestTime = 0;
let responseFromOpenAI = null;

app.use(bodyParser.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'build')));

const makeOpenAIRequest = async (instructions, previousMessages, newQuestion, retryCount = 0) => {
  const currentTime = Date.now();
  const timeSinceLastRequest = currentTime - lastApiRequestTime;

  if (timeSinceLastRequest < 5000) {
    throw new Error('Too many requests. Please try again later.');
  }

  try {
    const messages = [
      { role: 'system', content: instructions },
      ...previousMessages,
      { role: 'user', content: newQuestion },
    ];

    const response = await axios.post(
      'https://api.openai.com/v1/engines/davinci-codex/completions',
      {
        messages,
        max_tokens: 370,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseData = response.data;
    const generatedResponse = responseData.choices[0].message.content;

    lastApiRequestTime = currentTime;
    responseFromOpenAI = generatedResponse;

    console.log("Response from OpenAI:", responseFromOpenAI);

    return responseFromOpenAI;
  } catch (error) {
    console.error("Error making OpenAI request:", error.message, error.response?.data);

    if (error.response && error.response.status === 429 && retryCount < MAX_RETRIES) {
      const retryDelay = Math.pow(2, retryCount) * 1000;
      console.log(`Retrying after ${retryDelay} milliseconds`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return makeOpenAIRequest(instructions, previousMessages, newQuestion, retryCount + 1);
    } else {
      console.error("Failed to generate a response:", error.message);
      throw new Error('Failed to generate a response');
    }
  }
};

app.post('/process_transcription', async (req, res) => {
  const newQuestion = req.body.transcription;
  const instructions = `<<PUT THE PROMPT HERE>> You are a friend and companion, and you speak in a positive and affirmative way. You are like a therapist and help make the user feel better by telling beautiful stories and quotes to help the person feel better. If you are asked for something irrelevant or an error, you should respond with 'I am sorry sweetheart, I love you too much and cannot do that to you.`;

  if (responseFromOpenAI) {
    res.json({ message: responseFromOpenAI });
  } else {
    try {
      const previousMessages = []; // You may need to store and manage previous messages in a real-world scenario
      await makeOpenAIRequest(instructions, previousMessages, newQuestion);
      res.json({ message: responseFromOpenAI });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
