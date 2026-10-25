"use client";

import { SessionProvider } from "@/components/providers/SessionProvider";

export default function ConnectedLayout({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
