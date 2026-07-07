import type { ImmutableObject, UseDataSource } from 'jimu-core'

// Field formatting options
export type NumberFormatType = 'default' | 'none' | 'currency' | 'percent' | 'decimal'
export type DateFormatType = 'default' | 'short' | 'medium' | 'long' | 'year-only'
export type TextFormatType = 'default' | 'uppercase' | 'lowercase' | 'titlecase'

export interface FieldFormatConfig {
    type?: 'auto' | 'number' | 'date' | 'text' | 'link'
    numberFormat?: NumberFormatType
    decimalPlaces?: number        // For number formatting
    useGrouping?: boolean         // Whether to use thousand separators (commas)
    dateFormat?: DateFormatType
    textFormat?: TextFormatType
    prefix?: string               // Text to add before value
    suffix?: string               // Text to add after value
    linkText?: string             // Display text for link fields (e.g., "View Document" instead of URL)
    useLinkBaseUrl?: boolean      // Enable prepending a base URL to the field value
    linkBaseUrl?: string          // Base URL to prepend (e.g., "https://example.com/documents/")
}

export interface FieldConfig {
    name: string      // Field name from the data source
    alias: string     // Display name for the field label
    visible: boolean
    format?: FieldFormatConfig   // Optional formatting settings
    excludeFromPdf?: boolean     // If true, field is shown in widget but excluded from PDF export
    hideNull?: boolean           // If true, hide this field when value is NULL/empty (default: false - show NULL values)
}

// Header info layer configuration - for displaying parcel number, etc. in report header
export interface HeaderInfoConfig {
    enabled: boolean
    dataSourceId?: string
    useDataSource?: UseDataSource | null
    layerUrl?: string  // Direct REST endpoint URL
    displayFields: FieldConfig[]  // Fields to show in header (e.g., parcel number)
    geocoderUrl?: string  // Geocoder URL for reverse geocoding to get address in header title
}

// Highlight layer configuration - for highlighting geometry (e.g., parcels) on any search
export interface HighlightLayerConfig {
    enabled: boolean
    dataSourceId?: string
    useDataSource?: UseDataSource | null
    layerUrl?: string  // Direct REST endpoint URL
    highlightColor?: string  // Hex color for highlight (default: #00FFFF)
    fillOpacity?: number  // Fill opacity 0-1 (default: 0 for outline only)
    outSpatialReference?: number  // WKID to force query output spatial reference (e.g., 102100 for Web Mercator)
    geometryOffsetX?: number  // X offset in map units (positive = east) for datum correction
    geometryOffsetY?: number  // Y offset in map units (positive = north) for datum correction
}

export interface LayerConfig {
    layerId: string
    layerTitle: string
    dataSourceId?: string
    useDataSource?: UseDataSource | null
    layerUrl?: string  // Direct REST endpoint URL (alternative to dataSourceId)
    fields: FieldConfig[]
    bufferDistance?: number
    bufferUnit?: 'feet' | 'meters' | 'miles' | 'kilometers'

    // Display state
    expanded?: boolean             // Default expanded state when results load (default: true = expanded)
    displayMode?: 'table' | 'list' | 'card'  // How to display multiple records: table (rows/columns), list (stacked), or card (grouped) - default: table

    // Sorting configuration
    defaultSortField?: string      // Default field to sort by when results load
    defaultSortOrder?: 'asc' | 'desc'  // Default sort direction (default: 'asc')

    // Row interaction with map
    enableRowHighlight?: boolean   // Highlight feature geometry on row hover (default: false)
    enableRowZoom?: boolean        // Zoom to feature geometry on row click (default: false)
    showAllOnMap?: boolean         // Show all features from this layer on map when results load (default: false)
    showAllOnMapColor?: string     // Color for features displayed via Show All on Map (default: #FF6600)
    rowHighlightColor?: string     // Highlight color for row hover (default: #FF6600)
    rowHighlightFillOpacity?: number  // Fill opacity for polygon highlights 0-1 (default: 0.2)
    rowZoomScale?: number          // Map scale when zooming to feature (default: 2500, smaller = more zoomed in)

