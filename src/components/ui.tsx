import type { CSSProperties, ReactNode } from "react";
import type { PillKind } from "@/lib/types";

export function ClubBadge({
  mono,
  color,
  logo,
  size = 30,
}: {
  mono: string;
  color: string;
  logo?: string | null;
  size?: number;
}) {
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full bg-md-page object-contain"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-headline font-semibold tracking-[0.02em] text-[#f8f8f8]"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.4,
      }}
    >
      {mono}
    </span>
  );
}

export function ResultPill({
  kind,
  children,
}: {
  kind: PillKind;
  children: ReactNode;
}) {
  const style: CSSProperties =
    kind === "exact"
      ? { background: "#198754", color: "#f8f8f8" }
      : kind === "close"
        ? { background: "#34D399", color: "#08301F" }
        : kind === "result"
          ? { background: "#f8f8f8", color: "#1F2937", border: "1px solid #6B7280" }
          : { background: "#F1F3F2", color: "#6B7280" };

  return (
    <span
      className="inline-flex shrink-0 items-center gap-[5px] rounded-full px-[11px] py-[5px] font-headline text-[12.5px] font-semibold tracking-[0.04em] whitespace-nowrap"
      style={style}
    >
      {children}
    </span>
  );
}

export function FormChip({ result }: { result: "W" | "D" | "L" }) {
  const style =
    result === "W"
      ? { background: "#198754", color: "#f8f8f8" }
      : result === "D"
        ? { background: "#D1FAE5", color: "#146C43" }
        : { background: "#F1F3F2", color: "#6B7280" };

  return (
    <span
      className="grid size-5 place-items-center rounded-[6px] text-[10.5px] font-bold"
      style={style}
    >
      {result}
    </span>
  );
}
