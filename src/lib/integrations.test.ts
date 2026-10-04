import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { available } from "./integrations";
import { productPath, productSource } from "./product-source";

// The integrations page must not claim more than the product does: compare with the product's sources.
const registry = productSource ? readFileSync(productPath("Frontend/Web/src/features/node-registry/definitions.ts"), "utf8") : "";
const integrations = available.flatMap((group) => group.integrations);

describe.skipIf(!productSource)("integrations (needs the topology-manager repository)", () => {
  it.each(integrations)("$name is drawn with registered resource types", (integration) => {
    if (integration.depth.model) {
      expect(integration.resourceTypes?.length, "a modeled integration names its resource types").toBeGreaterThan(0);
    }

    for (const type of integration.resourceTypes ?? []) {
      expect(registry, `resource type '${type}'`).toContain(`type: "${type}",`);
    }
  });

  it.each(integrations)("$name only claims generation it has generators for", (integration) => {
    expect(Boolean(integration.depth.generate)).toBe((integration.generators?.length ?? 0) > 0);
    for (const generator of integration.generators ?? []) {
      expect(existsSync(productPath(`Backend/Infrastructure/Generation/${generator}.cs`)), generator).toBe(true);
    }
  });

  it.each(integrations)("$name only claims discovery the agent has adapters for", (integration) => {
    expect(Boolean(integration.depth.discover)).toBe((integration.agentAdapters?.length ?? 0) > 0);
    for (const adapter of integration.agentAdapters ?? []) {
      expect(existsSync(productPath(`Agents/InfrastructureAgent/internal/adapters/${adapter}`)), adapter).toBe(true);
    }
  });

  it.each(integrations)("$name explains every partial capability", (integration) => {
    if (Object.values(integration.depth).includes("partial")) {
      expect(integration.note).toBeTruthy();
    }
  });
});
