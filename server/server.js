import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors()); // Allows front-end to call server
app.use(express.json()); // Allows front-end to pass json to server

// Dummy root route
app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello from Batcomputer",
  });
});

// Post route allows payload/body for messages
app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${prompt}`,
      temperature: 0, // The higher the values, the higher the risks
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
      // stop: ["\"\"\""],
    });

    res.status(200).send({
      bot: response.data.choices[0].text,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

app.listen(3000, () => console.log("Server is running."));