    // No results message configuration
    useCustomNoResultsText?: boolean   // Use custom text instead of default "No intersecting features found." (default: false)
    customNoResultsText?: string       // Custom text to display when no features are found

    // Related tables configuration
    relatedTables?: RelatedTableConfig[]

    // Nearby mode configuration - displays features sorted by distance
    // When enabled, queries features within a radius and shows them as a distance-sorted list
    nearbyConfig?: NearbyDisplayConfig

    // =====================================================
    // Layer Info Content (Rich Text) Configuration
    // Similar to Section Info Content, but specific to this data layer
    // =====================================================
    layerRichTextContent?: string              // HTML content supporting links, phone, email
    layerRichTextButtons?: RichTextButton[]   // Action buttons (optional)
    layerRichTextPosition?: 'before' | 'after' // Show rich text before or after data table (default: after)
    layerRichTextExcludeFromPdf?: boolean     // If true, rich text is shown in widget but excluded from PDF
    hideLayerRichTextWhenNoResults?: boolean  // If true, hide rich text when no features are returned (default: false)
}

// =====================================================
// Nearby Display Configuration - for showing layer features sorted by distance
// Nearby Display Configuration - for showing layer features sorted by distance
// =====================================================
export interface NearbyDisplayConfig {
    enabled?: boolean             // Enable nearby mode for this layer (default: false)

    // Display fields
    titleField?: string           // Field to display as the main title/name (e.g., "NAME")
    subtitleField?: string        // Optional field for subtitle/secondary info (e.g., "ACRES")
    subtitleSuffix?: string       // Optional suffix for subtitle (e.g., " acres")
    subtitlePrefix?: string       // Optional prefix for subtitle
    linkUrlField?: string         // Optional field containing URL for the title link

    // Query configuration
    maxFeatures?: number          // Maximum number of nearby features to return (default: 5)
    searchRadius?: number         // Maximum search radius (default: 5)
    searchRadiusUnit?: 'feet' | 'meters' | 'miles' | 'kilometers'  // Search radius unit (default: miles)

    // Distance display
    distanceUnit?: 'feet' | 'meters' | 'miles' | 'kilometers'  // Unit for displaying distance (default: miles)
    distancePrecision?: number    // Decimal places for distance (default: 2)
    showDistanceBadge?: boolean   // Show distance badge on right (default: true)

    // Additional options
    sortOrder?: 'asc' | 'desc'    // Sort by distance (default: 'asc' = closest first)

    // PDF Export options
    includeInPdf?: boolean        // Include in PDF export (default: true)
    pdfMaxFeatures?: number       // Override maxFeatures for PDF (default: uses maxFeatures)
}

// Related Table Configuration - for querying relationship classes or linked tables
export interface RelatedTableConfig {
    tableId: string               // Unique identifier
    tableName: string             // Display name for the related table
    dataSourceId?: string         // Data source ID (when using DataSourceSelector)
    useDataSource?: UseDataSource | null  // Data source reference (when using DataSourceSelector)
    tableUrl?: string             // REST endpoint URL of the related table (alternative to dataSourceId)

    // Relationship configuration
    relationshipType: 'key' | 'relationshipClass' | 'spatial'  // How to join data

    // For key-based relationships (manual foreign key)
    primaryKeyField?: string      // Field in parent layer (e.g., PARCELID)
    foreignKeyField?: string      // Field in related table (e.g., PARCEL_ID)

    // For relationship class (ArcGIS Server relationship)
    relationshipId?: number       // Relationship ID from the layer's relationships

    // For spatial relationships (query by geometry)
    spatialRelationship?: 'intersects' | 'contains' | 'within' | 'crosses' | 'touches' | 'overlaps' | 'nearby'
    spatialBuffer?: number        // Buffer distance for spatial query (optional)
    spatialBufferUnit?: 'feet' | 'meters' | 'miles' | 'kilometers'  // Buffer unit
    useParentGeometry?: boolean   // Use parent feature geometry (default: true) vs query point

    // Display configuration
    fields: FieldConfig[]         // Fields to display from related table
    displayMode: 'table' | 'list' | 'card'  // How to display related records
    maxRecords?: number           // Max related records to show (default: 50)
    expanded?: boolean            // Default expanded state when results load (default: true = expanded)

