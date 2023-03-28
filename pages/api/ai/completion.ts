import type { NextApiRequest, NextApiResponse } from "next";
import { openai } from "../../../lib/openai";
import rateLimit from "../../../utils/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const today = new Date().toISOString().split("T")[0];

  const question = req.body.question;

  if (!question) {
    return res.status(400).json({ message: "Question is required" });
  }

  try {
    try {
      await limiter.check(res, 6, "COMPLETION");
    } catch (error) {
      res
        .status(429)
        .json({ message: "Too many requests. Limit is 6 per minute." });
    }

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Today is ${today}. ${process.env.OPENAI_PROMPT}`,
        },
        {
          role: "user",
          content: `Question about Maksym Boytsov: ${question}. Please answer it as if you were him.`,
        },
      ],
    });

    return res
      .status(200)
      .json({ message: response.data.choices[0]?.message?.content });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
