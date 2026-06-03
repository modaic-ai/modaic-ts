# Contributing to This Repository

Thank you for your interest in contributing to this repository. Please note that this repository contains generated code. As such, we do not accept direct changes or pull requests. Instead, we encourage you to follow the guidelines below to report issues and suggest improvements.

## How to Report Issues

If you encounter any bugs or have suggestions for improvements, please open an issue on GitHub. When reporting an issue, please provide as much detail as possible to help us reproduce the problem. This includes:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected and actual behavior
- Any relevant logs, screenshots, or error messages
- Information about your environment (e.g., operating system, software versions)
    - For example can be collected using the `npx envinfo` command from your terminal if you have Node.js installed

## Issue Triage and Upstream Fixes

We will review and triage issues as quickly as possible. Our goal is to address bugs and incorporate improvements in the upstream source code. Fixes will be included in the next generation of the generated code.

## Releasing & Publishing

This package is published to npm as [`modaic`](https://www.npmjs.com/package/modaic). Releases run through GitHub Actions — no manual `npm publish` is needed.

### Versioning

The SDK version is owned by Speakeasy (`versioningStrategy: automatic` in `.speakeasy/gen.yaml`). When the OpenAPI spec or generator changes, the **Generate** workflow (`.github/workflows/sdk_generation.yaml`) opens a regeneration PR that bumps the `version` field in `package.json`, `jsr.json`, and `gen.yaml`. Don't edit the version by hand — review and merge that PR.

### Cutting a release

Once `main` holds the version you want to ship, tag it (`v` + the exact `package.json` version) and push the tag:

```bash
git fetch origin main
git tag v0.1.4 origin/main   # tag must match package.json version
git push origin v0.1.4
```

Pushing a `vX.Y.Z` tag triggers the **Publish** workflow (`.github/workflows/publish.yaml`), which:

1. Installs deps (`npm ci`) and verifies the tag matches the `package.json` version (fails loudly on mismatch).
2. Skips if that version is already on npm, so re-runs and stray tags are no-ops.
3. Builds (`npm run build`) and runs `npm publish`.
4. Creates a matching **GitHub Release** with auto-generated notes.

### Prerequisites

The `NPM_TOKEN` repository secret (an npm automation token) must be set under **Settings → Secrets and variables → Actions**. `SPEAKEASY_API_KEY` is also required for the Generate workflow.

### Re-running a failed publish

If a tagged run fails for a transient reason, you don't need to re-tag — go to **Actions → Publish → Run workflow** and pass the tag (or any ref) in the `ref` input.

### What ends up in the package

The npm tarball ships only `esm/` (built output), `src/` (sources), and the docs, controlled by the `files` allowlist in `package.json`. Because Speakeasy regenerates `package.json`, that allowlist and the `license` field are mirrored in `.speakeasy/gen.yaml` under `additionalPackageJSON` so they survive regeneration.

## Contact

If you have any questions or need further assistance, please feel free to reach out by opening an issue.

Thank you for your understanding and cooperation!

The Maintainers
