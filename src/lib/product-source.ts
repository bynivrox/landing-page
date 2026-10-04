import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * The product repository (bynivrox/topology-manager, private), for tests that keep this site honest about it.
 * Clone it next to this repository, or set NIVROX_PRODUCT_DIR; without it those tests are skipped.
 */
const directory = resolve(process.env.NIVROX_PRODUCT_DIR ?? join(__dirname, "../../../topology-manager"));

export const productSource = existsSync(join(directory, "Nivrox.TopologyManager.slnx")) ? directory : null;

/** A path inside the product repository's src folder. */
export const productPath = (path: string) => join(productSource ?? "", "src", path);
