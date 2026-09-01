import { LegalContact, LegalScreen, LegalSection } from "@/src/components/legal-screen";

export default function TermsScreen() {
  return (
    <LegalScreen title="Terms of Service">
      <LegalSection
        heading="Acceptance"
        body="By using Matchday you agree to these terms. The app is for entertainment — score predictions and friendly leagues. It is not real-money gambling."
      />
      <LegalSection
        heading="Accounts"
        body="You must provide accurate information when signing up. You are responsible for activity on your account. Do not share your password."
      />
      <LegalSection
        heading="Community rules"
        body="Be respectful in league chat. No harassment, hate speech, spam, or illegal content. We may remove content or suspend accounts that break these rules."
      />
      <LegalSection
        heading="Reporting"
        body="Long-press a chat message to report it. We review reports and may take action including message removal or account suspension."
      />
      <LegalSection
        heading="Intellectual property"
        body="Matchday branding and app design are ours. Football data and club names belong to their respective rights holders."
      />
      <LegalSection
        heading="Disclaimer"
        body="Scores and insights are provided as-is. We do not guarantee accuracy of third-party data or uninterrupted service."
      />
      <LegalSection
        heading="Contact"
        body="Support and legal enquiries:"
      />
      <LegalContact />
    </LegalScreen>
  );
}
