/** @jsx jsx */
/** @jsxFrag React.Fragment */
import { React, jsx, css, DataSourceManager, WidgetState } from 'jimu-core'
import type { AllWidgetProps } from 'jimu-core'
import { JimuMapViewComponent, loadArcGISJSAPIModules } from 'jimu-arcgis'
import type { JimuMapView } from 'jimu-arcgis'
import type { IMConfig, SectionConfig, LayerConfig, SearchSourceConfig, PdfHeaderConfig, PdfFooterConfig, PdfStyleConfig, PdfLogoConfig, ChartConfig, ChartType, TableDisplayConfig, FieldConfig, RichTextButton, RelatedTableConfig, PropertyPreviewConfig, NearbyDisplayConfig } from '../config'
import { Loading, LoadingType } from 'jimu-ui'
// Recharts (keep for PDF generation compatibility)
import {
    BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart as RechartsPieChart, Pie, Cell, Legend as RechartsLegend, CartesianGrid,
    AreaChart as RechartsAreaChart, Area, LineChart as RechartsLineChart, Line,
    RadialBarChart, RadialBar, ComposedChart
} from 'recharts'
// TanStack Table
// @tanstack/react-table - run: npm install @tanstack/react-table in ExB client folder
// Imported statically; ensure it is installed before starting the dev server.
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
    type PaginationState
} from '@tanstack/react-table'
import Point from 'esri/geometry/Point'
import Extent from 'esri/geometry/Extent'
import Graphic from 'esri/Graphic'
import * as geometryEngine from 'esri/geometry/geometryEngine'
import SpatialReference from 'esri/geometry/SpatialReference'
import FeatureLayer from 'esri/layers/FeatureLayer'
import Polygon from 'esri/geometry/Polygon'
import Polyline from 'esri/geometry/Polyline'
// PDF export — requires: npm install jspdf html2canvas (run in ExB client folder)
import jsPDFLib from 'jspdf'
import html2canvasLib from 'html2canvas'

// Convert rich-text HTML to plain text for PDF output using an inert DOMParser
// pass. This strips tags and decodes entities correctly in one step and avoids
// the incomplete-sanitization and double-escaping patterns CodeQL flags.
const htmlToPlainText = (html: string): string => {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.body.querySelectorAll('br').forEach(br => br.replaceWith(' '))
  doc.body.querySelectorAll('p').forEach(p => p.insertAdjacentText('beforeend', '\n'))
  return (doc.body.textContent || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Module-level mutable state (not imports)
let projection: any = null  // esri/geometry/projection loaded via loadArcGISJSAPIModules
let _projectionResolve: (() => void) | null = null
const projectionReady: Promise<void> = new Promise(resolve => { _projectionResolve = resolve })
const jsPDF: any = jsPDFLib
const html2canvas: any = html2canvasLib

const { useState, useRef, useMemo, useCallback, useEffect } = React


// =====================================================
// REST GEOCODING HELPERS
// Use ArcGIS REST API directly — avoids esri/rest/Locator
// module casing conflict on Windows in JSAPI 5.x
// =====================================================

const restGeocode = async (geocoderUrl: string, singleLine: string): Promise<Point | null> => {
    try {
        const params = new URLSearchParams({
            f: 'json', SingleLine: singleLine, maxLocations: '1', outFields: 'Match_addr'
        })
        const resp = await fetch(`${geocoderUrl}/findAddressCandidates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        })
        const data = await resp.json()
        if (data.candidates?.length > 0) {
            const loc = data.candidates[0].location
            return new Point({ x: loc.x, y: loc.y, spatialReference: data.spatialReference ?? { wkid: 4326 } })
        }
    } catch (e) { console.warn('Geocoding failed:', e) }
    return null
}

const restReverseGeocode = async (geocoderUrl: string, point: Point): Promise<string | null> => {
    try {
        const params = new URLSearchParams({
            f: 'json',
            location: JSON.stringify({ x: point.x, y: point.y, spatialReference: { wkid: point.spatialReference?.wkid ?? 4326 } })
        })
        const resp = await fetch(`${geocoderUrl}/reverseGeocode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        })
        const data = await resp.json()
        return data.address?.Match_addr || data.address?.Address || null
    } catch (e) { console.warn('Reverse geocoding failed:', e) }
    return null
}

const restSuggest = async (geocoderUrl: string, text: string, location?: any): Promise<Array<{ text: string }>> => {
    try {
        const params = new URLSearchParams({ f: 'json', text, maxSuggestions: '5' })
        if (location) params.set('location', JSON.stringify({ x: location.x, y: location.y }))
        const resp = await fetch(`${geocoderUrl}/suggest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        })
        const data = await resp.json()
        return data.suggestions ?? []
    } catch (e) { console.warn('Suggest failed:', e) }
    return []
}

// =====================================================
// WCAG 2.1 PDF ACCESSIBILITY CONFIGURATION
// These defaults ensure PDF exports meet accessibility standards
// =====================================================
const PDF_ACCESSIBILITY_DEFAULTS = {
    // Document metadata (WCAG 2.4.2 Page Titled)
    documentLanguage: 'en-US',
    documentAuthor: 'GIS Division',
    documentCreator: 'Property Report Widget',

    // Alt text settings (WCAG 1.1.1 Non-text Content)
    includeMapAltText: true,
    includeLogoAltText: true,
    mapAltTextTemplate: 'Map showing the location of {address}',
    logoAltTextTemplate: 'Organization logo',
    chartAltTextTemplate: 'Chart showing {chartType} visualization of {dataDescription}',

    // Table accessibility (WCAG 1.3.1 Info and Relationships)
    includeTableSummaries: true,
    tableSummaryTemplate: 'Data table: {layerTitle} - {recordCount} records, {columnCount} columns',

    // Related table accessibility (WCAG 1.3.1) - NEW
    includeRelatedTableSummaries: true,
    relatedTableSummaryTemplate: 'Related data: {tableName} - {recordCount} records, {columnCount} columns',

    // Font accessibility (WCAG 1.4.4 Resize Text)
    minimumFontSize: 9,

    // Link accessibility (WCAG 2.4.4 Link Purpose)
    showFullUrls: false, // Option to append URLs for print accessibility

    // Reading order (WCAG 1.3.2 Meaningful Sequence)
    includeReadingOrderMarkers: true,

    // Table of Contents (WCAG 2.4.5 Multiple Ways) - NEW
    tocTitle: 'Table of Contents'
}

// =====================================================
// ACCESSIBILITY: Updated Design System with WCAG AA Compliant Colors
// Minimum 4.5:1 contrast ratio for normal text
// Minimum 3:1 contrast ratio for large text and UI components
// =====================================================
const theme = {
    // Links and accents - meets 4.5:1 on white
    link: '#0056B3',
    linkHover: '#003D80',

    // Neutrals
    white: '#FFFFFF',
    bg: '#FFFFFF',
    bgAlt: '#F5F5F5',
    border: '#CCCCCC',
    borderLight: '#E0E0E0',

    // Text - all meet 4.5:1 contrast on white background
    textPrimary: '#1A1A1A',
    textSecondary: '#4A4A4A',
    textMuted: '#595959', // Updated from #888888 to meet 4.5:1 contrast

    // Section header - meets 3:1 for large text
    sectionHeader: '#1A6B7C',
    sectionHeaderBg: '#E8F4F8',

    // Status - meets 4.5:1 on respective backgrounds
    error: '#B81C1C',
    errorBg: '#FFF5F5',

    // Focus state - high visibility
    focus: '#0056B3',
    focusOutline: '#0056B3',

    // Chart colors - accessible palette
    chart: ['#1A6B7C', '#2E7D32', '#C2410C', '#6B21A8', '#0369A1', '#B91C1C', '#15803D', '#7C3AED']
}

const CHART_COLORS = theme.chart

// =====================================================
// UTILITY: Click protection handlers
// Prevents scroll wheel from triggering click events on Windows
// Some mice/drivers can trigger click events during scroll wheel use
// =====================================================

// Prevent non-left-click from triggering actions
const handleProtectedClick = (handler: () => void) => (e: React.MouseEvent) => {
    // Only respond to primary (left) mouse button
    if (e.button !== 0) {
        e.preventDefault()
        e.stopPropagation()
        return
    }
    handler()
}

// Prevent mousedown from non-primary buttons (blocks click before it fires)
const handleProtectedMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) {
        e.preventDefault()
        e.stopPropagation()
    }
}

// Prevent aux click (middle mouse button)
const handlePreventAuxClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
}

// Prevent wheel events from accidentally triggering click-like behavior
// Some Windows mice can trigger spurious events during scroll
const handlePreventWheelClick = (e: React.WheelEvent) => {
    // Stop propagation to prevent any parent handlers from treating this as interaction
    e.stopPropagation()
}

// Wrapper for TanStack sorting handler to filter non-left clicks
const wrapSortHandler = (handler: ((event: unknown) => void) | undefined) => {
    if (!handler) return undefined
    return (e: React.MouseEvent) => {
        if (e.button !== 0) {
            e.preventDefault()
            e.stopPropagation()
            return
        }
        handler(e)
    }
}

// =====================================================
// ACCESSIBILITY: Enhanced Styles with Focus Management
// Font sizes use rem units for WCAG 1.4.4 (Resize Text)
// Base: 16px = 1rem, so 13px = 0.8125rem, 14px = 0.875rem, etc.
// =====================================================
const getStyles = (themeColors: { primary: string; primaryDark: string; primaryLight: string }) => css`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: ${theme.white};
    font-size: 0.8125rem; /* 13px base font */
    line-height: 1.5;
    color: ${theme.textPrimary};
    overflow: hidden;
    /* Ensure widget fills its parent container */
    flex: 1 1 auto;
    min-height: 0;
    /* Required for absolute-positioned separate-pane to fill widget correctly */
    position: relative;

    /* CSS Custom Properties for dynamic theming */
    --theme-primary: ${themeColors.primary};
    --theme-primary-dark: ${themeColors.primaryDark};
    --theme-primary-light: ${themeColors.primaryLight};

    * { box-sizing: border-box; }

    /* ===== ACCESSIBILITY: Skip Link ===== */
    .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        padding: 8px 16px;
        background: var(--theme-primary);
        color: white;
        text-decoration: none;
        font-weight: bold;
        z-index: 10000;
        transition: top 0.2s ease;
    }

    .skip-link:focus {
        top: 0;
        outline: 3px solid ${theme.focusOutline};
        outline-offset: 2px;
    }

    /* ===== ACCESSIBILITY: Global Focus Styles ===== */
    *:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: 2px;
    }

    *:focus:not(:focus-visible) {
        outline: none;
    }

    *:focus-visible {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: 2px;
    }

    /* ===== Screen Reader Only Content ===== */
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    /* ===== Search Header ===== */
    .search-header {
        background: ${theme.white};
        padding: 10px 15px;
        border-bottom: 1px solid ${theme.border};
    }

    .search-row {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .search-input-container {
        flex: 1;
        position: relative;
    }

    .search-input {
        width: 100%;
        height: 34px;
        padding: 0 32px 0 12px;
        border: 1px solid ${theme.border};
        font-size: 0.875rem;
        color: ${theme.textPrimary};
        background: ${theme.white};
    }

    .search-input:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: -1px;
        border-color: ${theme.focus};
    }

    .search-input[aria-invalid="true"] {
        border-color: ${theme.error};
        background: ${theme.errorBg};
    }

    .search-input[aria-invalid="true"]:focus {
        outline-color: ${theme.error};
        border-color: ${theme.error};
    }

    .search-input::placeholder {
        color: ${theme.textMuted};
    }

    .search-clear-btn {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 24px;
        border: none;
        background: transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        color: ${theme.textSecondary};
        border-radius: 50%;
        transition: all 0.15s ease;
    }

    .search-clear-btn:hover {
        background: ${theme.bgAlt};
        color: ${theme.textPrimary};
    }

    .search-clear-btn:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: 1px;
    }

    .search-clear-btn svg {
        width: 14px;
        height: 14px;
    }

    .search-btn {
        height: 34px;
        padding: 0 20px;
        background: var(--theme-primary);
        color: white;
        border: none;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .search-btn:hover:not(:disabled) { 
        background: var(--theme-primary-dark);
    }

    .search-btn:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: 2px;
    }
    
    .search-btn:disabled { 
        opacity: 0.6; 
        cursor: not-allowed; 
    }

    .select-location-btn {
        height: 34px;
        width: 34px;
        padding: 0;
        background: ${theme.white};
        border: 1px solid ${theme.border};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${theme.textSecondary};
        transition: all 0.15s ease;
    }

    .select-location-btn:hover:not(.active) {
        background: ${theme.bgAlt};
        color: ${theme.textPrimary};
        border-color: ${theme.textMuted};
    }

    .select-location-btn:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: 2px;
    }

    .select-location-btn.active {
        background: var(--theme-primary);
        border-color: var(--theme-primary);
        color: white;
    }

    .select-location-btn.active:hover {
        background: #145663;
    }

    .select-location-btn svg {
        width: 18px;
        height: 18px;
    }

    /* Current location button specific styles */
    .current-location-btn.active {
        background: #4285F4;
        border-color: #4285F4;
        color: white;
    }

    .current-location-btn.active:hover {
        background: #3367D6;
    }

    .current-location-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    /* ===== ACCESSIBILITY: Enhanced Suggestions Dropdown ===== */
    .suggestions-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: ${theme.white};
        border: 1px solid ${theme.border};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        max-height: 300px;
        overflow-y: auto;
    }

    .suggestion-group {
        padding: 6px 12px;
        background: ${theme.bgAlt};
        font-size: 0.6875rem;
        font-weight: bold;
        color: ${theme.textMuted};
        text-transform: uppercase;
        border-bottom: 1px solid ${theme.border};
    }

    .suggestion-item {
        padding: 10px 12px;
        cursor: pointer;
        border-bottom: 1px solid ${theme.borderLight};
    }

    .suggestion-item:hover,
    .suggestion-item.highlighted {
        background: ${theme.sectionHeaderBg};
    }

    .suggestion-item:focus {
        outline: none;
        background: ${theme.sectionHeaderBg};
        box-shadow: inset 0 0 0 2px ${theme.focusOutline};
    }

    .suggestion-item[aria-selected="true"] {
        background: ${theme.sectionHeaderBg};
    }

    .suggestion-item:last-child { border-bottom: none; }

    .suggestion-text {
        font-size: 0.875rem;
        color: ${theme.textPrimary};
    }

    .suggestion-subtext {
        font-size: 0.75rem;
        color: ${theme.textMuted};
        margin-top: 2px;
    }

    /* ===== Results Container ===== */
    .results-container {
        flex: 1 1 0%;
        overflow-y: auto;
        background: ${theme.white};
        position: relative;
        min-height: 100px;
        padding-bottom: 20px;
    }

    /* Ensure last section doesn't get cut off */
    .results-container > *:last-child {
        margin-bottom: 0;
    }

    /* ===== Address Header ===== */
    .address-header {
        padding: 15px 20px;
        border-bottom: 1px solid ${theme.border};
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        position: sticky;
        top: 0;
        background: ${theme.white};
        z-index: 10;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0);
        transition: box-shadow 0.2s ease;
        gap: 12px;
    }

    /* Add subtle shadow when content is scrolled underneath */
    .results-container.scrolled .address-header {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .address-info {
        flex: 1;
        min-width: 0; /* Critical for text truncation in flex containers */
        overflow: hidden;
    }

    .address-title {
        font-size: 1.25rem;
        font-weight: bold;
        color: ${theme.textPrimary};
        margin: 0 0 2px 0;
        word-break: break-word;
        overflow-wrap: break-word;
        line-height: 1.3;
    }

    .address-subtitle {
        font-size: 0.8125rem;
        color: ${theme.textSecondary};
        margin: 4px 0 0 0;
        word-break: break-word;
        overflow-wrap: break-word;
    }

    .header-info-fields {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 4px;
        max-width: 100%;
    }

    .header-info-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.875rem;
        max-width: 100%;
        min-width: 0;
    }

    .header-info-label {
        color: ${theme.textSecondary};
        flex-shrink: 0;
    }

    .header-info-value {
        color: ${theme.textPrimary};
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .address-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
    }

    .action-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${theme.textSecondary};
        cursor: pointer;
        border: 1px solid ${theme.border};
        background: ${theme.white};
        border-radius: 4px;
    }

    .action-icon:hover:not(:disabled) { 
        color: ${theme.textPrimary}; 
        background: ${theme.bgAlt};
    }

    .action-icon:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: 2px;
    }

    .action-icon:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* ===== ACCESSIBILITY: Collapsible Section Headers ===== */
    .pm-section {
        border-bottom: 1px solid ${theme.border};
    }

    .pm-section:last-of-type {
        border-bottom: none;
        margin-bottom: 0;
    }

    .pm-section-header {
        padding: 12px 20px;
        background: ${theme.sectionHeaderBg};
        border-bottom: 1px solid ${theme.border};
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .pm-section-header:hover {
        background: #DCF0F5;
    }

    .pm-section-header:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: -2px;
    }

    .pm-section-title {
        font-size: 0.875rem;
        font-weight: bold;
        color: var(--theme-primary);
        margin: 0;
        text-transform: uppercase;
    }

    .pm-section-toggle {
        color: ${theme.textSecondary};
        font-size: 0.625rem;
        transition: transform 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
    }

    .pm-section-toggle.open { transform: rotate(180deg); }

    .pm-section-body {
        display: none;
        padding: 0;
    }

    .pm-section-body.open { display: block; }

    /* ===== Subsection Header ===== */
    .subsection-header {
        padding: 12px 20px 8px;
        font-size: 0.8125rem;
        font-weight: bold;
        color: ${theme.textPrimary};
        background: ${theme.white};
        border-bottom: 1px solid ${theme.borderLight};
    }

    .subsection-group {
        margin-bottom: 0;
    }

    .subsection-group + .subsection-group {
        border-top: 1px solid ${theme.border};
    }

    /* ===== Action Button ===== */
    .action-button {
        display: inline-block;
        margin: 12px 20px;
        padding: 8px 16px;
        background: ${theme.white};
        border: 1px solid ${theme.border};
        color: ${theme.textPrimary};
        font-size: 0.8125rem;
        cursor: pointer;
        text-decoration: none;
    }

    .action-button:hover {
        background: ${theme.bgAlt};
        border-color: ${theme.textMuted};
    }

    .action-button:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: 2px;
    }

    /* ===== Info Text ===== */
    .info-text {
        padding: 12px 20px;
        font-size: 0.75rem;
        color: ${theme.textMuted};
        line-height: 1.6;
        border-bottom: 1px solid ${theme.borderLight};
    }

    .info-text a {
        color: ${theme.link};
        text-decoration: underline;
    }

    .info-text a:hover {
        color: ${theme.linkHover};
    }

    .info-text a:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: 2px;
    }

    /* ===== Rich Text Section ===== */
    .rich-text-content {
        padding: 16px 20px;
        font-size: 0.8125rem;
        line-height: 1.7;
        color: ${theme.textPrimary};
    }

    .rich-text-content p {
        margin: 0 0 12px 0;
    }

    .rich-text-content p:last-child {
        margin-bottom: 0;
    }

    .rich-text-content a {
        color: ${theme.link};
        text-decoration: underline;
    }

    .rich-text-content a:hover {
        color: ${theme.linkHover};
    }

    .rich-text-content a:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: 2px;
    }

    .rich-text-content strong, .rich-text-content b {
        font-weight: bold;
    }

    .rich-text-content em, .rich-text-content i {
        font-style: italic;
    }

    .rich-text-content ul, .rich-text-content ol {
        margin: 0 0 12px 0;
        padding-left: 24px;
    }

    .rich-text-content li {
        margin-bottom: 4px;
    }

    .rich-text-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 0 20px 16px 20px;
    }

    .rich-text-btn {
        display: inline-block;
        padding: 10px 20px;
        font-size: 0.8125rem;
        font-weight: 500;
        text-decoration: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s ease;
        border: 1px solid ${theme.border};
    }

    .rich-text-btn:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: 2px;
    }

    .rich-text-btn-default {
        background: ${theme.white};
        color: ${theme.textPrimary};
        border-color: ${theme.border};
    }

    .rich-text-btn-default:hover {
        background: ${theme.bgAlt};
        border-color: ${theme.textMuted};
    }

    .rich-text-btn-primary {
        background: var(--theme-primary);
        color: ${theme.white};
        border-color: var(--theme-primary);
    }

    .rich-text-btn-primary:hover {
        background: var(--theme-primary-dark);
        border-color: var(--theme-primary-dark);
    }

    .rich-text-btn-outline {
        background: transparent;
        color: var(--theme-primary);
        border-color: var(--theme-primary);
    }

    .rich-text-btn-outline:hover {
        background: ${theme.sectionHeaderBg};
    }

    /* ===== Data Row (Key-Value) ===== */
    .data-row {
        display: flex;
        padding: 8px 20px;
        border-bottom: 1px solid ${theme.borderLight};
        min-height: 36px;
        align-items: center;
    }

    .data-row:last-child { border-bottom: none; }

    .data-label {
        width: 140px;
        flex-shrink: 0;
        font-weight: bold;
        color: ${theme.textSecondary};
        font-size: 0.8125rem;
        line-height: 1.4;
        margin: 0;
        padding: 0;
    }

    .data-value {
        flex: 1;
        color: ${theme.textPrimary};
        font-size: 0.8125rem;
        line-height: 1.4;
        margin: 0;
        padding: 0;
    }

    /* Reset dl/dt/dd browser defaults */
    dl {
        margin: 0;
        padding: 0;
    }

    dt, dd {
        margin: 0;
        padding: 0;
    }

    .data-value a, .data-link {
        color: ${theme.link};
        text-decoration: underline;
        cursor: pointer;
    }

    .data-value a:hover, .data-link:hover {
        color: ${theme.linkHover};
    }

    .data-value a:focus, .data-link:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: 2px;
    }

    /* ===== Layer Subsection ===== */
    .layer-subsection {
        border-top: 1px solid ${theme.border};
    }

    .layer-subsection:first-child { border-top: none; }

    .layer-header {
        padding: 10px 20px;
        background: ${theme.bgAlt};
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid ${theme.borderLight};
    }

    .layer-header:hover { background: #EBEBEB; }

    .layer-header:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: -2px;
    }

    .layer-header-left {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .layer-header-right {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .layer-toggle {
        color: ${theme.textMuted};
        font-size: 0.625rem;
        transition: transform 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
    }

    .layer-toggle.open { transform: rotate(180deg); }

    .layer-title {
        font-size: 0.8125rem;
        font-weight: bold;
        color: ${theme.textPrimary};
        line-height: 1.4;
    }

    .layer-count {
        font-size: 0.8125rem;
        color: ${theme.textMuted};
        line-height: 1.4;
    }

    .layer-body {
        display: none;
    }

    .layer-body.open { display: block; }

    /* ===== Simple Table ===== */
    .simple-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.75rem;
    }

    .simple-table th {
        text-align: left;
        padding: 8px 12px;
        background: ${theme.bgAlt};
        font-weight: bold;
        color: ${theme.textSecondary};
        border-bottom: 2px solid ${theme.border};
        font-size: 0.6875rem;
    }

    .simple-table td {
        padding: 8px 12px;
        border-bottom: 1px solid ${theme.borderLight};
        color: ${theme.textPrimary};
    }

    .simple-table tr:hover td { background: ${theme.bgAlt}; }

    /* ===== ACCESSIBILITY: Enhanced Table (TanStack) ===== */
    .table-filter-row {
        display: flex;
        gap: 8px;
        padding: 8px 12px;
        background: ${theme.bgAlt};
        border-bottom: 1px solid ${theme.border};
    }

    .table-filter-input {
        flex: 1;
        padding: 6px 10px;
        border: 1px solid ${theme.border};
        border-radius: 3px;
        font-size: 0.75rem;
        min-width: 0;
    }

    .table-filter-input:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: -1px;
        border-color: ${theme.focus};
    }

    .table-wrapper {
        overflow-x: auto;
    }

    .table-wrapper.sticky-header {
        max-height: 400px;
        overflow-y: auto;
    }

    /* Override max-height when table is inside separate pane */
    .separate-pane-content .table-wrapper.sticky-header {
        max-height: none;
        overflow: visible;
    }

    /* Disable sticky header inside separate pane since parent scrolls */
    .separate-pane-content .table-wrapper.sticky-header thead {
        position: static;
    }

    /* Override all collapsible body max-heights inside separate pane */
    .separate-pane-content .nearby-body.open,
    .separate-pane-content .nearby-separate-body.open {
        max-height: none;
    }

    .table-wrapper.sticky-header thead {
        position: sticky;
        top: 0;
        z-index: 1;
    }

    .enhanced-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.75rem;
    }

    .enhanced-table caption {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    .enhanced-table th {
        text-align: left;
        padding: 10px 12px;
        background: ${theme.bgAlt};
        font-weight: 600;
        color: ${theme.textSecondary};
        border-bottom: 2px solid ${theme.border};
        font-size: 0.6875rem;
        white-space: nowrap;
    }

    .enhanced-table th.sortable {
        cursor: pointer;
        user-select: none;
    }

    .enhanced-table th.sortable:hover {
        background: ${theme.border};
    }

    .enhanced-table th.sortable:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: -2px;
    }

    .enhanced-table .th-content {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .enhanced-table .sort-indicator {
        font-size: 0.625rem;
        color: ${theme.link};
    }

    .enhanced-table td {
        padding: 8px 12px;
        border-bottom: 1px solid ${theme.borderLight};
        color: ${theme.textPrimary};
    }

    .enhanced-table.striped tbody tr:nth-child(even) td {
        background: ${theme.bgAlt};
    }

    .enhanced-table tbody tr.hover-highlight:hover td {
        background: #E8F4F8 !important;
    }

    /* Interactive rows - highlight/zoom enabled */
    .enhanced-table tbody tr.interactive-row {
        transition: background-color 0.15s ease;
        cursor: pointer;
    }

    .enhanced-table tbody tr.interactive-row:hover td {
        background: #FFF3E0 !important;
    }

    .enhanced-table tbody tr.interactive-row:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: -2px;
    }

    .enhanced-table tbody tr.interactive-row:focus td {
        background: #FFF3E0 !important;
    }

    .enhanced-table tbody tr.interactive-row.hover-highlight:hover td {
        background: #FFF3E0 !important;
    }

    /* Row zoom button in layer header */
    .row-zoom-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        margin-left: auto;
        padding: 0;
        background: ${theme.white};
        border: 1px solid ${theme.border};
        border-radius: 4px;
        color: var(--theme-primary);
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .row-zoom-btn:hover {
        background: var(--theme-primary);
        color: ${theme.white};
        border-color: var(--theme-primary);
    }

    .row-zoom-btn:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: 2px;
    }

    .enhanced-table.compact th,
    .enhanced-table.compact td {
        padding: 4px 8px;
    }

    .enhanced-table td a {
        color: ${theme.link};
        text-decoration: underline;
    }

    .enhanced-table td a:hover {
        color: ${theme.linkHover};
    }

    .enhanced-table td a:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: 2px;
    }

    /* ===== Column Resize Handles ===== */
    .enhanced-table th.resizable {
        position: relative;
    }

    .enhanced-table .resize-handle {
        position: absolute;
        top: 0;
        right: 0;
        width: 8px;
        height: 100%;
        cursor: col-resize;
        background: transparent;
        z-index: 1;
        transition: background-color 0.15s ease;
        touch-action: none;
        user-select: none;
    }

    .enhanced-table .resize-handle:hover,
    .enhanced-table .resize-handle:focus,
    .enhanced-table .resize-handle.resizing {
        background: ${theme.link};
        outline: none;
    }

    .enhanced-table .resize-handle:focus-visible {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: 0;
    }

    .enhanced-table .resize-handle::after {
        content: '';
        position: absolute;
        top: 25%;
        right: 3px;
        width: 2px;
        height: 50%;
        background: ${theme.border};
        border-radius: 1px;
    }

    .enhanced-table .resize-handle:hover::after,
    .enhanced-table .resize-handle:focus::after,
    .enhanced-table .resize-handle.resizing::after {
        background: ${theme.white};
    }

    /* ===== ACCESSIBILITY: Pagination Controls ===== */
    .table-pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 12px;
        background: ${theme.bgAlt};
        border-top: 1px solid ${theme.border};
        font-size: 0.75rem;
    }

    .pagination-info {
        color: ${theme.textSecondary};
    }

    .pagination-controls {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .pagination-btn {
        padding: 6px 10px;
        border: 1px solid ${theme.border};
        background: ${theme.white};
        cursor: pointer;
        font-size: 0.75rem;
        border-radius: 3px;
        color: ${theme.textSecondary};
        min-width: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .pagination-btn:hover:not(:disabled) {
        background: ${theme.bgAlt};
        border-color: ${theme.textMuted};
    }

    .pagination-btn:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: 2px;
    }

    .pagination-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .pagination-page {
        padding: 0 8px;
        color: ${theme.textSecondary};
    }

    /* ===== Charts ===== */
    .charts-container {
        padding: 15px 20px;
        background: ${theme.bgAlt};
        border-bottom: 1px solid ${theme.border};
    }

    .charts-row {
        display: flex;
        gap: 20px;
    }

    .chart-box {
        flex: 1;
        background: ${theme.white};
        border: 1px solid ${theme.border};
        padding: 12px;
    }

    .chart-title {
        font-size: 0.6875rem;
        font-weight: bold;
        color: ${theme.textMuted};
        margin-bottom: 10px;
        text-transform: uppercase;
    }

    .chart-container { 
        height: 150px;
        font-family: inherit;
    }

    .chart-description {
        background: ${theme.white};
        border: 1px solid ${theme.border};
        border-radius: 4px;
        padding: 12px 15px;
        margin: 8px 0;
        font-size: 0.8125rem;
        line-height: 1.5;
        color: ${theme.textPrimary};
    }

    .chart-description a {
        color: var(--theme-primary);
        text-decoration: underline;
    }

    .chart-description a:hover {
        text-decoration: none;
    }

    /* ===== Property Preview ===== */
    .property-preview {
        background: ${theme.white};
        border: 1px solid ${theme.border};
        border-radius: 6px;
        margin: 0 15px 15px;
        overflow: hidden;
    }

    .property-preview-map {
        width: 100%;
        background: ${theme.bgAlt};
        position: relative;
    }

    .property-preview-content {
        padding: 12px;
    }

    .property-preview-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;
        gap: 10px;
        flex-wrap: wrap;
    }

    .property-preview-title {
        font-size: 1rem;
        font-weight: 600;
        color: ${theme.textPrimary};
        line-height: 1.3;
        word-break: break-word;
        overflow-wrap: break-word;
        min-width: 0;
        flex: 1;
    }

    .property-preview-subtitle {
        font-size: 0.75rem;
        color: ${theme.textMuted};
        margin-top: 2px;
    }

    .property-preview-actions {
        display: flex;
        gap: 6px;
    }

    .property-preview-btn {
        padding: 6px 10px;
        font-size: 0.6875rem;
        border: 1px solid ${theme.border};
        background: ${theme.white};
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        color: ${theme.textSecondary};
        transition: all 0.15s ease;
    }

    .property-preview-btn:hover {
        background: ${theme.bgAlt};
        border-color: var(--theme-primary);
        color: var(--theme-primary);
    }

    .property-preview-attributes {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
    }

    .property-preview-attributes.horizontal {
        flex-direction: row;
    }

    .property-preview-attributes.vertical {
        flex-direction: column;
    }

    .property-preview-attributes.grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    }

    .property-attr-item {
        flex: 0 0 auto;
    }

    .property-attr-label {
        font-size: 0.625rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: ${theme.textMuted};
        margin-bottom: 2px;
    }

    .property-attr-value {
        font-size: 0.8125rem;
        font-weight: 500;
        color: ${theme.textPrimary};
    }

    /* ===== Related Tables ===== */
    .related-table-section {
        margin-top: 12px;
        padding: 12px 0 0 0;
        border-top: 1px dashed ${theme.borderLight};
    }

    .related-table-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        padding: 8px 4px;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.15s;
    }

    .related-table-header:hover {
        background: ${theme.bgAlt};
    }

    .related-table-header:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: -2px;
    }

    .related-table-header-left {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .related-table-toggle {
        color: ${theme.textMuted};
        font-size: 0.5rem;
        transition: transform 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 14px;
        height: 14px;
    }

    .related-table-toggle.open { transform: rotate(180deg); }

    .related-table-body {
        display: none;
    }

    .related-table-body.open { display: block; }

    .related-table-title {
        font-size: 0.75rem;
        font-weight: 600;
        color: ${theme.textSecondary};
    }

    .related-table-count {
        font-size: 0.6875rem;
        color: ${theme.textMuted};
        padding: 2px 6px;
        background: ${theme.bgAlt};
        border-radius: 10px;
    }

    .related-card {
        background: ${theme.bgAlt};
        border: 1px solid ${theme.borderLight};
        border-radius: 4px;
        padding: 10px;
        margin-bottom: 8px;
    }

    .related-card:last-child {
        margin-bottom: 0;
    }

    .layer-cards .related-card {
        transition: box-shadow 0.15s ease, border-color 0.15s ease;
    }

    .layer-cards .related-card:hover {
        border-color: var(--theme-primary);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .layer-cards .related-card:focus {
        outline: 2px solid var(--theme-primary);
        outline-offset: 2px;
    }

    /* ===== Nearby Features Styles ===== */
    .nearby-section {
        margin-top: 8px;
        border-top: 1px solid ${theme.border};
    }

    .nearby-header {
        padding: 10px 20px;
        background: ${theme.bgAlt};
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid ${theme.borderLight};
        transition: background-color 0.15s ease;
    }

    .nearby-header:hover {
        background: #EBEBEB;
    }

    .nearby-header:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: -2px;
    }

    .nearby-header-left {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .nearby-title {
        font-size: 0.8125rem;
        font-weight: 600;
        color: ${theme.textPrimary};
    }

    .nearby-header-right {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .nearby-subtitle {
        font-size: 0.75rem;
        color: ${theme.textMuted};
        font-style: italic;
        padding-right: 4px;
    }

    .nearby-toggle {
        color: ${theme.textMuted};
        font-size: 0.625rem;
        transition: transform 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
    }

    .nearby-toggle.open {
        transform: rotate(180deg);
    }

    .nearby-body {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-out;
    }

    .nearby-body.open {
        max-height: 2000px;
        transition: max-height 0.3s ease-in;
    }

    .nearby-list {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .nearby-item {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 10px 20px;
        border-bottom: 1px solid ${theme.borderLight};
        gap: 12px;
        transition: background-color 0.15s ease;
    }

    .nearby-item.zoomable {
        cursor: pointer;
    }

    .nearby-item:hover {
        background: ${theme.bgAlt};
    }

    .nearby-item:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: -2px;
        background: ${theme.bgAlt};
    }

    .nearby-item:last-child {
        border-bottom: none;
    }

    .nearby-item-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
        padding-left: 8px;
        border-left: 3px solid ${theme.border};
    }

    .nearby-item-name {
        font-size: 0.8125rem;
        font-weight: 500;
        color: ${theme.textPrimary};
        text-decoration: none;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .nearby-item-name-link {
        font-size: 0.8125rem;
        font-weight: 500;
        color: ${theme.link};
        text-decoration: none;
        cursor: pointer;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .nearby-item-name-link:hover {
        color: ${theme.linkHover};
        text-decoration: underline;
    }

    .nearby-item-name-link:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: 2px;
    }

    .nearby-item-name.has-link {
        color: ${theme.link};
        cursor: pointer;
    }

    .nearby-item-name.has-link:hover {
        color: ${theme.linkHover};
        text-decoration: underline;
    }

    .nearby-item-secondary {
        font-size: 0.75rem;
        color: ${theme.textMuted};
    }

    .nearby-item-distance {
        flex-shrink: 0;
        padding: 4px 10px;
        background: ${theme.bgAlt};
        border: 1px solid ${theme.border};
        border-radius: 12px;
        font-size: 0.6875rem;
        font-weight: 600;
        color: ${theme.textSecondary};
        white-space: nowrap;
    }

    .nearby-no-results {
        padding: 12px;
        text-align: center;
        color: ${theme.textMuted};
        font-size: 0.75rem;
        font-style: italic;
    }

    .nearby-error {
        padding: 12px;
        text-align: center;
        color: ${theme.error};
        font-size: 0.75rem;
        background: ${theme.errorBg};
        border-radius: 4px;
    }

    /* ===== Separate Pane for Related Tables ===== */
    .related-table-separate-pane-trigger {
        background: ${theme.bgAlt};
        border: 1px solid ${theme.borderLight};
        border-radius: 4px;
        padding: 12px;
        text-align: center;
    }

    /* ===== Separate Pane for Sections ===== */
    .section-separate-pane-trigger {
        background: ${theme.bgAlt};
        border: 1px solid ${theme.borderLight};
        border-radius: 4px;
        padding: 16px;
        margin: 8px 12px;
        text-align: center;
    }

    /* ===== Nearby Separate Pane Triggers (individual layers) ===== */
    .nearby-separate-trigger {
        border-top: 1px solid ${theme.borderLight};
    }

    .nearby-separate-trigger:first-child {
        border-top: none;
    }

    .nearby-separate-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        cursor: pointer;
        background: ${theme.bgAlt};
        transition: background-color 0.15s ease;
    }

    .nearby-separate-header:hover {
        background: ${theme.borderLight};
    }

    .nearby-separate-header:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: -2px;
    }

    .nearby-separate-header-left {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .nearby-separate-header-right {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .nearby-separate-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: ${theme.textPrimary};
    }

    .nearby-separate-badge {
        font-size: 0.75rem;
        color: ${theme.textMuted};
        padding: 2px 8px;
        background: ${theme.white};
        border-radius: 10px;
    }

    .nearby-separate-toggle {
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: ${theme.textMuted};
        transition: transform 0.2s ease;
    }

    .nearby-separate-toggle.open {
        transform: rotate(180deg);
    }

    .nearby-separate-body {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-out;
    }

    .nearby-separate-body.open {
        max-height: 500px;
        transition: max-height 0.3s ease-in;
    }

    .nearby-separate-content {
        background: ${theme.white};
        border-top: 1px solid ${theme.borderLight};
        padding: 16px;
        text-align: center;
    }

    .nearby-separate-count {
        margin: 0 0 8px;
        font-size: 12px;
        color: ${theme.textSecondary};
    }

    .section-pane-content {
        padding: 0;
    }

    .section-pane-content .layer-subsection {
        margin: 0;
        border: none;
    }

    .section-pane-content .charts-container {
        padding: 0 0 16px;
    }

    .view-details-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: var(--theme-primary);
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .view-details-btn:hover {
        background: var(--theme-primary-dark);
    }

    .view-details-btn:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: 2px;
    }

    /* Separate Pane Container - flex layout to fill widget */
    .separate-pane {
        flex: 1 1 auto;
        min-height: 0;
        background: ${theme.white};
        z-index: 100;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .separate-pane-header {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: ${theme.sectionHeaderBg};
        border-bottom: 1px solid ${theme.border};
    }

    .back-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        background: transparent;
        border: 1px solid ${theme.border};
        border-radius: 4px;
        font-size: 0.75rem;
        color: ${theme.textPrimary};
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .back-btn:hover {
        background: ${theme.white};
        border-color: var(--theme-primary);
        color: var(--theme-primary);
    }

    .back-btn:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: 2px;
    }

    .separate-pane-title {
        flex: 1;
    }

    .separate-pane-title h2 {
        margin: 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--theme-primary);
    }

    .separate-pane-subtitle {
        font-size: 0.6875rem;
        color: ${theme.textMuted};
        margin-top: 2px;
    }

    .separate-pane-content {
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        padding: 16px;
    }

    /* Remove horizontal scroll from nested elements - parent handles it */
    .separate-pane-content .table-wrapper {
        overflow-x: visible;
        overflow-y: visible;
    }

    /* Related table body in separate pane */
    .separate-pane-content .related-table-body > div {
        overflow-x: visible;
        overflow-y: visible;
    }

    /* ===== Footer Actions ===== */
    .actions-footer {
        padding: 15px 20px;
        background: ${theme.white};
        border-top: 1px solid ${theme.border};
        display: flex;
        gap: 10px;
    }

    .btn {
        padding: 8px 16px;
        font-size: 0.8125rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }

    .btn:focus {
        outline: 2px solid ${theme.focusOutline};
        outline-offset: 2px;
    }

    .btn-primary {
        background: var(--theme-primary);
        color: white;
        border: none;
    }

    .btn-primary:hover { background: var(--theme-primary-dark); }

    .btn-secondary {
        background: ${theme.white};
        color: ${theme.textPrimary};
        border: 1px solid ${theme.border};
    }

    .btn-secondary:hover { background: ${theme.bgAlt}; }

    /* ===== States ===== */
    .empty-state {
        padding: 40px 20px;
        text-align: center;
        color: ${theme.textSecondary};
    }

    .empty-state p {
        margin: 8px 0;
        font-size: 0.875rem;
        line-height: 1.5;
    }

    .empty-state strong {
        color: ${theme.textPrimary};
        font-size: 1rem;
    }

    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 60px;
        color: ${theme.textSecondary};
    }

    .pdf-generating-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
    }

    .pdf-generating-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        position: sticky;
        top: 50%;
        transform: translateY(-50%);
    }

    /* Lock scrolling during PDF generation */
    .results-container.generating-pdf {
        overflow-y: hidden !important;
    }

    /* ===== ACCESSIBILITY: Error Banner with Alert Role ===== */
    .error-banner {
        padding: 12px 20px;
        background: ${theme.errorBg};
        border-bottom: 1px solid #FFDDDD;
        color: ${theme.error};
        font-size: 0.8125rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .error-close {
        background: none;
        border: none;
        color: ${theme.error};
        font-size: 1.25rem;
        cursor: pointer;
        padding: 4px 8px;
        line-height: 1;
    }

    .error-close:hover {
        background: rgba(0,0,0,0.1);
    }

    .error-close:focus {
        outline: 2px solid ${theme.error};
        outline-offset: 2px;
    }

    .no-results {
        padding: 20px;
        text-align: center;
        color: ${theme.textMuted};
        font-style: italic;
        font-size: 0.8125rem;
    }

    /* ===== Scrollbar ===== */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: ${theme.bgAlt}; }
    ::-webkit-scrollbar-thumb { background: #BBB; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #999; }

    /* ===== ACCESSIBILITY: High Contrast Mode Support ===== */
    @media (prefers-contrast: high) {
        .search-input,
        .table-filter-input,
        .pagination-btn,
        .action-icon,
        .select-location-btn {
            border-width: 2px;
        }

        *:focus,
        *:focus-visible {
            outline-width: 3px;
        }
    }

    /* ===== ACCESSIBILITY: Reduced Motion Support ===== */
    @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }

    /* ===== MOBILE RESPONSIVE STYLES ===== */
    /* Small screens and mobile devices */
    @media (max-width: 480px) {
        /* Search Header - Stack elements vertically on very small screens */
        .search-header {
            padding: 8px 10px;
        }

        .search-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: stretch;
        }

        .search-input-container {
            flex: 1 1 100%;
            order: 1;
        }

        .search-input {
            height: 40px;
            font-size: 16px; /* Prevents iOS zoom on focus */
        }

        .select-location-btn {
            order: 2;
            flex: 0 0 44px;
            height: 40px;
            width: 44px;
        }

        .search-btn {
            flex: 1 1 auto;
            order: 3;
            min-width: 0;
            height: 40px;
            padding: 0 16px;
            font-size: 0.9375rem;
        }

        /* Suggestions dropdown - larger items for touch */
        .suggestions-dropdown {
            max-height: 250px;
        }

        .suggestion-item {
            padding: 12px;
            min-height: 48px;
        }

        .suggestion-text {
            font-size: 0.9375rem;
        }

        /* Address Header - Improved mobile layout */
        .address-header {
            padding: 12px 12px;
            flex-direction: row;
            flex-wrap: wrap;
            align-items: flex-start;
            gap: 8px;
        }

        .address-info {
            min-width: 0; /* Allow text truncation */
            flex: 1 1 calc(100% - 80px); /* Leave room for action buttons */
            order: 1;
        }

        .address-title {
            font-size: 1rem;
            word-break: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
            line-height: 1.3;
            padding-right: 5px;
        }

        .address-subtitle {
            font-size: 0.75rem;
            word-break: break-all;
        }

        .header-info-fields {
            gap: 6px 10px;
            margin-top: 6px;
        }

        .header-info-item {
            font-size: 0.8125rem;
            flex: 0 0 auto;
            max-width: 100%;
        }

        .header-info-label,
        .header-info-value {
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .address-actions {
            flex-shrink: 0;
            order: 2;
        }

        .action-icon {
            width: 28px;
            height: 28px;
        }

        .action-icon svg {
            width: 16px;
            height: 16px;
        }

        /* Section Headers */
        .pm-section-header {
            padding: 10px 12px;
        }

        .pm-section-title {
            font-size: 0.8125rem;
        }

        /* Layer Headers */
        .layer-header {
            padding: 8px 12px;
        }

        /* Table Improvements */
        .table-wrapper {
            font-size: 0.75rem;
        }

        .table-controls {
            padding: 6px 10px;
            flex-direction: column;
            gap: 6px;
        }

        .table-filter-input {
            width: 100%;
        }

        .pagination-controls {
            justify-content: center;
            width: 100%;
        }

        /* Property Preview */
        .property-preview-header {
            padding: 10px 12px;
            flex-direction: column;
            gap: 8px;
        }

        .property-preview-content {
            padding: 10px 12px;
        }

        .property-preview-fields {
            gap: 6px;
        }

        /* Nearby sections */
        .nearby-section {
            margin: 0 8px;
        }

        .nearby-header {
            padding: 8px 10px;
        }

        .nearby-item {
            padding: 8px 10px;
        }

        /* Separate Pane */
        .separate-pane-header {
            padding: 10px 12px;
        }

        .separate-pane-content {
            padding: 0 8px;
        }

        /* Empty state - reduced padding on mobile */
        .empty-state {
            padding: 30px 15px;
        }

        .empty-state p {
            font-size: 0.8125rem;
        }

        /* Error banner - better wrapping and tap target */
        .error-banner {
            padding: 10px 12px;
            gap: 8px;
        }

        .error-banner span {
            flex: 1;
            line-height: 1.4;
        }

        .error-close {
            min-width: 32px;
            min-height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    /* Medium screens - tablets and small laptops */
    @media (max-width: 768px) and (min-width: 481px) {
        .address-header {
            padding: 12px 15px;
        }

        .address-title {
            font-size: 1.125rem;
            word-break: break-word;
            overflow-wrap: break-word;
        }

        .header-info-fields {
            gap: 8px 12px;
        }

        .header-info-item {
            font-size: 0.8125rem;
        }

        .pm-section-header {
            padding: 10px 15px;
        }

        .layer-header {
            padding: 8px 15px;
        }
    }

    /* Touch device optimizations */
    @media (hover: none) and (pointer: coarse) {
        /* Larger touch targets (WCAG 2.5.5 - Target Size) */
        .action-icon {
            min-width: 44px;
            min-height: 44px;
        }

        .pm-section-header,
        .layer-header,
        .nearby-header,
        .related-table-header {
            min-height: 44px;
        }

        .suggestion-item {
            padding: 12px;
            min-height: 44px;
        }

        .pagination-btn {
            min-width: 36px;
            min-height: 36px;
        }

        /* Improve tap feedback */
        .search-btn:active,
        .select-location-btn:active,
        .action-icon:active {
            opacity: 0.7;
        }
    }

    /* Landscape mobile - prevent header from taking too much space */
    @media (max-height: 500px) and (orientation: landscape) {
        .address-header {
            padding: 8px 12px;
            position: relative; /* Remove sticky on landscape mobile */
        }

        .address-title {
            font-size: 0.9375rem;
        }

        .header-info-fields {
            display: none; /* Hide extra fields in cramped landscape */
        }

        .search-header {
            padding: 6px 10px;
        }
    }
`

// Interfaces

// Domain lookup for coded value domains - maps field name to code -> description
type DomainLookup = Record<string, Record<string | number, string>>

interface RelatedTableResult {
    tableConfig: RelatedTableConfig
    records: any[]
    error?: string
    domainLookup?: DomainLookup  // Domain descriptions for coded value fields
}

// =====================================================
// PDF Generation Interfaces - NEW
// =====================================================

// Hierarchical bookmark structure for PDF navigation (WCAG 2.4.5)
interface PdfBookmark {
    title: string
    page: number
    y: number
    level: number  // 0 = section, 1 = layer, 2 = related table
    parentId?: string  // Parent bookmark ID for hierarchy
    id: string
}

// Table of Contents entry
interface TocEntry {
    title: string
    page: number
    level: number  // Indentation level
    type: 'section' | 'layer' | 'relatedTable' | 'chart'
}

// Related table chart capture data
interface RelatedTableChartCapture {
    tableId: string
    tableName: string
    imageData: string
    width: number
    height: number
}
interface LayerResult {
    layerConfig: LayerConfig
    features: any[]
    relatedData?: RelatedTableResult[]
    domainLookup?: DomainLookup  // Domain descriptions for coded value fields
}

// Nearby feature for section-level nearby layers
interface NearbyFeature {
    title: string
    subtitle?: string
    distance: number
    distanceFormatted: string
    linkUrl?: string
    geometry?: any
    attributes: Record<string, any>
}

// Nearby result for a layer in nearby display mode
interface NearbyResult {
    layerConfig: LayerConfig          // The layer this nearby result is for
    nearbyConfig: NearbyDisplayConfig // The nearby display settings
    features: NearbyFeature[]
    error?: string
}

interface SectionResult {
    sectionConfig: SectionConfig
    layerResults: LayerResult[]
    totalFeatures: number
    chartData?: any[]
    nearbyResults?: NearbyResult[]  // Nearby features for layers with nearby mode enabled
}
interface SearchSuggestion {
    text: string
    subtext?: string
    point?: Point
    geometry?: any
    sourceName: string
    sourceType: 'geocoder' | 'layer' | 'url'
    sourceId?: string
    highlightEnabled?: boolean
    highlightColor?: string
}
interface GroupedSuggestions { sourceName: string; sourceType: 'geocoder' | 'layer' | 'url'; suggestions: SearchSuggestion[] }

// Utilities
const getCoordinates = (point: Point | null): { lat: number | null, lng: number | null } => {
    if (!point) return { lat: null, lng: null }
    if (point.latitude != null && point.longitude != null) return { lat: point.latitude, lng: point.longitude }
    if (point.spatialReference?.isGeographic && point.x != null && point.y != null) return { lat: point.y, lng: point.x }
    if (point.x != null && point.y != null) return { lat: point.y, lng: point.x }
    return { lat: null, lng: null }
}

const formatCoordinates = (point: Point | null): string => {
    const coords = getCoordinates(point)
    if (coords.lat == null || coords.lng == null) return 'N/A'
    return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
}

const toMutable = <T,>(obj: any): T[] => {
    if (!obj) return []
    if (typeof obj.asMutable === 'function') return obj.asMutable({ deep: true })
    return [...obj]
}

// Normalize field configs: XML import may produce 'n' instead of 'name'
// This ensures the runtime always has 'name' regardless of config source
const normalizeFields = (fields: any[]): any[] => {
    if (!fields || !Array.isArray(fields)) return fields
    return fields.map(f => {
        if (f && typeof f === 'object' && (f as any).n !== undefined && f.name === undefined) {
            const { n, ...rest } = f
            return { name: n, ...rest }
        }
        return f
    })
}

const toPlainObject = <T,>(obj: any): T | undefined => {
    if (!obj) return undefined
    if (typeof obj.asMutable === 'function') return obj.asMutable({ deep: true }) as T
    if (typeof obj === 'object') return { ...obj } as T
    return obj as T
}

const mergeChartConfig = (defaultConfig: any, sectionConfig: any, chartType: string): ChartConfig => {
    const base = toPlainObject<ChartConfig>(defaultConfig) || {}
    const section = toPlainObject<ChartConfig>(sectionConfig) || {}
    return {
        ...base,
        ...section,
        chartType: chartType as any,
        colorScheme: section.colorScheme ? toMutable<string>(section.colorScheme) :
            base.colorScheme ? toMutable<string>(base.colorScheme) : undefined
    }
}

const mergeTableConfig = (defaultConfig: any, sectionConfig: any): TableDisplayConfig => {
    const base = toPlainObject<TableDisplayConfig>(defaultConfig) || {}
    const section = toPlainObject<TableDisplayConfig>(sectionConfig) || {}
    return {
        ...base,
        ...section,
        pageSizeOptions: section.pageSizeOptions ? toMutable<number>(section.pageSizeOptions) :
            base.pageSizeOptions ? toMutable<number>(base.pageSizeOptions) : undefined
    }
}

const hexToRgb = (hex: string): number[] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [26, 107, 124]
}

const formatFieldValue = (val: any, fieldConfig?: FieldConfig): string => {
    if (val == null || val === '') return '—'

    const format = fieldConfig?.format
    const fieldName = fieldConfig?.name || ''
    let result: string

    const prefix = format?.prefix || ''
    const suffix = format?.suffix || ''
    const formatType = format?.type || 'auto'

    if (formatType === 'number' || (formatType === 'auto' && typeof val === 'number')) {
        const num = typeof val === 'number' ? val : parseFloat(val)
        if (isNaN(num)) {
            result = String(val)
        } else {
            const numberFormat = format?.numberFormat || 'default'
            const useGrouping = format?.useGrouping !== false
            const decimalPlaces = format?.decimalPlaces

            switch (numberFormat) {
                case 'none':
                    result = decimalPlaces !== undefined
                        ? num.toFixed(decimalPlaces)
                        : String(num)
                    break
                case 'currency':
                    result = '$' + num.toLocaleString('en-US', {
                        minimumFractionDigits: decimalPlaces ?? 2,
                        maximumFractionDigits: decimalPlaces ?? 2,
                        useGrouping
                    })
                    break
                case 'percent':
                    result = num.toLocaleString('en-US', {
                        minimumFractionDigits: decimalPlaces ?? 0,
                        maximumFractionDigits: decimalPlaces ?? 2,
                        useGrouping
                    }) + '%'
                    break
                case 'decimal':
                    result = num.toLocaleString('en-US', {
                        minimumFractionDigits: decimalPlaces ?? 2,
                        maximumFractionDigits: decimalPlaces ?? 2,
                        useGrouping
                    })
                    break
                default:
                    if (fieldName && /price|value|cost|tax|amount|fee/i.test(fieldName)) {
                        result = '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping })
                    } else {
                        result = useGrouping ? num.toLocaleString() : String(num)
                    }
            }
        }
    } else if (formatType === 'date' || (formatType === 'auto' && (val instanceof Date || (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val))))) {
        const date = val instanceof Date ? val : new Date(val)
        if (isNaN(date.getTime())) {
            result = String(val)
        } else {
            const dateFormat = format?.dateFormat || 'default'
            switch (dateFormat) {
                case 'short':
                    result = date.toLocaleDateString('en-US', { year: '2-digit', month: 'numeric', day: 'numeric' })
                    break
                case 'medium':
                    result = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    break
                case 'long':
                    result = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    break
                case 'year-only':
                    result = String(date.getFullYear())
                    break
                default:
                    result = date.toLocaleDateString()
            }
        }
    } else if (formatType === 'text' || formatType === 'auto') {
        result = String(val)
        const textFormat = format?.textFormat || 'default'
        switch (textFormat) {
            case 'uppercase':
                result = result.toUpperCase()
                break
            case 'lowercase':
                result = result.toLowerCase()
                break
            case 'titlecase':
                result = result.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
                break
        }
    } else {
        result = String(val)
    }

    return prefix + result + suffix
}

// =====================================================
// Domain Lookup Helpers - for coded value domains
// =====================================================

/**
 * Extracts domain lookup from a FeatureLayer's fields.
 * Returns a mapping of field name -> code -> description
 */
const extractDomainLookup = async (layer: FeatureLayer): Promise<DomainLookup> => {
    const domainLookup: DomainLookup = {}

    try {
        // Ensure layer is loaded to access field metadata
        await layer.load()

        if (layer.fields) {
            for (const field of layer.fields) {
                // Check if field has a coded value domain
                if (field.domain && field.domain.type === 'coded-value') {
                    const codedValueDomain = field.domain as any
                    if (codedValueDomain.codedValues) {
                        domainLookup[field.name] = {}
                        for (const cv of codedValueDomain.codedValues) {
                            // Map both the code value and its string representation
                            domainLookup[field.name][cv.code] = cv.name
                            // Also map string version of code for flexibility
                            if (typeof cv.code === 'number') {
                                domainLookup[field.name][String(cv.code)] = cv.name
                            }
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.warn('Failed to extract domain lookup:', e)
    }

    return domainLookup
}

/**
 * Resolves a field value using domain lookup.
 * If the field has a coded value domain, returns the description.
 * Otherwise returns the original value.
 */
const resolveDomainValue = (
    fieldName: string,
    value: any,
    domainLookup?: DomainLookup
): any => {
    if (value == null || value === '' || !domainLookup) {
        return value
    }

    const fieldDomain = domainLookup[fieldName]
    if (fieldDomain) {
        // Try direct lookup
        if (fieldDomain[value] !== undefined) {
            return fieldDomain[value]
        }
        // Try string conversion for numeric codes
        if (typeof value === 'number' && fieldDomain[String(value)] !== undefined) {
            return fieldDomain[String(value)]
        }
    }

    return value
}

/**
 * Formats a field value, applying domain lookup first if available.
 * This is a wrapper around formatFieldValue that resolves coded domains.
 */
const formatFieldValueWithDomain = (
    val: any,
    fieldConfig?: FieldConfig,
    domainLookup?: DomainLookup
): string => {
    const fieldName = fieldConfig?.name || ''
    const resolvedValue = resolveDomainValue(fieldName, val, domainLookup)
    return formatFieldValue(resolvedValue, fieldConfig)
}

// =====================================================
// Property Preview Component - with static map rendering
// =====================================================
interface PropertyPreviewProps {
    config: PropertyPreviewConfig
    headerData?: Record<string, any>
    headerFields?: FieldConfig[]  // Field configs with aliases
    address?: string
    onZoom?: () => void
    mapView?: any | any
    queryPoint?: Point | null
}

const PropertyPreview = ({ config, headerData, headerFields, address, onZoom, mapView, queryPoint }: PropertyPreviewProps) => {
    const [copied, setCopied] = useState(false)
    const [mapImageUrl, setMapImageUrl] = useState<string | null>(null)
    const [mapError, setMapError] = useState(false)
    const [containerWidth, setContainerWidth] = useState(400)
    const mapContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (mapContainerRef.current) {
            const width = mapContainerRef.current.offsetWidth
            if (width > 0) setContainerWidth(width)
        }
    }, [])

    useEffect(() => {
        if (!queryPoint || config.showMapPreview === false) { setMapImageUrl(null); return }
        const generateMapPreview = async () => {
            try {
                setMapError(false)
                let lon: number | undefined
                let lat: number | undefined
                const srcWkid = queryPoint.spatialReference?.wkid
                if (srcWkid === 4326) {
                    lon = queryPoint.x; lat = queryPoint.y
                } else if (typeof queryPoint.longitude === 'number' && typeof queryPoint.latitude === 'number' &&
                    !isNaN(queryPoint.longitude) && !isNaN(queryPoint.latitude) &&
                    queryPoint.latitude >= -90 && queryPoint.latitude <= 90) {
                    lon = queryPoint.longitude; lat = queryPoint.latitude
                } else if (srcWkid && projection) {
                    try {
                        const targetSR = new SpatialReference({ wkid: 4326 })
                        const projectedPoint = projection.project(queryPoint, targetSR) as Point
                        if (projectedPoint) { lon = projectedPoint.x; lat = projectedPoint.y }
                    } catch (projError) { console.warn('Map preview projection error:', projError) }
                } else if (!srcWkid && queryPoint.x >= -180 && queryPoint.x <= 180 && queryPoint.y >= -90 && queryPoint.y <= 90) {
                    lon = queryPoint.x; lat = queryPoint.y
                }
                if (lon === undefined || lat === undefined || isNaN(lon) || isNaN(lat)) { setMapError(true); return }
                if (lat < -90 || lat > 90 || lon < -180 || lon > 180) { setMapError(true); return }
                const width = mapContainerRef.current?.offsetWidth || containerWidth
                const height = config.mapPreviewHeight || 150
                const zoomLevel = config.mapPreviewZoomLevel || 18
                const centerX = lon * 20037508.34 / 180
                const centerY = Math.log(Math.tan((90 + lat) * Math.PI / 360)) * 20037508.34 / Math.PI
                const metersPerPixel = 40075016.68 / (256 * Math.pow(2, zoomLevel))
                const halfW = (width / 2) * metersPerPixel
                const halfH = (height / 2) * metersPerPixel
                const bbox = `${centerX - halfW},${centerY - halfH},${centerX + halfW},${centerY + halfH}`
                let basemapExportUrl: string = config.basemapUrl || ''
                if (!basemapExportUrl && mapView?.map?.basemap?.baseLayers?.length > 0) {
                    const baseLayer = mapView.map.basemap.baseLayers.getItemAt(0) as any
                    if (baseLayer?.url) {
                        const layerUrl = String(baseLayer.url)
                        if (layerUrl.includes('/MapServer')) basemapExportUrl = layerUrl.split('/MapServer')[0] + '/MapServer'
                        else if (layerUrl.includes('/ImageServer')) basemapExportUrl = layerUrl.split('/ImageServer')[0] + '/ImageServer'
                    }
                }
                if (!basemapExportUrl) basemapExportUrl = 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer'
                setMapImageUrl(`${basemapExportUrl}/export?bbox=${bbox}&bboxSR=3857&size=${Math.round(width)},${Math.round(height)}&imageSR=3857&format=png&f=image`)
            } catch (error) { setMapError(true) }
        }
        generateMapPreview()
    }, [queryPoint, config.showMapPreview, config.mapPreviewHeight, config.mapPreviewZoomLevel, config.basemapUrl, containerWidth, mapView])

    const handleCopy = async () => {
        if (address) {
            try { await navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000) }
            catch (err) { /* copy failed */ }
        }
    }

    const primaryFields = config.primaryFields || []
    const attributeLayout = config.attributeLayout || 'horizontal'

    const fieldAliasMap = useMemo(() => {
        const map: Record<string, string> = {}
        if (headerFields) headerFields.forEach(f => { if (f.visible !== false) map[f.name] = f.alias || f.name })
        return map
    }, [headerFields])

    const secondaryFields = useMemo(() => {
        if (config.secondaryFields && config.secondaryFields.length > 0) return config.secondaryFields
        if (headerFields && headerFields.length > 0) {
            return headerFields.filter(f => f.visible !== false).map(f => f.name)
                .filter(name => headerData && headerData[name] != null && headerData[name] !== '')
        }
        if (headerData) {
            const excludeFields = new Set(['OBJECTID', 'ObjectID', 'objectid', 'OID', 'FID', 'Shape', 'SHAPE', 'Shape_Length', 'Shape_Area', 'SHAPE_Length', 'SHAPE_Area', 'GlobalID', 'globalid', 'GLOBALID', 'CreationDate', 'Creator', 'EditDate', 'Editor', 'created_user', 'created_date', 'last_edited_user', 'last_edited_date'])
            return Object.keys(headerData).filter(key => !excludeFields.has(key) && headerData[key] != null && headerData[key] !== '')
        }
        return []
    }, [config.secondaryFields, headerFields, headerData])

    if (!config?.enabled) return null

    const primaryValue = headerData && primaryFields.length > 0 ? headerData[primaryFields[0]] : address
    const secondaryValue = headerData && primaryFields.length > 1 ? headerData[primaryFields[1]] : undefined
    const highlightColor = config.highlightColor || '#FF0000'

    return (
        <div className="property-preview" role="region" aria-label="Property Preview">
            {config.showMapPreview !== false && (
                <div ref={mapContainerRef} className="property-preview-map"
                    style={{ height: config.mapPreviewHeight || 150, position: 'relative', overflow: 'hidden' }}
                    aria-label="Property location map">
                    {mapImageUrl && !mapError ? (
                        <>
                            <img src={mapImageUrl} alt={`Map showing location of ${address || 'selected property'}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={() => setMapError(true)} />
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -100%)', zIndex: 10 }} aria-hidden="true">
                                <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z" fill={highlightColor} stroke="#FFFFFF" strokeWidth="2" />
                                    <circle cx="12" cy="12" r="4" fill="#FFFFFF" />
                                </svg>
                            </div>
                        </>
                    ) : (
                        <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${theme.bgAlt} 0%, ${theme.borderLight} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted, fontSize: '12px' }}>
                            <span>Property Location</span>
                        </div>
                    )}
                </div>
            )}
            <div className="property-preview-content">
                <div className="property-preview-header">
                    <div>
                        <div className="property-preview-title">{primaryValue || 'Property Details'}</div>
                        {secondaryValue && <div className="property-preview-subtitle">{secondaryValue}</div>}
                    </div>
                    <div className="property-preview-actions">
                        {config.showZoomButton !== false && onZoom && (
                            <button className="property-preview-btn" onClick={onZoom} title="Zoom to property" aria-label="Zoom to property on map">Zoom</button>
                        )}
                        {config.showCopyButton !== false && address && (
                            <button className="property-preview-btn" onClick={handleCopy}
                                title={copied ? 'Copied!' : 'Copy address'} aria-label={copied ? 'Address copied' : 'Copy address to clipboard'}>
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        )}
                    </div>
                </div>
                {config.showAttributes !== false && headerData && secondaryFields.length > 0 && (
                    <div className={`property-preview-attributes ${attributeLayout}`}>
                        {secondaryFields.map((fieldName: string) => {
                            const value = headerData[fieldName]
                            if (value === undefined || value === null || value === '') return null
                            return (
                                <div key={fieldName} className="property-attr-item">
                                    <div className="property-attr-label">{fieldAliasMap[fieldName] || fieldName}</div>
                                    <div className="property-attr-value">{String(value)}</div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

// =====================================================
// ACCESSIBILITY: Nearby Features Display Component
// Displays features sorted by distance in a list with distance badges
// WCAG 2.1 compliant with proper heading structure and keyboard navigation
// =====================================================
interface NearbyDisplayProps {
    nearbyResult: NearbyResult
    sourceGeometry?: any | null  // The source/searched feature geometry for combined zoom
    onHighlight?: (geometry: any | null, color?: string) => void
    onZoom?: (geometry: any, scale?: number) => void
    onZoomToBoth?: (sourceGeometry: any, nearbyGeometry: any) => void  // Zoom to show both features
}

const NearbyDisplay = ({ nearbyResult, sourceGeometry, onHighlight, onZoom, onZoomToBoth }: NearbyDisplayProps) => {
    const { layerConfig, nearbyConfig, features, error } = nearbyResult
    const layerTitle = layerConfig.layerTitle || 'Nearby'

    // Collapsible state - default to expanded (use layerConfig.expanded if available)
    const [isOpen, setIsOpen] = useState(layerConfig.expanded !== false)

    // Handle keyboard navigation for header
    const handleHeaderKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(!isOpen)
        }
    }

    // Handle empty or error states
    if (error) {
        return (
            <div className="nearby-section" role="region" aria-label={`${layerTitle} nearby features`}>
                <div
                    className="nearby-header"
                    onClick={handleProtectedClick(() => setIsOpen(!isOpen))}
                    onMouseDown={handleProtectedMouseDown}
                    onAuxClick={handlePreventAuxClick}
                    onWheel={handlePreventWheelClick}
                    onKeyDown={handleHeaderKeyDown}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isOpen}
                    title={isOpen ? `Collapse ${layerTitle}` : `Expand ${layerTitle}`}
                >
                    <div className="nearby-header-left">
                        <span className="nearby-title">{layerTitle}</span>
                    </div>
                    <div className="nearby-header-right">
                        <span className="nearby-subtitle">Nearby</span>
                        <span className={`nearby-toggle ${isOpen ? 'open' : ''}`} aria-hidden="true">▼</span>
                    </div>
                </div>
                <div className={`nearby-body ${isOpen ? 'open' : ''}`}>
                    <div className="nearby-error" role="alert" style={{ padding: '12px 20px' }}>{error}</div>
                </div>
            </div>
        )
    }

    if (!features || features.length === 0) {
        return (
            <div className="nearby-section" role="region" aria-label={`${layerTitle} nearby features`}>
                <div
                    className="nearby-header"
                    onClick={handleProtectedClick(() => setIsOpen(!isOpen))}
                    onMouseDown={handleProtectedMouseDown}
                    onAuxClick={handlePreventAuxClick}
                    onWheel={handlePreventWheelClick}
                    onKeyDown={handleHeaderKeyDown}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isOpen}
                    title={isOpen ? `Collapse ${layerTitle}` : `Expand ${layerTitle}`}
                >
                    <div className="nearby-header-left">
                        <span className="nearby-title">{layerTitle}</span>
                    </div>
                    <div className="nearby-header-right">
                        <span className="nearby-subtitle">Nearby</span>
                        <span className={`nearby-toggle ${isOpen ? 'open' : ''}`} aria-hidden="true">▼</span>
                    </div>
                </div>
                <div className={`nearby-body ${isOpen ? 'open' : ''}`}>
                    <div className="nearby-no-results">
                        No nearby {layerTitle?.toLowerCase() || 'features'} found within {nearbyConfig.searchRadius || 5} {nearbyConfig.searchRadiusUnit || 'miles'}
                    </div>
                </div>
            </div>
        )
    }

    // Use layer's row interaction settings for map highlighting/zooming
    const enableZoom = layerConfig.enableRowZoom !== false
    const enableHighlight = layerConfig.enableRowHighlight !== false
    const highlightColor = layerConfig.rowHighlightColor || '#00FFFF'
    const zoomScale = layerConfig.rowZoomScale || 2500
    const showBadge = nearbyConfig.showDistanceBadge !== false

    // Handle click on row for zoom (works regardless of link - anchor has stopPropagation)
    const handleRowClick = (feature: NearbyFeature) => {
        if (!feature.geometry) return
        // If we have source geometry and onZoomToBoth, zoom to show both features
        if (sourceGeometry && onZoomToBoth) {
            onZoomToBoth(sourceGeometry, feature.geometry)
        } else if (onZoom) {
            onZoom(feature.geometry, zoomScale)
        }
    }

    // Handle keyboard navigation for row (zoom only)
    const handleRowKeyDown = (e: React.KeyboardEvent, feature: NearbyFeature) => {
        if (e.key === 'Enter' || e.key === ' ') {
            // Only handle zoom here if no link (if there's a link, let the anchor handle Enter)
            if (!feature.linkUrl && feature.geometry) {
                e.preventDefault()
                handleRowClick(feature)
            }
        }
    }

    return (
        <div className="nearby-section" role="region" aria-label={`${layerTitle} nearby features`}>
            <div
                className="nearby-header"
                onClick={handleProtectedClick(() => setIsOpen(!isOpen))}
                onMouseDown={handleProtectedMouseDown}
                onAuxClick={handlePreventAuxClick}
                onWheel={handlePreventWheelClick}
                onKeyDown={handleHeaderKeyDown}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                title={isOpen ? `Collapse ${layerTitle}` : `Expand ${layerTitle}`}
            >
                <div className="nearby-header-left">
                    <span className="nearby-title">{layerTitle}</span>
                </div>
                <div className="nearby-header-right">
                    <span className="nearby-subtitle">Nearby</span>
                    <span className={`nearby-toggle ${isOpen ? 'open' : ''}`} aria-hidden="true">▼</span>
                </div>
            </div>
            <div className={`nearby-body ${isOpen ? 'open' : ''}`}>
                <ul
                    className="nearby-list"
                    role="list"
                    aria-label={`${features.length} nearby ${layerTitle?.toLowerCase() || 'features'}`}
                >
                    {features.map((feature, index) => {
                        const hasLink = !!feature.linkUrl
                        const hasGeometry = !!feature.geometry
                        const canZoom = hasGeometry  // Always allow zoom if geometry exists
                        const showZoomCursor = enableZoom && hasGeometry

                        return (
                            <li
                                key={index}
                                className={`nearby-item ${showZoomCursor ? 'zoomable' : ''}`}
                                role="listitem"
                                tabIndex={canZoom && !hasLink ? 0 : -1}
                                onClick={canZoom ? () => handleRowClick(feature) : undefined}
                                onKeyDown={canZoom ? (e) => handleRowKeyDown(e, feature) : undefined}
                                onMouseEnter={enableHighlight && onHighlight && feature.geometry ? () => onHighlight(feature.geometry!, highlightColor) : undefined}
                                onMouseLeave={enableHighlight && onHighlight ? () => onHighlight(null) : undefined}
                                onFocus={enableHighlight && onHighlight && feature.geometry ? () => onHighlight(feature.geometry!, highlightColor) : undefined}
                                onBlur={enableHighlight && onHighlight ? () => onHighlight(null) : undefined}
                                aria-label={canZoom && !hasLink ? `${feature.title}${feature.subtitle ? `, ${feature.subtitle}` : ''}, ${feature.distanceFormatted} away, click to zoom` : undefined}
                            >
                                <div className="nearby-item-content">
                                    {hasLink ? (
                                        <a
                                            href={feature.linkUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="nearby-item-name-link"
                                            aria-label={`${feature.title} (opens in new tab)`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {feature.title}
                                        </a>
                                    ) : (
                                        <span className="nearby-item-name">{feature.title}</span>
                                    )}
                                    {feature.subtitle && (
                                        <span className="nearby-item-secondary">{feature.subtitle}</span>
                                    )}
                                </div>
                                {showBadge && (
                                    <span
                                        className="nearby-item-distance"
                                        aria-label={`Distance: ${feature.distanceFormatted}`}
                                    >
                                        {feature.distanceFormatted}
                                    </span>
                                )}
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}

// =====================================================
// Nearby Separate Pane Trigger Component
// Shows a collapsible header with View Details button for nearby layers
// when section is configured to open in separate pane
// =====================================================
interface NearbySeparateTriggerProps {
    nearbyResult: NearbyResult
    sourceGeometry?: any | null
    parentTitle: string
    onViewDetails: () => void
    defaultOpen?: boolean
}

const NearbySeparateTrigger = ({ nearbyResult, sourceGeometry, parentTitle, onViewDetails, defaultOpen }: NearbySeparateTriggerProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen !== false)
    const layerTitle = nearbyResult.layerConfig.layerTitle || 'Nearby'
    const featureCount = nearbyResult.features?.length || 0
    const bodyId = `nearby-trigger-body-${nearbyResult.layerConfig.layerId || Math.random().toString(36).substr(2, 9)}`

    const handleHeaderKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(!isOpen)
        }
    }

    return (
        <div className="nearby-separate-trigger">
            <div
                className="nearby-separate-header"
                onClick={handleProtectedClick(() => setIsOpen(!isOpen))}
                onMouseDown={handleProtectedMouseDown}
                onAuxClick={handlePreventAuxClick}
                onWheel={handlePreventWheelClick}
                onKeyDown={handleHeaderKeyDown}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                aria-controls={bodyId}
                title={`${isOpen ? 'Collapse' : 'Expand'} ${layerTitle}`}
            >
                <div className="nearby-separate-header-left">
                    <span className="nearby-separate-title">{layerTitle}</span>
                </div>
                <div className="nearby-separate-header-right">
                    <span className="nearby-separate-badge">Nearby</span>
                    <span className={`nearby-separate-toggle ${isOpen ? 'open' : ''}`} aria-hidden="true">▼</span>
                </div>
            </div>
            <div
                id={bodyId}
                className={`nearby-separate-body ${isOpen ? 'open' : ''}`}
            >
                <div className="nearby-separate-content">
                    <p className="nearby-separate-count">
                        {featureCount} nearby record{featureCount !== 1 ? 's' : ''} available
                    </p>
                    <button
                        type="button"
                        className="view-details-btn"
                        onClick={onViewDetails}
                        title={`View all ${featureCount} ${layerTitle} records in detail view`}
                        aria-label={`View ${featureCount} ${layerTitle} records in detail pane`}
                    >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M2 12h12M2 8h12M2 4h12" />
                        </svg>
                        View Details
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                            <path d="M6.5 3.5L11 8l-4.5 4.5" stroke="currentColor" strokeWidth="2" fill="none" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

// =====================================================
// Related Table Display Component
// =====================================================
interface RelatedTableDisplayProps {
    relatedTable: RelatedTableConfig
    records: any[]
    chartConfig?: ChartConfig
    onViewSeparatePane?: (tableConfig: RelatedTableConfig, records: any[], domainLookup?: DomainLookup) => void
    parentTitle?: string
    domainLookup?: DomainLookup  // Domain descriptions for coded value fields
    defaultOpen?: boolean  // Default expanded state (defaults to true if not specified)
}

const RelatedTableDisplay = ({ relatedTable, records, chartConfig, onViewSeparatePane, parentTitle, domainLookup, defaultOpen }: RelatedTableDisplayProps) => {
    // Expand/collapse state - use relatedTable.expanded config, then defaultOpen prop, then default to true
    const [isOpen, setIsOpen] = useState(() => {
        if (relatedTable.expanded !== undefined) return relatedTable.expanded
        if (defaultOpen !== undefined) return defaultOpen
        return true
    })

    // State for interactive sorting
    const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(
        relatedTable.defaultSortField
            ? { field: relatedTable.defaultSortField, direction: relatedTable.defaultSortOrder || 'asc' }
            : null
    )

    // State for column widths (resizable columns)
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})
    const [resizingColumn, setResizingColumn] = useState<string | null>(null)
    const resizeStartX = useRef<number>(0)
    const resizeStartWidth = useRef<number>(0)
    const tableRef = useRef<HTMLTableElement>(null)

    // Handle column resize start
    const handleResizeStart = useCallback((e: React.MouseEvent, fieldName: string) => {
        e.preventDefault()
        e.stopPropagation()

        const th = (e.target as HTMLElement).closest('th')
        if (!th) return

        resizeStartX.current = e.clientX
        resizeStartWidth.current = columnWidths[fieldName] || th.offsetWidth
        setResizingColumn(fieldName)
    }, [columnWidths])

    // Handle column resize move
    useEffect(() => {
        if (!resizingColumn) return

        const handleMouseMove = (e: MouseEvent) => {
            const diff = e.clientX - resizeStartX.current
            const newWidth = Math.max(50, resizeStartWidth.current + diff)
            setColumnWidths(prev => ({
                ...prev,
                [resizingColumn]: newWidth
            }))
        }

        const handleMouseUp = () => {
            setResizingColumn(null)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        // Add cursor style to body during resize
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }
    }, [resizingColumn])

    // Hoist hooks above early return (Rules of Hooks)
    const sectionId = React.useRef(`related-table-${relatedTable.tableId || Math.random().toString(36).substr(2, 9)}`)

    const sortedRecords = React.useMemo(() => {
        if (!records || records.length === 0) return records
        if (!sortConfig) return records
        const { field, direction } = sortConfig
        const sampleValue = records[0]?.[field]
        const detectFT = (fieldName: string, val: any): string => {
            if (val === null || val === undefined) return 'text'
            if (typeof val === 'number') return 'number'
            if (val instanceof Date) return 'date'
            if (typeof val === 'string' && !isNaN(parseFloat(val)) && isFinite(Number(val))) return 'number'
            return 'text'
        }
        const fieldType = detectFT(field, sampleValue)
        return [...records].sort((a, b) => {
            let aVal = a[field]
            let bVal = b[field]
            if (aVal === null || aVal === undefined) return direction === 'asc' ? 1 : -1
            if (bVal === null || bVal === undefined) return direction === 'asc' ? -1 : 1
            if (fieldType === 'number') {
                return direction === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal)
            }
            const aStr = String(aVal).toLowerCase()
            const bStr = String(bVal).toLowerCase()
            return direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
        })
    }, [records, sortConfig])

    if (!records || records.length === 0) {
        return null
    }

    const displayMode = relatedTable.displayMode || 'table'
    const fields = normalizeFields(relatedTable.fields || [])
    const enableSorting = relatedTable.enableInteractiveSorting !== false

    // If no fields configured, use first 5 fields from data
    const visibleFields = fields.length > 0
        ? fields.filter(f => f.visible !== false)
        : Object.keys(records[0] || {}).slice(0, 5).map(name => ({ name, alias: name, visible: true, format: undefined }))

    // Filter out fields where hideNull is true and ALL values are null/empty
    const displayFields = visibleFields.filter((field: any) => {
        if (!field.hideNull) return true // Keep field if hideNull is not enabled
        // Check if ALL values for this field are null/empty
        const allNull = records.every((record: any) => {
            const value = record[field.name]
            return value == null || value === ''
        })
        return !allNull // Keep field if NOT all values are null
    })


    // Helper to render field value with proper link support and domain resolution
    const renderFieldValue = (value: any, field: FieldConfig) => {
        const format = field.format
        const isLinkFormat = format?.type === 'link'
        const isAutoLink = !format?.type || format?.type === 'auto'
        const isUrl = typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))

        // For link format: build the URL (with optional base URL) and render
        if (isLinkFormat && value != null && value !== '') {
            // Build the full URL: base URL + value (if base URL is enabled)
            let fullUrl: string
            if (format?.useLinkBaseUrl && format?.linkBaseUrl) {
                // Prepend base URL to value
                fullUrl = format.linkBaseUrl + String(value)
            } else if (isUrl) {
                // Value is already a full URL
                fullUrl = value
            } else {
                // Value is not a URL and no base URL - still render as link but may not work
                fullUrl = String(value)
            }

            const linkText = format?.linkText || String(value)
            return (
                <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: theme.sectionHeader }}
                    title={`${linkText} (opens in new tab)`}
                    aria-label={`${linkText} (opens in new tab)`}
                >
                    {linkText}
                </a>
            )
        }

        // Auto-detect URLs for auto format type
        if (isAutoLink && isUrl) {
            const linkText = format?.linkText || 'Click here for more info'
            return (
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: theme.sectionHeader }}
                    title={`${linkText} (opens in new tab)`}
                    aria-label={`${linkText} (opens in new tab)`}
                >
                    {linkText}
                </a>
            )
        }

        // Use domain-aware formatting that resolves coded value domains
        return formatFieldValueWithDomain(value, field, domainLookup)
    }

    // Detect field type for smart sorting
    const detectFieldType = (fieldName: string, sampleValue: any): 'date' | 'number' | 'text' => {
        // Check format config first
        const fieldConfig = displayFields.find(f => f.name === fieldName)
        if (fieldConfig?.format?.type === 'date') return 'date'
        if (fieldConfig?.format?.type === 'number') return 'number'

        // Auto-detect from value
        if (typeof sampleValue === 'number') return 'number'
        if (sampleValue instanceof Date) return 'date'
        if (typeof sampleValue === 'string') {
            // Check if it's a date string
            if (/^\d{4}-\d{2}-\d{2}/.test(sampleValue) || /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(sampleValue)) {
                return 'date'
            }
            // Check if it's a numeric string
            if (!isNaN(parseFloat(sampleValue)) && isFinite(Number(sampleValue))) {
                return 'number'
            }
        }
        return 'text'
    }


    // Handle sort click
    const handleSort = (fieldName: string) => {
        if (!enableSorting) return

        setSortConfig(current => {
            if (current?.field === fieldName) {
                // Toggle direction or clear
                if (current.direction === 'asc') {
                    return { field: fieldName, direction: 'desc' }
                } else {
                    return null // Clear sorting
                }
            }
            return { field: fieldName, direction: 'asc' }
        })
    }

    // Get sort indicator
    const getSortIndicator = (fieldName: string) => {
        if (!sortConfig || sortConfig.field !== fieldName) {
            return enableSorting ? <span className="sort-indicator" aria-hidden="true">⇅</span> : null
        }
        return (
            <span className="sort-indicator" aria-hidden="true">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </span>
        )
    }

    // Get sort label for accessibility
    const getSortLabel = (fieldName: string, alias: string) => {
        const fieldConfig = displayFields.find(f => f.name === fieldName)
        const sampleValue = records[0]?.[fieldName]
        const fieldType = detectFieldType(fieldName, sampleValue)

        if (!sortConfig || sortConfig.field !== fieldName) {
            return `Sort by ${alias}`
        }

        if (fieldType === 'date') {
            return sortConfig.direction === 'asc'
                ? `${alias}: oldest to newest. Click to sort newest to oldest`
                : `${alias}: newest to oldest. Click to clear sort`
        } else if (fieldType === 'number') {
            return sortConfig.direction === 'asc'
                ? `${alias}: lowest to highest. Click to sort highest to lowest`
                : `${alias}: highest to lowest. Click to clear sort`
        } else {
            return sortConfig.direction === 'asc'
                ? `${alias}: A to Z. Click to sort Z to A`
                : `${alias}: Z to A. Click to clear sort`
        }
    }

    // Handle keyboard navigation for header
    const handleHeaderKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(!isOpen)
        }
    }

    const bodyId = `${sectionId.current}-body`

    return (
        <div className="related-table-section">
            <div
                className="related-table-header"
                onClick={handleProtectedClick(() => setIsOpen(!isOpen))}
                onMouseDown={handleProtectedMouseDown}
                onAuxClick={handlePreventAuxClick}
                onWheel={handlePreventWheelClick}
                onKeyDown={handleHeaderKeyDown}
                role="button"
                tabIndex={0}
                title={isOpen ? `Collapse ${relatedTable.tableName}` : `Expand ${relatedTable.tableName}`}
                aria-expanded={isOpen}
                aria-controls={bodyId}
            >
                <div className="related-table-header-left">
                    <span className="related-table-title">{relatedTable.tableName}</span>
                    <span className="related-table-count">{records.length} record{records.length !== 1 ? 's' : ''}</span>
                </div>
                <span className={`related-table-toggle ${isOpen ? 'open' : ''}`} aria-hidden="true">▼</span>
            </div>

            <div
                id={bodyId}
                className={`related-table-body ${isOpen ? 'open' : ''}`}
                style={{ display: isOpen ? 'block' : 'none' }}
                role="region"
                aria-label={`${relatedTable.tableName} data`}
            >

                {/* If configured to show in separate pane, show summary with button */}
                {relatedTable.displayPane === 'separate' && onViewSeparatePane ? (
                    <div className="related-table-separate-pane-trigger">
                        <p style={{ margin: '0 0 8px', fontSize: '12px', color: theme.textSecondary }}>
                            {records.length} related record{records.length !== 1 ? 's' : ''} available
                        </p>
                        <button
                            type="button"
                            className="view-details-btn"
                            onClick={() => onViewSeparatePane(relatedTable, records, domainLookup)}
                            title={`View all ${records.length} ${relatedTable.tableName} records in detail view`}
                            aria-label={`View ${records.length} ${relatedTable.tableName} records in detail pane`}
                        >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M2 12h12M2 8h12M2 4h12" />
                            </svg>
                            View Details
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                <path d="M6.5 3.5L11 8l-4.5 4.5" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </button>
                    </div>
                ) : displayMode === 'card' ? (
                    <div className="related-cards">
                        {sortedRecords.slice(0, relatedTable.maxRecords || 50).map((record, idx) => (
                            <div key={idx} className="related-card">
                                {displayFields.map(field => (
                                    <div key={field.name} style={{ marginBottom: '4px' }}>
                                        <span style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase' }}>
                                            {field.alias || field.name}:
                                        </span>{' '}
                                        <span style={{ fontSize: '12px' }}>{renderFieldValue(record[field.name], field as any)}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ) : displayMode === 'list' ? (
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px' }}>
                        {sortedRecords.slice(0, relatedTable.maxRecords || 50).map((record, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>
                                {displayFields.map((field, i) => (
                                    <span key={field.name}>
                                        {i > 0 && ' | '}
                                        {renderFieldValue(record[field.name], field as any)}
                                    </span>
                                ))}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table
                            ref={tableRef}
                            className="enhanced-table compact striped"
                            style={{ fontSize: '11px', tableLayout: 'fixed', minWidth: '100%' }}
                            aria-label={`${relatedTable.tableName} - ${records.length} records`}
                        >
                            <caption className="sr-only">
                                {relatedTable.tableName} - {records.length} record{records.length !== 1 ? 's' : ''}
                            </caption>
                            <thead>
                                <tr>
                                    {displayFields.map(field => (
                                        <th
                                            key={field.name}
                                            scope="col"
                                            className={`${enableSorting ? 'sortable' : ''} resizable`}
                                            style={{
                                                cursor: enableSorting ? 'pointer' : 'default',
                                                width: columnWidths[field.name] ? `${columnWidths[field.name]}px` : 'auto',
                                                minWidth: '50px',
                                                position: 'relative'
                                            }}
                                            onClick={handleProtectedClick(() => handleSort(field.name))}
                                            onMouseDown={handleProtectedMouseDown}
                                            onAuxClick={handlePreventAuxClick}
                                            onWheel={handlePreventWheelClick}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault()
                                                    handleSort(field.name)
                                                }
                                            }}
                                            tabIndex={enableSorting ? 0 : -1}
                                            aria-sort={
                                                sortConfig?.field === field.name
                                                    ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending')
                                                    : 'none'
                                            }
                                            aria-label={getSortLabel(field.name, field.alias || field.name)}
                                            title={enableSorting ? getSortLabel(field.name, field.alias || field.name) : undefined}
                                        >
                                            <span className="th-content">
                                                {field.alias || field.name}
                                                {getSortIndicator(field.name)}
                                            </span>
                                            <div
                                                className={`resize-handle ${resizingColumn === field.name ? 'resizing' : ''}`}
                                                onMouseDown={(e) => handleResizeStart(e, field.name)}
                                                onClick={(e) => e.stopPropagation()}
                                                title="Drag to resize column, or use arrow keys when focused"
                                                role="separator"
                                                aria-orientation="vertical"
                                                aria-label={`Resize ${field.alias || field.name} column`}
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    // Allow keyboard resizing with arrow keys
                                                    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                                                        e.preventDefault()
                                                        const delta = e.key === 'ArrowLeft' ? -10 : 10
                                                        const currentWidth = columnWidths[field.name] || 100
                                                        setColumnWidths(prev => ({
                                                            ...prev,
                                                            [field.name]: Math.max(50, currentWidth + delta)
                                                        }))
                                                    }
                                                }}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedRecords.slice(0, relatedTable.maxRecords || 50).map((record, idx) => (
                                    <tr key={idx}>
                                        {displayFields.map(field => (
                                            <td
                                                key={field.name}
                                                style={{
                                                    width: columnWidths[field.name] ? `${columnWidths[field.name]}px` : 'auto',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {renderFieldValue(record[field.name], field as any)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Chart for related data */}
                {relatedTable.enableChart && records.length > 0 && chartConfig && (
                    <div style={{ marginTop: '12px' }}>
                        <EnhancedChart
                            data={records}
                            chartConfig={chartConfig}
                            title={`${relatedTable.tableName} Chart`}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

// =====================================================
// ACCESSIBILITY: Enhanced Chart Component with Screen Reader Support
// =====================================================
interface EnhancedChartProps {
    data: any[]
    chartConfig?: ChartConfig
    title?: string
    skipAnimation?: boolean  // Skip animation (used after initial render)
}

const EnhancedChart = ({ data, chartConfig, title, skipAnimation }: EnhancedChartProps) => {
    if (!data || data.length === 0) return null

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: theme.white,
                    padding: '8px 12px',
                    border: `1px solid ${theme.border}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    fontSize: '12px'
                }}>
                    <div style={{ fontWeight: 'bold', color: theme.textPrimary, marginBottom: '4px' }}>{label}</div>
                    {payload.map((p: any, i: number) => (
                        <div key={i} style={{ color: p.color }}>
                            {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
                        </div>
                    ))}
                </div>
            )
        }
        return null
    }

    const config = {
        chartType: chartConfig?.chartType || 'bar',
        chartMode: chartConfig?.chartMode || 'category',
        showLegend: chartConfig?.showLegend !== false,
        legendPosition: chartConfig?.legendPosition || 'bottom',
        showValues: chartConfig?.showValues || false,
        showGrid: chartConfig?.showGrid !== false,
        animate: skipAnimation ? false : (chartConfig?.animate !== false),  // Disable animation if skipAnimation is true
        stacked: chartConfig?.stacked || false,
        curveType: chartConfig?.curveType || 'monotone',
        height: chartConfig?.height || 200,
        colorScheme: toMutable<string>(chartConfig?.colorScheme) || CHART_COLORS,
        compareFields: chartConfig?.compareFields || []
    }

    // Detect if data is multi-series (has keys beyond 'name', 'value', 'fill')
    const dataKeys = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'name' && k !== 'fill') : []
    const isMultiSeries = dataKeys.length > 1 || (dataKeys.length === 1 && dataKeys[0] !== 'value')
    const seriesKeys = isMultiSeries ? dataKeys : ['value']

    // Get colors for series
    const getSeriesColor = (key: string, index: number): string => {
        const fieldConfig = config.compareFields.find(f => (f.alias || f.fieldName) === key)
        if (fieldConfig?.color) return fieldConfig.color
        // For single value with fill property
        if (key === 'value' && data[index]?.fill) return data[index].fill
        return config.colorScheme[index % config.colorScheme.length]
    }

    const getVerticalAlign = (): 'top' | 'middle' | 'bottom' => {
        if (config.legendPosition === 'top') return 'top'
        if (config.legendPosition === 'bottom') return 'bottom'
        return 'middle'
    }

    const getHorizontalAlign = (): 'left' | 'center' | 'right' => {
        if (config.legendPosition === 'left') return 'left'
        if (config.legendPosition === 'right') return 'right'
        return 'center'
    }

    const legendProps = {
        verticalAlign: getVerticalAlign(),
        align: getHorizontalAlign(),
        wrapperStyle: { fontSize: '10px' }
    }

    // ACCESSIBILITY: Generate screen reader description of chart data
    const generateChartDescription = () => {
        if (isMultiSeries) {
            const seriesInfo = seriesKeys.map(key => {
                const total = data.reduce((sum, item) => sum + (item[key] || 0), 0)
                return `${key}: ${total.toLocaleString()}`
            }).join('; ')
            return `${config.chartType} chart comparing ${seriesKeys.length} series across ${data.length} categories. ${seriesInfo}`
        }
        const total = data.reduce((sum, item) => sum + (item.value || 0), 0)
        const items = data.map(item => `${item.name}: ${item.value?.toLocaleString() || 0}`).join(', ')
        return `${config.chartType} chart showing ${data.length} data points. Total: ${total.toLocaleString()}. Values: ${items}`
    }

    const renderChart = () => {
        switch (config.chartType) {
            case 'bar':
                return (
                    <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.borderLight} />}
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: theme.textSecondary }} />
                        <YAxis tick={{ fontSize: 10, fill: theme.textSecondary }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        {config.showLegend && <RechartsLegend {...legendProps} />}
                        {isMultiSeries ? (
                            seriesKeys.map((key, idx) => (
                                <Bar
                                    key={key}
                                    dataKey={key}
                                    fill={getSeriesColor(key, idx)}
                                    stackId={config.stacked ? 'stack' : undefined}
                                    isAnimationActive={config.animate}
                                    label={config.showValues ? { position: 'top', fontSize: 10 } : undefined}
                                />
                            ))
                        ) : (
                            <Bar
                                dataKey="value"
                                isAnimationActive={config.animate}
                                label={config.showValues ? { position: 'top', fontSize: 10 } : undefined}
                            >
                                {data.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill || config.colorScheme[index % config.colorScheme.length]} />
                                ))}
                            </Bar>
                        )}
                    </RechartsBarChart>
                )

            case 'area':
                return (
                    <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.borderLight} />}
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: theme.textSecondary }} />
                        <YAxis tick={{ fontSize: 10, fill: theme.textSecondary }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        {config.showLegend && <RechartsLegend {...legendProps} />}
                        {isMultiSeries ? (
                            seriesKeys.map((key, idx) => (
                                <Area
                                    key={key}
                                    type={config.curveType}
                                    dataKey={key}
                                    fill={getSeriesColor(key, idx)}
                                    stroke={getSeriesColor(key, idx)}
                                    fillOpacity={0.3}
                                    stackId={config.stacked ? 'stack' : undefined}
                                    isAnimationActive={config.animate}
                                />
                            ))
                        ) : (
                            <Area
                                type={config.curveType}
                                dataKey="value"
                                fill={config.colorScheme[0]}
                                stroke={config.colorScheme[0]}
                                fillOpacity={0.3}
                                isAnimationActive={config.animate}
                            />
                        )}
                    </RechartsAreaChart>
                )

            case 'line':
                return (
                    <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.borderLight} />}
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: theme.textSecondary }} />
                        <YAxis tick={{ fontSize: 10, fill: theme.textSecondary }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        {config.showLegend && <RechartsLegend {...legendProps} />}
                        {isMultiSeries ? (
                            seriesKeys.map((key, idx) => (
                                <Line
                                    key={key}
                                    type={config.curveType}
                                    dataKey={key}
                                    stroke={getSeriesColor(key, idx)}
                                    strokeWidth={2}
                                    dot={{ fill: getSeriesColor(key, idx), r: 4 }}
                                    isAnimationActive={config.animate}
                                />
                            ))
                        ) : (
                            <Line
                                type={config.curveType}
                                dataKey="value"
                                stroke={config.colorScheme[0]}
                                strokeWidth={2}
                                dot={{ fill: config.colorScheme[0], r: 4 }}
                                isAnimationActive={config.animate}
                            />
                        )}
                    </RechartsLineChart>
                )

            case 'pie':
                // Custom label renderer - only show labels for slices > 5%
                const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, index }: any) => {
                    // Don't render label for small slices
                    if (percent < 0.05) return null

                    const RADIAN = Math.PI / 180
                    const radius = outerRadius * 1.2
                    const x = cx + radius * Math.cos(-midAngle * RADIAN)
                    const y = cy + radius * Math.sin(-midAngle * RADIAN)

                    return (
                        <text
                            x={x}
                            y={y}
                            fill={theme.textPrimary}
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            style={{ fontSize: '11px', fontWeight: 500 }}
                        >
                            {`${name}: ${(percent * 100).toFixed(0)}%`}
                        </text>
                    )
                }

                return (
                    <RechartsPieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={Math.min(config.height * 0.32, 70)}
                            dataKey="value"
                            isAnimationActive={config.animate}
                            label={config.showValues ? renderPieLabel : undefined}
                            labelLine={config.showValues ? { stroke: theme.textMuted, strokeWidth: 1 } : false}
                        >
                            {data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.fill || config.colorScheme[index % config.colorScheme.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                        {config.showLegend && <RechartsLegend {...legendProps} />}
                    </RechartsPieChart>
                )

            case 'donut':
                // Custom label renderer for donut - only show labels for slices > 5%
                const renderDonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
                    if (percent < 0.05) return null

                    const RADIAN = Math.PI / 180
                    const radius = outerRadius * 1.25
                    const x = cx + radius * Math.cos(-midAngle * RADIAN)
                    const y = cy + radius * Math.sin(-midAngle * RADIAN)

                    return (
                        <text
                            x={x}
                            y={y}
                            fill={theme.textPrimary}
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            style={{ fontSize: '11px', fontWeight: 500 }}
                        >
                            {`${(percent * 100).toFixed(0)}%`}
                        </text>
                    )
                }

                return (
                    <RechartsPieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={Math.min(config.height * 0.18, 35)}
                            outerRadius={Math.min(config.height * 0.32, 70)}
                            paddingAngle={2}
                            dataKey="value"
                            isAnimationActive={config.animate}
                            label={config.showValues ? renderDonutLabel : undefined}
                            labelLine={config.showValues ? { stroke: theme.textMuted, strokeWidth: 1 } : false}
                        >
                            {data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.fill || config.colorScheme[index % config.colorScheme.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                        {config.showLegend && <RechartsLegend {...legendProps} />}
                    </RechartsPieChart>
                )

            case 'radialBar':
                return (
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="20%"
                        outerRadius="90%"
                        data={data}
                        startAngle={180}
                        endAngle={0}
                    >
                        <RadialBar
                            label={config.showValues ? { position: 'insideStart', fill: '#fff', fontSize: 10 } : undefined}
                            background
                            dataKey="value"
                            isAnimationActive={config.animate}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        {config.showLegend && <RechartsLegend {...legendProps} />}
                    </RadialBarChart>
                )

            case 'composite':
                return (
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.borderLight} />}
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: theme.textSecondary }} />
                        <YAxis tick={{ fontSize: 10, fill: theme.textSecondary }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        {config.showLegend && <RechartsLegend {...legendProps} />}
                        <Bar dataKey="value" fill={config.colorScheme[0]} isAnimationActive={config.animate} />
                        <Line type={config.curveType} dataKey="value" stroke={config.colorScheme[1]} strokeWidth={2} />
                    </ComposedChart>
                )

            default:
                return (
                    <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.borderLight} />}
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: theme.textSecondary }} />
                        <YAxis tick={{ fontSize: 10, fill: theme.textSecondary }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill={config.colorScheme[0]} />
                    </RechartsBarChart>
                )
        }
    }

    return (
        <div
            className="chart-box"
            role="img"
            aria-label={generateChartDescription()}
            title={title ? `${title} - ${config.chartType} chart` : `${config.chartType} chart with ${data.length} data points`}
        >
            {title && <div className="chart-title" id={`chart-title-${title.replace(/\s+/g, '-').toLowerCase()}`}>{title}</div>}
            <div className="chart-container" style={{ height: config.height, minHeight: config.height }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    {renderChart()}
                </ResponsiveContainer>
            </div>
            {/* ACCESSIBILITY: Hidden table for screen readers */}
            <table className="sr-only">
                <caption>{title || 'Chart data'}</caption>
                <thead>
                    <tr>
                        <th scope="col">Category</th>
                        <th scope="col">Value</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.value?.toLocaleString() || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

// =====================================================
// Section Pane Content - Renders section data in separate pane
// =====================================================
interface SectionPaneContentProps {
    sectionResult: SectionResult
    config: IMConfig
    onRowHighlight?: (geometry: any | null, color?: string, fillOpacity?: number) => void
    onRowZoom?: (geometry: any | null, scale?: number) => void
    sourceGeometry?: any | null  // Source feature geometry for nearby zoom
    onZoomToBoth?: (sourceGeometry: any, nearbyGeometry: any) => void  // Zoom to show both features
    skipAnimation?: boolean  // Skip chart animation (used after initial render)
}

const SectionPaneContent = ({ sectionResult: sr, config, onRowHighlight, onRowZoom, sourceGeometry, onZoomToBoth, skipAnimation }: SectionPaneContentProps) => {
    // Merge table config helper - cast to handle ImmutableObjects
    // Note: resizableColumns defaults to true in separate pane for better UX
    const mergeTableConfig = (defaultConfig?: any, sectionConfig?: any): TableDisplayConfig => {
        const def = defaultConfig as TableDisplayConfig | undefined
        const sec = sectionConfig as TableDisplayConfig | undefined
        return {
            enableSorting: sec?.enableSorting ?? def?.enableSorting ?? true,
            enableFiltering: sec?.enableFiltering ?? def?.enableFiltering ?? false,
            enablePagination: sec?.enablePagination ?? def?.enablePagination ?? true,
            pageSize: sec?.pageSize ?? def?.pageSize ?? 10,
            pageSizeOptions: (sec?.pageSizeOptions || def?.pageSizeOptions || [5, 10, 25, 50]) as number[],
            stickyHeader: sec?.stickyHeader ?? def?.stickyHeader ?? true,
            stripedRows: sec?.stripedRows ?? def?.stripedRows ?? true,
            highlightOnHover: sec?.highlightOnHover ?? def?.highlightOnHover ?? true,
            compactMode: sec?.compactMode ?? def?.compactMode ?? false,
            showRowNumbers: sec?.showRowNumbers ?? def?.showRowNumbers ?? false,
            resizableColumns: sec?.resizableColumns ?? def?.resizableColumns ?? true
        }
    }

    // Merge chart config helper - cast to handle ImmutableObjects
    const mergeChartConfig = (defaultConfig?: any, sectionConfig?: any, chartType?: ChartType): ChartConfig => {
        const def = defaultConfig as ChartConfig | undefined
        const sec = sectionConfig as ChartConfig | undefined
        return {
            chartType: chartType || sec?.chartType || def?.chartType || 'bar',
            chartMode: sec?.chartMode || def?.chartMode || 'category',
            categoryField: sec?.categoryField || def?.categoryField,
            valueField: sec?.valueField || def?.valueField,
            aggregation: sec?.aggregation || def?.aggregation || 'count',
            showLegend: sec?.showLegend ?? def?.showLegend ?? true,
            legendPosition: sec?.legendPosition || def?.legendPosition || 'bottom',
            showValues: sec?.showValues ?? def?.showValues ?? false,
            showGrid: sec?.showGrid ?? def?.showGrid ?? true,
            animate: sec?.animate ?? def?.animate ?? true,
            stacked: sec?.stacked ?? def?.stacked ?? false,
            curveType: sec?.curveType || def?.curveType || 'monotone',
            colorScheme: (sec?.colorScheme || def?.colorScheme || ['#1A6B7C', '#2E8B57', '#CD853F', '#8B4513', '#4682B4', '#6B8E23', '#BC8F8F', '#708090']) as string[],
            height: sec?.height || def?.height || 200,
            maxCategories: sec?.maxCategories ?? def?.maxCategories ?? 10,
            sortBy: sec?.sortBy || def?.sortBy || 'value',
            sortOrder: sec?.sortOrder || def?.sortOrder || 'desc'
        }
    }

    // Check if section has rich text content configured
    const hasRichTextConfig = sr.sectionConfig.richTextContent || (sr.sectionConfig.richTextButtons && sr.sectionConfig.richTextButtons.length > 0)

    // Collect field data from section's layer results (first feature from each layer)
    const sectionFieldData: Record<string, any> = {}
    sr.layerResults.forEach(lr => {
        if (lr.features.length > 0) {
            Object.entries(lr.features[0]).forEach(([key, value]) => {
                if (!(key in sectionFieldData)) {
                    sectionFieldData[key] = value
                }
            })
        }
    })

    // Helper to check if text has unresolved placeholders
    const hasUnresolvedPlaceholders = (text: string): boolean => {
        if (!text) return false
        // Try to replace placeholders with available data
        const replaced = text.replace(/\{([^}]+)\}/g, (match, fieldName) => {
            if (fieldName in sectionFieldData && sectionFieldData[fieldName] != null) {
                return String(sectionFieldData[fieldName])
            }
            return match // Keep placeholder if not found
        })
        // Check if any {FIELD_NAME} patterns remain
        return /\{[^}]+\}/.test(replaced)
    }

    // Rich text has unresolved placeholders if content contains placeholders that can't be filled
    const richTextHasUnresolved = sr.sectionConfig.richTextContent
        ? hasUnresolvedPlaceholders(sr.sectionConfig.richTextContent)
        : false

    // Only show rich text if it doesn't have unresolved placeholders
    // Also hide if hideRichTextWhenNoResults is enabled and no features were found
    const shouldHideRichTextDueToNoResults = sr.sectionConfig.hideRichTextWhenNoResults && sr.totalFeatures === 0
    const hasRichText = hasRichTextConfig && !richTextHasUnresolved && !shouldHideRichTextDueToNoResults

    // Get custom no-results text from layers (if any layer has custom text configured)
    const getNoResultsMessage = (): string | null => {
        const layers = sr.sectionConfig.layers || []
        const customMessages: string[] = []

        for (const layer of layers) {
            const layerConfig = layer as LayerConfig
            if (layerConfig.useCustomNoResultsText) {
                if (layerConfig.customNoResultsText) {
                    customMessages.push(layerConfig.customNoResultsText)
                }
                // If useCustomNoResultsText is true but no text provided, show nothing for this layer
            }
        }

        // If any layer has custom text, return the combined messages
        if (customMessages.length > 0) {
            return customMessages.join(' ')
        }

        // Check if ALL layers have useCustomNoResultsText enabled (even with empty text)
        const allLayersUseCustom = layers.length > 0 && layers.every((l: any) => l.useCustomNoResultsText)
        if (allLayersUseCustom) {
            return null // Hide message entirely
        }

        // Default message
        return 'No intersecting features found.'
    }

    const noResultsMessage = getNoResultsMessage()

    // Check if any layer has custom no-results text configured - if so, we need to render layers individually
    const hasAnyCustomNoResultsText = (sr.sectionConfig.layers || []).some(
        (layer: any) => layer.useCustomNoResultsText && layer.customNoResultsText
    )

    // Determine if we should show aggregated message or iterate through layers
    // Show aggregated message only when: no features, no nearby, no chart, no rich text, AND no custom layer messages
    const showAggregatedNoResults = sr.totalFeatures === 0 &&
        (!sr.nearbyResults || sr.nearbyResults.length === 0) &&
        (!sr.chartData || sr.chartData.length === 0) &&
        !hasRichText &&
        !hasAnyCustomNoResultsText

    return (
        <div className="section-pane-content">
            {showAggregatedNoResults ? (
                noResultsMessage ? <div className="no-results">{noResultsMessage}</div> : null
            ) : (
                <>
                    {/* Chart */}
                    {sr.sectionConfig.displayAsChart && sr.chartData && sr.chartData.length > 0 && (
                        <div className="charts-container" style={{ marginBottom: '16px' }}>
                            <div className="chart-box">
                                <EnhancedChart
                                    data={sr.chartData}
                                    chartConfig={mergeChartConfig(
                                        config.defaultChartConfig,
                                        sr.sectionConfig.chartConfig,
                                        sr.sectionConfig.chartConfig?.chartType || config.defaultChartConfig?.chartType || 'bar'
                                    )}
                                    skipAnimation={skipAnimation}
                                />
                            </div>
                        </div>
                    )}

                    {/* Table data */}
                    {sr.sectionConfig.displayAsTable && sr.layerResults.map((lr, i) => {
                        // Handle layers with no features - show custom message if configured
                        if (lr.features.length === 0) {
                            // If custom no-results text is enabled for this layer
                            if (lr.layerConfig.useCustomNoResultsText) {
                                // If there's custom text, display it with proper layer header
                                if (lr.layerConfig.customNoResultsText) {
                                    return (
                                        <LayerNoResultsSection
                                            key={i}
                                            layerConfig={lr.layerConfig}
                                            defaultOpen={lr.layerConfig.expanded !== false}
                                        />
                                    )
                                }
                                // If useCustomNoResultsText is true but no text, hide this layer entirely
                                return null
                            }
                            // If not using custom text, skip the layer (default behavior)
                            return null
                        }
                        // Filter visible fields and apply hideNull logic
                        const visibleFields = normalizeFields(toMutable<any>(lr.layerConfig.fields || [])).filter((f: any) => f.visible)
                        // Filter out fields where hideNull is true and ALL values are null/empty
                        const fields = visibleFields.filter((field: any) => {
                            if (!field.hideNull) return true // Keep field if hideNull is not enabled
                            // Check if ALL values for this field are null/empty
                            const allNull = lr.features.every((feature: any) => {
                                const value = feature[field.name]
                                return value == null || value === ''
                            })
                            return !allNull // Keep field if NOT all values are null
                        })
                        return (
                            <LayerDataSection
                                key={i}
                                layerResult={lr}
                                fields={fields}
                                defaultOpen={lr.layerConfig.expanded !== false}
                                tableConfig={mergeTableConfig(
                                    config.defaultTableConfig,
                                    sr.sectionConfig.tableConfig
                                )}
                                onRowHighlight={onRowHighlight}
                                onRowZoom={onRowZoom}
                            />
                        )
                    })}

                    {/* Nearby Features Display */}
                    {sr.nearbyResults && sr.nearbyResults.length > 0 && sr.nearbyResults.map((nearbyResult, nrIdx) => (
                        <NearbyDisplay
                            key={nearbyResult.layerConfig.layerId || nrIdx}
                            nearbyResult={nearbyResult}
                            sourceGeometry={sourceGeometry}
                            onHighlight={onRowHighlight}
                            onZoom={(geom, scale) => onRowZoom?.(geom, scale || 2500)}
                            onZoomToBoth={onZoomToBoth}
                        />
                    ))}
                </>
            )}
        </div>
    )
}

// =====================================================
// ACCESSIBILITY: Main Widget with Full A11y Support
// =====================================================
const Widget = (props: AllWidgetProps<IMConfig>) => {
    const { config, state: widgetState, theme: appTheme } = props


    // Get primary color from app theme for themed UI elements
    // Experience Builder theme structure varies by version:
    // - Newer (2024+): theme.sys.color.primary.main/dark/light
    // - Legacy: theme.colors.primary.main/dark/light or theme.colors.primary (string)
    // - Fallback: internal widget theme
    // NOTE: Font family is inherited from jimu framework via jimu-widget class
    const themeColors = useMemo(() => {
        // Try sys.color path first (newer ExB versions)
        if (appTheme?.sys?.color?.primary?.main) {
            return {
                primary: appTheme.sys.color.primary.main,
                primaryDark: appTheme.sys.color.primary.dark || appTheme.sys.color.primary.main,
                primaryLight: appTheme.sys.color.primary.light || appTheme.sys.color.primary.main
            }
        }
        // Try colors.primary object path (common in ExB)
        const colorsPrimary = appTheme?.colors?.primary as any
        if (colorsPrimary) {
            // Check if primary is an object with main/dark/light or a direct color string
            if (typeof colorsPrimary === 'object' && colorsPrimary.main) {
                return {
                    primary: colorsPrimary.main as string,
                    primaryDark: (colorsPrimary.dark || colorsPrimary.main) as string,
                    primaryLight: (colorsPrimary.light || colorsPrimary.main) as string
                }
            }
            // Primary might be a direct color string
            if (typeof colorsPrimary === 'string') {
                return {
                    primary: colorsPrimary,
                    primaryDark: (appTheme?.colors as any)?.dark || colorsPrimary,
                    primaryLight: (appTheme?.colors as any)?.light || colorsPrimary
                }
            }
        }
        // Fallback to internal theme
        return {
            primary: theme.sectionHeader,
            primaryDark: '#145663',
            primaryLight: '#2a8a9e'
        }
    }, [appTheme])

    const primaryColor = themeColors.primary
    const primaryColorDark = themeColors.primaryDark
    const [mapView, setMapView] = useState<JimuMapView | null>(null)
    const [searchText, setSearchText] = useState('')
    const [displayedSearchText, setDisplayedSearchText] = useState('')
    const [queryPoint, setQueryPoint] = useState<Point | null>(null)
    const [results, setResults] = useState<SectionResult[]>([])
    const [headerInfoData, setHeaderInfoData] = useState<Record<string, any> | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [openSections, setOpenSections] = useState<Set<string>>(new Set())
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [searching, setSearching] = useState(false)
    const [generatingPdf, setGeneratingPdf] = useState(false)
    const [selectByLocationActive, setSelectByLocationActive] = useState(false)
    const [gettingLocation, setGettingLocation] = useState(false)
    const [projectionLoaded, setProjectionLoaded] = useState(false)
    // Store highlighted feature geometry for PDF map capture
    const [highlightedGeometry, setHighlightedGeometry] = useState<any | null>(null)
    // ACCESSIBILITY: Track highlighted suggestion index for keyboard navigation
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    // ACCESSIBILITY: Status message for screen readers
    const [statusMessage, setStatusMessage] = useState('')
    // Note: Scroll shadow effect is handled via direct DOM manipulation in useEffect to avoid re-renders

    // Separate pane state for related tables or sections with displayPane='separate'
    const [separatePaneData, setSeparatePaneData] = useState<{
        type: 'relatedTable' | 'section' | 'nearbyResult'
        // For related tables
        tableConfig?: RelatedTableConfig
        records?: any[]
        domainLookup?: DomainLookup  // Domain descriptions for coded value fields
        // For sections
        sectionResult?: SectionResult
        // For individual nearby results
        nearbyResult?: NearbyResult
        sourceGeometry?: any | null
        // Common
        parentTitle: string  // e.g., "Parcel 2945-144-01-012"
        paneTitle: string    // Title to display in pane header
    } | null>(null)

    const selectByLocationRef = useRef(false)
    const searchTimeout = useRef<NodeJS.Timeout | null>(null)
    const graphicsLayerRef = useRef<any | null>(null)
    const rowHighlightLayerRef = useRef<any | null>(null)
    const showAllFeaturesLayerRef = useRef<any | null>(null)
    const searchInputRef = useRef<HTMLInputElement | null>(null)
    const suggestionsRef = useRef<HTMLDivElement | null>(null)
    const mainContentRef = useRef<HTMLDivElement | null>(null)
    const mapViewRef = useRef<JimuMapView | null>(null)
    const chartRefsMap = useRef<Map<string, HTMLDivElement | null>>(new Map())
    // Track which section charts have already animated (to prevent re-animation on expand/collapse)
    const animatedChartsRef = useRef<Set<string>>(new Set())
    // Track last processed action timestamp to prevent re-processing same trigger
    const lastActionTimestampRef = useRef<number>(0)

    // Generate unique IDs for ARIA relationships
    const widgetId = useRef(`widget-${Math.random().toString(36).substr(2, 9)}`)
    const suggestionsId = `${widgetId.current}-suggestions`
    const statusId = `${widgetId.current}-status`

    useEffect(() => {
        loadArcGISJSAPIModules(['esri/geometry/projection']).then((modules: any[]) => {
            projection = modules[0]
            // Must call projection.load() before projection.project() works in JSAPI 5.x
            const loadPromise = (projection && typeof projection.load === 'function')
                ? projection.load()
                : Promise.resolve()
            return loadPromise
        }).then(() => {
            if (_projectionResolve) { _projectionResolve(); _projectionResolve = null }
            setProjectionLoaded(true)
        }).catch(() => {
            if (_projectionResolve) { _projectionResolve(); _projectionResolve = null }
            setProjectionLoaded(true)
        })
    }, [])

    // Track scroll position for sticky header shadow effect
    // Using ref + direct DOM manipulation to avoid re-renders that cause child unmounting
    useEffect(() => {
        const container = mainContentRef.current
        if (!container) return

        const handleScroll = () => {
            const scrollTop = container.scrollTop
            const isScrolled = scrollTop > 0
            // Directly toggle class instead of using state to prevent re-renders
            if (isScrolled) {
                container.classList.add('scrolled')
            } else {
                container.classList.remove('scrolled')
            }
        }

        container.addEventListener('scroll', handleScroll)
        // Initial check
        handleScroll()
        return () => container.removeEventListener('scroll', handleScroll)
    }, [results]) // Re-attach when results change

    // ACCESSIBILITY: Handle Escape key to close separate pane
    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && separatePaneData) {
                e.preventDefault()
                setSeparatePaneData(null)
            }
        }

        if (separatePaneData) {
            document.addEventListener('keydown', handleEscapeKey)
            return () => document.removeEventListener('keydown', handleEscapeKey)
        }
    }, [separatePaneData])

    useEffect(() => {
        selectByLocationRef.current = selectByLocationActive
        if (mapView?.view) {
            mapView.view.container.style.cursor = selectByLocationActive ? 'crosshair' : ''
        }
    }, [selectByLocationActive, mapView])

    const enabledSources = useMemo(() => {
        const sources = toMutable<SearchSourceConfig>(config.searchSources)
        return sources.filter((s: any) => s.enabled !== false).map((s: any) => ({
            type: s.type || 'geocoder',
            sourceName: s.sourceName || (s.type === 'layer' ? 'Feature Search' : 'Address Search'),
            config: s
        }))
    }, [config.searchSources])

    // Row highlight helper - highlights feature geometry on map
    const highlightRowGeometry = useCallback(async (geometry: any | null, color: string = '#FF6600', fillOpacity: number = 0.2) => {
        if (!rowHighlightLayerRef.current) return

        // Clear existing highlights
        rowHighlightLayerRef.current.removeAll()

        if (!geometry) return

        // Project geometry to view's spatial reference if needed
        let projectedGeometry = geometry
        const view = mapViewRef.current?.view
        if (view && geometry.spatialReference) {
            const viewSR = view.spatialReference
            const geomSR = geometry.spatialReference
            // Check if projection is needed using equals() method or wkid comparison
            const needsProjection = geomSR && viewSR && !geomSR.equals(viewSR)

            if (needsProjection && projection) {
                try {
                    if (typeof projection.load === "function") await projection.load()
                    const projected = projection.project(
                        geometry as Point | any | any | Extent | any,
                        viewSR
                    )
                    if (projected && !Array.isArray(projected)) {
                        projectedGeometry = projected
                    }
                } catch (projErr) {
                    // projection not available yet, use original geometry
                }
            }
        }

        // Graphic already statically imported
        let symbol: any

        const geometryType = projectedGeometry.type

        if (geometryType === 'point' || geometryType === 'multipoint') {
            symbol = {
                type: 'simple-marker',
                color: color,
                size: 14,
                outline: {
                    color: '#FFFFFF',
                    width: 2
                }
            }
        } else if (geometryType === 'polyline') {
            symbol = {
                type: 'simple-line',
                color: color,
                width: 4
            }
        } else if (geometryType === 'polygon' || geometryType === 'extent') {
            // Parse hex color to RGB for fill with opacity
            const hex = color.replace('#', '')
            const r = parseInt(hex.substr(0, 2), 16)
            const g = parseInt(hex.substr(2, 2), 16)
            const b = parseInt(hex.substr(4, 2), 16)

            symbol = {
                type: 'simple-fill',
                color: [r, g, b, fillOpacity],
                outline: {
                    color: color,
                    width: 3
                }
            }
        } else {
            // Fallback for other geometry types
            symbol = {
                type: 'simple-marker',
                color: color,
                size: 12
            }
        }

        if (rowHighlightLayerRef.current) {
            rowHighlightLayerRef.current.add(new Graphic({
                geometry: projectedGeometry,
                symbol: symbol
            }))
        }
    }, [])

    // Clear row highlight
    const clearRowHighlight = useCallback(() => {
        if (rowHighlightLayerRef.current) {
            rowHighlightLayerRef.current.removeAll()
        }
    }, [])

    // Zoom to feature geometry
    const zoomToGeometry = useCallback((geometry: any | null, scale?: number) => {
        if (!geometry || !mapViewRef.current?.view) return

        const view = mapViewRef.current.view
        const zoomScale = scale || 2500  // Default to 2500 if not specified

        // For points, use a scale-based zoom
        if (geometry.type === 'point') {
            view.goTo({
                target: geometry,
                scale: zoomScale
            }, {
                duration: 500,
                easing: 'ease-in-out'
            }).catch(err => console.warn('Zoom failed:', err))
        } else {
            // For polygons/lines, zoom to extent with padding, then apply scale if specified
            if (scale) {
                // If scale is specified, zoom to geometry center at that scale
                view.goTo({
                    target: geometry,
                    scale: zoomScale
                }, {
                    duration: 500,
                    easing: 'ease-in-out'
                }).catch(err => console.warn('Zoom failed:', err))
            } else {
                // Otherwise fit to extent with padding
                view.goTo({
                    target: geometry,
                    padding: { top: 50, bottom: 50, left: 50, right: 50 }
                }, {
                    duration: 500,
                    easing: 'ease-in-out'
                }).catch(err => console.warn('Zoom failed:', err))
            }
        }
    }, [])

    // Zoom to show both source and nearby feature geometries in view
    // Used by Nearby Mode to keep both the searched location and selected nearby feature visible
    const zoomToBothGeometries = useCallback((sourceGeometry: any, nearbyGeometry: any) => {
        if (!mapViewRef.current?.view) return

        const view = mapViewRef.current.view

        // Create an array of geometries to zoom to
        const geometries = [sourceGeometry, nearbyGeometry]

        // Use geometryEngine to compute the combined extent
        try {
            // Get extents for both geometries
            const extents: Extent[] = []

            geometries.forEach(geom => {
                if (geom.type === 'point') {
                    // For points, create a small extent around the point
                    const pt = geom as Point
                    // Create a small buffer extent around the point (in map units)
                    const bufferSize = 100 // meters or map units
                    const extent = new Extent({
                        xmin: pt.x - bufferSize,
                        ymin: pt.y - bufferSize,
                        xmax: pt.x + bufferSize,
                        ymax: pt.y + bufferSize,
                        spatialReference: pt.spatialReference
                    })
                    extents.push(extent)
                } else if (geom.extent) {
                    extents.push(geom.extent)
                }
            })

            if (extents.length === 0) {
                // Fallback to just zooming to the nearby geometry
                view.goTo({
                    target: nearbyGeometry,
                    padding: { top: 50, bottom: 50, left: 50, right: 50 }
                }, {
                    duration: 500,
                    easing: 'ease-in-out'
                }).catch(err => console.warn('Zoom failed:', err))
                return
            }

            // Compute union of all extents
            let combinedExtent = extents[0]
            for (let i = 1; i < extents.length; i++) {
                combinedExtent = combinedExtent.union(extents[i])
            }

            // Expand the extent slightly for better visibility (30% padding)
            const expandedExtent = combinedExtent.expand(1.3)

            // Zoom to the combined extent
            view.goTo({
                target: expandedExtent,
                padding: { top: 50, bottom: 50, left: 50, right: 50 }
            }, {
                duration: 500,
                easing: 'ease-in-out'
            }).catch(err => console.warn('Zoom to both features failed:', err))

        } catch (err) {
            console.warn('Error computing combined extent, falling back to nearby geometry:', err)
            // Fallback to just zooming to the nearby geometry
            view.goTo({
                target: nearbyGeometry,
                padding: { top: 50, bottom: 50, left: 50, right: 50 }
            }, {
                duration: 500,
                easing: 'ease-in-out'
            }).catch(zoomErr => console.warn('Fallback zoom failed:', zoomErr))
        }
    }, [])

    // Show all features on map for layers with showAllOnMap enabled
    const showAllFeaturesOnMap = useCallback((sectionResults: SectionResult[]) => {
        if (!showAllFeaturesLayerRef.current) return

        // Clear existing features
        showAllFeaturesLayerRef.current.removeAll()

        import('esri/Graphic').then(({ default: Graphic }) => {
            sectionResults.forEach(sr => {
                // Process regular layer results
                sr.layerResults.forEach(lr => {
                    const layerConfig = lr.layerConfig

                    // Only process layers with showAllOnMap enabled
                    if (!layerConfig.showAllOnMap) return

                    // Use showAllOnMapColor for displayed features, fallback to rowHighlightColor then default
                    const color = layerConfig.showAllOnMapColor || layerConfig.rowHighlightColor || '#FF6600'
                    const fillOpacity = layerConfig.rowHighlightFillOpacity ?? 0.2

                    // Parse hex color to RGB
                    const hex = color.replace('#', '')
                    const r = parseInt(hex.substr(0, 2), 16)
                    const g = parseInt(hex.substr(2, 2), 16)
                    const b = parseInt(hex.substr(4, 2), 16)

                    lr.features.forEach((feature, idx) => {
                        const geometry = feature.__geometry
                        if (!geometry) return

                        let symbol: any
                        const geometryType = geometry.type

                        if (geometryType === 'point' || geometryType === 'multipoint') {
                            symbol = {
                                type: 'simple-marker',
                                color: color,
                                size: 10,
                                outline: {
                                    color: '#FFFFFF',
                                    width: 1.5
                                }
                            }
                        } else if (geometryType === 'polyline') {
                            symbol = {
                                type: 'simple-line',
                                color: color,
                                width: 3
                            }
                        } else if (geometryType === 'polygon' || geometryType === 'extent') {
                            symbol = {
                                type: 'simple-fill',
                                color: [r, g, b, fillOpacity],
                                outline: {
                                    color: color,
                                    width: 2
                                }
                            }
                        } else {
                            symbol = {
                                type: 'simple-marker',
                                color: color,
                                size: 8
                            }
                        }

                        if (showAllFeaturesLayerRef.current) {
                            showAllFeaturesLayerRef.current.add(new Graphic({
                                geometry: geometry,
                                symbol: symbol,
                                attributes: {
                                    layerId: layerConfig.layerId,
                                    featureIndex: idx
                                }
                            }))
                        }
                    })
                })

                // Process nearby results (uses same layer config for showAllOnMap setting)
                if (sr.nearbyResults && sr.nearbyResults.length > 0) {
                    sr.nearbyResults.forEach(nearbyResult => {
                        const layerConfig = nearbyResult.layerConfig

                        // Only process layers with showAllOnMap enabled
                        if (!layerConfig.showAllOnMap) return

                        // Use showAllOnMapColor for displayed features, fallback to rowHighlightColor then default
                        const color = layerConfig.showAllOnMapColor || layerConfig.rowHighlightColor || '#FF6600'
                        const fillOpacity = layerConfig.rowHighlightFillOpacity ?? 0.2

                        // Parse hex color to RGB
                        const hex = color.replace('#', '')
                        const r = parseInt(hex.substr(0, 2), 16)
                        const g = parseInt(hex.substr(2, 2), 16)
                        const b = parseInt(hex.substr(4, 2), 16)

                        nearbyResult.features.forEach((feature, idx) => {
                            const geometry = feature.geometry
                            if (!geometry) return

                            let symbol: any
                            const geometryType = geometry.type

                            if (geometryType === 'point' || geometryType === 'multipoint') {
                                symbol = {
                                    type: 'simple-marker',
                                    color: color,
                                    size: 10,
                                    outline: {
                                        color: '#FFFFFF',
                                        width: 1.5
                                    }
                                }
                            } else if (geometryType === 'polyline') {
                                symbol = {
                                    type: 'simple-line',
                                    color: color,
                                    width: 3
                                }
                            } else if (geometryType === 'polygon' || geometryType === 'extent') {
                                symbol = {
                                    type: 'simple-fill',
                                    color: [r, g, b, fillOpacity],
                                    outline: {
                                        color: color,
                                        width: 2
                                    }
                                }
                            } else {
                                symbol = {
                                    type: 'simple-marker',
                                    color: color,
                                    size: 8
                                }
                            }

                            if (showAllFeaturesLayerRef.current) {
                                showAllFeaturesLayerRef.current.add(new Graphic({
                                    geometry: geometry,
                                    symbol: symbol,
                                    attributes: {
                                        layerId: layerConfig.layerId,
                                        featureIndex: idx,
                                        isNearby: true
                                    }
                                }))
                            }
                        })
                    })
                }
            })
        })
    }, [])

    const decimalToDMS = useCallback((decimal: number, isLat: boolean): string => {
        const absolute = Math.abs(decimal)
        const degrees = Math.floor(absolute)
        const minutesNotTruncated = (absolute - degrees) * 60
        const minutes = Math.floor(minutesNotTruncated)
        const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1)
        const direction = isLat
            ? (decimal >= 0 ? 'N' : 'S')
            : (decimal >= 0 ? 'E' : 'W')
        return `${degrees}°${minutes}'${seconds}"${direction}`
    }, [])

    const formatCoords = useCallback((point: Point | null): string => {
        if (!point) return 'N/A'

        const coordSystem = config.coordinateSystem || 'map'
        const coordFormat = config.coordinateFormat || 'decimal'
        const precision = config.coordinatePrecision ?? 6

        // Determine the label prefix based on coordinate system
        let labelPrefix = ''
        if (coordSystem === 'wgs84') {
            labelPrefix = coordFormat === 'dms' ? '' : 'Lat/Lon: '
        } else if (coordSystem === 'webmercator') {
            labelPrefix = 'Web Mercator: '
        } else if (coordSystem === 'custom' && config.customCoordinateWkid) {
            // Use custom label if provided, otherwise show WKID
            labelPrefix = config.customCoordinateLabel
                ? `${config.customCoordinateLabel}: `
                : `WKID ${config.customCoordinateWkid}: `
        }

        try {
            let displayPoint = point

            if (coordSystem === 'wgs84' && projectionLoaded && projection) {
                if (point.spatialReference?.wkid !== 4326) {
                    const wgs84SR = new SpatialReference({ wkid: 4326 })
                    displayPoint = projection.project(point, wgs84SR) as Point
                }

                if (displayPoint) {
                    const lat = displayPoint.latitude ?? displayPoint.y
                    const lon = displayPoint.longitude ?? displayPoint.x

                    if (coordFormat === 'dms') {
                        return `${decimalToDMS(lat, true)} ${decimalToDMS(lon, false)}`
                    } else {
                        return `${labelPrefix}${lat.toFixed(precision)}, ${lon.toFixed(precision)}`
                    }
                }
            } else if (coordSystem === 'webmercator' && projectionLoaded && projection) {
                if (point.spatialReference?.wkid !== 3857 && point.spatialReference?.wkid !== 102100) {
                    const webMercSR = new SpatialReference({ wkid: 3857 })
                    displayPoint = projection.project(point, webMercSR) as Point
                }

                if (displayPoint) {
                    return `${labelPrefix}${displayPoint.x.toFixed(precision)}, ${displayPoint.y.toFixed(precision)}`
                }
            } else if (coordSystem === 'custom' && projectionLoaded && projection && config.customCoordinateWkid) {
                // Custom WKID - project to user-specified coordinate system
                const customWkid = config.customCoordinateWkid
                if (point.spatialReference?.wkid !== customWkid) {
                    const customSR = new SpatialReference({ wkid: customWkid })
                    displayPoint = projection.project(point, customSR) as Point
                }

                if (displayPoint) {
                    return `${labelPrefix}${displayPoint.x.toFixed(precision)}, ${displayPoint.y.toFixed(precision)}`
                }
            } else {
                const x = point.x
                const y = point.y
                if (x != null && y != null) {
                    return `${x.toFixed(precision)}, ${y.toFixed(precision)}`
                }
            }
        } catch (e) {
            console.warn('Coordinate projection failed:', e)
        }

        const coords = getCoordinates(point)
        if (coords.lat == null || coords.lng == null) return 'N/A'
        return `${coords.lat.toFixed(precision)}, ${coords.lng.toFixed(precision)}`
    }, [config.coordinateSystem, config.coordinateFormat, config.coordinatePrecision, config.customCoordinateWkid, config.customCoordinateLabel, projectionLoaded, decimalToDMS])

    const grouped = useMemo(() => {
        const groups: GroupedSuggestions[] = []
        suggestions.forEach(s => {
            let group = groups.find(g => g.sourceName === s.sourceName)
            if (!group) {
                group = { sourceName: s.sourceName, sourceType: s.sourceType, suggestions: [] }
                groups.push(group)
            }
            group.suggestions.push(s)
        })
        return groups
    }, [suggestions])

    // Flatten suggestions for keyboard navigation
    const flatSuggestions = useMemo(() => {
        return suggestions
    }, [suggestions])

    const runQueryWithPointRef = useRef<((point: Point) => void) | null>(null)
    const enabledSourcesRef = useRef<typeof enabledSources>([])
    const setStateCallbacksRef = useRef<{
        setQueryPoint: (p: Point) => void
        setSearchText: (t: string) => void
        setDisplayedSearchText: (t: string) => void
        setSuggestions: (s: SearchSuggestion[]) => void
        setShowSuggestions: (b: boolean) => void
        setSelectByLocationActive: (b: boolean) => void
    } | null>(null)

    useEffect(() => {
        setStateCallbacksRef.current = {
            setQueryPoint,
            setSearchText,
            setDisplayedSearchText,
            setSuggestions,
            setShowSuggestions,
            setSelectByLocationActive
        }
    }, [])

    useEffect(() => {
        enabledSourcesRef.current = enabledSources
    }, [enabledSources])

    const handleMapReady = useCallback((jmv: JimuMapView) => {
        if (!jmv) return
        setMapView(jmv)
        mapViewRef.current = jmv

        import('esri/layers/GraphicsLayer').then(({ default: GraphicsLayer }) => {
            const gl = new GraphicsLayer({
                id: 'property-report-graphics',
                title: 'Property Report Graphics',
                listMode: 'hide'  // Hide from LayerList widget
            })
            jmv.view.map.add(gl)
            graphicsLayerRef.current = gl

            // Create a layer for "show all features" display
            const showAllLayer = new GraphicsLayer({
                id: 'property-report-show-all',
                title: 'All Features',
                listMode: 'hide'
            })
            jmv.view.map.add(showAllLayer)
            showAllFeaturesLayerRef.current = showAllLayer

            // Create a separate layer for row hover highlights (on top)
            const rowHighlightLayer = new GraphicsLayer({
                id: 'property-report-row-highlight',
                title: 'Row Highlight',
                listMode: 'hide'
            })
            jmv.view.map.add(rowHighlightLayer)
            rowHighlightLayerRef.current = rowHighlightLayer
        })

        jmv.view.on('click', async (event: any) => {
            if (!selectByLocationRef.current) return

            event.stopPropagation()

            const point = event.mapPoint
            const coordText = `${point.latitude?.toFixed(6) || point.y?.toFixed(6)}, ${point.longitude?.toFixed(6) || point.x?.toFixed(6)}`

            if (setStateCallbacksRef.current) {
                setStateCallbacksRef.current.setSelectByLocationActive(false)
                setStateCallbacksRef.current.setQueryPoint(point)
                setStateCallbacksRef.current.setSuggestions([])
                setStateCallbacksRef.current.setShowSuggestions(false)
            }

            let displayText = coordText
            const geocoderSource = enabledSourcesRef.current.find(s => s.type === 'geocoder')

            if (geocoderSource?.config.geocoderUrl) {
                try {
                    const address = await restReverseGeocode(geocoderSource.config.geocoderUrl, point)
                    if (address) {
                        displayText = address
                    }
                } catch (e) {
                    console.warn('Reverse geocoding failed, using coordinates:', e)
                }
            }

            if (setStateCallbacksRef.current) {
                setStateCallbacksRef.current.setSearchText(displayText)
                setStateCallbacksRef.current.setDisplayedSearchText(displayText)
            }

            if (runQueryWithPointRef.current) {
                runQueryWithPointRef.current(point)
            }
        })
    }, [])

    // Cleanup: remove graphics layer when widget unmounts/closes
    useEffect(() => {
        return () => {
            // Clear any pending search timeout
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current)
            }
            // Reset cursor if it was set to crosshair
            if (mapViewRef.current?.view?.container) {
                mapViewRef.current.view.container.style.cursor = ''
            }
            // Remove graphics layer
            if (graphicsLayerRef.current) {
                graphicsLayerRef.current.removeAll()
                if (mapViewRef.current?.view?.map) {
                    mapViewRef.current.view.map.remove(graphicsLayerRef.current)
                }
                graphicsLayerRef.current = null
            }
            // Remove row highlight layer
            if (rowHighlightLayerRef.current) {
                rowHighlightLayerRef.current.removeAll()
                if (mapViewRef.current?.view?.map) {
                    mapViewRef.current.view.map.remove(rowHighlightLayerRef.current)
                }
                rowHighlightLayerRef.current = null
            }
            // Remove show all features layer
            if (showAllFeaturesLayerRef.current) {
                showAllFeaturesLayerRef.current.removeAll()
                if (mapViewRef.current?.view?.map) {
                    mapViewRef.current.view.map.remove(showAllFeaturesLayerRef.current)
                }
                showAllFeaturesLayerRef.current = null
            }
        }
    }, [])

    // Clear graphics when widget is closed (sidebar collapse, widget controller, etc.)
    useEffect(() => {
        if (widgetState === WidgetState.Closed) {
            // Reset cursor
            if (mapViewRef.current?.view?.container) {
                mapViewRef.current.view.container.style.cursor = ''
            }
            // Clear all graphics
            if (graphicsLayerRef.current) {
                graphicsLayerRef.current.removeAll()
            }
            // Clear show all features
            if (showAllFeaturesLayerRef.current) {
                showAllFeaturesLayerRef.current.removeAll()
            }
            // Clear row highlight layer
            if (rowHighlightLayerRef.current) {
                rowHighlightLayerRef.current.removeAll()
            }
            // Reset select by location mode
            setSelectByLocationActive(false)
            // Clear results and reset widget state
            setSearchText('')
            setDisplayedSearchText('')
            setSuggestions([])
            setShowSuggestions(false)
            setQueryPoint(null)
            setResults([])
            setHeaderInfoData(null)
            setHighlightedGeometry(null)
            setSeparatePaneData(null)
            setError(null)
            setStatusMessage('')
            setOpenSections(new Set())
            animatedChartsRef.current.clear()
        }
    }, [widgetState])

    // =====================================================
    // MESSAGE ACTION LISTENER
    // Responds to triggers from Search, Map, Near Me, etc.
    // When another widget triggers "Generate Report", this
    // receives the point geometry and executes the query.
    // =====================================================
    useEffect(() => {
        try {
            const actionData = (props as any).mutableStateProps?.actionPoint
            if (!actionData || !actionData.point) return

            const { point: pointData, address, autoOpenSection, timestamp } = actionData

            // Prevent re-processing the same action
            if (lastActionTimestampRef.current === timestamp) return
            lastActionTimestampRef.current = timestamp

            // Ensure map is ready
            if (!mapViewRef.current) {
                console.warn('Property Report: Map not ready for action trigger')
                return
            }

            // Create an ArcGIS Point from the serialized data
            const actionPoint = new Point({
                x: pointData.x,
                y: pointData.y,
                spatialReference: pointData.spatialReference
                    ? new SpatialReference(pointData.spatialReference)
                    : new SpatialReference({ wkid: 4326 })
            })

            // Update the search display text
            if (address) {
                setSearchText(address)
                setDisplayedSearchText(address)
            } else {
                const coordText = `${pointData.y?.toFixed(6)}, ${pointData.x?.toFixed(6)}`
                setSearchText(coordText)
                setDisplayedSearchText(coordText)
            }

            // Clear suggestions
            setSuggestions([])
            setShowSuggestions(false)

            // Set query point and run the query
            setQueryPoint(actionPoint)

            // Use ref-based runner to avoid stale closure
            if (runQueryWithPointRef.current) {
                runQueryWithPointRef.current(actionPoint)
            }
        } catch (err) {
            console.error('Property Report: Error processing action trigger', err)
        }
    }, [(props as any).mutableStateProps?.actionPoint])


    const onInputChange = (value: string) => {
        setSearchText(value)
        setHighlightedIndex(-1)
        if (searchTimeout.current) clearTimeout(searchTimeout.current)
        if (!value.trim()) {
            setSuggestions([])
            setShowSuggestions(false)
            return
        }
        searchTimeout.current = setTimeout(() => fetchSuggestions(value), 300)
    }

    const fetchSuggestions = async (text: string) => {
        if (!text.trim() || enabledSources.length === 0) return
        setSearching(true)
        setShowSuggestions(true)
        const allSuggestions: SearchSuggestion[] = []

        for (const source of enabledSources) {
            try {
                if (source.type === 'geocoder' && source.config.geocoderUrl) {
                    const suggestParams: any = { text }
                    if (mapView?.view?.center) {
                        suggestParams.location = mapView.view.center
                    }
                    const suggestions = await restSuggest(source.config.geocoderUrl, text, mapView?.view?.center)
                    suggestions.forEach((s: any) => {
                        allSuggestions.push({ text: s.text, sourceName: source.sourceName, sourceType: 'geocoder' })
                    })
                } else if (source.type === 'layer') {
                    const cfg = source.config as any
                    let layer: FeatureLayer | null = null

                    if (cfg.dataSourceId) {
                        const ds = DataSourceManager.getInstance().getDataSource(cfg.dataSourceId)
                        if (ds) {
                            await (ds as any).ready?.()
                            const dsJson = (ds as any).getDataSourceJson?.()
                            const url = dsJson?.url || (ds as any).url
                            if (url) layer = new FeatureLayer({ url })
                        }
                    }

                    if (!layer) continue

                    const searchFields = toMutable<string>(cfg.searchFields) || []
                    if (searchFields.length === 0) continue

                    const query = layer.createQuery()
                    const whereClauses = searchFields.map((f: string) => `UPPER(${f}) LIKE '%${text.toUpperCase().replace(/'/g, "''")}%'`)
                    query.where = whereClauses.join(' OR ')
                    query.outFields = ['*']
                    query.returnGeometry = true
                    query.num = cfg.maxSuggestions || 6

                    // Set output spatial reference to match the map view
                    if (mapView?.view?.spatialReference) {
                        query.outSpatialReference = mapView.view.spatialReference
                    }

                    const result = await layer.queryFeatures(query)
                    result.features.forEach((f: any) => {
                        const displayField = cfg.displayField || searchFields[0]
                        const displayVal = f.attributes[displayField]
                        const point = f.geometry?.type === 'point' ? f.geometry as Point : f.geometry?.extent?.center
                        allSuggestions.push({
                            text: displayVal || 'Unknown',
                            point,
                            geometry: f.geometry,
                            sourceName: source.sourceName,
                            sourceType: 'layer',
                            sourceId: cfg.sourceId,
                            highlightEnabled: cfg.highlightEnabled,
                            highlightColor: cfg.highlightColor
                        })
                    })
                } else if (source.type === 'url' && source.config.url) {
                    const cfg = source.config as any
                    const layer = new FeatureLayer({ url: cfg.url })

                    const searchFields = toMutable<string>(cfg.searchFields) || []
                    if (searchFields.length === 0) continue

                    const query = layer.createQuery()
                    const whereClauses = searchFields.map((f: string) => `UPPER(${f}) LIKE '%${text.toUpperCase().replace(/'/g, "''")}%'`)
                    query.where = whereClauses.join(' OR ')
                    query.outFields = ['*']
                    query.returnGeometry = true
                    query.num = cfg.maxSuggestions || 6

                    // Set output spatial reference to match the map view
                    if (mapView?.view?.spatialReference) {
                        query.outSpatialReference = mapView.view.spatialReference
                    }

                    const result = await layer.queryFeatures(query)
                    result.features.forEach((f: any) => {
                        const displayField = cfg.displayField || searchFields[0]
                        const displayVal = f.attributes[displayField]
                        const point = f.geometry?.type === 'point' ? f.geometry as Point : f.geometry?.extent?.center
                        allSuggestions.push({
                            text: displayVal || 'Unknown',
                            point,
                            geometry: f.geometry,
                            sourceName: source.sourceName,
                            sourceType: 'url',
                            sourceId: cfg.sourceId,
                            highlightEnabled: cfg.highlightEnabled,
                            highlightColor: cfg.highlightColor
                        })
                    })
                }
            } catch (e) {
                console.warn(`Search source ${source.sourceName} failed:`, e)
            }
        }

        setSuggestions(allSuggestions)
        setSearching(false)

        // ACCESSIBILITY: Announce results to screen readers
        if (allSuggestions.length > 0) {
            setStatusMessage(`${allSuggestions.length} suggestion${allSuggestions.length !== 1 ? 's' : ''} available. Use arrow keys to navigate.`)
        } else {
            setStatusMessage('No suggestions found.')
        }
    }

    const selectSuggestion = async (suggestion: SearchSuggestion) => {
        setSearchText(suggestion.text)
        setDisplayedSearchText(suggestion.text)
        setSuggestions([])
        setShowSuggestions(false)
        setHighlightedIndex(-1)

        // Store suggestion geometry for PDF map capture (may be overwritten by highlight layer query)
        if (suggestion.geometry) {
            setHighlightedGeometry(suggestion.geometry)
        }

        if (suggestion.highlightEnabled && suggestion.geometry && graphicsLayerRef.current) {
            const color = suggestion.highlightColor || '#00FFFF'
            const rgb = hexToRgb(color)

            // Project geometry to view's spatial reference if needed
            let geomToUse = suggestion.geometry
            const view = mapViewRef.current?.view
            if (view && suggestion.geometry.spatialReference) {
                const viewSR = view.spatialReference
                const geomSR = suggestion.geometry.spatialReference
                // Check if projection is needed using equals() method
                const needsProjection = geomSR && viewSR && !geomSR.equals(viewSR)

                if (needsProjection) {
                    try {
                        if (projection && typeof projection.load === "function") await projection.load()
                        const projected = projection.project(
                            suggestion.geometry as Point | any | any | Extent | any,
                            viewSR
                        )
                        if (projected && !Array.isArray(projected)) {
                            geomToUse = projected
                        }
                    } catch (projErr) {
                        console.warn('Failed to project suggestion geometry:', projErr)
                    }
                }
            }

            let highlightSymbol: any
            const geomType = geomToUse.type

            if (geomType === 'polygon') {
                highlightSymbol = {
                    type: 'simple-fill',
                    color: [0, 0, 0, 0],
                    outline: { color: [...rgb, 1], width: 3 }
                }
            } else if (geomType === 'polyline') {
                highlightSymbol = {
                    type: 'simple-line',
                    color: [...rgb, 1],
                    width: 4
                }
            } else if (geomType === 'point' || geomType === 'multipoint') {
                highlightSymbol = {
                    type: 'simple-marker',
                    color: rgb,
                    size: 14,
                    outline: { color: [255, 255, 255], width: 2 }
                }
            }

            if (highlightSymbol) {
                graphicsLayerRef.current.add(new Graphic({
                    geometry: geomToUse,
                    symbol: highlightSymbol
                }))
            }
        }

        if (suggestion.point) {
            setQueryPoint(suggestion.point)
            runQueryWithPoint(suggestion.point)
        } else if (suggestion.sourceType === 'geocoder') {
            const source = enabledSources.find(s => s.sourceName === suggestion.sourceName)
            if (source?.config.geocoderUrl) {
                try {
                    const location = await restGeocode(source.config.geocoderUrl, suggestion.text)
                    if (location) {
                        setQueryPoint(location)
                        runQueryWithPoint(location)
                    }
                } catch (e) {
                    setError('Failed to geocode address')
                }
            }
        }
    }

    // ACCESSIBILITY: Keyboard navigation for suggestions
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || flatSuggestions.length === 0) {
            if (e.key === 'Enter') {
                setSuggestions([])
                setShowSuggestions(false)
                runQuery()
            }
            return
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setHighlightedIndex(prev =>
                    prev < flatSuggestions.length - 1 ? prev + 1 : 0
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : flatSuggestions.length - 1
                )
                break
            case 'Enter':
                e.preventDefault()
                if (highlightedIndex >= 0 && highlightedIndex < flatSuggestions.length) {
                    selectSuggestion(flatSuggestions[highlightedIndex])
                } else {
                    setSuggestions([])
                    setShowSuggestions(false)
                    runQuery()
                }
                break
            case 'Escape':
                e.preventDefault()
                setSuggestions([])
                setShowSuggestions(false)
                setHighlightedIndex(-1)
                break
            case 'Tab':
                setSuggestions([])
                setShowSuggestions(false)
                setHighlightedIndex(-1)
                break
        }
    }

    const runQuery = async () => {
        if (!searchText.trim() && !queryPoint) {
            setError('Please search for a property or select a location from the map')
            return
        }

        // Only use existing queryPoint if search text hasn't changed
        // This prevents gibberish searches from reusing old results
        const textMatchesQueryPoint = queryPoint &&
            searchText.trim().toLowerCase() === displayedSearchText.trim().toLowerCase()

        if (textMatchesQueryPoint) {
            runQueryWithPoint(queryPoint)
            return
        }

        // Text changed or no queryPoint - need to geocode
        const geocoderSource = enabledSources.find(s => s.type === 'geocoder')
        if (geocoderSource?.config.geocoderUrl) {
            try {
                setLoading(true)
                setStatusMessage('Searching...')
                const location = await restGeocode(geocoderSource.config.geocoderUrl, searchText)
                if (location) {
                    // Only update displayed text after successful geocode
                    setDisplayedSearchText(searchText)
                    setQueryPoint(location)
                    runQueryWithPoint(location)
                } else {
                    setError('Address not found. Try a different search or use the map to select a location.')
                    setStatusMessage('Address not found')
                    setLoading(false)
                }
            } catch (e: any) {
                console.error('Geocoding error:', e)
                const errorMessage = e?.message?.toLowerCase() || ''
                if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('cors')) {
                    setError('Network error. Please check your connection and try again.')
                } else if (errorMessage.includes('timeout')) {
                    setError('Search timed out. Please try again.')
                } else {
                    setError('Search failed. Try using the map to select a location instead.')
                }
                setStatusMessage('Geocoding failed')
                setLoading(false)
            }
        } else {
            setError('No geocoder configured. Use the map to select a location.')
        }
    }

    // =====================================================
    // CLIENT-SIDE QUERY HELPER
    // Queries features from layers already loaded in the map
    // Much faster than server queries for visible layers
    // =====================================================
    const queryLayerClientSide = async (
        layerUrl: string,
        query: any,
        mapViewRef: JimuMapView
    ): Promise<any | null> => {
        try {
            // Find the layer in the map by URL
            const allLayers = mapViewRef.view.map.allLayers
            let targetLayer: FeatureLayer | null = null

            // Normalize URL for comparison (remove trailing slashes, query params)
            const normalizeUrl = (url: string) => {
                if (!url) return ''
                return url.split('?')[0].replace(/\/+$/, '').toLowerCase()
            }
            const normalizedTargetUrl = normalizeUrl(layerUrl)

            allLayers.forEach((layer: any) => {
                if (layer.type === 'feature' && layer.url) {
                    const normalizedLayerUrl = normalizeUrl(layer.url)
                    if (normalizedLayerUrl === normalizedTargetUrl) {
                        targetLayer = layer as FeatureLayer
                    }
                }
            })

            if (!targetLayer) {
                // Layer not found in map, return null to fall back to server query
                return null
            }

            // Get the LayerView for client-side query
            const layerView = await mapViewRef.view.whenLayerView(targetLayer) as any

            // Check if layer view supports client-side queries
            if (layerView && typeof layerView.queryFeatures === 'function') {
                // Perform client-side query
                const result = await layerView.queryFeatures(query)
                return result
            }

            return null
        } catch (error) {
            console.warn('Client-side query failed, will fall back to server:', error)
            return null
        }
    }

    const runQueryWithPoint = async (point: Point) => {
        if (!mapView) return
        setLoading(true)
        setError(null)
        setResults([])
        setHeaderInfoData(null)
        setHighlightedGeometry(null)
        setStatusMessage('Querying layers...')
        // Reset animated charts tracker for new query
        animatedChartsRef.current.clear()

        if (graphicsLayerRef.current) {
            graphicsLayerRef.current.removeAll()
        }

        // Clear show all features layer
        if (showAllFeaturesLayerRef.current) {
            showAllFeaturesLayerRef.current.removeAll()
        }

        mapView.view.goTo({ target: point, zoom: 16 })

        // Highlight layer
        if (config.highlightLayer?.enabled && graphicsLayerRef.current) {
            try {
                const hlc = config.highlightLayer as any
                let highlightUrl: string | null = null

                // Try to get URL from DataSource first
                if (hlc.dataSourceId) {
                    try {
                        const ds = DataSourceManager.getInstance().getDataSource(hlc.dataSourceId)
                        if (ds) {
                            await (ds as any).ready?.()
                            const dsJson = (ds as any).getDataSourceJson?.()
                            highlightUrl = dsJson?.url || (ds as any).url || null
                        }
                    } catch (dsErr) {
                        console.warn(`Highlight DataSource ${hlc.dataSourceId} not available`, dsErr)
                    }
                }

                // Fall back to layerUrl if DataSource didn't provide a URL
                if (!highlightUrl && hlc.layerUrl) {
                    highlightUrl = hlc.layerUrl
                }

                if (highlightUrl) {
                    const highlightFeatureLayer = new FeatureLayer({ url: highlightUrl })

                    await highlightFeatureLayer.load()

                    const query = highlightFeatureLayer.createQuery()
                    query.geometry = point
                    query.spatialRelationship = 'intersects'
                    query.outFields = ['*']
                    query.returnGeometry = true

                    const viewSR = mapView.view.spatialReference

                    if (hlc.outSpatialReference) {
                        query.outSpatialReference = new SpatialReference({ wkid: hlc.outSpatialReference })
                    } else if (viewSR) {
                        query.outSpatialReference = viewSR
                    }

                    const result = await highlightFeatureLayer.queryFeatures(query)

                    if (result.features.length > 0) {
                        let geometry = result.features[0].geometry

                        // Apply geometry offset if configured (for datum correction)
                        // Positive X = shift east, Positive Y = shift north
                        const offsetX = hlc.geometryOffsetX || 0
                        const offsetY = hlc.geometryOffsetY || 0

                        if ((offsetX !== 0 || offsetY !== 0) && geometry) {
                            if (geometry.type === 'polygon') {
                                const poly = geometry as any
                                const newRings = poly.rings.map(ring =>
                                    ring.map(coord => [coord[0] + offsetX, coord[1] + offsetY, ...(coord.slice(2))])
                                )
                                geometry = new Polygon({
                                    rings: newRings,
                                    spatialReference: poly.spatialReference
                                })
                            } else if (geometry.type === 'polyline') {
                                const line = geometry as any
                                const newPaths = line.paths.map(path =>
                                    path.map(coord => [coord[0] + offsetX, coord[1] + offsetY, ...(coord.slice(2))])
                                )
                                geometry = new Polyline({
                                    paths: newPaths,
                                    spatialReference: line.spatialReference
                                })
                            } else if (geometry.type === 'point') {
                                const pt = geometry as Point
                                geometry = new Point({
                                    x: pt.x + offsetX,
                                    y: pt.y + offsetY,
                                    spatialReference: pt.spatialReference
                                })
                            }
                        }

                        // Store geometry for PDF map capture
                        setHighlightedGeometry(geometry)

                        const color = hlc.highlightColor || '#00FFFF'
                        const fillOpacity = hlc.fillOpacity ?? 0
                        const rgb = hexToRgb(color)

                        let highlightSymbol: any
                        if (geometry.type === 'polygon') {
                            highlightSymbol = {
                                type: 'simple-fill',
                                color: [...rgb, fillOpacity],
                                outline: { color: [...rgb, 1], width: 3 }
                            }
                        } else if (geometry.type === 'polyline') {
                            highlightSymbol = {
                                type: 'simple-line',
                                color: [...rgb, 1],
                                width: 4
                            }
                        } else if (geometry.type === 'point' || geometry.type === 'multipoint') {
                            highlightSymbol = {
                                type: 'simple-marker',
                                color: rgb,
                                size: 14,
                                outline: { color: [255, 255, 255], width: 2 }
                            }
                        }

                        if (highlightSymbol) {
                            graphicsLayerRef.current.add(new Graphic({
                                geometry,
                                symbol: highlightSymbol
                            }))
                        }
                    }
                }
            } catch (e) {
                console.warn('Highlight layer query failed:', e)
            }
        }

        // Add point marker
        graphicsLayerRef.current?.add(new Graphic({
            geometry: point,
            symbol: {
                type: 'simple-marker',
                color: hexToRgb(theme.sectionHeader),
                size: 12,
                outline: { color: [255, 255, 255], width: 2 }
            } as any
        }))

        // Query header info layer if configured
        if (config.headerInfo?.enabled) {
            try {
                const hic = config.headerInfo as any
                let headerLayer: FeatureLayer | null = null
                let headerUrl: string | null = null

                // Try to get URL from DataSource first
                if (hic.dataSourceId) {
                    try {
                        const ds = DataSourceManager.getInstance().getDataSource(hic.dataSourceId)
                        if (ds) {
                            await (ds as any).ready?.()
                            const dsJson = (ds as any).getDataSourceJson?.()
                            headerUrl = dsJson?.url || (ds as any).url || null
                        }
                    } catch (dsErr) {
                        console.warn(`HeaderInfo DataSource ${hic.dataSourceId} not available`, dsErr)
                    }
                }

                // Fall back to layerUrl if DataSource didn't provide a URL
                if (!headerUrl && hic.layerUrl) {
                    headerUrl = hic.layerUrl
                }

                if (headerUrl) {
                    headerLayer = new FeatureLayer({ url: headerUrl })
                    const query = headerLayer.createQuery()
                    query.geometry = point
                    query.spatialRelationship = 'intersects'
                    query.outFields = ['*']
                    query.returnGeometry = false

                    let result: any | null = null

                    // Try client-side query if enabled
                    if (config.enableClientSideQuery && mapView) {
                        result = await queryLayerClientSide(headerUrl, query, mapView)
                    }

                    // Fall back to server query
                    if (!result) {
                        result = await headerLayer.queryFeatures(query)
                    }

                    if (result.features.length > 0) {
                        const attributes = result.features[0].attributes
                        setHeaderInfoData(attributes)
                    }
                }

                // If geocoderUrl is configured, reverse geocode the point for header title
                const headerGeocoderUrl = (config.headerInfo as any)?.geocoderUrl
                if (headerGeocoderUrl) {
                    try {
                        const address = await restReverseGeocode(headerGeocoderUrl, point)
                        if (address) {
                            setDisplayedSearchText(address)
                        }
                    } catch (geoErr) {
                        console.warn('Header reverse geocoding failed:', geoErr)
                    }
                }
            } catch (e) {
                console.warn('Header info layer query failed:', e)
            }
        }

        // Section queries
        const sections = toMutable<SectionConfig>(config.sections)
        const sectionResults: SectionResult[] = []

        for (const section of sections) {
            const layers = toMutable<LayerConfig>(section.layers)
            const layerResults: LayerResult[] = []

            for (const layerConfig of layers) {
                // Skip layers with nearby mode enabled - they're queried separately
                if (layerConfig.nearbyConfig?.enabled) {
                    continue
                }

                try {
                    const lc = layerConfig as any
                    let features: any[] = []

                    let queryGeometry: any = point
                    if (lc.bufferDistance && lc.bufferDistance > 0) {
                        const bufferUnit = lc.bufferUnit || 'feet'
                        queryGeometry = (() => { try { return geometryEngine.buffer(point, lc.bufferDistance, bufferUnit as any) } catch (e) { return null } })()
                    }

                    // Determine the URL to use - try DataSource first, fall back to layerUrl
                    let queryUrl: string | null = null

                    if (lc.dataSourceId) {
                        try {
                            const ds = DataSourceManager.getInstance().getDataSource(lc.dataSourceId)
                            if (ds) {
                                await (ds as any).ready?.()
                                const dsJson = (ds as any).getDataSourceJson?.()
                                queryUrl = dsJson?.url || (ds as any).url || null
                            }
                        } catch (dsErr) {
                            console.warn(`DataSource ${lc.dataSourceId} not available, falling back to layerUrl`, dsErr)
                        }
                    }

                    // Fall back to layerUrl if DataSource didn't provide a URL
                    if (!queryUrl && lc.layerUrl) {
                        queryUrl = lc.layerUrl
                    }

                    // Execute query if we have a URL
                    let layerDomainLookup: DomainLookup = {}
                    if (queryUrl) {
                        const layer = new FeatureLayer({ url: queryUrl })

                        // Extract domain lookup for coded value fields
                        layerDomainLookup = await extractDomainLookup(layer)

                        const query = layer.createQuery()
                        query.geometry = queryGeometry
                        query.spatialRelationship = 'intersects'
                        query.outFields = ['*']
                        query.returnGeometry = true

                        // Set output spatial reference to match the map view
                        if (mapView?.view?.spatialReference) {
                            query.outSpatialReference = mapView.view.spatialReference
                        }

                        let result: any | null = null

                        // Try client-side query if enabled
                        if (config.enableClientSideQuery && mapView) {
                            result = await queryLayerClientSide(queryUrl, query, mapView)
                        }

                        // Fall back to server query if client-side not available or not enabled
                        if (!result) {
                            result = await layer.queryFeatures(query)
                        }

                        // Store geometry with attributes for spatial related queries
                        features = result.features.map(f => ({
                            ...f.attributes,
                            __geometry: f.geometry
                        }))
                    }

                    // Query related tables if configured
                    let relatedData: RelatedTableResult[] = []
                    const relatedTables = toMutable<RelatedTableConfig>(layerConfig.relatedTables) || []

                    if (relatedTables.length > 0 && features.length > 0) {

                        // Get first feature geometry for spatial queries
                        let parentGeometry: any | null = null
                        if (features.length > 0) {
                            // Try to get geometry from the first feature's query result
                            // This requires returnGeometry: true in the parent query
                            const firstFeature = features[0]
                            if ((firstFeature as any).__geometry) {
                                parentGeometry = (firstFeature as any).__geometry
                            } else {
                            }
                        }

                        for (const relTable of relatedTables) {
                            try {
                                if (!relTable.tableUrl) {
                                    console.warn(`[Related Tables] Skipping ${relTable.tableName} - no tableUrl configured`)
                                    continue
                                }


                                const relLayer = new FeatureLayer({ url: relTable.tableUrl })
                                const relQuery = relLayer.createQuery()

                                // Build query based on relationship type
                                if (relTable.relationshipType === 'spatial') {
                                    // SPATIAL RELATIONSHIP - query by geometry
                                    let queryGeometry: any = point

                                    // Use parent feature geometry if configured and available
                                    if (relTable.useParentGeometry !== false && parentGeometry) {
                                        queryGeometry = parentGeometry
                                    } else {
                                    }

                                    // Apply buffer if configured
                                    if (relTable.spatialBuffer && relTable.spatialBuffer > 0) {
                                        const bufferUnit = relTable.spatialBufferUnit || 'feet'
                                        queryGeometry = (() => { try { return geometryEngine.buffer(queryGeometry as Point | any | any, relTable.spatialBuffer, bufferUnit as any) as any } catch (e) { return null } })()
                                    }

                                    relQuery.geometry = queryGeometry
                                    relQuery.spatialRelationship = (relTable.spatialRelationship === 'nearby' ? 'intersects' : relTable.spatialRelationship || 'intersects') as any
                                    relQuery.where = '1=1'
                                    relQuery.returnGeometry = false

                                } else if (relTable.relationshipType === 'key' && relTable.primaryKeyField && relTable.foreignKeyField) {
                                    // KEY-BASED RELATIONSHIP - foreign key join
                                    const keyValues = [...new Set(features.map(f => f[relTable.primaryKeyField!]).filter(v => v != null))]
                                    if (keyValues.length > 0) {
                                        const quotedValues = keyValues.map(v => typeof v === 'string' ? `'${v}'` : v)
                                        relQuery.where = `${relTable.foreignKeyField} IN (${quotedValues.join(',')})`
                                    } else {
                                        relQuery.where = '1=0' // No matching keys
                                    }
                                    relQuery.returnGeometry = false

                                } else {
                                    // Relationship class or unsupported - skip for now
                                    relQuery.where = '1=0'
                                    relQuery.returnGeometry = false
                                }

                                relQuery.outFields = ['*']
                                if (relTable.sortField) {
                                    relQuery.orderByFields = [`${relTable.sortField} ${relTable.sortOrder || 'asc'}`]
                                }
                                relQuery.num = relTable.maxRecords || 50

                                // Extract domain lookup for related table
                                const relDomainLookup = await extractDomainLookup(relLayer)

                                const relResult = await relLayer.queryFeatures(relQuery)
                                relatedData.push({
                                    tableConfig: relTable,
                                    records: relResult.features.map(f => f.attributes),
                                    domainLookup: relDomainLookup
                                })
                            } catch (e) {
                                console.warn(`Related table query failed for ${relTable.tableName}:`, e)
                                relatedData.push({
                                    tableConfig: relTable,
                                    records: [],
                                    error: String(e)
                                })
                            }
                        }
                    }

                    layerResults.push({ layerConfig, features, relatedData, domainLookup: layerDomainLookup })
                } catch (e) {
                    console.error(`Query failed for ${layerConfig.layerTitle}:`, e)
                    layerResults.push({ layerConfig, features: [] })
                }
            }

            const totalFeatures = layerResults.reduce((sum, lr) => sum + lr.features.length, 0)
            let chartData: any[] = []

            // Get chart configuration
            const chartConfig = section.chartConfig || {}
            const chartMode = chartConfig.chartMode || 'category'
            const categoryField = chartConfig.categoryField || section.chartField
            const valueField = chartConfig.valueField
            const aggregation = chartConfig.aggregation || 'count'
            const maxCategories = chartConfig.maxCategories || 10
            const sortBy = chartConfig.sortBy || 'value'
            const sortOrder = chartConfig.sortOrder || 'desc'
            const compareFields = chartConfig.compareFields || []
            const groupByField = chartConfig.groupByField

            if (chartMode === 'fields') {
                // FIELDS COMPARISON MODE - compare multiple numeric fields
                const enabledFields = compareFields.filter(f => f.enabled)

                if (enabledFields.length > 0) {
                    if (groupByField) {
                        // Group field comparison by a category
                        const groups: Record<string, Record<string, number[]>> = {}

                        layerResults.forEach(lr => {
                            lr.features.forEach(f => {
                                const category = String(f[groupByField] ?? 'Unknown')
                                if (!groups[category]) {
                                    groups[category] = {}
                                    enabledFields.forEach(ef => {
                                        groups[category][ef.fieldName] = []
                                    })
                                }

                                enabledFields.forEach(ef => {
                                    const numVal = parseFloat(f[ef.fieldName])
                                    if (!isNaN(numVal)) {
                                        groups[category][ef.fieldName].push(numVal)
                                    }
                                })
                            })
                        })

                        // Aggregate and format for multi-series chart
                        chartData = Object.entries(groups).map(([name, fieldValues]) => {
                            const dataPoint: any = { name }
                            enabledFields.forEach(ef => {
                                const values = fieldValues[ef.fieldName] || []
                                const sum = values.reduce((a, b) => a + b, 0)
                                dataPoint[ef.alias || ef.fieldName] = Math.round(sum * 100) / 100
                            })
                            return dataPoint
                        })
                    } else {
                        // Sum all values for each field (no grouping)
                        const fieldTotals: Record<string, number> = {}

                        enabledFields.forEach(ef => {
                            fieldTotals[ef.fieldName] = 0
                        })

                        layerResults.forEach(lr => {
                            lr.features.forEach(f => {
                                enabledFields.forEach(ef => {
                                    const numVal = parseFloat(f[ef.fieldName])
                                    if (!isNaN(numVal)) {
                                        fieldTotals[ef.fieldName] += numVal
                                    }
                                })
                            })
                        })

                        // Format as simple bar chart data
                        chartData = enabledFields.map(ef => ({
                            name: ef.alias || ef.fieldName,
                            value: Math.round(fieldTotals[ef.fieldName] * 100) / 100,
                            fill: ef.color || CHART_COLORS[enabledFields.indexOf(ef) % CHART_COLORS.length]
                        }))
                    }
                }
            } else if (categoryField) {
                // CATEGORY MODE - group by a category field
                const groups: Record<string, number[]> = {}

                layerResults.forEach(lr => {
                    lr.features.forEach(f => {
                        const category = String(f[categoryField] ?? 'Unknown')
                        if (!groups[category]) {
                            groups[category] = []
                        }

                        if (aggregation === 'count') {
                            groups[category].push(1)
                        } else if (valueField) {
                            const numVal = parseFloat(f[valueField])
                            if (!isNaN(numVal)) {
                                groups[category].push(numVal)
                            }
                        }
                    })
                })

                // Aggregate values per category
                const aggregatedData = Object.entries(groups).map(([name, values]) => {
                    let value = 0
                    if (values.length > 0) {
                        switch (aggregation) {
                            case 'count':
                                value = values.length
                                break
                            case 'sum':
                                value = values.reduce((a, b) => a + b, 0)
                                break
                            case 'avg':
                                value = values.reduce((a, b) => a + b, 0) / values.length
                                break
                            case 'min':
                                value = Math.min(...values)
                                break
                            case 'max':
                                value = Math.max(...values)
                                break
                            default:
                                value = values.length
                        }
                    }
                    // Round to 2 decimal places for display
                    value = Math.round(value * 100) / 100
                    return { name, value }
                })

                // Sort data
                if (sortBy !== 'none') {
                    aggregatedData.sort((a, b) => {
                        if (sortBy === 'value') {
                            return sortOrder === 'desc' ? b.value - a.value : a.value - b.value
                        } else {
                            return sortOrder === 'desc'
                                ? b.name.localeCompare(a.name)
                                : a.name.localeCompare(b.name)
                        }
                    })
                }

                // Limit categories and group remainder as "Other"
                if (aggregatedData.length > maxCategories) {
                    const topCategories = aggregatedData.slice(0, maxCategories - 1)
                    const otherCategories = aggregatedData.slice(maxCategories - 1)
                    const otherValue = otherCategories.reduce((sum, item) => sum + item.value, 0)
                    topCategories.push({
                        name: `Other (${otherCategories.length})`,
                        value: Math.round(otherValue * 100) / 100
                    })
                    chartData = topCategories
                } else {
                    chartData = aggregatedData
                }
            }

            // ====== NEARBY MODE QUERY ======
            // Query features for layers with nearby display mode enabled
            const nearbyResults: NearbyResult[] = []
            const nearbyLayers = toMutable<LayerConfig>(section.layers)

            for (const layerConfig of nearbyLayers) {
                const nearbyConfig = layerConfig.nearbyConfig

                // Skip if nearby mode not enabled or title field not configured
                if (!nearbyConfig?.enabled || !nearbyConfig.titleField) {
                    continue
                }

                // Get layer URL from either dataSourceId or direct layerUrl
                let nearbyLayerUrl: string | null = null

                // Try to get URL from DataSource first
                if (layerConfig.dataSourceId) {
                    try {
                        const ds = DataSourceManager.getInstance().getDataSource(layerConfig.dataSourceId)
                        if (ds) {
                            await (ds as any).ready?.()
                            const dsJson = (ds as any).getDataSourceJson?.()
                            nearbyLayerUrl = dsJson?.url || (ds as any).url || null

                            // If still no URL, try to get from the underlying layer
                            if (!nearbyLayerUrl) {
                                const layer = (ds as any).layer || (ds as any).getLayerDefinition?.()
                                nearbyLayerUrl = layer?.url || null
                            }
                        }
                    } catch (dsErr) {
                        console.warn(`DataSource ${layerConfig.dataSourceId} not available for nearby query`, dsErr)
                    }
                }

                // Fall back to layerUrl if DataSource didn't provide a URL
                if (!nearbyLayerUrl && layerConfig.layerUrl) {
                    nearbyLayerUrl = layerConfig.layerUrl
                }

                if (!nearbyLayerUrl) {
                    continue // Skip if no URL available
                }

                try {
                    const nearbyLayer = new FeatureLayer({ url: nearbyLayerUrl })
                    const query = nearbyLayer.createQuery()

                    // Convert search radius to meters for buffer
                    const searchRadiusUnit = nearbyConfig.searchRadiusUnit || 'miles'
                    const searchRadius = nearbyConfig.searchRadius || 5
                    let searchRadiusMeters = searchRadius
                    switch (searchRadiusUnit) {
                        case 'feet': searchRadiusMeters = searchRadius * 0.3048; break
                        case 'miles': searchRadiusMeters = searchRadius * 1609.34; break
                        case 'kilometers': searchRadiusMeters = searchRadius * 1000; break
                    }

                    // Await projection module with 2s timeout (resolves immediately if already loaded)
                    await Promise.race([
                        projectionReady,
                        new Promise<void>(resolve => setTimeout(resolve, 2000))
                    ])
                    let pointLon = point.x
                    let pointLat = point.y
                    const pointIsGeographic = (point.spatialReference?.wkid === 4326 || point.spatialReference?.wkid === 4269)
                    if (!pointIsGeographic && projection) {
                        try {
                            const wgs84SR = new SpatialReference({ wkid: 4326 })
                            const projected = projection.project(point, wgs84SR) as Point
                            if (projected) { pointLon = projected.x; pointLat = projected.y }
                        } catch (_e) { /* use raw coords - projection unavailable */ }
                    }

                    // Build extent in native SR using meter offset directly
                    const bufferedGeometry: any = {
                        type: 'extent',
                        xmin: point.x - searchRadiusMeters,
                        ymin: point.y - searchRadiusMeters,
                        xmax: point.x + searchRadiusMeters,
                        ymax: point.y + searchRadiusMeters,
                        spatialReference: point.spatialReference
                    }

                    if (!bufferedGeometry) {
                        console.warn('Nearby query: Failed to create buffer geometry')
                        continue
                    }

                    query.geometry = bufferedGeometry
                    query.spatialRelationship = 'intersects'
                    query.outFields = ['*']
                    query.returnGeometry = true

                    // Request WGS84 so lon/lat are always correct for distance calculation
                    // Keep features in map SR so zoom/highlight works correctly
                    if (mapView?.view?.spatialReference) {
                        query.outSpatialReference = mapView.view.spatialReference
                    } else {
                        query.outSpatialReference = point.spatialReference
                    }
                    const result = await nearbyLayer.queryFeatures(query)

                    // Calculate distances and format features
                    const distanceUnit = nearbyConfig.distanceUnit || 'miles'
                    const distancePrecision = nearbyConfig.distancePrecision ?? 2
                    const unitAbbrev: Record<string, string> = {
                        feet: 'ft',
                        meters: 'm',
                        miles: 'mi',
                        kilometers: 'km'
                    }

                    const featuresWithDistance: NearbyFeature[] = result.features
                        .filter(f => f.geometry) // Filter out features without geometry
                        .map(f => {
                            // Get feature center point
                            let featurePoint: Point | null = null
                            if (f.geometry.type === 'point') {
                                featurePoint = f.geometry as Point
                            } else {
                                // Get centroid for polygon/polyline
                                featurePoint = (f.geometry as any).centroid || (f.geometry as any).extent?.center
                            }

                            // Calculate distance using Haversine (projection already awaited above)
                            let distanceMeters = 0
                            if (featurePoint) {
                                let fLon = featurePoint.x
                                let fLat = featurePoint.y
                                const fWkid = featurePoint.spatialReference?.wkid
                                const fIsGeographic = (fWkid === 4326 || fWkid === 4269)
                                const pointWkid = point.spatialReference?.wkid
                                const sameSR = fWkid && fWkid === pointWkid

                                if (sameSR && !fIsGeographic) {
                                    // Same projected SR (e.g. UTM 32612): Euclidean distance is accurate in meters
                                    const dx = fLon - point.x
                                    const dy = fLat - point.y
                                    distanceMeters = Math.sqrt(dx * dx + dy * dy)
                                } else {
                                    // Project feature to WGS84 if needed and projection is available
                                    if (!fIsGeographic && projection) {
                                        try {
                                            const wgs84SR = new SpatialReference({ wkid: 4326 })
                                            const proj = projection.project(featurePoint, wgs84SR) as Point
                                            if (proj) { fLon = proj.x; fLat = proj.y }
                                        } catch (_e) { /* use raw coords */ }
                                    }
                                    // Haversine on geographic coords
                                    const R = 6371000
                                    const dLat = (fLat - pointLat) * Math.PI / 180
                                    const dLon = (fLon - pointLon) * Math.PI / 180
                                    const aa = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                        Math.cos(pointLat * Math.PI / 180) * Math.cos(fLat * Math.PI / 180) *
                                        Math.sin(dLon / 2) * Math.sin(dLon / 2)
                                    distanceMeters = R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa))
                                }
                            }

                            // Convert distance to display unit
                            let displayDistance = distanceMeters
                            switch (distanceUnit) {
                                case 'feet': displayDistance = distanceMeters / 0.3048; break
                                case 'miles': displayDistance = distanceMeters / 1609.34; break
                                case 'kilometers': displayDistance = distanceMeters / 1000; break
                            }

                            const distanceFormatted = `${displayDistance.toFixed(distancePrecision)}${unitAbbrev[distanceUnit] || distanceUnit}`

                            // Get subtitle value
                            let subtitle: string | undefined
                            if (nearbyConfig.subtitleField && f.attributes[nearbyConfig.subtitleField] != null) {
                                const subtitleVal = f.attributes[nearbyConfig.subtitleField]
                                const prefix = nearbyConfig.subtitlePrefix || ''
                                const suffix = nearbyConfig.subtitleSuffix || ''
                                subtitle = `${prefix}${subtitleVal}${suffix}`
                            }

                            // Get link URL
                            let linkUrl: string | undefined
                            if (nearbyConfig.linkUrlField && f.attributes[nearbyConfig.linkUrlField]) {
                                linkUrl = String(f.attributes[nearbyConfig.linkUrlField])
                            }

                            return {
                                title: String(f.attributes[nearbyConfig.titleField] || 'Unknown'),
                                subtitle,
                                distance: displayDistance,
                                distanceFormatted,
                                linkUrl,
                                geometry: f.geometry,
                                attributes: f.attributes
                            }
                        })

                    // Sort by distance
                    const sortOrder = nearbyConfig.sortOrder || 'asc'
                    featuresWithDistance.sort((a, b) =>
                        sortOrder === 'asc' ? a.distance - b.distance : b.distance - a.distance
                    )

                    // Limit to maxFeatures
                    const maxFeatures = nearbyConfig.maxFeatures || 5
                    const limitedFeatures = featuresWithDistance.slice(0, maxFeatures)

                    nearbyResults.push({
                        layerConfig,
                        nearbyConfig,
                        features: limitedFeatures
                    })

                } catch (err) {
                    console.error(`Error querying nearby features for ${layerConfig.layerTitle}:`, err)
                    nearbyResults.push({
                        layerConfig,
                        nearbyConfig,
                        features: [],
                        error: `Failed to query ${layerConfig.layerTitle}`
                    })
                }
            }

            sectionResults.push({ sectionConfig: section, layerResults, totalFeatures, chartData, nearbyResults })
        }

        // Determine which sections should be expanded by default
        // Honor the section.expanded config setting (defaults to true if not specified)
        const sectionsToOpen = new Set<string>()
        for (const sr of sectionResults) {
            // If expanded is explicitly false, keep collapsed; otherwise expand
            if (sr.sectionConfig.expanded !== false) {
                sectionsToOpen.add(sr.sectionConfig.sectionId)
            }
        }
        setOpenSections(sectionsToOpen)

        setResults(sectionResults)
        setLoading(false)

        // Show all features on map for layers with showAllOnMap enabled
        showAllFeaturesOnMap(sectionResults)

        // ACCESSIBILITY: Announce results
        const totalResults = sectionResults.reduce((sum, s) => sum + s.totalFeatures, 0)
        setStatusMessage(`Query complete. Found ${totalResults} total feature${totalResults !== 1 ? 's' : ''} across ${sectionResults.length} section${sectionResults.length !== 1 ? 's' : ''}.`)
    }

    useEffect(() => {
        runQueryWithPointRef.current = runQueryWithPoint
    })

    const toggleSection = (id: string) => {
        setOpenSections(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    // ACCESSIBILITY: Handle section toggle via keyboard
    const handleSectionKeyDown = (e: React.KeyboardEvent, id: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggleSection(id)
        }
    }

    // PDF Generation (unchanged for brevity - keep original implementation)
    const getImageDimensions = (base64: string): Promise<{ width: number, height: number }> => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => {
                resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height })
            }
            img.onerror = () => {
                reject(new Error('Failed to load image'))
            }
            img.src = base64
        })
    }

    const getImageFormat = (base64: string): string => {
        if (base64.includes('data:image/jpeg') || base64.includes('data:image/jpg')) {
            return 'JPEG'
        } else if (base64.includes('data:image/gif')) {
            return 'GIF'
        } else if (base64.includes('data:image/webp')) {
            return 'WEBP'
        }
        return 'PNG'
    }

    // Clear all results and reset widget to initial state
    const clearResults = useCallback(() => {
        // Clear search state
        setSearchText('')
        setDisplayedSearchText('')
        setSuggestions([])
        setShowSuggestions(false)

        // Clear query and results
        setQueryPoint(null)
        setResults([])
        setHeaderInfoData(null)
        setHighlightedGeometry(null)
        // Reset animated charts tracker
        animatedChartsRef.current.clear()

        // Clear separate pane if open
        setSeparatePaneData(null)

        // Clear errors and status
        setError(null)
        setStatusMessage('')

        // Reset sections
        setOpenSections(new Set())

        // Clear all graphics from map
        if (graphicsLayerRef.current) {
            graphicsLayerRef.current.removeAll()
        }
        if (rowHighlightLayerRef.current) {
            rowHighlightLayerRef.current.removeAll()
        }
        if (showAllFeaturesLayerRef.current) {
            showAllFeaturesLayerRef.current.removeAll()
        }

        // Focus back on search input
        searchInputRef.current?.focus()
    }, [])

    // Use current location (GPS) to query at user's position
    // =====================================================
    // WCAG 2.1 COMPLIANT: Use Current Location (GPS)
    // =====================================================
    // Accessibility features:
    // - WCAG 4.1.3: Status messages announced via aria-live region (setStatusMessage)
    // - WCAG 3.3.1: Clear error identification with specific messages
    // - WCAG 2.1.1: Keyboard accessible via standard button
    // - WCAG 1.3.1: Button state communicated via aria-busy
    // =====================================================
    const useCurrentLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.')
            setStatusMessage('Geolocation not supported.')
            return
        }

        setGettingLocation(true)
        setStatusMessage('Getting your location...')
        setError(null)

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords
                    // WCAG: Announce accuracy for screen reader users
                    const accuracy = position.coords.accuracy
                    const accuracyText = accuracy ? ` (accuracy: ${Math.round(accuracy)}m)` : ''

                    // Create a point in WGS84
                    const wgs84Point = new Point({
                        longitude,
                        latitude,
                        spatialReference: new SpatialReference({ wkid: 4326 })
                    })

                    // Project to map's spatial reference if needed
                    let queryPointLocation: Point = wgs84Point
                    const view = mapViewRef.current?.view
                    if (view && view.spatialReference && !view.spatialReference.equals(new SpatialReference({ wkid: 4326 }))) {
                        try {
                            if (projection && typeof projection.load === "function") await projection.load()
                            const projected = projection.project(wgs84Point, view.spatialReference) as Point
                            if (projected) {
                                queryPointLocation = projected
                            }
                        } catch (projErr) {
                            console.warn('Failed to project current location:', projErr)
                        }
                    }

                    // Format the coordinate text for display
                    const coordText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                    setSearchText(coordText)
                    setDisplayedSearchText(`Current Location (${coordText})`)
                    setSuggestions([])
                    setShowSuggestions(false)
                    setQueryPoint(queryPointLocation)

                    // Clear any existing graphics
                    if (graphicsLayerRef.current) {
                        graphicsLayerRef.current.removeAll()
                    }

                    // Add a marker for the current location
                    if (graphicsLayerRef.current) {
                        const locationSymbol = {
                            type: 'simple-marker' as const,
                            color: [66, 133, 244, 1], // Google Maps blue
                            size: 14,
                            outline: {
                                color: [255, 255, 255],
                                width: 3
                            }
                        }
                        const outerRing = {
                            type: 'simple-marker' as const,
                            color: [66, 133, 244, 0.3],
                            size: 28,
                            outline: {
                                color: [66, 133, 244, 0.6],
                                width: 2
                            }
                        }

                        graphicsLayerRef.current.add(new Graphic({
                            geometry: queryPointLocation,
                            symbol: outerRing
                        }))
                        graphicsLayerRef.current.add(new Graphic({
                            geometry: queryPointLocation,
                            symbol: locationSymbol
                        }))
                    }

                    // Zoom to location
                    if (view) {
                        view.goTo({
                            target: queryPointLocation,
                            zoom: 18
                        }, {
                            duration: 500,
                            easing: 'ease-in-out'
                        }).catch(err => console.warn('Zoom to current location failed:', err))
                    }

                    // Run the query
                    runQueryWithPoint(queryPointLocation)
                    // WCAG 4.1.3: Announce success with location details
                    setStatusMessage(`Location found${accuracyText}. Querying nearby features...`)
                } catch (err) {
                    console.error('Error processing location:', err)
                    setError('Failed to process your location. Please try again.')
                    setStatusMessage('Failed to process location.')
                } finally {
                    setGettingLocation(false)
                }
            },
            (err) => {
                setGettingLocation(false)
                // WCAG 3.3.1: Provide specific error messages
                let errorMessage = 'Unable to get your location.'
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage = 'Location access was denied. Please allow location access in your browser settings and try again.'
                        break
                    case err.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable. Please check your device location settings and try again.'
                        break
                    case err.TIMEOUT:
                        errorMessage = 'Location request timed out. Please ensure you have a clear view of the sky and try again.'
                        break
                }
                setError(errorMessage)
                setStatusMessage(errorMessage)
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        )
    }, [runQueryWithPoint])

    const generatePDF = async () => {
        // =====================================================
        // PDF GENERATION WITH WCAG 2.1 ACCESSIBILITY COMPLIANCE
        // =====================================================
        // This function implements the following WCAG 2.1 guidelines:
        //
        // LEVEL A (Essential):
        // - 1.1.1 Non-text Content: Alt text for map/logo images
        // - 1.3.1 Info and Relationships: Table summaries, document structure
        // - 1.3.2 Meaningful Sequence: Logical reading order
        // - 2.4.2 Page Titled: Document title in metadata
        // - 3.1.1 Language of Page: Document language set
        //
        // LEVEL AA (Standard):
        // - 1.4.3 Contrast (Minimum): High contrast color scheme
        // - 1.4.4 Resize Text: Minimum font sizes enforced
        // - 2.4.4 Link Purpose: Descriptive link text, optional full URLs
        // - 2.4.6 Headings and Labels: Clear section headers
        //
        // LEVEL AAA (Enhanced - where feasible):
        // - 2.4.9 Link Purpose (Link Only): Self-describing links
        // - 2.4.10 Section Headings: Organized content structure
        // =====================================================

        setGeneratingPdf(true)
        setStatusMessage('Generating PDF...')

        // Scroll results container to top so overlay is fully visible
        if (mainContentRef.current) {
            mainContentRef.current.scrollTop = 0
        }

        try {
            const pdfHeader = (config.pdfHeader || {}) as PdfHeaderConfig
            const pdfFooter = (config.pdfFooter || {}) as PdfFooterConfig
            const pdfStyle = (config.pdfStyle || {}) as PdfStyleConfig
            const configPdfAccessibility = (config.pdfAccessibility || {}) as any

            // WCAG 1.4.3: High contrast mode uses maximum contrast colors
            const highContrast = pdfStyle.highContrastMode || false

            const primaryColor = highContrast ? '#000000' : (pdfStyle.primaryColor || '#1A6B7C')
            const sectionHeaderColor = highContrast ? '#000000' : (pdfStyle.sectionHeaderColor || '#1A6B7C')
            const sectionHeaderTextColor = highContrast ? '#FFFFFF' : (pdfStyle.sectionHeaderTextColor || '#FFFFFF')
            const alternateRowColor = highContrast ? '#FFFFFF' : (pdfStyle.alternateRowColor || '#F5F5F5')
            const borderColor = highContrast ? '#000000' : (pdfStyle.borderColor || '#CCCCCC')
            const linkColor = highContrast ? '#0000EE' : (pdfStyle.linkColor || '#0066CC')

            const primaryRgb = hexToRgb(primaryColor)
            const sectionHeaderRgb = hexToRgb(sectionHeaderColor)
            const sectionHeaderTextRgb = hexToRgb(sectionHeaderTextColor)
            const alternateRowRgb = hexToRgb(alternateRowColor)
            const borderRgb = hexToRgb(borderColor)
            const linkRgb = hexToRgb(linkColor)

            // WCAG 1.4.4: Large text mode increases all font sizes
            const fontScale = pdfStyle.largeTextMode ? 1.25 : 1.0

            // Helper to check if a value is a URL
            const isUrl = (val: any): boolean => {
                if (typeof val !== 'string') return false
                return val.startsWith('http://') || val.startsWith('https://')
            }

            // Helper to render a clickable link in PDF
            // Attempts to set NewWindow flag for opening in new tab
            // Note: NewWindow behavior depends on PDF viewer - works in Adobe Acrobat,
            // but browser PDF viewers (Chrome, Firefox, Edge) may ignore this flag
            const renderPdfLink = (text: string, x: number, yPos: number, url: string) => {
                doc.text(text, x, yPos)
                const textWidth = doc.getTextWidth(text)
                const textHeight = doc.getFontSize() * 0.4
                const linkY = yPos - textHeight

                // Create link annotation
                // jsPDF's link() creates a URI action annotation
                doc.link(x, linkY, textWidth, textHeight + 1, { url: url })

                // Try to modify the last annotation to add NewWindow flag
                // This accesses jsPDF internals and may not work in all versions
                try {
                    const internal = doc.internal as any
                    if (internal.annotations && internal.annotations.length > 0) {
                        const lastAnnot = internal.annotations[internal.annotations.length - 1]
                        if (lastAnnot) {
                            lastAnnot.options = lastAnnot.options || {}
                            lastAnnot.options.newWindow = true
                        }
                    }
                } catch (e) {
                    // Ignore - NewWindow flag is a nice-to-have
                }
            }

            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'letter'
            })

            // =====================================================
            // WCAG 2.1 ACCESSIBILITY: Document Metadata & Language
            // Satisfies: 2.4.2 Page Titled, 3.1.1 Language of Page
            // =====================================================
            const pdfAccessibility = {
                ...PDF_ACCESSIBILITY_DEFAULTS,
                ...configPdfAccessibility
            }

            // Set document language (WCAG 3.1.1 Language of Page)
            // This helps screen readers announce content in the correct language
            try {
                doc.setLanguage(pdfAccessibility.documentLanguage as any)
            } catch (langError) {
                console.warn('Could not set PDF language:', langError)
            }

            // Set document properties/metadata (WCAG 2.4.2 Page Titled)
            // Screen readers use this to announce the document title
            const documentTitle = `${displayedSearchText || 'Property Report'} - ${new Date().toLocaleDateString()}`
            try {
                doc.setDocumentProperties({
                    title: documentTitle,
                    subject: 'Property Information Report',
                    author: pdfAccessibility.documentAuthor,
                    creator: pdfAccessibility.documentCreator,
                    keywords: 'property, report, GIS, accessibility, WCAG'
                })
            } catch (propError) {
                console.warn('Could not set PDF properties:', propError)
            }

            // Minimum font size for accessibility (WCAG 1.4.4 Resize Text)
            // Apply fontScale for large text mode
            const baseMinFontSize = pdfAccessibility.minimumFontSize || 9
            const minFontSize = Math.round(baseMinFontSize * fontScale)

            // Font configuration
            // Built-in fonts: helvetica, times, courier (LIMITED - no extended Latin/Unicode support)
            // Google Fonts: loaded dynamically as TTF with full Unicode support
            // Custom fonts: user-uploaded TTF files stored as base64
            // IMPORTANT: Built-in fonts do NOT support Polish, Czech, Vietnamese, Turkish, etc.
            // For international character support, use Google Fonts like Noto Sans
            const fontFamily = pdfStyle.fontFamily || 'helvetica'
            const builtInFonts = ['helvetica', 'times', 'courier']
            const googleFonts = [
                'Noto Sans', // Full Unicode support - recommended for international text
                'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway',
                'Poppins', 'Nunito', 'Ubuntu', 'Merriweather', 'PT Sans',
                'Playfair Display', 'Source Sans Pro'
            ]

            let activeFontFamily: string = 'helvetica'
            let unicodeFontFailed = false  // Track if Unicode font loading failed

            // Transliteration map for extended Latin characters (Polish, Czech, Turkish, etc.)
            // Used as emergency fallback when Unicode fonts fail to load
            const transliterationMap: Record<string, string> = {
                // Polish
                'ą': 'a', 'Ą': 'A', 'ć': 'c', 'Ć': 'C', 'ę': 'e', 'Ę': 'E',
                'ł': 'l', 'Ł': 'L', 'ń': 'n', 'Ń': 'N', 'ó': 'o', 'Ó': 'O',
                'ś': 's', 'Ś': 'S', 'ź': 'z', 'Ź': 'Z', 'ż': 'z', 'Ż': 'Z',
                // Czech/Slovak
                'á': 'a', 'Á': 'A', 'č': 'c', 'Č': 'C', 'ď': 'd', 'Ď': 'D',
                'é': 'e', 'É': 'E', 'ě': 'e', 'Ě': 'E', 'í': 'i', 'Í': 'I',
                'ň': 'n', 'Ň': 'N', 'ř': 'r', 'Ř': 'R', 'š': 's', 'Š': 'S',
                'ť': 't', 'Ť': 'T', 'ú': 'u', 'Ú': 'U', 'ů': 'u', 'Ů': 'U',
                'ý': 'y', 'Ý': 'Y', 'ž': 'z', 'Ž': 'Z',
                // German
                'ä': 'ae', 'Ä': 'Ae', 'ö': 'oe', 'Ö': 'Oe', 'ü': 'ue', 'Ü': 'Ue', 'ß': 'ss',
                // French (also covers some Romanian characters)
                'à': 'a', 'À': 'A', 'â': 'a', 'Â': 'A', 'æ': 'ae', 'Æ': 'AE',
                'ç': 'c', 'Ç': 'C', 'è': 'e', 'È': 'E', 'ê': 'e', 'Ê': 'E',
                'ë': 'e', 'Ë': 'E', 'î': 'i', 'Î': 'I', 'ï': 'i', 'Ï': 'I',
                'ô': 'o', 'Ô': 'O', 'œ': 'oe', 'Œ': 'OE', 'ù': 'u', 'Ù': 'U',
                'û': 'u', 'Û': 'U', 'ÿ': 'y', 'Ÿ': 'Y',
                // Spanish/Portuguese
                'ñ': 'n', 'Ñ': 'N', 'ã': 'a', 'Ã': 'A', 'õ': 'o', 'Õ': 'O',
                // Turkish
                'ğ': 'g', 'Ğ': 'G', 'ı': 'i', 'İ': 'I', 'ş': 's', 'Ş': 'S',
                // Nordic (å, ø unique - æ already covered above)
                'å': 'a', 'Å': 'A', 'ø': 'o', 'Ø': 'O',
                // Romanian (ă, ș, ț unique - â, î already covered above)
                'ă': 'a', 'Ă': 'A', 'ș': 's', 'Ș': 'S', 'ț': 't', 'Ț': 'T',
                // Hungarian
                'ő': 'o', 'Ő': 'O', 'ű': 'u', 'Ű': 'U'
            }

            // Transliterate text when Unicode font is not available
            const transliterate = (text: string): string => {
                if (!unicodeFontFailed) return text
                return text.split('').map(char => transliterationMap[char] || char).join('')
            }

            // Helper to detect if text contains non-ASCII characters that require Unicode font
            // This includes Polish (ą, ć, ę, ł, ń, ó, ś, ź, ż), Czech, Turkish, Vietnamese, etc.
            const containsNonAscii = (text: string): boolean => {
                // Match any character outside basic ASCII printable range (32-126)
                return /[^\x00-\x7F]/.test(text)
            }

            // Check if content contains non-ASCII characters that need Unicode support
            const checkAllTextForUnicode = (): boolean => {
                // Check address/header
                if (containsNonAscii(displayedSearchText || '')) return true

                // Check header info data
                if (headerInfoData) {
                    for (const value of Object.values(headerInfoData)) {
                        if (typeof value === 'string' && containsNonAscii(value)) return true
                    }
                }

                // Check section titles and data
                for (const sr of results) {
                    if (containsNonAscii(sr.sectionConfig.sectionTitle || '')) return true
                    for (const lr of sr.layerResults) {
                        if (containsNonAscii(lr.layerConfig.layerTitle || '')) return true
                        for (const feature of lr.features) {
                            for (const value of Object.values(feature)) {
                                if (typeof value === 'string' && containsNonAscii(value)) return true
                            }
                        }
                        // Check related data
                        if (lr.relatedData) {
                            for (const relData of lr.relatedData) {
                                if (containsNonAscii(relData.tableConfig.tableName || '')) return true
                                for (const record of relData.records) {
                                    for (const value of Object.values(record)) {
                                        if (typeof value === 'string' && containsNonAscii(value)) return true
                                    }
                                }
                            }
                        }
                    }
                }
                return false
            }

            // Determine if we need Unicode font support
            const needsUnicodeFont = checkAllTextForUnicode()

            // If built-in font selected but Unicode characters detected, auto-switch to Noto Sans
            let effectiveFontFamily = fontFamily
            if (builtInFonts.includes(fontFamily.toLowerCase()) && needsUnicodeFont) {
                console.warn(`PDF contains non-ASCII characters but built-in font "${fontFamily}" is selected. Auto-switching to Noto Sans for proper character rendering.`)
                effectiveFontFamily = 'Noto Sans'
            }

            // Helper to load Google Font as TTF from GitHub repositories
            const loadGoogleFont = async (fontName: string): Promise<boolean> => {
                try {
                    setStatusMessage(`Loading ${fontName} font...`)

                    // Font configuration with multiple source options for reliability
                    // Primary source: google/fonts repo static files
                    // Some fonts use different folder structures or naming conventions
                    const fontConfigs: Record<string, {
                        sources: { baseUrl: string, regular: string, bold: string }[]
                    }> = {
                        'Roboto': {
                            sources: [
                                { baseUrl: 'https://cdn.jsdelivr.net/gh/googlefonts/roboto@main/src/hinted', regular: 'Roboto-Regular.ttf', bold: 'Roboto-Bold.ttf' },
                                { baseUrl: 'https://raw.githubusercontent.com/google/fonts/main/apache/roboto/static', regular: 'Roboto-Regular.ttf', bold: 'Roboto-Bold.ttf' }
                            ]
                        },
                        'Open Sans': {
                            sources: [
                                { baseUrl: 'https://cdn.jsdelivr.net/gh/googlefonts/opensans@main/fonts/ttf', regular: 'OpenSans-Regular.ttf', bold: 'OpenSans-Bold.ttf' },
                                { baseUrl: 'https://raw.githubusercontent.com/google/fonts/main/ofl/opensans/static', regular: 'OpenSans-Regular.ttf', bold: 'OpenSans-Bold.ttf' }
                            ]
                        },
                        'Lato': {
                            sources: [
                                { baseUrl: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/lato', regular: 'Lato-Regular.ttf', bold: 'Lato-Bold.ttf' }
                            ]
                        },
                        'Montserrat': {
                            sources: [
                                { baseUrl: 'https://cdn.jsdelivr.net/gh/JulietaUla/Montserrat@master/fonts/ttf', regular: 'Montserrat-Regular.ttf', bold: 'Montserrat-Bold.ttf' },
                                { baseUrl: 'https://raw.githubusercontent.com/JulietaUla/Montserrat/master/fonts/ttf', regular: 'Montserrat-Regular.ttf', bold: 'Montserrat-Bold.ttf' }
                            ]
                        },
                        'Oswald': {
                            sources: [
                                { baseUrl: 'https://cdn.jsdelivr.net/gh/googlefonts/OswaldFont@main/fonts/ttf', regular: 'Oswald-Regular.ttf', bold: 'Oswald-Bold.ttf' }
                            ]
                        },
                        'Raleway': {
                            sources: [
                                { baseUrl: 'https://cdn.jsdelivr.net/gh/theleagueof/raleway@master/fonts/ttf', regular: 'Raleway-Regular.ttf', bold: 'Raleway-Bold.ttf' },
                                { baseUrl: 'https://raw.githubusercontent.com/google/fonts/main/ofl/raleway/static', regular: 'Raleway-Regular.ttf', bold: 'Raleway-Bold.ttf' }
                            ]
                        },
                        'Poppins': {
                            sources: [
                                { baseUrl: 'https://cdn.jsdelivr.net/gh/itfoundry/poppins@master/products', regular: 'Poppins-Regular.ttf', bold: 'Poppins-Bold.ttf' },
                                { baseUrl: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins', regular: 'Poppins-Regular.ttf', bold: 'Poppins-Bold.ttf' }
                            ]
                        },
                        'Nunito': {
                            sources: [
                                { baseUrl: 'https://cdn.jsdelivr.net/gh/googlefonts/nunito@main/fonts/ttf', regular: 'Nunito-Regular.ttf', bold: 'Nunito-Bold.ttf' },
                                { baseUrl: 'https://raw.githubusercontent.com/google/fonts/main/ofl/nunito/static', regular: 'Nunito-Regular.ttf', bold: 'Nunito-Bold.ttf' }
                            ]
                        },
                        'Ubuntu': {
                            sources: [
                                { baseUrl: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ufl/ubuntu', regular: 'Ubuntu-Regular.ttf', bold: 'Ubuntu-Bold.ttf' }
                            ]
                        },
                        'Merriweather': {
                            sources: [
                                { baseUrl: 'https://cdn.jsdelivr.net/gh/SorkinType/Merriweather@master/fonts/ttfs', regular: 'Merriweather-Regular.ttf', bold: 'Merriweather-Bold.ttf' },
                                { baseUrl: 'https://raw.githubusercontent.com/google/fonts/main/ofl/merriweather', regular: 'Merriweather-Regular.ttf', bold: 'Merriweather-Bold.ttf' }
                            ]
                        },
                        'PT Sans': {
                            sources: [
                                { baseUrl: 'https://cdn.jsdelivr.net/gh/nickshanks/PT-Fonts@main/TTF', regular: 'PTSans-Regular.ttf', bold: 'PTSans-Bold.ttf' },
                                { baseUrl: 'https://raw.githubusercontent.com/google/fonts/main/ofl/ptsans', regular: 'PTSans-Regular.ttf', bold: 'PTSans-Bold.ttf' }
                            ]
                        },
                        'Playfair Display': {
                            sources: [
                                { baseUrl: 'https://cdn.jsdelivr.net/gh/clauseggers/Playfair@master/fonts/ttf', regular: 'PlayfairDisplay-Regular.ttf', bold: 'PlayfairDisplay-Bold.ttf' },
                                { baseUrl: 'https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/static', regular: 'PlayfairDisplay-Regular.ttf', bold: 'PlayfairDisplay-Bold.ttf' }
                            ]
                        },
                        'Source Sans Pro': {
                            sources: [
                                { baseUrl: 'https://cdn.jsdelivr.net/gh/adobe-fonts/source-sans@release/TTF', regular: 'SourceSans3-Regular.ttf', bold: 'SourceSans3-Bold.ttf' },
                                { baseUrl: 'https://raw.githubusercontent.com/google/fonts/main/ofl/sourcesans3/static', regular: 'SourceSans3-Regular.ttf', bold: 'SourceSans3-Bold.ttf' }
                            ]
                        },
                        'Noto Sans': {
                            sources: [
                                { baseUrl: 'https://cdn.jsdelivr.net/gh/notofonts/latin@main/fonts/NotoSans/unhinted/ttf', regular: 'NotoSans-Regular.ttf', bold: 'NotoSans-Bold.ttf' },
                                { baseUrl: 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosans/static', regular: 'NotoSans-Regular.ttf', bold: 'NotoSans-Bold.ttf' }
                            ]
                        }
                    }

                    const fontConfig = fontConfigs[fontName]
                    if (!fontConfig) {
                        console.warn(`Font ${fontName} not found in font configs`)
                        return false
                    }

                    // Try each source until one works
                    for (const source of fontConfig.sources) {
                        try {
                            const regularUrl = `${source.baseUrl}/${source.regular}`

                            const fontResponse = await fetch(regularUrl)
                            if (!fontResponse.ok) {
                                console.warn(`Failed to fetch from ${regularUrl}: ${fontResponse.status}`)
                                continue
                            }

                            const fontArrayBuffer = await fontResponse.arrayBuffer()

                            // Validate that we got a TTF file (starts with proper header)
                            const headerView = new Uint8Array(fontArrayBuffer.slice(0, 4))
                            const header = String.fromCharCode(...headerView)
                            // TTF files typically start with 0x00010000 or 'OTTO' (for CFF) or 'true'
                            const isValidFont = (headerView[0] === 0 && headerView[1] === 1) ||
                                header === 'OTTO' ||
                                header === 'true' ||
                                header.startsWith('wOFF')

                            if (!isValidFont && fontArrayBuffer.byteLength < 10000) {
                                console.warn(`Invalid font file from ${regularUrl}`)
                                continue
                            }

                            // Convert ArrayBuffer to base64
                            const fontBytes = new Uint8Array(fontArrayBuffer)
                            let binary = ''
                            const chunkSize = 8192
                            for (let i = 0; i < fontBytes.length; i += chunkSize) {
                                const chunk = fontBytes.subarray(i, Math.min(i + chunkSize, fontBytes.length))
                                binary += String.fromCharCode.apply(null, chunk as any)
                            }
                            const fontBase64 = btoa(binary)

                            // Add font to jsPDF
                            const safeFontName = fontName.replace(/\s+/g, '')
                            doc.addFileToVFS(`${safeFontName}-Regular.ttf`, fontBase64)
                            doc.addFont(`${safeFontName}-Regular.ttf`, fontName, 'normal')

                            // Try to load bold variant
                            try {
                                const boldUrl = `${source.baseUrl}/${source.bold}`
                                const boldResponse = await fetch(boldUrl)
                                if (boldResponse.ok) {
                                    const boldArrayBuffer = await boldResponse.arrayBuffer()
                                    const boldBytes = new Uint8Array(boldArrayBuffer)
                                    let boldBinary = ''
                                    for (let i = 0; i < boldBytes.length; i += chunkSize) {
                                        const chunk = boldBytes.subarray(i, Math.min(i + chunkSize, boldBytes.length))
                                        boldBinary += String.fromCharCode.apply(null, chunk as any)
                                    }
                                    const boldBase64 = btoa(boldBinary)

                                    doc.addFileToVFS(`${safeFontName}-Bold.ttf`, boldBase64)
                                    doc.addFont(`${safeFontName}-Bold.ttf`, fontName, 'bold')
                                } else {
                                    doc.addFont(`${safeFontName}-Regular.ttf`, fontName, 'bold')
                                }
                            } catch (boldError) {
                                console.warn(`Could not load bold weight for ${fontName}, using regular`)
                                doc.addFont(`${safeFontName}-Regular.ttf`, fontName, 'bold')
                            }

                            return true
                        } catch (sourceError) {
                            console.warn(`Error loading from source:`, sourceError)
                            continue
                        }
                    }

                    console.warn(`All sources failed for ${fontName}`)
                    return false
                } catch (error) {
                    console.warn(`Failed to load Google Font ${fontName}:`, error)
                    return false
                }
            }

            // Determine which font to use
            if (effectiveFontFamily === 'custom' && pdfStyle.customFont?.regularBase64) {
                // Load custom font from base64
                try {
                    const customFontName = pdfStyle.customFont.name || 'CustomFont'
                    const fontFileName = `${customFontName.replace(/\s+/g, '')}-Regular.ttf`

                    // Add regular weight
                    doc.addFileToVFS(fontFileName, pdfStyle.customFont.regularBase64)
                    doc.addFont(fontFileName, customFontName, 'normal')

                    // Add bold weight if available, otherwise map bold to regular
                    if (pdfStyle.customFont.boldBase64) {
                        const boldFileName = `${customFontName.replace(/\s+/g, '')}-Bold.ttf`
                        doc.addFileToVFS(boldFileName, pdfStyle.customFont.boldBase64)
                        doc.addFont(boldFileName, customFontName, 'bold')
                    } else {
                        doc.addFont(fontFileName, customFontName, 'bold')
                    }

                    activeFontFamily = customFontName
                } catch (fontError) {
                    console.warn('Failed to load custom font, falling back to helvetica:', fontError)
                    activeFontFamily = 'helvetica'
                    if (needsUnicodeFont) unicodeFontFailed = true
                }
            } else if (googleFonts.includes(effectiveFontFamily)) {
                // Try to load Google Font
                const loaded = await loadGoogleFont(effectiveFontFamily)
                if (loaded) {
                    activeFontFamily = effectiveFontFamily
                } else {
                    console.warn(`Failed to load ${effectiveFontFamily}, falling back to helvetica`)
                    activeFontFamily = 'helvetica'
                    if (needsUnicodeFont) unicodeFontFailed = true
                }
            } else if (builtInFonts.includes(effectiveFontFamily.toLowerCase())) {
                activeFontFamily = effectiveFontFamily.toLowerCase()
                // If using built-in font but Unicode is needed, mark as failed
                if (needsUnicodeFont) unicodeFontFailed = true
            }

            // Warn user if Unicode font loading failed
            if (unicodeFontFailed) {
                console.error('Unicode font loading failed. International characters may not render correctly in PDF. Consider uploading a custom TTF font with Unicode support.')
            }

            // Helper to safely set font style with fallback
            // Some fonts (like loaded Unicode fonts) may not have italic/bold variants
            const safeSetFont = (fontFamily: string, style: 'normal' | 'bold' | 'italic' | 'bolditalic') => {
                try {
                    const fontList = doc.getFontList()
                    const availableStyles = fontList[fontFamily] || []
                    if (availableStyles.includes(style)) {
                        doc.setFont(fontFamily, style)
                    } else if (style === 'italic' || style === 'bolditalic') {
                        // Fall back to normal or bold if italic not available
                        if (style === 'bolditalic' && availableStyles.includes('bold')) {
                            doc.setFont(fontFamily, 'bold')
                        } else {
                            doc.setFont(fontFamily, 'normal')
                        }
                    } else {
                        doc.setFont(fontFamily, 'normal')
                    }
                } catch (e) {
                    doc.setFont(fontFamily, 'normal')
                }
            }

            // Set the active font
            doc.setFont(activeFontFamily, 'normal')

            setStatusMessage('Generating PDF...')

            const pw = doc.internal.pageSize.getWidth()
            const ph = doc.internal.pageSize.getHeight()
            const margin = 12
            const contentWidth = pw - (margin * 2)

            const footerEnabled = pdfFooter.enabled !== false
            const footerHeight = footerEnabled ? (pdfFooter.footerHeight || 18) : 0
            const usableHeight = ph - footerHeight

            // ========================================
            // CAPTURE MAP SCREENSHOT - Zoom to Feature Extent
            // ========================================
            let mapScreenshot: string | null = null
            const mapHeight = pdfHeader.mapHeight || 75
            const mapScaleMode = pdfHeader.mapScaleMode || 'fixed'
            const mapScale = pdfHeader.mapScale || 2500  // Used when mapScaleMode is 'fixed'
            const mapFitPadding = pdfHeader.mapFitPadding || 1.2  // Used when mapScaleMode is 'fitGeometry'

            if (mapView?.view) {
                // Store original constraints to restore after screenshot
                // Cast to any to handle both 2D and 3D view constraint types
                const viewConstraints = mapView.view.constraints as any
                const originalConstraints = {
                    minScale: viewConstraints?.minScale || 0,
                    maxScale: viewConstraints?.maxScale || 0
                }

                try {
                    // Helper to wait for view and all layer views to stop updating
                    const waitForAllLayersReady = (maxWaitMs: number = 8000) => new Promise<void>(resolve => {
                        const startTime = Date.now()

                        const checkReady = () => {
                            // Check if we've exceeded max wait time
                            if (Date.now() - startTime > maxWaitMs) {
                                console.warn('Map layers took too long to load, proceeding with screenshot')
                                resolve()
                                return
                            }

                            // Check if main view is still updating
                            if (mapView.view.updating) {
                                setTimeout(checkReady, 200)
                                return
                            }

                            // Check all layer views for updating status
                            let anyLayerUpdating = false
                            try {
                                const layerViews = (mapView.view as any).layerViews
                                if (layerViews && layerViews.items) {
                                    for (const layerView of layerViews.items) {
                                        if (layerView && layerView.updating) {
                                            anyLayerUpdating = true
                                            break
                                        }
                                    }
                                }
                            } catch (e) {
                                // layerViews access might fail, continue anyway
                            }

                            if (anyLayerUpdating) {
                                setTimeout(checkReady, 200)
                                return
                            }

                            // All layers ready - add final buffer for tile rendering
                            setTimeout(resolve, 1000)
                        }

                        // Start checking
                        checkReady()
                    })

                    setStatusMessage('Preparing map for PDF...')

                    // Temporarily override map constraints to allow configured scale
                    viewConstraints.minScale = 0
                    viewConstraints.maxScale = 0

                    // Zoom to the feature or query point based on mapScaleMode
                    if (mapScaleMode === 'fitGeometry' && highlightedGeometry && highlightedGeometry.extent) {
                        // Fit to Geometry mode: zoom to the geometry extent with padding
                        let extent = highlightedGeometry.extent.clone().expand(mapFitPadding)

                        // Adjust extent to match PDF aspect ratio so entire geometry is captured in screenshot
                        const pdfAspectRatio = contentWidth / mapHeight
                        const extentAspectRatio = extent.width / extent.height

                        if (extentAspectRatio > pdfAspectRatio) {
                            // Extent is wider than PDF - need to expand height to fit
                            const newHeight = extent.width / pdfAspectRatio
                            const heightDiff = newHeight - extent.height
                            extent.ymin -= heightDiff / 2
                            extent.ymax += heightDiff / 2
                        } else {
                            // Extent is taller than PDF - need to expand width to fit
                            const newWidth = extent.height * pdfAspectRatio
                            const widthDiff = newWidth - extent.width
                            extent.xmin -= widthDiff / 2
                            extent.xmax += widthDiff / 2
                        }

                        await mapView.view.goTo(extent, { animate: false })
                    } else if (highlightedGeometry) {
                        // Fixed scale mode with highlighted geometry
                        await mapView.view.goTo({ target: highlightedGeometry, scale: mapScale }, { animate: false })
                    } else if (queryPoint) {
                        // Fall back to query point at the configured scale
                        await mapView.view.goTo({ target: queryPoint, scale: mapScale }, { animate: false })
                    }

                    // Wait for ALL layers to finish rendering (thematic layers, basemap tiles, etc.)
                    setStatusMessage('Waiting for map layers to load...')
                    await waitForAllLayersReady(8000)

                    // Additional buffer to ensure feature symbology is fully rendered
                    await new Promise(resolve => setTimeout(resolve, 500))

                    setStatusMessage('Capturing map image...')

                    // Calculate target aspect ratio for PDF (contentWidth / mapHeight in mm)
                    const pdfAspectRatio = contentWidth / mapHeight

                    // Calculate screenshot dimensions that match PDF aspect ratio
                    const viewWidth = mapView.view.width
                    const targetWidth = Math.min(2400, viewWidth * 2)  // High res but capped
                    const targetHeight = Math.round(targetWidth / pdfAspectRatio)

                    // Take screenshot with proper aspect ratio for PDF
                    const screenshot = await mapView.view.takeScreenshot({
                        format: 'png',
                        quality: 100,
                        width: targetWidth,
                        height: targetHeight
                    })

                    if (screenshot?.dataUrl) {
                        mapScreenshot = screenshot.dataUrl
                    }

                    // Restore original map constraints
                    viewConstraints.minScale = originalConstraints.minScale
                    viewConstraints.maxScale = originalConstraints.maxScale

                } catch (screenshotError) {
                    console.warn('Map screenshot failed:', screenshotError)
                    // Restore constraints even on error
                    try {
                        if (viewConstraints) {
                            viewConstraints.minScale = originalConstraints.minScale
                            viewConstraints.maxScale = originalConstraints.maxScale
                        }
                    } catch (e) { /* ignore */ }
                }
            }

            let y = margin

            // Header
            const logoConfig = (pdfHeader.logo || {}) as PdfLogoConfig
            const logoBase64 = logoConfig.base64 || pdfHeader.logoBase64
            const hasLogo = !!logoBase64

            // Use configurable header height or defaults
            const headerHeight = pdfHeader.headerHeight || (hasLogo ? 35 : 25)
            const headerBgColor = pdfHeader.headerColor || '#FFFFFF'
            const headerTextColor = pdfHeader.headerTextColor || '#1A1A1A'
            const headerBgRgb = hexToRgb(headerBgColor)
            const headerTextRgb = hexToRgb(headerTextColor)

            if (headerBgColor.toLowerCase() !== '#ffffff' && headerBgColor.toLowerCase() !== '#fff') {
                doc.setFillColor(headerBgRgb[0], headerBgRgb[1], headerBgRgb[2])
                doc.rect(0, 0, pw, headerHeight, 'F')
            }

            // ========================================
            // LOGO RENDERING
            // ========================================
            let logoEndX = margin

            if (hasLogo && logoBase64) {
                try {
                    const sizeMode = logoConfig.sizeMode || 'auto'
                    const logoPosition = logoConfig.position || 'left'
                    const verticalAlign = logoConfig.verticalAlign || 'middle'
                    const logoPadding = logoConfig.padding || 0
                    const imageFormat = getImageFormat(logoBase64)

                    // Get actual image dimensions
                    let origWidth = 100
                    let origHeight = 100

                    // Use stored dimensions if available
                    if (logoConfig.originalWidth && logoConfig.originalHeight) {
                        origWidth = logoConfig.originalWidth
                        origHeight = logoConfig.originalHeight
                    } else {
                        try {
                            const dims = await getImageDimensions(logoBase64)
                            if (dims.width > 0 && dims.height > 0) {
                                origWidth = dims.width
                                origHeight = dims.height
                            }
                        } catch (e) {
                            // Use defaults
                        }
                    }

                    const aspectRatio = origWidth / origHeight

                    let finalWidth: number
                    let finalHeight: number

                    if (sizeMode === 'custom') {
                        // Custom: use exact dimensions specified
                        finalWidth = logoConfig.customWidth || 40
                        finalHeight = logoConfig.customHeight || (finalWidth / aspectRatio)
                    } else if (sizeMode === 'stretch') {
                        // Stretch: fill exact dimensions (may distort)
                        finalWidth = logoConfig.customWidth || 40
                        finalHeight = logoConfig.customHeight || 20
                    } else {
                        // Auto/Fit: maintain aspect ratio within constraints
                        const maxW = logoConfig.maxWidth || 50
                        const maxH = logoConfig.maxHeight || 25
                        const scaleW = maxW / origWidth
                        const scaleH = maxH / origHeight
                        const scale = Math.min(scaleW, scaleH)
                        finalWidth = origWidth * scale
                        finalHeight = origHeight * scale
                    }

                    // Apply padding
                    const availableHeight = headerHeight - (logoPadding * 2)

                    // Ensure reasonable bounds
                    finalWidth = Math.max(5, Math.min(finalWidth, contentWidth - (logoPadding * 2)))
                    finalHeight = Math.max(5, Math.min(finalHeight, availableHeight))

                    // Calculate horizontal position
                    let logoX: number
                    if (logoPosition === 'center') {
                        logoX = (pw - finalWidth) / 2
                    } else if (logoPosition === 'right') {
                        logoX = pw - margin - finalWidth - logoPadding
                    } else {
                        logoX = margin + logoPadding
                    }

                    // Calculate vertical position based on alignment
                    let logoY: number
                    if (verticalAlign === 'top') {
                        logoY = logoPadding + 2
                    } else if (verticalAlign === 'bottom') {
                        logoY = headerHeight - finalHeight - logoPadding - 2
                    } else {
                        // Middle (default)
                        logoY = (headerHeight - finalHeight) / 2
                    }

                    // Draw background if specified
                    if (logoConfig.backgroundColor && logoConfig.backgroundColor !== 'transparent') {
                        const bgRgb = hexToRgb(logoConfig.backgroundColor)
                        doc.setFillColor(bgRgb[0], bgRgb[1], bgRgb[2])

                        if (logoConfig.shape === 'circle') {
                            const radius = Math.min(finalWidth, finalHeight) / 2
                            const centerX = logoX + finalWidth / 2
                            const centerY = logoY + finalHeight / 2
                            doc.circle(centerX, centerY, radius, 'F')
                        } else if (logoConfig.shape === 'rounded') {
                            const r = logoConfig.borderRadius || 2
                            doc.roundedRect(logoX - 1, logoY - 1, finalWidth + 2, finalHeight + 2, r, r, 'F')
                        } else {
                            doc.rect(logoX - 1, logoY - 1, finalWidth + 2, finalHeight + 2, 'F')
                        }
                    }

                    // Add the logo image
                    doc.addImage(logoBase64, imageFormat, logoX, logoY, finalWidth, finalHeight)

                    // =====================================================
                    // WCAG 1.1.1: Logo alt text (for document readers)
                    // Note: jsPDF doesn't support native image alt attributes,
                    // so we add a hidden text marker for accessibility tools
                    // that can parse PDF text content
                    // =====================================================
                    if (pdfAccessibility.includeLogoAltText) {
                        // Store current position
                        const currentY = y
                        // Add invisible alt text near logo (very small, same color as background)
                        doc.setFontSize(1)
                        doc.setTextColor(255, 255, 255) // White on white = invisible but parseable
                        doc.text(transliterate(pdfAccessibility.logoAltTextTemplate || 'Organization logo'), logoX, logoY + finalHeight + 0.5)
                        // Reset
                        doc.setTextColor(0, 0, 0)
                    }

                    // Update logoEndX for text positioning when logo is on left
                    if (logoPosition === 'left') {
                        logoEndX = logoX + finalWidth + 8 + logoPadding
                    }
                } catch (logoError) {
                    console.warn('Logo rendering failed:', logoError)
                }
            }

            // Title - apply transliteration if Unicode font failed to load
            const addressTitle = transliterate(displayedSearchText || 'Property Report')
            doc.setTextColor(headerTextRgb[0], headerTextRgb[1], headerTextRgb[2])

            // Get title position setting (default: center)
            const titlePosition = pdfHeader.titlePosition || 'center'

            // Calculate date text first to determine proper spacing
            // WCAG 3.2.1: Option for full timestamp for document currency
            const now = new Date()
            const dateOnly = now.toLocaleDateString()
            const timeOnly = now.toLocaleTimeString()
            doc.setFontSize(pdfStyle.largeTextMode ? 11 : 9)
            doc.setFont(activeFontFamily, 'normal')
            const dateOnlyWidth = doc.getTextWidth(dateOnly)
            const timeOnlyWidth = doc.getTextWidth(timeOnly)

            // Check if date should be shown (affects text wrapping width)
            const showDateInHeader = pdfHeader.showGeneratedDate !== false
            // Use the wider of date or time for reserved width (only if date is shown)
            const dateReservedWidth = showDateInHeader ? Math.max(dateOnlyWidth, timeOnlyWidth) + 10 : 0

            // Calculate text area based on logo presence and actual date width
            // For true page centering without overlap, we calculate the max width
            // that when centered on the page won't overlap logo or date
            let textAreaStart = margin
            let textWrapWidth = contentWidth - dateReservedWidth  // Default width for text wrapping
            const pageCenter = pw / 2

            if (hasLogo) {
                const logoPosition = (logoConfig.position || 'left')
                if (logoPosition === 'left') {
                    // Logo on left: calculate max width for true page centering
                    // Distance from center to logo boundary
                    const distToLogo = pageCenter - logoEndX
                    // Distance from center to date boundary (or page edge if no date)
                    const distToDate = showDateInHeader
                        ? (pw - margin - dateReservedWidth) - pageCenter
                        : (pw - margin) - pageCenter
                    // Max width is twice the smaller distance (so centered text fits)
                    textWrapWidth = 2 * Math.min(distToLogo, distToDate)
                    textAreaStart = logoEndX
                } else if (logoPosition === 'right') {
                    // Logo on right: similar calculation
                    const logoRightStart = pw - margin - 50 // Approximate logo start
                    const distToLogo = logoRightStart - pageCenter
                    const distToDate = showDateInHeader
                        ? pageCenter - margin - dateReservedWidth
                        : pageCenter - margin
                    textWrapWidth = 2 * Math.min(distToLogo, distToDate)
                } else {
                    // Logo centered: use full width minus date for wrapping
                    textWrapWidth = contentWidth - dateReservedWidth
                }
            }

            // Ensure minimum wrap width
            textWrapWidth = Math.max(textWrapWidth, 60)

            // Build subtitle from header info fields (e.g., Parcel Number)
            const subtitleParts: string[] = []
            if (headerInfoData && config.headerInfo?.displayFields) {
                const headerFields = normalizeFields(toMutable<any>(config.headerInfo.displayFields)).filter((f: any) => !f.excludeFromPdf)
                headerFields.forEach((field: any) => {
                    const value = headerInfoData[field.name]
                    const isNullOrEmpty = value == null || value === ''
                    // Skip field if hideNull is enabled and value is null/empty
                    if (isNullOrEmpty && field.hideNull) return
                    if (!isNullOrEmpty) {
                        // Apply transliteration if Unicode font failed, strip trailing colons
                        const displayAlias = transliterate(String(field.alias || field.name)).replace(/:+$/, '')
                        const displayValue = transliterate(String(value))
                        subtitleParts.push(`${displayAlias}: ${displayValue}`)
                    }
                })
            }
            const subtitleText = subtitleParts.join('  •  ')
            const hasSubtitle = subtitleParts.length > 0

            // Render address with auto-scaling font size for long text
            // Start with desired font size and reduce if necessary to fit
            let addressFontSize = 14
            const minAddressFontSize = 9
            const maxAddressLines = 3 // Maximum lines for address in header

            doc.setFont(activeFontFamily, 'bold')

            // Auto-scale font size to fit within constraints
            let addressLines: string[]
            do {
                doc.setFontSize(addressFontSize)
                addressLines = doc.splitTextToSize(addressTitle.toUpperCase(), textWrapWidth)
                if (addressLines.length <= maxAddressLines) break
                addressFontSize -= 0.5
            } while (addressFontSize >= minAddressFontSize)

            // If still too many lines after min font size, truncate with ellipsis
            if (addressLines.length > maxAddressLines) {
                addressLines = addressLines.slice(0, maxAddressLines)
                const lastLine = addressLines[maxAddressLines - 1]
                if (lastLine.length > 3) {
                    addressLines[maxAddressLines - 1] = lastLine.slice(0, -3) + '...'
                }
            }

            const lineHeight = (addressFontSize * 0.4) + 1.5

            // Calculate starting Y to center text vertically in header
            const subtitleFontSize = Math.max(9, addressFontSize - 3)
            const subtitleLineHeight = (subtitleFontSize * 0.4) + 1
            const totalContentHeight = (addressLines.length * lineHeight) + (hasSubtitle ? subtitleLineHeight + 2 : 0)
            let titleY = (headerHeight - totalContentHeight) / 2 + lineHeight

            // Helper function to calculate X position based on titlePosition setting
            // Always uses true page centering - wrap width ensures no overlap
            const getTextX = (lineWidth: number): number => {
                if (titlePosition === 'left') {
                    return textAreaStart
                } else if (titlePosition === 'right') {
                    return pw - margin - dateReservedWidth - lineWidth
                } else {
                    // Center (default) - true page center
                    // The wrap width calculation ensures lines won't overlap logo/date
                    return (pw - lineWidth) / 2
                }
            }

            // Render address lines
            doc.setFontSize(addressFontSize)
            doc.setFont(activeFontFamily, 'bold')
            addressLines.forEach((line: string, idx: number) => {
                const lineY = titleY + (idx * lineHeight)
                const lineWidth = doc.getTextWidth(line)
                doc.text(line, getTextX(lineWidth), lineY)
            })

            // Render subtitle (Parcel Number, etc.)
            if (hasSubtitle) {
                titleY = titleY + (addressLines.length * lineHeight) + 1
                doc.setFontSize(subtitleFontSize)
                doc.setFont(activeFontFamily, 'bold')
                const subtitleLines = doc.splitTextToSize(subtitleText, textWrapWidth)
                subtitleLines.forEach((line: string, idx: number) => {
                    const lineY = titleY + (idx * subtitleLineHeight)
                    const lineWidth = doc.getTextWidth(line)
                    doc.text(line, getTextX(lineWidth), lineY)
                })
            }

            // Date/Time - positioned on the right side (only if enabled)
            // Controlled by pdfHeader.showGeneratedDate setting (default: true)
            // Note: showDateInHeader was already calculated above for text wrapping

            if (showDateInHeader) {
                doc.setFontSize(pdfStyle.largeTextMode ? 11 : 9)
                doc.setFont(activeFontFamily, 'normal')

                if (pdfStyle.showGeneratedTimestamp) {
                    // Two lines: date on top, time below
                    const dateLineY = headerHeight / 2 - 1
                    const timeLineY = headerHeight / 2 + 5
                    doc.text(dateOnly, pw - margin - dateOnlyWidth, dateLineY)
                    doc.text(timeOnly, pw - margin - timeOnlyWidth, timeLineY)
                } else {
                    // Single line: just date
                    doc.text(dateOnly, pw - margin - dateOnlyWidth, headerHeight / 2 + 2)
                }
            }

            y = headerHeight + 5

            // ========================================
            // WCAG 2.4.5: PDF BOOKMARKS FOR NAVIGATION
            // Track sections for bookmark creation with hierarchy
            // ========================================
            const bookmarks: PdfBookmark[] = []
            const tocEntries: TocEntry[] = []
            let sectionNumber = 0
            let bookmarkIdCounter = 0

            // Helper to generate unique bookmark IDs
            const generateBookmarkId = () => `bm_${++bookmarkIdCounter}`

            // Helper to add bookmark with hierarchy support
            const addBookmark = (
                title: string,
                page: number,
                y: number,
                level: number = 0,
                parentId?: string
            ): string => {
                const id = generateBookmarkId()
                bookmarks.push({ title, page, y, level, parentId, id })
                return id
            }

            // Helper to add TOC entry
            const addTocEntry = (
                title: string,
                page: number,
                level: number,
                type: TocEntry['type']
            ) => {
                if (pdfStyle.enableTableOfContents) {
                    tocEntries.push({ title, page, level, type })
                }
            }

            // ========================================
            // MAP SCREENSHOT
            // ========================================
            if (mapScreenshot) {
                try {
                    // Check if we need a new page
                    if (y + mapHeight + 10 > usableHeight) {
                        doc.addPage()
                        y = margin
                    }

                    // =====================================================
                    // WCAG 1.1.1: Add accessible description for map image
                    // Screen readers cannot interpret images, so we provide
                    // a text description that conveys the same information
                    // Controlled by pdfStyle.showAccessibilityText setting
                    // =====================================================
                    if (pdfAccessibility.includeMapAltText && pdfStyle.showAccessibilityText !== false) {
                        // Apply transliterate() to handle non-ASCII characters (Polish, Czech, Turkish, etc.)
                        // when Unicode fonts fail to load - ensures alt text renders correctly
                        const mapAltText = transliterate(pdfAccessibility.mapAltTextTemplate
                            .replace('{address}', displayedSearchText || 'the selected property')
                            .replace('{coordinates}', queryPoint
                                ? `${queryPoint.latitude?.toFixed(5) || queryPoint.y?.toFixed(5)}, ${queryPoint.longitude?.toFixed(5) || queryPoint.x?.toFixed(5)}`
                                : 'selected location'))

                        const altFontSize = Math.max(7, minFontSize - 2)
                        doc.setFontSize(altFontSize)
                        safeSetFont(activeFontFamily, 'italic')
                        doc.setTextColor(100, 100, 100)

                        // Add accessible description text with proper line spacing
                        const altTextLines = doc.splitTextToSize(`[Map Image: ${mapAltText}]`, contentWidth - 6)
                        const altLineHeight = altFontSize * 0.4
                        altTextLines.forEach((line: string, idx: number) => {
                            doc.text(line, margin + 3, y + altLineHeight + (idx * altLineHeight))
                        })

                        // Reset text color and advance y position
                        doc.setTextColor(0, 0, 0)
                        y += (altTextLines.length * altLineHeight) + 3
                    }

                    // Add border around map
                    doc.setDrawColor(borderRgb[0], borderRgb[1], borderRgb[2])
                    doc.setLineWidth(0.5)
                    doc.rect(margin, y, contentWidth, mapHeight, 'S')

                    // Add the map image - properly sized to fit without distortion
                    doc.addImage(
                        mapScreenshot,
                        'PNG',
                        margin + 0.5,
                        y + 0.5,
                        contentWidth - 1,
                        mapHeight - 1
                    )

                    y += mapHeight + 2
                } catch (imgError) {
                    console.warn('Failed to add map image to PDF:', imgError)
                }
            }

            // ========================================
            // TABLE OF CONTENTS - Generate if enabled
            // WCAG 2.4.5: Multiple Ways to navigate
            // ========================================
            if (pdfStyle.enableTableOfContents && tocEntries.length > 0) {
                // Pre-populate TOC entries from results data
                let tocSectionNum = 0
                for (const sr of results) {
                    // Skip sections excluded from PDF
                    if (sr.sectionConfig.excludeFromPdf) continue

                    tocSectionNum++
                    const tocPrefix = pdfStyle.showSectionNumbers ? `${tocSectionNum}. ` : ''
                    tocEntries.push({
                        title: `${tocPrefix}${sr.sectionConfig.sectionTitle}`,
                        page: 0, // Will be updated during render
                        level: 0,
                        type: 'section'
                    })

                    if (pdfStyle.tocIncludeLayers !== false) {
                        for (const lr of sr.layerResults) {
                            if (lr.features.length > 0) {
                                tocEntries.push({
                                    title: lr.layerConfig.layerTitle,
                                    page: 0,
                                    level: 1,
                                    type: 'layer'
                                })
                            }
                        }
                    }
                }

                // Render TOC
                const tocTitle = pdfStyle.tocTitle || pdfAccessibility.tocTitle || 'Table of Contents'

                // TOC Header
                doc.setFillColor(sectionHeaderRgb[0], sectionHeaderRgb[1], sectionHeaderRgb[2])
                doc.rect(margin, y, contentWidth, 8, 'F')
                doc.setTextColor(sectionHeaderTextRgb[0], sectionHeaderTextRgb[1], sectionHeaderTextRgb[2])
                doc.setFontSize(pdfStyle.largeTextMode ? 12 : 10)
                doc.setFont(activeFontFamily, 'bold')
                doc.text(tocTitle.toUpperCase(), margin + 3, y + 5.5)
                y += 12

                // TOC will show section titles as placeholders
                // (Actual page numbers are determined during content render)
                doc.setTextColor(100, 100, 100)
                doc.setFontSize(9)
                safeSetFont(activeFontFamily, 'italic')
                doc.text('(See sections below)', margin + 3, y)
                y += 8

                // Page break after TOC if configured
                if (pdfStyle.tocPageBreakAfter !== false) {
                    doc.addPage()
                    y = margin
                }
            }

            // Sections
            for (const sr of results) {
                // Skip sections excluded from PDF
                if (sr.sectionConfig.excludeFromPdf) continue

                // Add spacing between sections (but not if we're at the top of a page)
                if (y > margin + 5) {
                    y += 6
                }

                if (y > usableHeight - 30) {
                    doc.addPage()
                    y = margin
                }

                // WCAG 1.3.1: Section numbering for document structure
                sectionNumber++
                const sectionPrefix = pdfStyle.showSectionNumbers ? `${sectionNumber}. ` : ''
                const sectionTitle = `${sectionPrefix}${transliterate(sr.sectionConfig.sectionTitle).toUpperCase()}`

                // Get custom no-results text from layers (if any layer has custom text configured)
                const getPdfNoResultsMessage = (): string | null => {
                    const layers = sr.sectionConfig.layers || []
                    const customMessages: string[] = []

                    for (const layer of layers) {
                        const layerConfig = layer as LayerConfig
                        if (layerConfig.useCustomNoResultsText) {
                            if (layerConfig.customNoResultsText) {
                                customMessages.push(layerConfig.customNoResultsText)
                            }
                        }
                    }

                    if (customMessages.length > 0) {
                        return customMessages.join(' ')
                    }

                    const allLayersUseCustom = layers.length > 0 && layers.every((l: any) => l.useCustomNoResultsText)
                    if (allLayersUseCustom) {
                        return null
                    }

                    return 'No intersecting features found.'
                }

                const pdfNoResultsMessage = getPdfNoResultsMessage()

                // Check if any layer has custom no-results text configured
                const hasAnyPdfCustomNoResultsText = (sr.sectionConfig.layers || []).some(
                    (layer: any) => layer.useCustomNoResultsText && layer.customNoResultsText
                )

                // Pre-capture chart image if this section displays as chart (and not excluded from PDF)
                let chartImageData: string | null = null
                let chartWidth = 0
                let chartHeight = 0

                const includeChartInPdf = sr.sectionConfig.displayAsChart && !sr.sectionConfig.chartExcludeFromPdf

                if (includeChartInPdf && sr.chartData && sr.chartData.length > 0) {
                    const chartElement = chartRefsMap.current.get(sr.sectionConfig.sectionId)
                    if (chartElement) {
                        try {
                            const canvas = await html2canvas(chartElement, {
                                backgroundColor: '#ffffff',
                                scale: 2,
                                logging: false,
                                useCORS: true
                            })

                            chartImageData = canvas.toDataURL('image/png')

                            // Calculate dimensions to fit in PDF
                            const chartAspectRatio = canvas.width / canvas.height
                            chartWidth = contentWidth * 0.9 // 90% of content width
                            chartHeight = chartWidth / chartAspectRatio

                            // Max height constraint
                            const maxChartHeight = 80
                            if (chartHeight > maxChartHeight) {
                                chartHeight = maxChartHeight
                                chartWidth = chartHeight * chartAspectRatio
                            }
                        } catch (err) {
                            console.warn('Failed to pre-capture chart:', err)
                        }
                    }
                }

                // Calculate space needed for this section
                const sectionHeaderHeight = 8
                const minContentHeight = chartImageData ? chartHeight + 5 : 20 // chart or min table space
                const totalNeeded = sectionHeaderHeight + minContentHeight

                // Check if section header + content will fit, if not start new page
                if (y + totalNeeded > usableHeight - 15) {
                    doc.addPage()
                    y = margin
                }

                // WCAG 2.4.5: Track bookmark for this section (hierarchical)
                let currentSectionBookmarkId: string | undefined
                if (pdfStyle.enablePdfBookmarks !== false) {
                    currentSectionBookmarkId = addBookmark(
                        `${sectionPrefix}${sr.sectionConfig.sectionTitle}`,
                        doc.internal.pages.length - 1,
                        y,
                        0  // Level 0 = section
                    )

                    // Add to Table of Contents
                    addTocEntry(
                        `${sectionPrefix}${sr.sectionConfig.sectionTitle}`,
                        doc.internal.pages.length,
                        0,
                        'section'
                    )
                }

                // Section header
                doc.setFillColor(sectionHeaderRgb[0], sectionHeaderRgb[1], sectionHeaderRgb[2])
                doc.rect(margin, y, contentWidth, 8, 'F')
                doc.setTextColor(sectionHeaderTextRgb[0], sectionHeaderTextRgb[1], sectionHeaderTextRgb[2])
                doc.setFontSize(pdfStyle.largeTextMode ? 12 : 10)
                doc.setFont(activeFontFamily, 'bold')
                doc.text(sectionTitle, margin + 3, y + 5.5)
                y += 8

                // Check if rich text should be included in PDF (not excluded)
                const includeRichTextInPdf = !sr.sectionConfig.richTextExcludeFromPdf
                const hasRichTextConfig = includeRichTextInPdf && (sr.sectionConfig.richTextContent || (sr.sectionConfig.richTextButtons && sr.sectionConfig.richTextButtons.length > 0))
                const richTextPosition = sr.sectionConfig.richTextPosition || 'after'

                // Collect field data from section's layer results (first feature from each layer)
                const sectionFieldData: Record<string, any> = {}
                sr.layerResults.forEach(lr => {
                    if (lr.features.length > 0) {
                        Object.entries(lr.features[0]).forEach(([key, value]) => {
                            if (!(key in sectionFieldData)) {
                                sectionFieldData[key] = value
                            }
                        })
                    }
                })

                // Helper to replace placeholders - checks section data first, then header info
                const replacePdfPlaceholders = (text: string): string => {
                    if (!text) return ''
                    return text.replace(/\{([^}]+)\}/g, (match, fieldName) => {
                        if (fieldName in sectionFieldData && sectionFieldData[fieldName] != null) {
                            return String(sectionFieldData[fieldName])
                        }
                        if (headerInfoData && fieldName in headerInfoData && headerInfoData[fieldName] != null) {
                            return String(headerInfoData[fieldName])
                        }
                        return match
                    })
                }

                // Check if rich text has unresolved placeholders
                const hasUnresolvedPlaceholders = (text: string): boolean => {
                    if (!text) return false
                    const replaced = replacePdfPlaceholders(text)
                    return /\{[^}]+\}/.test(replaced)
                }

                // Rich text has unresolved placeholders if content contains placeholders that can't be filled
                const richTextHasUnresolved = sr.sectionConfig.richTextContent
                    ? hasUnresolvedPlaceholders(sr.sectionConfig.richTextContent)
                    : false

                // Only show rich text if it doesn't have unresolved placeholders
                // Also hide if hideRichTextWhenNoResults is enabled and no features were found
                const shouldHideRichTextDueToNoResults = sr.sectionConfig.hideRichTextWhenNoResults && sr.totalFeatures === 0
                const hasRichText = hasRichTextConfig && !richTextHasUnresolved && !shouldHideRichTextDueToNoResults

                // Helper function to render rich text content in PDF
                const renderRichTextToPdf = () => {
                    // Add spacing before rich text
                    y += 3

                    if (sr.sectionConfig.richTextContent) {
                        doc.setTextColor(51, 51, 51)
                        doc.setFontSize(9)
                        doc.setFont(activeFontFamily, 'normal')

                        // Strip HTML tags for PDF (simple conversion)
                        // Convert <br> to space (not newline) so text reflows to full width
                        // Only <p> tags create actual paragraph breaks
                        let plainText = htmlToPlainText(sr.sectionConfig.richTextContent)// br becomes space for reflow
                            .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')  // </p><p> becomes paragraph break
                            .replace(/<\/p>/gi, '\n')          // </p> becomes single newline
                            .replace(/<p[^>]*>/gi, '')         // Remove opening <p> tags
                            .replace(/<[^>]+>/g, '')           // Remove all other HTML tags
                            .replace(/&nbsp;/g, ' ')
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"')
                            .replace(/\s+/g, ' ')              // Collapse multiple spaces to single
                            .trim()

                        // Replace field placeholders
                        plainText = replacePdfPlaceholders(plainText)

                        // Use full content width within margins
                        const lines = doc.splitTextToSize(plainText, contentWidth)
                        const lineHeight = 4

                        for (const line of lines) {
                            if (y > usableHeight - 15) {
                                doc.addPage()
                                y = margin
                            }
                            doc.text(line, margin, y + 3)
                            y += lineHeight
                        }
                        y += 2 // Add spacing after text content
                    }

                    // Render button labels as text with URLs
                    if (sr.sectionConfig.richTextButtons && sr.sectionConfig.richTextButtons.length > 0) {
                        y += 2
                        doc.setFontSize(8)
                        const buttons = toMutable<any>(sr.sectionConfig.richTextButtons) as RichTextButton[]
                        for (const button of buttons) {
                            if (y > usableHeight - 15) {
                                doc.addPage()
                                y = margin
                            }
                            const url = replacePdfPlaceholders(button.url)
                            doc.setTextColor(linkRgb[0], linkRgb[1], linkRgb[2])
                            renderPdfLink(`→ ${button.label}`, margin, y + 3, url)
                            y += 5
                        }
                        doc.setTextColor(51, 51, 51)
                    }
                    y += 2 // Add spacing after rich text section
                }

                // Render rich text BEFORE data if configured
                if (hasRichText && richTextPosition === 'before') {
                    renderRichTextToPdf()
                }

                // Render data content
                const hasNearbyFeatures = sr.nearbyResults && sr.nearbyResults.some(nr => nr.features && nr.features.length > 0)
                const hasChartData = sr.chartData && sr.chartData.length > 0
                const hasAnyContent = sr.totalFeatures > 0 || hasNearbyFeatures || hasChartData || hasRichText

                // Show aggregated message only when no content AND no custom layer messages
                if (!hasAnyContent && !hasAnyPdfCustomNoResultsText) {
                    if (pdfNoResultsMessage) {
                        doc.setTextColor(100, 100, 100)
                        doc.setFontSize(9)
                        safeSetFont(activeFontFamily, 'italic')
                        doc.text(pdfNoResultsMessage, margin + 3, y + 3)
                        y += 4
                    }
                } else if (!hasAnyContent && hasAnyPdfCustomNoResultsText) {
                    // No features but has custom no-results text - iterate through layers to show individual messages
                    const shouldRenderTable = sr.sectionConfig.displayAsTable ||
                        (sr.sectionConfig.displayAsChart && !chartImageData)

                    if (shouldRenderTable) {
                        // Get layers with custom no-results text
                        const layersWithNoResults = sr.layerResults.filter(
                            lr => lr.layerConfig.useCustomNoResultsText && lr.layerConfig.customNoResultsText
                        )

                        // Add spacing after section header
                        y += 4

                        for (let lrIdx = 0; lrIdx < layersWithNoResults.length; lrIdx++) {
                            const lr = layersWithNoResults[lrIdx]

                            // Check if we need a new page
                            if (y > usableHeight - 20) {
                                doc.addPage()
                                y = margin
                            }

                            // Always show styled layer title header for consistency
                            // (matches appearance of layers with data)
                            const layerTitleHeight = 6
                            const layerTitleBgColorValue = pdfStyle.layerTitleBgColor || '#69812D'
                            const layerTitleTextColorValue = pdfStyle.layerTitleTextColor || '#FFFFFF'
                            const layerTitleBgRgb = hexToRgb(layerTitleBgColorValue)
                            const layerTitleTextRgb = hexToRgb(layerTitleTextColorValue)

                            doc.setFillColor(layerTitleBgRgb[0], layerTitleBgRgb[1], layerTitleBgRgb[2])
                            doc.rect(margin, y, contentWidth, layerTitleHeight, 'F')

                            doc.setTextColor(layerTitleTextRgb[0], layerTitleTextRgb[1], layerTitleTextRgb[2])
                            doc.setFontSize(pdfStyle.largeTextMode ? 10 : 9)
                            doc.setFont(activeFontFamily, 'bold')
                            doc.text(transliterate(lr.layerConfig.layerTitle), margin + 3, y + 4)

                            y += layerTitleHeight + 4

                            // Add custom no-results message in italics
                            doc.setFontSize(Math.max(pdfStyle.tableDataFontSize || 8, minFontSize))
                            safeSetFont(fontFamily, 'italic')
                            doc.setTextColor(100, 100, 100)
                            doc.text(lr.layerConfig.customNoResultsText, margin + 3, y)
                            y += 6

                            doc.setFont(fontFamily, 'normal')
                            doc.setTextColor(0, 0, 0)
                        }
                    }
                } else {
                    // Check if this section displays as chart and we have pre-captured image
                    if (chartImageData && chartWidth > 0 && chartHeight > 0) {
                        // Center the chart
                        const chartX = margin + (contentWidth - chartWidth) / 2

                        doc.addImage(chartImageData, 'PNG', chartX, y, chartWidth, chartHeight)
                        y += chartHeight + 5

                        // Add chart description if present
                        if (sr.sectionConfig.chartConfig?.chartDescription) {
                            doc.setFontSize(9)
                            doc.setFont(activeFontFamily, 'normal')
                            doc.setTextColor(51, 51, 51)

                            let descText = htmlToPlainText(sr.sectionConfig.chartConfig.chartDescription).trim()

                            // Replace placeholders
                            descText = descText.replace(/\{([^}]+)\}/g, (match, fieldName) => {
                                if (sr.layerResults[0]?.features[0]?.[fieldName] != null) {
                                    return String(sr.layerResults[0].features[0][fieldName])
                                }
                                if (headerInfoData?.[fieldName] != null) {
                                    return String(headerInfoData[fieldName])
                                }
                                return match
                            })

                            const descLines = doc.splitTextToSize(descText, contentWidth)
                            for (const line of descLines) {
                                if (y > usableHeight - 15) {
                                    doc.addPage()
                                    y = margin
                                }
                                doc.text(line, margin, y + 3)
                                y += 4
                            }
                            y += 2
                        }
                    }

                    // Render as table if:
                    // 1. displayAsTable is true, OR
                    // 2. displayAsChart was true but chart capture failed (no chartImageData)
                    const shouldRenderTable = sr.sectionConfig.displayAsTable ||
                        (sr.sectionConfig.displayAsChart && !chartImageData)

                    if (shouldRenderTable) {
                        // PDF Table Settings from config
                        const tableHeaderBgColor = pdfStyle.tableHeaderBgColor || '#1A6B7C'
                        const tableHeaderTextColor = pdfStyle.tableHeaderTextColor || '#FFFFFF'
                        // WCAG 1.4.4: Enforce minimum font sizes for text readability
                        const tableHeaderFontSize = Math.max(pdfStyle.tableHeaderFontSize || 8, minFontSize)
                        const tableDataFontSize = Math.max(pdfStyle.tableDataFontSize || 8, minFontSize)
                        const tableDataTextColor = pdfStyle.tableDataTextColor || '#333333'
                        const tableShowBorders = pdfStyle.tableShowBorders !== false
                        const tableBorderColor = pdfStyle.tableBorderColor || '#CCCCCC'
                        const tableStripedRows = pdfStyle.tableStripedRows !== false
                        const tableRowHeight = pdfStyle.tableRowHeight || 7
                        const tableMaxColumns = pdfStyle.tableMaxColumns || 6
                        const tableMaxRows = pdfStyle.tableMaxRows || 15
                        const tableHeaderHeight = pdfStyle.tableHeaderHeight || 8
                        const tableCellPadding = pdfStyle.tableCellPadding || 2

                        const tableHeaderBgRgb = hexToRgb(tableHeaderBgColor)
                        const tableHeaderTextRgb = hexToRgb(tableHeaderTextColor)
                        const tableDataTextRgb = hexToRgb(tableDataTextColor)
                        const tableBorderRgb = hexToRgb(tableBorderColor)

                        // Layer results
                        for (const lr of sr.layerResults) {
                            // Handle layers with no features - add custom message to PDF if configured
                            if (lr.features.length === 0) {
                                if (lr.layerConfig.useCustomNoResultsText && lr.layerConfig.customNoResultsText) {
                                    // Check if we need a new page
                                    if (y > usableHeight - 20) {
                                        doc.addPage()
                                        y = margin
                                    }

                                    // Add spacing before layer
                                    y += 4

                                    // Render styled layer title header (same as layers with data)
                                    const layerTitleHeight = 6
                                    const layerTitleBgColorValue = pdfStyle.layerTitleBgColor || '#69812D'
                                    const layerTitleTextColorValue = pdfStyle.layerTitleTextColor || '#FFFFFF'
                                    const layerTitleBgRgb = hexToRgb(layerTitleBgColorValue)
                                    const layerTitleTextRgb = hexToRgb(layerTitleTextColorValue)

                                    doc.setFillColor(layerTitleBgRgb[0], layerTitleBgRgb[1], layerTitleBgRgb[2])
                                    doc.rect(margin, y, contentWidth, layerTitleHeight, 'F')

                                    doc.setTextColor(layerTitleTextRgb[0], layerTitleTextRgb[1], layerTitleTextRgb[2])
                                    doc.setFontSize(pdfStyle.largeTextMode ? 10 : 9)
                                    doc.setFont(activeFontFamily, 'bold')
                                    doc.text(transliterate(lr.layerConfig.layerTitle), margin + 3, y + 4)

                                    y += layerTitleHeight + 4

                                    // Add custom no-results message in italics
                                    doc.setFontSize(Math.max(pdfStyle.tableDataFontSize || 8, minFontSize))
                                    safeSetFont(fontFamily, 'italic')
                                    doc.setTextColor(100, 100, 100)
                                    doc.text(lr.layerConfig.customNoResultsText, margin + 3, y)
                                    y += 6

                                    doc.setFont(fontFamily, 'normal')
                                    doc.setTextColor(0, 0, 0)
                                }
                                continue
                            }

                            if (y > usableHeight - 25) {
                                doc.addPage()
                                y = margin
                            }

                            // WCAG 2.4.5: Add layer-level bookmark (hierarchical)
                            if (pdfStyle.enablePdfBookmarks !== false &&
                                pdfStyle.enableHierarchicalBookmarks !== false &&
                                sr.layerResults.length > 1) {
                                addBookmark(
                                    lr.layerConfig.layerTitle,
                                    doc.internal.pages.length - 1,
                                    y,
                                    1,  // Level 1 = layer
                                    currentSectionBookmarkId
                                )

                                // Add to TOC if layers are included
                                if (pdfStyle.tocIncludeLayers !== false) {
                                    addTocEntry(
                                        lr.layerConfig.layerTitle,
                                        doc.internal.pages.length,
                                        1,
                                        'layer'
                                    )
                                }
                            }

                            // Layer-level rich text helper function for PDF
                            const layerHasRichTextConfig = lr.layerConfig.layerRichTextContent || (lr.layerConfig.layerRichTextButtons && lr.layerConfig.layerRichTextButtons.length > 0)
                            const layerRichTextPosition = lr.layerConfig.layerRichTextPosition || 'after'
                            const includeLayerRichTextInPdf = !lr.layerConfig.layerRichTextExcludeFromPdf

                            // Check for unresolved placeholders in layer rich text
                            const replaceLayerPdfPlaceholders = (text: string): string => {
                                if (!text) return text
                                if (lr.features.length === 0) return text
                                const firstFeature = lr.features[0]
                                return text.replace(/\{([^}]+)\}/g, (match, fieldName) => {
                                    const trimmedName = fieldName.trim()
                                    if (firstFeature && firstFeature[trimmedName] !== undefined && firstFeature[trimmedName] !== null) {
                                        return String(firstFeature[trimmedName])
                                    }
                                    return match
                                })
                            }

                            const layerRichTextHasUnresolved = lr.layerConfig.layerRichTextContent
                                ? /\{[^}]+\}/.test(replaceLayerPdfPlaceholders(lr.layerConfig.layerRichTextContent))
                                : false
                            const shouldHideLayerRichTextDueToNoResults = lr.layerConfig.hideLayerRichTextWhenNoResults && lr.features.length === 0
                            const hasLayerRichText = includeLayerRichTextInPdf && layerHasRichTextConfig && !layerRichTextHasUnresolved && !shouldHideLayerRichTextDueToNoResults

                            // Helper function to render layer rich text content in PDF
                            const renderLayerRichTextToPdf = () => {
                                // Add spacing before rich text
                                y += 3

                                if (lr.layerConfig.layerRichTextContent) {
                                    doc.setTextColor(51, 51, 51)
                                    doc.setFontSize(9)
                                    doc.setFont(activeFontFamily, 'normal')

                                    // Strip HTML tags for PDF
                                    let plainText = htmlToPlainText(lr.layerConfig.layerRichTextContent).trim()

                                    // Replace field placeholders with layer data
                                    plainText = replaceLayerPdfPlaceholders(plainText)

                                    // Use full content width within margins
                                    const lines = doc.splitTextToSize(plainText, contentWidth)
                                    const lineHeight = 4

                                    for (const line of lines) {
                                        if (y > usableHeight - 15) {
                                            doc.addPage()
                                            y = margin
                                        }
                                        doc.text(line, margin, y + 3)
                                        y += lineHeight
                                    }
                                    y += 2 // Add spacing after text content
                                }

                                // Render button labels as text with URLs
                                if (lr.layerConfig.layerRichTextButtons && lr.layerConfig.layerRichTextButtons.length > 0) {
                                    y += 2
                                    doc.setFontSize(8)
                                    const buttons = toMutable<any>(lr.layerConfig.layerRichTextButtons) as RichTextButton[]
                                    for (const button of buttons) {
                                        if (y > usableHeight - 15) {
                                            doc.addPage()
                                            y = margin
                                        }
                                        const url = replaceLayerPdfPlaceholders(button.url)
                                        doc.setTextColor(linkRgb[0], linkRgb[1], linkRgb[2])
                                        renderPdfLink(`→ ${button.label}`, margin, y + 3, url)
                                        y += 5
                                    }
                                    doc.setTextColor(51, 51, 51)
                                }
                                y += 2 // Add spacing after rich text section
                            }

                            // Render layer rich text BEFORE data if configured
                            if (hasLayerRichText && layerRichTextPosition === 'before') {
                                renderLayerRichTextToPdf()
                            }

                            // =====================================================
                            // Layer Title Header - Show when section has multiple layers
                            // This matches the widget display where each layer has its own header
                            // =====================================================
                            const showLayerTitleInPdf = sr.layerResults.filter(l => l.features.length > 0).length > 1
                            if (showLayerTitleInPdf) {
                                // Add spacing before layer title
                                y += 4

                                // Check if we need a new page
                                if (y > usableHeight - 20) {
                                    doc.addPage()
                                    y = margin
                                }

                                // Render layer title with configurable background color
                                // Uses separate color from table headers for visual distinction
                                const layerTitleHeight = 6
                                const layerTitleBgColorValue = pdfStyle.layerTitleBgColor || '#69812D'
                                const layerTitleTextColorValue = pdfStyle.layerTitleTextColor || '#FFFFFF'
                                const layerTitleBgRgb = hexToRgb(layerTitleBgColorValue)
                                const layerTitleTextRgb = hexToRgb(layerTitleTextColorValue)

                                doc.setFillColor(layerTitleBgRgb[0], layerTitleBgRgb[1], layerTitleBgRgb[2])
                                doc.rect(margin, y, contentWidth, layerTitleHeight, 'F')

                                doc.setTextColor(layerTitleTextRgb[0], layerTitleTextRgb[1], layerTitleTextRgb[2])
                                doc.setFontSize(pdfStyle.largeTextMode ? 10 : 9)
                                doc.setFont(activeFontFamily, 'bold')
                                doc.text(transliterate(lr.layerConfig.layerTitle), margin + 3, y + 4)

                                // Add record count on the right
                                const recordCountText = `${lr.features.length} record${lr.features.length !== 1 ? 's' : ''}`
                                doc.setFontSize(pdfStyle.largeTextMode ? 9 : 8)
                                doc.setFont(activeFontFamily, 'normal')
                                const recordCountWidth = doc.getTextWidth(recordCountText)
                                doc.text(recordCountText, margin + contentWidth - recordCountWidth - 3, y + 4)

                                y += layerTitleHeight + 2

                                // Reset text color
                                doc.setTextColor(0, 0, 0)
                            }

                            // Filter visible fields and apply hideNull logic
                            const visibleFieldsBase = normalizeFields(toMutable<any>(lr.layerConfig.fields)).filter((f: any) => f.visible && !f.excludeFromPdf)
                            // Filter out fields where hideNull is true and ALL values are null/empty
                            const visibleFields = visibleFieldsBase.filter((field: any) => {
                                if (!field.hideNull) return true // Keep field if hideNull is not enabled
                                // Check if ALL values for this field are null/empty
                                const allNull = lr.features.every((feature: any) => {
                                    const value = feature[field.name]
                                    return value == null || value === ''
                                })
                                return !allNull // Keep field if NOT all values are null
                            })

                            // =====================================================
                            // WCAG 1.3.1: Add table summary for accessibility
                            // This helps screen readers understand the table structure
                            // before the user navigates into the table content
                            // Controlled by pdfStyle.showTableSummaries setting
                            // =====================================================
                            if (pdfAccessibility.includeTableSummaries && pdfStyle.showTableSummaries !== false && visibleFields.length > 0) {
                                const tableSummary = transliterate(pdfAccessibility.tableSummaryTemplate
                                    .replace('{layerTitle}', lr.layerConfig.layerTitle || 'Data')
                                    .replace('{recordCount}', String(lr.features.length))
                                    .replace('{columnCount}', String(visibleFields.length)))

                                const summaryFontSize = Math.max(7, minFontSize - 2)
                                doc.setFontSize(summaryFontSize)
                                safeSetFont(activeFontFamily, 'italic')
                                doc.setTextColor(100, 100, 100)

                                // Add spacing before summary text
                                y += 2
                                doc.text(`[${tableSummary}]`, margin + 3, y + summaryFontSize * 0.35)
                                doc.setTextColor(0, 0, 0)
                                y += summaryFontSize * 0.5 + 2
                            }

                            // Split fields into chunks based on maxColumns for wrapping
                            const fieldChunks: any[][] = []
                            for (let i = 0; i < visibleFields.length; i += tableMaxColumns) {
                                fieldChunks.push(visibleFields.slice(i, i + tableMaxColumns))
                            }

                            // Line height multiplier for wrapped text
                            const lineHeightMultiplier = 1.2

                            // Process each feature
                            const maxRows = Math.min(lr.features.length, tableMaxRows)

                            for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
                                const feature = lr.features[rowIndex]

                                // For each field chunk, render header + data row pair
                                fieldChunks.forEach((chunkFields, chunkIndex) => {
                                    const numCols = chunkFields.length
                                    const colWidth = contentWidth / numCols
                                    const cellContentWidth = colWidth - (tableCellPadding * 2)

                                    // === CALCULATE HEADER ROW HEIGHT (with text wrapping) ===
                                    doc.setFontSize(tableHeaderFontSize)
                                    doc.setFont(activeFontFamily, 'bold')
                                    const headerLineHeight = tableHeaderFontSize * 0.4 * lineHeightMultiplier

                                    let maxHeaderLines = 1
                                    const headerWrappedTexts: string[][] = []
                                    chunkFields.forEach((field: any) => {
                                        const headerText = transliterate(field.alias || field.name)
                                        const wrappedLines = doc.splitTextToSize(headerText, cellContentWidth)
                                        headerWrappedTexts.push(wrappedLines)
                                        maxHeaderLines = Math.max(maxHeaderLines, wrappedLines.length)
                                    })
                                    const dynamicHeaderHeight = Math.max(tableHeaderHeight, (maxHeaderLines * headerLineHeight) + (tableCellPadding * 2))

                                    // === CALCULATE DATA ROW HEIGHT (with text wrapping) ===
                                    doc.setFontSize(tableDataFontSize)
                                    doc.setFont(activeFontFamily, 'normal')
                                    const dataLineHeight = tableDataFontSize * 0.4 * lineHeightMultiplier

                                    // URL font settings for height calculation
                                    const urlFontSize = Math.max(6, minFontSize - 3)
                                    const urlLineHeight = urlFontSize * 0.4

                                    let maxDataLines = 1
                                    let maxUrlLines = 0
                                    const dataWrappedTexts: { lines: string[], isUrl: boolean, url: string }[] = []
                                    chunkFields.forEach((field: any) => {
                                        const rawValue = feature[field.name]
                                        let displayText: string
                                        let cellIsUrl = false
                                        let cellUrl = ''

                                        if (rawValue == null || rawValue === '') {
                                            displayText = '—'
                                        } else if (field.format?.type === 'link') {
                                            // Handle link format with optional base URL
                                            cellIsUrl = true
                                            if (field.format?.useLinkBaseUrl && field.format?.linkBaseUrl) {
                                                cellUrl = field.format.linkBaseUrl + String(rawValue)
                                            } else if (isUrl(rawValue)) {
                                                cellUrl = String(rawValue)
                                            } else {
                                                cellUrl = String(rawValue)
                                            }
                                            displayText = transliterate(field.format?.linkText || String(rawValue))

                                            // Calculate URL lines if showing full URLs
                                            if (pdfStyle.showFullUrlsInPdf && displayText !== cellUrl) {
                                                doc.setFontSize(urlFontSize)
                                                const urlWrappedLines = doc.splitTextToSize(`(${cellUrl})`, cellContentWidth)
                                                maxUrlLines = Math.max(maxUrlLines, Math.min(urlWrappedLines.length, 6))
                                                doc.setFontSize(tableDataFontSize)
                                            }
                                        } else if (isUrl(rawValue)) {
                                            cellIsUrl = true
                                            cellUrl = String(rawValue)
                                            displayText = transliterate(field.format?.linkText || String(rawValue))

                                            // Calculate URL lines if showing full URLs
                                            if (pdfStyle.showFullUrlsInPdf && displayText !== cellUrl) {
                                                doc.setFontSize(urlFontSize)
                                                const urlWrappedLines = doc.splitTextToSize(`(${cellUrl})`, cellContentWidth)
                                                maxUrlLines = Math.max(maxUrlLines, Math.min(urlWrappedLines.length, 6))
                                                doc.setFontSize(tableDataFontSize)
                                            }
                                        } else {
                                            // Use domain-aware formatting to resolve coded value domains
                                            displayText = transliterate(formatFieldValueWithDomain(rawValue, field as FieldConfig, lr.domainLookup))
                                        }

                                        const wrappedLines = doc.splitTextToSize(String(displayText), cellContentWidth)
                                        dataWrappedTexts.push({ lines: wrappedLines, isUrl: cellIsUrl, url: cellUrl })
                                        maxDataLines = Math.max(maxDataLines, wrappedLines.length)
                                    })
                                    // Add extra height for URL lines
                                    const urlExtraHeight = maxUrlLines > 0 ? (maxUrlLines * urlLineHeight) : 0
                                    const dynamicDataRowHeight = Math.max(tableRowHeight, (maxDataLines * dataLineHeight) + urlExtraHeight + (tableCellPadding * 2))

                                    // Check for page break before header + data
                                    if (y > usableHeight - (dynamicHeaderHeight + dynamicDataRowHeight + 10)) {
                                        doc.addPage()
                                        y = margin
                                    }

                                    // === RENDER HEADER ROW ===
                                    doc.setFillColor(tableHeaderBgRgb[0], tableHeaderBgRgb[1], tableHeaderBgRgb[2])
                                    doc.rect(margin, y, contentWidth, dynamicHeaderHeight, 'F')
                                    doc.setTextColor(tableHeaderTextRgb[0], tableHeaderTextRgb[1], tableHeaderTextRgb[2])
                                    doc.setFontSize(tableHeaderFontSize)
                                    doc.setFont(activeFontFamily, 'bold')

                                    // Draw header borders if enabled
                                    if (tableShowBorders) {
                                        doc.setDrawColor(tableBorderRgb[0], tableBorderRgb[1], tableBorderRgb[2])
                                        doc.setLineWidth(0.2)
                                        doc.rect(margin, y, contentWidth, dynamicHeaderHeight, 'S')
                                        for (let i = 1; i < numCols; i++) {
                                            doc.line(margin + (i * colWidth), y, margin + (i * colWidth), y + dynamicHeaderHeight)
                                        }
                                    }

                                    // Render wrapped header text with clipping to cell boundaries
                                    headerWrappedTexts.forEach((wrappedLines, i) => {
                                        const cellX = margin + tableCellPadding + (i * colWidth)
                                        const cellMaxX = margin + ((i + 1) * colWidth) - tableCellPadding
                                        let textY = y + tableCellPadding + headerLineHeight * 0.8
                                        wrappedLines.forEach((line) => {
                                            // Clip text if it exceeds cell boundary
                                            let displayLine = line
                                            let lineWidth = doc.getTextWidth(displayLine)
                                            const maxWidth = cellMaxX - cellX

                                            // Truncate with ellipsis if too wide
                                            while (lineWidth > maxWidth && displayLine.length > 4) {
                                                displayLine = displayLine.slice(0, -4) + '...'
                                                lineWidth = doc.getTextWidth(displayLine)
                                            }

                                            doc.text(displayLine, cellX, textY)
                                            textY += headerLineHeight
                                        })
                                    })
                                    y += dynamicHeaderHeight

                                    // === RENDER DATA ROW ===
                                    const stripeIndex = rowIndex * fieldChunks.length + chunkIndex
                                    if (tableStripedRows && stripeIndex % 2 === 0) {
                                        doc.setFillColor(alternateRowRgb[0], alternateRowRgb[1], alternateRowRgb[2])
                                        doc.rect(margin, y, contentWidth, dynamicDataRowHeight, 'F')
                                    }

                                    // Draw data row borders if enabled
                                    if (tableShowBorders) {
                                        doc.setDrawColor(tableBorderRgb[0], tableBorderRgb[1], tableBorderRgb[2])
                                        doc.setLineWidth(0.2)
                                        doc.rect(margin, y, contentWidth, dynamicDataRowHeight, 'S')
                                        for (let i = 1; i < numCols; i++) {
                                            doc.line(margin + (i * colWidth), y, margin + (i * colWidth), y + dynamicDataRowHeight)
                                        }
                                    }

                                    doc.setFont(activeFontFamily, 'normal')
                                    doc.setFontSize(tableDataFontSize)
                                    doc.setTextColor(tableDataTextRgb[0], tableDataTextRgb[1], tableDataTextRgb[2])

                                    // Render wrapped data text
                                    dataWrappedTexts.forEach((cellData, i) => {
                                        const cellX = margin + tableCellPadding + (i * colWidth)
                                        let textY = y + tableCellPadding + dataLineHeight * 0.8

                                        if (cellData.isUrl) {
                                            // Render URL as link (first line only for link area)
                                            doc.setTextColor(linkRgb[0], linkRgb[1], linkRgb[2])
                                            cellData.lines.forEach((line, lineIdx) => {
                                                if (lineIdx === 0) {
                                                    renderPdfLink(line, cellX, textY, cellData.url)
                                                } else {
                                                    doc.text(line, cellX, textY)
                                                }
                                                textY += dataLineHeight
                                            })

                                            // =====================================================
                                            // WCAG 2.4.4: Show full URL for print accessibility
                                            // When printing, users lose the ability to click links
                                            // so showing the full URL helps them access the resource
                                            // Controlled by pdfStyle.showFullUrlsInPdf setting
                                            // =====================================================
                                            if (pdfStyle.showFullUrlsInPdf && cellData.url && cellData.lines[0] !== cellData.url) {
                                                const urlFontSize = Math.max(6, minFontSize - 3)
                                                doc.setFontSize(urlFontSize)
                                                doc.setTextColor(100, 100, 100)
                                                // Allow URL to wrap to multiple lines (up to 6)
                                                const urlLines = doc.splitTextToSize(`(${cellData.url})`, cellContentWidth)
                                                const urlLineHeight = urlFontSize * 0.4
                                                urlLines.slice(0, 6).forEach((urlLine: string) => {
                                                    doc.text(urlLine, cellX, textY)
                                                    textY += urlLineHeight
                                                })
                                                doc.setFontSize(tableDataFontSize)
                                            }

                                            doc.setTextColor(tableDataTextRgb[0], tableDataTextRgb[1], tableDataTextRgb[2])
                                        } else {
                                            cellData.lines.forEach((line) => {
                                                doc.text(line, cellX, textY)
                                                textY += dataLineHeight
                                            })
                                        }
                                    })
                                    y += dynamicDataRowHeight
                                })

                                // Add spacing between features if multiple features exist
                                if (maxRows > 1 && rowIndex < maxRows - 1) {
                                    y += 1
                                }
                            }

                            if (lr.features.length > maxRows) {
                                doc.setTextColor(136, 136, 136)
                                doc.setFontSize(tableDataFontSize - 1)
                                safeSetFont(activeFontFamily, 'italic')
                                doc.text(`... and ${lr.features.length - maxRows} more record${lr.features.length - maxRows !== 1 ? 's' : ''}`, margin + tableCellPadding, y + 4)
                                y += 5
                            }
                            y += 1

                            // =====================================================
                            // RELATED TABLES - Render if enabled in config
                            // Enhanced with WCAG summaries and chart support
                            // =====================================================
                            if (config.pdfIncludeRelatedTables !== false && lr.relatedData && lr.relatedData.length > 0) {
                                for (const relData of lr.relatedData) {
                                    if (!relData.records || relData.records.length === 0) continue

                                    // Check if this related table should be excluded from PDF
                                    if (relData.tableConfig.pdfExclude) continue

                                    // Check if we need a new page
                                    if (y > usableHeight - 30) {
                                        doc.addPage()
                                        y = margin
                                    }

                                    const relatedTableName = transliterate(relData.tableConfig.tableName)
                                    const relatedRecordCount = relData.records.length

                                    // WCAG 2.4.5: Add hierarchical bookmark for related table
                                    if (pdfStyle.enablePdfBookmarks !== false && pdfStyle.enableHierarchicalBookmarks !== false) {
                                        addBookmark(
                                            `Related: ${relatedTableName}`,
                                            doc.internal.pages.length - 1,
                                            y,
                                            2,  // Level 2 = related table
                                            currentSectionBookmarkId
                                        )

                                        // Add to TOC if enabled
                                        if (pdfStyle.tocIncludeRelatedTables) {
                                            addTocEntry(
                                                `Related: ${relatedTableName}`,
                                                doc.internal.pages.length,
                                                2,
                                                'relatedTable'
                                            )
                                        }
                                    }

                                    // Related table header with configurable styling
                                    y += 3
                                    const relatedHeaderColor = pdfStyle.relatedTableHeaderColor || '#DCDCDC'
                                    const relatedHeaderRgb = hexToRgb(relatedHeaderColor)
                                    const relatedIndent = pdfStyle.relatedTableIndent || 5

                                    doc.setFillColor(relatedHeaderRgb[0], relatedHeaderRgb[1], relatedHeaderRgb[2])
                                    doc.rect(margin + relatedIndent, y, contentWidth - (relatedIndent * 2), 6, 'F')
                                    doc.setTextColor(51, 51, 51)
                                    doc.setFontSize(tableHeaderFontSize - 1)
                                    doc.setFont(activeFontFamily, 'bold')
                                    doc.text(`Related: ${relatedTableName} (${relatedRecordCount} record${relatedRecordCount !== 1 ? 's' : ''})`, margin + relatedIndent + 3, y + 4)
                                    y += 8

                                    // Get visible fields for related table in PDF
                                    // Use fields configuration, filtering out those excluded from PDF
                                    let relatedFieldsBase: any[] = normalizeFields(relData.tableConfig.fields || []).filter((f: any) => f.visible !== false && !f.excludeFromPdf)
                                    // Filter out fields where hideNull is true and ALL values are null/empty
                                    let relatedFields = relatedFieldsBase.filter((field: any) => {
                                        if (!field.hideNull) return true // Keep field if hideNull is not enabled
                                        // Check if ALL values for this field are null/empty
                                        const allNull = relData.records.every((record: any) => {
                                            const value = record[field.name]
                                            return value == null || value === ''
                                        })
                                        return !allNull // Keep field if NOT all values are null
                                    })

                                    if (relatedFields.length === 0) {
                                        // Use first 5 fields from data if no fields configured
                                        const sampleRecord = relData.records[0] || {}
                                        Object.keys(sampleRecord).slice(0, 5).forEach(key => {
                                            relatedFields.push({ name: key, alias: key, visible: true })
                                        })
                                    }

                                    // =====================================================
                                    // WCAG 1.3.1: Add table summary for related table
                                    // =====================================================
                                    const showRelatedSummary = (pdfStyle.showRelatedTableSummaries !== false) &&
                                        (relData.tableConfig.pdfShowTableSummary !== false) &&
                                        pdfAccessibility.includeRelatedTableSummaries

                                    if (showRelatedSummary && relatedFields.length > 0) {
                                        const relatedSummary = (pdfAccessibility.relatedTableSummaryTemplate ||
                                            'Related data: {tableName} - {recordCount} records, {columnCount} columns')
                                            .replace('{tableName}', relatedTableName)
                                            .replace('{recordCount}', String(relatedRecordCount))
                                            .replace('{columnCount}', String(relatedFields.length))

                                        const summaryFontSize = Math.max(6, minFontSize - 3)
                                        doc.setFontSize(summaryFontSize)
                                        safeSetFont(activeFontFamily, 'italic')
                                        doc.setTextColor(100, 100, 100)

                                        doc.text(`[${relatedSummary}]`, margin + (pdfStyle.relatedTableIndent || 5) + 3, y + summaryFontSize * 0.35)
                                        doc.setTextColor(0, 0, 0)
                                        y += summaryFontSize * 0.5 + 3
                                    }

                                    // Limit columns and rows for related tables
                                    const relatedMaxCols = Math.min(relatedFields.length, tableMaxColumns)
                                    const relatedMaxRows = Math.min(relData.records.length, Math.min(relData.tableConfig.maxRecords || 10, 10))
                                    const displayRelatedFields = relatedFields.slice(0, relatedMaxCols)

                                    const relColWidth = (contentWidth - 10) / displayRelatedFields.length
                                    const relCellPadding = 1.5

                                    // Related table header row
                                    doc.setFillColor(tableHeaderBgRgb[0], tableHeaderBgRgb[1], tableHeaderBgRgb[2])
                                    doc.rect(margin + 5, y, contentWidth - 10, 5, 'F')
                                    doc.setTextColor(tableHeaderTextRgb[0], tableHeaderTextRgb[1], tableHeaderTextRgb[2])
                                    doc.setFontSize(tableHeaderFontSize - 1)
                                    doc.setFont(activeFontFamily, 'bold')

                                    displayRelatedFields.forEach((field: any, colIdx: number) => {
                                        const cellX = margin + 5 + (colIdx * relColWidth) + relCellPadding
                                        const cellMaxX = margin + 5 + ((colIdx + 1) * relColWidth) - relCellPadding
                                        const maxWidth = cellMaxX - cellX

                                        let headerText = transliterate(String(field.alias || field.name))
                                        let textWidth = doc.getTextWidth(headerText)

                                        // Truncate with ellipsis if too wide for cell
                                        while (textWidth > maxWidth && headerText.length > 4) {
                                            headerText = headerText.slice(0, -4) + '...'
                                            textWidth = doc.getTextWidth(headerText)
                                        }

                                        doc.text(headerText, cellX, y + 3.5)
                                    })
                                    y += 5

                                    // Related table data rows
                                    doc.setTextColor(tableDataTextRgb[0], tableDataTextRgb[1], tableDataTextRgb[2])
                                    doc.setFontSize(tableDataFontSize - 1)
                                    doc.setFont(activeFontFamily, 'normal')

                                    for (let relRowIdx = 0; relRowIdx < relatedMaxRows; relRowIdx++) {
                                        const relRecord = relData.records[relRowIdx]

                                        // Check if we need a new page
                                        if (y > usableHeight - 10) {
                                            doc.addPage()
                                            y = margin
                                        }

                                        // Striped rows
                                        if (tableStripedRows && relRowIdx % 2 === 1) {
                                            doc.setFillColor(alternateRowRgb[0], alternateRowRgb[1], alternateRowRgb[2])
                                            doc.rect(margin + 5, y, contentWidth - 10, 5, 'F')
                                        }

                                        // Border
                                        if (tableShowBorders) {
                                            doc.setDrawColor(tableBorderRgb[0], tableBorderRgb[1], tableBorderRgb[2])
                                            doc.setLineWidth(0.1)
                                            doc.rect(margin + 5, y, contentWidth - 10, 5, 'S')
                                        }

                                        doc.setTextColor(tableDataTextRgb[0], tableDataTextRgb[1], tableDataTextRgb[2])
                                        displayRelatedFields.forEach((field: any, colIdx: number) => {
                                            const cellX = margin + 5 + (colIdx * relColWidth) + relCellPadding
                                            const cellMaxX = margin + 5 + ((colIdx + 1) * relColWidth) - relCellPadding
                                            const maxWidth = cellMaxX - cellX

                                            const rawValue = relRecord[field.name]
                                            let displayText = '—'
                                            let cellIsUrl = false
                                            let cellUrl = ''

                                            if (rawValue != null && rawValue !== '') {
                                                if (field.format?.type === 'link') {
                                                    // Handle link format with optional base URL
                                                    cellIsUrl = true
                                                    if (field.format?.useLinkBaseUrl && field.format?.linkBaseUrl) {
                                                        cellUrl = field.format.linkBaseUrl + String(rawValue)
                                                    } else if (isUrl(rawValue)) {
                                                        cellUrl = String(rawValue)
                                                    } else {
                                                        cellUrl = String(rawValue)
                                                    }
                                                    displayText = transliterate(field.format?.linkText || String(rawValue))
                                                } else if (isUrl(rawValue)) {
                                                    cellIsUrl = true
                                                    cellUrl = String(rawValue)
                                                    displayText = transliterate(field.format?.linkText || String(rawValue))
                                                } else {
                                                    // Use domain-aware formatting to resolve coded value domains
                                                    displayText = transliterate(formatFieldValueWithDomain(rawValue, field as FieldConfig, relData.domainLookup))
                                                }
                                            }

                                            // Truncate with ellipsis if too wide for cell
                                            let textWidth = doc.getTextWidth(displayText)
                                            while (textWidth > maxWidth && displayText.length > 4) {
                                                displayText = displayText.slice(0, -4) + '...'
                                                textWidth = doc.getTextWidth(displayText)
                                            }

                                            if (cellIsUrl && cellUrl) {
                                                doc.setTextColor(linkRgb[0], linkRgb[1], linkRgb[2])
                                                renderPdfLink(displayText, cellX, y + 3.5, cellUrl)
                                                doc.setTextColor(tableDataTextRgb[0], tableDataTextRgb[1], tableDataTextRgb[2])
                                            } else {
                                                doc.text(displayText, cellX, y + 3.5)
                                            }
                                        })
                                        y += 5
                                    }

                                    // Show "... and X more" if truncated
                                    if (relData.records.length > relatedMaxRows) {
                                        doc.setTextColor(136, 136, 136)
                                        doc.setFontSize(tableDataFontSize - 2)
                                        safeSetFont(activeFontFamily, 'italic')
                                        doc.text(`... and ${relData.records.length - relatedMaxRows} more related record${relData.records.length - relatedMaxRows !== 1 ? 's' : ''}`, margin + 8, y + 3)
                                        y += 5
                                    }
                                    y += 2
                                }
                            }

                            // Render layer rich text AFTER data if configured
                            if (hasLayerRichText && layerRichTextPosition === 'after') {
                                renderLayerRichTextToPdf()
                            }
                        }
                    } // End of shouldRenderTable condition
                }

                // =====================================================
                // PDF NEARBY FEATURES RENDERING
                // Render nearby results for this section
                // =====================================================
                if (sr.nearbyResults && sr.nearbyResults.length > 0) {
                    // Define font sizes for nearby rendering (same as table data)
                    const nearbyDataFontSize = Math.max(pdfStyle.tableDataFontSize || 8, minFontSize)

                    for (const nearbyResult of sr.nearbyResults) {
                        const { layerConfig: nearbyLayerConfig, nearbyConfig } = nearbyResult
                        const layerTitle = nearbyLayerConfig.layerTitle || 'Nearby'

                        // Skip if not included in PDF
                        if (nearbyConfig.includeInPdf === false) continue

                        // Check page space
                        if (y > usableHeight - 30) {
                            doc.addPage()
                            y = margin
                        }

                        // Nearby layer title
                        doc.setFontSize(11)
                        doc.setFont(activeFontFamily, 'bold')
                        doc.setTextColor(80, 80, 80)
                        y += 4
                        doc.text(layerTitle, margin + 3, y + 3)

                        // Measure title width while font is still 11pt bold (before switching to italic)
                        const titleWidth = doc.getTextWidth(layerTitle)

                        // "Nearby" subtitle
                        doc.setFontSize(9)
                        safeSetFont(activeFontFamily, 'italic')
                        doc.setTextColor(120, 120, 120)
                        doc.text('Nearby', margin + 3 + titleWidth + 4, y + 3)
                        y += 8

                        if (nearbyResult.error) {
                            doc.setFontSize(9)
                            safeSetFont(activeFontFamily, 'italic')
                            doc.setTextColor(150, 80, 80)
                            doc.text(`Error: ${nearbyResult.error}`, margin + 6, y + 3)
                            y += 6
                            continue
                        }

                        if (nearbyResult.features.length === 0) {
                            doc.setFontSize(9)
                            safeSetFont(activeFontFamily, 'italic')
                            doc.setTextColor(120, 120, 120)
                            doc.text(`No nearby ${layerTitle?.toLowerCase() || 'features'} found`, margin + 6, y + 3)
                            y += 6
                            continue
                        }

                        // Limit features for PDF
                        const pdfMaxFeatures = nearbyConfig.pdfMaxFeatures || nearbyConfig.maxFeatures || 5
                        const featuresToRender = nearbyResult.features.slice(0, pdfMaxFeatures)

                        // Reset font for list items
                        doc.setFontSize(nearbyDataFontSize)
                        doc.setFont(activeFontFamily, 'normal')

                        // Render each nearby feature
                        for (const feature of featuresToRender) {
                            // Calculate extra height needed for full URL display
                            let urlExtraHeight = 0
                            let urlLines: string[] = []
                            const nearbyUrlFontSize = Math.max(6, minFontSize - 3)
                            const nearbyUrlLineHeight = nearbyUrlFontSize * 0.4
                            const nearbyContentWidth = contentWidth - 10 // Account for margin offset

                            if (feature.linkUrl && pdfStyle.showFullUrlsInPdf && feature.title !== feature.linkUrl) {
                                doc.setFontSize(nearbyUrlFontSize)
                                urlLines = doc.splitTextToSize(`(${feature.linkUrl})`, nearbyContentWidth)
                                urlExtraHeight = Math.min(urlLines.length, 6) * nearbyUrlLineHeight + 2.5 // 1.5 spacing + 1 after
                                doc.setFontSize(nearbyDataFontSize)
                            }

                            // Calculate total height needed for this item
                            const baseHeight = 5 + (feature.subtitle ? 4 : 0) + 2 + urlExtraHeight
                            if (y > usableHeight - baseHeight - 5) {
                                doc.addPage()
                                y = margin
                            }

                            // Draw left border accent (adjust height to include URL)
                            const accentHeight = (feature.subtitle ? 9 : 5) + urlExtraHeight
                            doc.setDrawColor(200, 200, 200)
                            doc.setLineWidth(0.8)
                            doc.line(margin + 3, y, margin + 3, y + accentHeight)

                            // Feature title
                            const linkColorRgb = hexToRgb(pdfStyle.linkColor || '#0066CC')
                            doc.setFont(activeFontFamily, 'normal')
                            doc.setFontSize(nearbyDataFontSize)

                            if (feature.linkUrl) {
                                // Render as clickable link
                                doc.setTextColor(linkColorRgb[0], linkColorRgb[1], linkColorRgb[2])
                                renderPdfLink(feature.title, margin + 6, y + 3.5, feature.linkUrl)
                            } else {
                                doc.setTextColor(50, 50, 50)
                                doc.text(feature.title, margin + 6, y + 3.5)
                            }

                            // Distance badge on right
                            const distance = feature.distanceFormatted || ''
                            const distanceWidth = doc.getTextWidth(distance)
                            const badgeX = contentWidth + margin - distanceWidth - 4
                            doc.setFillColor(240, 240, 240)
                            doc.roundedRect(badgeX - 2, y, distanceWidth + 4, 5, 1, 1, 'F')
                            doc.setTextColor(80, 80, 80)
                            doc.setFontSize(8)
                            doc.text(distance, badgeX, y + 3.5)
                            doc.setFontSize(nearbyDataFontSize)

                            y += 5

                            // =====================================================
                            // WCAG 2.4.4: Show full URL for print accessibility
                            // When printing, users lose the ability to click links
                            // so showing the full URL helps them access the resource
                            // Controlled by pdfStyle.showFullUrlsInPdf setting
                            // =====================================================
                            if (feature.linkUrl && pdfStyle.showFullUrlsInPdf && feature.title !== feature.linkUrl && urlLines.length > 0) {
                                y += 1.5 // Spacing between title and URL
                                doc.setFontSize(nearbyUrlFontSize)
                                doc.setTextColor(100, 100, 100)
                                urlLines.slice(0, 6).forEach((urlLine: string) => {
                                    doc.text(urlLine, margin + 6, y)
                                    y += nearbyUrlLineHeight
                                })
                                doc.setFontSize(nearbyDataFontSize)
                                y += 1
                            }

                            // Subtitle if present
                            if (feature.subtitle) {
                                doc.setTextColor(120, 120, 120)
                                doc.setFontSize(nearbyDataFontSize - 1)
                                doc.text(feature.subtitle, margin + 6, y + 2.5)
                                doc.setFontSize(nearbyDataFontSize)
                                y += 4
                            }

                            y += 2 // Spacing between items
                        }

                        // Show "... and X more" if truncated
                        if (nearbyResult.features.length > pdfMaxFeatures) {
                            doc.setTextColor(136, 136, 136)
                            doc.setFontSize(nearbyDataFontSize - 2)
                            safeSetFont(activeFontFamily, 'italic')
                            const moreCount = nearbyResult.features.length - pdfMaxFeatures
                            doc.text(`... and ${moreCount} more nearby ${layerTitle?.toLowerCase() || 'feature'}${moreCount !== 1 ? 's' : ''}`, margin + 6, y + 3)
                            y += 5
                        }

                        y += 4 // Extra spacing after nearby list
                    }
                }

                // Render rich text AFTER data if configured
                if (hasRichText && richTextPosition === 'after') {
                    renderRichTextToPdf()
                }

                y += 3
            }

            // Footer
            if (footerEnabled) {
                const pageCount = doc.internal.pages.length - 1
                const footerTextColor = pdfFooter.footerTextColor || '#4A4A4A'
                const footerBgColor = pdfFooter.footerColor || '#FFFFFF'
                const footerTextRgb = hexToRgb(footerTextColor)
                const footerBgRgb = hexToRgb(footerBgColor)

                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i)
                    const footerY = ph - footerHeight

                    if (footerBgColor.toLowerCase() !== '#ffffff' && footerBgColor.toLowerCase() !== '#fff') {
                        doc.setFillColor(footerBgRgb[0], footerBgRgb[1], footerBgRgb[2])
                        doc.rect(0, footerY, pw, footerHeight, 'F')
                    }

                    if (pdfFooter.showTopBorder !== false) {
                        doc.setDrawColor(borderRgb[0], borderRgb[1], borderRgb[2])
                        doc.setLineWidth(0.3)
                        doc.line(margin, footerY, pw - margin, footerY)
                    }

                    doc.setTextColor(footerTextRgb[0], footerTextRgb[1], footerTextRgb[2])

                    // Calculate vertical positions based on what's enabled
                    let disclaimerY = footerY + 3
                    let contactY = footerY + 3

                    // If both disclaimer and contact exist, stack them
                    if (pdfFooter.disclaimerText && pdfFooter.contactText) {
                        const disclaimerSize = pdfFooter.disclaimerFontSize || 6
                        disclaimerY = footerY + 3
                        contactY = footerY + 3 + (disclaimerSize * 0.8) + 2
                    }

                    if (pdfFooter.disclaimerText) {
                        const disclaimerSize = pdfFooter.disclaimerFontSize || 6
                        doc.setFontSize(disclaimerSize)
                        doc.setFont(activeFontFamily, 'normal')

                        // Use full content width - page numbers are on a separate line below
                        const maxWidth = contentWidth
                        const disclaimerTextTransliterated = transliterate(pdfFooter.disclaimerText)
                        const lines = doc.splitTextToSize(disclaimerTextTransliterated, maxWidth)
                        lines.slice(0, 3).forEach((line: string, idx: number) => {
                            doc.text(line, margin, disclaimerY + (idx * (disclaimerSize * 0.4)))
                        })
                    }

                    if (pdfFooter.contactText) {
                        const contactSize = 7
                        doc.setFontSize(contactSize)
                        doc.setFont(activeFontFamily, 'normal')

                        const contactPosition = pdfFooter.contactPosition || 'left'
                        const contactTextTransliterated = transliterate(pdfFooter.contactText)
                        const contactWidth = doc.getTextWidth(contactTextTransliterated)

                        let contactX = margin
                        if (contactPosition === 'center') {
                            contactX = (pw - contactWidth) / 2
                        } else if (contactPosition === 'right') {
                            contactX = pw - margin - contactWidth - 40 // Leave room for page numbers
                        }

                        // If no disclaimer, use the first line position
                        const finalContactY = pdfFooter.disclaimerText ? contactY : footerY + 3
                        doc.text(contactTextTransliterated, contactX, finalContactY)
                    }

                    if (pdfFooter.showPageNumbers !== false) {
                        doc.setFontSize(8)
                        doc.setFont(activeFontFamily, 'normal')

                        const pageFormat = pdfFooter.pageNumberFormat || 'detailed'
                        const pageText = pageFormat === 'simple'
                            ? `${i}/${pageCount}`
                            : `Page ${i}/${pageCount}`

                        const pnWidth = doc.getTextWidth(pageText)
                        const pageY = ph - 5

                        doc.text(pageText, pw - margin - pnWidth, pageY)
                    }

                    // WCAG 3.3.5: Accessibility contact info
                    if (pdfStyle.accessibilityContact) {
                        doc.setFontSize(6)
                        safeSetFont(activeFontFamily, 'italic')
                        doc.setTextColor(100, 100, 100)
                        const a11yContactWidth = doc.getTextWidth(pdfStyle.accessibilityContact)
                        doc.text(pdfStyle.accessibilityContact, (pw - a11yContactWidth) / 2, ph - 2)
                    }
                }
            }

            // ========================================
            // WCAG 2.4.5: Add PDF Outline/Bookmarks
            // Helps users navigate the document structure
            // Supports hierarchical bookmarks for better navigation
            // ========================================
            if (pdfStyle.enablePdfBookmarks !== false && bookmarks.length > 0) {
                try {
                    const outline = (doc as any).outline

                    if (outline && typeof outline.add === 'function') {
                        // Store y positions in order for the render patch
                        const yPositionsInOrder: number[] = []
                        const outlineItems: Map<string, any> = new Map()

                        // Page height in points (letter size)
                        const pageHeightPt = 792

                        const sortedBookmarks = pdfStyle.enableHierarchicalBookmarks !== false
                            ? [...bookmarks].sort((a, b) => a.level - b.level)
                            : bookmarks

                        sortedBookmarks.forEach((bm) => {
                            let parentItem = null
                            if (bm.parentId && outlineItems.has(bm.parentId)) {
                                parentItem = outlineItems.get(bm.parentId)
                            }

                            try {
                                // Convert y from mm (from top) to points 
                                const yInPoints = pageHeightPt - (bm.y * 72 / 25.4)
                                yPositionsInOrder.push(yInPoints)

                                const item = outline.add(
                                    pdfStyle.enableHierarchicalBookmarks !== false ? parentItem : null,
                                    bm.title,
                                    { pageNumber: bm.page }
                                )

                                if (item) {
                                    outlineItems.set(bm.id, item)
                                }
                            } catch (itemError) {
                                // Fallback to flat structure if hierarchy fails
                                outline.add(null, bm.title, { pageNumber: bm.page })
                            }
                        })

                        // Patch the render function to fix y positions in output
                        // jsPDF outline plugin hardcodes y=792 (top of page) for all bookmarks
                        // We replace these with the actual y positions we calculated
                        const originalRender = outline.render.bind(outline)
                        outline.render = function() {
                            let output = originalRender()

                            // Replace each /XYZ 0 792 0 or /XYZ 0 792. 0 with correct y position
                            // Bookmarks are rendered in order, so we replace sequentially
                            let index = 0
                            output = output.replace(/\/XYZ 0 792\.? 0/g, () => {
                                if (index < yPositionsInOrder.length) {
                                    const y = yPositionsInOrder[index]
                                    index++
                                    return `/XYZ 0 ${y.toFixed(2)} 0`
                                }
                                return '/XYZ 0 792 0'
                            })

                            return output
                        }
                    }
                } catch (outlineError) {
                    console.warn('Could not add PDF bookmarks:', outlineError)
                }
            }

            // Generate filename and save PDF
            const filename = `${addressTitle.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
            doc.save(filename)

            setStatusMessage('PDF generated successfully.')

        } catch (e) {
            console.error('PDF generation failed:', e)
            setError('Failed to generate PDF. Please try again.')
            setStatusMessage('PDF generation failed.')
        } finally {
            setGeneratingPdf(false)
        }
    }

    const totalFeatures = results.reduce((s, r) => s + r.totalFeatures, 0)
    const sectionsWithData = results.filter(r => r.totalFeatures > 0).length
    const totalLayers = results.reduce((s, r) => s + r.layerResults.length, 0)
    const showLabels = config.showSourceLabels !== false

    // Compute flattened suggestion index for rendering
    let flatIndex = -1

    return (
        <div css={getStyles(themeColors)} className="jimu-widget">
            {/* ACCESSIBILITY: Skip Link */}
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>

            {/* ACCESSIBILITY: Live Region for Status Announcements */}
            <div
                id={statusId}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            >
                {statusMessage}
            </div>

            {config.mapWidgetId && <JimuMapViewComponent useMapWidgetId={config.mapWidgetId} onActiveViewChange={handleMapReady} />}

            {/* Search Header - hidden when separate pane is open */}
            {!separatePaneData && (
                <div className="search-header" role="search" aria-label="Location search">
                    <div className="search-row">
                        <div className="search-input-container">
                            <label htmlFor="search-input" className="sr-only">
                                Search for a property or location
                            </label>
                            <input
                                ref={searchInputRef}
                                id="search-input"
                                className="search-input"
                                placeholder="Search address or location..."
                                title="Enter an address, parcel number, or location to search"
                                value={searchText}
                                onChange={e => onInputChange(e.target.value)}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                onKeyDown={handleKeyDown}
                                role="combobox"
                                aria-expanded={showSuggestions && (suggestions.length > 0 || searching)}
                                aria-haspopup="listbox"
                                aria-controls={suggestionsId}
                                aria-autocomplete="list"
                                aria-activedescendant={highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
                                aria-describedby={error ? `${statusId} search-error-message` : statusId}
                                aria-invalid={error ? 'true' : undefined}
                            />
                            {searchText && (
                                <button
                                    type="button"
                                    className="search-clear-btn"
                                    onClick={() => {
                                        setSearchText('')
                                        setSuggestions([])
                                        setShowSuggestions(false)
                                        setHighlightedIndex(-1)
                                        searchInputRef.current?.focus()
                                    }}
                                    title="Clear search"
                                    aria-label="Clear search text"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                        <path d="M12.7 4.7l-1.4-1.4L8 6.6 4.7 3.3 3.3 4.7 6.6 8l-3.3 3.3 1.4 1.4L8 9.4l3.3 3.3 1.4-1.4L9.4 8l3.3-3.3z" />
                                    </svg>
                                </button>
                            )}
                            {showSuggestions && (suggestions.length > 0 || searching) && (
                                <div
                                    ref={suggestionsRef}
                                    id={suggestionsId}
                                    className="suggestions-dropdown"
                                    role="listbox"
                                    aria-label="Search suggestions"
                                >
                                    {searching && (
                                        <div className="suggestion-item" role="option" aria-disabled="true" style={{ color: theme.textMuted }}>
                                            Searching...
                                        </div>
                                    )}
                                    {!searching && showLabels && grouped.map((g, groupIndex) => (
                                        <div key={groupIndex} role="group" aria-label={g.sourceName}>
                                            <div className="suggestion-group" role="presentation">{g.sourceName}</div>
                                            {g.suggestions.map((s, suggestionIndex) => {
                                                flatIndex++
                                                const currentFlatIndex = flatIndex
                                                return (
                                                    <div
                                                        key={suggestionIndex}
                                                        id={`suggestion-${currentFlatIndex}`}
                                                        className={`suggestion-item ${highlightedIndex === currentFlatIndex ? 'highlighted' : ''}`}
                                                        role="option"
                                                        aria-selected={highlightedIndex === currentFlatIndex}
                                                        onMouseDown={() => selectSuggestion(s)}
                                                        onMouseEnter={() => setHighlightedIndex(currentFlatIndex)}
                                                    >
                                                        <div className="suggestion-text">{s.text}</div>
                                                        {s.subtext && <div className="suggestion-subtext">{s.subtext}</div>}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ))}
                                    {!searching && !showLabels && suggestions.map((s, i) => (
                                        <div
                                            key={i}
                                            id={`suggestion-${i}`}
                                            className={`suggestion-item ${highlightedIndex === i ? 'highlighted' : ''}`}
                                            role="option"
                                            aria-selected={highlightedIndex === i}
                                            onMouseDown={() => selectSuggestion(s)}
                                            onMouseEnter={() => setHighlightedIndex(i)}
                                        >
                                            <div className="suggestion-text">{s.text}</div>
                                            {s.subtext && <div className="suggestion-subtext">{s.subtext}</div>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            className={`select-location-btn ${selectByLocationActive ? 'active' : ''}`}
                            onClick={() => setSelectByLocationActive(!selectByLocationActive)}
                            title={selectByLocationActive ? 'Cancel map selection' : 'Select location from map'}
                            aria-label={selectByLocationActive ? 'Cancel map location selection' : 'Select location from map'}
                            aria-pressed={selectByLocationActive}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="10" r="3" />
                                <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 11.5 7.3 11.8a1 1 0 0 0 1.4 0C13 21.5 20 15.4 20 10a8 8 0 0 0-8-8z" />
                                <line x1="12" y1="22" x2="12" y2="22" />
                            </svg>
                        </button>
                        {config.enableUseCurrentLocation !== false && (
                            <button
                                type="button"
                                className={`select-location-btn current-location-btn ${gettingLocation ? 'active' : ''}`}
                                onClick={useCurrentLocation}
                                disabled={gettingLocation || loading}
                                title={gettingLocation ? 'Getting your location...' : 'Use your current location'}
                                aria-label={gettingLocation ? 'Getting your location, please wait' : 'Use your current GPS location to search'}
                                aria-busy={gettingLocation}
                            >
                                {gettingLocation ? (
                                    <Loading type={LoadingType.Donut} width={18} height={18} />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
                                        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
                                    </svg>
                                )}
                            </button>
                        )}
                        <button
                            type="button"
                            className="search-btn"
                            onClick={() => runQuery()}
                            disabled={loading}
                            title={loading ? 'Searching for location...' : 'Search for location'}
                            aria-label={loading ? 'Searching, please wait' : 'Search for property at this location'}
                            aria-busy={loading}
                            aria-disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </div>
            )}

            {/* ACCESSIBILITY: Main Content with ID for Skip Link - hidden when separate pane is open */}
            {!separatePaneData && (
                <div
                    ref={mainContentRef}
                    id="main-content"
                    className={`results-container${generatingPdf ? ' generating-pdf' : ''}`}
                    tabIndex={-1}
                    role="main"
                    aria-label="Search results"
                >
                    {/* ACCESSIBILITY: Error Banner with Alert Role */}
                    {error && (
                        <div id="search-error-message" className="error-banner" role="alert" aria-live="assertive">
                            <span>{error}</span>
                            <button
                                type="button"
                                className="error-close"
                                onClick={() => setError(null)}
                                title="Dismiss error"
                                aria-label="Dismiss error message"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* ACCESSIBILITY: Loading State */}
                    {loading && (
                        <div className="loading-state" role="status" aria-live="polite" aria-busy="true">
                            <Loading type={LoadingType.Donut} />
                            <div style={{ marginTop: 12 }}>Querying layers...</div>
                        </div>
                    )}

                    {/* PDF Generating Overlay */}
                    {generatingPdf && (
                        <div className="pdf-generating-overlay" role="status" aria-live="polite" aria-busy="true">
                            <div className="pdf-generating-content">
                                <Loading type={LoadingType.Donut} width={32} height={32} />
                                <div style={{ marginTop: 12, fontWeight: 500 }}>Generating PDF...</div>
                                <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>This may take a moment</div>
                            </div>
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <>
                            {/* ACCESSIBILITY: Announce search results to screen readers */}
                            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                                Found {results.reduce((sum, sr) => sum + sr.totalFeatures, 0)} features across {results.length} sections for {displayedSearchText || 'selected location'}
                            </div>

                            {/* Address Header */}
                            <header className="address-header">
                                <div className="address-info">
                                    <h1 className="address-title">{displayedSearchText.toUpperCase() || 'PROPERTY REPORT'}</h1>
                                    {headerInfoData && config.headerInfo?.displayFields && (
                                        <div className="header-info-fields" role="list" aria-label="Property information">
                                            {normalizeFields(toMutable<any>(config.headerInfo.displayFields)).map((field: any, i: number) => {
                                                const value = headerInfoData[field.name]
                                                const isNullOrEmpty = value == null || value === ''
                                                // If hideNull is enabled and value is null, skip this field
                                                if (isNullOrEmpty && field.hideNull) return null
                                                const fieldLabel = (field.alias || field.name).replace(/:+$/, '') // Strip trailing colons
                                                const displayValue = isNullOrEmpty ? '—' : value
                                                return (
                                                    <span
                                                        key={i}
                                                        className="header-info-item"
                                                        role="listitem"
                                                        title={`${fieldLabel}: ${displayValue}`}
                                                    >
                                                        <span className="header-info-label">{fieldLabel}:</span>
                                                        <span className="header-info-value">{displayValue}</span>
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    )}
                                    {queryPoint && config.showCoordinates !== false && (
                                        <p className="address-subtitle">
                                            {formatCoords(queryPoint)}
                                        </p>
                                    )}
                                </div>
                                <div className="address-actions">
                                    <button
                                        type="button"
                                        className="action-icon"
                                        onClick={clearResults}
                                        title="Clear results and start new search"
                                        aria-label="Clear results and start new search"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        className="action-icon"
                                        onClick={generatePDF}
                                        disabled={generatingPdf}
                                        title={generatingPdf ? 'Generating PDF...' : 'Export to PDF'}
                                        aria-label={generatingPdf ? 'Generating PDF, please wait' : 'Export results to PDF'}
                                        aria-busy={generatingPdf}
                                    >
                                        {generatingPdf ? (
                                            <Loading type={LoadingType.Donut} width={18} height={18} />
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                                                <rect x="6" y="14" width="12" height="8" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </header>

                            {/* Property Preview */}
                            {config.propertyPreview?.enabled && (
                                <PropertyPreview
                                    config={toPlainObject<PropertyPreviewConfig>(config.propertyPreview)!}
                                    headerData={headerInfoData}
                                    headerFields={config.headerInfo?.displayFields ? normalizeFields(toMutable<any>(config.headerInfo.displayFields)) : undefined}
                                    address={displayedSearchText}
                                    onZoom={() => {
                                        if (queryPoint && mapView) {
                                            mapView.view.goTo({ target: queryPoint, zoom: 18 })
                                        }
                                    }}
                                    mapView={mapView?.view}
                                    queryPoint={queryPoint}
                                />
                            )}

                            {/* Sections */}
                            {results.map(sr => {
                                const isOpen = openSections.has(sr.sectionConfig.sectionId)
                                const sectionBodyId = `section-body-${sr.sectionConfig.sectionId}`
                                const hasRichTextConfig = sr.sectionConfig.richTextContent || (sr.sectionConfig.richTextButtons && sr.sectionConfig.richTextButtons.length > 0)
                                const richTextPosition = sr.sectionConfig.richTextPosition || 'after'

                                // Get custom no-results text from layers (if any layer has custom text configured)
                                const getNoResultsMessage = (): string | null => {
                                    const layers = sr.sectionConfig.layers || []
                                    const customMessages: string[] = []

                                    for (const layer of layers) {
                                        const layerConfig = layer as LayerConfig
                                        if (layerConfig.useCustomNoResultsText) {
                                            if (layerConfig.customNoResultsText) {
                                                customMessages.push(layerConfig.customNoResultsText)
                                            }
                                        }
                                    }

                                    if (customMessages.length > 0) {
                                        return customMessages.join(' ')
                                    }

                                    const allLayersUseCustom = layers.length > 0 && layers.every((l: any) => l.useCustomNoResultsText)
                                    if (allLayersUseCustom) {
                                        return null
                                    }

                                    return 'No intersecting features found.'
                                }

                                const noResultsMessage = getNoResultsMessage()

                                // Check if any layer has custom no-results text configured - if so, we need to render layers individually
                                const hasAnyCustomNoResultsText = (sr.sectionConfig.layers || []).some(
                                    (layer: any) => layer.useCustomNoResultsText && layer.customNoResultsText
                                )

                                // Collect field data from section's layer results (first feature from each layer)
                                const sectionFieldData: Record<string, any> = {}
                                sr.layerResults.forEach(lr => {
                                    if (lr.features.length > 0) {
                                        // Merge first feature's attributes (later layers don't override earlier)
                                        Object.entries(lr.features[0]).forEach(([key, value]) => {
                                            if (!(key in sectionFieldData)) {
                                                sectionFieldData[key] = value
                                            }
                                        })
                                    }
                                })

                                // Helper to replace {field} placeholders with actual values
                                // Checks section layer data first, then falls back to header info
                                const replacePlaceholders = (text: string): string => {
                                    if (!text) return ''
                                    return text.replace(/\{([^}]+)\}/g, (match, fieldName) => {
                                        // First check section layer data
                                        if (fieldName in sectionFieldData && sectionFieldData[fieldName] != null) {
                                            return String(sectionFieldData[fieldName])
                                        }
                                        // Then check header info data
                                        if (headerInfoData && fieldName in headerInfoData && headerInfoData[fieldName] != null) {
                                            return String(headerInfoData[fieldName])
                                        }
                                        return match // Keep placeholder if not found
                                    })
                                }

                                // Check if text has any unresolved placeholders (still contains {FIELD_NAME} patterns)
                                const hasUnresolvedPlaceholders = (text: string): boolean => {
                                    if (!text) return false
                                    const replaced = replacePlaceholders(text)
                                    // Check if any {FIELD_NAME} patterns remain after replacement
                                    return /\{[^}]+\}/.test(replaced)
                                }

                                // Determine if rich text should actually be shown
                                // Don't show if it has unresolved placeholders (no data to populate them)
                                // Also hide if hideRichTextWhenNoResults is enabled and no features were found
                                const richTextHasUnresolved = sr.sectionConfig.richTextContent
                                    ? hasUnresolvedPlaceholders(sr.sectionConfig.richTextContent)
                                    : false
                                const shouldHideRichTextDueToNoResults = sr.sectionConfig.hideRichTextWhenNoResults && sr.totalFeatures === 0
                                const hasRichText = hasRichTextConfig && !richTextHasUnresolved && !shouldHideRichTextDueToNoResults

                                // Render rich text button
                                const renderRichTextButton = (button: RichTextButton) => {
                                    const url = replacePlaceholders(button.url)
                                    const styleClass = button.style === 'primary'
                                        ? 'rich-text-btn-primary'
                                        : button.style === 'outline'
                                            ? 'rich-text-btn-outline'
                                            : 'rich-text-btn-default'
                                    const opensNewTab = button.openInNewTab !== false

                                    return (
                                        <a
                                            key={button.buttonId}
                                            href={url}
                                            target={opensNewTab ? '_blank' : '_self'}
                                            rel={opensNewTab ? 'noopener noreferrer' : undefined}
                                            className={`rich-text-btn ${styleClass}`}
                                            title={opensNewTab ? `${button.label} (opens in new tab)` : button.label}
                                            aria-label={opensNewTab ? `${button.label} (opens in new tab)` : button.label}
                                        >
                                            {button.label}
                                            {opensNewTab && (
                                                <svg
                                                    width="10"
                                                    height="10"
                                                    viewBox="0 0 16 16"
                                                    fill="currentColor"
                                                    style={{ marginLeft: '4px', verticalAlign: 'middle' }}
                                                    aria-hidden="true"
                                                >
                                                    <path d="M14 3.5v9a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h9a.5.5 0 01.5.5zM4 1.5A1.5 1.5 0 002.5 3v10A1.5 1.5 0 004 14.5h10a1.5 1.5 0 001.5-1.5V3A1.5 1.5 0 0014 1.5H4z" />
                                                    <path d="M9.854 6.146a.5.5 0 010 .708L7.707 9H11.5a.5.5 0 010 1H6.5a.5.5 0 01-.5-.5v-5a.5.5 0 011 0v3.793l2.146-2.147a.5.5 0 01.708 0z" />
                                                </svg>
                                            )}
                                        </a>
                                    )
                                }

                                // Rich text content component
                                const RichTextContent = () => (
                                    <>
                                        {sr.sectionConfig.richTextContent && (
                                            <div
                                                className="rich-text-content"
                                                dangerouslySetInnerHTML={{
                                                    __html: replacePlaceholders(sr.sectionConfig.richTextContent)
                                                }}
                                            />
                                        )}
                                        {sr.sectionConfig.richTextButtons && sr.sectionConfig.richTextButtons.length > 0 && (
                                            <div className="rich-text-buttons">
                                                {(toMutable<any>(sr.sectionConfig.richTextButtons) as RichTextButton[]).map(renderRichTextButton)}
                                            </div>
                                        )}
                                    </>
                                )

                                // Data content component
                                const DataContent = () => {
                                    // Chart description component
                                    const ChartDescription = () => {
                                        const chartConfig = sr.sectionConfig.chartConfig
                                        if (!chartConfig?.chartDescription) return null

                                        return (
                                            <div
                                                className="chart-description"
                                                dangerouslySetInnerHTML={{
                                                    __html: replacePlaceholders(chartConfig.chartDescription)
                                                }}
                                            />
                                        )
                                    }

                                    const chartDescPosition = sr.sectionConfig.chartConfig?.chartDescriptionPosition || 'after'

                                    return (
                                        <>
                                            {sr.totalFeatures === 0 && (!sr.nearbyResults || sr.nearbyResults.length === 0) && (!sr.chartData || sr.chartData.length === 0) && !hasRichText && !hasAnyCustomNoResultsText ? (
                                                noResultsMessage ? <div className="no-results">{noResultsMessage}</div> : null
                                            ) : (
                                                <>
                                                    {sr.sectionConfig.displayAsChart && sr.chartData && sr.chartData.length > 0 && (
                                                        <div className="charts-container">
                                                            {chartDescPosition === 'before' && <ChartDescription />}
                                                            <div
                                                                className="chart-box"
                                                                ref={(el) => {
                                                                    chartRefsMap.current.set(sr.sectionConfig.sectionId, el)
                                                                    // Mark this chart as having animated after first render
                                                                    if (el && !animatedChartsRef.current.has(sr.sectionConfig.sectionId)) {
                                                                        // Use setTimeout to mark after animation completes
                                                                        setTimeout(() => {
                                                                            animatedChartsRef.current.add(sr.sectionConfig.sectionId)
                                                                        }, 100)
                                                                    }
                                                                }}
                                                                data-section-id={sr.sectionConfig.sectionId}
                                                            >
                                                                <EnhancedChart
                                                                    data={sr.chartData}
                                                                    chartConfig={mergeChartConfig(
                                                                        config.defaultChartConfig,
                                                                        sr.sectionConfig.chartConfig,
                                                                        sr.sectionConfig.chartConfig?.chartType || config.defaultChartConfig?.chartType || 'bar'
                                                                    )}
                                                                    skipAnimation={animatedChartsRef.current.has(sr.sectionConfig.sectionId)}
                                                                />
                                                            </div>
                                                            {chartDescPosition === 'after' && <ChartDescription />}
                                                            {/* Related Tables for Chart View */}
                                                            {sr.layerResults.map((lr, lrIdx) => (
                                                                lr.relatedData && lr.relatedData.length > 0 && (
                                                                    <div key={lrIdx} className="related-tables-container" style={{ padding: '12px' }}>
                                                                        {lr.relatedData.map((relData, idx) => (
                                                                            <RelatedTableDisplay
                                                                                key={relData.tableConfig.tableId || idx}
                                                                                relatedTable={relData.tableConfig}
                                                                                records={relData.records}
                                                                                chartConfig={relData.tableConfig.chartConfig}
                                                                                domainLookup={relData.domainLookup}
                                                                                onViewSeparatePane={(tableConfig, records, domLookup) => {
                                                                                    setSeparatePaneData({
                                                                                        type: 'relatedTable',
                                                                                        tableConfig,
                                                                                        records,
                                                                                        domainLookup: domLookup,
                                                                                        parentTitle: displayedSearchText || 'Property',
                                                                                        paneTitle: tableConfig.separatePaneTitle || tableConfig.tableName
                                                                                    })
                                                                                }}
                                                                                parentTitle={displayedSearchText}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )
                                                            ))}
                                                        </div>
                                                    )}
                                                    {sr.sectionConfig.displayAsTable && sr.layerResults.map((lr, i) => {
                                                        // Handle layers with no features - show custom message if configured
                                                        if (lr.features.length === 0) {
                                                            // If custom no-results text is enabled for this layer
                                                            if (lr.layerConfig.useCustomNoResultsText) {
                                                                // If there's custom text, display it with proper layer header
                                                                if (lr.layerConfig.customNoResultsText) {
                                                                    return (
                                                                        <LayerNoResultsSection
                                                                            key={i}
                                                                            layerConfig={lr.layerConfig}
                                                                            defaultOpen={lr.layerConfig.expanded !== false}
                                                                        />
                                                                    )
                                                                }
                                                                // If useCustomNoResultsText is true but no text, hide this layer entirely
                                                                return null
                                                            }
                                                            // If not using custom text, skip the layer (default behavior)
                                                            return null
                                                        }
                                                        // Filter visible fields and apply hideNull logic
                                                        const visibleFields = normalizeFields(toMutable<any>(lr.layerConfig.fields)).filter(f => f.visible)
                                                        // Filter out fields where hideNull is true and ALL values are null/empty
                                                        const fields = visibleFields.filter((field: any) => {
                                                            if (!field.hideNull) return true // Keep field if hideNull is not enabled
                                                            // Check if ALL values for this field are null/empty
                                                            const allNull = lr.features.every((feature: any) => {
                                                                const value = feature[field.name]
                                                                return value == null || value === ''
                                                            })
                                                            return !allNull // Keep field if NOT all values are null
                                                        })
                                                        return (
                                                            <LayerDataSection
                                                                key={i}
                                                                layerResult={lr}
                                                                fields={fields}
                                                                defaultOpen={lr.layerConfig.expanded !== false}
                                                                tableConfig={mergeTableConfig(
                                                                    config.defaultTableConfig,
                                                                    sr.sectionConfig.tableConfig
                                                                )}
                                                                onViewSeparatePane={(tableConfig, records, parentTitle, domLookup) => {
                                                                    setSeparatePaneData({
                                                                        type: 'relatedTable',
                                                                        tableConfig,
                                                                        records,
                                                                        domainLookup: domLookup,
                                                                        parentTitle,
                                                                        paneTitle: tableConfig.separatePaneTitle || tableConfig.tableName
                                                                    })
                                                                }}
                                                                parentTitle={displayedSearchText || 'Property'}
                                                                onRowHighlight={highlightRowGeometry}
                                                                onRowZoom={zoomToGeometry}
                                                            />
                                                        )
                                                    })}

                                                    {/* Nearby Features Display */}
                                                    {sr.nearbyResults && sr.nearbyResults.length > 0 && sr.nearbyResults.map((nearbyResult, nrIdx) => (
                                                        <NearbyDisplay
                                                            key={nearbyResult.layerConfig.layerId || nrIdx}
                                                            nearbyResult={nearbyResult}
                                                            sourceGeometry={queryPoint || undefined}
                                                            onHighlight={highlightRowGeometry}
                                                            onZoom={(geom, scale) => zoomToGeometry(geom, scale || 2500)}
                                                            onZoomToBoth={zoomToBothGeometries}
                                                        />
                                                    ))}
                                                </>
                                            )}
                                        </>
                                    )
                                }

                                // Check if section should use separate pane
                                const useSeparatePane = sr.sectionConfig.displayPane === 'separate'
                                const threshold = sr.sectionConfig.separatePaneThreshold || 0

                                // Calculate total nearby features for this section
                                const nearbyFeatureCount = sr.nearbyResults
                                    ? sr.nearbyResults.reduce((sum, nr) => sum + (nr.features?.length || 0), 0)
                                    : 0
                                const combinedFeatureCount = sr.totalFeatures + nearbyFeatureCount

                                // Check if we have multiple nearby results that should each get their own View Details
                                const hasMultipleNearbyLayers = sr.nearbyResults && sr.nearbyResults.filter(nr => nr.features?.length > 0).length > 0
                                const hasOnlyNearbyContent = sr.totalFeatures === 0 && nearbyFeatureCount > 0

                                const shouldUseSeparatePane = useSeparatePane && (threshold === 0 || combinedFeatureCount >= threshold)

                                // If using separate pane with nearby layers, show each nearby layer with its own View Details
                                if (shouldUseSeparatePane && hasMultipleNearbyLayers && hasOnlyNearbyContent) {
                                    return (
                                        <section className="pm-section" key={sr.sectionConfig.sectionId} aria-labelledby={`section-title-${sr.sectionConfig.sectionId}`}>
                                            <div
                                                className="pm-section-header"
                                                onClick={handleProtectedClick(() => toggleSection(sr.sectionConfig.sectionId))}
                                                onMouseDown={handleProtectedMouseDown}
                                                onAuxClick={handlePreventAuxClick}
                                                onWheel={handlePreventWheelClick}
                                                onKeyDown={(e) => handleSectionKeyDown(e, sr.sectionConfig.sectionId)}
                                                role="button"
                                                tabIndex={0}
                                                title={`${isOpen ? 'Collapse' : 'Expand'} ${sr.sectionConfig.sectionTitle} (${combinedFeatureCount} feature${combinedFeatureCount !== 1 ? 's' : ''})`}
                                                aria-expanded={isOpen}
                                                aria-controls={sectionBodyId}
                                            >
                                                <h2 id={`section-title-${sr.sectionConfig.sectionId}`} className="pm-section-title">
                                                    {sr.sectionConfig.sectionTitle}
                                                    <span className="sr-only"> - {combinedFeatureCount} feature{combinedFeatureCount !== 1 ? 's' : ''}</span>
                                                </h2>
                                                <span className={`pm-section-toggle ${isOpen ? 'open' : ''}`} aria-hidden="true">
                                                    ▼
                                                </span>
                                            </div>
                                            <div
                                                id={sectionBodyId}
                                                className={`pm-section-body ${isOpen ? 'open' : ''}`}
                                                role="region"
                                                aria-labelledby={`section-title-${sr.sectionConfig.sectionId}`}
                                            >
                                                {/* Render each nearby layer with its own View Details trigger */}
                                                {sr.nearbyResults?.filter(nr => nr.features?.length > 0).map((nearbyResult, nrIdx) => (
                                                    <NearbySeparateTrigger
                                                        key={nearbyResult.layerConfig.layerId || nrIdx}
                                                        nearbyResult={nearbyResult}
                                                        sourceGeometry={queryPoint || undefined}
                                                        parentTitle={displayedSearchText || 'Property'}
                                                        defaultOpen={nearbyResult.layerConfig.expanded !== false}
                                                        onViewDetails={() => setSeparatePaneData({
                                                            type: 'nearbyResult',
                                                            nearbyResult: nearbyResult,
                                                            sourceGeometry: queryPoint,
                                                            parentTitle: displayedSearchText || 'Property',
                                                            paneTitle: nearbyResult.layerConfig.layerTitle || 'Nearby'
                                                        })}
                                                    />
                                                ))}
                                            </div>
                                        </section>
                                    )
                                }

                                // If using separate pane with regular content (or mixed), show aggregated summary
                                if (shouldUseSeparatePane && combinedFeatureCount > 0) {
                                    return (
                                        <section className="pm-section" key={sr.sectionConfig.sectionId} aria-labelledby={`section-title-${sr.sectionConfig.sectionId}`}>
                                            <div
                                                className="pm-section-header"
                                                onClick={handleProtectedClick(() => toggleSection(sr.sectionConfig.sectionId))}
                                                onMouseDown={handleProtectedMouseDown}
                                                onAuxClick={handlePreventAuxClick}
                                                onWheel={handlePreventWheelClick}
                                                onKeyDown={(e) => handleSectionKeyDown(e, sr.sectionConfig.sectionId)}
                                                role="button"
                                                tabIndex={0}
                                                title={`${isOpen ? 'Collapse' : 'Expand'} ${sr.sectionConfig.sectionTitle} (${combinedFeatureCount} feature${combinedFeatureCount !== 1 ? 's' : ''})`}
                                                aria-expanded={isOpen}
                                                aria-controls={sectionBodyId}
                                            >
                                                <h2 id={`section-title-${sr.sectionConfig.sectionId}`} className="pm-section-title">
                                                    {sr.sectionConfig.sectionTitle}
                                                    <span className="sr-only"> - {combinedFeatureCount} feature{combinedFeatureCount !== 1 ? 's' : ''}</span>
                                                </h2>
                                                <span className={`pm-section-toggle ${isOpen ? 'open' : ''}`} aria-hidden="true">
                                                    ▼
                                                </span>
                                            </div>
                                            <div
                                                id={sectionBodyId}
                                                className={`pm-section-body ${isOpen ? 'open' : ''}`}
                                                role="region"
                                                aria-labelledby={`section-title-${sr.sectionConfig.sectionId}`}
                                            >
                                                <div className="section-separate-pane-trigger">
                                                    <p style={{ margin: '0 0 8px', fontSize: '12px', color: theme.textSecondary }}>
                                                        {combinedFeatureCount} {nearbyFeatureCount > 0 && sr.totalFeatures === 0 ? 'nearby ' : ''}record{combinedFeatureCount !== 1 ? 's' : ''} available
                                                    </p>
                                                    <button
                                                        type="button"
                                                        className="view-details-btn"
                                                        onClick={() => setSeparatePaneData({
                                                            type: 'section',
                                                            sectionResult: sr,
                                                            parentTitle: displayedSearchText || 'Property',
                                                            paneTitle: sr.sectionConfig.separatePaneTitle || sr.sectionConfig.sectionTitle
                                                        })}
                                                        title={`View all ${combinedFeatureCount} ${sr.sectionConfig.sectionTitle} records in detail view`}
                                                        aria-label={`View ${combinedFeatureCount} ${sr.sectionConfig.sectionTitle} records in detail pane`}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                                            <path d="M2 12h12M2 8h12M2 4h12" />
                                                        </svg>
                                                        View Details
                                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                                            <path d="M6.5 3.5L11 8l-4.5 4.5" stroke="currentColor" strokeWidth="2" fill="none" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </section>
                                    )
                                }

                                return (
                                    <section className="pm-section" key={sr.sectionConfig.sectionId} aria-labelledby={`section-title-${sr.sectionConfig.sectionId}`}>
                                        <div
                                            className="pm-section-header"
                                            onClick={handleProtectedClick(() => toggleSection(sr.sectionConfig.sectionId))}
                                            onMouseDown={handleProtectedMouseDown}
                                            onAuxClick={handlePreventAuxClick}
                                            onWheel={handlePreventWheelClick}
                                            onKeyDown={(e) => handleSectionKeyDown(e, sr.sectionConfig.sectionId)}
                                            role="button"
                                            tabIndex={0}
                                            title={`${isOpen ? 'Collapse' : 'Expand'} ${sr.sectionConfig.sectionTitle} (${sr.totalFeatures} feature${sr.totalFeatures !== 1 ? 's' : ''})`}
                                            aria-expanded={isOpen}
                                            aria-controls={sectionBodyId}
                                        >
                                            <h2 id={`section-title-${sr.sectionConfig.sectionId}`} className="pm-section-title">
                                                {sr.sectionConfig.sectionTitle}
                                                <span className="sr-only"> - {sr.totalFeatures} feature{sr.totalFeatures !== 1 ? 's' : ''}</span>
                                            </h2>
                                            <span className={`pm-section-toggle ${isOpen ? 'open' : ''}`} aria-hidden="true">
                                                ▼
                                            </span>
                                        </div>
                                        <div
                                            id={sectionBodyId}
                                            className={`pm-section-body ${isOpen ? 'open' : ''}`}
                                            role="region"
                                            aria-labelledby={`section-title-${sr.sectionConfig.sectionId}`}
                                        >
                                            {/* Rich text before data */}
                                            {hasRichText && richTextPosition === 'before' && <RichTextContent />}

                                            {/* Data content */}
                                            <DataContent />

                                            {/* Rich text after data */}
                                            {hasRichText && richTextPosition === 'after' && <RichTextContent />}
                                        </div>
                                    </section>
                                )
                            })}
                        </>
                    )}

                    {!loading && results.length === 0 && !error && (
                        <div className="empty-state" role="status">
                            <p><strong>Property Information</strong></p>
                            <p>Search for an address or use <em>Select location from map</em> to choose a point.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Separate Pane for Related Tables or Sections */}
            {separatePaneData && (
                <div
                    className="separate-pane"
                    role="dialog"
                    aria-labelledby="separate-pane-title"
                    aria-describedby="separate-pane-description"
                    aria-modal="true"
                >
                    <span id="separate-pane-description" className="sr-only">
                        Viewing detailed records. Press Escape or click Back to return to main view.
                    </span>
                    <div className="separate-pane-header">
                        <button
                            type="button"
                            className="back-btn"
                            onClick={() => setSeparatePaneData(null)}
                            title="Return to main results view (Escape)"
                            aria-label="Go back to main results view"
                            autoFocus
                        >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                            Back
                        </button>
                        <div className="separate-pane-title">
                            <h2 id="separate-pane-title">
                                {separatePaneData.paneTitle}
                            </h2>
                            <div className="separate-pane-subtitle">
                                {separatePaneData.parentTitle} • {
                                    separatePaneData.type === 'relatedTable'
                                        ? `${separatePaneData.records?.length || 0} record${(separatePaneData.records?.length || 0) !== 1 ? 's' : ''}`
                                        : separatePaneData.type === 'nearbyResult'
                                            ? `${separatePaneData.nearbyResult?.features?.length || 0} nearby record${(separatePaneData.nearbyResult?.features?.length || 0) !== 1 ? 's' : ''}`
                                            : (() => {
                                                const sr = separatePaneData.sectionResult
                                                const nearbyCount = sr?.nearbyResults
                                                    ? sr.nearbyResults.reduce((sum, nr) => sum + (nr.features?.length || 0), 0)
                                                    : 0
                                                const totalCount = (sr?.totalFeatures || 0) + nearbyCount
                                                return `${totalCount} record${totalCount !== 1 ? 's' : ''}`
                                            })()
                                }
                            </div>
                        </div>
                    </div>
                    <div className="separate-pane-content">
                        {separatePaneData.type === 'relatedTable' && separatePaneData.tableConfig && separatePaneData.records && (
                            <RelatedTableDisplay
                                relatedTable={{
                                    ...separatePaneData.tableConfig,
                                    displayPane: 'inline'  // Force inline display in the pane itself
                                }}
                                records={separatePaneData.records}
                                chartConfig={separatePaneData.tableConfig.chartConfig}
                                domainLookup={separatePaneData.domainLookup}
                            />
                        )}
                        {separatePaneData.type === 'section' && separatePaneData.sectionResult && (
                            <SectionPaneContent
                                sectionResult={separatePaneData.sectionResult}
                                config={config}
                                onRowHighlight={highlightRowGeometry}
                                onRowZoom={zoomToGeometry}
                                sourceGeometry={queryPoint || undefined}
                                onZoomToBoth={zoomToBothGeometries}
                                skipAnimation={animatedChartsRef.current.has(separatePaneData.sectionResult.sectionConfig.sectionId)}
                            />
                        )}
                        {separatePaneData.type === 'nearbyResult' && separatePaneData.nearbyResult && (
                            <div className="section-pane-content">
                                <NearbyDisplay
                                    nearbyResult={separatePaneData.nearbyResult}
                                    sourceGeometry={separatePaneData.sourceGeometry}
                                    onHighlight={highlightRowGeometry}
                                    onZoom={(geom, scale) => zoomToGeometry(geom, scale || 2500)}
                                    onZoomToBoth={zoomToBothGeometries}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

// =====================================================
// Layer No Results Section - Shows custom message with proper header
// =====================================================
interface LayerNoResultsSectionProps {
    layerConfig: LayerConfig
    defaultOpen: boolean
}

const LayerNoResultsSection = ({ layerConfig, defaultOpen }: LayerNoResultsSectionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    const sectionId = useRef(`layer-no-results-${Math.random().toString(36).substr(2, 9)}`)
    const bodyId = `${sectionId.current}-body`

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(!isOpen)
        }
    }

    return (
        <div className="layer-section">
            <div
                className="layer-header"
                onClick={handleProtectedClick(() => setIsOpen(!isOpen))}
                onMouseDown={handleProtectedMouseDown}
                onAuxClick={handlePreventAuxClick}
                onWheel={handlePreventWheelClick}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
                title={isOpen ? `Collapse ${layerConfig.layerTitle}` : `Expand ${layerConfig.layerTitle}`}
                aria-expanded={isOpen}
                aria-controls={bodyId}
            >
                <span className="layer-title">{layerConfig.layerTitle}</span>
                <div className="layer-header-right">
                    <span className={`layer-toggle ${isOpen ? 'open' : ''}`} aria-hidden="true">▼</span>
                </div>
            </div>
            <div
                id={bodyId}
                className={`layer-body ${isOpen ? 'open' : ''}`}
                role="region"
                aria-label={`${layerConfig.layerTitle} details`}
            >
                <div className="no-results-message" style={{
                    padding: '12px',
                    color: theme.textSecondary,
                    fontStyle: 'italic',
                    fontSize: '0.8125rem'
                }}>
                    {layerConfig.customNoResultsText}
                </div>
            </div>
        </div>
    )
}

// =====================================================
// ACCESSIBILITY: Enhanced Layer Data Section with Full A11y
// =====================================================
interface LayerDataSectionProps {
    layerResult: LayerResult
    fields: any[]
    defaultOpen: boolean
    tableConfig?: TableDisplayConfig
    onViewSeparatePane?: (tableConfig: RelatedTableConfig, records: any[], parentTitle: string, domainLookup?: DomainLookup) => void
    parentTitle?: string
    // Row map interaction callbacks
    onRowHighlight?: (geometry: any | null, color?: string, fillOpacity?: number) => void
    onRowZoom?: (geometry: any | null, scale?: number) => void
}

const LayerDataSection = ({ layerResult, fields, defaultOpen, tableConfig, onViewSeparatePane, parentTitle, onRowHighlight, onRowZoom }: LayerDataSectionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    // Initialize sorting state with default sort from layer config
    const defaultSortField = layerResult.layerConfig.defaultSortField
    const defaultSortOrder = layerResult.layerConfig.defaultSortOrder || 'asc'
    const [sorting, setSorting] = useState<SortingState>(
        defaultSortField ? [{ id: defaultSortField, desc: defaultSortOrder === 'desc' }] : []
    )
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: tableConfig?.pageSize || 10
    })
    const [columnSizing, setColumnSizing] = useState<Record<string, number>>({})

    // Custom resize state (like RelatedTableDisplay)
    const [resizingColumn, setResizingColumn] = useState<string | null>(null)
    const resizeStartX = useRef<number>(0)
    const resizeStartWidth = useRef<number>(0)

    const sectionId = useRef(`layer-section-${Math.random().toString(36).substr(2, 9)}`)
    const bodyId = `${sectionId.current}-body`
    const tableId = `${sectionId.current}-table`

    // Memoized sorted features for list/card views
    const sortedFeatures = useMemo(() => {
        if (!defaultSortField) return layerResult.features

        return [...layerResult.features].sort((a, b) => {
            const aVal = a[defaultSortField]
            const bVal = b[defaultSortField]

            // Handle null/undefined
            if (aVal == null && bVal == null) return 0
            if (aVal == null) return defaultSortOrder === 'asc' ? 1 : -1
            if (bVal == null) return defaultSortOrder === 'asc' ? -1 : 1

            // Detect type and compare
            const aNum = typeof aVal === 'number' ? aVal : parseFloat(aVal)
            const bNum = typeof bVal === 'number' ? bVal : parseFloat(bVal)

            let comparison: number
            if (!isNaN(aNum) && !isNaN(bNum)) {
                // Numeric comparison
                comparison = aNum - bNum
            } else if (aVal instanceof Date || bVal instanceof Date ||
                (typeof aVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(aVal))) {
                // Date comparison
                const aDate = new Date(aVal).getTime()
                const bDate = new Date(bVal).getTime()
                comparison = aDate - bDate
            } else {
                // String comparison
                comparison = String(aVal).localeCompare(String(bVal))
            }

            return defaultSortOrder === 'desc' ? -comparison : comparison
        })
    }, [layerResult.features, defaultSortField, defaultSortOrder])

    // Determine if we have multiple records (for sorting/resizing)
    const hasMultipleRecords = layerResult.features.length > 1

    const config = {
        // Only enable sorting and resizing when multiple records exist
        enableSorting: hasMultipleRecords && tableConfig?.enableSorting !== false,
        enableFiltering: tableConfig?.enableFiltering || false,
        enablePagination: tableConfig?.enablePagination !== false,
        pageSize: tableConfig?.pageSize || 10,
        stickyHeader: tableConfig?.stickyHeader !== false,
        stripedRows: tableConfig?.stripedRows !== false,
        highlightOnHover: tableConfig?.highlightOnHover !== false,
        compactMode: tableConfig?.compactMode || false,
        showRowNumbers: tableConfig?.showRowNumbers || false,
        resizableColumns: hasMultipleRecords && (tableConfig?.resizableColumns ?? false)
    }

    // Custom resize handlers (document-level for reliable tracking)
    const handleResizeStart = useCallback((e: React.MouseEvent, columnId: string, currentWidth: number) => {
        e.preventDefault()
        e.stopPropagation()
        resizeStartX.current = e.clientX
        resizeStartWidth.current = columnSizing[columnId] || currentWidth || 100
        setResizingColumn(columnId)
    }, [columnSizing])

    useEffect(() => {
        if (!resizingColumn) return

        const handleMouseMove = (e: MouseEvent) => {
            const diff = e.clientX - resizeStartX.current
            const newWidth = Math.max(50, resizeStartWidth.current + diff)
            setColumnSizing(prev => ({
                ...prev,
                [resizingColumn]: newWidth
            }))
        }

        const handleMouseUp = () => {
            setResizingColumn(null)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }
    }, [resizingColumn])

    // Layer-level rich text configuration
    const layerCfg = layerResult.layerConfig
    const hasLayerRichTextConfig = layerCfg.layerRichTextContent || (layerCfg.layerRichTextButtons && layerCfg.layerRichTextButtons.length > 0)
    const layerRichTextPosition = layerCfg.layerRichTextPosition || 'after'

    // Helper function to replace placeholders with layer data (first feature)
    const replaceLayerPlaceholders = (text: string): string => {
        if (!text) return text
        if (layerResult.features.length === 0) return text
        const firstFeature = layerResult.features[0]

        return text.replace(/\{([^}]+)\}/g, (match, fieldName) => {
            const trimmedName = fieldName.trim()
            // Look for field value in features
            if (firstFeature && firstFeature[trimmedName] !== undefined && firstFeature[trimmedName] !== null) {
                return String(firstFeature[trimmedName])
            }
            // Return original placeholder if no match
            return match
        })
    }

    // Check if any placeholders remain unresolved
    const hasLayerUnresolvedPlaceholders = (text: string): boolean => {
        if (!text) return false
        const processedText = replaceLayerPlaceholders(text)
        return /\{[^}]+\}/.test(processedText)
    }

    // Check if layer rich text should be hidden due to no results
    const shouldHideLayerRichTextDueToNoResults = layerCfg.hideLayerRichTextWhenNoResults && layerResult.features.length === 0
    const layerRichTextHasUnresolved = layerCfg.layerRichTextContent
        ? hasLayerUnresolvedPlaceholders(layerCfg.layerRichTextContent)
        : false
    const hasLayerRichText = hasLayerRichTextConfig && !layerRichTextHasUnresolved && !shouldHideLayerRichTextDueToNoResults

    // Render rich text button for layer
    const renderLayerRichTextButton = (button: RichTextButton) => {
        const styleClass = button.style === 'primary'
            ? 'rich-text-btn-primary'
            : button.style === 'outline'
                ? 'rich-text-btn-outline'
                : 'rich-text-btn-default'

        const processedUrl = replaceLayerPlaceholders(button.url || '')

        return (
            <a
                key={button.buttonId}
                href={processedUrl}
                target={button.openInNewTab !== false ? '_blank' : '_self'}
                rel={button.openInNewTab !== false ? 'noopener noreferrer' : undefined}
                className={`rich-text-btn ${styleClass}`}
                aria-label={button.openInNewTab !== false ? `${button.label} (opens in new tab)` : button.label}
            >
                {button.label}
            </a>
        )
    }

    // Layer Rich Text Content component
    const LayerRichTextContent = () => (
        <>
            {layerCfg.layerRichTextContent && (
                <div
                    className="rich-text-content"
                    dangerouslySetInnerHTML={{
                        __html: replaceLayerPlaceholders(layerCfg.layerRichTextContent)
                    }}
                />
            )}
            {layerCfg.layerRichTextButtons && layerCfg.layerRichTextButtons.length > 0 && (
                <div className="rich-text-buttons">
                    {(toMutable<any>(layerCfg.layerRichTextButtons) as RichTextButton[]).map(renderLayerRichTextButton)}
                </div>
            )}
        </>
    )

    // Use domain-aware formatting that resolves coded value domains
    const domainLookup = layerResult.domainLookup
    const formatValue = (val: any, fieldConfig?: FieldConfig) => formatFieldValueWithDomain(val, fieldConfig, domainLookup)

    const isLink = (val: any): boolean => {
        if (typeof val !== 'string') return false
        return val.startsWith('http://') || val.startsWith('https://')
    }

    const columns = useMemo<ColumnDef<any>[]>(() => {
        const cols: ColumnDef<any>[] = []

        if (config.showRowNumbers) {
            cols.push({
                id: '_rowNumber',
                header: '#',
                cell: ({ row }) => row.index + 1,
                enableSorting: false,
                size: 40
            })
        }

        fields.forEach(field => {
            cols.push({
                accessorKey: field.name,
                header: field.alias || field.name,
                cell: ({ getValue, row }) => {
                    const value = getValue()
                    const formatted = formatValue(value, field)
                    const format = field.format
                    const isLinkFormat = format?.type === 'link'

                    // Handle link format with optional base URL
                    if (isLinkFormat && value != null && value !== '') {
                        let fullUrl: string
                        if (format?.useLinkBaseUrl && format?.linkBaseUrl) {
                            fullUrl = format.linkBaseUrl + String(value)
                        } else if (isLink(value)) {
                            fullUrl = value as string
                        } else {
                            fullUrl = String(value)
                        }
                        const linkText = format?.linkText || String(value)
                        return (
                            <a
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`${linkText} (opens in new tab)`}
                                aria-label={`${field.alias || field.name}: ${linkText} (opens in new tab)`}
                            >
                                {linkText}
                            </a>
                        )
                    }

                    // Auto-detect URLs for non-link format types
                    if (isLink(value)) {
                        const linkText = format?.linkText || formatted
                        return (
                            <a
                                href={value as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`${linkText} (opens in new tab)`}
                                aria-label={`${field.alias || field.name}: ${linkText} (opens in new tab)`}
                            >
                                {linkText}
                            </a>
                        )
                    }
                    return formatted
                },
                enableSorting: config.enableSorting,
                filterFn: 'includesString'
            })
        })
        return cols
    }, [fields, config.enableSorting, config.showRowNumbers, domainLookup])

    const table = useReactTable({
        data: layerResult.features,
        columns,
        state: {
            sorting,
            columnFilters,
            pagination
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: config.enableSorting ? getSortedRowModel() : undefined,
        getFilteredRowModel: config.enableFiltering ? getFilteredRowModel() : undefined,
        getPaginationRowModel: config.enablePagination ? getPaginationRowModel() : undefined
    })

    // ACCESSIBILITY: Handle keyboard for sortable headers
    const handleHeaderKeyDown = (e: React.KeyboardEvent, handler: ((event: unknown) => void) | undefined) => {
        if (handler && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            handler(e)
        }
    }

    // ACCESSIBILITY: Handle layer header keyboard
    const handleLayerHeaderKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(!isOpen)
        }
    }

    // Single record: key-value pairs
    if (layerResult.features.length === 1) {
        const singleFeature = layerResult.features[0]
        const geometry = singleFeature?.__geometry
        const layerConfig = layerResult.layerConfig
        const enableHighlight = layerConfig.enableRowHighlight && geometry && onRowHighlight
        const enableZoom = layerConfig.enableRowZoom && geometry && onRowZoom
        const highlightColor = layerConfig.rowHighlightColor || '#FF6600'
        const fillOpacity = layerConfig.rowHighlightFillOpacity ?? 0.2
        const zoomScale = layerConfig.rowZoomScale || 2500

        return (
            <div
                className="layer-subsection"
                onMouseEnter={enableHighlight ? () => onRowHighlight(geometry, highlightColor, fillOpacity) : undefined}
                onMouseLeave={enableHighlight ? () => onRowHighlight(null) : undefined}
            >
                <div
                    className="layer-header"
                    onClick={handleProtectedClick(() => setIsOpen(!isOpen))}
                    onMouseDown={handleProtectedMouseDown}
                    onAuxClick={handlePreventAuxClick}
                    onWheel={handlePreventWheelClick}
                    onKeyDown={handleLayerHeaderKeyDown}
                    role="button"
                    tabIndex={0}
                    title={isOpen ? `Collapse ${layerResult.layerConfig.layerTitle}` : `Expand ${layerResult.layerConfig.layerTitle}`}
                    aria-expanded={isOpen}
                    aria-controls={bodyId}
                >
                    <span className="layer-title">{layerResult.layerConfig.layerTitle}</span>
                    <div className="layer-header-right">
                        <span className="layer-count">1 record</span>
                        {enableZoom && (
                            <button
                                type="button"
                                className="row-zoom-btn"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onRowZoom(geometry, zoomScale)
                                }}
                                title="Zoom to feature on map"
                                aria-label="Zoom to feature on map"
                            >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                    <path d="M6.5 1a5.5 5.5 0 0 1 4.383 8.823l3.896 3.9a.75.75 0 0 1-1.061 1.06l-3.895-3.896A5.5 5.5 0 1 1 6.5 1zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM7 4v2h2v1.5H7v2H5.5v-2h-2V6h2V4H7z" />
                                </svg>
                            </button>
                        )}
                        <span className={`layer-toggle ${isOpen ? 'open' : ''}`} aria-hidden="true">▼</span>
                    </div>
                </div>
                <div
                    id={bodyId}
                    className={`layer-body ${isOpen ? 'open' : ''}`}
                    role="region"
                    aria-label={`${layerResult.layerConfig.layerTitle} details`}
                >
                    {/* Layer rich text before data */}
                    {hasLayerRichText && layerRichTextPosition === 'before' && <LayerRichTextContent />}

                    <dl>
                        {fields.map((field, i) => {
                            const value = layerResult.features[0][field.name]
                            const formattedValue = formatValue(value, field)
                            const format = field.format
                            const isLinkFormat = format?.type === 'link'

                            // Handle link format with optional base URL
                            let linkElement: React.ReactNode = null
                            if (isLinkFormat && value != null && value !== '') {
                                let fullUrl: string
                                if (format?.useLinkBaseUrl && format?.linkBaseUrl) {
                                    fullUrl = format.linkBaseUrl + String(value)
                                } else if (isLink(value)) {
                                    fullUrl = value as string
                                } else {
                                    fullUrl = String(value)
                                }
                                const linkText = format?.linkText || String(value)
                                linkElement = (
                                    <a
                                        href={fullUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={`${linkText} (opens in new tab)`}
                                        aria-label={`${linkText} (opens in new tab)`}
                                    >
                                        {linkText}
                                    </a>
                                )
                            } else if (isLink(value)) {
                                // Auto-detect URLs for non-link format types
                                const linkText = format?.linkText || formattedValue
                                linkElement = (
                                    <a
                                        href={value}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={`${linkText} (opens in new tab)`}
                                        aria-label={`${linkText} (opens in new tab)`}
                                    >
                                        {linkText}
                                    </a>
                                )
                            }

                            return (
                                <div className="data-row" key={i}>
                                    <dt className="data-label">{field.alias || field.name}</dt>
                                    <dd className="data-value">
                                        {linkElement || formattedValue}
                                    </dd>
                                </div>
                            )
                        })}
                    </dl>

                    {/* Related Tables for Single Record */}
                    {layerResult.relatedData && layerResult.relatedData.length > 0 && (
                        <div className="related-tables-container" style={{ padding: '12px 2px 0' }}>
                            {layerResult.relatedData.map((relData, idx) => (
                                <RelatedTableDisplay
                                    key={relData.tableConfig.tableId || idx}
                                    relatedTable={relData.tableConfig}
                                    records={relData.records}
                                    chartConfig={relData.tableConfig.chartConfig}
                                    domainLookup={relData.domainLookup}
                                    onViewSeparatePane={onViewSeparatePane ? (tc, rec, domLookup) => onViewSeparatePane(tc, rec, parentTitle || 'Property', domLookup) : undefined}
                                    parentTitle={parentTitle}
                                />
                            ))}
                        </div>
                    )}

                    {/* Layer rich text after data */}
                    {hasLayerRichText && layerRichTextPosition === 'after' && <LayerRichTextContent />}
                </div>
            </div>
        )
    }

    // Multiple records: TanStack Table or List/Card view
    const pageCount = table.getPageCount()
    const currentPage = table.getState().pagination.pageIndex
    const displayMode = layerResult.layerConfig.displayMode || 'table'

    // Helper to render field value with links and formatting
    const renderFieldValue = (val: any, field: FieldConfig) => {
        const format = field.format
        const isLinkFormat = format?.type === 'link'
        const formatted = formatValue(val, field)

        // Handle link format with optional base URL
        if (isLinkFormat && val != null && val !== '') {
            let fullUrl: string
            if (format?.useLinkBaseUrl && format?.linkBaseUrl) {
                fullUrl = format.linkBaseUrl + String(val)
            } else if (isLink(val)) {
                fullUrl = val as string
            } else {
                fullUrl = String(val)
            }
            const linkText = format?.linkText || String(val)
            return (
                <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: theme.sectionHeader }}
                    title={`${linkText} (opens in new tab)`}
                    aria-label={`${linkText} (opens in new tab)`}
                >
                    {linkText}
                </a>
            )
        }

        // Auto-detect URLs
        if (isLink(val)) {
            const linkText = format?.linkText || formatted
            return (
                <a
                    href={val as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: theme.sectionHeader }}
                    title={`${linkText} (opens in new tab)`}
                    aria-label={`${linkText} (opens in new tab)`}
                >
                    {linkText}
                </a>
            )
        }

        return formatted
    }


    return (
        <div className="layer-subsection">
            <div
                className="layer-header"
                onClick={handleProtectedClick(() => setIsOpen(!isOpen))}
                onMouseDown={handleProtectedMouseDown}
                onAuxClick={handlePreventAuxClick}
                onWheel={handlePreventWheelClick}
                onKeyDown={handleLayerHeaderKeyDown}
                role="button"
                tabIndex={0}
                title={isOpen ? `Collapse ${layerResult.layerConfig.layerTitle}` : `Expand ${layerResult.layerConfig.layerTitle}`}
                aria-expanded={isOpen}
                aria-controls={bodyId}
            >
                <span className="layer-title">{layerResult.layerConfig.layerTitle}</span>
                <div className="layer-header-right">
                    <span className="layer-count">{layerResult.features.length} record{layerResult.features.length !== 1 ? 's' : ''}</span>
                    <span className={`layer-toggle ${isOpen ? 'open' : ''}`} aria-hidden="true">▼</span>
                </div>
            </div>
            <div
                id={bodyId}
                className={`layer-body ${isOpen ? 'open' : ''}`}
                role="region"
                aria-label={`${layerResult.layerConfig.layerTitle} data table`}
            >
                {/* Layer rich text before data */}
                {hasLayerRichText && layerRichTextPosition === 'before' && <LayerRichTextContent />}

                {/* Display based on displayMode */}
                {displayMode === 'card' ? (
                    // Card View
                    <div className="layer-cards" style={{ padding: '8px 12px' }}>
                        {sortedFeatures.map((feature, idx) => {
                            const geometry = feature?.__geometry
                            const layerConfig = layerResult.layerConfig
                            const enableHighlight = layerConfig.enableRowHighlight && geometry && onRowHighlight
                            const enableZoom = layerConfig.enableRowZoom && geometry && onRowZoom
                            const highlightColor = layerConfig.rowHighlightColor || '#FF6600'
                            const fillOpacity = layerConfig.rowHighlightFillOpacity ?? 0.2
                            const zoomScale = layerConfig.rowZoomScale || 2500

                            return (
                                <div
                                    key={idx}
                                    className="related-card"
                                    style={{ cursor: enableZoom ? 'pointer' : undefined }}
                                    onMouseEnter={enableHighlight ? () => onRowHighlight(geometry, highlightColor, fillOpacity) : undefined}
                                    onMouseLeave={enableHighlight ? () => onRowHighlight(null) : undefined}
                                    onClick={enableZoom ? () => onRowZoom(geometry, zoomScale) : undefined}
                                    onKeyDown={(e) => {
                                        if (enableZoom && (e.key === 'Enter' || e.key === ' ')) {
                                            e.preventDefault()
                                            onRowZoom(geometry, zoomScale)
                                        }
                                    }}
                                    tabIndex={enableZoom ? 0 : undefined}
                                    role={enableZoom ? 'button' : undefined}
                                    aria-label={enableZoom ? `Record ${idx + 1}: Click to zoom on map` : undefined}
                                >
                                    {fields.map(field => (
                                        <div key={field.name} style={{ marginBottom: '4px' }}>
                                            <span style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase' }}>
                                                {field.alias || field.name}:
                                            </span>{' '}
                                            <span style={{ fontSize: '12px' }}>{renderFieldValue(feature[field.name], field)}</span>
                                        </div>
                                    ))}
                                </div>
                            )
                        })}
                    </div>
                ) : displayMode === 'list' ? (
                    // List View
                    <ul style={{ margin: 0, padding: '8px 12px 8px 32px', fontSize: '12px' }}>
                        {sortedFeatures.map((feature, idx) => {
                            const geometry = feature?.__geometry
                            const layerConfig = layerResult.layerConfig
                            const enableHighlight = layerConfig.enableRowHighlight && geometry && onRowHighlight
                            const enableZoom = layerConfig.enableRowZoom && geometry && onRowZoom
                            const highlightColor = layerConfig.rowHighlightColor || '#FF6600'
                            const fillOpacity = layerConfig.rowHighlightFillOpacity ?? 0.2
                            const zoomScale = layerConfig.rowZoomScale || 2500

                            return (
                                <li
                                    key={idx}
                                    style={{
                                        marginBottom: '6px',
                                        padding: '4px 8px',
                                        cursor: enableZoom ? 'pointer' : undefined,
                                        borderRadius: '4px',
                                        transition: 'background-color 0.15s ease'
                                    }}
                                    onMouseEnter={enableHighlight ? () => onRowHighlight(geometry, highlightColor, fillOpacity) : undefined}
                                    onMouseLeave={enableHighlight ? () => onRowHighlight(null) : undefined}
                                    onClick={enableZoom ? () => onRowZoom(geometry, zoomScale) : undefined}
                                    onKeyDown={(e) => {
                                        if (enableZoom && (e.key === 'Enter' || e.key === ' ')) {
                                            e.preventDefault()
                                            onRowZoom(geometry, zoomScale)
                                        }
                                    }}
                                    tabIndex={enableZoom ? 0 : undefined}
                                    role={enableZoom ? 'button' : undefined}
                                    aria-label={enableZoom ? `Record ${idx + 1}: Click to zoom on map` : undefined}
                                    className={enableHighlight || enableZoom ? 'interactive-row' : undefined}
                                >
                                    {fields.map((field, i) => (
                                        <span key={field.name}>
                                            {i > 0 && ' | '}
                                            {renderFieldValue(feature[field.name], field)}
                                        </span>
                                    ))}
                                </li>
                            )
                        })}
                    </ul>
                ) : (
                    // Table View (default)
                    <>
                        {/* Filter Row */}
                        {config.enableFiltering && (
                            <div className="table-filter-row" role="group" aria-label="Table filters">
                                {table.getAllColumns().filter(col => col.getCanFilter()).slice(0, 3).map(column => (
                                    <div key={column.id}>
                                        <label htmlFor={`filter-${column.id}`} className="sr-only">
                                            Filter {column.columnDef.header as string}
                                        </label>
                                        <input
                                            id={`filter-${column.id}`}
                                            type="text"
                                            placeholder={`Filter ${column.columnDef.header as string}...`}
                                            value={(column.getFilterValue() ?? '') as string}
                                            onChange={e => column.setFilterValue(e.target.value)}
                                            className="table-filter-input"
                                            aria-label={`Filter by ${column.columnDef.header as string}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Table */}
                        <div className={`table-wrapper ${config.stickyHeader ? 'sticky-header' : ''}`}>
                            <table
                                id={tableId}
                                className={`enhanced-table ${config.stripedRows ? 'striped' : ''} ${config.compactMode ? 'compact' : ''}`}
                                aria-label={`${layerResult.layerConfig.layerTitle} data`}
                                style={config.resizableColumns ? { tableLayout: 'fixed', minWidth: '100%' } : undefined}
                            >
                                <caption className="sr-only">
                                    {layerResult.layerConfig.layerTitle} - {layerResult.features.length} records
                                </caption>
                                <thead>
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => {
                                                const isSorted = header.column.getIsSorted()
                                                const sortDir = isSorted === 'asc' ? 'ascending' : isSorted === 'desc' ? 'descending' : 'none'
                                                const canResize = config.resizableColumns
                                                const columnId = header.column.id
                                                const columnWidth = columnSizing[columnId] || 'auto'

                                                return (
                                                    <th
                                                        key={header.id}
                                                        onClick={wrapSortHandler(header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined)}
                                                        onMouseDown={handleProtectedMouseDown}
                                                        onAuxClick={handlePreventAuxClick}
                                                        onWheel={handlePreventWheelClick}
                                                        onKeyDown={(e) => handleHeaderKeyDown(e, header.column.getToggleSortingHandler())}
                                                        className={`${header.column.getCanSort() ? 'sortable' : ''} ${canResize ? 'resizable' : ''}`}
                                                        style={{
                                                            width: columnWidth !== 'auto' ? `${columnWidth}px` : 'auto',
                                                            minWidth: '50px'
                                                        }}
                                                        scope="col"
                                                        tabIndex={header.column.getCanSort() ? 0 : undefined}
                                                        title={header.column.getCanSort() ? `Sort by ${header.column.columnDef.header}` : undefined}
                                                        aria-sort={header.column.getCanSort() ? sortDir : undefined}
                                                        role={header.column.getCanSort() ? 'columnheader button' : 'columnheader'}
                                                    >
                                                        <div className="th-content">
                                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                                            {header.column.getIsSorted() && (
                                                                <span className="sort-indicator" aria-hidden="true">
                                                                    {header.column.getIsSorted() === 'asc' ? ' ▲' : ' ▼'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {canResize && (
                                                            <div
                                                                className={`resize-handle ${resizingColumn === columnId ? 'resizing' : ''}`}
                                                                onMouseDown={(e) => {
                                                                    const th = e.currentTarget.closest('th')
                                                                    handleResizeStart(e, columnId, th?.offsetWidth || 100)
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                                title={`Drag to resize ${header.column.columnDef.header} column`}
                                                                role="separator"
                                                                aria-orientation="vertical"
                                                                aria-label={`Resize ${header.column.columnDef.header} column`}
                                                                tabIndex={0}
                                                                onKeyDown={(e) => {
                                                                    // Allow keyboard resizing with arrow keys
                                                                    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                                                                        e.preventDefault()
                                                                        const delta = e.key === 'ArrowLeft' ? -10 : 10
                                                                        const th = e.currentTarget.closest('th')
                                                                        const currentWidth = columnSizing[columnId] || th?.offsetWidth || 100
                                                                        setColumnSizing(prev => ({
                                                                            ...prev,
                                                                            [columnId]: Math.max(50, currentWidth + delta)
                                                                        }))
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    </th>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody>
                                    {table.getRowModel().rows.map(row => {
                                        const rowData = row.original as any
                                        const geometry = rowData?.__geometry
                                        const layerConfig = layerResult.layerConfig
                                        const enableHighlight = layerConfig.enableRowHighlight && geometry && onRowHighlight
                                        const enableZoom = layerConfig.enableRowZoom && geometry && onRowZoom
                                        const highlightColor = layerConfig.rowHighlightColor || '#FF6600'
                                        const fillOpacity = layerConfig.rowHighlightFillOpacity ?? 0.2
                                        const zoomScale = layerConfig.rowZoomScale || 2500
                                        const isInteractive = enableHighlight || enableZoom

                                        // Handle keyboard interaction for zoom
                                        const handleRowKeyDown = (e: React.KeyboardEvent) => {
                                            if (enableZoom && (e.key === 'Enter' || e.key === ' ')) {
                                                e.preventDefault()
                                                onRowZoom(geometry, zoomScale)
                                            }
                                        }

                                        // Build descriptive title/aria-label
                                        const getRowDescription = () => {
                                            const parts: string[] = []
                                            if (enableHighlight) parts.push('hover to highlight on map')
                                            if (enableZoom) parts.push('click or press Enter to zoom')
                                            return parts.length > 0 ? `Row ${row.index + 1}: ${parts.join(', ')}` : undefined
                                        }

                                        return (
                                            <tr
                                                key={row.id}
                                                className={`${config.highlightOnHover ? 'hover-highlight' : ''} ${isInteractive ? 'interactive-row' : ''}`}
                                                onMouseEnter={enableHighlight ? () => onRowHighlight(geometry, highlightColor, fillOpacity) : undefined}
                                                onMouseLeave={enableHighlight ? () => onRowHighlight(null) : undefined}
                                                onClick={enableZoom ? () => onRowZoom(geometry, zoomScale) : undefined}
                                                onKeyDown={isInteractive ? handleRowKeyDown : undefined}
                                                onFocus={enableHighlight ? () => onRowHighlight(geometry, highlightColor, fillOpacity) : undefined}
                                                onBlur={enableHighlight ? () => onRowHighlight(null) : undefined}
                                                style={{ cursor: enableZoom ? 'pointer' : undefined }}
                                                tabIndex={isInteractive ? 0 : undefined}
                                                role={isInteractive ? 'button' : undefined}
                                                title={getRowDescription()}
                                                aria-label={getRowDescription()}
                                            >
                                                {row.getVisibleCells().map(cell => {
                                                    const colWidth = columnSizing[cell.column.id]
                                                    return (
                                                        <td
                                                            key={cell.id}
                                                            style={{
                                                                width: colWidth ? `${colWidth}px` : 'auto',
                                                                wordWrap: 'break-word',
                                                                overflowWrap: 'break-word'
                                                            }}
                                                        >
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {config.enablePagination && pageCount > 1 && (
                            <nav className="table-pagination" aria-label={`${layerResult.layerConfig.layerTitle} table pagination`}>
                                <div className="pagination-info" aria-live="polite">
                                    Showing {currentPage * pagination.pageSize + 1} - {Math.min((currentPage + 1) * pagination.pageSize, layerResult.features.length)} of {layerResult.features.length}
                                </div>
                                <div className="pagination-controls">
                                    <button
                                        type="button"
                                        onClick={() => table.firstPage()}
                                        disabled={!table.getCanPreviousPage()}
                                        className="pagination-btn"
                                        title="First page"
                                        aria-label="Go to first page"
                                    >
                                        <span aria-hidden="true">««</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                        className="pagination-btn"
                                        title="Previous page"
                                        aria-label="Go to previous page"
                                    >
                                        <span aria-hidden="true">«</span>
                                    </button>
                                    <span className="pagination-page" aria-current="page">
                                        Page {currentPage + 1} of {pageCount}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                        className="pagination-btn"
                                        title="Next page"
                                        aria-label="Go to next page"
                                    >
                                        <span aria-hidden="true">»</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => table.lastPage()}
                                        disabled={!table.getCanNextPage()}
                                        className="pagination-btn"
                                        title="Last page"
                                        aria-label="Go to last page"
                                    >
                                        <span aria-hidden="true">»»</span>
                                    </button>
                                </div>
                            </nav>
                        )}
                    </>
                )}

                {/* Related Tables */}
                {layerResult.relatedData && layerResult.relatedData.length > 0 && (
                    <div className="related-tables-container" style={{ padding: '0 12px 12px' }}>
                        {layerResult.relatedData.map((relData, idx) => (
                            <RelatedTableDisplay
                                key={relData.tableConfig.tableId || idx}
                                relatedTable={relData.tableConfig}
                                records={relData.records}
                                chartConfig={relData.tableConfig.chartConfig}
                                domainLookup={relData.domainLookup}
                                onViewSeparatePane={onViewSeparatePane ? (tc, rec, domLookup) => onViewSeparatePane(tc, rec, parentTitle || 'Property', domLookup) : undefined}
                                parentTitle={parentTitle}
                            />
                        ))}
                    </div>
                )}

                {/* Layer rich text after data */}
                {hasLayerRichText && layerRichTextPosition === 'after' && <LayerRichTextContent />}
            </div>
        </div>
    )
}

export default Widget