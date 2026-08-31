"use client";

import { useMatchday } from "@/lib/store";
import { LockIcon, SparkleIcon } from "@/components/icons";
import { ClubBadge, FormChip } from "@/components/ui";

const LOCKED_ROWS = [
  ["2–0", "1.62", 92],
  ["2–1", "1.48", 84],
  ["1–0", "1.21", 68],
  ["3–1", "0.94", 52],
] as const;

export function InsightsScreen() {
  const { premiumUnlocked, unlockPremium } = useMatchday();

  return (
    <div>
      <div className="mb-4 flex items-center gap-[9px] rounded-[14px] border border-md-line bg-linear-to-r from-md-mint to-md-paper px-[15px] py-[13px]">
        <SparkleIcon />
        <p className="m-0 flex-1 text-[12.5px] leading-[1.45] text-md-ink">
          Model data for GW7, refreshed 40 minutes ago.
        </p>
        <span className="shrink-0 rounded-full border border-[#34D399] bg-md-paper px-2 py-1 text-[9.5px] font-bold tracking-[0.08em] text-md-green-deep">
          PREMIUM
        </span>
      </div>

      <div className="grid gap-3.5">
        <article className="rounded-[14px] border border-md-line bg-md-paper p-4 shadow-[0_1px_2px_rgba(31,41,55,.06)]">
          <h2 className="mb-[3px] font-headline text-base font-semibold tracking-[0.03em]">Head to head</h2>
          <p className="mb-[15px] text-[11.5px] text-md-muted">Last five meetings · league only</p>
          <div className="flex items-center gap-3">
            <div className="flex flex-1 flex-col items-center text-center">
              <ClubBadge mono="AU" color="#1E3A8A" size={42} />
              <div className="mt-[7px] text-[13px] font-semibold">Atlas United</div>
              <div className="mt-[9px] flex justify-center gap-1">
                {(["W", "W", "D", "L", "W"] as const).map((result, index) => (
                  <FormChip key={`h-${index}`} result={result} />
                ))}
              </div>
            </div>
            <span className="font-headline text-xs font-semibold tracking-[0.08em] text-md-muted">VS</span>
            <div className="flex flex-1 flex-col items-center text-center">
              <ClubBadge mono="CB" color="#BE123C" size={42} />
              <div className="mt-[7px] text-[13px] font-semibold">Coral Bay FC</div>
              <div className="mt-[9px] flex justify-center gap-1">
                {(["L", "D", "W", "W", "L"] as const).map((result, index) => (
                  <FormChip key={`a-${index}`} result={result} />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-[9px] border-t border-md-line pt-3.5">
            {[
              [11, "Goals for", 7],
              [6, "Goals against", 9],
              [2, "Clean sheets", 1],
            ].map(([home, label, away]) => (
              <div key={String(label)} className="flex items-center gap-2.5 text-[12.5px]">
                <span className="w-11 text-left font-headline text-base font-semibold tabular-nums">{home}</span>
                <span className="flex-1 text-center text-md-muted">{label}</span>
                <span className="w-11 text-right font-headline text-base font-semibold tabular-nums">{away}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[14px] border border-md-line bg-md-paper p-4 shadow-[0_1px_2px_rgba(31,41,55,.06)]">
          <h2 className="mb-[3px] font-headline text-base font-semibold tracking-[0.03em]">Win probability</h2>
          <p className="mb-[15px] text-[11.5px] text-md-muted">Atlas United v Coral Bay FC · Sat 15:00</p>
          <div className="flex h-[38px] overflow-hidden rounded-[10px]">
            <div className="grid w-[54%] place-items-center bg-md-green font-headline text-sm font-semibold text-[#f8f8f8]">
              54%
            </div>
            <div className="grid w-[24%] place-items-center bg-[#34D399] font-headline text-sm font-semibold text-[#08301F]">
              24%
            </div>
            <div className="grid w-[22%] place-items-center bg-[#9CA3AF] font-headline text-sm font-semibold text-[#f8f8f8]">
              22%
            </div>
          </div>
          <div className="mt-[11px] flex flex-wrap gap-3.5 text-[11.5px] text-md-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-[9px] rounded-[3px] bg-md-green" />
              Atlas United
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-[9px] rounded-[3px] bg-[#34D399]" />
              Draw
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-[9px] rounded-[3px] bg-[#9CA3AF]" />
              Coral Bay FC
            </span>
          </div>
          <div className="mt-[15px] rounded-[11px] border border-md-line bg-md-page px-[13px] py-3 text-[12.5px] leading-[1.5] text-md-ink">
            Most-backed scoreline is <strong>2–1 Atlas</strong> at 19% of all picks. The model likes{" "}
            <strong>2–0</strong> slightly more.
          </div>
        </article>

        <article aria-label="Locked premium module" className="relative overflow-hidden rounded-[14px] border border-md-line bg-md-paper">
          <div className={premiumUnlocked ? "p-4" : "pointer-events-none p-4 select-none blur-[5px]"} aria-hidden={!premiumUnlocked}>
            <h2 className="mb-[3px] font-headline text-base font-semibold">Expected points by pick</h2>
            <p className="mb-3.5 text-[11.5px] text-md-muted">Which scoreline maximises your GW7 return</p>
            <div className="grid gap-[9px]">
              {LOCKED_ROWS.map(([score, xp, width]) => (
                <div key={score} className="flex items-center gap-2.5">
                  <span className="w-[38px] font-headline text-[15px] font-semibold">{score}</span>
                  <div
                    className="h-2.5 flex-1 rounded-full"
                    style={{
                      background: `linear-gradient(90deg,#198754 ${width}%,#EEF2F1 ${width}%)`,
                    }}
                  />
                  <span className="font-headline text-sm text-md-muted">{xp}</span>
                </div>
              ))}
            </div>
          </div>
          {!premiumUnlocked ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-[rgba(245,250,248,.72)] p-5 text-center">
              <div className="grid size-[38px] place-items-center rounded-full border border-md-line bg-md-paper text-md-green-deep">
                <LockIcon />
              </div>
              <p className="m-0 text-[13px] font-semibold">Expected points by pick</p>
              <p className="m-0 max-w-[250px] text-xs leading-[1.5] text-md-muted">
                See the value in every scoreline before you commit.
              </p>
              <button
                type="button"
                onClick={unlockPremium}
                className="h-11 rounded-full bg-md-green px-5 text-sm font-semibold text-[#f8f8f8] hover:bg-md-green-deep"
              >
                Unlock with Premium
              </button>
            </div>
          ) : null}
        </article>
      </div>
    </div>
  );
}
