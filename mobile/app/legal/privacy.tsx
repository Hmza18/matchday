import { LegalContact, LegalScreen, LegalSection } from "@/src/components/legal-screen";

export default function PrivacyPolicyScreen() {
  return (
    <LegalScreen title="Privacy Policy">
      <LegalSection
        heading="Overview"
        body="Matchday is a score-prediction app for football fans. This policy explains what we collect, why, and how you can control your data. Last updated: September 2026."
      />
      <LegalSection
        heading="Information we collect"
        body="Account details (name, email), score predictions, league membership, chat messages in pools you join, and an optional profile photo. We also store device session tokens so you stay signed in."
      />
      <LegalSection
        heading="How we use it"
        body="To run leagues and leaderboards, save your picks, show live scores, and let you chat with league members. We do not sell your personal data."
      />
      <LegalSection
        heading="Third parties"
        body="We use Supabase for authentication and data storage, and a football data API for fixtures and results. Those providers process data on our behalf under their own privacy terms."
      />
      <LegalSection
        heading="Retention & deletion"
        body="You can delete your account at any time from the You tab. Deletion removes your profile, picks, league memberships, and chat messages from our systems."
      />
      <LegalSection
        heading="Contact"
        body="Questions about privacy? Email us at"
      />
      <LegalContact />
    </LegalScreen>
  );
}