    // Pane configuration - where to display related records
    displayPane?: 'inline' | 'separate'  // 'inline' = show in current section, 'separate' = show in dedicated pane (default: inline)
    separatePaneTitle?: string    // Title for separate pane (defaults to tableName)

    // Sorting configuration
    sortField?: string            // Default field to sort by (server-side on query)
    sortOrder?: 'asc' | 'desc'    // Default sort direction
    enableInteractiveSorting?: boolean  // Allow click-to-sort on column headers (default: true)
    defaultSortField?: string     // Default client-side sort field
    defaultSortOrder?: 'asc' | 'desc'  // Default client-side sort direction

    // Chart configuration for related data
    enableChart?: boolean         // Show chart of related data
    chartConfig?: ChartConfig     // Chart settings for related data

    // Grouping/aggregation
    groupByField?: string         // Optionally group related records
    aggregateFields?: AggregateFieldConfig[]  // Fields to aggregate when grouping

    // =====================================================
    // PDF Export Options for Related Tables (NEW)
    // =====================================================
    pdfIncludeChart?: boolean           // Include chart in PDF export (default: true if enableChart)
    pdfMaxRecords?: number              // Override maxRecords for PDF (default: uses maxRecords)
    pdfExclude?: boolean                // Exclude this related table from PDF entirely (default: false)
    pdfShowTableSummary?: boolean       // Show WCAG table summary for this related table (default: true)
}

// Aggregate field configuration for related table summaries
export interface AggregateFieldConfig {
    fieldName: string
    aggregation: AggregationType
    alias?: string                // Display name for aggregated value
}

// Property Preview Configuration - shows selected feature details at top of results
export interface PropertyPreviewConfig {
    enabled: boolean

    // Map preview
    showMapPreview?: boolean      // Show small map of selected property
    mapPreviewHeight?: number     // Height in pixels (default: 150)
    mapPreviewZoomLevel?: number  // Zoom level for preview (default: 18)
    showBasemap?: boolean         // Show basemap in preview (default: true)
    highlightColor?: string       // Highlight color for property (default: #00FFFF)
    basemapUrl?: string           // Custom basemap MapServer/ImageServer URL for preview (auto-detects from map if not set)

    // Property image (if available from a field)
    imageField?: string           // Field containing image URL
    imageHeight?: number          // Max image height (default: 200)

    // Attribute display
    showAttributes?: boolean      // Show key attributes (default: true)
    attributeLayout?: 'horizontal' | 'vertical' | 'grid'  // Layout style
    primaryFields?: string[]      // Key fields to show prominently (e.g., address, parcel #)
    secondaryFields?: string[]    // Additional fields to show smaller

    // Actions
    showZoomButton?: boolean      // Show zoom to property button (default: true)
    showCopyButton?: boolean      // Show copy address button (default: true)
    customActions?: PropertyActionConfig[]  // Custom action buttons
}

// Custom action button for property preview
export interface PropertyActionConfig {
    actionId: string
    label: string
    icon?: 'link' | 'document' | 'map' | 'info' | 'external'
    urlTemplate: string           // URL with {field} placeholders
    openInNewTab?: boolean
}

// Rich Text Button Configuration
export interface RichTextButton {
    buttonId: string
    label: string
    url: string               // Can include {field} placeholders from header info
    style?: 'default' | 'primary' | 'outline'
    openInNewTab?: boolean    // Default: true
}

export interface SectionAlertConfig {
    alertId: string
    field: string                    // attribute name evaluated against the section's features
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty'
    value?: string
    message: string                  // banner text shown when the rule matches
    severity?: 'info' | 'warning' | 'critical'
}

export interface SectionConfig {
    sectionId: string
    sectionTitle: string

    // Data layer configuration
    layers: LayerConfig[]
    displayAsTable: boolean
    displayAsChart: boolean
    chartField?: string       // Category field to group by (for chart labels/categories)
    expanded?: boolean        // Default expanded state when results load (default: true = expanded)

    // Pane configuration - where to display section results
    displayPane?: 'inline' | 'separate'  // 'inline' = show in results panel, 'separate' = show in dedicated pane (default: inline)
    separatePaneTitle?: string           // Title for separate pane (defaults to sectionTitle)
    separatePaneThreshold?: number       // Only use separate pane when record count >= threshold (default: 0 = always)

