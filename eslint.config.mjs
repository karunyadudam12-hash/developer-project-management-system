import {
  defineConfig,
  globalIgnores,
} from "eslint/config";

import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    // Next.js generated files
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Prisma / generated contract files
    "src/prisma/contract.d.ts",
    "migrations/snapshots/**",

    // Other generated files
    "**/*.generated.ts",
    "**/*.generated.tsx",
    "**/*.generated.d.ts",
  ]),
]);

export default eslintConfig;