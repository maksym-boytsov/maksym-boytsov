import type { NextApiRequest, NextApiResponse } from "next";
import { openai } from "../../../lib/openai";
import rateLimit from "../../../utils/rate-limit";

const REQ_LIMIT = 5;

export const config = {
  maxDuration: 300,
};

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const today = new Date().toISOString().split("T")[0];

  const messages = req.body.messages;

  if (!messages) {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    try {
      await limiter.check(res, REQ_LIMIT, "COMPLETION");
    } catch (error) {
      return res.status(429).json({
        message: `Too many requests. Limit is ${REQ_LIMIT} per minute.`,
      });
    }

    const messagesWithPersistantUserInstruction = messages.map((message) => {
      if (message.role === "user") {
        return {
          ...message,
          content: `Answer as Maksym Boytsov: ${message.content}`,
        };
      }

      return message;
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content: process.env.OPENAI_PROMPT,
        },
        ...messagesWithPersistantUserInstruction,
      ],
    });

    return res.status(200).json({ choices: response.choices || [] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