    // Rich text configuration (optional - can be added to any section)
    richTextContent?: string          // HTML content supporting links, phone, email
    richTextButtons?: RichTextButton[] // Action buttons (optional)
    richTextPosition?: 'before' | 'after'  // Show rich text before or after data (default: after)
    richTextExcludeFromPdf?: boolean  // If true, rich text is shown in widget but excluded from PDF
    hideRichTextWhenNoResults?: boolean // If true, hide rich text when no features are returned from data layers (default: false)

    // PDF Export options
    excludeFromPdf?: boolean          // If true, entire section is excluded from PDF export
    chartExcludeFromPdf?: boolean     // If true, chart is shown in widget but excluded from PDF export

    // Enhanced chart configuration
    chartConfig?: ChartConfig       // Detailed chart settings
    tableConfig?: TableDisplayConfig  // Table display settings

    // Alert rules that surface banners at the top of this section
    alerts?: SectionAlertConfig[]
}

// Search source types
export type SearchSourceType = 'geocoder' | 'layer' | 'url'

// Individual search source configuration (supports 1:M)
export interface SearchSourceConfig {
    sourceId: string              // Unique ID for this source
    sourceName: string            // Display name for this source
    enabled: boolean              // Whether this source is active
    type: SearchSourceType

    // Geocoder settings
    geocoderUrl?: string
    geocoderName?: string         // Name to display for geocoder (e.g., "World Geocoder")

    // Layer search settings (via DataSource)
    dataSourceId?: string
    useDataSource?: UseDataSource | null
    searchFields?: string[]       // Fields to search against
    displayField?: string         // Field to display in suggestions
    exactMatch?: boolean          // Require exact match vs contains
    maxSuggestions?: number       // Max suggestions per source (default 6)

    // Direct URL settings (alternative to dataSourceId)
    url?: string                  // Direct REST service URL

    // Highlight settings
    highlightEnabled?: boolean    // Whether to highlight geometry on selection
    highlightColor?: string       // Highlight color (hex, default: #00FFFF cyan)
}

// Logo/Image sizing mode (inspired by ArcGIS Image Widget)
export type ImageSizeMode = 'auto' | 'fit' | 'stretch' | 'custom'
export type ImagePosition = 'left' | 'center' | 'right'
export type ImageShape = 'default' | 'circle' | 'rounded'

// PDF Logo/Image Configuration
export interface PdfLogoConfig {
    base64?: string               // Base64-encoded image data
    fileName?: string             // Original filename for reference
    originalWidth?: number        // Original image width in pixels
    originalHeight?: number       // Original image height in pixels

    // Size mode (like ArcGIS Image Widget)
    sizeMode?: ImageSizeMode      // 'auto' | 'fit' | 'stretch' | 'custom' (default: auto)

    // Custom dimensions (only used when sizeMode is 'custom')
    customWidth?: number          // Width in mm
    customHeight?: number         // Height in mm

    // Constraints for auto/fit modes
    maxWidth?: number             // Maximum width in mm (default: 50)
    maxHeight?: number            // Maximum height in mm (default: 25)

    // Position and alignment
    position?: ImagePosition      // 'left' | 'center' | 'right' (default: left)
    verticalAlign?: 'top' | 'middle' | 'bottom'  // Vertical alignment (default: middle)

    // Appearance
    shape?: ImageShape            // 'default' | 'circle' | 'rounded' (default: default)
    borderRadius?: number         // Border radius in mm for 'rounded' shape
    backgroundColor?: string      // Background color behind image (hex)
    padding?: number              // Padding around image in mm (default: 0)

    // Accessibility
    altText?: string              // Alt text for accessibility
}

// PDF Header Configuration
export interface PdfHeaderConfig {
    // Legacy logo properties (kept for backward compatibility)
    logoBase64?: string           // Base64-encoded logo image
    logoFileName?: string         // Original filename for reference
    logoWidth?: number            // Logo width in mm (default: 40)
    logoHeight?: number           // Logo height in mm (auto-calculated if not set)

