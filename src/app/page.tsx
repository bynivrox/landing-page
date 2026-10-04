import { ConfigurationSection } from "@/components/landing/ConfigurationSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { DeploymentSection } from "@/components/landing/DeploymentSection";
import { DriftSection } from "@/components/landing/DriftSection";
import { ExistingInfrastructure } from "@/components/landing/ExistingInfrastructure";
import { Hero } from "@/components/landing/Hero";
import { LayersSection } from "@/components/landing/LayersSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { SimulationSection } from "@/components/landing/SimulationSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { site } from "@/lib/site";

/** Dark where it starts and ends, light in between: the hero's light dissolves into the page. */
export default function LandingPage() {
  return (
    <main>
      <Hero contactUrl={site.contactUrl} />
      <div data-theme="light" className="theme-light">
        <LayersSection />
        <ProblemSection />
        <WorkflowSection />
        <SimulationSection />
        <ExistingInfrastructure />
        <DeploymentSection />
        <ConfigurationSection />
        <DriftSection />
        <SecuritySection />
        <CtaSection primary={{ href: site.contactUrl, label: "Request a demo" }} secondary={{ href: site.appUrl, label: "Sign in" }} />
      </div>
    </main>
  );
}
