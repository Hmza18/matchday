"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const PUBLIC_PATHS = new Set(["/sign-in", "/sign-up"]);

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.has(pathname);

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) {
      router.replace("/sign-in");
      return;
    }
    if (user && isPublic) {
      router.replace("/");
    }
  }, [user, loading, isPublic, router]);

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-md-canvas">
        <div className="flex flex-col items-center gap-3">
          <div
            className="grid size-12 place-items-center rounded-[14px] font-headline text-xl font-bold text-[#f8f8f8]"
            style={{ background: "linear-gradient(160deg,#198754,#146C43)" }}
          >
            M
          </div>
          <p className="text-sm text-md-muted">Loading Matchday…</p>
        </div>
      </div>
    );
  }

  if ((!user && !isPublic) || (user && isPublic)) {
    return (
      <div className="grid min-h-dvh place-items-center bg-md-canvas">
        <p className="text-sm text-md-muted">Redirecting…</p>
      </div>
    );
  }

  return children;
}
