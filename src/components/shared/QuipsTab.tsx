import QuipCard from "@/components/cards/QuipCard";
import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

interface Result {
  name: string;
  image: string;
  id: string;
  quip: {
    _id: string;
    text: string;
    parentId: string | null;
    author: {
      name: string;
      image: string;
      id: string;
    };
    community: {
      id: string;
      name: string;
      image: string;
    } | null;
    createdAt: string;
    children: {
      author: {
        image: string;
      };
    }[];
  }[];
}

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

async function QuipsTab({ currentUserId, accountId, accountType }: Props) {
  let result: Result;
  result = await fetchUserPosts(accountId);
  console.log(result);

  if (!result) {
    redirect("/");
  }
  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.quip.map((quip) => (
        <QuipCard
          key={quip._id}
          id={quip._id}
          currentUserId={currentUserId}
          parentId={quip.parentId}
          content={quip.text}
          author={
            accountType === "User"
              ? { name: result.name, image: result.image, id: result.id }
              : {
                  name: quip.author.name,
                  image: quip.author.image,
                  id: quip.author.id,
                }
          }
          createdAt={quip.createdAt}
          comments={quip.children}
          community={quip.community}
        />
      ))}
    </section>
  );
}

export default QuipsTab;