    // Enhanced logo configuration
    logo?: PdfLogoConfig          // Full logo configuration

    // Header dimensions
    headerHeight?: number         // Header height in mm (default: 35 with logo, 25 without)

    organizationName?: string     // Organization name to display

    // Title configuration
    showTitle?: boolean           // Show PDF title in header (default: true)
    titleFontSize?: number        // Title font size (default: 16)
    titleMode?: 'default' | 'custom'  // 'default' uses address, 'custom' uses reportTitle
    reportTitle?: string          // Custom report title (when titleMode='custom')
    subtitleText?: string         // Optional subtitle
    headerTextColor?: string      // Header text color (hex)
    headerColor?: string          // Header background color (hex)
    includeMap?: boolean          // Include map screenshot (default: true)
    mapHeight?: number            // Map height in mm (default: 60)
    mapScaleMode?: 'fixed' | 'fitGeometry'  // 'fixed' uses mapScale value, 'fitGeometry' zooms to fit highlight geometry (default: fixed)
    mapScale?: number             // Map scale for PDF screenshot when mapScaleMode is 'fixed' (default: 2500). Smaller = more zoomed in.
    mapFitPadding?: number        // Padding factor when using fitGeometry mode (default: 1.2 = 20% padding around geometry)

    // Date display
    showGeneratedDate?: boolean   // Show generated date in header (default: true)

    // Layout options
    titlePosition?: 'left' | 'center' | 'right'  // Title alignment (default: center)
    datePosition?: 'left' | 'right'              // Date position (default: right)
    headerLayout?: 'stacked' | 'inline'          // Stacked or inline layout (default: inline)
}

// PDF Footer Configuration
export interface PdfFooterConfig {
    enabled?: boolean             // Show footer (default: true)
    showPageNumbers?: boolean     // Show page numbers (default: true)
    pageNumberFormat?: 'simple' | 'detailed'  // "1" vs "Page 1 of 5" (default: detailed)
    pageNumberPosition?: 'left' | 'center' | 'right'  // Position (default: right)

    // Disclaimer text
    disclaimerText?: string       // Full disclaimer text
    disclaimerFontSize?: number   // Font size for disclaimer (default: 7)

    // Contact info
    contactText?: string          // e.g., "Planning Department"
    contactPosition?: 'left' | 'center' | 'right'  // Position (default: left)

    // Footer styling
    footerHeight?: number         // Footer height in mm (default: 15)
    footerColor?: string          // Footer background color (hex)
    footerTextColor?: string      // Footer text color (hex)
    showTopBorder?: boolean       // Show border line above footer (default: true)
}

// Chart type options
export type ChartType = 'bar' | 'pie' | 'donut' | 'area' | 'line' | 'radialBar' | 'composite'

// Aggregation types for chart values
export type AggregationType = 'count' | 'sum' | 'avg' | 'min' | 'max'

// Chart mode - how data is visualized
export type ChartMode = 'category' | 'fields'

// Field configuration for comparison charts
export interface ChartFieldConfig {
    fieldName: string             // Field name from data source
    alias?: string                // Display name for legend
    color?: string                // Custom color for this series
    enabled: boolean              // Whether this field is included in chart
}

// Chart configuration for sections
export interface ChartConfig {
    chartType?: ChartType           // Type of chart to display

    // Chart mode
    chartMode?: ChartMode           // 'category' = group by field, 'fields' = compare fields directly

    // Category mode settings (group by a field)
    categoryField?: string          // Field to group by (chart labels) - overrides section.chartField
    valueField?: string             // Numeric field to aggregate (null = count records)
    aggregation?: AggregationType   // How to aggregate valueField (default: count)

    // Fields comparison mode settings (compare multiple fields)
    compareFields?: ChartFieldConfig[]  // Fields to compare in chart
    groupByField?: string           // Optional: group field comparisons by category

    // Multi-series settings (works in both modes)
    valueFields?: string[]          // Multiple value fields for multi-series charts

