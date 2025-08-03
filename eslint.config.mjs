import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/dist/**",
      "**/data/**",
      "**/*.sqlite*",
      "**/.env*",
      "**/coverage/**",
      "**/.cache/**",
      "**/tmp/**",
      "**/temp/**",
      "**/*.config.*",
      "**/tsconfig*.json",
      "**/*.md",
      "**/Dockerfile*",
      "**/docker-compose.yml",
      "**/*.nix",
      "**/runner-app/**"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
