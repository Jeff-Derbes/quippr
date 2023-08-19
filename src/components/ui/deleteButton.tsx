"use client";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { deleteQuip } from "@/lib/actions/quip.actions";

interface Props {
  quipId: string;
  currentUserId: string;
  authorId: string;
  parentId: string | null;
  isComment?: boolean;
}

function DeleteButton({
  quipId,
  currentUserId,
  authorId,
  parentId,
  isComment,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  if (currentUserId !== authorId || pathname === "/") return null;

  return (
    <button
      onClick={async () => {
        if (window.confirm("Are you sure you want to delete this quip?")) {
          await deleteQuip(JSON.parse(quipId), pathname);
        }

        if (!parentId || !isComment) {
          router.push("/");
        }
      }}
    >
      <Image
        src="/assets/delete.svg"
        alt="delete"
        width={24}
        height={24}
        className="cursor-pointer object-contain"
      />
    </button>
  );
}

export default DeleteButton;
