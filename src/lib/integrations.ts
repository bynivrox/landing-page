/**
 * The integrations page: what Nivrox works with today and how deep, and what is planned. Claims are checked against
 * the product by integrations.test.ts (resource types in the node registry, generators, agent adapters), so the
 * page fails the build when it says more than the product does. Planned items come from the product roadmap;
 * nothing here is a promise of a date.
 */

/** How far Nivrox goes with an integration, in workflow order. */
export const capabilities = [
  { key: "model", label: "Model", description: "Drawn on the canvas and part of the canonical infrastructure model." },
  { key: "simulate", label: "Simulate", description: "Evaluated layer by layer when a connection or user journey is simulated." },
  { key: "generate", label: "Generate", description: "Deterministic configuration files generated from the model." },
  { key: "deploy", label: "Deploy", description: "Applied through the Nivrox Agent with approval, backup, verification and rollback." },
  { key: "discover", label: "Discover", description: "Read from real servers by the agent. Read-only." },
] as const;

export type Capability = (typeof capabilities)[number]["key"];

/** true: built. "partial": built in part, explained in `note`. Missing: not built. */
export type Depth = true | "partial";

export interface Integration {
  name: string;
  summary: string;
  /** Resource types in the product's node registry this integration is drawn as. */
  resourceTypes?: string[];
  /** C# generator classes in the product (topology-manager: src/Backend/Infrastructure/Generation). */
  generators?: string[];
  /** Read-only agent adapters in the product (topology-manager: src/Agents/InfrastructureAgent/internal/adapters). */
  agentAdapters?: string[];
  depth: Partial<Record<Capability, Depth>>;
  note?: string;
}

export interface IntegrationGroup {
  title: string;
  description: string;
  integrations: Integration[];
}

export const available: IntegrationGroup[] = [
  {
    title: "Hosts & containers",
    description: "The servers and runtimes services run on.",
    integrations: [
      {
        name: "Linux servers",
        summary: "Hosts with interfaces, addresses and placement: what runs on which machine.",
        resourceTypes: ["server"],
        agentAdapters: ["system"],
        depth: { model: true, simulate: true, deploy: true, discover: "partial" },
        note: "The agent reports the OS and network interfaces; they are not yet imported into the topology.",
      },
      {
        name: "Docker",
        summary: "Container runtimes, port publication and bind addresses, and the Docker network between containers.",
        resourceTypes: ["docker"],
        agentAdapters: ["docker"],
        depth: { model: true, simulate: true, deploy: true, discover: "partial" },
        note: "The agent reports the Docker engine; containers are not yet imported.",
      },
      {
        name: "Docker Compose",
        summary: "Compose projects generated from the services placed in them, and applied without taking over foreign projects.",
        resourceTypes: ["docker-compose"],
        generators: ["DockerComposeGenerator"],
        depth: { model: true, simulate: true, generate: true, deploy: true },
      },
    ],
  },
  {
    title: "Networking & security",
    description: "Every layer a packet crosses, in the order the simulator checks it.",
    integrations: [
      {
        name: "WireGuard",
        summary: "Peers, endpoints and AllowedIPs in both directions, including the handshake underneath the tunnel.",
        resourceTypes: ["wireguard"],
        generators: ["WireGuardConfigurationGenerator"],
        agentAdapters: ["wireguard"],
        depth: { model: true, simulate: true, generate: true, deploy: true, discover: "partial" },
        note: "Private keys are created on the server and never leave it. The agent reports existing interfaces.",
      },
      {
        name: "nftables",
        summary: "Ordered host firewall rules. Generated into Nivrox's own table, validated with nft -c before applying.",
        resourceTypes: ["firewall"],
        generators: ["NftablesFirewallGenerator"],
        depth: { model: true, simulate: true, generate: true, deploy: true },
      },
      {
        name: "iptables, ufw, Windows Firewall",
        summary: "Rules are evaluated by the simulator like nftables.",
        resourceTypes: ["firewall"],
        depth: { model: true, simulate: true },
        note: "Configuration is generated for nftables only.",
      },
      {
        name: "DNS zones",
        summary: "A and CNAME records, resolvers per server or network, and names published for servers.",
        resourceTypes: ["dns-zone"],
        depth: { model: true, simulate: true },
        note: "Zones are simulated; records are not yet synchronized with a DNS provider.",
      },
    ],
  },
  {
    title: "Services",
    description: "The applications the infrastructure exists for.",
    integrations: [
      {
        name: "Checkmk & Agent Receiver",
        summary: "The monitoring site as a container, and agent registration that uses the address the simulator proved.",
        resourceTypes: ["checkmk"],
        generators: ["CheckmkAgentRegistrationGenerator", "DockerComposeGenerator"],
        depth: { model: true, simulate: true, generate: true, deploy: true },
      },
      {
        name: "Traefik",
        summary: "Entry points and routes: the simulator follows traffic through the proxy to each service it routes to.",
        resourceTypes: ["traefik"],
        depth: { model: true, simulate: true },
        note: "Traefik routers are not generated yet.",
      },
      {
        name: "Storage",
        summary: "Storage boxes and shares over NFS, SMB, SFTP or S3, marked as sensitive when exposed.",
        resourceTypes: ["storage"],
        depth: { model: true, simulate: true },
      },
    ],
  },
];

/** Not tied to a resource on the canvas: how Nivrox reaches servers and who signs in. */
export const platform: { name: string; summary: string }[] = [
  {
    name: "Nivrox Agent",
    summary: "Outbound-only, signed requests, typed commands only. Linux amd64, arm64 and armv7, and Windows amd64.",
  },
  {
    name: "OpenID Connect single sign-on",
    summary: "Per organization, with any OpenID Connect identity provider. Authorization code flow with PKCE.",
  },
];

export const planned: { title: string; items: string[] }[] = [
  { title: "Access & discovery", items: ["Agentless SSH discovery", "Full inventory import from the agent", "Drift detection"] },
  { title: "Source of truth", items: ["NetBox", "Nautobot", "Git"] },
  { title: "Infrastructure as code", items: ["Terraform", "OpenTofu", "Pulumi", "Ansible"] },
  { title: "Networking & DNS", items: ["Cloudflare", "DNS providers", "Tailscale", "Batfish"] },
  { title: "Reverse proxies", items: ["Traefik configuration", "Nginx", "HAProxy"] },
  { title: "Platforms & cloud", items: ["Kubernetes", "Proxmox", "Hetzner", "AWS", "Azure"] },
  { title: "Identity", items: ["SAML single sign-on"] },
];
