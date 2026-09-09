import type { HelpSection } from './components/HelpPopup'

/**
 * Flags the widget computes from config and live status. One per feature that has
 * help text. Compute them with the same checks the UI itself uses (see
 * helpFeatures() in widget.tsx), so the guide never describes a control the widget
 * is not currently showing.
 */
export interface HelpFeatures {
  mapConnected: boolean      // a map widget is linked, so map click, zoom and highlight mean something
  currentLocation: boolean   // "Use your location" button is shown
  recentSearches: boolean    // recent searches are remembered and shown
  tables: boolean            // at least one section shows a table
  charts: boolean            // at least one section shows a chart
  nearby: boolean            // at least one layer is in nearby mode
  relatedTables: boolean     // at least one layer has related tables
  separatePane: boolean      // something opens in its own pane
  coordinates: boolean       // coordinates are shown under the address
  rowHighlight: boolean      // some layer outlines a feature on hover
  rowZoom: boolean           // some layer zooms to a feature on click
  showAllOnMap: boolean      // some layer draws all matches on the map
  propertyPreview: boolean   // the small map card at the top is on
  csvExport: boolean         // per-section CSV buttons are shown
  permalink: boolean         // the copy-link button is shown
  comparison: boolean        // the compare button is shown
}

type T = (id: string, values?: Record<string, string>) => string

export function buildHelpSections (t: T, f: HelpFeatures): HelpSection[] {
  const when = (on: boolean, ...ids: string[]): string[] => (on ? ids.map((id: string) => t(id)) : [])

  const find: HelpSection = {
    key: 'find',
    icon: 'search',
    title: t('helpFindTitle'),
    intro: t('helpFindIntro'),
    body: [
      t('helpFindType'),
      ...when(f.mapConnected, 'helpFindMapClick'),
      ...when(f.currentLocation, 'helpFindLocation'),
      ...when(f.recentSearches, 'helpFindRecent'),
      t('helpFindClear')
    ]
  }

  const read: HelpSection = {
    key: 'read',
    icon: 'list-check',
    title: t('helpReadTitle'),
    body: [
      t('helpReadSections'),
      t('helpReadEmpty'),
      ...when(f.tables, 'helpReadTables'),
      ...when(f.charts, 'helpReadCharts'),
      ...when(f.nearby, 'helpReadNearby'),
      ...when(f.relatedTables, 'helpReadRelated'),
      ...when(f.separatePane, 'helpReadSeparate'),
      ...when(f.coordinates, 'helpReadCoordinates')
    ]
  }

  const mapBody = [
    ...when(f.rowHighlight, 'helpMapHighlight'),
    ...when(f.rowZoom, 'helpMapZoom'),
    ...when(f.showAllOnMap, 'helpMapShowAll'),
    ...when(f.propertyPreview, 'helpMapPreview')
  ]
  const map: HelpSection[] = f.mapConnected && mapBody.length > 0
    ? [{ key: 'map', icon: 'pin', title: t('helpMapTitle'), body: mapBody }]
    : []

  const exportShare: HelpSection = {
    key: 'export',
    icon: 'download',
    title: t('helpExportTitle'),
    body: [
      t('helpExportPdf'),
      ...when(f.csvExport, 'helpExportCsv'),
      ...when(f.permalink, 'helpShareLink'),
      ...when(f.comparison, 'helpCompare')
    ]
  }

  const trouble: HelpSection = {
    key: 'trouble',
    icon: 'exclamation-mark-triangle',
    title: t('helpTroubleTitle'),
    body: [
      t('helpTroubleNoSuggestions'),
      t('helpTroubleEmpty'),
      t('helpTroubleSpinner'),
      t('helpTroublePdf'),
      ...when(f.currentLocation, 'helpTroubleLocation'),
      t('helpTroubleContact')
    ]
  }

  const tips: HelpSection = {
    key: 'tips',
    icon: 'lightbulb',
    title: t('helpTipsTitle'),
    body: [
      t('helpTips1'),
      ...when(f.permalink, 'helpTips2'),
      t('helpTips3')
    ]
  }

  return [
    { key: 'start', icon: 'play', title: t('helpStartTitle'), ordered: true, body: [t('helpStart1'), t('helpStart2'), t('helpStart3')] },
    find,
    read,
    ...map,
    exportShare,
    trouble,
    tips
  ]
}
