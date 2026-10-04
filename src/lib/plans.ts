/**
 * The plans as the product enforces them. Tiers, limits and features mirror Nivrox.Domain.Licensing.LicensePlans
 * (topology-manager: src/Backend/Domain/Licensing/License.cs); keep them in sync. Community is self-hosted and free; Professional,
 * Business and Enterprise are hosted by Nivrox. Their monthly prices are set in the management center (Pricing) and
 * loaded by lib/pricing-source.ts; only Enterprise is "Contact sales".
 */

export const currencies = ["USD", "EUR"] as const;
export type Currency = (typeof currencies)[number];

export type PricedTier = "Professional" | "Business";

/** Monthly prices in minor units (cents), as served by the management center's /api/public/pricing. */
export type PriceTable = Record<PricedTier, Record<Currency, number>>;

/** Shown when the management center cannot be reached; keep in step with its defaults (management-center: src/lib/pricing.ts). */
export const defaultPrices: PriceTable = {
  Professional: { USD: 500, EUR: 450 },
  Business: { USD: 2900, EUR: 2500 },
};

export type Tier = "Community" | "Professional" | "Business" | "Enterprise";

export type Feature = "AuditLog" | "DeploymentAutomation" | "SingleSignOn" | "GitOps" | "HighAvailability" | "PrioritySupport";

export interface Limits {
  organizations: number | null;
  projects: number | null;
  users: number | null;
  agents: number | null;
}

export type Hosting = "self-hosted" | "cloud";

export interface Plan {
  tier: Tier;
  hosting: Hosting;
  summary: string;
  price: { kind: "free" } | { kind: "custom" } | { kind: "monthly"; tier: PricedTier };
  limits: Limits;
  features: Feature[];
  /** self-host: run it yourself; signup: start a hosted plan; contact: talk to sales. */
  cta: "self-host" | "signup" | "contact";
}

export const plans: Plan[] = [
  {
    tier: "Community",
    hosting: "self-hosted",
    summary: "Run it on your own servers. Model, simulate and generate configuration for a small environment.",
    price: { kind: "free" },
    limits: { organizations: 1, projects: 3, users: 3, agents: 3 },
    features: [],
    cta: "self-host",
  },
  {
    tier: "Professional",
    hosting: "cloud",
    summary: "Hosted by Nivrox. Deploy through agents with approvals, backups and rollback.",
    price: { kind: "monthly", tier: "Professional" },
    limits: { organizations: 1, projects: 25, users: 10, agents: 25 },
    features: ["AuditLog", "DeploymentAutomation"],
    cta: "signup",
  },
  {
    tier: "Business",
    hosting: "cloud",
    summary: "Hosted by Nivrox. Several organizations, single sign-on and more agents.",
    price: { kind: "monthly", tier: "Business" },
    limits: { organizations: 5, projects: 100, users: 50, agents: 250 },
    features: ["AuditLog", "DeploymentAutomation", "SingleSignOn", "GitOps"],
    cta: "signup",
  },
  {
    tier: "Enterprise",
    hosting: "cloud",
    summary: "Hosted by Nivrox. No limits, every capability and priority support, on terms that fit your organization.",
    price: { kind: "custom" },
    limits: { organizations: null, projects: null, users: null, agents: null },
    features: ["AuditLog", "DeploymentAutomation", "SingleSignOn", "GitOps", "HighAvailability", "PrioritySupport"],
    cta: "contact",
  },
];

export const featureInfo: Record<Feature, { label: string; detail: string; available: boolean }> = {
  DeploymentAutomation: {
    label: "Deployment automation",
    detail: "Plans, approvals, agent deployments, backups and rollback.",
    available: true,
  },
  AuditLog: { label: "Audit log", detail: "Every action recorded, filterable and exportable as CSV.", available: true },
  SingleSignOn: { label: "Single sign-on", detail: "OpenID Connect per organization, with auto-provisioning.", available: true },
  GitOps: { label: "GitOps", detail: "Topologies in your repository.", available: false },
  HighAvailability: { label: "High availability", detail: "Multiple control plane instances.", available: false },
  PrioritySupport: { label: "Priority support", detail: "Faster responses from the team that builds Nivrox.", available: true },
};

export const limitLabels: Record<keyof Limits, string> = {
  organizations: "Organizations",
  projects: "Projects",
  users: "Users",
  agents: "Agents",
};

/** In every plan, Community included: the product itself is never crippled, licensing only gates extras. */
export const included = [
  "Visual topology editor with versioned topologies",
  "Validation: IP conflicts, subnets, WireGuard, ports, SSH lockout",
  "Layer-by-layer simulation with explanations",
  "User runs from a visitor to their goal",
  "Configuration generation: WireGuard, Compose, nftables, Checkmk",
  "Agents with fingerprint-approved enrollment",
  "Five roles from Owner to Viewer",
  "English, Dutch, French and Spanish",
];

export const hostingLabels: Record<Hosting, string> = {
  "self-hosted": "Self-hosted",
  cloud: "Nivrox cloud",
};

export function ctaLabel(plan: Plan) {
  return { "self-host": "Self-host for free", signup: `Start with ${plan.tier}`, contact: "Contact sales" }[plan.cta];
}

export function formatPrice(plan: Plan, currency: Currency, prices: PriceTable) {
  switch (plan.price.kind) {
    case "free":
      return "Free";
    case "custom":
      return "Custom";
    default: {
      const minor = prices[plan.price.tier][currency];
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(minor / 100);
    }
  }
}

export function formatLimit(value: number | null) {
  return value === null ? "Unlimited" : value.toLocaleString("en-US");
}
