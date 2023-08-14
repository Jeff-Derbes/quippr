"use server";
import { connectToDB } from "@/lib/mongoose";
import Quip from "@/lib/models/quip.model";
import User from "@/lib/models/user.model";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createQuip({ text, author, path, communityId }: Params) {
  try {
    await connectToDB();

    const createdQuip = await Quip.create({
      text,
      author,
      community: null,
    });

    // update user
    await User.findByIdAndUpdate(author, {
      $push: { quips: createdQuip._id },
    });
  } catch (err: any) {
    throw new Error("Error creating quip: " + err.message);
  }
}
