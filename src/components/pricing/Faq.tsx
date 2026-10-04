import { Plus } from "lucide-react";

/** How the plans work: Community self-hosted, the others hosted by Nivrox. Only claims the product backs. */
const questions = [
  {
    question: "Where does Nivrox run?",
    answer:
      "Community runs on your own servers, for free. Professional, Business and Enterprise are hosted by us in the Nivrox cloud: no control plane to install, update or back up.",
  },
  {
    question: "Do my servers need to be reachable from the internet?",
    answer:
      "No. Agents on your servers connect out to the control plane, sign every request and fetch typed commands. Nothing has to accept inbound connections, and an agent is only trusted after you confirm its key fingerprint.",
  },
  {
    question: "What counts towards the limits?",
    answer:
      "Limits apply across all organizations of your account (or, for Community, of your installation). Users include pending invitations, so an invitation never pushes you over the limit later. When a limit is reached, Nivrox explains it instead of failing silently.",
  },
  {
    question: "Is the self-hosted Community edition limited in features?",
    answer:
      "No part of the engine is held back: Community has the same editor, validation, simulation and configuration generation. It is limited in scale, and deployment automation, the audit log and single sign-on are part of the hosted plans.",
  },
  {
    question: "Can Enterprise be tailored to our situation?",
    answer: "Yes. Enterprise limits, capabilities and terms are agreed with you. Contact sales to discuss your environment.",
  },
  {
    question: "What is still in development?",
    answer:
      "GitOps and high availability are part of Business and Enterprise and are being built. They are marked on this page until they ship.",
  },
];

export function Faq() {
  return (
    <div className="divide-y divide-border border-y border-border">
      {questions.map((item) => (
        <details key={item.question} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium tracking-tight">
            {item.question}
            <Plus
              className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-45 group-open:text-brand"
              aria-hidden
            />
          </summary>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
