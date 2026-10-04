import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { plans, type Feature } from "./plans";
import { productPath, productSource } from "./product-source";

// The pricing page must show exactly what the product enforces: compare with the C# source of truth.
const source = productSource ? readFileSync(productPath("Backend/Domain/Licensing/License.cs"), "utf8") : "";

describe.skipIf(!productSource)("pricing plans (needs the topology-manager repository)", () => {
  it.each(plans.filter((plan) => plan.tier !== "Enterprise"))("$tier matches LicensePlans", (plan) => {
    const entry = new RegExp(`\\[LicenseTier\\.${plan.tier}\\] = ([\\s\\S]*?)(?=\\[LicenseTier\\.|\\};)`).exec(source)?.[1];
    expect(entry, `LicensePlans entry for ${plan.tier}`).toBeDefined();

    const limits = /MaxOrganizations: (\d+), MaxProjects: (\d+), MaxUsers: (\d+), MaxAgents: (\d+)/.exec(entry!)!;
    expect([plan.limits.organizations, plan.limits.projects, plan.limits.users, plan.limits.agents]).toEqual(limits.slice(1).map(Number));

    const features = [...entry!.matchAll(/Feature\.(\w+)/g)].map((match) => match[1] as Feature);
    expect([...plan.features].sort()).toEqual(features.sort());
  });

  it("Enterprise is unlimited with every feature", () => {
    expect(source).toMatch(/\[LicenseTier\.Enterprise\] = \(LicenseLimits\.Unlimited, Enum\.GetValues<Feature>\(\)\)/);
    const enterprise = plans.find((plan) => plan.tier === "Enterprise")!;
    expect(Object.values(enterprise.limits).every((value) => value === null)).toBe(true);

    const allFeatures = /public enum Feature\s*\{([^}]*)\}/
      .exec(source)![1]
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);
    expect([...enterprise.features].sort()).toEqual(allFeatures.sort());
  });
});
