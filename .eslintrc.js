module.exports = {
  extends: ["next/core-web-vitals", "next/typescript"],
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "out/",
    "build/",
    "dist/",
    "data/",
    "*.sqlite*",
    ".env*",
    "coverage/",
    ".cache/",
    "tmp/",
    "temp/",
    "*.config.*",
    "tsconfig*.json",
    "*.md",
    "Dockerfile*",
    "docker-compose.yml",
    "*.nix",
    "runner-app/"
  ]
};
