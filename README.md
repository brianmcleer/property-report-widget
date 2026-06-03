# Property Report Widget for ArcGIS Experience Builder

A comprehensive property lookup and reporting widget for ArcGIS Experience Builder. Search for a property by address, parcel number, or map click, then view information from multiple data sources in a unified, configurable report and export it to an accessible, branded PDF.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

- **Author:** Brian McLeer, GIS Administrator/Developer, City of Grand Junction, CO
- **Built and tested on:** ArcGIS Experience Builder Developer Edition 1.19 and 1.20 (React 19)
- **Discussion, feedback, and original post:** [Property Report Widget on Esri Community](https://community.esri.com/t5/experience-builder-custom-widgets/property-report-widget/bc-p/1705989)

> The widget folder itself lives in [`property-report/`](property-report). This repo wraps it with project files (license, this readme) so it works for both downloading a release and cloning.

<!-- Tip: add a screenshot or GIF of the widget here to give people a quick visual. -->

## Getting the widget

There are two ways to get it. Both end with you placing a `property-report` folder into your Experience Builder install.

### Option 1: Download a release (recommended)

1. Go to the [Releases](https://github.com/brianmcleer/property-report-widget/releases) page.
2. Under the latest release, download the `property-report.zip` asset.
3. Extract it. You will get a `property-report` folder.

### Option 2: Clone or download the repo

```bash
git clone https://github.com/brianmcleer/property-report-widget.git
```

Or use the green **Code** button above and choose **Download ZIP**. The `property-report` folder is inside.

## Installation

1. Copy the `property-report` folder into your Experience Builder install:

   ```
   <ArcGISExperienceBuilder>/client/your-extensions/widgets/property-report
   ```

2. From the Experience Builder **client** directory, run the standard install:

   ```bash
   npm install
   ```

   Because the widget includes a `package.json` and `package-lock.json` and lives in `your-extensions`, Experience Builder installs its dependencies automatically. You do not need to install recharts, Mantine, jsPDF, or any other package by hand.

3. Start (or restart) the client and refresh the Builder window. The widget appears under **Insert Widget > Custom**.

> If you add the widget to an Experience Builder that is already running, re-run the client install and restart the dev server so the new dependencies are picked up.

## Requirements

- ArcGIS Experience Builder Developer Edition 1.19 or 1.20.
- Earlier editions (1.18 and below) run React 18 and are not supported by this build.

Dependencies (installed automatically, pinned in `property-report/package-lock.json`): recharts, @tanstack/react-table, @mantine/charts, @mantine/dates, @mantine/notifications, dayjs, html2canvas, jspdf.

## Features

- Multi-source search (geocoder, feature layer, and URL parameter) with type-ahead suggestions and map-click selection.
- Configurable report sections with sortable/filterable tables and charts (bar, column, pie, donut, line, area).
- Related-table queries and nearby-feature (proximity) analysis.
- Highlighting of results on the connected map with configurable symbols.
- Branded, WCAG 2.1 AA accessible PDF export with header, footer, table of contents, and disclaimer.
- Full configuration through the widget Settings panel, plus XML import/export of settings.

See [`property-report/README.md`](property-report/README.md) for the full feature and configuration reference.

## Feedback and issues

Please report bugs and enhancement requests either on the [Esri Community blog post](https://community.esri.com/t5/experience-builder-custom-widgets/property-report-widget/bc-p/1705989) or in this repo's [Issues](https://github.com/brianmcleer/property-report-widget/issues) tab.

## License

Licensed under the [Apache License 2.0](LICENSE). Copyright City of Grand Junction, CO.

## Credits

Created by Brian McLeer, City of Grand Junction, CO. Design influenced by PortlandMaps.com. Thanks to the Esri Experience Builder community for feedback and testing.
