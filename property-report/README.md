# Property Report Widget for ArcGIS Experience Builder

A comprehensive property lookup and reporting widget for ArcGIS Experience Builder applications. Search for a property by address, parcel number, or map click, then view detailed information from multiple data sources in a unified, configurable report, and export it to an accessible, branded PDF.

Built and tested on **ArcGIS Experience Builder Developer Edition 1.19** (also runs on 1.20). The design and functionality were heavily informed by the reporting tool on [PortlandMaps.com](https://www.portlandmaps.com/).

- **Author:** Brian McLeer, GIS Administrator/Developer, City of Grand Junction, CO
- **License:** Apache-2.0
- **Discussion / downloads / feedback:** [Property Report Widget on Esri Community](https://community.esri.com/t5/experience-builder-custom-widgets/property-report-widget/bc-p/1705989)

---

## Installation

This widget ships with a `package.json` and `package-lock.json`, so you no longer need to install each dependency by hand. To add it to your Experience Builder Developer Edition:

1. Copy the `property-report` folder into your client extensions directory:

   ```
   <ExperienceBuilder>/client/your-extensions/widgets/property-report
   ```

2. Install the widget's dependencies. From your Experience Builder **client** directory, run:

   ```bash
   pnpm ci      # Experience Builder 1.21 and later
   npm ci       # Experience Builder 1.20 and earlier
   ```

   Experience Builder reads this widget's `package.json` and installs the exact versions captured in the lockfile, which avoids the version-mismatch and dependency-clash issues that come from installing packages manually. On 1.21 and later, Esri's bootstrap regenerates `pnpm-lock.yaml` from `package-lock.json` automatically, so keep both files in the widget folder.

3. Start (or restart) the client, then refresh the Builder window. The widget will appear under **Insert Widget > Custom**.

> **Heads up:** if you update a source file (e.g. `widget.tsx`), you generally only need to refresh the Builder window. You do not need to re-run the install commands unless the dependency list changes.

### Manual install (Experience Builder 1.20 and earlier only, if you are not using the lockfile)

On 1.21 and later do not install packages by hand; Esri's bootstrap does it from `package.json`. On 1.20 and earlier, if you are not using `npm ci`, the dependencies can be installed individually:

```bash
npm install recharts @tanstack/react-table
npm install @mantine/dates dayjs
npm install @mantine/charts
npm install @mantine/notifications
npm install html2canvas
npm install jspdf
```

## Dependencies

| Package | Purpose |
| --- | --- |
| `recharts` | Chart visualization (bar, column, pie, donut, line, area) |
| `@tanstack/react-table` | Table sorting, filtering, and pagination |
| `@mantine/dates`, `dayjs` | Date handling and formatting |
| `@mantine/charts` | Additional chart utilities |
| `@mantine/notifications` | Toast notifications |
| `html2canvas` | HTML-to-canvas conversion for rendering charts into the PDF |
| `jspdf` | Client-side PDF generation |

Exact versions are pinned in `package.json` and frozen in `package-lock.json`.

---

## Features

### Search
- **Multi-source search:** combine geocoder services, feature-layer (attribute) search, and REST URL sources in one unified search box, with drag-and-drop priority ordering.
- **Type-ahead suggestions** grouped by source, with full keyboard navigation (arrow keys plus Enter) and a clear button.
- **Map selection:** click the map-location icon, then click anywhere on the map to search at that point.
- **URL parameters:** pre-populate and auto-run a search via query string for direct links to a specific property.
- **Shareable report links:** a copy-link button places a URL on the clipboard that reopens the current report; opening the link auto-runs the search. The URL parameter is configurable (default `propertysearch`), with an optional setting to auto-open the widget panel on load.
- **Recent searches:** the widget remembers recent lookups in the browser and offers them as quick-access chips under the search box, with a clear button.
- **Validation:** invalid input surfaces an "Address not found" message; changed text forces a fresh geocode (case-insensitive) instead of reusing cached results.
- **Live loading status:** while a search runs, the widget shows progress (searching, querying layers, gathering nearby features) plus a brief reassurance message for longer lookups.

### Report content
- **Progressive rendering:** report sections appear as soon as each query finishes rather than waiting for the entire report, so results feel immediate and long reports stream into view.
- **Report summary:** an optional plain-language summary rendered above the sections, built from a configurable template with field tokens (for example `{address}` plus any header-info field).
- **Property comparison:** snapshot the current property, search a second one, and view the two side by side with differing values highlighted.
- **Section alerts:** per-section rules evaluated against the results, surfacing colored banners (by severity) when a condition is met, for example flagging a flood zone or an overdue status.
- **Header info:** key property attributes pinned at the top of results, with optional reverse geocoding to show the address in the title regardless of search method.
- **Property preview:** static map image centered on the property, with zoom, copy-address, and custom action buttons (URLs support field tokens like `{parcelid}`), plus an optional logo.
- **Configurable sections:** organize results from different data sources, each with one or more layers, displayed as tables, charts, or both, inline or in a separate slide-out pane.
- **Fast, parallel loading:** section, layer, and nearby-feature queries run concurrently rather than one after another, so reports that pull from many sources load in a fraction of the time.
- **Rich text:** HTML content (links, phone, email) before or after data, with optional action buttons.
- **Tables:** sortable, resizable, filterable columns; sticky headers; striping; pagination; row click/hover interactions (zoom, highlight, popup) on the map.
- **CSV export:** each section with data offers a one-click CSV download that respects the configured field aliases and order.
- **Charts:** bar, column, pie, donut, line, area; interactive legends and tooltips; responsive sizing; screen-reader-accessible data tables as an alternative.
- **Related tables:** query relationship classes; display inline (collapsed/expanded) or in a separate pane, with field formatting, optional charts, and sorting.
- **Nearby features:** distance-based analysis sorted nearest/farthest, with title, subtitle, formatted distance, and optional click-to-zoom.

### Map integration
- Highlights query results using configurable point, line, and polygon symbols.
- Zoom to searched location or individual features, optional buffer display, and automatic highlight cleanup with a configurable timeout.

### PDF export
- Branded header (logo, title/subtitle with field tokens, colors), property summary, tables, charts as images, related data, optional table of contents, page numbers, and footer with disclaimer.
- Page size (Letter, Legal, A4, Tabloid), orientation, margins, colors, fonts, large-text accessibility mode, and section numbering are all configurable.
- **Accessible output:** tagged structure, document language, alt text for images/logos/charts, and marked table headers.

### Coordinate display
- Map-native, WGS84, or Web Mercator; decimal degrees or degrees-minutes-seconds; configurable precision; visibility toggle.

### Import / Export of settings
- Export the full widget configuration to XML for backup or transfer, and import it into another Experience Builder application to replicate setup quickly. All settings, including the v1.2.0 feature toggles, round-trip through XML.

---

## Configuration

All configuration happens in the widget's **Settings** panel in Experience Builder, organized into collapsible sections:

- **Map Connection:** select the map widget the report interacts with.
- **Search Sources:** geocoder, layer, and URL-parameter sources, plus global suggestion limits and ordering.
- **Header Info:** data source, search/display fields, aliases, formatting, PDF exclusion.
- **Property Preview:** image dimensions, basemap, zoom, action buttons, logo.
- **Sections & Layers:** titles, table/chart options, rich text, buffers, field selection/ordering/aliases, row interactions, related tables, nearby features, and per-section alert rules.
- **Report Options:** plain-language summary template, shareable-link URL parameter and auto-open behavior, and individual on/off switches for comparison, report links, CSV export, and recent searches (all on by default).
- **Highlight Layer:** point/line/polygon symbols and auto-clear behavior.
- **PDF Export:** header, footer, style, table of contents, content toggles, and accessibility (language, title metadata, alt-text templates).
- **Coordinate Display:** coordinate system, format, precision.
- **Default Configurations:** global chart/table defaults applied unless overridden per section or layer.

> **Tip on field order:** fields appear in the report in the order you configure them in Settings, not in feature-class order. You can reorder selected fields by dragging them in the field list, or with the up and down arrows next to each field. Field order can also be controlled at the published service level (Pro to Enterprise).

---

## Accessibility (WCAG 2.1 AA)

The widget targets WCAG 2.1 Level AA:

- Full keyboard navigation with visible focus indicators (Tab, Enter/Space, arrow keys in dropdowns/tables, Escape to close menus and panes).
- ARIA labels, roles, and live regions that announce dynamic content, loading progress, and errors to screen readers.
- Minimum contrast ratios and `rem`-based font sizes that respect browser zoom and user font preferences.
- Charts include screen-reader-accessible data tables as an alternative.
- Honors the `prefers-reduced-motion` setting.
- PDF exports carry tagged structure, document language, and alt text.

---

## Usage telemetry

This widget records anonymous usage counts and errors so the GIS Division can see which widgets and versions are in use and which errors users hit. It records the app id and title, widget name and version, the action name, a truncated error message, the site host name and browser family. It never records usernames, coordinates, addresses, attribute values or URLs with query strings. Where the data goes: on page load the widget asks the app's portal for a public item tagged `exb-beacon-sink` and posts to that table. If your portal has no such item, nothing is sent anywhere. To turn it off for an app, set `"telemetry": false` in the widget's config, or users can enable Do Not Track in their browser. The shared module is `src/shared/beacon.ts`.

## Troubleshooting

**`<name> is duplicated` when the client starts.** Experience Builder found two copies of this widget. The usual cause is a nested folder (`widgets\property-report\property-report`) after extracting a zip into a folder that already had the widget's name. `manifest.json` must sit directly inside `widgets\property-report`. Also check for a leftover `-copy` folder and a stale build under `client\dist\widgets`.

**Every page shows "the widget could not load due to an unexpected error" after adding the widget (Experience Builder 1.21).** The widget's dependencies did not install, and the failure is printed in the `pnpm start` window above the webpack output, not in the browser. Look for `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` or `LIFECYCLE Command failed with exit code 1` under a line that says `Installing dependencies in ...\property-report`. This happens when a `pnpm-lock.yaml` from an earlier install (versions before 1.2.6 carried an `overrides` entry) meets a newer pnpm. Stop the client, delete `property-report\node_modules` and `property-report\pnpm-lock.yaml`, make sure `property-report\package-lock.json` is present (re-download this release if not), then run `pnpm ci` and `pnpm start` in `client` again. Once the install succeeds, every page comes back, including pages that never used this widget.

**Export PDF highlights but nothing happens.** Fixed in 1.2.5. If you still see it, your browser is running an older compiled build: stop and restart the client (`pnpm start`), then hard-reload the page (Ctrl+Shift+R).

---

## Feedback

Please report bugs, ideas, questions, and enhancement requests on the [Esri Community blog post](https://community.esri.com/t5/experience-builder-custom-widgets/property-report-widget/bc-p/1705989).

---

## Changelog

- **2026-09-11 (v1.2.6):** Install fix for Experience Builder 1.21. Removes the `overrides` entries from `package.json` (jsPDF 4.2.1 already requires the patched dompurify 3.4.13), so the frozen dependency install no longer fails with `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` on newer pnpm versions. Adds a Troubleshooting section to this README.
- **2026-09-10 (v1.2.5):** Export PDF now bundles jsPDF and html2canvas statically. The on-demand chunk that could 404 on exported, proxied, and sub-path deployments no longer exists.
- **2026-09-09 (v1.2.4):** Adds a searchable in-widget Help guide (question mark button beside the search box) whose sections follow the widget configuration, with a dismissible first-run hint. Adds a self-contained `tsconfig.json` and type shims so Visual Studio reports zero errors under the 1.21 pnpm layout.
- **2026-09-09 (v1.2.3):** Fixes Export PDF failing silently in side panels: the busy overlay now shows first and any library or rendering failure is reported in the widget.

- **2026-07-07 (v1.2.0):** Feature and usability update. Adds progressive rendering (sections stream in as each query completes), a plain-language report summary, per-section alert banners, side-by-side property comparison, shareable report links with an optional auto-open setting, per-section CSV export, and recent searches. Comparison, report links, CSV export, and recent searches each have an on/off switch in the Report Options settings; all settings round-trip through XML import/export. Also fixes header layout so the report action buttons wrap to their own row in narrow panels and long parcel numbers no longer truncate.
- **2026-06-30 (v1.1.0):** Performance and usability update. Section, layer, and nearby-feature queries now run in parallel instead of sequentially, so multi-section reports load much faster. Search now shows live loading status messages. Selected fields can be reordered by dragging in Settings, with the up and down arrows kept as a keyboard-accessible alternative. Includes TypeScript build fixes and a dependency update (dompurify).
- **2026-03-27:** Resolved issue for Experience Builder 1.20. Versions 1.19 and 1.20 available.
- **2026-03-25:** DE 1.20 broke something in the widget; troubleshooting.
- **2026-02-23:** Allow manual sorting of fields within sections in Settings.
- **2026-02-17:** No code change; the companion Right Click widget was updated to launch this widget.
- **2026-02-09:** Added option to interact with the search widget and other widgets for actions; fixed a UI bug where "Nearby" could overrun in some PDF reports.
- **2026-01-22:** V1 finalized after community feedback.

---

## Credits

Created by **Brian McLeer**, City of Grand Junction, CO. Design influenced by PortlandMaps.com. Thanks to the Esri Experience Builder community for feedback and testing.
