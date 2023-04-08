import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { firstName, email } = req.body;

  try {
    await prisma.newsletter.create({
      data: {
        firstName,
        email,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "You are already subscribed." });
    }

    return res.status(500).json({ message: "Something went wrong" });
  }

  res.status(200).json({ message: "Success" });
};
