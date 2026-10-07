# Development phases

[← README](../README.md)

The working implementation is organized into five reviewable delivery phases. These branches describe the repository's packaging and review structure; they do not claim to reproduce the original chronological development history.

Each phase has a dedicated feature branch and PR targeting `main`. Phases are merged in order, keeping their branches and merge commits for reference.

| Phase | Feature branch | Scope | Pull request |
| --- | --- | --- | --- |
| 01 · Foundation | `feature/phase-01-foundation` | Cartridge identity, job step type, `ProductListItem` attributes, job definition, placeholder deployment config | [PR #1](https://github.com/Vedesh-reddy/sfcc-custom-wishlist/pull/1) |
| 02 · Storage and job | `feature/phase-02-storage-job` | Wish list storage, price rules, price-drop job, email, unit tests | [PR #2](https://github.com/Vedesh-reddy/sfcc-custom-wishlist/pull/2) |
| 03 · Storefront | `feature/phase-03-storefront` | Routes, product page button, wishlist page, post-login popup, template hook, browser module, resources | [PR #3](https://github.com/Vedesh-reddy/sfcc-custom-wishlist/pull/3) |
| 04 · Tooling and quality | `feature/phase-04-tooling-quality` | Reproducible npm dependencies, build, lint checks, metadata ZIP, GitHub Actions, PR template, contributing guide | [PR #4](https://github.com/Vedesh-reddy/sfcc-custom-wishlist/pull/4) |
| 05 · Documentation | `feature/phase-05-documentation` | Screenshots, installation, merchant guide, architecture, code reference, testing, troubleshooting | [PR #5](https://github.com/Vedesh-reddy/sfcc-custom-wishlist/pull/5) |

The same feature is integrated in [SFCC-RefArch](https://github.com/Vedesh-reddy/SFCC-RefArch) through PRs #4–#7.

## Review order

Start with the metadata and the storage service's exports, then the job's failure handling. Review the controller's early returns and cache settings before the templates and browser code. Then check the tooling, and use the screenshots to follow the shopper and merchant flow.

The final `main` branch contains all five phases. Build output is generated locally or downloaded from a successful GitHub Actions run; it is not committed.
