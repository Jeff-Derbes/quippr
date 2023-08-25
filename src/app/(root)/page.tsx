//app/page.tsx
import { currentUser } from "@clerk/nextjs";
import { fetchQuips } from "@/lib/actions/quip.actions";
import QuipCard from "@/components/cards/QuipCard";

export default async function Home() {
  const result = await fetchQuips(1, 30);
  const user = await currentUser();

  return (
    <>
      <h1 className={"head-text text-left"}>Home</h1>

      <section className={"mt-9 flex flex-col gap-10"}>
        {result.quips.length === 0 ? (
          <p className={"no-result"}>No quips found</p>
        ) : (
          <>
            {result.quips.map((quip) => (
              <QuipCard
                key={quip._id}
                id={quip._id}
                currentUserId={user?.id || ""}
                parentId={quip.parentId}
                content={quip.text}
                author={quip.author}
                likes={quip.likes}
                community={quip.community}
                createdAt={quip.createdAt}
                comments={quip.children}
              />
            ))}
          </>
        )}
      </section>
    </>
  );
}
