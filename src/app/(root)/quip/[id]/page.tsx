import QuipCard from "@/components/cards/QuipCard";
import { currentUser } from "@clerk/nextjs";
import { fetchUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { fetchQuipById } from "@/lib/actions/quip.actions";
import Comment from "@/components/forms/Comment";

async function Page({ params }: { params: { id: string } }) {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const quip = await fetchQuipById(params.id);

  return (
    <section className={"relative"}>
      <div>
        <QuipCard
          key={quip._id}
          likes={quip.likes}
          id={quip._id}
          currentUserId={user?.id || ""}
          parentId={quip.parentId}
          content={quip.text}
          author={quip.author}
          community={quip.community}
          createdAt={quip.createdAt}
          comments={quip.children}
        />
      </div>

      <div className={"mt-7"}>
        <Comment
          quipId={quip._id}
          currentUserImg={userInfo.image}
          currentUserId={JSON.stringify(userInfo._id)}
        />

        <div className={"mt-10"}>
          {quip.children.map((comment: any) => (
            <QuipCard
              key={comment._id}
              id={comment._id}
              likes={comment.likes}
              currentUserId={comment?.id || ""}
              parentId={comment.parentId}
              content={comment.text}
              author={comment.author}
              community={comment.community}
              createdAt={comment.createdAt}
              comments={comment.children}
              isComment
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Page;
