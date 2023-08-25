// LikeButton.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { likeQuip, unlikeQuip } from "@/lib/actions/quip.actions";
import { usePathname, useRouter } from "next/navigation";
import { currentUser } from "@clerk/nextjs"; // Assuming you have these functions set up

interface Props {
  userId: string;
  quipId: string;
  initiallyLiked: boolean;
  likes?: string[];
}

function LikeButton({ quipId, initiallyLiked, userId, likes }: Props) {
  const [isLiked, setIsLiked] = useState(initiallyLiked);
  const pathname = usePathname();

  const handleLike = async () => {
    try {
      // Optimistically update the UI
      setIsLiked(true);

      await likeQuip(JSON.parse(quipId), userId, pathname);
    } catch (error) {
      setIsLiked(false);
      console.error("Error liking the quip:", error);
    }
  };

  const handleUnlike = async () => {
    try {
      setIsLiked(false);

      await unlikeQuip(JSON.parse(quipId), userId, pathname);
    } catch (error) {
      setIsLiked(true);
      console.error("Error unliking the quip:", error);
    }
  };

  return (
    <button
      className="flex flex-col translate-y-3.5  items-center gap-1"
      onClick={isLiked ? handleUnlike : handleLike}
    >
      <Image
        src={isLiked ? "/assets/heart-filled.svg" : "/assets/heart-gray.svg"}
        alt="like"
        width={24}
        height={24}
        className="cursor-pointer object-contain"
      />
      <span className="text-small-semibold text-white text-center h-5">
        {likes?.length > 0 ? likes.length : ""}
      </span>
    </button>
  );
}

export default LikeButton;