    // Display options
    showLegend?: boolean            // Show chart legend (default: true)
    legendPosition?: 'top' | 'bottom' | 'left' | 'right'  // Legend position
    showValues?: boolean            // Show values on chart (default: false)
    showGrid?: boolean              // Show grid lines (default: true)
    animate?: boolean               // Enable animations (default: true)
    stacked?: boolean               // Stacked bars/areas (default: false)
    curveType?: 'linear' | 'natural' | 'monotone' | 'step'  // Line/area curve
    colorScheme?: string[]          // Custom color palette
    height?: number                 // Chart height in pixels (default: 200)

    // Axis labels
    xAxisLabel?: string             // Custom X-axis label
    yAxisLabel?: string             // Custom Y-axis label

    // Data limits
    maxCategories?: number          // Max categories to show (default: 10, others grouped as "Other")
    sortBy?: 'value' | 'label' | 'none'  // Sort chart data (default: value descending)
    sortOrder?: 'asc' | 'desc'      // Sort direction (default: desc)

    // Chart description (rich text)
    chartDescription?: string       // HTML content to explain/describe the chart
    chartDescriptionPosition?: 'before' | 'after'  // Show description above or below chart (default: after)
}

// Table display options (widget)
export interface TableDisplayConfig {
    enableSorting?: boolean         // Allow column sorting (default: true)
    enableFiltering?: boolean       // Show filter inputs (default: false)
    enablePagination?: boolean      // Paginate large tables (default: true)
    pageSize?: number               // Rows per page (default: 10)
    pageSizeOptions?: number[]      // Page size options (default: [5, 10, 25, 50])
    stickyHeader?: boolean          // Sticky header on scroll (default: true)
    stripedRows?: boolean           // Alternating row colors (default: true)
    highlightOnHover?: boolean      // Highlight row on hover (default: true)
    compactMode?: boolean           // Reduce row padding (default: false)
    showRowNumbers?: boolean        // Show row number column (default: false)
    resizableColumns?: boolean      // Allow column resize (default: false)
}

// PDF Style Configuration
// Built-in font families for PDF reports
export type PdfBuiltInFont = 'helvetica' | 'times' | 'courier'

// Popular Google Fonts available for PDF
export type GoogleFontName =
    | 'Roboto'
    | 'Open Sans'
    | 'Lato'
    | 'Montserrat'
    | 'Oswald'
    | 'Raleway'
    | 'Poppins'
    | 'Nunito'
    | 'Ubuntu'
    | 'Merriweather'
    | 'PT Sans'
    | 'Playfair Display'
    | 'Source Sans Pro'
    | 'Noto Sans'

// Custom font configuration (user-uploaded TTF)
export interface CustomFontConfig {
    name: string           // Display name for the font
    regularBase64?: string // Base64-encoded TTF for regular weight
    boldBase64?: string    // Base64-encoded TTF for bold weight (optional)
}

export interface PdfStyleConfig {
    primaryColor?: string         // Primary accent color (hex)
    sectionHeaderColor?: string   // Section header background (hex)
    sectionHeaderTextColor?: string  // Section header text color (hex)
    alternateRowColor?: string    // Alternate row background (hex)
    borderColor?: string          // Table/section borders (hex)
    linkColor?: string            // Hyperlink text color (hex, default: #0066CC)
    fontFamily?: PdfBuiltInFont | GoogleFontName | 'custom'  // Font family
    customFont?: CustomFontConfig // Custom uploaded font (when fontFamily='custom')

    // Data layout options
    dataLayout?: 'table' | 'two-column' | 'cards' | 'auto'  // Layout style (default: auto)
    twoColumnGap?: number         // Gap between columns in mm (default: 10)
    showSectionBorders?: boolean  // Show borders around sections (default: true)
    compactMode?: boolean         // Reduce spacing for more content (default: false)

