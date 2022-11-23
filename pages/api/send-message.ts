import type { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, message, name } = req.body;

  console.info(`New message from ${name} <${email}>: ${message}`);

  res.status(200).json({ message: "Success" });
};
