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

export async function fetchQuips(pageNumber = 1, pageSize = 20) {
  await connectToDB();

  // Calculate the number of quips to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a query to fetch the quips that have no parent (top-level quips) (a quips that is not a comment/reply).
  const quipsQuery = Quip.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });

  // Count the total number of top-level posts (quiips) i.e., quips that are not comments.
  const totalQuipsCount = await Quip.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of posts

  const quips = await quipsQuery.exec();

  const isNext = totalQuipsCount > skipAmount + quips.length;

  return { quips, isNext };
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
