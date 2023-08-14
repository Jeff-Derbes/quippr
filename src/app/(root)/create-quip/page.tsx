import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/actions/user.actions";
import PostQuip from "@/components/forms/PostQuip";

async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);

  if (!userInfo) {
    redirect("/onboarding");
  }
  return (
    <>
      {" "}
      <h1 className={"head-text"}>Create Quip</h1>
      <PostQuip userId={userInfo._id} />
    </>
  );
}

export default Page;
