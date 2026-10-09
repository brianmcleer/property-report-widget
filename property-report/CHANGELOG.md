# Changelog

Newest first. Every release bumps `manifest.json` and `package.json` together.

## 1.2.14 (2026-10-09)

### Fixed

- Security: restored DOMPurify 3.4.16 in the pnpm lockfile, fixing GHSA-6688-9rhm-gjv2 and GHSA-p98j-92pf-mc4p. The npm lockfile was already patched, but the pnpm lockfile had reverted to 3.4.13 after a later dependency refresh.
- Added the pnpm override for older pnpm versions and a .pnpmfile.cjs dependency hook for pnpm 11. The hook enforces the patched DOMPurify range even when Experience Builder installs the widget with --ignore-workspace. A local workspace file isolates widget installs from the client workspace. No widget code changes.

## 1.2.13 (2026-10-06)

- Dependencies: removed `@mantine/charts`, `@mantine/dates`, `@mantine/notifications` and `dayjs`. No source file imports them, so they only added install size and Dependabot update requests. The widget now depends on recharts, @tanstack/react-table, jspdf and html2canvas only. No code changes.

## 1.2.12 (2026-10-06)

- Security: DOMPurify, used internally by jsPDF, updated from 3.4.13 to 3.4.16 in both lockfiles. Fixes two low-severity advisories that affect DOMPurify's IN_PLACE mode. The widget does not call DOMPurify directly. No code changes.

## 1.2.11 (2026-09-28)

- Dependencies: `@tanstack/react-table` is pinned back to 8.21.3. Version 9 removed `useReactTable`, `getCoreRowModel`, `getSortedRowModel`, `getFilteredRowModel` and `getPaginationRowModel` in favour of a feature-registration API. webpack reports the missing exports only as warnings and still compiles, so the build looks clean while every table section throws when a report renders. Nothing else changed; recharts 3.10.1 and the other dependency updates are kept.

## 1.2.10 (2026-09-18)

- Settings: a **Show help guide** option. Turn it off and the question-mark button and the first-run hint both disappear; the guide itself is untouched. Undefined means on, so apps configured before this release keep their help button.

## 1.2.9 (2026-09-18)

- Security: the beacon's session id now falls back to `crypto.getRandomValues` and then to a clock value instead of `Math.random`, which CodeQL flags as insecure randomness (shared beacon 1.1.1). The id only groups one page load's events; it is never a secret or a credential.
- Build: `tsconfig.json` is `jsx: react-jsx` with `jsxImportSource: @emotion/react`, matching the Experience Builder client. ts-loader reads the widget tsconfig, and the previous classic `jsx: react` setting made the settings panel and runtime fail with "Cannot convert undefined or null to object" after a full rebuild. No functional change.

## 1.2.8 (2026-09-18)

- Added: anonymous usage and error telemetry (shared beacon module; off unless the portal publishes an exb-beacon-sink table; telemetry: false in config disables it).

## 1.2.7 (2026-09-17)

- Packaging: the Visual Studio editor shims are no longer in the release zip. `publish.ps1` strips them from a staging copy (`$ReleaseOnlyExclude`) and refuses to zip if any ambient `declare module` of react, jimu or esri survives. The shims stay in the GitHub repo; clone users delete them before building.

## Earlier releases

See the GitHub releases page and the changelog section of the README, if any.
