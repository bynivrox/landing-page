/** Site navigation; section links are absolute so they work from every page. */
export const navigation = [
  { href: "/#workflow", label: "Platform" },
  { href: "/#simulation", label: "Simulation" },
  { href: "/#security", label: "Security" },
  { href: "/integrations", label: "Integrations" },
  { href: "/pricing", label: "Pricing" },
] as const;

/** What the guide line calls each landing page section (by id); sections without a name are not marked. */
export const sectionNames: Record<string, string> = {
  top: "Start",
  layers: "Layers",
  problem: "The problem",
  workflow: "Workflow",
  simulation: "Simulation",
  existing: "Existing infrastructure",
  deployment: "Deployment",
  configuration: "Configuration",
  drift: "Drift",
  security: "Security",
  contact: "Get started",
};
