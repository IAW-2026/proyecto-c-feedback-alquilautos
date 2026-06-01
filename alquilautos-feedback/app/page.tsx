import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import LandingContent from "@/app/LandingContent";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/moderacion");
  return <LandingContent />;
}
