"use server";
import { connectToDB } from "@/lib/mongoose";
import Quip from "@/lib/models/quip.model";
import User from "@/lib/models/user.model";
import { revalidatePath } from "next/cache";

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
      $push: { quip: createdQuip._id },
    });
  } catch (err: any) {
    throw new Error("Error creating quip: " + err.message);
  }
}

export async function fetchQuipById(id: string) {
  connectToDB();

  try {
    const quip = await Quip.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: "Quip",
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return quip;
  } catch (err: any) {
    throw new Error("Error fetching quip: " + err.message);
  }
}

export async function addCommentToQuip(
  quipId: string,
  commentText: string,
  userId: string,
  path: string
) {
  await connectToDB();

  try {
    // Find the original quip by its ID
    const originalQuip = await Quip.findById(quipId);

    if (!originalQuip) {
      throw new Error("Thread not found");
    }

    // Create the new comment quip
    const commentQuip = new Quip({
      text: commentText,
      author: userId,
      parentId: quipId, // Set the parentId to the original thread's ID
    });

    // Save the comment quip to the database
    const savedCommentQuip = await commentQuip.save();

    // Add the comment quip's ID to the original thread's children array
    originalQuip.children.push(savedCommentQuip._id);

    // Save the updated original quip to the database
    await originalQuip.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}

async function fetchAllChildQuips(quipId: string): Promise<any[]> {
  const childQuips = await Quip.find({ parentId: quipId });

  const descendantQuips = [];
  for (const childQuip of childQuips) {
    const descendants = await fetchAllChildQuips(childQuip._id);
    descendantQuips.push(childQuip, ...descendants);
  }

  return descendantQuips;
}

export async function deleteQuip(quipId: string, path: string) {
  await connectToDB();

  const rootQuip = await Quip.findById(quipId).populate("author");
  if (!rootQuip) {
    throw new Error("Quip not found");
  }

  const descdendantQuips = await fetchAllChildQuips(quipId);
  const descendantQuipIds = [
    quipId,
    ...descdendantQuips.map((quip) => quip._id),
  ];

  const uniqueAuthorIds = new Set(
    [
      ...descdendantQuips.map((quip) => quip.author?._id?.toString()),
      rootQuip.author?._id?.toString(),
    ].filter((id) => id !== undefined)
  );

  await Quip.deleteMany({ _id: { $in: descendantQuipIds } });

  await User.updateMany(
    { _id: { $in: Array.from(uniqueAuthorIds) } },
    { $pull: { quip: { $in: descendantQuipIds } } }
  );

  revalidatePath(path);

  await Quip.findByIdAndDelete(quipId);
}
