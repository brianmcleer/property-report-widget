export default {
  _widgetLabel: 'Property Report',
  _action_generateReport_label: 'Generate Report',

  // ---- In-widget help guide (shared keys; same wording in every widget) ----
  helpTitle: 'Help',
  close: 'Close',
  helpIntro: 'Look up a property and read everything the City has on record for it in one place, then print, save or share what you find.',
  helpSearchPlaceholder: 'Search the guide (try "PDF" or "parcel")',
  helpNoMatches: 'Nothing in the guide matches that word. Try another, or open the sections above.',
  helpAnd: 'and',
  firstRunTitle: 'New here?',
  firstRunBody: 'Type an address or parcel number in the box at the top, pick a suggestion, and the report fills in below.',
  firstRunHelpLink: 'Open the guide.',
  firstRunDismiss: 'Dismiss',

  // ---- Start here ----
  helpStartTitle: 'Start here: three steps',
  helpStart1: 'Type an address or parcel number in the box at the top and pick a suggestion from the list.',
  helpStart2: 'Wait a moment. Each section fills in as its data arrives; a spinner shows while that happens.',
  helpStart3: 'Click a section heading to open or close it. The icons at the top right export, share or clear the report.',

  // ---- Finding a property ----
  helpFindTitle: 'Finding a property',
  helpFindIntro: 'There are several ways to choose the property. Use whichever you have to hand.',
  helpFindType: 'Type: addresses and parcel numbers both work. Suggestions appear after a few letters; use the arrow keys and Enter to pick one.',
  helpFindMapClick: 'Click the map: press the pin button beside the search box, then click a spot on the map. Press it again to cancel.',
  helpFindLocation: 'Use your location: press the arrow button beside the search box and allow the browser to share your position.',
  helpFindRecent: 'Recent searches appear under the search box when the report is empty. Click one to run it again.',
  helpFindClear: 'The X in the search box clears what you typed. The X at the top right of a finished report clears the whole report.',

  // ---- Reading the report ----
  helpReadTitle: 'Reading the report',
  helpReadSections: 'The report is split into sections, one per topic. The number beside a heading is how many records were found.',
  helpReadEmpty: 'A section that says no results found is not broken: nothing in that layer touches this property.',
  helpReadTables: 'Tables can be sorted by clicking a column heading, filtered with the boxes above them, and paged with the arrows below them.',
  helpReadCharts: 'Charts summarize a section. Hover a bar or slice to see its value.',
  helpReadNearby: 'Nearby lists show the closest features and how far away they are.',
  helpReadRelated: 'Related tables show records linked to the property, such as permits or inspections, under the layer they belong to.',
  helpReadSeparate: 'Some sections open in their own pane. Use the Back button at the top of that pane to return to the report.',
  helpReadCoordinates: 'The coordinates under the address are the exact point that was searched.',

  // ---- The map ----
  helpMapTitle: 'Working with the map',
  helpMapHighlight: 'Point at a row to outline that feature on the map.',
  helpMapZoom: 'Click a row, or its magnifier button, to zoom the map to that feature.',
  helpMapShowAll: 'Some layers draw every matching feature on the map when the report loads.',
  helpMapPreview: 'The small map at the top of the report shows the property; its buttons zoom the main map or copy the coordinates.',

  // ---- Exporting and sharing ----
  helpExportTitle: 'Exporting and sharing',
  helpExportPdf: 'Export PDF: the printer icon at the top right makes a PDF of the whole report. A "Generating PDF" message shows while it works, usually a few seconds, then the file downloads.',
  helpExportCsv: 'Download CSV: the small CSV button in a section heading downloads that section as a spreadsheet, one file per layer.',
  helpShareLink: 'Copy link: the chain icon copies a web address that reopens this exact report. Paste it into an email or a case note.',
  helpCompare: 'Compare: the two-panels icon keeps this report, then you search a second property and the differences are listed side by side.',

  // ---- Troubleshooting ----
  helpTroubleTitle: 'If something looks wrong',
  helpTroubleNoSuggestions: 'No suggestions appear: the address may be outside the area or spelled differently. Try fewer words, the street name alone, or the parcel number.',
  helpTroubleEmpty: 'Every section says no results: the point may be outside the data coverage. Check the map and try clicking the property directly.',
  helpTroubleSpinner: 'The spinner never stops: the map is still starting or a service is slow. Wait a moment, then search again.',
  helpTroublePdf: 'Export PDF shows an error or nothing happens: the PDF tools did not load. Reload the page and try again.',
  helpTroubleLocation: 'Use your location does nothing: the browser blocked location access. Allow it in the browser address bar, then try again.',
  helpTroubleContact: 'Still stuck? Contact the GIS Division and mention the Property Report name and this app.',

  // ---- Good to know ----
  helpTipsTitle: 'Good to know',
  helpTips1: 'Section headings work from the keyboard too: Tab to a heading and press Enter to open it.',
  helpTips2: 'A report link works for anyone who can open this app, so it is a quick way to hand a property to a colleague.',
  helpTips3: 'The PDF uses the same sections you see on screen; sections marked by the administrator as screen only are left out.'
}
