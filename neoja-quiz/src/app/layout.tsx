import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "./context/UserContext";
import { QuizProvider } from "./context/QuizContext";


export const metadata: Metadata = {
  title: "NEOJA Quiz App",
  description: "Interactive venue-based quiz experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <UserProvider>
          <QuizProvider>
        {children}
          </QuizProvider>
        </UserProvider>
      </body>
    </html>
  );
}