    // PDF Table styling options
    tableHeaderBgColor?: string      // Table header background color (hex, default: #1A6B7C)
    tableHeaderTextColor?: string    // Table header text color (hex, default: #FFFFFF)
    layerTitleBgColor?: string       // Layer title header background color (hex, default: #69812D - olive green)
    layerTitleTextColor?: string     // Layer title header text color (hex, default: #FFFFFF)
    tableHeaderFontSize?: number     // Table header font size in pt (default: 8)
    tableHeaderHeight?: number       // Table header row height in mm (default: 8)
    tableDataFontSize?: number       // Table data font size in pt (default: 8)
    tableDataTextColor?: string      // Table data text color (hex, default: #333333)
    tableRowHeight?: number          // Table data row height in mm (default: 7)
    tableShowBorders?: boolean       // Show table borders and grid lines (default: true)
    tableBorderColor?: string        // Table border color (hex, default: #CCCCCC)
    tableStripedRows?: boolean       // Alternate row backgrounds (default: true)
    tableMaxColumns?: number         // Maximum columns to display (default: 6)
    tableMaxRows?: number            // Maximum rows to display per layer (default: 15)
    tableCellPadding?: number        // Cell padding in mm (default: 2)

    // =====================================================
    // WCAG Accessibility display options
    // =====================================================
    showAccessibilityText?: boolean  // Show visible accessibility text like "[Map Image:...]" (default: true)
    showTableSummaries?: boolean     // Show "Data table:" summaries before tables (default: true)
    showRelatedTableSummaries?: boolean  // Show WCAG summaries for related tables (default: true) - NEW
    showFullUrlsInPdf?: boolean      // Show full URLs after link text for print accessibility (default: false)

    // =====================================================
    // Additional WCAG options
    // =====================================================
    enablePdfBookmarks?: boolean     // Add PDF bookmarks/outline for section navigation (default: true)
    enableHierarchicalBookmarks?: boolean  // Use nested bookmarks: Section > Layer > Related (default: true) - NEW
    showSectionNumbers?: boolean     // Number sections for easier reference (default: false)
    showGeneratedTimestamp?: boolean // Show full date+time instead of just date (default: false)
    accessibilityContact?: string    // Contact info for accessibility questions (shown in footer)
    highContrastMode?: boolean       // Use higher contrast colors for visual impairment (default: false)
    largeTextMode?: boolean          // Use larger base font sizes throughout PDF (default: false)

    // =====================================================
    // Table of Contents options (NEW)
    // =====================================================
    enableTableOfContents?: boolean  // Generate TOC page after header (default: false)
    tocTitle?: string                // Title for TOC page (default: "Table of Contents")
    tocIncludeLayers?: boolean       // Include layer names in TOC (default: true)
    tocIncludeRelatedTables?: boolean  // Include related tables in TOC (default: false)
    tocPageBreakAfter?: boolean      // Force page break after TOC (default: true)

    // =====================================================
    // Related Table PDF options (NEW)
    // =====================================================
    relatedTableHeaderColor?: string     // Related table header bg (default: lighter than main)
    relatedTableIndent?: number          // Indent from parent in mm (default: 5)
    relatedTableMaxRows?: number         // Global max rows for related tables (default: 10)
    includeRelatedTableCharts?: boolean  // Capture related table charts in PDF (default: true)
}

// =====================================================
// WCAG 2.1 PDF Accessibility Configuration
// Full control over PDF accessibility features and metadata
// =====================================================
export interface PdfAccessibilityConfig {
    // Document Metadata (WCAG 2.4.2 Page Titled)
    documentLanguage?: string            // Language code for PDF (default: 'en-US')
    documentAuthor?: string              // Author metadata (default: 'GIS Division')
    documentCreator?: string             // Creator/application metadata (default: 'Property Report Widget')

    // Alt Text Settings (WCAG 1.1.1 Non-text Content)
    includeMapAltText?: boolean          // Include alt text for map images (default: true)
    includeLogoAltText?: boolean         // Include alt text for logo images (default: true)
    mapAltTextTemplate?: string          // Template for map alt text. Use {address} placeholder (default: 'Map showing the location of {address}')
    logoAltTextTemplate?: string         // Template for logo alt text (default: 'Organization logo')
    chartAltTextTemplate?: string        // Template for chart alt text. Use {chartType}, {dataDescription} placeholders (default: 'Chart showing {chartType} visualization of {dataDescription}')

    // Table Accessibility (WCAG 1.3.1 Info and Relationships)
    includeTableSummaries?: boolean      // Include summary text before tables (default: true)
    tableSummaryTemplate?: string        // Template for table summaries. Use {layerTitle}, {recordCount}, {columnCount} placeholders (default: 'Data table: {layerTitle} - {recordCount} records, {columnCount} columns')

