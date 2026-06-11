# Property Report Widget for ArcGIS Experience Builder

A comprehensive property lookup and reporting widget for ArcGIS Experience Builder applications. Search for a property by address, parcel number, or map click, then view detailed information from multiple data sources in a unified, configurable report — and export it to an accessible, branded PDF.

Built and tested on **ArcGIS Experience Builder Developer Edition 1.19** (also runs on 1.20). The design and functionality were heavily informed by the reporting tool on [PortlandMaps.com](https://www.portlandmaps.com/).

- **Author:** Brian McLeer — GIS Administrator/Developer, City of Grand Junction, CO
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
   npm ci
   ```

   `npm ci` installs the exact versions captured in `package-lock.json`, which avoids the version-mismatch and dependency-clash issues that come from installing packages manually.

3. Start (or restart) the client, then refresh the Builder window. The widget will appear under **Insert Widget → Custom**.

> **Heads up:** if you update a source file (e.g. `widget.tsx`), you generally only need to refresh the Builder window — you don't need to re-run the install commands unless the dependency list changes.

### Manual install (only if you are not using the lockfile)

If for some reason you are not using `npm ci`, the dependencies can be installed individually:

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
- **Multi-source search** — combine geocoder services, feature-layer (attribute) search, and REST URL sources in one unified search box, with drag-and-drop priority ordering.
- **Type-ahead suggestions** grouped by source, with full keyboard navigation (arrow keys + Enter) and a clear button.
- **Map selection** — click the map-location icon, then click anywhere on the map to search at that point.
- **URL parameters** — pre-populate and auto-run a search via query string for direct links to a specific property.
- **Validation** — invalid input surfaces an "Address not found" message; changed text forces a fresh geocode (case-insensitive) instead of reusing cached results.

### Report content
- **Header info** — key property attributes pinned at the top of results, with optional reverse geocoding to show the address in the title regardless of search method.
- **Property preview** — static map image centered on the property, with zoom, copy-address, and custom action buttons (URLs support field tokens like `{parcelid}`), plus an optional logo.
- **Configurable sections** — organize results from different data sources, each with one or more layers, displayed as tables, charts, or both, inline or in a separate slide-out pane.
- **Rich text** — HTML content (links, phone, email) before or after data, with optional action buttons.
- **Tables** — sortable, resizable, filterable columns; sticky headers; striping; pagination; row click/hover interactions (zoom, highlight, popup) on the map.
- **Charts** — bar, column, pie, donut, line, area; interactive legends and tooltips; responsive sizing; screen-reader-accessible data tables as an alternative.
- **Related tables** — query relationship classes; display inline (collapsed/expanded) or in a separate pane, with field formatting, optional charts, and sorting.
- **Nearby features** — distance-based analysis sorted nearest/farthest, with title, subtitle, formatted distance, and optional click-to-zoom.

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
- Export the full widget configuration to XML for backup or transfer, and import it into another Experience Builder application to replicate setup quickly.

---

## Configuration

All configuration happens in the widget's **Settings** panel in Experience Builder, organized into collapsible sections:

- **Map Connection** — select the map widget the report interacts with.
- **Search Sources** — geocoder, layer, and URL-parameter sources, plus global suggestion limits and ordering.
- **Header Info** — data source, search/display fields, aliases, formatting, PDF exclusion.
- **Property Preview** — image dimensions, basemap, zoom, action buttons, logo.
- **Sections & Layers** — titles, table/chart options, rich text, buffers, field selection/ordering/aliases, row interactions, related tables, and nearby features.
- **Highlight Layer** — point/line/polygon symbols and auto-clear behavior.
- **PDF Export** — header, footer, style, table of contents, content toggles, and accessibility (language, title metadata, alt-text templates).
- **Coordinate Display** — coordinate system, format, precision.
- **Default Configurations** — global chart/table defaults applied unless overridden per section or layer.

> **Tip on field order:** fields appear in the report in the order you configure them in Settings, not in feature-class order. Configure each field fully before moving to the next. Field order can also be controlled at the published service level (Pro → Enterprise).

---

## Accessibility (WCAG 2.1 AA)

The widget targets WCAG 2.1 Level AA:

- Full keyboard navigation with visible focus indicators (Tab, Enter/Space, arrow keys in dropdowns/tables, Escape to close menus and panes).
- ARIA labels, roles, and live regions that announce dynamic content and errors to screen readers.
- Minimum contrast ratios and `rem`-based font sizes that respect browser zoom and user font preferences.
- Charts include screen-reader-accessible data tables as an alternative.
- Honors the `prefers-reduced-motion` setting.
- PDF exports carry tagged structure, document language, and alt text.

---

## Feedback

Please report bugs, ideas, questions, and enhancement requests on the [Esri Community blog post](https://community.esri.com/t5/experience-builder-custom-widgets/property-report-widget/bc-p/1705989).

---

## Changelog

- 2026-06-11 v1.0.2: Security fixes for CodeQL code scanning alerts

- **2026-03-27** — Resolved issue for Experience Builder 1.20. Versions 1.19 and 1.20 available.
- **2026-03-25** — DE 1.20 broke something in the widget; troubleshooting.
- **2026-02-23** — Allow manual sorting of fields within sections in Settings.
- **2026-02-17** — No code change; the companion Right Click widget was updated to launch this widget.
- **2026-02-09** — Added option to interact with the search widget and other widgets for actions; fixed a UI bug where "Nearby" could overrun in some PDF reports.
- **2026-01-22** — V1 finalized after community feedback.

---

## Credits

Created by **Brian McLeer**, City of Grand Junction, CO. Design influenced by PortlandMaps.com. Thanks to the Esri Experience Builder community for feedback and testing.
