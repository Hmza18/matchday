import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Matchday",
  description: "How Matchday collects and uses your data.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <Link href="/" className="text-sm font-medium text-[#146C43]">
        ← Matchday
      </Link>
      <h1 className="mt-6 font-[family-name:var(--font-oswald)] text-3xl font-semibold text-[#0B1F17]">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-[#5B6B64]">Last updated: September 2026</p>

      <section className="mt-8 space-y-6 text-[15px] leading-7 text-[#3D4F47]">
        <div>
          <h2 className="font-semibold text-[#0B1F17]">Overview</h2>
          <p className="mt-2">
            Matchday is a score-prediction app for football fans. This policy explains what we
            collect, why, and how you can control your data.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-[#0B1F17]">Information we collect</h2>
          <p className="mt-2">
            Account details (name, email), score predictions, league membership, chat messages in
            pools you join, and an optional profile photo. We also store device session tokens so
            you stay signed in.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-[#0B1F17]">How we use it</h2>
          <p className="mt-2">
            To run leagues and leaderboards, save your picks, show live scores, and let you chat
            with league members. We do not sell your personal data.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-[#0B1F17]">Third parties</h2>
          <p className="mt-2">
            We use Supabase for authentication and data storage, and a football data API for
            fixtures and results. Those providers process data on our behalf under their own
            privacy terms.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-[#0B1F17]">Retention &amp; deletion</h2>
          <p className="mt-2">
            You can delete your account at any time from the You tab in the mobile app. Deletion
            removes your profile, picks, league memberships, and chat messages from our systems.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-[#0B1F17]">Contact</h2>
          <p className="mt-2">
            Questions? Email{" "}
            <a className="text-[#146C43]" href="mailto:support@matchday.app">
              support@matchday.app
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
