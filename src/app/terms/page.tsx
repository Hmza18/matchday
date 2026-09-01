import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Matchday",
  description: "Terms for using the Matchday score-prediction app.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <Link href="/" className="text-sm font-medium text-[#146C43]">
        ← Matchday
      </Link>
      <h1 className="mt-6 font-[family-name:var(--font-oswald)] text-3xl font-semibold text-[#0B1F17]">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-[#5B6B64]">Last updated: September 2026</p>

      <section className="mt-8 space-y-6 text-[15px] leading-7 text-[#3D4F47]">
        <div>
          <h2 className="font-semibold text-[#0B1F17]">Acceptance</h2>
          <p className="mt-2">
            By using Matchday you agree to these terms. The app is for entertainment — score
            predictions and friendly leagues. It is not real-money gambling.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-[#0B1F17]">Accounts</h2>
          <p className="mt-2">
            You must provide accurate information when signing up. You are responsible for
            activity on your account.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-[#0B1F17]">Community rules</h2>
          <p className="mt-2">
            Be respectful in league chat. No harassment, hate speech, spam, or illegal content. We
            may remove content or suspend accounts that break these rules.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-[#0B1F17]">Reporting</h2>
          <p className="mt-2">
            Long-press a chat message in the app to report it. We review reports and may take
            action including message removal or account suspension.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-[#0B1F17]">Disclaimer</h2>
          <p className="mt-2">
            Scores and insights are provided as-is. We do not guarantee accuracy of third-party
            data or uninterrupted service.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-[#0B1F17]">Contact</h2>
          <p className="mt-2">
            Support:{" "}
            <a className="text-[#146C43]" href="mailto:support@matchday.app">
              support@matchday.app
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
