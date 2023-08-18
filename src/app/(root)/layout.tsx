import "../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import TopBar from "@/components/shared/TopBar";
import LeftSideBar from "@/components/shared/LeftSidebar";
import RightSidebar from "@/components/shared/RightSidebar";
import BottomBar from "@/components/shared/BottomBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Quippr",
  description: "A Next.js 13 Meta threads clone",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <TopBar />

          <main className={"flex flex-row"}>
            <LeftSideBar />
            <section className={"main-container"}>
              <div className={"w-full max-w-4xl"}>{children}</div>
            </section>
          </main>

          <BottomBar />
        </body>
      </html>
    </ClerkProvider>
  );
}
