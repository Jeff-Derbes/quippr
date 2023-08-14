import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "../globals.css";
import TopBar from "@/components/shared/TopBar";

export const metadata = {
  title: "Quippr",
  description: "A Next.js 13 Meta threads clone",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-dark-1`}>
          <section className={"py-10"}>
            <TopBar />
          </section>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
