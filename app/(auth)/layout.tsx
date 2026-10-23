import Link from "next/link";
import { Bot } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background p-4 sm:p-8">
      <Link href="/" className="mb-8 flex items-center gap-2.5 font-bold tracking-tight">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background shadow-md">
          <Bot className="h-5 w-5" />
        </div>
        <span className="text-2xl font-black tracking-tight">Chatify</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