    // Related Table Accessibility (WCAG 1.3.1)
    includeRelatedTableSummaries?: boolean  // Include summary text before related tables (default: true)
    relatedTableSummaryTemplate?: string    // Template for related table summaries. Use {tableName}, {recordCount}, {columnCount} placeholders (default: 'Related data: {tableName} - {recordCount} records, {columnCount} columns')

    // Font Accessibility (WCAG 1.4.4 Resize Text)
    minimumFontSize?: number             // Minimum font size in points (default: 9)

    // Reading Order (WCAG 1.3.2 Meaningful Sequence)
    includeReadingOrderMarkers?: boolean // Include markers to aid screen reader navigation (default: true)

    // Table of Contents (WCAG 2.4.5 Multiple Ways)
    tocTitle?: string                    // Title for Table of Contents page (default: 'Table of Contents')
}

export interface Config {
    mapWidgetId?: string | null
    searchSources: SearchSourceConfig[]  // 1:M - Array of search sources
    sections: SectionConfig[]
    headerInfo?: HeaderInfoConfig  // Optional layer for header info (parcel number, etc.)
    highlightLayer?: HighlightLayerConfig  // Optional layer for highlighting geometry on any search

    // Property preview configuration
    propertyPreview?: PropertyPreviewConfig  // Shows selected property details at top of results

    pdfTitle?: string
    pdfIncludeTables?: boolean
    pdfIncludeCharts?: boolean
    pdfIncludeRelatedTables?: boolean  // Include related table data in PDF export (default: true)
    pdfIncludeRelatedTableCharts?: boolean  // Include related table charts in PDF (default: true) - NEW
    resultsPanelTitle?: string

    // Enhanced PDF Configuration
    pdfHeader?: PdfHeaderConfig   // Detailed header configuration
    pdfFooter?: PdfFooterConfig   // Footer configuration (NEW)
    pdfStyle?: PdfStyleConfig     // Style/theme configuration
    pdfAccessibility?: PdfAccessibilityConfig  // WCAG 2.1 accessibility settings

    // Global chart settings (defaults for all sections)
    defaultChartConfig?: ChartConfig

    // Global table settings (defaults for widget tables)
    defaultTableConfig?: TableDisplayConfig

    // Global search settings
    combinedMaxSuggestions?: number      // Total max suggestions across all sources (default 10)
    showSourceLabels?: boolean           // Show source name in suggestions (default true)

    // Coordinate display settings
    coordinateSystem?: 'map' | 'wgs84' | 'webmercator' | 'custom'  // Output: 'map' = native units, 'wgs84' = lat/lon degrees, 'webmercator' = X/Y meters, 'custom' = user-defined WKID
    coordinateFormat?: 'decimal' | 'dms'                 // For WGS84 only: decimal degrees or degrees-minutes-seconds
    coordinatePrecision?: number                         // Decimal places (default: 6)
    showCoordinates?: boolean                            // Show coordinates in results header (default: true)
    customCoordinateWkid?: number                        // Custom WKID for coordinate display (e.g., 2180 for Poland ETRS89)
    customCoordinateLabel?: string                       // Label for custom coordinate system (e.g., "ETRS89 / Poland CS92")

    // Report options
    reportSummaryTemplate?: string                       // Plain-language summary above sections; tokens: {address} plus {FIELD} from header info
    permalinkParam?: string                              // URL query parameter for shareable report links (default: 'propertysearch')
    permalinkAutoOpen?: boolean                          // Attempt to auto-open the widget's panel/sidebar on permalink load (default: true)
    enableComparison?: boolean                           // Show the property comparison button (default: true)
    enablePermalink?: boolean                            // Show the copy-report-link button (default: true)
    enableCsvExport?: boolean                            // Show per-section CSV export buttons (default: true)
    enableRecentSearches?: boolean                       // Remember and show recent searches (default: true)

    // Performance settings
    enableClientSideQuery?: boolean                      // Use client-side querying for layers in map (faster, default: false)

    // Use Current Location settings
    enableUseCurrentLocation?: boolean                   // Show "Use Current Location" button to query at user's GPS location (default: true)
}

export type IMConfig = ImmutableObject<Config>