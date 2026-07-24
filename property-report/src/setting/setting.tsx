/** @jsx jsx */
/** @jsxFrag React.Fragment */
import { React, jsx, css, Immutable, DataSourceTypes, DataSourceManager, type UseDataSource, type ImmutableArray } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { MapWidgetSelector, SettingRow } from 'jimu-ui/advanced/setting-components'
// DataSourceSelector loaded lazily inside component to avoid module-load failure
import {
    TextInput,
    TextArea,
    Switch,
    Button,
    Select,
    Option,
    NumericInput,
    Label,
    Checkbox,
    Tooltip
} from 'jimu-ui'
import type { IMConfig, SectionConfig, LayerConfig, FieldConfig, SearchSourceConfig, HeaderInfoConfig, PdfHeaderConfig, PdfFooterConfig, PdfStyleConfig, PdfLogoConfig, ImageSizeMode, ChartConfig, ChartType, ChartMode, ChartFieldConfig, AggregationType, TableDisplayConfig, FieldFormatConfig, NumberFormatType, DateFormatType, TextFormatType, RichTextButton, RelatedTableConfig, PropertyPreviewConfig, PropertyActionConfig, AggregateFieldConfig, NearbyDisplayConfig, PdfAccessibilityConfig } from '../config'
// Tip aliased to Tooltip — component was renamed in ExB 1.20
const Tip = Tooltip
const { useState, useEffect, useRef } = React

// Simple SVG icons for compatibility
const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
        <path d="M8 10.5L3 5.5h10L8 10.5z" />
    </svg>
)

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
        <path d="M5.5 3l5 5-5 5V3z" />
    </svg>
)

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
        <path d="M5 2V1h6v1h4v1H1V2h4zm1 3v8h1V5H6zm3 0v8h1V5H9zM2 4h12l-1 11H3L2 4z" />
    </svg>
)

const MoveUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
        <path d="M8 3L3 8h3v5h4V8h3L8 3z" />
    </svg>
)

const MoveDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
        <path d="M8 13l5-5h-3V3H6v5H3l5 5z" />
    </svg>
)

const DragHandleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
        <path d="M5 3h2v2H5V3zm4 0h2v2H9V3zM5 7h2v2H5V7zm4 0h2v2H9V7zM5 11h2v2H5v-2zm4 0h2v2H9v-2z" />
    </svg>
)

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
        <path d="M7 7V2h2v5h5v2H9v5H7V9H2V7h5z" />
    </svg>
)

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="24" height="24" fill="currentColor">
        <path d="M11.5 6.5a5 5 0 1 0-2.12 4.09l4.06 4.06 1.41-1.41-4.06-4.06A5 5 0 0 0 11.5 6.5zm-5 3a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
    </svg>
)

const LayersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="24" height="24" fill="currentColor">
        <path d="M8 1L1 4.5 8 8l7-3.5L8 1zM1 8l7 3.5L15 8l-1.5-.75L8 10 2.5 7.25 1 8zm0 3l7 3.5 7-3.5-1.5-.75L8 13l-5.5-2.75L1 11z" />
    </svg>
)

const DataIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="24" height="24" fill="currentColor">
        <path d="M8 1C4.5 1 2 2.12 2 3.5v9C2 13.88 4.5 15 8 15s6-1.12 6-2.5v-9C14 2.12 11.5 1 8 1zm0 1c3.04 0 5 .9 5 1.5S11.04 5 8 5 3 4.1 3 3.5 4.96 2 8 2zm5 10.5c0 .6-1.96 1.5-5 1.5s-5-.9-5-1.5V11c1.12.63 2.96 1 5 1s3.88-.37 5-1v1.5zm0-3c0 .6-1.96 1.5-5 1.5s-5-.9-5-1.5V8c1.12.63 2.96 1 5 1s3.88-.37 5-1v1.5zm0-3c0 .6-1.96 1.5-5 1.5s-5-.9-5-1.5V5c1.12.63 2.96 1 5 1s3.88-.37 5-1v1.5z" />
    </svg>
)

const PinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="24" height="24" fill="currentColor">
        <path d="M8 1C5.24 1 3 3.24 3 6c0 4 5 9 5 9s5-5 5-9c0-2.76-2.24-5-5-5zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
    </svg>
)

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
        <path d="M8 1L4 5h3v6h2V5h3L8 1zM2 12v2h12v-2H2z" />
    </svg>
)

const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
        <path d="M14 2H2v12h12V2zm-1 11H3V3h10v10zM6 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 6l-2-3-2 2-1.5-1.5L4 11h8z" />
    </svg>
)

const PdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
        <path d="M3 1v14h10V5l-4-4H3zm7 1.5L12.5 5H10V2.5zM4 14V2h5v4h3v8H4z" />
    </svg>
)

const MapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
        <path d="M5.5 1L1 3v11l4.5-2 5 2 4.5-2V1l-4.5 2-5-2zM5 3.5v8l-3 1.3V4.2L5 3.5zm1 8V3.5l4 1.6v8L6 11.5zm5-6.4v8l3-1.3V3.2l-3 1.9z" />
    </svg>
)

const ColorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 12.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zM8 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-3 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
    </svg>
)

const FooterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
        <path d="M2 2v12h12V2H2zm11 11H3V3h10v10zM4 11h8v1H4v-1zm0-2h8v1H4V9z" />
    </svg>
)

const LayoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
        <path d="M2 2v12h12V2H2zm5 11H3V3h4v10zm6 0H8V9h5v4zm0-5H8V3h5v5z" />
    </svg>
)

const ChartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
        <path d="M1 14h14v1H1v-1zm1-1V7h2v6H2zm3 0V4h2v9H5zm3 0V1h2v12H8zm3 0V5h2v8h-2zm3 0V3h2v10h-2z" />
    </svg>
)

const TableIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
        <path d="M0 2v12h16V2H0zm1 1h4v3H1V3zm0 4h4v3H1V7zm0 4h4v2H1v-2zm5-8h4v3H6V3zm0 4h4v3H6V7zm0 4h4v2H6v-2zm5-8h4v3h-4V3zm0 4h4v3h-4V7zm0 4h4v2h-4v-2z" />
    </svg>
)

const CoordinateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM2 8a6 6 0 0 1 .94-3.22l2.12 2.12L4 8l1.06 1.06-2.12 2.16A6 6 0 0 1 2 8zm6 6a5.96 5.96 0 0 1-3.22-.94l2.16-2.12L8 12l1.06-1.06 2.16 2.12A5.96 5.96 0 0 1 8 14zm3.22-.94l-2.16-2.12L8 10l-1.06 1.06-2.16-2.16.94-3.22A6 6 0 0 1 14 8a5.96 5.96 0 0 1-.94 3.22l-2.12-2.16L10 8l1.06-1.06 2.12 2.12A5.96 5.96 0 0 1 8 14z" />
        <circle cx="8" cy="8" r="1.5" />
    </svg>
)

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
        <path d="M8 1L4 5h3v6h2V5h3L8 1zM2 13v2h12v-2H2z" />
    </svg>
)

const ImportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
        <path d="M8 11l4-4H9V1H7v6H4l4 4zM2 13v2h12v-2H2z" />
    </svg>
)

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
        <path d="M13.5 8c0-.3 0-.5-.1-.8l1.7-1.3-1.5-2.6-2.1.6c-.4-.3-.8-.6-1.3-.8L9.9 1H6.1l-.3 2.1c-.5.2-.9.5-1.3.8l-2.1-.6-1.5 2.6 1.7 1.3c-.1.3-.1.5-.1.8s0 .5.1.8l-1.7 1.3 1.5 2.6 2.1-.6c.4.3.8.6 1.3.8l.3 2.1h3.8l.3-2.1c.5-.2.9-.5 1.3-.8l2.1.6 1.5-2.6-1.7-1.3c.1-.3.1-.5.1-.8zM8 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
    </svg>
)

const RichTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
        <path d="M2 2v12h12V2H2zm11 11H3V3h10v10zM4 5h8v1H4V5zm0 2h8v1H4V7zm0 2h5v1H4V9z" />
    </svg>
)

const LinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
        <path d="M6.879 9.934a.81.81 0 01-.575-.238 3.818 3.818 0 010-5.392l3-3C10.024.584 10.982.187 12 .187s1.976.397 2.696 1.117a3.818 3.818 0 010 5.392l-1.371 1.371a.813.813 0 01-1.149-1.149l1.371-1.371A2.19 2.19 0 0012 1.812c-.584 0-1.134.228-1.547.641l-3 3a2.19 2.19 0 000 3.094.813.813 0 01-.574 1.387z" />
        <path d="M4 15.813a3.789 3.789 0 01-2.696-1.117 3.818 3.818 0 010-5.392l1.371-1.371a.813.813 0 011.149 1.149l-1.371 1.371a2.19 2.19 0 003.094 3.094l3-3a2.19 2.19 0 000-3.094.813.813 0 011.149-1.149 3.818 3.818 0 010 5.392l-3 3A3.789 3.789 0 014 15.813z" />
    </svg>
)

const TextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
        <path d="M2.5 2a.5.5 0 00-.5.5v2a.5.5 0 001 0V3h4.5v10H6a.5.5 0 000 1h4a.5.5 0 000-1H8.5V3H13v1.5a.5.5 0 001 0v-2a.5.5 0 00-.5-.5h-11z" />
    </svg>
)

// Info icon for tooltips
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="14" height="14" fill="currentColor" style={{ opacity: 0.6 }}>
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 12.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zM7 5V4h2v1H7zm0 7V6h2v6H7z" />
    </svg>
)

// Native Alert replacement - no jimu-ui dependency
const NativeAlert = ({ type = 'info', text, withIcon, open, style, children }: {
    type?: 'info' | 'warning' | 'error'
    text?: string
    withIcon?: boolean
    open?: boolean
    style?: React.CSSProperties
    children?: React.ReactNode
}) => {
    const colors = {
        info: { bg: '#e8f4fd', border: '#bee3f8', color: '#2b6cb0', icon: 'ℹ' },
        warning: { bg: '#fffbeb', border: '#fbd38d', color: '#975a16', icon: '⚠' },
        error: { bg: '#fff5f5', border: '#feb2b2', color: '#c53030', icon: '✕' }
    }
    const c = colors[type] || colors.info
    return (
        <div style={{
            background: c.bg, border: `1px solid ${c.border}`, color: c.color,
            borderRadius: '4px', padding: '8px 10px', fontSize: '11px',
            display: 'flex', alignItems: 'flex-start', gap: '6px',
            ...style
        }}>
            {withIcon && <span style={{ flexShrink: 0 }}>{c.icon}</span>}
            <span>{text || children}</span>
        </div>
    )
}


// Tooltip label component - displays label with info icon that shows tooltip on hover
// Uses simple title attribute for maximum compatibility with jsx pragma
const TooltipLabel = (props: { label: string, tooltip: string }) => {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            {props.label}
            <span title={props.tooltip} style={{ display: 'inline-flex', cursor: 'help' }}>
                <InfoIcon />
            </span>
        </span>
    )
}

const getStyles = () => css`
  .setting-container {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* Collapsible Settings Panel Styles */
  .collapsible-panel {
    margin-bottom: 4px;
    border: 1px solid var(--sys-color-divider-secondary);
    border-radius: var(--sys-shape-1);
    overflow: hidden;
    background: var(--sys-color-surface-paper);
  }

  .collapsible-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    cursor: pointer;
    user-select: none;
    background: var(--sys-color-primary-main);
    color: white;
    transition: background-color 0.15s ease;

    &:hover {
      background: var(--sys-color-primary-dark);
    }
  }

  .collapsible-panel-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  .collapsible-panel-title {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .collapsible-panel-toggle {
    transition: transform 0.2s ease;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.collapsed {
      transform: rotate(-90deg);
    }
  }

  .collapsible-panel-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-out;
    
    &.expanded {
      max-height: 15000px;
      transition: max-height 0.5s ease-in;
    }
  }

  .collapsible-panel-inner {
    padding: 12px;
  }

  /* Collapsable list item styling */
  .list-item-card {
    margin-bottom: 8px;
    border: 1px solid var(--sys-color-divider-secondary);
    border-radius: var(--sys-shape-1);
    overflow: hidden;
    background: var(--sys-color-surface-paper);
    box-shadow: var(--sys-shadow-1);
    
    &:hover {
      border-color: var(--sys-color-primary-main);
    }
  }

  .list-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    cursor: pointer;
    user-select: none;
    background: var(--sys-color-surface-background);
    transition: background-color 0.15s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  }

  .list-item-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  .expand-icon {
    color: var(--sys-color-text-regular);
    transition: transform 0.2s ease;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .list-item-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--sys-color-text-dark);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .item-badge {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: var(--sys-shape-pill);
    background: rgba(255, 255, 255, 0.15);
    color: var(--sys-color-text-regular);
    flex-shrink: 0;
    font-weight: 500;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .item-badge-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: var(--sys-color-text-light);
  }

  .item-badge-success {
    background: rgba(255, 255, 255, 0.15);
    color: var(--sys-color-text-regular);
  }

  .list-item-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 8px;
  }

  .delete-btn {
    color: var(--sys-color-text-light);
    background: transparent;
    border: none;
    padding: 4px;
    border-radius: var(--sys-shape-0);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    opacity: 0.7;

    &:hover {
      color: #f87171;
      background: rgba(248, 113, 113, 0.15);
      opacity: 1;
    }
  }

  .reorder-btn {
    color: var(--sys-color-text-light);
    background: transparent;
    border: none;
    padding: 4px;
    border-radius: var(--sys-shape-0);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    opacity: 0.7;

    &:hover:not(:disabled) {
      color: var(--sys-color-primary-main);
      background: rgba(var(--sys-color-primary-main-rgb), 0.15);
      opacity: 1;
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }

  .reorder-buttons {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-right: 4px;
  }

  .drag-handle {
    color: var(--sys-color-text-light);
    cursor: grab;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.5;
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 1;
    }

    &:active {
      cursor: grabbing;
    }
  }

  .selected-field-order {
    border: 1px solid var(--sys-color-divider-secondary, #e0e0e0);
    border-radius: 4px;
    padding: 6px;
    margin-bottom: 8px;
    background: var(--sys-color-surface-paper, #fafafa);
  }
  .selected-field-order-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--sys-color-text-light);
    margin: 0 2px 6px;
  }
  .field-order-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 6px;
    border-radius: 3px;
    background: var(--sys-color-surface-background, #fff);
    border: 1px solid var(--sys-color-divider-secondary, #e0e0e0);
    cursor: grab;
    user-select: none;
  }
  .field-order-item + .field-order-item {
    margin-top: 3px;
  }
  .field-order-item:active {
    cursor: grabbing;
  }
  .field-order-item.dragging {
    opacity: 0.4;
  }
  .field-order-item.drag-over {
    border-color: var(--sys-color-primary-main, #1976d2);
    box-shadow: inset 0 2px 0 var(--sys-color-primary-main, #1976d2);
  }
  .field-order-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: var(--sys-color-primary-main, #1976d2);
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .field-order-name {
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .list-item-content {
    padding: 12px;
    background: var(--sys-color-surface-paper);
    border-top: 1px solid var(--sys-color-divider-secondary);
  }

  /* Nested list items (layers within sections) */
  .nested-list-item {
    margin-bottom: 6px;
    border: 1px solid var(--sys-color-divider-tertiary);
    border-radius: var(--sys-shape-0);
    overflow: hidden;
    background: var(--sys-color-surface-background);
  }

  .nested-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    cursor: pointer;
    background: var(--sys-color-surface-background);

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  }

  .nested-item-content {
    padding: 10px;
    background: var(--sys-color-surface-paper);
    border-top: 1px solid var(--sys-color-divider-tertiary);
  }

  /* Add buttons */
  .add-button {
    width: 100%;
    margin-top: 12px;
    justify-content: center;
    gap: 6px;
    border: 1px solid var(--sys-color-primary-main);
    background: transparent;
    color: var(--sys-color-primary-main);

    &:hover {
      background: var(--sys-color-primary-main);
      color: white;
    }
  }

  .add-button-primary {
    border-color: var(--sys-color-primary-main);
    color: var(--sys-color-primary-main);

    &:hover {
      background: var(--sys-color-primary-main);
      color: white;
    }
  }

  .add-button-secondary {
    border-color: var(--sys-color-secondary-main);
    color: var(--sys-color-text-dark);

    &:hover {
      background: var(--sys-color-secondary-main);
      color: white;
    }
  }

  /* Add source type buttons */
  .source-type-buttons {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }

  .source-type-btn {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px 8px;
    border: 1px solid var(--sys-color-primary-main);
    border-radius: var(--sys-shape-1);
    background: var(--sys-color-surface-paper);
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: var(--sys-color-primary-main);
      border-color: var(--sys-color-primary-main);
    }

    &:hover .source-type-icon {
      color: white;
    }

    &:hover .source-type-label {
      color: white;
    }
  }

  .source-type-icon {
    width: 28px;
    height: 28px;
    color: var(--sys-color-primary-main);
    transition: color 0.15s ease;
  }

  .source-type-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--sys-color-text-dark);
    transition: color 0.15s ease;
  }

  /* Fields list */
  .fields-container {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid var(--sys-color-divider-secondary);
    border-radius: var(--sys-shape-0);
    background: var(--sys-color-surface-paper);
    margin-top: 4px;
  }

  .field-item {
    display: flex;
    align-items: center;
    padding: 8px 10px;
    border-bottom: 1px solid var(--sys-color-divider-tertiary);
    gap: 10px;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.03);
    }
  }

  .field-name {
    flex: 1;
    font-size: 12px;
    color: var(--sys-color-text-regular);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .field-alias-input {
    width: 100px;
    flex-shrink: 0;
  }

  /* Display options */
  .display-options-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 4px;
  }

  .display-option {
    display: flex;
    align-items: center;
    gap: 6px;
    
    label {
      font-size: 12px;
      color: var(--sys-color-text-dark);
      cursor: pointer;
    }
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    text-align: center;
    color: var(--sys-color-text-regular);
    font-size: 12px;
    background: var(--sys-color-surface-paper);
    border-radius: var(--sys-shape-1);
    border: 1px dashed var(--sys-color-divider-primary);
  }

  .empty-state svg {
    width: 32px;
    height: 32px;
    color: var(--sys-color-text-light);
    margin-bottom: 8px;
    opacity: 0.7;
  }

  /* Subsection divider */
  .subsection-divider {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--sys-color-text-regular);
    margin: 16px 0 10px 0;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--sys-color-divider-primary);
    opacity: 0.8;
  }

  .subsection-divider:first-child {
    margin-top: 0;
  }

  /* Input row with inline elements */
  .input-row {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
  }

  /* Hint text */
  .hint-text {
    font-size: 11px;
    color: var(--sys-color-text-regular);
    margin-bottom: 12px;
    line-height: 1.5;
    opacity: 0.8;
  }

  /* Data source container */
  .ds-selector-container {
    width: 100%;
    margin-top: 4px;
  }

  /* Status indicator */
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }

  .status-enabled {
    background: #4ade80;
  }

  .status-disabled {
    background: var(--sys-color-text-disabled);
  }

  /* ===== PDF Settings Styles ===== */
  .logo-upload-area {
    border: 2px dashed var(--sys-color-divider-secondary);
    border-radius: var(--sys-shape-1);
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--sys-color-surface-paper);
    
    &:hover {
      border-color: var(--sys-color-primary-main);
      background: rgba(74, 144, 164, 0.05);
    }
  }

  .logo-preview-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 1px solid var(--sys-color-divider-secondary);
    border-radius: var(--sys-shape-1);
    background: var(--sys-color-surface-paper);
  }

  .logo-preview {
    max-width: 150px;
    max-height: 80px;
    object-fit: contain;
    border: 1px solid var(--sys-color-divider-secondary);
    border-radius: var(--sys-shape-0);
    background: white;
    padding: 8px;
  }

  .logo-actions {
    display: flex;
    gap: 8px;
  }

  .color-input-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .color-picker {
    width: 40px;
    height: 28px;
    padding: 0;
    border: 1px solid var(--sys-color-divider-secondary);
    border-radius: var(--sys-shape-0);
    cursor: pointer;
    background: transparent;
  }

  .pdf-section-card {
    background: var(--sys-color-surface-paper);
    border: 1px solid var(--sys-color-divider-secondary);
    border-radius: var(--sys-shape-1);
    padding: 12px;
    margin-bottom: 12px;
  }

  .pdf-section-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--sys-color-text-dark);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pdf-section-title svg {
    opacity: 0.7;
  }

  .textarea-input {
    width: 100%;
    min-height: 60px;
    padding: 8px;
    font-size: 12px;
    border: 1px solid var(--sys-color-divider-secondary);
    border-radius: var(--sys-shape-0);
    resize: vertical;
    font-family: inherit;
  }

  .position-buttons {
    display: flex;
    gap: 4px;
  }

  .position-btn {
    flex: 1;
    padding: 6px 12px;
    font-size: 11px;
    border: 1px solid var(--sys-color-divider-secondary);
    background: var(--sys-color-surface-paper);
    cursor: pointer;
    transition: all 0.15s ease;

    &:first-child {
      border-radius: var(--sys-shape-0) 0 0 var(--sys-shape-0);
    }

    &:last-child {
      border-radius: 0 var(--sys-shape-0) var(--sys-shape-0) 0;
    }

    &.active {
      background: var(--sys-color-primary-main);
      border-color: var(--sys-color-primary-main);
      color: white;
    }

    &:hover:not(.active) {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  /* Import/Export Section Styles */
  .import-export-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .import-export-buttons {
    display: flex;
    gap: 8px;
  }

  .import-export-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border: 1px solid var(--sys-color-primary-main);
    border-radius: var(--sys-shape-1);
    background: var(--sys-color-surface-paper);
    color: var(--sys-color-primary-main);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: var(--sys-color-primary-main);
      color: white;
    }

    &:hover svg {
      color: white;
    }
  }

  .import-export-btn svg {
    width: 16px;
    height: 16px;
    transition: color 0.15s ease;
  }

  .import-export-info {
    font-size: 11px;
    color: var(--sys-color-text-regular);
    line-height: 1.5;
    padding: 10px;
    background: var(--sys-color-surface-background);
    border-radius: var(--sys-shape-0);
    border: 1px solid var(--sys-color-divider-tertiary);
  }

  .import-status {
    padding: 10px;
    border-radius: var(--sys-shape-0);
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .import-status-success {
    background: rgba(74, 222, 128, 0.1);
    border: 1px solid rgba(74, 222, 128, 0.3);
    color: #4ade80;
  }

  .import-status-error {
    background: rgba(248, 113, 113, 0.1);
    border: 1px solid rgba(248, 113, 113, 0.3);
    color: #f87171;
  }

  /* Rich Text Section Styles */
  .content-type-selector {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .content-type-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 12px;
    border: 1px solid var(--sys-color-divider-secondary);
    border-radius: var(--sys-shape-1);
    background: var(--sys-color-surface-paper);
    cursor: pointer;
    transition: all 0.15s ease;
    font-size: 12px;
    color: var(--sys-color-text-dark);

    &:hover {
      border-color: var(--sys-color-primary-main);
      background: rgba(74, 144, 164, 0.05);
    }

    &.active {
      border-color: var(--sys-color-primary-main);
      background: var(--sys-color-primary-main);
      color: white;
    }

    &.active svg {
      color: white;
    }
  }

  .content-type-btn svg {
    width: 16px;
    height: 16px;
    color: var(--sys-color-text-regular);
    transition: color 0.15s ease;
  }

  .rich-text-editor {
    width: 100%;
    min-height: 120px;
    padding: 10px;
    font-size: 12px;
    font-family: monospace;
    border: 1px solid var(--sys-color-divider-secondary);
    border-radius: var(--sys-shape-0);
    resize: vertical;
    line-height: 1.5;
  }

  .rich-text-help {
    font-size: 11px;
    color: var(--sys-color-text-regular);
    margin-top: 6px;
    line-height: 1.5;
    padding: 8px;
    background: var(--sys-color-surface-background);
    border-radius: var(--sys-shape-0);
    border: 1px solid var(--sys-color-divider-tertiary);
  }

  .rich-text-help code {
    background: rgba(0, 0, 0, 0.1);
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 10px;
  }

  .button-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }

  .button-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    border: 1px solid var(--sys-color-divider-tertiary);
    border-radius: var(--sys-shape-0);
    background: var(--sys-color-surface-background);
  }

  .button-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .button-item-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .button-item-row > * {
    flex: 1;
  }

  .button-style-selector {
    display: flex;
    gap: 4px;
  }

  .button-style-btn {
    flex: 1;
    padding: 4px 8px;
    font-size: 10px;
    border: 1px solid var(--sys-color-divider-secondary);
    background: var(--sys-color-surface-paper);
    cursor: pointer;
    transition: all 0.15s ease;

    &:first-child {
      border-radius: var(--sys-shape-0) 0 0 var(--sys-shape-0);
    }

    &:last-child {
      border-radius: 0 var(--sys-shape-0) var(--sys-shape-0) 0;
    }

    &.active {
      background: var(--sys-color-primary-main);
      border-color: var(--sys-color-primary-main);
      color: white;
    }

    &:hover:not(.active) {
      background: rgba(255, 255, 255, 0.1);
    }
  }
`

// Chart color palette - accessible colors
const CHART_COLORS = ['#1A6B7C', '#2E7D32', '#C2410C', '#6B21A8', '#0369A1', '#B91C1C', '#15803D', '#7C3AED']

// SUPPORTED_DS_TYPES moved inside Setting component

interface AvailableField {
    name: string
    alias: string
    type: string
}

type SettingProps = AllWidgetSettingProps<IMConfig> & {
    id: string
    useDataSources?: any
}

const Setting = (props: SettingProps) => {
    const { config, onSettingChange } = props
    // Builder injects these at runtime, but EB 1.21's published setting props
    // do not consistently expose them to every Visual Studio TypeScript host.
    const id = (props as any).id as string
    const useDataSources = (props as any).useDataSources



    // Lazy-load DataSourceSelector to prevent module-load failure if the
    // jimu-ui/advanced/data-source-selector sub-bundle isn't ready at import time
    const [DataSourceSelector, setDataSourceSelector] = useState<any>(null)
    useEffect(() => {
        import('jimu-ui/advanced/data-source-selector').then((mod: any) => {
            setDataSourceSelector(() => mod.DataSourceSelector ?? mod.default?.DataSourceSelector ?? null)
        }).catch(() => { /* DS selector unavailable */ })
    }, [])

    const SUPPORTED_DS_TYPES = Immutable([DataSourceTypes.FeatureLayer])

    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
    const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set())
    const [expandedSearchSources, setExpandedSearchSources] = useState<Set<string>>(new Set())
    const [availableFieldsMap, setAvailableFieldsMap] = useState<Record<string, AvailableField[]>>({})
    const [headerInfoUrlFields, setHeaderInfoUrlFields] = useState<AvailableField[]>([])
    const [loadingHeaderInfoFields, setLoadingHeaderInfoFields] = useState(false)
    const [urlSourceFieldsLoading, setUrlSourceFieldsLoading] = useState<Record<string, boolean>>({})

    // Fetch error and loading states for better user feedback
    const [fetchErrors, setFetchErrors] = useState<Record<string, string>>({})
    const [fetchLoading, setFetchLoading] = useState<Record<string, boolean>>({})

    // Helper to set fetch error with auto-clear after 10 seconds
    const setFetchError = (key: string, message: string) => {
        setFetchErrors(prev => ({ ...prev, [key]: message }))
        setTimeout(() => {
            setFetchErrors(prev => {
                const next = { ...prev }
                delete next[key]
                return next
            })
        }, 10000)
    }

    // Helper to clear fetch error
    const clearFetchError = (key: string) => {
        setFetchErrors(prev => {
            const next = { ...prev }
            delete next[key]
            return next
        })
    }

    // Collapsible settings panels - start with key sections expanded
    const [expandedPanels, setExpandedPanels] = useState<Set<string>>(new Set(['search-sources', 'report-sections']))

    // Logo upload ref
    const logoInputRef = useRef<HTMLInputElement>(null)

    // Font upload refs
    const fontRegularInputRef = useRef<HTMLInputElement>(null)
    const fontBoldInputRef = useRef<HTMLInputElement>(null)

    // Import file ref
    const importInputRef = useRef<HTMLInputElement>(null)

    // Import/Export status
    const [importExportStatus, setImportExportStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    // Toggle settings panel expansion
    const togglePanel = (panelId: string) => {
        setExpandedPanels(prev => {
            const next = new Set(prev)
            if (next.has(panelId)) {
                next.delete(panelId)
            } else {
                next.add(panelId)
            }
            return next
        })
    }

    // ====== IMPORT/EXPORT FUNCTIONS ======

    // Helper to escape XML special characters
    const escapeXml = (str: string): string => {
        if (typeof str !== 'string') return String(str || '')
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
    }

    // Helper to convert a value to XML element
    const valueToXml = (key: string, value: any, indent: string = ''): string => {
        if (value === null || value === undefined) {
            return `${indent}<${key} />\n`
        }

        if (Array.isArray(value) || (value && typeof value.asMutable === 'function')) {
            const arr = typeof value.asMutable === 'function' ? value.asMutable({ deep: true }) : value
            if (arr.length === 0) {
                return `${indent}<${key}></${key}>\n`
            }
            let xml = `${indent}<${key}>\n`
            arr.forEach((item: any, index: number) => {
                xml += valueToXml('item', item, indent + '  ')
            })
            xml += `${indent}</${key}>\n`
            return xml
        }

        if (typeof value === 'object') {
            const obj = typeof value.asMutable === 'function' ? value.asMutable({ deep: true }) : value
            const keys = Object.keys(obj)
            if (keys.length === 0) {
                return `${indent}<${key}></${key}>\n`
            }
            let xml = `${indent}<${key}>\n`
            keys.forEach((k: string) => {
                xml += valueToXml(k, obj[k], indent + '  ')
            })
            xml += `${indent}</${key}>\n`
            return xml
        }

        if (typeof value === 'boolean') {
            return `${indent}<${key}>${value ? 'true' : 'false'}</${key}>\n`
        }

        if (typeof value === 'number') {
            return `${indent}<${key}>${value}</${key}>\n`
        }

        return `${indent}<${key}>${escapeXml(String(value))}</${key}>\n`
    }

    // Export settings to XML
    const exportSettingsToXml = () => {
        try {
            // Get all config except mapWidgetId
            const configToExport: any = {}

            // Copy all config properties except mapWidgetId
            const configObj = typeof (config as any).asMutable === 'function'
                ? (config as any).asMutable({ deep: true })
                : { ...config }

            Object.keys(configObj).forEach((key: string) => {
                if (key !== 'mapWidgetId') {
                    configToExport[key] = configObj[key]
                }
            })

            // Normalize field configs before export: ensure 'name' property (not 'n')
            // This guarantees portable XML that uses consistent <name> tags
            const normalizeExportFields = (fieldArr: any[]): any[] => {
                if (!Array.isArray(fieldArr)) return fieldArr
                return fieldArr.map((f: any) => {
                    if (f && typeof f === 'object' && f.n !== undefined && f.name === undefined) {
                        const { n, ...rest } = f
                        return { name: n, ...rest }
                    }
                    return f
                })
            }

            if (configToExport.sections && Array.isArray(configToExport.sections)) {
                configToExport.sections = configToExport.sections.map((section: any) => {
                    if (section.layers && Array.isArray(section.layers)) {
                        section.layers = section.layers.map((layer: any) => {
                            if (layer.fields) layer.fields = normalizeExportFields(layer.fields)
                            if (layer.relatedTables && Array.isArray(layer.relatedTables)) {
                                layer.relatedTables = layer.relatedTables.map((rt: any) => {
                                    if (rt.fields) rt.fields = normalizeExportFields(rt.fields)
                                    return rt
                                })
                            }
                            return layer
                        })
                    }
                    return section
                })
            }
            if (configToExport.headerInfo?.displayFields) {
                configToExport.headerInfo.displayFields = normalizeExportFields(configToExport.headerInfo.displayFields)
            }

            // Build XML with comprehensive comments
            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
            xml += '<!-- ============================================== -->\n'
            xml += '<!-- Experience Builder Property Report Widget Settings -->\n'
            xml += `<!-- Exported: ${new Date().toISOString()} -->\n`
            xml += '<!-- ============================================== -->\n'
            xml += '<!-- \n'
            xml += '  This file contains all widget settings EXCEPT map connection.\n'
            xml += '  \n'
            xml += '  =====================================================\n'
            xml += '  TOP-LEVEL SETTINGS:\n'
            xml += '  =====================================================\n'
            xml += '  - searchSources (geocoders, layer searches, URL searches)\n'
            xml += '      - sourceId, sourceName, enabled, type\n'
            xml += '      - geocoderUrl, geocoderName\n'
            xml += '      - dataSourceId, useDataSource, searchFields, displayField\n'
            xml += '      - exactMatch, maxSuggestions, url\n'
            xml += '      - highlightEnabled, highlightColor\n'
            xml += '  \n'
            xml += '  - sections (data display configuration)\n'
            xml += '      - sectionId, sectionTitle, expanded\n'
            xml += '      - displayAsTable, displayAsChart, chartField\n'
            xml += '      - displayPane (inline/separate), separatePaneTitle, separatePaneThreshold\n'
            xml += '      - richTextContent, richTextButtons, richTextPosition\n'
            xml += '      - excludeFromPdf, chartExcludeFromPdf, richTextExcludeFromPdf\n'
            xml += '      - chartConfig, tableConfig\n'
            xml += '      - layers[] (see LAYER CONFIG below)\n'
            xml += '  \n'
            xml += '  - headerInfo (parcel info layer for report header)\n'
            xml += '      - enabled, dataSourceId, useDataSource, layerUrl\n'
            xml += '      - displayFields[] (name, alias, visible, format, excludeFromPdf, hideNull)\n'
            xml += '      - geocoderUrl\n'
            xml += '  \n'
            xml += '  - highlightLayer (geometry highlighting on search)\n'
            xml += '      - enabled, dataSourceId, useDataSource, layerUrl\n'
            xml += '      - highlightColor, fillOpacity, outSpatialReference\n'
            xml += '      - geometryOffsetX, geometryOffsetY (datum correction)\n'
            xml += '  \n'
            xml += '  - propertyPreview (feature preview card at top of results)\n'
            xml += '      - enabled, showMapPreview, mapPreviewHeight, mapPreviewZoomLevel\n'
            xml += '      - showBasemap, highlightColor, basemapUrl\n'
            xml += '      - imageField, imageHeight\n'
            xml += '      - showAttributes, attributeLayout (horizontal/vertical/grid)\n'
            xml += '      - primaryFields[], secondaryFields[]\n'
            xml += '      - showZoomButton, showCopyButton\n'
            xml += '      - customActions[] (actionId, label, icon, urlTemplate, openInNewTab)\n'
            xml += '  \n'
            xml += '  - resultsPanelTitle\n'
            xml += '  \n'
            xml += '  =====================================================\n'
            xml += '  LAYER CONFIG OPTIONS (per layer within section):\n'
            xml += '  =====================================================\n'
            xml += '  - layerId, layerTitle\n'
            xml += '  - dataSourceId, useDataSource, layerUrl\n'
            xml += '  - fields[] (name, alias, visible, format, excludeFromPdf, hideNull)\n'
            xml += '  - bufferDistance, bufferUnit\n'
            xml += '  - expanded (default expanded state: true=expanded, false=collapsed)\n'
            xml += '  - displayMode (table/list/card - how to display multiple records)\n'
            xml += '  - defaultSortField, defaultSortOrder (asc/desc)\n'
            xml += '  - enableRowHighlight, enableRowZoom, showAllOnMap\n'
            xml += '  - showAllOnMapColor, rowHighlightColor, rowHighlightFillOpacity, rowZoomScale\n'
            xml += '  - useCustomNoResultsText, customNoResultsText\n'
            xml += '  \n'
            xml += '  - relatedTables[] (related data configuration)\n'
            xml += '      - tableId, tableName, tableUrl\n'
            xml += '      - relationshipType (key/relationshipClass/spatial)\n'
            xml += '      - primaryKeyField, foreignKeyField (for key relationships)\n'
            xml += '      - relationshipId (for relationship class)\n'
            xml += '      - spatialRelationship, spatialBuffer, spatialBufferUnit, useParentGeometry\n'
            xml += '      - fields[] (with excludeFromPdf, hideNull options per field)\n'
            xml += '      - displayMode (table/list/card), maxRecords\n'
            xml += '      - expanded (default expanded state: true=expanded, false=collapsed)\n'
            xml += '      - displayPane (inline/separate), separatePaneTitle\n'
            xml += '      - sortField, sortOrder, enableInteractiveSorting\n'
            xml += '      - defaultSortField, defaultSortOrder\n'
            xml += '      - enableChart, chartConfig\n'
            xml += '      - groupByField, aggregateFields[] (fieldName, aggregation, alias)\n'
            xml += '      - pdfIncludeChart, pdfMaxRecords, pdfExclude, pdfShowTableSummary\n'
            xml += '  \n'
            xml += '  - nearbyConfig (distance-sorted feature display)\n'
            xml += '      - enabled, titleField, subtitleField, subtitleSuffix, subtitlePrefix\n'
            xml += '      - linkUrlField\n'
            xml += '      - maxFeatures, searchRadius, searchRadiusUnit\n'
            xml += '      - distanceUnit, distancePrecision, showDistanceBadge\n'
            xml += '      - sortOrder\n'
            xml += '      - includeInPdf, pdfMaxFeatures\n'
            xml += '  \n'
            xml += '  - layerRichTextContent (HTML content for layer-level info)\n'
            xml += '  - layerRichTextButtons[] (buttonId, label, url, style, openInNewTab)\n'
            xml += '  - layerRichTextPosition (before/after)\n'
            xml += '  - layerRichTextExcludeFromPdf\n'
            xml += '  - hideLayerRichTextWhenNoResults\n'
            xml += '  \n'
            xml += '  =====================================================\n'
            xml += '  PROPERTY PREVIEW (propertyPreview)\n'
            xml += '  =====================================================\n'
            xml += '  - enabled\n'
            xml += '  - showMapPreview, mapPreviewHeight, mapPreviewZoomLevel\n'
            xml += '  - showBasemap, highlightColor, basemapUrl\n'
            xml += '  - imageField, imageHeight\n'
            xml += '  - showAttributes, attributeLayout (horizontal/vertical/grid)\n'
            xml += '  - primaryFields[], secondaryFields[]\n'
            xml += '  - showZoomButton, showCopyButton\n'
            xml += '  - customActions[] (actionId, label, icon, urlTemplate, openInNewTab)\n'
            xml += '  \n'
            xml += '  =====================================================\n'
            xml += '  PDF EXPORT SETTINGS\n'
            xml += '  =====================================================\n'
            xml += '  - pdfTitle, pdfIncludeTables, pdfIncludeCharts\n'
            xml += '  - pdfIncludeRelatedTables, pdfIncludeRelatedTableCharts\n'
            xml += '  \n'
            xml += '  - pdfHeader (header configuration)\n'
            xml += '      - logoBase64, logoFileName, logoWidth, logoHeight (legacy)\n'
            xml += '      - logo (enhanced logo configuration):\n'
            xml += '          base64, fileName, originalWidth, originalHeight,\n'
            xml += '          sizeMode (auto/fit/stretch/custom), customWidth, customHeight,\n'
            xml += '          maxWidth, maxHeight, position (left/center/right),\n'
            xml += '          verticalAlign (top/middle/bottom), shape (default/circle/rounded),\n'
            xml += '          borderRadius, backgroundColor, padding, altText\n'
            xml += '      - headerHeight, organizationName\n'
            xml += '      - showTitle, titleFontSize, titleMode (default/custom)\n'
            xml += '      - reportTitle, subtitleText\n'
            xml += '      - headerTextColor, headerColor\n'
            xml += '      - includeMap, mapHeight, mapScaleMode, mapScale, mapFitPadding\n'
            xml += '      - showGeneratedDate\n'
            xml += '      - titlePosition, datePosition, headerLayout\n'
            xml += '  \n'
            xml += '  - pdfFooter (footer configuration)\n'
            xml += '      - enabled, showPageNumbers, pageNumberFormat, pageNumberPosition\n'
            xml += '      - disclaimerText, disclaimerFontSize\n'
            xml += '      - contactText, contactPosition\n'
            xml += '      - footerHeight, footerColor, footerTextColor, showTopBorder\n'
            xml += '  \n'
            xml += '  - pdfStyle (styling and layout)\n'
            xml += '      - primaryColor, sectionHeaderColor, sectionHeaderTextColor\n'
            xml += '      - alternateRowColor, borderColor, linkColor\n'
            xml += '      - fontFamily (helvetica/times/courier/Noto Sans/Roboto/etc/custom)\n'
            xml += '      - customFont (name, regularBase64, boldBase64)\n'
            xml += '      - dataLayout (table/two-column/cards/auto), twoColumnGap\n'
            xml += '      - showSectionBorders, compactMode\n'
            xml += '      - tableHeaderBgColor, tableHeaderTextColor, tableHeaderFontSize\n'
            xml += '      - layerTitleBgColor, layerTitleTextColor\n'
            xml += '      - tableHeaderHeight, tableDataFontSize, tableDataTextColor\n'
            xml += '      - tableRowHeight, tableShowBorders, tableBorderColor\n'
            xml += '      - tableStripedRows, tableMaxColumns, tableMaxRows, tableCellPadding\n'
            xml += '      - showAccessibilityText, showTableSummaries, showRelatedTableSummaries\n'
            xml += '      - showFullUrlsInPdf\n'
            xml += '      - enablePdfBookmarks, enableHierarchicalBookmarks\n'
            xml += '      - showSectionNumbers, showGeneratedTimestamp\n'
            xml += '      - accessibilityContact, highContrastMode, largeTextMode\n'
            xml += '      - enableTableOfContents, tocTitle, tocIncludeLayers\n'
            xml += '      - tocIncludeRelatedTables, tocPageBreakAfter\n'
            xml += '      - relatedTableHeaderColor, relatedTableIndent\n'
            xml += '      - relatedTableMaxRows, includeRelatedTableCharts\n'
            xml += '  \n'
            xml += '  - pdfAccessibility (WCAG 2.1 compliance)\n'
            xml += '      - documentLanguage (130+ language codes supported)\n'
            xml += '      - documentAuthor, documentCreator\n'
            xml += '      - includeMapAltText, includeLogoAltText\n'
            xml += '      - mapAltTextTemplate, logoAltTextTemplate, chartAltTextTemplate\n'
            xml += '      - includeTableSummaries, tableSummaryTemplate\n'
            xml += '      - includeRelatedTableSummaries, relatedTableSummaryTemplate\n'
            xml += '      - minimumFontSize, includeReadingOrderMarkers\n'
            xml += '      - tocTitle\n'
            xml += '  \n'
            xml += '  =====================================================\n'
            xml += '  DEFAULT CONFIGURATIONS\n'
            xml += '  =====================================================\n'
            xml += '  - defaultChartConfig (global chart settings)\n'
            xml += '      - chartType (bar/pie/donut/area/line/radialBar/composite)\n'
            xml += '      - chartMode (category/fields)\n'
            xml += '      - categoryField, valueField, aggregation (count/sum/avg/min/max)\n'
            xml += '      - compareFields[] (fieldName, alias, color, enabled)\n'
            xml += '      - groupByField, valueFields[]\n'
            xml += '      - showLegend, legendPosition (top/bottom/left/right)\n'
            xml += '      - showValues, showGrid, animate, stacked\n'
            xml += '      - curveType (linear/natural/monotone/step)\n'
            xml += '      - colorScheme[], height\n'
            xml += '      - xAxisLabel, yAxisLabel\n'
            xml += '      - maxCategories, sortBy (value/label/none), sortOrder (asc/desc)\n'
            xml += '      - chartDescription, chartDescriptionPosition (before/after)\n'
            xml += '  \n'
            xml += '  - defaultTableConfig (global table settings)\n'
            xml += '      - enableSorting, enableFiltering, enablePagination\n'
            xml += '      - pageSize, pageSizeOptions[], stickyHeader\n'
            xml += '      - stripedRows, highlightOnHover, compactMode\n'
            xml += '      - showRowNumbers, resizableColumns\n'
            xml += '  \n'
            xml += '  =====================================================\n'
            xml += '  PERFORMANCE SETTINGS\n'
            xml += '  =====================================================\n'
            xml += '  - enableClientSideQuery (use LayerView for faster queries)\n'
            xml += '  \n'
            xml += '  =====================================================\n'
            xml += '  SEARCH & DISPLAY SETTINGS\n'
            xml += '  =====================================================\n'
            xml += '  - combinedMaxSuggestions, showSourceLabels\n'
            xml += '  - coordinateSystem (map/wgs84/webmercator/custom)\n'
            xml += '  - customCoordinateWkid (EPSG/WKID code)\n'
            xml += '  - customCoordinateLabel (display label)\n'
            xml += '  - coordinateFormat (decimal/dms)\n'
            xml += '  - coordinatePrecision, showCoordinates\n'
            xml += '  - enableUseCurrentLocation (GPS location button)\n'
            xml += '  \n'
            xml += '  =====================================================\n'
            xml += '  FIELD FORMAT OPTIONS (per field)\n'
            xml += '  =====================================================\n'
            xml += '  - type (auto/number/date/text/link)\n'
            xml += '  - numberFormat (default/none/currency/percent/decimal)\n'
            xml += '  - decimalPlaces, useGrouping\n'
            xml += '  - dateFormat (default/short/medium/long/year-only)\n'
            xml += '  - textFormat (default/uppercase/lowercase/titlecase)\n'
            xml += '  - prefix, suffix, linkText\n'
            xml += '  - useLinkBaseUrl, linkBaseUrl (prepend base URL to field value for links)\n'
            xml += '  - excludeFromPdf, hideNull\n'
            xml += '  \n'
            xml += '  =====================================================\n'
            xml += '  RICH TEXT CONFIGURATION (per section)\n'
            xml += '  =====================================================\n'
            xml += '  - richTextContent (HTML)\n'
            xml += '  - richTextButtons[] (buttonId, label, url, style, openInNewTab)\n'
            xml += '  - richTextPosition (before/after)\n'
            xml += '  - richTextExcludeFromPdf\n'
            xml += '  \n'
            xml += '  NOTE: Data source connections (useDataSource) are exported but may need\n'
            xml += '  to be reconfigured after import if data sources have different IDs.\n'
            xml += '  Layers configured with direct URLs (layerUrl) will work without changes.\n'
            xml += '  \n'
            xml += '  To import: Use the Import button in widget settings.\n'
            xml += '  Map widget connection must be configured separately.\n'
            xml += '-->\n'
            xml += '<WidgetSettings version="2.2">\n'

            Object.keys(configToExport).forEach((key: string) => {
                xml += valueToXml(key, configToExport[key], '  ')
            })

            xml += '</WidgetSettings>\n'

            // Download the file
            const blob = new Blob([xml], { type: 'application/xml' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `property-report-settings-${new Date().toISOString().split('T')[0]}.xml`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            setImportExportStatus({ type: 'success', message: 'Settings exported successfully!' })
            setTimeout(() => setImportExportStatus(null), 3000)

        } catch (error) {
            console.error('Error exporting settings:', error)
            setImportExportStatus({ type: 'error', message: 'Failed to export settings.' })
            setTimeout(() => setImportExportStatus(null), 5000)
        }
    }

    // Parse XML element to value
    const parseXmlElement = (element: Element, parentKey?: string): any => {
        const children = Array.from(element.children)
        const tagName = element.tagName

        // Comprehensive list of keys that should always remain strings (IDs, names, URLs, colors, etc.)
        // This prevents numeric-looking strings like "2945-144-01-012" from being parsed as numbers
        // Updated for version 1.9 - includes all config.ts string fields
        const stringOnlyKeys = new Set([
            // IDs and identifiers (string-based IDs only)
            'sectionId', 'layerId', 'sourceId', 'buttonId', 'dataSourceId', 'tableId', 'actionId',
            'mapWidgetId',

            // Names and titles
            'name', 'alias', 'layerTitle', 'sectionTitle', 'sourceName', 'tableName',
            'organizationName', 'geocoderName', 'label', 'linkText',
            'reportTitle', 'subtitleText', 'pdfTitle', 'resultsPanelTitle',
            'tocTitle', 'separatePaneTitle', 'paneTitle',

            // URLs and file references
            'url', 'layerUrl', 'geocoderUrl', 'tableUrl', 'basemapUrl', 'urlTemplate', 'linkBaseUrl',
            'base64', 'logoBase64', 'regularBase64', 'boldBase64',
            'fileName', 'logoFileName', 'linkUrlField',

            // Field references (field names that could look like numbers)
            'displayField', 'chartField', 'categoryField', 'valueField', 'groupByField',
            'sortField', 'defaultSortField', 'primaryKeyField', 'foreignKeyField',
            'imageField', 'fieldName', 'xAxisLabel', 'yAxisLabel',
            'titleField', 'subtitleField', 'subtitleSuffix', 'subtitlePrefix',

            // Colors (hex values that could be parsed incorrectly)
            'primaryColor', 'sectionHeaderColor', 'sectionHeaderTextColor', 'alternateRowColor',
            'borderColor', 'linkColor', 'headerColor', 'headerTextColor', 'footerColor', 'footerTextColor',
            'tableHeaderBgColor', 'tableHeaderTextColor', 'tableDataTextColor', 'tableBorderColor',
            'layerTitleBgColor', 'layerTitleTextColor',
            'highlightColor', 'backgroundColor', 'color', 'rowHighlightColor', 'showAllOnMapColor',
            'relatedTableHeaderColor',

            // Text content (could contain any characters)
            'richTextContent', 'disclaimerText', 'contactText', 'chartDescription',
            'altText', 'accessibilityContact', 'prefix', 'suffix', 'customNoResultsText',

            // PDF Accessibility text/template fields
            'documentLanguage', 'documentAuthor', 'documentCreator',
            'mapAltTextTemplate', 'logoAltTextTemplate', 'chartAltTextTemplate',
            'tableSummaryTemplate', 'relatedTableSummaryTemplate',

            // Enum/type strings (must stay as strings, not parsed as other types)
            'type', 'numberFormat', 'dateFormat', 'textFormat',
            'coordinateSystem', 'coordinateFormat', 'customCoordinateLabel', 'dataLayout', 'bufferUnit', 'spatialBufferUnit',
            'titleMode', 'sizeMode', 'position', 'verticalAlign', 'shape',
            'legendPosition', 'pageNumberPosition', 'contactPosition', 'titlePosition', 'datePosition',
            'richTextPosition', 'headerLayout', 'pageNumberFormat', 'chartType', 'chartMode',
            'style', 'curveType', 'sortBy', 'sortOrder', 'defaultSortOrder',
            'relationshipType', 'spatialRelationship', 'displayMode', 'aggregation',
            'chartDescriptionPosition', 'attributeLayout', 'icon', 'fontFamily',
            'displayPane', 'searchRadiusUnit', 'distanceUnit',

            // Custom font name
            'customFontName',

            // v1.2.0 additions: report summary template, permalink param, and section alert fields
            'reportSummaryTemplate', 'permalinkParam',
            'alertId', 'field', 'operator', 'severity', 'message'
        ])

        // Arrays whose items should always be strings (NOT number arrays like pageSizeOptions)
        const stringArrayKeys = new Set([
            'searchFields', 'colorScheme',
            'primaryFields', 'secondaryFields', 'valueFields',
            'compareFields'  // Chart compare fields array
        ])

        // No children - return text content or null
        if (children.length === 0) {
            const text = element.textContent?.trim() || ''
            if (text === '') return null

            // If this key should always be a string, return as string
            if (stringOnlyKeys.has(tagName)) {
                return text
            }

            // If this is an item in a string array, return as string
            if (tagName === 'item' && parentKey && stringArrayKeys.has(parentKey)) {
                return text
            }

            if (text === 'true') return true
            if (text === 'false') return false
            // Only parse as number if it's purely numeric (and not an ID-like field)
            if (/^-?\d+(\.\d+)?$/.test(text)) return parseFloat(text)
            return text
        }

        // Check if all children are 'item' elements (array)
        const allItems = children.every(child => child.tagName === 'item')
        if (allItems && children.length > 0) {
            return children.map(child => parseXmlElement(child, tagName))
        }

        // Object with named properties
        const obj: any = {}
        children.forEach(child => {
            const key = child.tagName
            obj[key] = parseXmlElement(child, key)
        })
        return obj
    }

    // Import settings from XML
    const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Reset input to allow importing the same file again
        event.target.value = ''

        if (!file.name.endsWith('.xml')) {
            setImportExportStatus({ type: 'error', message: 'Please select an XML file.' })
            setTimeout(() => setImportExportStatus(null), 5000)
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const xmlText = e.target?.result as string
                const parser = new DOMParser()
                const xmlDoc = parser.parseFromString(xmlText, 'application/xml')

                // Check for parse errors
                const parseError = xmlDoc.querySelector('parsererror')
                if (parseError) {
                    throw new Error('Invalid XML file format')
                }

                const root = xmlDoc.documentElement
                if (root.tagName !== 'WidgetSettings') {
                    throw new Error('Invalid settings file format - missing WidgetSettings root element')
                }

                // Get version for compatibility handling
                const version = root.getAttribute('version') || '1.0'
                console.log(`Importing settings from version ${version}`)

                // Parse all settings from XML
                const importedSettings: any = {}
                let importedCount = 0

                Array.from(root.children).forEach(child => {
                    const key = child.tagName
                    // Skip mapWidgetId if somehow present
                    if (key !== 'mapWidgetId') {
                        importedSettings[key] = parseXmlElement(child, key)
                        importedCount++
                    }
                })

                console.log(`Parsed ${importedCount} top-level settings:`, Object.keys(importedSettings))

                // Normalize field configs: XML may use <n> for field names but runtime expects 'name'
                // This handles both exported XML (which serializes config keys as-is) and hand-edited XML
                const normalizeFieldConfig = (field: any): any => {
                    if (!field || typeof field !== 'object') return field
                    // If field has 'n' but not 'name', rename 'n' to 'name'
                    if (field.n !== undefined && field.name === undefined) {
                        const { n, ...rest } = field
                        return { name: n, ...rest }
                    }
                    return field
                }

                const normalizeFieldsInSettings = (settings: any): any => {
                    if (!settings) return settings

                    // Normalize sections → layers → fields
                    if (settings.sections && Array.isArray(settings.sections)) {
                        settings.sections = settings.sections.map((section: any) => {
                            if (section.layers && Array.isArray(section.layers)) {
                                section.layers = section.layers.map((layer: any) => {
                                    // Normalize layer fields
                                    if (layer.fields && Array.isArray(layer.fields)) {
                                        layer.fields = layer.fields.map(normalizeFieldConfig)
                                    }
                                    // Normalize related table fields
                                    if (layer.relatedTables && Array.isArray(layer.relatedTables)) {
                                        layer.relatedTables = layer.relatedTables.map((rt: any) => {
                                            if (rt.fields && Array.isArray(rt.fields)) {
                                                rt.fields = rt.fields.map(normalizeFieldConfig)
                                            }
                                            return rt
                                        })
                                    }
                                    return layer
                                })
                            }
                            return section
                        })
                    }

                    // Normalize headerInfo → displayFields
                    if (settings.headerInfo?.displayFields && Array.isArray(settings.headerInfo.displayFields)) {
                        settings.headerInfo.displayFields = settings.headerInfo.displayFields.map(normalizeFieldConfig)
                    }

                    return settings
                }

                normalizeFieldsInSettings(importedSettings)

                // Preserve the current mapWidgetId
                const currentMapWidgetId = config.mapWidgetId

                // Apply imported settings
                let newConfig = config
                Object.keys(importedSettings).forEach((key: string) => {
                    newConfig = newConfig.set(key, importedSettings[key])
                })

                // Ensure mapWidgetId is preserved
                newConfig = newConfig.set('mapWidgetId', currentMapWidgetId)

                onSettingChange({ id, config: newConfig })

                // Build success message with details
                const details: string[] = []
                if (importedSettings.searchSources?.length) details.push(`${importedSettings.searchSources.length} search sources`)
                if (importedSettings.sections?.length) {
                    let layerCount = 0
                    let relatedTableCount = 0
                    let nearbyCount = 0
                    let pdfExcludedCount = 0
                    let chartCount = 0
                    let richTextCount = 0
                    importedSettings.sections.forEach((s: any) => {
                        if (s.excludeFromPdf) pdfExcludedCount++
                        if (s.chartConfig || s.displayAsChart) chartCount++
                        if (s.richTextContent) richTextCount++
                        if (s.layers?.length) {
                            layerCount += s.layers.length
                            s.layers.forEach((l: any) => {
                                if (l.relatedTables?.length) relatedTableCount += l.relatedTables.length
                                if (l.nearbyConfig?.enabled) nearbyCount++
                            })
                        }
                    })
                    details.push(`${importedSettings.sections.length} sections`)
                    if (layerCount > 0) details.push(`${layerCount} layers`)
                    if (relatedTableCount > 0) details.push(`${relatedTableCount} related tables`)
                    if (nearbyCount > 0) details.push(`${nearbyCount} nearby configs`)
                    if (chartCount > 0) details.push(`${chartCount} charts`)
                    if (richTextCount > 0) details.push(`${richTextCount} rich text blocks`)
                    if (pdfExcludedCount > 0) details.push(`${pdfExcludedCount} PDF-excluded sections`)
                }
                if (importedSettings.headerInfo?.enabled) details.push('header info')
                if (importedSettings.highlightLayer?.enabled) details.push('highlight layer')
                if (importedSettings.propertyPreview?.enabled) {
                    const previewDetails: string[] = []
                    if (importedSettings.propertyPreview.showMapPreview) previewDetails.push('map')
                    if (importedSettings.propertyPreview.customActions?.length) previewDetails.push(`${importedSettings.propertyPreview.customActions.length} actions`)
                    details.push(`property preview${previewDetails.length ? ' (' + previewDetails.join(', ') + ')' : ''}`)
                }
                if (importedSettings.pdfHeader) {
                    const headerDetails: string[] = []
                    if (importedSettings.pdfHeader.logo?.base64 || importedSettings.pdfHeader.logoBase64) headerDetails.push('logo')
                    if (importedSettings.pdfHeader.includeMap !== false) headerDetails.push('map')
                    details.push(`PDF header${headerDetails.length ? ' (' + headerDetails.join(', ') + ')' : ''}`)
                }
                if (importedSettings.pdfFooter?.enabled !== false) details.push('PDF footer')
                if (importedSettings.pdfStyle) {
                    const styleDetails: string[] = []
                    if (importedSettings.pdfStyle.fontFamily && importedSettings.pdfStyle.fontFamily !== 'helvetica') styleDetails.push(importedSettings.pdfStyle.fontFamily)
                    if (importedSettings.pdfStyle.enableTableOfContents) styleDetails.push('TOC')
                    if (importedSettings.pdfStyle.enablePdfBookmarks !== false) styleDetails.push('bookmarks')
                    details.push(`PDF styles${styleDetails.length ? ' (' + styleDetails.join(', ') + ')' : ''}`)
                }
                if (importedSettings.pdfAccessibility) details.push('PDF accessibility')
                if (importedSettings.pdfIncludeRelatedTables) details.push('related tables in PDF')
                if (importedSettings.pdfIncludeRelatedTableCharts) details.push('related charts in PDF')
                if (importedSettings.defaultChartConfig) details.push('chart defaults')
                if (importedSettings.defaultTableConfig) details.push('table defaults')
                if (importedSettings.coordinateSystem || importedSettings.coordinateFormat || importedSettings.showCoordinates !== undefined || importedSettings.enableUseCurrentLocation !== undefined) details.push('coordinate settings')
                if (importedSettings.combinedMaxSuggestions || importedSettings.showSourceLabels !== undefined) details.push('search settings')
                if (importedSettings.enableClientSideQuery !== undefined) details.push('performance settings')
                if (importedSettings.resultsPanelTitle) details.push('panel title')

                const detailStr = details.length > 0 ? ` (${details.join(', ')})` : ''
                setImportExportStatus({ type: 'success', message: `Settings imported successfully from v${version}!${detailStr}` })
                setTimeout(() => setImportExportStatus(null), 5000)

            } catch (error) {
                console.error('Error importing settings:', error)
                setImportExportStatus({
                    type: 'error',
                    message: `Failed to import settings: ${error instanceof Error ? error.message : 'Unknown error'}`
                })
                setTimeout(() => setImportExportStatus(null), 5000)
            }
        }

        reader.onerror = () => {
            setImportExportStatus({ type: 'error', message: 'Failed to read file.' })
            setTimeout(() => setImportExportStatus(null), 5000)
        }

        reader.readAsText(file)
    }

    // Fetch fields when header info URL changes
    useEffect(() => {
        const fetchHeaderInfoFields = async () => {
            const layerUrl = (config.headerInfo as any)?.layerUrl
            const errorKey = 'header-info'

            if (!layerUrl || (config.headerInfo as any)?.dataSourceId) {
                setHeaderInfoUrlFields([])
                clearFetchError(errorKey)
                return
            }

            setLoadingHeaderInfoFields(true)
            clearFetchError(errorKey)

            try {
                const response = await fetch(`${layerUrl}?f=json`)

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        throw new Error(`Authentication required (${response.status}). Use "Select data" for secured services.`)
                    } else if (response.status === 404) {
                        throw new Error(`Service not found (404). Check the URL is correct.`)
                    } else {
                        throw new Error(`HTTP error ${response.status}: ${response.statusText}`)
                    }
                }

                const data = await response.json()

                if (data.error) {
                    throw new Error(data.error.message || `Service error: ${data.error.code}`)
                }

                if (data.fields && data.fields.length > 0) {
                    const fields: AvailableField[] = data.fields.map((f: any) => ({
                        name: f.name,
                        alias: f.alias || f.name,
                        type: f.type || 'unknown'
                    }))
                    setHeaderInfoUrlFields(fields)
                } else {
                    throw new Error('No fields returned. This may not be a feature layer endpoint.')
                }
            } catch (e) {
                const message = e instanceof Error ? e.message : 'Failed to fetch fields. Check URL and network.'
                console.error('Failed to fetch header info layer fields:', e)
                setHeaderInfoUrlFields([])
                setFetchError(errorKey, message)
            }
            setLoadingHeaderInfoFields(false)
        }

        fetchHeaderInfoFields()
    }, [(config.headerInfo as any)?.layerUrl, (config.headerInfo as any)?.dataSourceId])

    // Load fields for existing layer data sources on mount
    useEffect(() => {
        const loadExistingLayerFields = async () => {
            // Inline conversion to avoid reference issues
            const sections = config.sections
                ? (typeof (config.sections as any).asMutable === 'function'
                    ? (config.sections as any).asMutable({ deep: true })
                    : [...config.sections])
                : []

            const dataSourceIds = new Set<string>()
            const layerUrls = new Set<string>()

            // Track related tables separately with their tableId
            const relatedTableDataSources: { tableId: string, dataSourceId: string }[] = []
            const relatedTableUrls: { tableId: string, url: string }[] = []

            // Collect all unique data source IDs and layer URLs from all layers AND related tables
            sections.forEach((section: any) => {
                const layers = section.layers
                    ? (typeof section.layers.asMutable === 'function'
                        ? section.layers.asMutable({ deep: true })
                        : [...section.layers])
                    : []
                layers.forEach((layer: any) => {
                    if (layer.dataSourceId) {
                        dataSourceIds.add(layer.dataSourceId)
                    }
                    if (layer.layerUrl && !layer.dataSourceId) {
                        layerUrls.add(layer.layerUrl)
                    }

                    // Also collect related table data sources and URLs
                    const relatedTables = layer.relatedTables
                        ? (typeof layer.relatedTables.asMutable === 'function'
                            ? layer.relatedTables.asMutable({ deep: true })
                            : [...layer.relatedTables])
                        : []
                    relatedTables.forEach((relTable: any) => {
                        if (relTable.dataSourceId) {
                            relatedTableDataSources.push({ tableId: relTable.tableId, dataSourceId: relTable.dataSourceId })
                        }
                        if (relTable.tableUrl && !relTable.dataSourceId) {
                            relatedTableUrls.push({ tableId: relTable.tableId, url: relTable.tableUrl })
                        }
                    })
                })
            })

            // Fetch fields for each data source (regular layers)
            for (const dsId of dataSourceIds) {
                if (availableFieldsMap[dsId]) continue // Skip if already loaded
                try {
                    const ds = DataSourceManager.getInstance().getDataSource(dsId)
                    if (ds) {
                        await ds.ready()
                        const schema = ds.getSchema()
                        if (schema?.fields) {
                            const fields: AvailableField[] = Object.entries(schema.fields).map(([key, field]: [string, any]) => ({
                                name: field.jimuName || field.name || key,
                                alias: field.alias || field.jimuName || field.name || key,
                                type: field.esriType || field.type || 'unknown'
                            }))
                            setAvailableFieldsMap(prev => ({
                                ...prev,
                                [dsId]: fields
                            }))
                        }
                    }
                } catch (err) {
                    console.error('Error loading fields for data source:', dsId, err)
                }
            }

            // Fetch fields for each REST URL (regular layers)
            for (const url of layerUrls) {
                const urlKey = `url:${url}`
                if (availableFieldsMap[urlKey]) continue // Skip if already loaded
                try {
                    const response = await fetch(`${url}?f=json`)
                    const data = await response.json()
                    if (data.fields) {
                        const fields: AvailableField[] = data.fields.map((f: any) => ({
                            name: f.name,
                            alias: f.alias || f.name,
                            type: f.type || 'unknown'
                        }))
                        setAvailableFieldsMap(prev => ({
                            ...prev,
                            [urlKey]: fields
                        }))
                    }
                } catch (err) {
                    console.error('Error loading fields from URL:', url, err)
                }
            }

            // Fetch fields for related table data sources
            for (const { tableId, dataSourceId } of relatedTableDataSources) {
                const mapKey = `related-table:${tableId}`
                if (availableFieldsMap[mapKey]) continue // Skip if already loaded
                try {
                    const ds = DataSourceManager.getInstance().getDataSource(dataSourceId)
                    if (ds) {
                        await ds.ready()
                        const schema = ds.getSchema()
                        if (schema?.fields) {
                            const fields: AvailableField[] = Object.entries(schema.fields).map(([key, field]: [string, any]) => ({
                                name: field.jimuName || field.name || key,
                                alias: field.alias || field.jimuName || field.name || key,
                                type: field.esriType || field.type || 'unknown'
                            }))
                            setAvailableFieldsMap(prev => ({
                                ...prev,
                                [mapKey]: fields
                            }))
                        }
                    }
                } catch (err) {
                    console.error('Error loading fields for related table data source:', dataSourceId, err)
                }
            }

            // Fetch fields for related table URLs
            for (const { tableId, url } of relatedTableUrls) {
                const mapKey = `related-table:${tableId}`
                if (availableFieldsMap[mapKey]) continue // Skip if already loaded
                try {
                    const response = await fetch(`${url}?f=json`)
                    const data = await response.json()
                    if (data.fields) {
                        const fields: AvailableField[] = data.fields.map((f: any) => ({
                            name: f.name,
                            alias: f.alias || f.name,
                            type: f.type || 'unknown'
                        }))
                        setAvailableFieldsMap(prev => ({
                            ...prev,
                            [mapKey]: fields
                        }))
                    }
                } catch (err) {
                    console.error('Error loading fields from related table URL:', url, err)
                }
            }
        }

        loadExistingLayerFields()
    }, [config.sections]) // Re-run when sections change

    // Fetch fields when a layer URL changes
    const fetchFieldsFromUrl = async (layerUrl: string) => {
        if (!layerUrl) return
        const urlKey = `url:${layerUrl}`
        const errorKey = `layer:${layerUrl}`

        if (availableFieldsMap[urlKey]) return // Already loaded
        if (fetchLoading[errorKey]) return // Already loading

        clearFetchError(errorKey)
        setFetchLoading(prev => ({ ...prev, [errorKey]: true }))

        try {
            const response = await fetch(`${layerUrl}?f=json`)

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error(`Authentication required (${response.status}). Use "Select data" for secured services.`)
                } else if (response.status === 404) {
                    throw new Error(`Service not found (404). Check the URL is correct.`)
                } else {
                    throw new Error(`HTTP error ${response.status}: ${response.statusText}`)
                }
            }

            const data = await response.json()

            if (data.error) {
                throw new Error(data.error.message || `Service error: ${data.error.code}`)
            }

            if (data.fields && data.fields.length > 0) {
                const fields: AvailableField[] = data.fields.map((f: any) => ({
                    name: f.name,
                    alias: f.alias || f.name,
                    type: f.type || 'unknown'
                }))
                setAvailableFieldsMap(prev => ({
                    ...prev,
                    [urlKey]: fields
                }))
            } else {
                throw new Error('No fields returned. This may not be a feature layer endpoint.')
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch fields. Check URL and network.'
            console.error('Error fetching fields from URL:', layerUrl, err)
            setFetchError(errorKey, message)
        } finally {
            setFetchLoading(prev => ({ ...prev, [errorKey]: false }))
        }
    }

    // Fetch fields from URL for search sources
    const fetchSearchSourceUrlFields = async (sourceId: string, url: string) => {
        if (!url) return
        const urlKey = `search-url:${sourceId}`
        const errorKey = `search:${sourceId}`

        // Don't refetch if already loading
        if (urlSourceFieldsLoading[sourceId]) return

        clearFetchError(errorKey)
        setUrlSourceFieldsLoading(prev => ({ ...prev, [sourceId]: true }))

        try {
            const response = await fetch(`${url}?f=json`)

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error(`Authentication required (${response.status}). Use "Select data" for secured services.`)
                } else if (response.status === 404) {
                    throw new Error(`Service not found (404). Check the URL is correct.`)
                } else {
                    throw new Error(`HTTP error ${response.status}: ${response.statusText}`)
                }
            }

            const data = await response.json()

            if (data.error) {
                throw new Error(data.error.message || `Service error: ${data.error.code}`)
            }

            if (data.fields && data.fields.length > 0) {
                const fields: AvailableField[] = data.fields.map((f: any) => ({
                    name: f.name,
                    alias: f.alias || f.name,
                    type: f.type || 'unknown'
                }))
                setAvailableFieldsMap(prev => ({
                    ...prev,
                    [urlKey]: fields
                }))
            } else {
                throw new Error('No fields returned. This may not be a feature layer endpoint.')
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch fields. Check URL and network.'
            console.error('Error fetching fields from search source URL:', url, err)
            setFetchError(errorKey, message)
        } finally {
            setUrlSourceFieldsLoading(prev => ({ ...prev, [sourceId]: false }))
        }
    }

    // Helper to get fields for a search source URL
    const getSearchSourceUrlFields = (sourceId: string): AvailableField[] => {
        return availableFieldsMap[`search-url:${sourceId}`] || []
    }

    // Helper to get fields for a layer (from data source or URL)
    const getLayerFields = (layer: LayerConfig): AvailableField[] => {
        if (layer.dataSourceId) {
            return availableFieldsMap[layer.dataSourceId] || []
        }
        if (layer.layerUrl) {
            return availableFieldsMap[`url:${layer.layerUrl}`] || []
        }
        return []
    }

    // Helper functions for Immutable conversion
    const toMutableSections = (sections: any): SectionConfig[] => {
        if (!sections) return []
        if (typeof sections.asMutable === 'function') {
            return sections.asMutable({ deep: true })
        }
        return [...sections]
    }

    const toMutableLayers = (layers: any): LayerConfig[] => {
        if (!layers) return []
        if (typeof layers.asMutable === 'function') {
            return layers.asMutable({ deep: true })
        }
        // Deep copy to ensure nested objects are mutable
        return layers.map((l: any) => {
            if (typeof l.asMutable === 'function') {
                return l.asMutable({ deep: true })
            }
            return { ...l }
        })
    }

    const toMutableFields = (fields: any): FieldConfig[] => {
        if (!fields) return []
        let result: any[]
        if (typeof fields.asMutable === 'function') {
            result = fields.asMutable({ deep: true })
        } else {
            // Deep copy to ensure nested objects like format are mutable
            result = fields.map((f: any) => {
                if (typeof f.asMutable === 'function') {
                    return f.asMutable({ deep: true })
                }
                // Manual deep copy for plain objects
                return {
                    ...f,
                    format: f.format ? { ...f.format } : undefined
                }
            })
        }
        // Normalize: XML import may store field name as 'n' instead of 'name'
        return result.map((f: any) => {
            if (f.n !== undefined && f.name === undefined) {
                const { n, ...rest } = f
                return { name: n, ...rest }
            }
            return f
        })
    }

    const toMutableSearchSources = (sources: any): SearchSourceConfig[] => {
        if (!sources) return []
        if (typeof sources.asMutable === 'function') {
            return sources.asMutable({ deep: true })
        }
        return [...sources]
    }

    const toMutableStringArray = (arr: any): string[] => {
        if (!arr) return []
        if (typeof arr.asMutable === 'function') {
            return arr.asMutable({ deep: true })
        }
        return [...arr]
    }

    const toMutableRichTextButtons = (buttons: any): RichTextButton[] => {
        if (!buttons) return []
        if (typeof buttons.asMutable === 'function') {
            return buttons.asMutable({ deep: true })
        }
        return [...buttons]
    }

    // Update config helper
    const updateConfig = (key: string, value: any) => {
        onSettingChange({
            id,
            config: config.set(key, value)
        })
    }

    // Update nested PDF header config
    const updatePdfHeader = (updates: Partial<PdfHeaderConfig>) => {
        const current = (config.pdfHeader || {}) as any
        updateConfig('pdfHeader', { ...current, ...updates })
    }

    // Update nested PDF footer config
    const updatePdfFooter = (updates: Partial<PdfFooterConfig>) => {
        const current = (config.pdfFooter || {}) as any
        updateConfig('pdfFooter', { ...current, ...updates })
    }

    // Update nested PDF style config
    const updatePdfStyle = (updates: Partial<PdfStyleConfig>) => {
        const current = (config.pdfStyle || {}) as any
        updateConfig('pdfStyle', { ...current, ...updates })
    }

    // Update PDF accessibility config
    const updatePdfAccessibility = (updates: Partial<PdfAccessibilityConfig>) => {
        const current = (config.pdfAccessibility || {}) as any
        updateConfig('pdfAccessibility', { ...current, ...updates })
    }

    // Update nested logo config
    const updateLogo = (updates: Partial<PdfLogoConfig>) => {
        const currentHeader = (config.pdfHeader || {}) as PdfHeaderConfig
        const currentLogo = (currentHeader.logo || {}) as PdfLogoConfig
        updatePdfHeader({ logo: { ...currentLogo, ...updates } })
    }

    // Update default chart config
    const updateDefaultChartConfig = (updates: Partial<ChartConfig>) => {
        const current = (config.defaultChartConfig || {}) as any
        updateConfig('defaultChartConfig', { ...current, ...updates })
    }

    // Update default table config
    const updateDefaultTableConfig = (updates: Partial<TableDisplayConfig>) => {
        const current = (config.defaultTableConfig || {}) as any
        updateConfig('defaultTableConfig', { ...current, ...updates })
    }

    // Handle logo file upload with dimension detection
    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (PNG, JPG, GIF, SVG)')
            return
        }

        // Validate file size (max 1MB for better quality logos)
        if (file.size > 1024 * 1024) {
            alert('Image file size must be less than 1MB')
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const base64 = e.target?.result as string

            // Create image to get dimensions
            const img = new Image()
            img.onload = () => {
                const imgWidth = img.naturalWidth || img.width
                const imgHeight = img.naturalHeight || img.height

                console.log('Logo uploaded - dimensions:', imgWidth, 'x', imgHeight)

                // Update with new logo config structure (includes pixel dimensions)
                updateLogo({
                    base64,
                    fileName: file.name,
                    originalWidth: imgWidth,  // Pixel dimensions for aspect ratio
                    originalHeight: imgHeight,
                    sizeMode: 'auto',
                    maxWidth: 50,
                    maxHeight: 25
                })

                // Also update legacy properties (base64 only, not pixel dimensions)
                updatePdfHeader({
                    logoBase64: base64,
                    logoFileName: file.name
                })
            }
            img.onerror = () => {
                console.error('Failed to load image for dimension detection')
                // Still save the image, but without dimensions
                updateLogo({
                    base64,
                    fileName: file.name,
                    sizeMode: 'auto',
                    maxWidth: 50,
                    maxHeight: 25
                })
                updatePdfHeader({
                    logoBase64: base64,
                    logoFileName: file.name
                })
            }
            img.src = base64
        }
        reader.readAsDataURL(file)
    }

    // Remove logo
    const removeLogo = () => {
        updatePdfHeader({
            logoBase64: undefined,
            logoFileName: undefined,
            logoWidth: undefined,
            logoHeight: undefined,
            logo: undefined
        })
    }

    // Handle custom font upload (TTF files only)
    const handleFontUpload = (event: React.ChangeEvent<HTMLInputElement>, weight: 'regular' | 'bold') => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file type - must be TTF
        if (!file.name.toLowerCase().endsWith('.ttf')) {
            alert('Please select a TTF font file (.ttf)')
            return
        }

        // Validate file size (max 2MB per font)
        if (file.size > 2 * 1024 * 1024) {
            alert('Font file size must be less than 2MB')
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer
            // Convert to base64
            const base64 = btoa(
                new Uint8Array(arrayBuffer)
                    .reduce((data, byte) => data + String.fromCharCode(byte), '')
            )

            // Extract font name from filename (remove extension and weight indicators)
            let fontName = file.name.replace(/\.ttf$/i, '')
                .replace(/[-_](regular|bold|normal|medium|light|thin|black|heavy)/gi, '')
                .replace(/[-_]/g, ' ')
                .trim()

            // Capitalize first letter of each word
            fontName = fontName.split(' ').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ')

            const currentCustomFont = pdfStyle.customFont || { name: fontName }

            if (weight === 'regular') {
                updatePdfStyle({
                    fontFamily: 'custom',
                    customFont: {
                        ...currentCustomFont,
                        name: currentCustomFont.name || fontName,
                        regularBase64: base64
                    }
                })
            } else {
                updatePdfStyle({
                    customFont: {
                        ...currentCustomFont,
                        boldBase64: base64
                    }
                })
            }
        }
        reader.readAsArrayBuffer(file)

        // Reset input so same file can be re-selected
        event.target.value = ''
    }

    // Remove custom font
    const removeCustomFont = () => {
        updatePdfStyle({
            fontFamily: 'helvetica',
            customFont: undefined
        })
    }

    // Toggle expansion handlers
    const toggleSectionExpand = (sectionId: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev)
            next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId)
            return next
        })
    }

    const toggleLayerExpand = (layerId: string) => {
        setExpandedLayers(prev => {
            const next = new Set(prev)
            next.has(layerId) ? next.delete(layerId) : next.add(layerId)
            return next
        })
    }

    const toggleSearchSourceExpand = (sourceId: string) => {
        setExpandedSearchSources(prev => {
            const next = new Set(prev)
            next.has(sourceId) ? next.delete(sourceId) : next.add(sourceId)
            return next
        })
    }

    // ====== SEARCH SOURCE MANAGEMENT ======
    const addSearchSource = (type: 'geocoder' | 'layer' | 'url') => {
        const sources = toMutableSearchSources(config.searchSources)
        const newSource = {
            sourceId: `source-${Date.now()}`,
            sourceName: type === 'geocoder' ? 'Geocoder' : type === 'url' ? 'REST Service' : 'Layer Search',
            enabled: true,
            type,
            geocoderUrl: type === 'geocoder' ? 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer' : undefined,
            geocoderName: type === 'geocoder' ? 'World Geocoder' : undefined,
            url: type === 'url' ? '' : undefined,
            maxSuggestions: 6
        } as any
        sources.push(newSource)
        updateConfig('searchSources', sources)
        setExpandedSearchSources(prev => new Set([...prev, newSource.sourceId]))
    }

    const removeSearchSource = (sourceId: string) => {
        const sources = toMutableSearchSources(config.searchSources)
        updateConfig('searchSources', sources.filter(s => s.sourceId !== sourceId))
    }

    const updateSearchSource = (sourceId: string, updates: Partial<SearchSourceConfig>) => {
        const sources = toMutableSearchSources(config.searchSources)
        const index = sources.findIndex(s => s.sourceId === sourceId)
        if (index !== -1) {
            sources[index] = { ...sources[index], ...updates }
            updateConfig('searchSources', sources)
        }
    }

    const toggleSearchSourceEnabled = (sourceId: string) => {
        const sources = toMutableSearchSources(config.searchSources)
        const index = sources.findIndex(s => s.sourceId === sourceId)
        if (index !== -1) {
            sources[index].enabled = !sources[index].enabled
            updateConfig('searchSources', sources)
        }
    }

    // ====== SECTION MANAGEMENT ======
    const addSection = () => {
        const sections = toMutableSections(config.sections)
        const newSection: SectionConfig = {
            sectionId: `section-${Date.now()}`,
            sectionTitle: `Section ${sections.length + 1}`,
            layers: [],
            displayAsTable: true,
            displayAsChart: false
        }
        sections.push(newSection)
        updateConfig('sections', sections)
        setExpandedSections(prev => new Set([...prev, newSection.sectionId]))
    }

    const removeSection = (sectionId: string) => {
        const sections = toMutableSections(config.sections)
        updateConfig('sections', sections.filter(s => s.sectionId !== sectionId))
    }

    const updateSection = (sectionId: string, updates: Partial<SectionConfig>) => {
        const sections = toMutableSections(config.sections)
        const index = sections.findIndex(s => s.sectionId === sectionId)
        if (index !== -1) {
            sections[index] = { ...sections[index], ...updates }
            updateConfig('sections', sections)
        }
    }

    // Rich Text Button Management
    const addRichTextButton = (sectionId: string) => {
        const sections = toMutableSections(config.sections)
        const index = sections.findIndex(s => s.sectionId === sectionId)
        if (index !== -1) {
            const buttons = toMutableRichTextButtons(sections[index].richTextButtons || [])
            buttons.push({
                buttonId: `btn-${Date.now()}`,
                label: 'New Button',
                url: 'https://',
                style: 'default',
                openInNewTab: true
            })
            sections[index].richTextButtons = buttons
            updateConfig('sections', sections)
        }
    }

    const removeRichTextButton = (sectionId: string, buttonId: string) => {
        const sections = toMutableSections(config.sections)
        const index = sections.findIndex(s => s.sectionId === sectionId)
        if (index !== -1) {
            const buttons = toMutableRichTextButtons(sections[index].richTextButtons || [])
            sections[index].richTextButtons = buttons.filter(b => b.buttonId !== buttonId)
            updateConfig('sections', sections)
        }
    }

    const updateRichTextButton = (sectionId: string, buttonId: string, updates: Partial<RichTextButton>) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex !== -1) {
            const buttons = toMutableRichTextButtons(sections[sectionIndex].richTextButtons || [])
            const buttonIndex = buttons.findIndex(b => b.buttonId === buttonId)
            if (buttonIndex !== -1) {
                buttons[buttonIndex] = { ...buttons[buttonIndex], ...updates }
                sections[sectionIndex].richTextButtons = buttons
                updateConfig('sections', sections)
            }
        }
    }

    // Layer-Level Rich Text Button Management
    const addLayerRichTextButton = (sectionId: string, layerId: string) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex !== -1) {
            const layers = toMutableLayers(sections[sectionIndex].layers)
            const layerIndex = layers.findIndex(l => l.layerId === layerId)
            if (layerIndex !== -1) {
                const buttons = toMutableRichTextButtons(layers[layerIndex].layerRichTextButtons || [])
                buttons.push({
                    buttonId: `lbtn-${Date.now()}`,
                    label: 'New Button',
                    url: 'https://',
                    style: 'default',
                    openInNewTab: true
                })
                layers[layerIndex].layerRichTextButtons = buttons
                sections[sectionIndex].layers = layers
                updateConfig('sections', sections)
            }
        }
    }

    const removeLayerRichTextButton = (sectionId: string, layerId: string, buttonId: string) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex !== -1) {
            const layers = toMutableLayers(sections[sectionIndex].layers)
            const layerIndex = layers.findIndex(l => l.layerId === layerId)
            if (layerIndex !== -1) {
                const buttons = toMutableRichTextButtons(layers[layerIndex].layerRichTextButtons || [])
                layers[layerIndex].layerRichTextButtons = buttons.filter(b => b.buttonId !== buttonId)
                sections[sectionIndex].layers = layers
                updateConfig('sections', sections)
            }
        }
    }

    const updateLayerRichTextButton = (sectionId: string, layerId: string, buttonId: string, updates: Partial<RichTextButton>) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex !== -1) {
            const layers = toMutableLayers(sections[sectionIndex].layers)
            const layerIndex = layers.findIndex(l => l.layerId === layerId)
            if (layerIndex !== -1) {
                const buttons = toMutableRichTextButtons(layers[layerIndex].layerRichTextButtons || [])
                const buttonIndex = buttons.findIndex(b => b.buttonId === buttonId)
                if (buttonIndex !== -1) {
                    buttons[buttonIndex] = { ...buttons[buttonIndex], ...updates }
                    layers[layerIndex].layerRichTextButtons = buttons
                    sections[sectionIndex].layers = layers
                    updateConfig('sections', sections)
                }
            }
        }
    }

    const moveSection = (sectionId: string, direction: 'up' | 'down') => {
        const sections = toMutableSections(config.sections)
        const index = sections.findIndex(s => s.sectionId === sectionId)
        if (index === -1) return

        const newIndex = direction === 'up' ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= sections.length) return

        // Swap sections
        const temp = sections[index]
        sections[index] = sections[newIndex]
        sections[newIndex] = temp

        updateConfig('sections', sections)
    }

    // ====== LAYER MANAGEMENT ======
    const addLayerToSection = (sectionId: string) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex !== -1) {
            const layers = toMutableLayers(sections[sectionIndex].layers)
            const newLayer = {
                layerId: `layer-${Date.now()}`,
                layerTitle: `Layer ${layers.length + 1}`,
                dataSourceId: '',
                layerUrl: '',
                fields: [],
                bufferDistance: 0,
                bufferUnit: 'feet'
            } as any
            layers.push(newLayer)
            sections[sectionIndex].layers = layers
            updateConfig('sections', sections)
            setExpandedLayers(prev => new Set([...prev, newLayer.layerId]))
        }
    }

    const removeLayerFromSection = (sectionId: string, layerId: string) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex !== -1) {
            const layers = toMutableLayers(sections[sectionIndex].layers)
            sections[sectionIndex].layers = layers.filter(l => l.layerId !== layerId)
            updateConfig('sections', sections)
        }
    }

    const updateLayer = (sectionId: string, layerId: string, updates: Partial<LayerConfig>) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex !== -1) {
            const layers = toMutableLayers(sections[sectionIndex].layers)
            const layerIndex = layers.findIndex(l => l.layerId === layerId)
            if (layerIndex !== -1) {
                layers[layerIndex] = { ...layers[layerIndex], ...updates }
                sections[sectionIndex].layers = layers
                updateConfig('sections', sections)
            }
        }
    }

    // ====== RELATED TABLE MANAGEMENT ======
    const addRelatedTable = (sectionId: string, layerId: string) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex !== -1) {
            const layers = toMutableLayers(sections[sectionIndex].layers)
            const layerIndex = layers.findIndex(l => l.layerId === layerId)
            if (layerIndex !== -1) {
                const relatedTables = layers[layerIndex].relatedTables ? [...layers[layerIndex].relatedTables!] : []
                relatedTables.push({
                    tableId: `rt-${Date.now()}`,
                    tableName: `Related Table ${relatedTables.length + 1}`,
                    tableUrl: '',
                    relationshipType: 'key',
                    primaryKeyField: '',
                    foreignKeyField: '',
                    fields: [],
                    displayMode: 'table',
                    maxRecords: 50
                })
                layers[layerIndex].relatedTables = relatedTables
                sections[sectionIndex].layers = layers
                updateConfig('sections', sections)
            }
        }
    }

    const removeRelatedTable = (sectionId: string, layerId: string, tableId: string) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex !== -1) {
            const layers = toMutableLayers(sections[sectionIndex].layers)
            const layerIndex = layers.findIndex(l => l.layerId === layerId)
            if (layerIndex !== -1 && layers[layerIndex].relatedTables) {
                layers[layerIndex].relatedTables = layers[layerIndex].relatedTables!.filter(rt => rt.tableId !== tableId)
                sections[sectionIndex].layers = layers
                updateConfig('sections', sections)
            }
        }
    }

    const updateRelatedTable = (sectionId: string, layerId: string, tableId: string, updates: Partial<RelatedTableConfig>) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex !== -1) {
            const layers = toMutableLayers(sections[sectionIndex].layers)
            const layerIndex = layers.findIndex(l => l.layerId === layerId)
            if (layerIndex !== -1 && layers[layerIndex].relatedTables) {
                const relatedTables = [...layers[layerIndex].relatedTables!]
                const rtIndex = relatedTables.findIndex(rt => rt.tableId === tableId)
                if (rtIndex !== -1) {
                    relatedTables[rtIndex] = { ...relatedTables[rtIndex], ...updates }
                    layers[layerIndex].relatedTables = relatedTables
                    sections[sectionIndex].layers = layers
                    updateConfig('sections', sections)
                }
            }
        }
    }

    // Fetch fields from a related table URL
    const fetchRelatedTableFields = async (tableId: string, url: string) => {
        if (!url) return
        const urlKey = `related-table:${tableId}`
        const errorKey = `related-table:${tableId}`

        if (availableFieldsMap[urlKey]) return // Already loaded
        if (fetchLoading[errorKey]) return // Already loading

        clearFetchError(errorKey)
        setFetchLoading(prev => ({ ...prev, [errorKey]: true }))

        try {
            const response = await fetch(`${url}?f=json`)

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error(`Authentication required (${response.status}). Use "Select data" for secured services.`)
                } else if (response.status === 404) {
                    throw new Error(`Service not found (404). Check the URL is correct.`)
                } else {
                    throw new Error(`HTTP error ${response.status}: ${response.statusText}`)
                }
            }

            const data = await response.json()

            if (data.error) {
                throw new Error(data.error.message || `Service error: ${data.error.code}`)
            }

            if (data.fields && data.fields.length > 0) {
                const fields: AvailableField[] = data.fields.map((f: any) => ({
                    name: f.name,
                    alias: f.alias || f.name,
                    type: f.type || 'unknown'
                }))
                setAvailableFieldsMap(prev => ({
                    ...prev,
                    [urlKey]: fields
                }))
            } else {
                throw new Error('No fields returned. This may not be a feature layer/table endpoint.')
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch fields. Check URL and network.'
            console.error('Error fetching related table fields:', url, err)
            setFetchError(errorKey, message)
        } finally {
            setFetchLoading(prev => ({ ...prev, [errorKey]: false }))
        }
    }

    // Get fields for a related table
    const getRelatedTableFields = (tableId: string): AvailableField[] => {
        return availableFieldsMap[`related-table:${tableId}`] || []
    }

    // Get UseDataSources for a related table (for DataSourceSelector)
    const getRelatedTableUseDataSources = (relTable: RelatedTableConfig): ImmutableArray<UseDataSource> => {
        if (relTable.useDataSource) {
            const ds = typeof (relTable.useDataSource as any).asMutable === 'function'
                ? (relTable.useDataSource as any).asMutable({ deep: true })
                : relTable.useDataSource
            return Immutable([ds])
        }
        return Immutable([])
    }

    // Handle related table data source change
    const handleRelatedTableDataSourceChange = async (sectionId: string, layerId: string, tableId: string, useDataSourcesArr: any) => {
        const dsArr = useDataSourcesArr as UseDataSource[]
        const errorKey = `related-table:${tableId}`

        if (dsArr && dsArr.length > 0) {
            const selectedDs = dsArr[0]
            let tableUrl = ''

            clearFetchError(errorKey)
            setFetchLoading(prev => ({ ...prev, [errorKey]: true }))

            try {
                const ds = DataSourceManager.getInstance().getDataSource(selectedDs.dataSourceId)
                if (ds) {
                    await ds.ready()

                    // Get the layer URL from the datasource
                    const dsJson = (ds as any).getDataSourceJson?.()
                    tableUrl = dsJson?.url || (ds as any).url || ''

                    // If still no URL, try to get from the underlying layer
                    if (!tableUrl) {
                        const layer = (ds as any).layer || (ds as any).getLayerDefinition?.()
                        tableUrl = layer?.url || ''
                    }

                    const schema = ds.getSchema()
                    if (schema?.fields && Object.keys(schema.fields).length > 0) {
                        const fields: AvailableField[] = Object.entries(schema.fields).map(([key, field]: [string, any]) => ({
                            name: field.jimuName || field.name || key,
                            alias: field.alias || field.jimuName || field.name || key,
                            type: field.esriType || field.type || 'unknown'
                        }))
                        setAvailableFieldsMap(prev => ({
                            ...prev,
                            [`related-table:${tableId}`]: fields
                        }))
                    } else {
                        setFetchError(errorKey, 'No fields found in data source schema. The layer may still be loading.')
                    }
                } else {
                    setFetchError(errorKey, 'Could not access data source. Try refreshing the page.')
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load fields from data source.'
                console.error('Error fetching related table fields from data source:', err)
                setFetchError(errorKey, message)
            } finally {
                setFetchLoading(prev => ({ ...prev, [errorKey]: false }))
            }

            updateRelatedTable(sectionId, layerId, tableId, {
                dataSourceId: selectedDs.dataSourceId,
                useDataSource: selectedDs,
                tableUrl: tableUrl
            } as any)

            // Register the data source with the widget
            const currentUseDataSources = useDataSources ? [...useDataSources] : []
            if (!currentUseDataSources.find(ds => ds.dataSourceId === selectedDs.dataSourceId)) {
                currentUseDataSources.push(selectedDs)
                onSettingChange({ id, useDataSources: currentUseDataSources })
            }
        } else {
            clearFetchError(errorKey)
            updateRelatedTable(sectionId, layerId, tableId, {
                dataSourceId: '',
                useDataSource: null,
                tableUrl: '',
                fields: []
            } as any)
        }
    }

    // Toggle field selection for a related table
    const toggleRelatedTableFieldSelection = (sectionId: string, layerId: string, tableId: string, fieldName: string) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex === -1) return

        const layers = toMutableLayers(sections[sectionIndex].layers)
        const layerIndex = layers.findIndex(l => l.layerId === layerId)
        if (layerIndex === -1 || !layers[layerIndex].relatedTables) return

        const relatedTables = [...layers[layerIndex].relatedTables!]
        const rtIndex = relatedTables.findIndex(rt => rt.tableId === tableId)
        if (rtIndex === -1) return

        const currentFields = relatedTables[rtIndex].fields || []
        const existingIndex = currentFields.findIndex(f => f.name === fieldName)

        if (existingIndex !== -1) {
            // Remove field
            relatedTables[rtIndex].fields = currentFields.filter(f => f.name !== fieldName)
        } else {
            // Add field with defaults
            const availableFields = getRelatedTableFields(tableId)
            const fieldInfo = availableFields.find(f => f.name === fieldName)
            relatedTables[rtIndex].fields = [
                ...currentFields,
                {
                    name: fieldName,
                    alias: fieldInfo?.alias || fieldName,
                    visible: true,
                    format: undefined
                }
            ]
        }

        layers[layerIndex].relatedTables = relatedTables
        sections[sectionIndex].layers = layers
        updateConfig('sections', sections)
    }

    // Update field alias for a related table
    const updateRelatedTableFieldAlias = (sectionId: string, layerId: string, tableId: string, fieldName: string, alias: string) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex === -1) return

        const layers = toMutableLayers(sections[sectionIndex].layers)
        const layerIndex = layers.findIndex(l => l.layerId === layerId)
        if (layerIndex === -1 || !layers[layerIndex].relatedTables) return

        const relatedTables = [...layers[layerIndex].relatedTables!]
        const rtIndex = relatedTables.findIndex(rt => rt.tableId === tableId)
        if (rtIndex === -1) return

        const fields = [...(relatedTables[rtIndex].fields || [])]
        const fieldIndex = fields.findIndex(f => f.name === fieldName)
        if (fieldIndex !== -1) {
            fields[fieldIndex] = { ...fields[fieldIndex], alias }
            relatedTables[rtIndex].fields = fields
            layers[layerIndex].relatedTables = relatedTables
            sections[sectionIndex].layers = layers
            updateConfig('sections', sections)
        }
    }

    // Update field format for a related table
    const updateRelatedTableFieldFormat = (sectionId: string, layerId: string, tableId: string, fieldName: string, formatUpdates: Partial<FieldFormatConfig>) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex === -1) return

        const layers = toMutableLayers(sections[sectionIndex].layers)
        const layerIndex = layers.findIndex(l => l.layerId === layerId)
        if (layerIndex === -1 || !layers[layerIndex].relatedTables) return

        const relatedTables = [...layers[layerIndex].relatedTables!]
        const rtIndex = relatedTables.findIndex(rt => rt.tableId === tableId)
        if (rtIndex === -1) return

        const fields = [...(relatedTables[rtIndex].fields || [])]
        const fieldIndex = fields.findIndex(f => f.name === fieldName)
        if (fieldIndex !== -1) {
            const currentFormat = fields[fieldIndex].format || {}
            fields[fieldIndex] = {
                ...fields[fieldIndex],
                format: { ...currentFormat, ...formatUpdates }
            }
            relatedTables[rtIndex].fields = fields
            layers[layerIndex].relatedTables = relatedTables
            sections[sectionIndex].layers = layers
            updateConfig('sections', sections)
        }
    }

    // Get field alias for a related table field
    const getRelatedTableFieldAlias = (relatedTable: RelatedTableConfig, fieldName: string): string => {
        const field = relatedTable.fields?.find(f => f.name === fieldName)
        return field?.alias || fieldName
    }

    // Get field format for a related table field
    const getRelatedTableFieldFormat = (relatedTable: RelatedTableConfig, fieldName: string): FieldFormatConfig => {
        const field = relatedTable.fields?.find(f => f.name === fieldName)
        return field?.format || {}
    }

    // Toggle related table field hideNull
    const toggleRelatedTableFieldHideNull = (sectionId: string, layerId: string, tableId: string, fieldName: string) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex === -1) return

        const layers = toMutableLayers(sections[sectionIndex].layers)
        const layerIndex = layers.findIndex(l => l.layerId === layerId)
        if (layerIndex === -1 || !layers[layerIndex].relatedTables) return

        const relatedTables = [...layers[layerIndex].relatedTables!]
        const rtIndex = relatedTables.findIndex(rt => rt.tableId === tableId)
        if (rtIndex === -1) return

        const fields = [...(relatedTables[rtIndex].fields || [])]
        const fieldIndex = fields.findIndex(f => f.name === fieldName)
        if (fieldIndex !== -1) {
            fields[fieldIndex] = { ...fields[fieldIndex], hideNull: !fields[fieldIndex].hideNull }
            relatedTables[rtIndex].fields = fields
            layers[layerIndex].relatedTables = relatedTables
            sections[sectionIndex].layers = layers
            updateConfig('sections', sections)
        }
    }

    // Get related table field hideNull setting
    const getRelatedTableFieldHideNull = (relatedTable: RelatedTableConfig, fieldName: string): boolean => {
        const field = relatedTable.fields?.find(f => f.name === fieldName)
        return field?.hideNull || false
    }


    // Handle data source change for a layer
    const handleDataSourceChange = async (sectionId: string, layerId: string, useDataSourcesArr: any) => {
        const dsArr = useDataSourcesArr as UseDataSource[]
        const errorKey = `layer-ds:${layerId}`

        if (dsArr && dsArr.length > 0) {
            const selectedDs = dsArr[0]
            let layerUrl = ''

            clearFetchError(errorKey)
            setFetchLoading(prev => ({ ...prev, [errorKey]: true }))

            try {
                const ds = DataSourceManager.getInstance().getDataSource(selectedDs.dataSourceId)
                if (ds) {
                    await ds.ready()

                    // Get the layer URL from the datasource
                    const dsJson = (ds as any).getDataSourceJson?.()
                    layerUrl = dsJson?.url || (ds as any).url || ''

                    // If still no URL, try to get from the underlying layer
                    if (!layerUrl) {
                        const layer = (ds as any).layer || (ds as any).getLayerDefinition?.()
                        layerUrl = layer?.url || ''
                    }

                    const schema = ds.getSchema()
                    if (schema?.fields && Object.keys(schema.fields).length > 0) {
                        const fields: AvailableField[] = Object.entries(schema.fields).map(([key, field]: [string, any]) => ({
                            name: field.jimuName || field.name || key,
                            alias: field.alias || field.jimuName || field.name || key,
                            type: field.esriType || field.type || 'unknown'
                        }))
                        setAvailableFieldsMap(prev => ({
                            ...prev,
                            [selectedDs.dataSourceId]: fields
                        }))
                    } else {
                        setFetchError(errorKey, 'No fields found in data source schema. The layer may still be loading.')
                    }
                } else {
                    setFetchError(errorKey, 'Could not access data source. Try refreshing the page.')
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load fields from data source.'
                console.error('Error fetching fields:', err)
                setFetchError(errorKey, message)
            } finally {
                setFetchLoading(prev => ({ ...prev, [errorKey]: false }))
            }

            updateLayer(sectionId, layerId, {
                dataSourceId: selectedDs.dataSourceId,
                useDataSource: selectedDs,
                layerTitle: selectedDs.dataSourceId,
                layerUrl: layerUrl,
                fields: []
            } as any)

            const currentUseDataSources = useDataSources ? [...useDataSources] : []
            if (!currentUseDataSources.find(ds => ds.dataSourceId === selectedDs.dataSourceId)) {
                currentUseDataSources.push(selectedDs)
                onSettingChange({ id, useDataSources: currentUseDataSources })
            }
        } else {
            clearFetchError(errorKey)
            updateLayer(sectionId, layerId, {
                dataSourceId: '',
                useDataSource: null,
                layerUrl: '',
                fields: []
            } as any)
        }
    }

    // Handle search source data source change
    const handleSearchSourceDataSourceChange = async (sourceId: string, useDataSourcesArr: any) => {
        const dsArr = useDataSourcesArr as UseDataSource[]
        const errorKey = `search:${sourceId}`

        if (dsArr && dsArr.length > 0) {
            const selectedDs = dsArr[0]

            clearFetchError(errorKey)
            setFetchLoading(prev => ({ ...prev, [errorKey]: true }))

            try {
                const ds = DataSourceManager.getInstance().getDataSource(selectedDs.dataSourceId)
                if (ds) {
                    await ds.ready()
                    const schema = ds.getSchema()
                    if (schema?.fields && Object.keys(schema.fields).length > 0) {
                        const fields: AvailableField[] = Object.entries(schema.fields).map(([key, field]: [string, any]) => ({
                            name: field.jimuName || field.name || key,
                            alias: field.alias || field.jimuName || field.name || key,
                            type: field.esriType || field.type || 'unknown'
                        }))
                        setAvailableFieldsMap(prev => ({
                            ...prev,
                            [`search-${selectedDs.dataSourceId}`]: fields
                        }))
                    } else {
                        setFetchError(errorKey, 'No fields found in data source schema. The layer may still be loading.')
                    }
                } else {
                    setFetchError(errorKey, 'Could not access data source. Try refreshing the page.')
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load fields from data source.'
                console.error('Error fetching search layer fields:', err)
                setFetchError(errorKey, message)
            } finally {
                setFetchLoading(prev => ({ ...prev, [errorKey]: false }))
            }

            updateSearchSource(sourceId, {
                dataSourceId: selectedDs.dataSourceId,
                useDataSource: selectedDs,
                sourceName: selectedDs.dataSourceId,
                searchFields: [],
                displayField: ''
            })

            const currentUseDataSources = useDataSources ? [...useDataSources] : []
            if (!currentUseDataSources.find(ds => ds.dataSourceId === selectedDs.dataSourceId)) {
                currentUseDataSources.push(selectedDs)
                onSettingChange({ id, useDataSources: currentUseDataSources })
            }
        } else {
            clearFetchError(errorKey)
            updateSearchSource(sourceId, {
                dataSourceId: '',
                useDataSource: null,
                searchFields: [],
                displayField: ''
            })
        }
    }

    // Toggle field selection for a layer
    const toggleFieldSelection = (sectionId: string, layerId: string, fieldName: string) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex === -1) return

        const layers = toMutableLayers(sections[sectionIndex].layers)
        const layerIndex = layers.findIndex(l => l.layerId === layerId)
        if (layerIndex === -1) return

        const layer = layers[layerIndex]
        const fields = toMutableFields(layer.fields)
        // Handle both 'name' and legacy 'n' property from XML import
        const getFieldName = (f: any): string => f.name || f.n || ''
        const fieldIndex = fields.findIndex(f => getFieldName(f) === fieldName)

        if (fieldIndex !== -1) {
            fields.splice(fieldIndex, 1)
        } else {
            // Get the service field order to insert at the correct position
            const serviceFields = getLayerFields(layer)
            const availableField = serviceFields.find(f => f.name === fieldName)

            const newField: FieldConfig = {
                name: fieldName,
                alias: availableField?.alias || fieldName,
                visible: true
            }

            // Find the correct insertion index to maintain service field order
            const serviceIndex = serviceFields.findIndex(f => f.name === fieldName)
            if (serviceIndex === -1 || fields.length === 0) {
                fields.push(newField)
            } else {
                // Find the position among already-selected fields that preserves service order
                let insertAt = fields.length // Default: append
                for (let i = 0; i < fields.length; i++) {
                    const existingServiceIndex = serviceFields.findIndex(f => f.name === getFieldName(fields[i]))
                    if (existingServiceIndex > serviceIndex) {
                        insertAt = i
                        break
                    }
                }
                fields.splice(insertAt, 0, newField)
            }
        }

        layers[layerIndex].fields = fields
        sections[sectionIndex].layers = layers
        updateConfig('sections', sections)
    }

    // Reorder selected fields to match the service/data source field order
    const reorderFieldsToServiceOrder = (sectionId: string, layerId: string) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex === -1) return

        const layers = toMutableLayers(sections[sectionIndex].layers)
        const layerIndex = layers.findIndex(l => l.layerId === layerId)
        if (layerIndex === -1) return

        const layer = layers[layerIndex]
        const fields = toMutableFields(layer.fields)
        const serviceFields = getLayerFields(layer)

        if (serviceFields.length === 0 || fields.length === 0) return

        // Handle both 'name' and legacy 'n' property
        const getFieldName = (f: any): string => f.name || f.n || ''

        // Also normalize n → name while reordering
        const normalizedFields = fields.map((f: any) => {
            if (f.n !== undefined && f.name === undefined) {
                const { n, ...rest } = f
                return { name: n, ...rest }
            }
            return f
        })

        // Sort by position in service field list
        normalizedFields.sort((a: any, b: any) => {
            const aIdx = serviceFields.findIndex(sf => sf.name === getFieldName(a))
            const bIdx = serviceFields.findIndex(sf => sf.name === getFieldName(b))
            // Fields not found in service go to end
            return (aIdx === -1 ? 9999 : aIdx) - (bIdx === -1 ? 9999 : bIdx)
        })

        layers[layerIndex].fields = normalizedFields
        sections[sectionIndex].layers = layers
        updateConfig('sections', sections)
    }

    // Move a field up or down in display order
    const moveFieldOrder = (sectionId: string, layerId: string, fieldName: string, direction: 'up' | 'down') => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex === -1) return

        const layers = toMutableLayers(sections[sectionIndex].layers)
        const layerIndex = layers.findIndex(l => l.layerId === layerId)
        if (layerIndex === -1) return

        const layer = layers[layerIndex]
        const fields = toMutableFields(layer.fields)
        const idx = fields.findIndex(f => f.name === fieldName)
        if (idx === -1) return

        const swapIdx = direction === 'up' ? idx - 1 : idx + 1
        if (swapIdx < 0 || swapIdx >= fields.length) return

        // Swap
        const temp = fields[idx]
        fields[idx] = fields[swapIdx]
        fields[swapIdx] = temp

        layers[layerIndex].fields = fields
        sections[sectionIndex].layers = layers
        updateConfig('sections', sections)
    }

    // Move a selected field to immediately before another field (drag-and-drop reorder)
    const moveFieldBefore = (sectionId: string, layerId: string, fromName: string, beforeName: string) => {
        if (fromName === beforeName) return
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex === -1) return

        const layers = toMutableLayers(sections[sectionIndex].layers)
        const layerIndex = layers.findIndex(l => l.layerId === layerId)
        if (layerIndex === -1) return

        const fields = toMutableFields(layers[layerIndex].fields)
        const fromIdx = fields.findIndex(f => f.name === fromName)
        if (fromIdx === -1) return

        const [moved] = fields.splice(fromIdx, 1)
        const beforeIdx = fields.findIndex(f => f.name === beforeName)
        if (beforeIdx === -1) {
            fields.push(moved)
        } else {
            fields.splice(beforeIdx, 0, moved)
        }

        layers[layerIndex].fields = fields
        sections[sectionIndex].layers = layers
        updateConfig('sections', sections)
    }

    // ---- Section alert helpers ----
    const getSectionAlerts = (section: any): any[] => {
        const raw = section?.alerts
        if (!raw) return []
        return (raw as any).asMutable ? (raw as any).asMutable({ deep: true }) : [...raw]
    }
    const writeSectionAlerts = (section: any, alerts: any[]) => {
        updateSection(section.sectionId, { alerts } as any)
    }
    const addSectionAlert = (section: any) => {
        const alerts = getSectionAlerts(section)
        alerts.push({ alertId: `alert_${Date.now()}`, field: '', operator: 'equals', value: '', message: '', severity: 'warning' })
        writeSectionAlerts(section, alerts)
    }
    const updateSectionAlert = (section: any, index: number, patch: any) => {
        const alerts = getSectionAlerts(section)
        if (!alerts[index]) return
        alerts[index] = { ...alerts[index], ...patch }
        writeSectionAlerts(section, alerts)
    }
    const removeSectionAlert = (section: any, index: number) => {
        const alerts = getSectionAlerts(section)
        alerts.splice(index, 1)
        writeSectionAlerts(section, alerts)
    }

    // Update field alias
    const updateFieldAlias = (sectionId: string, layerId: string, fieldName: string, newAlias: string) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex === -1) return

        const layers = toMutableLayers(sections[sectionIndex].layers)
        const layerIndex = layers.findIndex(l => l.layerId === layerId)
        if (layerIndex === -1) return

        const layer = layers[layerIndex]
        const fields = toMutableFields(layer.fields)
        const fieldIndex = fields.findIndex(f => f.name === fieldName)

        if (fieldIndex !== -1) {
            fields[fieldIndex].alias = newAlias
            layers[layerIndex].fields = fields
            sections[sectionIndex].layers = layers
            updateConfig('sections', sections)
        }
    }

    // Update field formatting
    const updateFieldFormat = (sectionId: string, layerId: string, fieldName: string, formatUpdates: Partial<FieldFormatConfig>) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex === -1) return

        const layers = toMutableLayers(sections[sectionIndex].layers)
        const layerIndex = layers.findIndex(l => l.layerId === layerId)
        if (layerIndex === -1) return

        const layer = layers[layerIndex]
        const fields = toMutableFields(layer.fields)
        const fieldIndex = fields.findIndex(f => f.name === fieldName)

        if (fieldIndex !== -1) {
            const currentFormat = fields[fieldIndex].format || {}
            const newFormat = { ...currentFormat, ...formatUpdates }
            fields[fieldIndex].format = newFormat
            layers[layerIndex].fields = fields
            sections[sectionIndex].layers = layers
            updateConfig('sections', sections)
        }
    }

    // Toggle field excludeFromPdf setting
    const toggleFieldExcludeFromPdf = (sectionId: string, layerId: string, fieldName: string) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex === -1) return

        const layers = toMutableLayers(sections[sectionIndex].layers)
        const layerIndex = layers.findIndex(l => l.layerId === layerId)
        if (layerIndex === -1) return

        const layer = layers[layerIndex]
        const fields = toMutableFields(layer.fields)
        const fieldIndex = fields.findIndex(f => f.name === fieldName)

        if (fieldIndex !== -1) {
            fields[fieldIndex].excludeFromPdf = !fields[fieldIndex].excludeFromPdf
            layers[layerIndex].fields = fields
            sections[sectionIndex].layers = layers
            updateConfig('sections', sections)
        }
    }

    // Get field excludeFromPdf setting
    const getFieldExcludeFromPdf = (sectionId: string, layerId: string, fieldName: string): boolean => {
        const sections = toMutableSections(config.sections)
        const section = sections.find(s => s.sectionId === sectionId)
        if (!section) return false

        const layers = toMutableLayers(section.layers)
        const layer = layers.find(l => l.layerId === layerId)
        if (!layer) return false

        const fields = toMutableFields(layer.fields)
        const field = fields.find(f => f.name === fieldName)
        return field?.excludeFromPdf || false
    }

    // Toggle field hideNull setting
    const toggleFieldHideNull = (sectionId: string, layerId: string, fieldName: string) => {
        const sections = toMutableSections(config.sections)
        const sectionIndex = sections.findIndex(s => s.sectionId === sectionId)
        if (sectionIndex === -1) return

        const layers = toMutableLayers(sections[sectionIndex].layers)
        const layerIndex = layers.findIndex(l => l.layerId === layerId)
        if (layerIndex === -1) return

        const layer = layers[layerIndex]
        const fields = toMutableFields(layer.fields)
        const fieldIndex = fields.findIndex(f => f.name === fieldName)

        if (fieldIndex !== -1) {
            fields[fieldIndex].hideNull = !fields[fieldIndex].hideNull
            layers[layerIndex].fields = fields
            sections[sectionIndex].layers = layers
            updateConfig('sections', sections)
        }
    }

    // Get field hideNull setting
    const getFieldHideNull = (sectionId: string, layerId: string, fieldName: string): boolean => {
        const sections = toMutableSections(config.sections)
        const section = sections.find(s => s.sectionId === sectionId)
        if (!section) return false

        const layers = toMutableLayers(section.layers)
        const layer = layers.find(l => l.layerId === layerId)
        if (!layer) return false

        const fields = toMutableFields(layer.fields)
        const field = fields.find(f => f.name === fieldName)
        return field?.hideNull || false
    }

    // Get field alias for display
    const getFieldAlias = (sectionId: string, layerId: string, fieldName: string): string => {
        const sections = toMutableSections(config.sections)
        const section = sections.find(s => s.sectionId === sectionId)
        if (!section) return fieldName

        const layers = toMutableLayers(section.layers)
        const layer = layers.find(l => l.layerId === layerId)
        if (!layer) return fieldName

        const fields = toMutableFields(layer.fields)
        const field = fields.find(f => (f.name || (f as any).n) === fieldName)
        return field?.alias || fieldName
    }

    // Get field format settings
    const getFieldFormat = (sectionId: string, layerId: string, fieldName: string): FieldFormatConfig => {
        const sections = toMutableSections(config.sections)
        const section = sections.find(s => s.sectionId === sectionId)
        if (!section) return {}

        const layers = toMutableLayers(section.layers)
        const layer = layers.find(l => l.layerId === layerId)
        if (!layer) return {}

        const fields = toMutableFields(layer.fields)
        const field = fields.find(f => (f.name || (f as any).n) === fieldName)
        return field?.format || {}
    }

    // Toggle search field selection
    const toggleSearchFieldSelection = (sourceId: string, fieldName: string) => {
        const sources = toMutableSearchSources(config.searchSources)
        const index = sources.findIndex(s => s.sourceId === sourceId)
        if (index === -1) return

        const source = sources[index]
        const currentFields = toMutableStringArray(source.searchFields)
        const fieldIndex = currentFields.indexOf(fieldName)

        if (fieldIndex !== -1) {
            currentFields.splice(fieldIndex, 1)
        } else {
            currentFields.push(fieldName)
        }

        sources[index].searchFields = currentFields
        updateConfig('searchSources', sources)
    }

    // Toggle header info field selection
    const toggleHeaderInfoField = (fieldName: string, fieldAlias: string) => {
        const current = (config.headerInfo || { enabled: true, displayFields: [] }) as any
        const displayFields = toMutableFields(current.displayFields || [])
        const fieldIndex = displayFields.findIndex((f: any) => f.name === fieldName)

        if (fieldIndex !== -1) {
            displayFields.splice(fieldIndex, 1)
        } else {
            displayFields.push({
                name: fieldName,
                alias: fieldAlias || fieldName,
                visible: true
            })
        }

        updateConfig('headerInfo', { ...current, displayFields } as any)
    }

    // Update header info field alias
    const updateHeaderInfoFieldAlias = (fieldName: string, newAlias: string) => {
        const current = (config.headerInfo || { enabled: true, displayFields: [] }) as any
        const displayFields = toMutableFields(current.displayFields || [])
        const fieldIndex = displayFields.findIndex((f: any) => f.name === fieldName)

        if (fieldIndex !== -1) {
            displayFields[fieldIndex].alias = newAlias
            updateConfig('headerInfo', { ...current, displayFields } as any)
        }
    }

    // Get header info field alias
    const getHeaderInfoFieldAlias = (fieldName: string): string => {
        const current = (config.headerInfo || { displayFields: [] }) as any
        const displayFields = toMutableFields(current.displayFields || [])
        const field = displayFields.find((f: any) => f.name === fieldName)
        return field?.alias || fieldName
    }

    // Toggle header info field excludeFromPdf
    const toggleHeaderInfoFieldExcludeFromPdf = (fieldName: string) => {
        const current = (config.headerInfo || { enabled: true, displayFields: [] }) as any
        const displayFields = toMutableFields(current.displayFields || [])
        const fieldIndex = displayFields.findIndex((f: any) => f.name === fieldName)

        if (fieldIndex !== -1) {
            displayFields[fieldIndex].excludeFromPdf = !displayFields[fieldIndex].excludeFromPdf
            updateConfig('headerInfo', { ...current, displayFields } as any)
        }
    }

    // Get header info field excludeFromPdf setting
    const getHeaderInfoFieldExcludeFromPdf = (fieldName: string): boolean => {
        const current = (config.headerInfo || { displayFields: [] }) as any
        const displayFields = toMutableFields(current.displayFields || [])
        const field = displayFields.find((f: any) => f.name === fieldName)
        return field?.excludeFromPdf || false
    }

    // Toggle header info field hideNull
    const toggleHeaderInfoFieldHideNull = (fieldName: string) => {
        const current = (config.headerInfo || { enabled: true, displayFields: [] }) as any
        const displayFields = toMutableFields(current.displayFields || [])
        const fieldIndex = displayFields.findIndex((f: any) => f.name === fieldName)

        if (fieldIndex !== -1) {
            displayFields[fieldIndex].hideNull = !displayFields[fieldIndex].hideNull
            updateConfig('headerInfo', { ...current, displayFields } as any)
        }
    }

    // Get header info field hideNull setting
    const getHeaderInfoFieldHideNull = (fieldName: string): boolean => {
        const current = (config.headerInfo || { displayFields: [] }) as any
        const displayFields = toMutableFields(current.displayFields || [])
        const field = displayFields.find((f: any) => f.name === fieldName)
        return field?.hideNull || false
    }

    const getLayerUseDataSources = (layer: any): ImmutableArray<UseDataSource> => {
        if (layer.useDataSource) {
            // Handle both Immutable and plain objects
            const ds = typeof layer.useDataSource.asMutable === 'function'
                ? layer.useDataSource.asMutable({ deep: true })
                : layer.useDataSource
            return Immutable([ds])
        }
        return Immutable([])
    }

    const getSearchSourceUseDataSources = (source: SearchSourceConfig): ImmutableArray<UseDataSource> => {
        if (source.useDataSource) {
            // Handle both Immutable and plain objects
            const ds = typeof (source.useDataSource as any).asMutable === 'function'
                ? (source.useDataSource as any).asMutable({ deep: true })
                : source.useDataSource
            return Immutable([ds])
        }
        return Immutable([])
    }

    // Helper to create useDataSources array from a single useDataSource
    const toUseDataSourcesArray = (useDataSource: any): ImmutableArray<UseDataSource> => {
        if (!useDataSource) return Immutable([])
        // Handle both Immutable and plain objects
        const ds = typeof useDataSource.asMutable === 'function'
            ? useDataSource.asMutable({ deep: true })
            : useDataSource
        return Immutable([ds])
    }

    const getSectionFields = (section: SectionConfig): AvailableField[] => {
        const allFields: AvailableField[] = []
        const layers = toMutableLayers(section.layers)

        for (const layer of layers) {
            // Check both dataSourceId and layerUrl (for direct REST URLs)
            let fields: AvailableField[] = []
            if (layer.dataSourceId) {
                fields = availableFieldsMap[layer.dataSourceId] || []
            } else if (layer.layerUrl) {
                fields = availableFieldsMap[`url:${layer.layerUrl}`] || []
            }

            for (const field of fields) {
                if (!allFields.find(f => f.name === field.name)) {
                    allFields.push(field)
                }
            }
        }

        return allFields
    }

    // Get numeric fields only (for chart value aggregation)
    const getSectionNumericFields = (section: SectionConfig): AvailableField[] => {
        const allFields = getSectionFields(section)
        const numericTypes = [
            'esriFieldTypeSmallInteger', 'esriFieldTypeInteger', 'esriFieldTypeSingle',
            'esriFieldTypeDouble', 'esriFieldTypeOID', 'small-integer', 'integer',
            'single', 'double', 'long', 'number', 'numeric', 'float', 'int', 'oid'
        ]
        return allFields.filter(f => {
            const fieldType = (f.type || '').toLowerCase()
            return numericTypes.some(t => fieldType.includes(t.toLowerCase()))
        })
    }

    // Update section chart config
    const updateSectionChartConfig = (sectionId: string, chartConfigUpdates: Partial<ChartConfig>) => {
        const sections = toMutableSections(config.sections)
        const index = sections.findIndex(s => s.sectionId === sectionId)
        if (index !== -1) {
            const currentChartConfig = sections[index].chartConfig || {}
            sections[index].chartConfig = { ...currentChartConfig, ...chartConfigUpdates }
            updateConfig('sections', sections)
        }
    }

    const updateSectionTableConfig = (sectionId: string, tableConfigUpdates: Partial<TableDisplayConfig>) => {
        const sections = toMutableSections(config.sections)
        const index = sections.findIndex(s => s.sectionId === sectionId)
        if (index !== -1) {
            const currentTableConfig = sections[index].tableConfig || {}
            sections[index].tableConfig = { ...currentTableConfig, ...tableConfigUpdates }
            updateConfig('sections', sections)
        }
    }

    const searchSources = toMutableSearchSources(config.searchSources)
    const sections = toMutableSections(config.sections)
    const pdfHeader = (config.pdfHeader || {}) as PdfHeaderConfig
    const pdfFooter = (config.pdfFooter || {}) as PdfFooterConfig
    const pdfStyle = (config.pdfStyle || {}) as PdfStyleConfig
    const pdfAccessibility = (config.pdfAccessibility || {}) as PdfAccessibilityConfig
    const logoConfig = (pdfHeader.logo || {}) as PdfLogoConfig

    return (
        <div css={getStyles()} className="setting-container">
            {/* Map Widget Selection */}
            <div className="collapsible-panel">
                <div
                    className="collapsible-panel-header"
                    onClick={() => togglePanel('map-connection')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && togglePanel('map-connection')}
                    aria-expanded={expandedPanels.has('map-connection')}
                >
                    <div className="collapsible-panel-header-left">
                        <span className="collapsible-panel-title">Map Connection</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('map-connection') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('map-connection') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <SettingRow flow="wrap" label="Select Map Widget">
                            <MapWidgetSelector
                                useMapWidgetIds={config.mapWidgetId ? Immutable([config.mapWidgetId]) : Immutable([])}
                                onSelect={(ids) => updateConfig('mapWidgetId', ids?.[0] || null)}
                            />
                        </SettingRow>
                    </div>
                </div>
            </div>

            {/* Settings Import/Export */}
            <div className="collapsible-panel">
                <div
                    className="collapsible-panel-header"
                    onClick={() => togglePanel('import-export')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && togglePanel('import-export')}
                    aria-expanded={expandedPanels.has('import-export')}
                >
                    <div className="collapsible-panel-header-left">
                        <span className="collapsible-panel-title">Settings Import/Export</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('import-export') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('import-export') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <div className="import-export-section">
                            <p className="hint-text">
                                Export or import widget configuration to quickly replicate settings across Experience Builder applications.
                                The Map Widget connection is not included in exports.
                            </p>

                            <div className="import-export-buttons">
                                <button
                                    className="import-export-btn"
                                    onClick={exportSettingsToXml}
                                    aria-label="Export settings to XML"
                                >
                                    <ExportIcon />
                                    Export Settings
                                </button>

                                <button
                                    className="import-export-btn"
                                    onClick={() => importInputRef.current?.click()}
                                    aria-label="Import settings from XML"
                                >
                                    <ImportIcon />
                                    Import Settings
                                </button>

                                <input
                                    ref={importInputRef}
                                    type="file"
                                    accept=".xml"
                                    onChange={handleImportSettings}
                                    style={{ display: 'none' }}
                                    aria-hidden="true"
                                />
                            </div>

                            {importExportStatus && (
                                <div className={`import-status ${importExportStatus.type === 'success' ? 'import-status-success' : 'import-status-error'}`}>
                                    {importExportStatus.type === 'success' ? '✓' : '✕'} {importExportStatus.message}
                                </div>
                            )}

                            <div className="import-export-info">
                                <strong>Exported settings include:</strong> Coordinate display, search sources (geocoders &amp; layers), result sections (layers, fields, charts, tables, rich text), header info layer, highlight layer, PDF settings (header, footer, logo, styles, WCAG accessibility), and chart/table defaults.
                                <br /><br />
                                <strong>Not exported:</strong> Map widget connection (must be set per-deployment).
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Settings */}
            <div className="collapsible-panel">
                <div
                    className="collapsible-panel-header"
                    onClick={() => togglePanel('performance-settings')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && togglePanel('performance-settings')}
                    aria-expanded={expandedPanels.has('performance-settings')}
                >
                    <div className="collapsible-panel-header-left">
                        <span className="collapsible-panel-title">Performance Settings</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('performance-settings') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('performance-settings') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <p className="hint-text">
                            Configure performance optimizations for faster query responses.
                        </p>

                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label="Client-Side Querying"
                                tooltip="When enabled, queries layers already loaded in the map using client-side processing instead of server requests. Can reduce query time from 30+ seconds to under 1 second for layers visible in the map."
                            />
                        )}>
                            <Switch
                                checked={config.enableClientSideQuery || false}
                                onChange={(e) => updateConfig('enableClientSideQuery', (e.target as HTMLInputElement).checked)}
                                aria-label="Enable client-side querying"
                            />
                        </SettingRow>
                        <p className="hint-text" style={{ marginTop: '4px' }}>
                            <strong>Tip:</strong> Enable this for significantly faster queries on layers already loaded in your map.
                            Falls back to server queries for layers not in the map.
                        </p>
                    </div>
                </div>
            </div>

            {/* Report Options */}
            <div className="collapsible-panel">
                <div
                    className="collapsible-panel-header"
                    onClick={() => togglePanel('report-options')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && togglePanel('report-options')}
                    aria-expanded={expandedPanels.has('report-options')}
                >
                    <div className="collapsible-panel-header-left">
                        <span className="collapsible-panel-title">Report Options</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('report-options') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('report-options') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label="Report summary template"
                                tooltip="Optional plain-language sentence shown above the report sections. Use {address} for the searched address and {FIELD_NAME} for any header info field. Example: This {ACRES}-acre parcel at {address} is zoned {ZONE}."
                            />
                        )}>
                            <TextArea
                                value={config.reportSummaryTemplate || ''}
                                onChange={(e) => updateConfig('reportSummaryTemplate', e.target.value)}
                                placeholder="This {ACRES}-acre parcel at {address} is zoned {ZONE}."
                                style={{ minHeight: 60 }}
                            />
                        </SettingRow>
                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label="Permalink URL parameter"
                                tooltip="Query-string parameter used by the Copy Link button in results, and honored on app load to auto-run a search. Example link: ...?propertysearch=1015 N 7th St"
                            />
                        )}>
                            <TextInput
                                size="sm"
                                value={config.permalinkParam || ''}
                                onChange={(e) => updateConfig('permalinkParam', e.target.value || undefined)}
                                placeholder="propertysearch"
                            />
                        </SettingRow>
                        <SettingRow flow="no-wrap" label={(
                            <TooltipLabel
                                label="Auto-open panel from permalink"
                                tooltip="When a report link is opened, attempt to automatically open the panel or sidebar containing this widget. Turn off if the automatic opening misbehaves in your app layout; the report still loads and appears when the user opens the widget."
                            />
                        )}>
                            <Switch
                                checked={config.permalinkAutoOpen !== false}
                                onChange={(e) => updateConfig('permalinkAutoOpen', e.target.checked)}
                                aria-label="Auto-open panel from permalink"
                            />
                        </SettingRow>
                        <SettingRow flow="no-wrap" label={(
                            <TooltipLabel
                                label="Enable comparison"
                                tooltip="Show the compare button in the report header, letting users snapshot one property and compare it side by side with another."
                            />
                        )}>
                            <Switch
                                checked={config.enableComparison !== false}
                                onChange={(e) => updateConfig('enableComparison', e.target.checked)}
                                aria-label="Enable comparison"
                            />
                        </SettingRow>
                        <SettingRow flow="no-wrap" label={(
                            <TooltipLabel
                                label="Enable report link"
                                tooltip="Show the copy-link button in the report header, which copies a shareable URL that reopens this report."
                            />
                        )}>
                            <Switch
                                checked={config.enablePermalink !== false}
                                onChange={(e) => updateConfig('enablePermalink', e.target.checked)}
                                aria-label="Enable report link"
                            />
                        </SettingRow>
                        <SettingRow flow="no-wrap" label={(
                            <TooltipLabel
                                label="Enable CSV export"
                                tooltip="Show a CSV download button on each report section that has data."
                            />
                        )}>
                            <Switch
                                checked={config.enableCsvExport !== false}
                                onChange={(e) => updateConfig('enableCsvExport', e.target.checked)}
                                aria-label="Enable CSV export"
                            />
                        </SettingRow>
                        <SettingRow flow="no-wrap" label={(
                            <TooltipLabel
                                label="Enable recent searches"
                                tooltip="Remember recent property searches in the browser and show them as quick-access chips under the search box."
                            />
                        )}>
                            <Switch
                                checked={config.enableRecentSearches !== false}
                                onChange={(e) => updateConfig('enableRecentSearches', e.target.checked)}
                                aria-label="Enable recent searches"
                            />
                        </SettingRow>
                    </div>
                </div>
            </div>

            {/* Coordinate Display Settings */}
            <div className="collapsible-panel">
                <div
                    className="collapsible-panel-header"
                    onClick={() => togglePanel('coordinate-display')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && togglePanel('coordinate-display')}
                    aria-expanded={expandedPanels.has('coordinate-display')}
                >
                    <div className="collapsible-panel-header-left">
                        <span className="collapsible-panel-title">Coordinate Display</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('coordinate-display') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('coordinate-display') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <p className="hint-text">
                            Configure how coordinates are displayed in results and PDF reports.
                        </p>

                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label="Enable Use Current Location"
                                tooltip="Show a 'Use Current Location' button that uses the device's GPS to query at the user's current position. Requires HTTPS and user permission."
                            />
                        )}>

                            <Switch
                                checked={config.enableUseCurrentLocation !== false}
                                onChange={(e) => updateConfig('enableUseCurrentLocation', (e.target as HTMLInputElement).checked)}
                                aria-label="Enable use current location button"
                            />
                        </SettingRow>
                        {config.enableUseCurrentLocation !== false && (
                            <p className="hint-text" style={{ marginTop: '2px', marginBottom: '8px' }}>
                                Adds a GPS button to query at the user's current location. Requires HTTPS in production. Users will be prompted to allow location access.
                            </p>
                        )}

                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label="Show Coordinates"
                                tooltip="Display the query point coordinates in the results header and PDF report. Useful for identifying exact search locations."
                            />
                        )}>

                            <Switch
                                checked={config.showCoordinates !== false}
                                onChange={(e) => updateConfig('showCoordinates', (e.target as HTMLInputElement).checked)}
                                aria-label="Show coordinates in results"
                            />
                        </SettingRow>

                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label="Coordinate System"
                                tooltip="Choose how coordinates are displayed. 'Map Native' uses the map's projection units, 'Lat/Lon' converts to WGS84 degrees, 'Web Mercator' shows X/Y meters, 'Custom WKID' allows any projection."
                            />
                        )}>

                            <Select
                                size="sm"
                                value={config.coordinateSystem || 'map'}
                                onChange={(e) => updateConfig('coordinateSystem', e.target.value)}
                                style={{ width: '100%' }}
                            >
                                <Option value="map">Map Native (Original Units)</Option>
                                <Option value="wgs84">Lat/Lon Degrees (WGS84)</Option>
                                <Option value="webmercator">X/Y Meters (Web Mercator)</Option>
                                <Option value="custom">Custom WKID</Option>
                            </Select>
                        </SettingRow>

                        {config.coordinateSystem === 'custom' && (
                            <>
                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label="WKID"
                                        tooltip="Enter the Well-Known ID (EPSG code) for your coordinate system. Examples: 2180 (Poland ETRS89), 25832 (Germany ETRS89 UTM32), 27700 (UK OSGB 1936)."
                                    />
                                )}>
                                    <NumericInput
                                        size="sm"
                                        value={config.customCoordinateWkid || 4326}
                                        min={1}
                                        max={999999}
                                        onChange={(value) => updateConfig('customCoordinateWkid', value)}
                                        style={{ width: '100%' }}
                                    />
                                </SettingRow>

                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label="Display Label"
                                        tooltip="Optional label shown in the coordinate display. If empty, will show the WKID number."
                                    />
                                )}>
                                    <TextInput
                                        size="sm"
                                        value={config.customCoordinateLabel || ''}
                                        onChange={(e) => updateConfig('customCoordinateLabel', e.target.value)}
                                        placeholder="e.g., ETRS89 / Poland CS92"
                                        style={{ width: '100%' }}
                                    />
                                </SettingRow>

                                <p className="hint-text" style={{ marginTop: '4px' }}>
                                    Common WKIDs: 2180 (Poland), 25832/25833 (Germany UTM), 27700 (UK), 2154 (France), 28992 (Netherlands), 3006 (Sweden)
                                </p>
                            </>
                        )}

                        {config.coordinateSystem === 'wgs84' && (
                            <SettingRow flow="wrap" label={(
                                <TooltipLabel
                                    label="Format"
                                    tooltip="Decimal degrees (39.0639°) are more compact; Degrees-Minutes-Seconds (39°3′50″N) are traditional for surveying and navigation."
                                />
                            )}>

                                <Select
                                    size="sm"
                                    value={config.coordinateFormat || 'decimal'}
                                    onChange={(e) => updateConfig('coordinateFormat', e.target.value)}
                                    style={{ width: '100%' }}
                                >
                                    <Option value="decimal">Decimal Degrees (e.g., 39.0639, -108.5506)</Option>
                                    <Option value="dms">Degrees Minutes Seconds (e.g., 39°3'50"N)</Option>
                                </Select>
                            </SettingRow>
                        )}

                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label="Decimal Precision"
                                tooltip="Number of decimal places. For lat/lon: 6 decimals ≈ 0.1m accuracy, 4 decimals ≈ 11m. Higher precision = longer numbers."
                            />
                        )}>

                            <NumericInput
                                size="sm"
                                value={config.coordinatePrecision || 6}
                                min={0}
                                max={10}
                                onChange={(value) => updateConfig('coordinatePrecision', value)}
                                style={{ width: 80 }}
                            />
                        </SettingRow>
                    </div>
                </div>
            </div>

            {/* Search Sources Configuration */}
            {/* Search Sources Configuration */}
            <div className="collapsible-panel">
                <div
                    className="collapsible-panel-header"
                    onClick={() => togglePanel('search-sources')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && togglePanel('search-sources')}
                    aria-expanded={expandedPanels.has('search-sources')}
                >
                    <div className="collapsible-panel-header-left">
                        <span className="collapsible-panel-title">Search Sources</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('search-sources') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('search-sources') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <p className="hint-text">
                            Configure search sources. Results from all enabled sources will be combined.
                        </p>

                        {searchSources.length === 0 ? (
                            <div className="empty-state">
                                <SearchIcon />
                                <span>No search sources configured</span>
                            </div>
                        ) : (
                            searchSources.map((source) => {
                                const isExpanded = expandedSearchSources.has(source.sourceId)
                                const searchLayerFields = source.dataSourceId
                                    ? (availableFieldsMap[`search-${source.dataSourceId}`] || [])
                                    : []
                                const stringFields = searchLayerFields.filter(f =>
                                    f.type === 'esriFieldTypeString' || f.type === 'string'
                                )

                                return (
                                    <div className="list-item-card" key={source.sourceId}>
                                        <div
                                            className="list-item-header"
                                            onClick={() => toggleSearchSourceExpand(source.sourceId)}
                                            role="button"
                                            tabIndex={0}
                                            aria-expanded={isExpanded}
                                            onKeyDown={(e) => e.key === 'Enter' && toggleSearchSourceExpand(source.sourceId)}
                                        >
                                            <div className="list-item-header-left">
                                                <span className="expand-icon">
                                                    {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                                                </span>
                                                <span className={`status-dot ${source.enabled ? 'status-enabled' : 'status-disabled'}`} />
                                                <span className="list-item-title">{source.sourceName}</span>
                                                <span className={`item-badge ${source.type === 'geocoder' ? 'item-badge-success' : ''}`}>
                                                    {source.type === 'geocoder' ? 'Geocoder' : source.type === 'url' ? 'URL' : 'Layer'}
                                                </span>
                                            </div>
                                            <div className="list-item-actions">
                                                <Switch
                                                    checked={source.enabled}
                                                    onChange={(e) => {
                                                        e.stopPropagation()
                                                        toggleSearchSourceEnabled(source.sourceId)
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    aria-label={`Enable ${source.sourceName}`}
                                                />
                                                <Tip title="Remove source" placement="top">
                                                    <button
                                                        className="delete-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            removeSearchSource(source.sourceId)
                                                        }}
                                                        aria-label={`Remove ${source.sourceName}`}
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </Tip>
                                            </div>
                                        </div>

                                        <div style={{ display: isExpanded ? 'block' : 'none' }}>
                                            <div className="list-item-content">
                                                <SettingRow flow="wrap" label={(
                                                    <TooltipLabel
                                                        label="Source Name"
                                                        tooltip="Display name shown in search suggestions dropdown to help users identify which source a suggestion came from."
                                                    />
                                                )}>
                                                    <TextInput
                                                        size="sm"
                                                        value={source.sourceName}
                                                        onChange={(e) => updateSearchSource(source.sourceId, { sourceName: e.target.value })}
                                                        aria-label="Source name"
                                                    />
                                                </SettingRow>

                                                {source.type === 'geocoder' && (
                                                    <>
                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label="Geocoder URL"
                                                                tooltip="ArcGIS World Geocoder or custom geocoding service URL. The default Esri geocoder provides global address matching."
                                                            />
                                                        )}>
                                                            <TextInput
                                                                size="sm"
                                                                value={source.geocoderUrl || ''}
                                                                onChange={(e) => updateSearchSource(source.sourceId, { geocoderUrl: e.target.value })}
                                                                placeholder="https://geocode.arcgis.com/..."
                                                                aria-label="Geocoder URL"
                                                            />
                                                        </SettingRow>
                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label="Max Suggestions"
                                                                tooltip="Maximum number of address suggestions to show from this geocoder. Lower values reduce clutter; higher values give more options."
                                                            />
                                                        )}>
                                                            <NumericInput
                                                                size="sm"
                                                                value={source.maxSuggestions || 6}
                                                                min={1}
                                                                max={20}
                                                                onChange={(value) => updateSearchSource(source.sourceId, { maxSuggestions: value })}
                                                                style={{ width: 80 }}
                                                                aria-label="Maximum suggestions"
                                                            />
                                                        </SettingRow>
                                                    </>
                                                )}

                                                {source.type === 'layer' && (
                                                    <>
                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label="Search Layer"
                                                                tooltip="Feature layer to search. Users can search by attribute values in this layer (e.g., parcel numbers, owner names)."
                                                            />
                                                        )}>
                                                            <div className="ds-selector-container">
                                                                {DataSourceSelector ? (
                                                                    <DataSourceSelector
                                                                        types={SUPPORTED_DS_TYPES}
                                                                        useDataSources={getSearchSourceUseDataSources(source)}
                                                                        mustUseDataSource
                                                                        onChange={(dsArr) => handleSearchSourceDataSourceChange(source.sourceId, dsArr)}
                                                                        widgetId={id}
                                                                        isMultiple={false}
                                                                        closeDataSourceListOnChange
                                                                    />
                                                                ) : <div style={{ padding: "8px", fontSize: "12px", color: "var(--sys-color-text-secondary)" }}>Loading data source selector...</div>}
                                                            </div>
                                                        </SettingRow>

                                                        {source.dataSourceId && (
                                                            <>
                                                                <SettingRow flow="wrap" label={(
                                                                    <TooltipLabel
                                                                        label="Search Fields"
                                                                        tooltip="Which text fields to search. Select multiple fields for broader matching (e.g., both ADDRESS and OWNER_NAME)."
                                                                    />
                                                                )}>
                                                                    <div className="fields-container">
                                                                        {stringFields.length === 0 ? (
                                                                            <div className="field-item" style={{ justifyContent: 'center', color: 'var(--sys-color-text-light)' }}>
                                                                                No text fields available
                                                                            </div>
                                                                        ) : (
                                                                            stringFields.map(field => {
                                                                                const isSelected = toMutableStringArray(source.searchFields).includes(field.name)
                                                                                return (
                                                                                    <div className="field-item" key={field.name}>
                                                                                        <Checkbox
                                                                                            checked={isSelected}
                                                                                            onChange={() => toggleSearchFieldSelection(source.sourceId, field.name)}
                                                                                            aria-label={`Select ${field.alias || field.name}`}
                                                                                        />
                                                                                        <span className="field-name">{field.alias || field.name}</span>
                                                                                    </div>
                                                                                )
                                                                            })
                                                                        )}
                                                                    </div>
                                                                </SettingRow>

                                                                <SettingRow flow="wrap" label={(
                                                                    <TooltipLabel
                                                                        label="Display Field"
                                                                        tooltip="Field shown in search suggestions. Choose the most recognizable identifier (e.g., full address, owner name, parcel number)."
                                                                    />
                                                                )}>
                                                                    <Select
                                                                        size="sm"
                                                                        value={source.displayField || ''}
                                                                        onChange={(e) => updateSearchSource(source.sourceId, { displayField: e.target.value })}
                                                                        aria-label="Display field"
                                                                    >
                                                                        <Option value="">-- Select Field --</Option>
                                                                        {searchLayerFields.map(field => (
                                                                            <Option key={field.name} value={field.name}>
                                                                                {field.alias || field.name}
                                                                            </Option>
                                                                        ))}
                                                                    </Select>
                                                                </SettingRow>

                                                                <SettingRow flow="wrap" label={(
                                                                    <TooltipLabel
                                                                        label="Max Suggestions"
                                                                        tooltip="Maximum matching features to show in dropdown. Balance between comprehensive results and UI responsiveness."
                                                                    />
                                                                )}>
                                                                    <NumericInput
                                                                        size="sm"
                                                                        value={source.maxSuggestions || 6}
                                                                        min={1}
                                                                        max={20}
                                                                        onChange={(value) => updateSearchSource(source.sourceId, { maxSuggestions: value })}
                                                                        style={{ width: 80 }}
                                                                        aria-label="Maximum suggestions"
                                                                    />
                                                                </SettingRow>
                                                            </>
                                                        )}
                                                    </>
                                                )}

                                                {source.type === 'url' && (
                                                    <>
                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label="Service URL"
                                                                tooltip="ArcGIS REST endpoint URL (FeatureServer or MapServer layer). Use this for external services not in the web map."
                                                            />
                                                        )}>
                                                            <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                                                                <TextInput
                                                                    size="sm"
                                                                    value={source.url || ''}
                                                                    onChange={(e) => updateSearchSource(source.sourceId, { url: e.target.value } as any)}
                                                                    placeholder="https://services.arcgis.com/.../FeatureServer/0"
                                                                    aria-label="REST Service URL"
                                                                    style={{ flex: 1 }}
                                                                />
                                                                <Button
                                                                    size="sm"
                                                                    type="primary"
                                                                    disabled={!source.url || urlSourceFieldsLoading[source.sourceId]}
                                                                    onClick={() => fetchSearchSourceUrlFields(source.sourceId, source.url)}
                                                                    aria-label="Load fields from URL"
                                                                >
                                                                    {urlSourceFieldsLoading[source.sourceId] ? 'Loading...' : 'Load Fields'}
                                                                </Button>
                                                            </div>
                                                            {fetchErrors[`search:${source.sourceId}`] && (
                                                                <NativeAlert
                                                                    type="error"
                                                                    withIcon
                                                                    open
                                                                    style={{ marginTop: '8px', fontSize: '11px' }}
                                                                >
                                                                    {fetchErrors[`search:${source.sourceId}`]}
                                                                </NativeAlert>
                                                            )}
                                                        </SettingRow>
                                                        <p className="hint-text" style={{ marginTop: 0 }}>
                                                            Enter a Feature Layer REST endpoint URL and click "Load Fields" to fetch available fields.
                                                        </p>

                                                        {(() => {
                                                            const urlFields = getSearchSourceUrlFields(source.sourceId)
                                                            const urlStringFields = urlFields.filter(f =>
                                                                f.type === 'esriFieldTypeString' || f.type === 'string'
                                                            )

                                                            if (urlFields.length === 0) {
                                                                return (
                                                                    <div className="hint-text" style={{ fontStyle: 'italic', padding: '8px 0' }}>
                                                                        Click "Load Fields" to fetch available fields from the service.
                                                                    </div>
                                                                )
                                                            }

                                                            return (
                                                                <>
                                                                    <SettingRow flow="wrap" label={(<TooltipLabel label="Search Fields" tooltip="Select which text fields users can search. Multiple fields allow broader search coverage (e.g., Name, Address, ID)." />)}>
                                                                        <div className="fields-container">
                                                                            {urlStringFields.length === 0 ? (
                                                                                <div className="field-item" style={{ justifyContent: 'center', color: 'var(--sys-color-text-light)' }}>
                                                                                    No text fields available
                                                                                </div>
                                                                            ) : (
                                                                                urlStringFields.map(field => {
                                                                                    const isSelected = toMutableStringArray(source.searchFields).includes(field.name)
                                                                                    return (
                                                                                        <div className="field-item" key={field.name}>
                                                                                            <Checkbox
                                                                                                checked={isSelected}
                                                                                                onChange={() => toggleSearchFieldSelection(source.sourceId, field.name)}
                                                                                                aria-label={`Select ${field.alias || field.name}`}
                                                                                            />
                                                                                            <span className="field-name">{field.alias || field.name}</span>
                                                                                        </div>
                                                                                    )
                                                                                })
                                                                            )}
                                                                        </div>
                                                                    </SettingRow>

                                                                    <SettingRow flow="wrap" label={(<TooltipLabel label="Display Field" tooltip="The field value shown in search suggestions dropdown. Choose a human-readable field like Name or Address." />)}>
                                                                        <Select
                                                                            size="sm"
                                                                            value={source.displayField || ''}
                                                                            onChange={(e) => updateSearchSource(source.sourceId, { displayField: e.target.value })}
                                                                            aria-label="Display field"
                                                                        >
                                                                            <Option value="">-- Select Field --</Option>
                                                                            {urlFields.map(field => (
                                                                                <Option key={field.name} value={field.name}>
                                                                                    {field.alias || field.name}
                                                                                </Option>
                                                                            ))}
                                                                        </Select>
                                                                    </SettingRow>
                                                                </>
                                                            )
                                                        })()}

                                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Max Suggestions" tooltip="Maximum number of suggestions to show from this source. Lower values reduce clutter; higher values show more options." />)}>
                                                            <NumericInput
                                                                size="sm"
                                                                value={source.maxSuggestions || 6}
                                                                min={1}
                                                                max={20}
                                                                onChange={(value) => updateSearchSource(source.sourceId, { maxSuggestions: value })}
                                                                style={{ width: 80 }}
                                                                aria-label="Maximum suggestions"
                                                            />
                                                        </SettingRow>
                                                    </>
                                                )}

                                                {/* Highlight Options - for layer and url types */}
                                                {(source.type === 'layer' || source.type === 'url') && (
                                                    <>
                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label="Highlight Geometry"
                                                                tooltip="Draw feature outline/fill on map when selected from search results. Useful for showing parcel boundaries or feature locations."
                                                            />
                                                        )}>
                                                            <Switch
                                                                checked={source.highlightEnabled || false}
                                                                onChange={(e) => updateSearchSource(source.sourceId, {
                                                                    highlightEnabled: (e.target as HTMLInputElement).checked
                                                                } as any)}
                                                                aria-label="Enable geometry highlight"
                                                            />
                                                        </SettingRow>
                                                        {source.highlightEnabled && (
                                                            <SettingRow flow="wrap" label={(<TooltipLabel label="Highlight Color" tooltip="Color used to highlight the selected feature's geometry on the map. Choose a color that contrasts well with your basemap." />)}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <input
                                                                        type="color"
                                                                        value={source.highlightColor || '#00FFFF'}
                                                                        onChange={(e) => updateSearchSource(source.sourceId, {
                                                                            highlightColor: e.target.value
                                                                        } as any)}
                                                                        style={{ width: 40, height: 28, padding: 0, border: '1px solid #ccc', cursor: 'pointer' }}
                                                                        aria-label="Highlight color"
                                                                    />
                                                                    <TextInput
                                                                        size="sm"
                                                                        value={source.highlightColor || '#00FFFF'}
                                                                        onChange={(e) => updateSearchSource(source.sourceId, {
                                                                            highlightColor: e.target.value
                                                                        } as any)}
                                                                        style={{ width: 80 }}
                                                                        aria-label="Highlight color hex"
                                                                    />
                                                                </div>
                                                            </SettingRow>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}

                        <div className="source-type-buttons">
                            <button
                                className="source-type-btn"
                                onClick={() => addSearchSource('geocoder')}
                                aria-label="Add geocoder source"
                            >
                                <PinIcon />
                                <span className="source-type-label">Add Geocoder</span>
                            </button>
                            <button
                                className="source-type-btn"
                                onClick={() => addSearchSource('layer')}
                                aria-label="Add layer source"
                            >
                                <LayersIcon />
                                <span className="source-type-label">Add Layer Search</span>
                            </button>
                            <button
                                className="source-type-btn"
                                onClick={() => addSearchSource('url')}
                                aria-label="Add REST URL source"
                            >
                                <DataIcon />
                                <span className="source-type-label">Add REST URL</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Header Info Layer Configuration */}
            <div className="collapsible-panel">
                <div
                    className="collapsible-panel-header"
                    onClick={() => togglePanel('header-info')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && togglePanel('header-info')}
                    aria-expanded={expandedPanels.has('header-info')}
                >
                    <div className="collapsible-panel-header-left">
                        <span className="collapsible-panel-title">Report Header Info</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('header-info') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('header-info') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <p className="hint-text">
                            Configure a layer to display additional information in the report header (e.g., parcel number, property ID).
                        </p>

                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label="Enable Header Info"
                                tooltip="Query a parcel layer to display additional fields (like parcel number, owner name) in the report header. The query uses the search point to find the intersecting feature."
                            />
                        )}>

                            <Switch
                                checked={config.headerInfo?.enabled || false}
                                onChange={(e) => {
                                    const current = (config.headerInfo || { enabled: false, displayFields: [] }) as any
                                    updateConfig('headerInfo', { ...current, enabled: (e.target as HTMLInputElement).checked } as any)
                                }}
                                aria-label="Enable header info layer"
                            />
                        </SettingRow>

                        {config.headerInfo?.enabled && (
                            <>
                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label="Data Source"
                                        tooltip="Select a feature layer (typically parcels) to query. The widget will find the feature at the search location and display its attributes in the header."
                                    />
                                )}>

                                    <div className="ds-selector-container">
                                        {DataSourceSelector ? (
                                            <DataSourceSelector
                                                types={SUPPORTED_DS_TYPES}
                                                useDataSources={toUseDataSourcesArray(config.headerInfo?.useDataSource)}
                                                mustUseDataSource
                                                onChange={async (dsArr) => {
                                                    const current = (config.headerInfo || { enabled: true, displayFields: [] }) as any
                                                    if (dsArr && dsArr.length > 0) {
                                                        const selectedDs = dsArr[0]
                                                        let layerUrl = ''
                                                        try {
                                                            const ds = DataSourceManager.getInstance().getDataSource(selectedDs.dataSourceId)
                                                            if (ds) {
                                                                await (ds as any).ready?.()
                                                                const dsJson = (ds as any).getDataSourceJson?.()
                                                                layerUrl = dsJson?.url || (ds as any).url || ''

                                                                // Get fields
                                                                const schema = ds.getSchema()
                                                                if (schema?.fields) {
                                                                    const fields: AvailableField[] = Object.entries(schema.fields).map(([key, field]: [string, any]) => ({
                                                                        name: field.jimuName || field.name || key,
                                                                        alias: field.alias || field.jimuName || field.name || key,
                                                                        type: field.esriType || field.type || 'unknown'
                                                                    }))
                                                                    setAvailableFieldsMap(prev => ({
                                                                        ...prev,
                                                                        ['headerInfo']: fields
                                                                    }))
                                                                }
                                                            }
                                                        } catch (e) {
                                                            console.error('Error loading header info layer:', e)
                                                        }
                                                        updateConfig('headerInfo', {
                                                            ...current,
                                                            dataSourceId: selectedDs.dataSourceId,
                                                            useDataSource: selectedDs,
                                                            layerUrl: layerUrl
                                                        } as any)

                                                        // Add to useDataSources
                                                        const currentUseDataSources = useDataSources ? [...useDataSources] : []
                                                        if (!currentUseDataSources.find(ds => ds.dataSourceId === selectedDs.dataSourceId)) {
                                                            currentUseDataSources.push(selectedDs)
                                                            onSettingChange({ id, useDataSources: currentUseDataSources })
                                                        }
                                                    } else {
                                                        updateConfig('headerInfo', {
                                                            ...current,
                                                            dataSourceId: undefined,
                                                            useDataSource: null,
                                                            layerUrl: ''
                                                        } as any)
                                                    }
                                                }}
                                                widgetId={id}
                                                isMultiple={false}
                                                closeDataSourceListOnChange
                                            />
                                        ) : <div style={{ padding: "8px", fontSize: "12px", color: "var(--sys-color-text-secondary)" }}>Loading data source selector...</div>}
                                    </div>
                                </SettingRow>

                                <div style={{ textAlign: 'center', color: 'var(--sys-color-text-light)', fontSize: '11px', margin: '8px 0' }}>
                                    — OR use direct URL —
                                </div>

                                <SettingRow flow="wrap" label={(<TooltipLabel label="REST Service URL" tooltip="Direct Feature Layer REST endpoint URL (e.g., https://server/arcgis/rest/services/Name/MapServer/0). Alternative to data source selection." />)}>
                                    <TextInput
                                        size="sm"
                                        value={config.headerInfo?.layerUrl || ''}
                                        onChange={(e) => {
                                            const current = (config.headerInfo || { enabled: true, displayFields: [] }) as any
                                            updateConfig('headerInfo', {
                                                ...current,
                                                layerUrl: e.target.value,
                                                dataSourceId: e.target.value ? undefined : current.dataSourceId,
                                                useDataSource: e.target.value ? null : current.useDataSource
                                            } as any)
                                        }}
                                        placeholder="https://services.arcgis.com/.../FeatureServer/0"
                                        aria-label="REST Service URL"
                                    />
                                </SettingRow>

                                {/* Error display for header info URL */}
                                {fetchErrors['header-info'] && (
                                    <NativeAlert
                                        type="error"
                                        withIcon
                                        open
                                        style={{ marginBottom: '8px', fontSize: '11px' }}
                                    >
                                        {fetchErrors['header-info']}
                                    </NativeAlert>
                                )}

                                {/* Display Fields - checkbox selector */}
                                {(() => {
                                    const headerFields = config.headerInfo?.dataSourceId
                                        ? (availableFieldsMap['headerInfo'] || [])
                                        : headerInfoUrlFields
                                    const selectedDisplayFields = toMutableFields((config.headerInfo as any)?.displayFields || [])

                                    return (
                                        <SettingRow flow="wrap" label={(
                                            <TooltipLabel
                                                label="Display Fields"
                                                tooltip="Select which fields to show in the report header (e.g., Parcel Number, Owner Name). These appear below the address title."
                                            />
                                        )}>

                                            <div className="fields-container">
                                                {loadingHeaderInfoFields ? (
                                                    <div className="field-item" style={{ justifyContent: 'center', color: 'var(--sys-color-text-light)' }}>
                                                        Loading fields...
                                                    </div>
                                                ) : headerFields.length === 0 ? (
                                                    <div className="field-item" style={{ justifyContent: 'center', color: 'var(--sys-color-text-light)' }}>
                                                        {config.headerInfo?.layerUrl || config.headerInfo?.dataSourceId
                                                            ? 'No fields available'
                                                            : 'Enter a URL or select a data source'}
                                                    </div>
                                                ) : (
                                                    headerFields.map(field => {
                                                        const isSelected = selectedDisplayFields.some((f: any) => f.name === field.name)
                                                        const currentAlias = getHeaderInfoFieldAlias(field.name)
                                                        return (
                                                            <div className="field-item" key={field.name} style={{ flexWrap: 'wrap' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                                                                    <Checkbox
                                                                        checked={isSelected}
                                                                        onChange={() => toggleHeaderInfoField(field.name, field.alias)}
                                                                        aria-label={`Select ${field.alias || field.name}`}
                                                                    />
                                                                    <span className="field-name">{field.name}</span>
                                                                    {field.alias && field.alias !== field.name && (
                                                                        <span style={{ color: 'var(--sys-color-text-light)', fontSize: '11px' }}>({field.alias})</span>
                                                                    )}
                                                                </div>
                                                                {isSelected && (
                                                                    <div style={{ width: '100%', marginTop: '4px', paddingLeft: '24px' }}>
                                                                        <TextInput
                                                                            size="sm"
                                                                            value={currentAlias}
                                                                            onChange={(e) => updateHeaderInfoFieldAlias(field.name, e.target.value)}
                                                                            placeholder="Display alias"
                                                                            aria-label={`Alias for ${field.name}`}
                                                                            style={{ width: '100%' }}
                                                                        />
                                                                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <Switch
                                                                                checked={getHeaderInfoFieldExcludeFromPdf(field.name)}
                                                                                onChange={() => toggleHeaderInfoFieldExcludeFromPdf(field.name)}
                                                                                aria-label={`Exclude ${field.name} from PDF`}
                                                                            />
                                                                            <Label style={{ fontSize: '11px', cursor: 'pointer' }}>
                                                                                Exclude from PDF
                                                                            </Label>
                                                                            <Tip title="Field will display in widget header but not in PDF export" placement="top">
                                                                                <span style={{ color: 'var(--sys-color-text-light)', cursor: 'help' }}>ⓘ</span>
                                                                            </Tip>
                                                                        </div>
                                                                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <Switch
                                                                                checked={getHeaderInfoFieldHideNull(field.name)}
                                                                                onChange={() => toggleHeaderInfoFieldHideNull(field.name)}
                                                                                aria-label={`Hide ${field.name} when NULL`}
                                                                            />
                                                                            <Label style={{ fontSize: '11px', cursor: 'pointer' }}>
                                                                                Hide when NULL
                                                                            </Label>
                                                                            <Tip title="Hide this field when value is NULL or empty" placement="top">
                                                                                <span style={{ color: 'var(--sys-color-text-light)', cursor: 'help' }}>ⓘ</span>
                                                                            </Tip>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })
                                                )}
                                            </div>
                                        </SettingRow>
                                    )
                                })()}

                                {/* Geocoder URL for reverse geocoding header title */}
                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label="Header Title Geocoder URL"
                                        tooltip="Optional: Provide a geocoder URL for reverse geocoding. When set, the widget will convert coordinates to an address for the header title instead of using the search text."
                                    />
                                )}>

                                    <TextInput
                                        size="sm"
                                        value={(config.headerInfo as any)?.geocoderUrl || ''}
                                        onChange={(e) => {
                                            const current = (config.headerInfo || { enabled: true, displayFields: [] }) as any
                                            updateConfig('headerInfo', {
                                                ...current,
                                                geocoderUrl: e.target.value
                                            } as any)
                                        }}
                                        placeholder="https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
                                        aria-label="Geocoder URL for header title"
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '4px', fontSize: '11px' }}>
                                    Optional: Provide a geocoder URL to reverse geocode the search location and display an address in the report header title. If not set, the search text will be used.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Highlight Layer Configuration */}
            <div className="collapsible-panel">
                <div
                    className="collapsible-panel-header"
                    onClick={() => togglePanel('highlight-layer')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && togglePanel('highlight-layer')}
                    aria-expanded={expandedPanels.has('highlight-layer')}
                >
                    <div className="collapsible-panel-header-left">
                        <span className="collapsible-panel-title">Highlight Layer</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('highlight-layer') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('highlight-layer') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <p className="hint-text">
                            Configure a layer to highlight on any search (e.g., parcels). The geometry at the search location will be highlighted.
                        </p>

                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label="Enable Highlight Layer"
                                tooltip="Query a polygon layer (typically parcels) to highlight the geometry at the search location. Creates a visual outline/fill on the map."
                            />
                        )}>

                            <Switch
                                checked={config.highlightLayer?.enabled || false}
                                onChange={(e) => {
                                    const current = (config.highlightLayer || { enabled: false }) as any
                                    updateConfig('highlightLayer', { ...current, enabled: (e.target as HTMLInputElement).checked } as any)
                                }}
                                aria-label="Enable highlight layer"
                            />
                        </SettingRow>

                        {config.highlightLayer?.enabled && (
                            <>
                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label="Data Source"
                                        tooltip="Select the layer to query for highlighting. Typically a parcel polygon layer. The feature intersecting the search point will be highlighted."
                                    />
                                )}>

                                    <div className="ds-selector-container">
                                        {DataSourceSelector ? (
                                            <DataSourceSelector
                                                types={SUPPORTED_DS_TYPES}
                                                useDataSources={toUseDataSourcesArray(config.highlightLayer?.useDataSource)}
                                                mustUseDataSource
                                                onChange={async (dsArr) => {
                                                    const current = (config.highlightLayer || { enabled: true }) as any
                                                    if (dsArr && dsArr.length > 0) {
                                                        const selectedDs = dsArr[0]
                                                        let layerUrl = ''
                                                        try {
                                                            const ds = DataSourceManager.getInstance().getDataSource(selectedDs.dataSourceId)
                                                            if (ds) {
                                                                await (ds as any).ready?.()
                                                                const dsJson = (ds as any).getDataSourceJson?.()
                                                                layerUrl = dsJson?.url || (ds as any).url || ''
                                                            }
                                                        } catch (e) {
                                                            console.error('Error loading highlight layer:', e)
                                                        }
                                                        updateConfig('highlightLayer', {
                                                            ...current,
                                                            dataSourceId: selectedDs.dataSourceId,
                                                            useDataSource: selectedDs,
                                                            layerUrl: layerUrl
                                                        } as any)

                                                        // Add to useDataSources
                                                        const currentUseDataSources = useDataSources ? [...useDataSources] : []
                                                        if (!currentUseDataSources.find(ds => ds.dataSourceId === selectedDs.dataSourceId)) {
                                                            currentUseDataSources.push(selectedDs)
                                                            onSettingChange({ id, useDataSources: currentUseDataSources })
                                                        }
                                                    } else {
                                                        updateConfig('highlightLayer', {
                                                            ...current,
                                                            dataSourceId: undefined,
                                                            useDataSource: null,
                                                            layerUrl: ''
                                                        } as any)
                                                    }
                                                }}
                                                widgetId={id}
                                                isMultiple={false}
                                                closeDataSourceListOnChange
                                            />
                                        ) : <div style={{ padding: "8px", fontSize: "12px", color: "var(--sys-color-text-secondary)" }}>Loading data source selector...</div>}
                                    </div>
                                </SettingRow>

                                <div style={{ textAlign: 'center', color: 'var(--sys-color-text-light)', fontSize: '11px', margin: '8px 0' }}>
                                    — OR use direct URL —
                                </div>

                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label="REST Service URL"
                                        tooltip="Alternative to data source: Enter the direct REST endpoint URL of the feature layer (e.g., .../FeatureServer/0). Useful for layers not in the web map."
                                    />
                                )}>

                                    <TextInput
                                        size="sm"
                                        value={config.highlightLayer?.layerUrl || ''}
                                        onChange={(e) => {
                                            const current = (config.highlightLayer || { enabled: true }) as any
                                            updateConfig('highlightLayer', {
                                                ...current,
                                                layerUrl: e.target.value,
                                                dataSourceId: e.target.value ? undefined : current.dataSourceId,
                                                useDataSource: e.target.value ? null : current.useDataSource
                                            } as any)
                                        }}
                                        placeholder="https://services.arcgis.com/.../Parcels/FeatureServer/0"
                                        aria-label="REST Service URL"
                                    />
                                </SettingRow>

                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label="Highlight Color"
                                        tooltip="The outline/stroke color for highlighted features. Cyan (#00FFFF) is common for visibility against most backgrounds."
                                    />
                                )}>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="color"
                                            value={config.highlightLayer?.highlightColor || '#00FFFF'}
                                            onChange={(e) => {
                                                const current = (config.highlightLayer || { enabled: true }) as any
                                                updateConfig('highlightLayer', { ...current, highlightColor: e.target.value } as any)
                                            }}
                                            style={{ width: 40, height: 28, padding: 0, border: '1px solid #ccc', cursor: 'pointer' }}
                                            aria-label="Highlight color"
                                        />
                                        <TextInput
                                            size="sm"
                                            value={config.highlightLayer?.highlightColor || '#00FFFF'}
                                            onChange={(e) => {
                                                const current = (config.highlightLayer || { enabled: true }) as any
                                                updateConfig('highlightLayer', { ...current, highlightColor: e.target.value } as any)
                                            }}
                                            style={{ width: 80 }}
                                            aria-label="Highlight color hex"
                                        />
                                    </div>
                                </SettingRow>

                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label="Fill Opacity"
                                        tooltip="Controls polygon fill transparency. 0 = outline only (see-through), 0.3 = semi-transparent, 1 = solid opaque fill."
                                    />
                                )}>

                                    <NumericInput
                                        size="sm"
                                        value={config.highlightLayer?.fillOpacity ?? 0}
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        onChange={(value) => {
                                            const current = (config.highlightLayer || { enabled: true }) as any
                                            updateConfig('highlightLayer', { ...current, fillOpacity: value } as any)
                                        }}
                                        style={{ width: 80 }}
                                        aria-label="Fill opacity"
                                    />
                                    <p className="hint-text" style={{ marginTop: 4, marginBottom: 0 }}>
                                        0 = outline only, 1 = solid fill
                                    </p>
                                </SettingRow>

                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label="Output Spatial Reference (WKID)"
                                        tooltip="Override the automatic spatial reference detection. The widget now automatically uses the map view's coordinate system, but you can force a specific WKID if needed. Common values: 102100 (Web Mercator), 4326 (WGS84). Leave empty for automatic."
                                    />
                                )}>

                                    <NumericInput
                                        size="sm"
                                        value={config.highlightLayer?.outSpatialReference || null}
                                        min={1}
                                        max={999999}
                                        onChange={(value) => {
                                            const current = (config.highlightLayer || { enabled: true }) as any
                                            updateConfig('highlightLayer', { ...current, outSpatialReference: value || undefined } as any)
                                        }}
                                        style={{ width: 100 }}
                                        placeholder="Auto"
                                        aria-label="Output spatial reference WKID"
                                    />
                                    <p className="hint-text" style={{ marginTop: 4, marginBottom: 0 }}>
                                        Leave empty for automatic (uses map's WKID)
                                    </p>
                                </SettingRow>

                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label="Geometry Offset (Datum Correction)"
                                        tooltip="Manually offset highlight geometry to correct for datum misalignment (NAD83 vs WGS84). Use this if highlight appears shifted from the visible layer. Values are in map units (meters for UTM, feet for State Plane)."
                                    />
                                )}>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ fontSize: 12 }}>X:</span>
                                            <NumericInput
                                                size="sm"
                                                value={(config.highlightLayer as any)?.geometryOffsetX || 0}
                                                onChange={(value) => {
                                                    const current = (config.highlightLayer || { enabled: true }) as any
                                                    updateConfig('highlightLayer', { ...current, geometryOffsetX: value || 0 } as any)
                                                }}
                                                style={{ width: 70 }}
                                                placeholder="0"
                                                aria-label="Geometry X offset"
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ fontSize: 12 }}>Y:</span>
                                            <NumericInput
                                                size="sm"
                                                value={(config.highlightLayer as any)?.geometryOffsetY || 0}
                                                onChange={(value) => {
                                                    const current = (config.highlightLayer || { enabled: true }) as any
                                                    updateConfig('highlightLayer', { ...current, geometryOffsetY: value || 0 } as any)
                                                }}
                                                style={{ width: 70 }}
                                                placeholder="0"
                                                aria-label="Geometry Y offset"
                                            />
                                        </div>
                                    </div>
                                    <p className="hint-text" style={{ marginTop: 4, marginBottom: 0 }}>
                                        Positive X = East, Positive Y = North. For NW offset, try positive X and negative Y values.
                                    </p>
                                </SettingRow>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Property Preview Configuration */}
            <div className="collapsible-panel">
                <div
                    className="collapsible-panel-header"
                    onClick={() => togglePanel('property-preview')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && togglePanel('property-preview')}
                    aria-expanded={expandedPanels.has('property-preview')}
                >
                    <div className="collapsible-panel-header-left">
                        <span className="collapsible-panel-title">Property Preview</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('property-preview') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('property-preview') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <p className="hint-text">
                            Display a preview of the selected property with key attributes and a map thumbnail at the top of results.
                        </p>

                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label="Enable Property Preview"
                                tooltip="Shows a card at the top of results with a map thumbnail, address, key attributes, and action buttons (Zoom, Copy). Great for property reports."
                            />
                        )}>

                            <Switch
                                checked={config.propertyPreview?.enabled || false}
                                onChange={(e) => {
                                    const current = (config.propertyPreview || {}) as PropertyPreviewConfig
                                    updateConfig('propertyPreview', { ...current, enabled: (e.target as HTMLInputElement).checked })
                                }}
                                aria-label="Enable property preview"
                            />
                        </SettingRow>

                        {config.propertyPreview?.enabled && (
                            <>
                                <div className="subsection-divider">Map Preview</div>

                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label="Show Map Preview"
                                        tooltip="Display a small satellite/aerial map image in the preview card showing the property location with a pin marker."
                                    />
                                )}>

                                    <Switch
                                        checked={config.propertyPreview?.showMapPreview !== false}
                                        onChange={(e) => {
                                            const current = (config.propertyPreview || { enabled: true }) as PropertyPreviewConfig
                                            updateConfig('propertyPreview', { ...current, showMapPreview: (e.target as HTMLInputElement).checked })
                                        }}
                                        aria-label="Show map preview"
                                    />
                                </SettingRow>

                                {config.propertyPreview?.showMapPreview !== false && (
                                    <>
                                        <SettingRow flow="wrap" label={(
                                            <TooltipLabel
                                                label="Map Height (px)"
                                                tooltip="Height of the map preview image in pixels. Larger = more visible but takes more vertical space. 150px is a good default."
                                            />
                                        )}>

                                            <NumericInput
                                                size="sm"
                                                value={config.propertyPreview?.mapPreviewHeight || 150}
                                                min={80}
                                                max={300}
                                                onChange={(value) => {
                                                    const current = (config.propertyPreview || { enabled: true }) as PropertyPreviewConfig
                                                    updateConfig('propertyPreview', { ...current, mapPreviewHeight: value })
                                                }}
                                                style={{ width: 80 }}
                                            />
                                        </SettingRow>

                                        <SettingRow flow="wrap" label={(
                                            <TooltipLabel
                                                label="Highlight Color"
                                                tooltip="Color used to highlight the property boundary in the map preview (if highlight layer is configured)."
                                            />
                                        )}>

                                            <div className="input-row">
                                                <input
                                                    type="color"
                                                    value={config.propertyPreview?.highlightColor || '#00FFFF'}
                                                    onChange={(e) => {
                                                        const current = (config.propertyPreview || { enabled: true }) as PropertyPreviewConfig
                                                        updateConfig('propertyPreview', { ...current, highlightColor: e.target.value })
                                                    }}
                                                    style={{ width: 40, height: 28, padding: 0, border: 'none' }}
                                                />
                                                <TextInput
                                                    size="sm"
                                                    value={config.propertyPreview?.highlightColor || '#00FFFF'}
                                                    onChange={(e) => {
                                                        const current = (config.propertyPreview || { enabled: true }) as PropertyPreviewConfig
                                                        updateConfig('propertyPreview', { ...current, highlightColor: e.target.value })
                                                    }}
                                                    style={{ width: 90 }}
                                                />
                                            </div>
                                        </SettingRow>
                                    </>
                                )}

                                <div className="subsection-divider">Attribute Display</div>

                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label="Show Attributes"
                                        tooltip="Display header info fields in the preview card. Shows key property details below the address."
                                    />
                                )}>
                                    <Switch
                                        checked={config.propertyPreview?.showAttributes !== false}
                                        onChange={(e) => {
                                            const current = (config.propertyPreview || { enabled: true }) as PropertyPreviewConfig
                                            updateConfig('propertyPreview', { ...current, showAttributes: (e.target as HTMLInputElement).checked })
                                        }}
                                        aria-label="Show attributes in property preview"
                                    />
                                </SettingRow>

                                {config.propertyPreview?.showAttributes !== false && (
                                    <SettingRow flow="wrap" label={(
                                        <TooltipLabel
                                            label="Attribute Layout"
                                            tooltip="'Horizontal' = inline row, 'Vertical' = stacked list, 'Grid' = 2-column grid. Choose based on number of fields and space."
                                        />
                                    )}>
                                        <Select
                                            size="sm"
                                            value={config.propertyPreview?.attributeLayout || 'horizontal'}
                                            onChange={(e) => {
                                                const current = (config.propertyPreview || { enabled: true }) as PropertyPreviewConfig
                                                updateConfig('propertyPreview', { ...current, attributeLayout: e.target.value as any })
                                            }}
                                        >
                                            <Option value="horizontal">Horizontal</Option>
                                            <Option value="vertical">Vertical</Option>
                                            <Option value="grid">Grid</Option>
                                        </Select>
                                    </SettingRow>
                                )}

                                <div className="subsection-divider">Actions</div>

                                <div className="display-options-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
                                    <label className="display-option">
                                        <Checkbox
                                            checked={config.propertyPreview?.showZoomButton !== false}
                                            onChange={(e) => {
                                                const current = (config.propertyPreview || { enabled: true }) as PropertyPreviewConfig
                                                updateConfig('propertyPreview', { ...current, showZoomButton: (e.target as HTMLInputElement).checked })
                                            }}
                                        />
                                        <span>Zoom Button</span>
                                    </label>
                                    <label className="display-option">
                                        <Checkbox
                                            checked={config.propertyPreview?.showCopyButton !== false}
                                            onChange={(e) => {
                                                const current = (config.propertyPreview || { enabled: true }) as PropertyPreviewConfig
                                                updateConfig('propertyPreview', { ...current, showCopyButton: (e.target as HTMLInputElement).checked })
                                            }}
                                        />
                                        <span>Copy Address</span>
                                    </label>
                                </div>

                                <p className="hint-text" style={{ marginTop: '8px' }}>
                                    Attributes are automatically populated from Header Info fields. Configure those fields in the Header Info Layer section above.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Report Sections Configuration */}
            <div className="collapsible-panel">
                <div
                    className="collapsible-panel-header"
                    onClick={() => togglePanel('report-sections')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && togglePanel('report-sections')}
                    aria-expanded={expandedPanels.has('report-sections')}
                >
                    <div className="collapsible-panel-header-left">
                        <span className="collapsible-panel-title">Report Sections</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('report-sections') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('report-sections') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <p className="hint-text">
                            Configure sections for the property report. Each section can contain multiple data layers.
                        </p>

                        {sections.length === 0 ? (
                            <div className="empty-state">
                                <DataIcon />
                                <span>No report sections configured</span>
                            </div>
                        ) : (
                            sections.map((section, sectionIndex) => {
                                const isSectionExpanded = expandedSections.has(section.sectionId)
                                const layers = toMutableLayers(section.layers)
                                const isFirst = sectionIndex === 0
                                const isLast = sectionIndex === sections.length - 1

                                return (
                                    <div className="list-item-card" key={section.sectionId}>
                                        <div
                                            className="list-item-header"
                                            onClick={() => toggleSectionExpand(section.sectionId)}
                                            role="button"
                                            tabIndex={0}
                                            aria-expanded={isSectionExpanded}
                                            onKeyDown={(e) => e.key === 'Enter' && toggleSectionExpand(section.sectionId)}
                                        >
                                            <div className="list-item-header-left">
                                                {/* Reorder buttons */}
                                                <div className="reorder-buttons" onClick={(e) => e.stopPropagation()}>
                                                    <Tip title="Move up" placement="left">
                                                        <button
                                                            className="reorder-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                moveSection(section.sectionId, 'up')
                                                            }}
                                                            disabled={isFirst}
                                                            aria-label="Move section up"
                                                        >
                                                            <MoveUpIcon />
                                                        </button>
                                                    </Tip>
                                                    <Tip title="Move down" placement="left">
                                                        <button
                                                            className="reorder-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                moveSection(section.sectionId, 'down')
                                                            }}
                                                            disabled={isLast}
                                                            aria-label="Move section down"
                                                        >
                                                            <MoveDownIcon />
                                                        </button>
                                                    </Tip>
                                                </div>
                                                <span className="expand-icon">
                                                    {isSectionExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                                                </span>
                                                <span className="list-item-title">{section.sectionTitle}</span>
                                                <span className="item-badge item-badge-secondary">
                                                    {layers.length} layer{layers.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className="list-item-actions">
                                                <Tip title="Remove section" placement="top">
                                                    <button
                                                        className="delete-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            removeSection(section.sectionId)
                                                        }}
                                                        aria-label={`Remove ${section.sectionTitle}`}
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </Tip>
                                            </div>
                                        </div>

                                        <div style={{ display: isSectionExpanded ? 'block' : 'none' }}>
                                            <div className="list-item-content">
                                                <div className="subsection-divider">Section Settings</div>

                                                <SettingRow flow="wrap" label={(
                                                    <TooltipLabel
                                                        label="Section Title"
                                                        tooltip="Display name for this section in the results panel and PDF report. Use descriptive titles like 'Zoning Information' or 'Utilities'."
                                                    />
                                                )}>

                                                    <TextInput
                                                        size="sm"
                                                        value={section.sectionTitle}
                                                        onChange={(e) => updateSection(section.sectionId, { sectionTitle: e.target.value })}
                                                        aria-label="Section title"
                                                    />
                                                </SettingRow>

                                                <SettingRow flow="wrap" label={(
                                                    <TooltipLabel
                                                        label="Exclude from PDF"
                                                        tooltip="When enabled, this entire section will be hidden from PDF exports but still visible in the widget. Useful for internal-only data."
                                                    />
                                                )}>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Switch
                                                            checked={section.excludeFromPdf || false}
                                                            onChange={(e) => updateSection(section.sectionId, { excludeFromPdf: (e.target as HTMLInputElement).checked })}
                                                            aria-label="Exclude this section from PDF export"
                                                        />
                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                            {section.excludeFromPdf ? 'Section will NOT appear in PDF exports' : 'Section will appear in PDF exports'}
                                                        </span>
                                                    </div>
                                                </SettingRow>

                                                <SettingRow flow="wrap" label={(
                                                    <TooltipLabel
                                                        label="Display Options"
                                                        tooltip="Choose how data is presented: Table shows rows/columns, Chart creates a visualization. You can enable both for comprehensive display."
                                                    />
                                                )}>

                                                    <div className="display-options-row">
                                                        <label className="display-option">
                                                            <Checkbox
                                                                checked={section.displayAsTable}
                                                                onChange={(e) => updateSection(section.sectionId, { displayAsTable: (e.target as HTMLInputElement).checked })}
                                                            />
                                                            <span>Table</span>
                                                        </label>
                                                        <label className="display-option">
                                                            <Checkbox
                                                                checked={section.displayAsChart}
                                                                onChange={(e) => updateSection(section.sectionId, { displayAsChart: (e.target as HTMLInputElement).checked })}
                                                            />
                                                            <span>Chart</span>
                                                        </label>
                                                    </div>
                                                </SettingRow>

                                                <SettingRow flow="wrap" label={(
                                                    <TooltipLabel
                                                        label="Display Pane"
                                                        tooltip="'Inline' shows results in the main panel. 'Separate Pane' opens results in a dedicated sliding panel - useful for large datasets."
                                                    />
                                                )}>

                                                    <Select
                                                        size="sm"
                                                        value={section.displayPane || 'inline'}
                                                        onChange={(e) => updateSection(section.sectionId, { displayPane: e.target.value as any })}
                                                    >
                                                        <Option value="inline">Inline (Results Panel)</Option>
                                                        <Option value="separate">Separate Pane</Option>
                                                    </Select>
                                                </SettingRow>

                                                <SettingRow flow="wrap" label={(
                                                    <TooltipLabel
                                                        label="Default Expanded State"
                                                        tooltip="Initial collapse state when results load. 'Expanded' shows data immediately; 'Collapsed' hides data until user clicks to expand."
                                                    />
                                                )}>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Select
                                                            size="sm"
                                                            value={section.expanded === false ? 'collapsed' : 'expanded'}
                                                            onChange={(e) => updateSection(section.sectionId, { expanded: e.target.value === 'expanded' })}
                                                        >
                                                            <Option value="expanded">Expanded</Option>
                                                            <Option value="collapsed">Collapsed</Option>
                                                        </Select>
                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                            {section.expanded === false ? 'Section starts collapsed when results load' : 'Section starts expanded when results load'}
                                                        </span>
                                                    </div>
                                                </SettingRow>

                                                <SettingRow flow="wrap" label={(
                                                    <TooltipLabel
                                                        label="Section alerts"
                                                        tooltip="Rules evaluated against this section's results. When a rule matches, a banner appears at the top of the section. Example: field FLOODZONE, operator does not equal, value X, message: This property may be in a flood zone."
                                                    />
                                                )}>
                                                    <div style={{ width: '100%' }}>
                                                        {getSectionAlerts(section).map((al: any, ai: number) => (
                                                            <div key={al.alertId || ai} style={{ border: '1px solid var(--sys-color-divider-secondary, #e0e0e0)', borderRadius: 4, padding: 6, marginBottom: 6 }}>
                                                                <TextInput size="sm" placeholder="Field name (e.g. FLOODZONE)" value={al.field || ''} onChange={(e) => updateSectionAlert(section, ai, { field: e.target.value })} style={{ marginBottom: 4 }} aria-label="Alert field name" />
                                                                <Select size="sm" value={al.operator || 'equals'} onChange={(e) => updateSectionAlert(section, ai, { operator: (e.target as HTMLSelectElement).value })} style={{ marginBottom: 4 }} aria-label="Alert operator">
                                                                    <Option value="equals">equals</Option>
                                                                    <Option value="notEquals">does not equal</Option>
                                                                    <Option value="contains">contains</Option>
                                                                    <Option value="greaterThan">greater than</Option>
                                                                    <Option value="lessThan">less than</Option>
                                                                    <Option value="isEmpty">is empty</Option>
                                                                    <Option value="isNotEmpty">is not empty</Option>
                                                                </Select>
                                                                {al.operator !== 'isEmpty' && al.operator !== 'isNotEmpty' && (
                                                                    <TextInput size="sm" placeholder="Value to compare" value={al.value || ''} onChange={(e) => updateSectionAlert(section, ai, { value: e.target.value })} style={{ marginBottom: 4 }} aria-label="Alert comparison value" />
                                                                )}
                                                                <TextInput size="sm" placeholder="Banner message" value={al.message || ''} onChange={(e) => updateSectionAlert(section, ai, { message: e.target.value })} style={{ marginBottom: 4 }} aria-label="Alert banner message" />
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                    <Select size="sm" value={al.severity || 'warning'} onChange={(e) => updateSectionAlert(section, ai, { severity: (e.target as HTMLSelectElement).value })} aria-label="Alert severity" style={{ width: 110 }}>
                                                                        <Option value="info">Info</Option>
                                                                        <Option value="warning">Warning</Option>
                                                                        <Option value="critical">Critical</Option>
                                                                    </Select>
                                                                    <Button size="sm" type="tertiary" onClick={() => removeSectionAlert(section, ai)} aria-label="Remove this alert">Remove</Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <Button size="sm" onClick={() => addSectionAlert(section)} aria-label="Add a new alert rule">Add alert</Button>
                                                    </div>
                                                </SettingRow>

                                                {section.displayPane === 'separate' && (
                                                    <>
                                                        <SettingRow flow="wrap" label="Pane Title">
                                                            <TextInput
                                                                size="sm"
                                                                value={section.separatePaneTitle || ''}
                                                                placeholder={section.sectionTitle || 'Section Details'}
                                                                onChange={(e) => updateSection(section.sectionId, { separatePaneTitle: e.target.value })}
                                                            />
                                                        </SettingRow>
                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label="Record Threshold"
                                                                tooltip="Only open in separate pane when the result count reaches this number. Set to 0 to always use separate pane. Useful for conditionally handling large datasets."
                                                            />
                                                        )}>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <NumericInput
                                                                    size="sm"
                                                                    value={section.separatePaneThreshold || 0}
                                                                    min={0}
                                                                    onChange={(value) => updateSection(section.sectionId, { separatePaneThreshold: value })}
                                                                    style={{ width: 70 }}
                                                                />
                                                                <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                    {(section.separatePaneThreshold || 0) === 0 ? 'Always use separate pane' : `Use separate pane when ≥ ${section.separatePaneThreshold} records`}
                                                                </span>
                                                            </div>
                                                        </SettingRow>
                                                    </>
                                                )}

                                                {section.displayAsTable && (
                                                    <>
                                                        <div className="subsection-divider">Table Configuration</div>
                                                        <p className="hint-text">
                                                            Sorting and resizing only apply when multiple records are displayed.
                                                        </p>

                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label="Column Sorting"
                                                                tooltip="Allow users to click column headers to sort data. Only active when multiple records are returned."
                                                            />
                                                        )}>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Switch
                                                                    checked={section.tableConfig?.enableSorting !== false}
                                                                    onChange={(e) => updateSectionTableConfig(section.sectionId, { enableSorting: (e.target as HTMLInputElement).checked })}
                                                                    aria-label="Enable column sorting"
                                                                />
                                                                <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                    Allow users to sort by column
                                                                </span>
                                                            </div>
                                                        </SettingRow>

                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label="Column Resizing"
                                                                tooltip="Allow users to drag column borders to resize widths. Useful for tables with varying content lengths."
                                                            />
                                                        )}>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Switch
                                                                    checked={section.tableConfig?.resizableColumns || false}
                                                                    onChange={(e) => updateSectionTableConfig(section.sectionId, { resizableColumns: (e.target as HTMLInputElement).checked })}
                                                                    aria-label="Enable column resizing"
                                                                />
                                                                <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                    Allow users to resize columns
                                                                </span>
                                                            </div>
                                                        </SettingRow>

                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label="Striped Rows"
                                                                tooltip="Alternate row background colors (zebra striping) to improve readability of multi-row tables."
                                                            />
                                                        )}>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Switch
                                                                    checked={section.tableConfig?.stripedRows !== false}
                                                                    onChange={(e) => updateSectionTableConfig(section.sectionId, { stripedRows: (e.target as HTMLInputElement).checked })}
                                                                    aria-label="Enable striped rows"
                                                                />
                                                                <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                    Alternating row colors
                                                                </span>
                                                            </div>
                                                        </SettingRow>

                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label="Highlight on Hover"
                                                                tooltip="Show a visual highlight when the user hovers over a table row. Helps track which row is being viewed."
                                                            />
                                                        )}>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Switch
                                                                    checked={section.tableConfig?.highlightOnHover !== false}
                                                                    onChange={(e) => updateSectionTableConfig(section.sectionId, { highlightOnHover: (e.target as HTMLInputElement).checked })}
                                                                    aria-label="Enable highlight on hover"
                                                                />
                                                                <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                    Highlight row on hover
                                                                </span>
                                                            </div>
                                                        </SettingRow>

                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label="Compact Mode"
                                                                tooltip="Reduce row padding to fit more data in less vertical space. Useful for dense information displays."
                                                            />
                                                        )}>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Switch
                                                                    checked={section.tableConfig?.compactMode || false}
                                                                    onChange={(e) => updateSectionTableConfig(section.sectionId, { compactMode: (e.target as HTMLInputElement).checked })}
                                                                    aria-label="Enable compact mode"
                                                                />
                                                                <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                    Reduce row padding
                                                                </span>
                                                            </div>
                                                        </SettingRow>

                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label="Pagination"
                                                                tooltip="Split large tables into pages. Improves performance and usability for datasets with many records."
                                                            />
                                                        )}>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Switch
                                                                    checked={section.tableConfig?.enablePagination !== false}
                                                                    onChange={(e) => updateSectionTableConfig(section.sectionId, { enablePagination: (e.target as HTMLInputElement).checked })}
                                                                    aria-label="Enable pagination"
                                                                />
                                                                <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                    Paginate large tables
                                                                </span>
                                                            </div>
                                                        </SettingRow>

                                                        {section.tableConfig?.enablePagination !== false && (
                                                            <SettingRow flow="wrap" label={(
                                                                <TooltipLabel
                                                                    label="Page Size"
                                                                    tooltip="Number of rows to display per page. Smaller values load faster; larger values show more data at once."
                                                                />
                                                            )}>

                                                                <NumericInput
                                                                    size="sm"
                                                                    value={section.tableConfig?.pageSize || 10}
                                                                    min={1}
                                                                    max={100}
                                                                    onChange={(value) => updateSectionTableConfig(section.sectionId, { pageSize: value })}
                                                                    style={{ width: 70 }}
                                                                />
                                                            </SettingRow>
                                                        )}
                                                    </>
                                                )}

                                                {section.displayAsChart && (
                                                    <>
                                                        <div className="subsection-divider">Chart Configuration</div>

                                                        {/* Chart Mode Toggle */}
                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label="Chart Mode"
                                                                tooltip="'Group by Category' aggregates records by a category field (e.g., count zones). 'Compare Fields' shows multiple numeric fields side-by-side."
                                                            />
                                                        )}>
                                                            <Select
                                                                size="sm"
                                                                value={section.chartConfig?.chartMode || 'category'}
                                                                onChange={(e) => updateSectionChartConfig(section.sectionId, { chartMode: e.target.value as ChartMode })}
                                                                aria-label="Chart mode"
                                                            >
                                                                <Option value="category">Group by Category</Option>
                                                                <Option value="fields">Compare Fields</Option>
                                                            </Select>
                                                        </SettingRow>
                                                        <p className="hint-text" style={{ marginTop: '4px', marginBottom: '8px' }}>
                                                            {section.chartConfig?.chartMode === 'fields'
                                                                ? 'Compare values of multiple numeric fields directly'
                                                                : 'Group records by a category field and aggregate values'
                                                            }
                                                        </p>

                                                        {/* CATEGORY MODE */}
                                                        {(section.chartConfig?.chartMode || 'category') === 'category' && (
                                                            <>
                                                                {/* Category Field (X-axis / Labels) */}
                                                                <SettingRow flow="wrap" label={(
                                                                    <TooltipLabel
                                                                        label="Category Field"
                                                                        tooltip="Field used to group data (e.g., ZONE_TYPE, DISTRICT). Each unique value becomes a bar/slice in the chart."
                                                                    />
                                                                )}>
                                                                    <Select
                                                                        size="sm"
                                                                        value={section.chartField || section.chartConfig?.categoryField || ''}
                                                                        onChange={(e) => {
                                                                            updateSection(section.sectionId, { chartField: e.target.value })
                                                                            updateSectionChartConfig(section.sectionId, { categoryField: e.target.value })
                                                                        }}
                                                                        aria-label="Category field for chart labels"
                                                                    >
                                                                        <Option value="">-- Select Category Field --</Option>
                                                                        {getSectionFields(section).map(field => (
                                                                            <Option key={field.name} value={field.name}>
                                                                                {field.alias || field.name}
                                                                            </Option>
                                                                        ))}
                                                                    </Select>
                                                                </SettingRow>

                                                                {/* Aggregation Type */}
                                                                <SettingRow flow="wrap" label={(
                                                                    <TooltipLabel
                                                                        label="Aggregation"
                                                                        tooltip="How to calculate chart values: Count = number of records, Sum/Avg/Min/Max = aggregate a numeric value field."
                                                                    />
                                                                )}>
                                                                    <Select
                                                                        size="sm"
                                                                        value={section.chartConfig?.aggregation || 'count'}
                                                                        onChange={(e) => updateSectionChartConfig(section.sectionId, { aggregation: e.target.value as AggregationType })}
                                                                        aria-label="Aggregation type"
                                                                    >
                                                                        <Option value="count">Count Records</Option>
                                                                        <Option value="sum">Sum Values</Option>
                                                                        <Option value="avg">Average Values</Option>
                                                                        <Option value="min">Minimum Value</Option>
                                                                        <Option value="max">Maximum Value</Option>
                                                                    </Select>
                                                                </SettingRow>

                                                                {/* Value Field (only shown when not using Count) */}
                                                                {section.chartConfig?.aggregation && section.chartConfig.aggregation !== 'count' && (
                                                                    <>
                                                                        <SettingRow flow="wrap" label={(
                                                                            <TooltipLabel
                                                                                label="Value Field"
                                                                                tooltip="Numeric field to aggregate (sum, average, etc.). Required when not using Count aggregation."
                                                                            />
                                                                        )}>
                                                                            <Select
                                                                                size="sm"
                                                                                value={section.chartConfig?.valueField || ''}
                                                                                onChange={(e) => updateSectionChartConfig(section.sectionId, { valueField: e.target.value })}
                                                                                aria-label="Numeric value field to aggregate"
                                                                            >
                                                                                <Option value="">-- Select Numeric Field --</Option>
                                                                                {getSectionNumericFields(section).map(field => (
                                                                                    <Option key={field.name} value={field.name}>
                                                                                        {field.alias || field.name}
                                                                                    </Option>
                                                                                ))}
                                                                            </Select>
                                                                        </SettingRow>
                                                                        {getSectionNumericFields(section).length === 0 && (
                                                                            <NativeAlert type="warning" text="No numeric fields available. Add layers with numeric fields." style={{ marginBottom: '12px' }} />
                                                                        )}
                                                                    </>
                                                                )}
                                                            </>
                                                        )}

                                                        {/* FIELDS COMPARISON MODE */}
                                                        {section.chartConfig?.chartMode === 'fields' && (
                                                            <>
                                                                <SettingRow flow="wrap" label={(
                                                                    <TooltipLabel
                                                                        label="Compare Fields"
                                                                        tooltip="Select numeric fields to compare side-by-side. Each field becomes a bar/series in the chart. Great for comparing metrics like area, value, count."
                                                                    />
                                                                )}>
                                                                    <div style={{ width: '100%' }}>
                                                                        {getSectionNumericFields(section).length === 0 ? (
                                                                            <NativeAlert type="info" text="Add data layers with numeric fields to enable field comparison." />
                                                                        ) : (
                                                                            <div className="field-checkbox-list" style={{
                                                                                maxHeight: '200px',
                                                                                overflowY: 'auto',
                                                                                border: '1px solid var(--sys-color-divider-primary)',
                                                                                borderRadius: '4px',
                                                                                padding: '8px'
                                                                            }}>
                                                                                {getSectionNumericFields(section).map((field, idx) => {
                                                                                    const compareFields = section.chartConfig?.compareFields || []
                                                                                    const fieldConfig = compareFields.find(f => f.fieldName === field.name)
                                                                                    const isEnabled = fieldConfig?.enabled ?? false
                                                                                    const fieldColor = fieldConfig?.color || CHART_COLORS[idx % CHART_COLORS.length]

                                                                                    return (
                                                                                        <div key={field.name} className="field-checkbox-item" style={{
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            gap: '8px',
                                                                                            padding: '6px 4px',
                                                                                            borderBottom: '1px solid var(--sys-color-divider-secondary)'
                                                                                        }}>
                                                                                            <Checkbox
                                                                                                checked={isEnabled}
                                                                                                onChange={(e) => {
                                                                                                    const checked = (e.target as HTMLInputElement).checked
                                                                                                    const newCompareFields = [...compareFields]
                                                                                                    const existingIdx = newCompareFields.findIndex(f => f.fieldName === field.name)

                                                                                                    if (existingIdx >= 0) {
                                                                                                        newCompareFields[existingIdx] = { ...newCompareFields[existingIdx], enabled: checked }
                                                                                                    } else {
                                                                                                        newCompareFields.push({
                                                                                                            fieldName: field.name,
                                                                                                            alias: field.alias || field.name,
                                                                                                            color: CHART_COLORS[newCompareFields.length % CHART_COLORS.length],
                                                                                                            enabled: checked
                                                                                                        })
                                                                                                    }
                                                                                                    updateSectionChartConfig(section.sectionId, { compareFields: newCompareFields })
                                                                                                }}
                                                                                            />
                                                                                            <div
                                                                                                style={{
                                                                                                    width: '12px',
                                                                                                    height: '12px',
                                                                                                    borderRadius: '2px',
                                                                                                    backgroundColor: isEnabled ? fieldColor : 'var(--sys-color-divider-primary)',
                                                                                                    flexShrink: 0
                                                                                                }}
                                                                                            />
                                                                                            <span style={{
                                                                                                flex: 1,
                                                                                                fontSize: '12px',
                                                                                                opacity: isEnabled ? 1 : 0.6
                                                                                            }}>
                                                                                                {field.alias || field.name}
                                                                                            </span>
                                                                                            {isEnabled && (
                                                                                                <input
                                                                                                    type="color"
                                                                                                    value={fieldColor}
                                                                                                    onChange={(e) => {
                                                                                                        const newCompareFields = [...compareFields]
                                                                                                        const existingIdx = newCompareFields.findIndex(f => f.fieldName === field.name)
                                                                                                        if (existingIdx >= 0) {
                                                                                                            newCompareFields[existingIdx] = { ...newCompareFields[existingIdx], color: e.target.value }
                                                                                                            updateSectionChartConfig(section.sectionId, { compareFields: newCompareFields })
                                                                                                        }
                                                                                                    }}
                                                                                                    style={{
                                                                                                        width: '24px',
                                                                                                        height: '20px',
                                                                                                        padding: 0,
                                                                                                        border: 'none',
                                                                                                        cursor: 'pointer'
                                                                                                    }}
                                                                                                    title="Change series color"
                                                                                                />
                                                                                            )}
                                                                                        </div>
                                                                                    )
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </SettingRow>
                                                                <p className="hint-text" style={{ marginTop: '4px', marginBottom: '8px' }}>
                                                                    Select fields to compare. Each field becomes a series in the chart.
                                                                </p>

                                                                {/* Optional grouping for field comparison */}
                                                                <SettingRow flow="wrap" label={(
                                                                    <TooltipLabel
                                                                        label="Group By (Optional)"
                                                                        tooltip="Optionally split field comparison by a category. Without grouping, values are summed across all records; with grouping, each category gets its own bar group."
                                                                    />
                                                                )}>
                                                                    <Select
                                                                        size="sm"
                                                                        value={section.chartConfig?.groupByField || ''}
                                                                        onChange={(e) => updateSectionChartConfig(section.sectionId, { groupByField: e.target.value })}
                                                                        aria-label="Optional grouping field"
                                                                    >
                                                                        <Option value="">-- No Grouping (Sum All) --</Option>
                                                                        {getSectionFields(section).map(field => (
                                                                            <Option key={field.name} value={field.name}>
                                                                                {field.alias || field.name}
                                                                            </Option>
                                                                        ))}
                                                                    </Select>
                                                                </SettingRow>
                                                                <p className="hint-text" style={{ marginTop: '4px', marginBottom: '8px' }}>
                                                                    Optionally group the field comparison by a category
                                                                </p>
                                                            </>
                                                        )}

                                                        {/* Chart Type */}
                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label="Chart Type"
                                                                tooltip="Bar/Area/Line best for comparisons, Pie/Donut for proportions. Radial Bar offers unique circular visualization."
                                                            />
                                                        )}>
                                                            <Select
                                                                size="sm"
                                                                value={section.chartConfig?.chartType || config.defaultChartConfig?.chartType || 'bar'}
                                                                onChange={(e) => updateSectionChartConfig(section.sectionId, { chartType: e.target.value as ChartType })}
                                                                aria-label="Chart type"
                                                            >
                                                                <Option value="bar">Bar Chart</Option>
                                                                <Option value="pie">Pie Chart</Option>
                                                                <Option value="donut">Donut Chart</Option>
                                                                <Option value="area">Area Chart</Option>
                                                                <Option value="line">Line Chart</Option>
                                                                <Option value="radialBar">Radial Bar</Option>
                                                            </Select>
                                                        </SettingRow>

                                                        {/* Sort Options - only for category mode */}
                                                        {(section.chartConfig?.chartMode || 'category') === 'category' && (
                                                            <div className="input-row">
                                                                <div style={{ flex: 1 }}>
                                                                    <SettingRow flow="wrap" label={(
                                                                        <TooltipLabel
                                                                            label="Sort By"
                                                                            tooltip="How to order chart categories: by Value (numeric), by Label (alphabetical), or None (data order)."
                                                                        />
                                                                    )}>
                                                                        <Select
                                                                            size="sm"
                                                                            value={section.chartConfig?.sortBy || 'value'}
                                                                            onChange={(e) => updateSectionChartConfig(section.sectionId, { sortBy: e.target.value as any })}
                                                                        >
                                                                            <Option value="value">Value</Option>
                                                                            <Option value="label">Label</Option>
                                                                            <Option value="none">None</Option>
                                                                        </Select>
                                                                    </SettingRow>
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <SettingRow flow="wrap" label={(
                                                                        <TooltipLabel
                                                                            label="Order"
                                                                            tooltip="Descending shows largest values first; ascending shows smallest first."
                                                                        />
                                                                    )}>
                                                                        <Select
                                                                            size="sm"
                                                                            value={section.chartConfig?.sortOrder || 'desc'}
                                                                            onChange={(e) => updateSectionChartConfig(section.sectionId, { sortOrder: e.target.value as any })}
                                                                        >
                                                                            <Option value="desc">Descending</Option>
                                                                            <Option value="asc">Ascending</Option>
                                                                        </Select>
                                                                    </SettingRow>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Max Categories - only for category mode */}
                                                        {(section.chartConfig?.chartMode || 'category') === 'category' && (
                                                            <>
                                                                <SettingRow flow="wrap" label={(
                                                                    <TooltipLabel
                                                                        label="Max Categories"
                                                                        tooltip="Limit number of chart categories displayed. Additional categories are grouped into 'Other'. Prevents overcrowded charts."
                                                                    />
                                                                )}>
                                                                    <NumericInput
                                                                        size="sm"
                                                                        value={section.chartConfig?.maxCategories || 10}
                                                                        min={3}
                                                                        max={50}
                                                                        onChange={(value) => updateSectionChartConfig(section.sectionId, { maxCategories: value })}
                                                                        style={{ width: 80 }}
                                                                    />
                                                                </SettingRow>
                                                                <p className="hint-text" style={{ marginTop: '4px', marginBottom: '8px' }}>
                                                                    Extra categories grouped as "Other"
                                                                </p>
                                                            </>
                                                        )}

                                                        {/* Stacked option for multi-series */}
                                                        {section.chartConfig?.chartMode === 'fields' && (section.chartConfig?.chartType === 'bar' || section.chartConfig?.chartType === 'area') && (
                                                            <SettingRow flow="wrap" label={(<TooltipLabel label="Stacked" tooltip="Stack bar/area segments on top of each other instead of side by side." />)}>
                                                                <Switch
                                                                    checked={section.chartConfig?.stacked || false}
                                                                    onChange={(e) => updateSectionChartConfig(section.sectionId, { stacked: (e.target as HTMLInputElement).checked })}
                                                                />
                                                            </SettingRow>
                                                        )}

                                                        {/* Display Options */}
                                                        <SettingRow flow="wrap" label="Display Options">
                                                            <div className="display-options-row">
                                                                <label className="display-option">
                                                                    <Checkbox
                                                                        checked={section.chartConfig?.showLegend !== false}
                                                                        onChange={(e) => updateSectionChartConfig(section.sectionId, { showLegend: (e.target as HTMLInputElement).checked })}
                                                                    />
                                                                    <span>Legend</span>
                                                                </label>
                                                                <label className="display-option">
                                                                    <Checkbox
                                                                        checked={section.chartConfig?.showValues || false}
                                                                        onChange={(e) => updateSectionChartConfig(section.sectionId, { showValues: (e.target as HTMLInputElement).checked })}
                                                                    />
                                                                    <span>Values</span>
                                                                </label>
                                                                <label className="display-option">
                                                                    <Checkbox
                                                                        checked={section.chartConfig?.showGrid !== false}
                                                                        onChange={(e) => updateSectionChartConfig(section.sectionId, { showGrid: (e.target as HTMLInputElement).checked })}
                                                                    />
                                                                    <span>Grid</span>
                                                                </label>
                                                            </div>
                                                        </SettingRow>

                                                        {/* Chart Height */}
                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label="Chart Height (px)"
                                                                tooltip="Height of the chart in pixels. 200px is good for dashboards, 300-400px for detailed analysis. Maximum 500px."
                                                            />
                                                        )}>
                                                            <NumericInput
                                                                size="sm"
                                                                value={section.chartConfig?.height || config.defaultChartConfig?.height || 200}
                                                                min={100}
                                                                max={500}
                                                                onChange={(value) => updateSectionChartConfig(section.sectionId, { height: value })}
                                                                style={{ width: 80 }}
                                                            />
                                                        </SettingRow>

                                                        {/* Chart Description */}
                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label="Chart Description"
                                                                tooltip="Optional explanatory text shown with the chart. Supports HTML and {field} placeholders for dynamic values."
                                                            />
                                                        )}>
                                                            <TextArea
                                                                value={section.chartConfig?.chartDescription || ''}
                                                                onChange={(e) => updateSectionChartConfig(section.sectionId, { chartDescription: e.target.value })}
                                                                placeholder="Optional HTML description to explain the chart. Supports {field} placeholders, links, and basic HTML."
                                                                style={{ width: '100%', minHeight: '60px', fontSize: '12px' }}
                                                            />
                                                        </SettingRow>

                                                        {section.chartConfig?.chartDescription && (
                                                            <SettingRow flow="wrap" label={(
                                                                <TooltipLabel
                                                                    label="Description Position"
                                                                    tooltip="Where to display the description relative to the chart. 'Above' provides context first; 'Below' works as a caption."
                                                                />
                                                            )}>
                                                                <Select
                                                                    size="sm"
                                                                    value={section.chartConfig?.chartDescriptionPosition || 'after'}
                                                                    onChange={(e) => updateSectionChartConfig(section.sectionId, { chartDescriptionPosition: e.target.value as any })}
                                                                    style={{ width: '100%' }}
                                                                >
                                                                    <Option value="before">Above Chart</Option>
                                                                    <Option value="after">Below Chart</Option>
                                                                </Select>
                                                            </SettingRow>
                                                        )}

                                                        {/* Exclude Chart from PDF */}
                                                        <SettingRow flow="wrap" label="Show in Widget Only">
                                                            <Switch
                                                                checked={section.chartExcludeFromPdf || false}
                                                                onChange={(e) => updateSection(section.sectionId, { chartExcludeFromPdf: (e.target as HTMLInputElement).checked })}
                                                            />
                                                        </SettingRow>
                                                        <p className="hint-text" style={{ marginTop: '4px', marginBottom: '8px' }}>
                                                            When enabled, chart displays in widget but is excluded from PDF export
                                                        </p>

                                                        {getSectionFields(section).length === 0 && (
                                                            <NativeAlert
                                                                type="info"
                                                                text="Add data layers below and configure their data sources to see available fields for charting."
                                                                style={{ marginTop: '8px' }}
                                                            />
                                                        )}
                                                    </>
                                                )}

                                                <div className="subsection-divider">Data Layers ({layers.length})</div>

                                                {layers.length === 0 ? (
                                                    <div className="empty-state" style={{ padding: '16px' }}>
                                                        <LayersIcon />
                                                        <span>No layers in this section</span>
                                                    </div>
                                                ) : (
                                                    layers.map((layer) => {
                                                        const isLayerExpanded = expandedLayers.has(layer.layerId)
                                                        const layerFields = getLayerFields(layer)
                                                        const selectedFields = toMutableFields(layer.fields)

                                                        return (
                                                            <div className="nested-list-item" key={layer.layerId}>
                                                                <div
                                                                    className="nested-item-header"
                                                                    onClick={() => toggleLayerExpand(layer.layerId)}
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    aria-expanded={isLayerExpanded}
                                                                    onKeyDown={(e) => e.key === 'Enter' && toggleLayerExpand(layer.layerId)}
                                                                >
                                                                    <div className="list-item-header-left">
                                                                        <span className="expand-icon">
                                                                            {isLayerExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                                                                        </span>
                                                                        <span className="list-item-title" style={{ fontSize: '12px' }}>
                                                                            {layer.layerTitle || 'Untitled Layer'}
                                                                        </span>
                                                                        <span className="item-badge" style={{ fontSize: '10px', padding: '1px 6px' }}>
                                                                            {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''}
                                                                        </span>
                                                                    </div>
                                                                    <Tip title="Remove layer" placement="top">
                                                                        <button
                                                                            className="delete-btn"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                removeLayerFromSection(section.sectionId, layer.layerId)
                                                                            }}
                                                                            aria-label={`Remove ${layer.layerTitle || 'layer'}`}
                                                                        >
                                                                            <TrashIcon />
                                                                        </button>
                                                                    </Tip>
                                                                </div>

                                                                <div style={{ display: isLayerExpanded ? 'block' : 'none' }}>
                                                                    <div className="nested-item-content">
                                                                        <SettingRow flow="wrap" label={(
                                                                            <TooltipLabel
                                                                                label="Data Source"
                                                                                tooltip="Select a feature layer from the web map. This layer will be queried when users search for a location."
                                                                            />
                                                                        )}>

                                                                            <div className="ds-selector-container">
                                                                                {DataSourceSelector ? (
                                                                                    <DataSourceSelector
                                                                                        types={SUPPORTED_DS_TYPES}
                                                                                        useDataSources={getLayerUseDataSources(layer)}
                                                                                        mustUseDataSource
                                                                                        onChange={(dsArr) => handleDataSourceChange(section.sectionId, layer.layerId, dsArr)}
                                                                                        widgetId={id}
                                                                                        isMultiple={false}
                                                                                        closeDataSourceListOnChange
                                                                                    />
                                                                                ) : <div style={{ padding: "8px", fontSize: "12px", color: "var(--sys-color-text-secondary)" }}>Loading data source selector...</div>}
                                                                            </div>
                                                                        </SettingRow>

                                                                        <div style={{ textAlign: 'center', color: 'var(--sys-color-text-light)', fontSize: '11px', margin: '8px 0' }}>
                                                                            — OR use direct URL —
                                                                        </div>

                                                                        <SettingRow flow="wrap" label={(
                                                                            <TooltipLabel
                                                                                label="REST Service URL"
                                                                                tooltip="Alternative: Enter a direct ArcGIS REST endpoint URL (e.g., .../FeatureServer/0). Useful for layers not in the web map or external services."
                                                                            />
                                                                        )}>

                                                                            <TextInput
                                                                                size="sm"
                                                                                value={layer.layerUrl || ''}
                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                    layerUrl: e.target.value,
                                                                                    dataSourceId: e.target.value ? '' : layer.dataSourceId,
                                                                                    useDataSource: e.target.value ? undefined : layer.useDataSource
                                                                                } as any)}
                                                                                onBlur={(e) => {
                                                                                    if (e.target.value) {
                                                                                        fetchFieldsFromUrl(e.target.value)
                                                                                    }
                                                                                }}
                                                                                placeholder="https://services.arcgis.com/.../FeatureServer/0"
                                                                                aria-label="REST Service URL"
                                                                            />
                                                                            {layer.layerUrl && !layer.dataSourceId && layerFields.length === 0 && (
                                                                                <button
                                                                                    className="add-btn"
                                                                                    style={{ marginTop: '4px', fontSize: '11px' }}
                                                                                    onClick={() => fetchFieldsFromUrl(layer.layerUrl)}
                                                                                    disabled={fetchLoading[`layer:${layer.layerUrl}`]}
                                                                                >
                                                                                    {fetchLoading[`layer:${layer.layerUrl}`] ? 'Loading...' : 'Fetch Fields'}
                                                                                </button>
                                                                            )}
                                                                            {fetchErrors[`layer:${layer.layerUrl}`] && (
                                                                                <NativeAlert
                                                                                    type="error"
                                                                                    withIcon
                                                                                    open
                                                                                    style={{ marginTop: '8px', fontSize: '11px' }}
                                                                                >
                                                                                    {fetchErrors[`layer:${layer.layerUrl}`]}
                                                                                </NativeAlert>
                                                                            )}
                                                                            {fetchErrors[`layer-ds:${layer.layerId}`] && (
                                                                                <NativeAlert
                                                                                    type="warning"
                                                                                    withIcon
                                                                                    open
                                                                                    style={{ marginTop: '8px', fontSize: '11px' }}
                                                                                >
                                                                                    {fetchErrors[`layer-ds:${layer.layerId}`]}
                                                                                </NativeAlert>
                                                                            )}
                                                                        </SettingRow>

                                                                        <SettingRow flow="wrap" label={(
                                                                            <TooltipLabel
                                                                                label="Layer Title"
                                                                                tooltip="Display name for this layer in the results panel. Use a descriptive name like 'Zoning Districts' instead of the service layer name."
                                                                            />
                                                                        )}>

                                                                            <TextInput
                                                                                size="sm"
                                                                                value={layer.layerTitle}
                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, { layerTitle: e.target.value })}
                                                                                aria-label="Layer title"
                                                                            />
                                                                        </SettingRow>

                                                                        <SettingRow flow="wrap" label={(
                                                                            <TooltipLabel
                                                                                label="Default Expanded"
                                                                                tooltip="Controls whether this data layer is expanded or collapsed when query results are displayed. When collapsed, users can click to expand and view the data."
                                                                            />
                                                                        )}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                <Switch
                                                                                    checked={layer.expanded !== false}
                                                                                    onChange={(e) => updateLayer(section.sectionId, layer.layerId, { expanded: (e.target as HTMLInputElement).checked })}
                                                                                    aria-label="Default expanded state"
                                                                                />
                                                                                <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                    {layer.expanded !== false ? 'Expanded by default' : 'Collapsed by default'}
                                                                                </span>
                                                                            </div>
                                                                        </SettingRow>

                                                                        <SettingRow flow="wrap" label={(
                                                                            <TooltipLabel
                                                                                label="Display Mode"
                                                                                tooltip="How to display records when multiple features are returned. Table shows traditional rows/columns. List shows records stacked with field values separated by pipes. Cards show each record as a grouped block with labeled fields."
                                                                            />
                                                                        )}>
                                                                            <Select
                                                                                size="sm"
                                                                                value={layer.displayMode || 'table'}
                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, { displayMode: e.target.value as any })}
                                                                                aria-label="Display mode"
                                                                            >
                                                                                <Option value="table">Table</Option>
                                                                                <Option value="list">List</Option>
                                                                                <Option value="card">Cards</Option>
                                                                            </Select>
                                                                        </SettingRow>

                                                                        <SettingRow flow="wrap" label={(
                                                                            <TooltipLabel
                                                                                label="Default Sort Field"
                                                                                tooltip="Select a field to sort results by when they first load. Leave as 'None' to use the natural order from the query."
                                                                            />
                                                                        )}>
                                                                            <Select
                                                                                size="sm"
                                                                                value={layer.defaultSortField || ''}
                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, { defaultSortField: e.target.value || undefined })}
                                                                                aria-label="Default sort field"
                                                                            >
                                                                                <Option value="">None</Option>
                                                                                {(layer.fields || []).filter((f: any) => f.visible !== false).map((field: any) => (
                                                                                    <Option key={field.name} value={field.name}>
                                                                                        {field.alias || field.name}
                                                                                    </Option>
                                                                                ))}
                                                                            </Select>
                                                                        </SettingRow>

                                                                        {layer.defaultSortField && (
                                                                            <SettingRow flow="wrap" label={(
                                                                                <TooltipLabel
                                                                                    label="Sort Order"
                                                                                    tooltip="Choose ascending (A-Z, 0-9, oldest to newest) or descending (Z-A, 9-0, newest to oldest) order for the default sort."
                                                                                />
                                                                            )}>
                                                                                <Select
                                                                                    size="sm"
                                                                                    value={layer.defaultSortOrder || 'asc'}
                                                                                    onChange={(e) => updateLayer(section.sectionId, layer.layerId, { defaultSortOrder: e.target.value as any })}
                                                                                    aria-label="Sort order"
                                                                                >
                                                                                    <Option value="asc">Ascending (A→Z, 0→9, Oldest→Newest)</Option>
                                                                                    <Option value="desc">Descending (Z→A, 9→0, Newest→Oldest)</Option>
                                                                                </Select>
                                                                            </SettingRow>
                                                                        )}

                                                                        {(layer.dataSourceId || layer.layerUrl) && (
                                                                            <>
                                                                                <SettingRow flow="wrap" label={(
                                                                                    <TooltipLabel
                                                                                        label="Buffer Distance"
                                                                                        tooltip="Expand the search area around the point. Use for finding features near (not just intersecting) the search location. 0 = point-only query."
                                                                                    />
                                                                                )}>

                                                                                    <div className="input-row">
                                                                                        <NumericInput
                                                                                            size="sm"
                                                                                            value={layer.bufferDistance || 0}
                                                                                            min={0}
                                                                                            onChange={(value) => updateLayer(section.sectionId, layer.layerId, { bufferDistance: value })}
                                                                                            style={{ width: 80 }}
                                                                                            aria-label="Buffer distance"
                                                                                        />
                                                                                        <Select
                                                                                            size="sm"
                                                                                            value={layer.bufferUnit || 'feet'}
                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, { bufferUnit: e.target.value as any })}
                                                                                            style={{ width: 110 }}
                                                                                            aria-label="Buffer unit"
                                                                                        >
                                                                                            <Option value="feet">Feet</Option>
                                                                                            <Option value="meters">Meters</Option>
                                                                                            <Option value="miles">Miles</Option>
                                                                                            <Option value="kilometers">Kilometers</Option>
                                                                                        </Select>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                {/* No Results Message Configuration */}
                                                                                <div className="subsection-divider" style={{ marginTop: '12px' }}>No Results Message</div>

                                                                                <SettingRow flow="wrap" label={(
                                                                                    <TooltipLabel
                                                                                        label="Use Custom Text"
                                                                                        tooltip="When enabled, display custom text instead of the default 'No intersecting features found.' message when no features are returned for this layer."
                                                                                    />
                                                                                )}>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                        <Switch
                                                                                            checked={layer.useCustomNoResultsText || false}
                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, { useCustomNoResultsText: (e.target as HTMLInputElement).checked })}
                                                                                            aria-label="Use custom no results text"
                                                                                        />
                                                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                            Use custom message when no features found
                                                                                        </span>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                {layer.useCustomNoResultsText && (
                                                                                    <SettingRow flow="wrap" label={(
                                                                                        <TooltipLabel
                                                                                            label="Custom Message"
                                                                                            tooltip="Enter the text to display when no intersecting features are found for this layer. Leave blank to show nothing."
                                                                                        />
                                                                                    )}>
                                                                                        <TextInput
                                                                                            size="sm"
                                                                                            value={layer.customNoResultsText || ''}
                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, { customNoResultsText: e.target.value })}
                                                                                            placeholder="e.g., No zoning restrictions apply to this location."
                                                                                            style={{ width: '100%' }}
                                                                                            aria-label="Custom no results message"
                                                                                        />
                                                                                        <p className="hint-text" style={{ marginTop: '4px', marginBottom: 0 }}>
                                                                                            Leave empty to hide the message entirely
                                                                                        </p>
                                                                                    </SettingRow>
                                                                                )}

                                                                                {/* Row Interaction with Map */}
                                                                                <div className="subsection-divider" style={{ marginTop: '12px' }}>Row Map Interaction</div>

                                                                                <SettingRow flow="wrap" label={(
                                                                                    <TooltipLabel
                                                                                        label="Show All on Map"
                                                                                        tooltip="Automatically display all queried features from this layer on the map when results load. Creates visual markers/highlights for each feature."
                                                                                    />
                                                                                )}>

                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                        <Switch
                                                                                            checked={layer.showAllOnMap || false}
                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, { showAllOnMap: (e.target as HTMLInputElement).checked })}
                                                                                            aria-label="Show all features on map"
                                                                                        />
                                                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                            Display all features on map when results load
                                                                                        </span>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                <SettingRow flow="wrap" label={(
                                                                                    <TooltipLabel
                                                                                        label="Highlight on Hover"
                                                                                        tooltip="Draw feature outline on map when user hovers over a table row. Great for visual correlation between data and geography."
                                                                                    />
                                                                                )}>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                        <Switch
                                                                                            checked={layer.enableRowHighlight || false}
                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, { enableRowHighlight: (e.target as HTMLInputElement).checked })}
                                                                                            aria-label="Enable row highlight on hover"
                                                                                        />
                                                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                            Highlight geometry when hovering rows
                                                                                        </span>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                <SettingRow flow="wrap" label={(
                                                                                    <TooltipLabel
                                                                                        label="Zoom on Click"
                                                                                        tooltip="Pan and zoom map to feature location when user clicks a table row. Helps users navigate to specific features."
                                                                                    />
                                                                                )}>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                        <Switch
                                                                                            checked={layer.enableRowZoom || false}
                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, { enableRowZoom: (e.target as HTMLInputElement).checked })}
                                                                                            aria-label="Enable zoom on row click"
                                                                                        />
                                                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                            Zoom to feature when clicking rows
                                                                                        </span>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                {layer.enableRowZoom && (
                                                                                    <SettingRow flow="wrap" label={(
                                                                                        <TooltipLabel
                                                                                            label="Zoom Scale"
                                                                                            tooltip="Map scale when zooming to features. 1000 = very close (building level), 5000 = neighborhood, 25000 = city area."
                                                                                        />
                                                                                    )}>
                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                            <NumericInput
                                                                                                size="sm"
                                                                                                value={layer.rowZoomScale || 2500}
                                                                                                min={100}
                                                                                                max={100000}
                                                                                                step={100}
                                                                                                onChange={(value) => updateLayer(section.sectionId, layer.layerId, { rowZoomScale: value })}
                                                                                                style={{ width: 90 }}
                                                                                            />
                                                                                            <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                                Smaller = more zoomed in
                                                                                            </span>
                                                                                        </div>
                                                                                    </SettingRow>
                                                                                )}

                                                                                {layer.showAllOnMap && (
                                                                                    <SettingRow flow="wrap" label={(
                                                                                        <TooltipLabel
                                                                                            label="Show All Color"
                                                                                            tooltip="Color used to display all features on the map when results load. Choose a different color from Highlight Color to distinguish between static display and hover interaction."
                                                                                        />
                                                                                    )}>
                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                            <input
                                                                                                type="color"
                                                                                                value={layer.showAllOnMapColor || '#FF6600'}
                                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, { showAllOnMapColor: e.target.value })}
                                                                                                style={{ width: 32, height: 24, padding: 0, border: '1px solid var(--sys-color-divider-primary)', borderRadius: 4 }}
                                                                                            />
                                                                                            <TextInput
                                                                                                size="sm"
                                                                                                value={layer.showAllOnMapColor || '#FF6600'}
                                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, { showAllOnMapColor: e.target.value })}
                                                                                                style={{ width: 80 }}
                                                                                            />
                                                                                        </div>
                                                                                    </SettingRow>
                                                                                )}

                                                                                {(layer.enableRowHighlight || layer.enableRowZoom) && (
                                                                                    <SettingRow flow="wrap" label={(
                                                                                        <TooltipLabel
                                                                                            label="Highlight Color"
                                                                                            tooltip="Color used to highlight features on hover or when zooming. This is the interactive highlight color for row interactions."
                                                                                        />
                                                                                    )}>
                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                            <input
                                                                                                type="color"
                                                                                                value={layer.rowHighlightColor || '#FF6600'}
                                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, { rowHighlightColor: e.target.value })}
                                                                                                style={{ width: 32, height: 24, padding: 0, border: '1px solid var(--sys-color-divider-primary)', borderRadius: 4 }}
                                                                                            />
                                                                                            <TextInput
                                                                                                size="sm"
                                                                                                value={layer.rowHighlightColor || '#FF6600'}
                                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, { rowHighlightColor: e.target.value })}
                                                                                                style={{ width: 80 }}
                                                                                            />
                                                                                        </div>
                                                                                    </SettingRow>
                                                                                )}

                                                                                {(layer.showAllOnMap || layer.enableRowHighlight || layer.enableRowZoom) && (
                                                                                    <SettingRow flow="wrap" label={(
                                                                                        <TooltipLabel
                                                                                            label="Fill Opacity"
                                                                                            tooltip="Polygon interior transparency. 0 = outline only (see-through), 0.2 = subtle fill, 1 = solid opaque."
                                                                                        />
                                                                                    )}>
                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                            <NumericInput
                                                                                                size="sm"
                                                                                                value={layer.rowHighlightFillOpacity ?? 0.2}
                                                                                                min={0}
                                                                                                max={1}
                                                                                                step={0.1}
                                                                                                onChange={(value) => updateLayer(section.sectionId, layer.layerId, { rowHighlightFillOpacity: value })}
                                                                                                style={{ width: 70 }}
                                                                                            />
                                                                                            <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                                For polygon fills (0-1)
                                                                                            </span>
                                                                                        </div>
                                                                                    </SettingRow>
                                                                                )}

                                                                                {/* Nearby Display Mode */}
                                                                                <div className="subsection-divider" style={{ marginTop: '12px' }}>Nearby Display Mode</div>
                                                                                <p className="hint-text" style={{ marginBottom: '8px' }}>
                                                                                    Display features sorted by distance with badges.
                                                                                </p>

                                                                                <SettingRow flow="wrap" label={(
                                                                                    <TooltipLabel
                                                                                        label="Enable Nearby Mode"
                                                                                        tooltip="Shows features as distance-sorted cards with distance badges instead of a table. Ideal for 'nearest parks' or 'nearby schools' displays."
                                                                                    />
                                                                                )}>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                        <Switch
                                                                                            checked={layer.nearbyConfig?.enabled || false}
                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                nearbyConfig: {
                                                                                                    ...layer.nearbyConfig,
                                                                                                    enabled: (e.target as HTMLInputElement).checked
                                                                                                }
                                                                                            })}
                                                                                            aria-label="Enable nearby mode for this layer"
                                                                                        />
                                                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                            Shows distance-sorted list instead of table
                                                                                        </span>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                {layer.nearbyConfig?.enabled && (
                                                                                    <div style={{ marginLeft: '12px', paddingLeft: '12px', borderLeft: '2px solid var(--sys-color-primary-main)' }}>
                                                                                        {/* Title Field */}
                                                                                        <SettingRow flow="wrap" label={(
                                                                                            <TooltipLabel
                                                                                                label="Title Field"
                                                                                                tooltip="Main display field for each nearby feature (e.g., park name, school name)."
                                                                                            />
                                                                                        )}>
                                                                                            <Select
                                                                                                size="sm"
                                                                                                value={layer.nearbyConfig?.titleField || ''}
                                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                    nearbyConfig: { ...layer.nearbyConfig, titleField: e.target.value }
                                                                                                })}
                                                                                            >
                                                                                                <Option value="">-- Select Field --</Option>
                                                                                                {layerFields.map(field => (
                                                                                                    <Option key={field.name} value={field.name}>{field.alias || field.name}</Option>
                                                                                                ))}
                                                                                            </Select>
                                                                                        </SettingRow>

                                                                                        {/* Subtitle Field */}
                                                                                        <SettingRow flow="wrap" label={(
                                                                                            <TooltipLabel
                                                                                                label="Subtitle Field"
                                                                                                tooltip="Secondary info shown below title (e.g., acreage, address, phone number)."
                                                                                            />
                                                                                        )}>
                                                                                            <Select
                                                                                                size="sm"
                                                                                                value={layer.nearbyConfig?.subtitleField || ''}
                                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                    nearbyConfig: { ...layer.nearbyConfig, subtitleField: e.target.value }
                                                                                                })}
                                                                                            >
                                                                                                <Option value="">-- None --</Option>
                                                                                                {layerFields.map(field => (
                                                                                                    <Option key={field.name} value={field.name}>{field.alias || field.name}</Option>
                                                                                                ))}
                                                                                            </Select>
                                                                                        </SettingRow>

                                                                                        {layer.nearbyConfig?.subtitleField && (
                                                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                                                <div style={{ flex: 1 }}>
                                                                                                    <SettingRow flow="wrap" label="Prefix">
                                                                                                        <TextInput
                                                                                                            size="sm"
                                                                                                            value={layer.nearbyConfig?.subtitlePrefix || ''}
                                                                                                            placeholder=""
                                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                                nearbyConfig: { ...layer.nearbyConfig, subtitlePrefix: e.target.value }
                                                                                                            })}
                                                                                                        />
                                                                                                    </SettingRow>
                                                                                                </div>
                                                                                                <div style={{ flex: 1 }}>
                                                                                                    <SettingRow flow="wrap" label="Suffix">
                                                                                                        <TextInput
                                                                                                            size="sm"
                                                                                                            value={layer.nearbyConfig?.subtitleSuffix || ''}
                                                                                                            placeholder="e.g., acres"
                                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                                nearbyConfig: { ...layer.nearbyConfig, subtitleSuffix: e.target.value }
                                                                                                            })}
                                                                                                        />
                                                                                                    </SettingRow>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}

                                                                                        {/* Link URL Field */}
                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Link URL Field" tooltip="Optional field containing a URL. When set, the title becomes a clickable link to this URL." />)}>
                                                                                            <Select
                                                                                                size="sm"
                                                                                                value={layer.nearbyConfig?.linkUrlField || ''}
                                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                    nearbyConfig: { ...layer.nearbyConfig, linkUrlField: e.target.value }
                                                                                                })}
                                                                                            >
                                                                                                <Option value="">-- None --</Option>
                                                                                                {layerFields.map(field => (
                                                                                                    <Option key={field.name} value={field.name}>{field.alias || field.name}</Option>
                                                                                                ))}
                                                                                            </Select>
                                                                                        </SettingRow>

                                                                                        {/* Query Settings */}
                                                                                        <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 500, color: 'var(--sys-color-text-dark)' }}>
                                                                                            Query Settings
                                                                                        </div>

                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Max Features" tooltip="Maximum number of nearby features to display in the list." />)}>
                                                                                            <NumericInput
                                                                                                size="sm"
                                                                                                value={layer.nearbyConfig?.maxFeatures || 5}
                                                                                                min={1}
                                                                                                max={50}
                                                                                                onChange={(value) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                    nearbyConfig: { ...layer.nearbyConfig, maxFeatures: value }
                                                                                                })}
                                                                                                style={{ width: 70 }}
                                                                                            />
                                                                                        </SettingRow>

                                                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                                                            <div style={{ flex: 1 }}>
                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Search Radius" tooltip="Maximum distance to search for nearby features from the query point." />)}>
                                                                                                    <NumericInput
                                                                                                        size="sm"
                                                                                                        value={layer.nearbyConfig?.searchRadius || 5}
                                                                                                        min={0.1}
                                                                                                        onChange={(value) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                            nearbyConfig: { ...layer.nearbyConfig, searchRadius: value }
                                                                                                        })}
                                                                                                        style={{ width: 70 }}
                                                                                                    />
                                                                                                </SettingRow>
                                                                                            </div>
                                                                                            <div style={{ flex: 1 }}>
                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Unit" tooltip="Distance unit for the search radius." />)}>
                                                                                                    <Select
                                                                                                        size="sm"
                                                                                                        value={layer.nearbyConfig?.searchRadiusUnit || 'miles'}
                                                                                                        onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                            nearbyConfig: { ...layer.nearbyConfig, searchRadiusUnit: e.target.value as any }
                                                                                                        })}
                                                                                                    >
                                                                                                        <Option value="feet">Feet</Option>
                                                                                                        <Option value="meters">Meters</Option>
                                                                                                        <Option value="miles">Miles</Option>
                                                                                                        <Option value="kilometers">Kilometers</Option>
                                                                                                    </Select>
                                                                                                </SettingRow>
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* Distance Display */}
                                                                                        <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 500, color: 'var(--sys-color-text-dark)' }}>
                                                                                            Distance Display
                                                                                        </div>

                                                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                                                            <div style={{ flex: 1 }}>
                                                                                                <SettingRow flow="wrap" label="Display Unit">
                                                                                                    <Select
                                                                                                        size="sm"
                                                                                                        value={layer.nearbyConfig?.distanceUnit || 'miles'}
                                                                                                        onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                            nearbyConfig: { ...layer.nearbyConfig, distanceUnit: e.target.value as any }
                                                                                                        })}
                                                                                                    >
                                                                                                        <Option value="feet">Feet</Option>
                                                                                                        <Option value="meters">Meters</Option>
                                                                                                        <Option value="miles">Miles</Option>
                                                                                                        <Option value="kilometers">Kilometers</Option>
                                                                                                    </Select>
                                                                                                </SettingRow>
                                                                                            </div>
                                                                                            <div style={{ flex: 1 }}>
                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Precision" tooltip="Number of decimal places for distance values (0-4)." />)}>
                                                                                                    <NumericInput
                                                                                                        size="sm"
                                                                                                        value={layer.nearbyConfig?.distancePrecision ?? 2}
                                                                                                        min={0}
                                                                                                        max={4}
                                                                                                        onChange={(value) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                            nearbyConfig: { ...layer.nearbyConfig, distancePrecision: value }
                                                                                                        })}
                                                                                                        style={{ width: 60 }}
                                                                                                    />
                                                                                                </SettingRow>
                                                                                            </div>
                                                                                        </div>

                                                                                        <SettingRow flow="no-wrap" label="Show Distance Badge">
                                                                                            <Switch
                                                                                                checked={layer.nearbyConfig?.showDistanceBadge !== false}
                                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                    nearbyConfig: { ...layer.nearbyConfig, showDistanceBadge: (e.target as HTMLInputElement).checked }
                                                                                                })}
                                                                                            />
                                                                                        </SettingRow>

                                                                                        {/* PDF Settings */}
                                                                                        <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 500, color: 'var(--sys-color-text-dark)' }}>
                                                                                            PDF Export
                                                                                        </div>

                                                                                        <SettingRow flow="no-wrap" label="Include in PDF">
                                                                                            <Switch
                                                                                                checked={layer.nearbyConfig?.includeInPdf !== false}
                                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                    nearbyConfig: { ...layer.nearbyConfig, includeInPdf: (e.target as HTMLInputElement).checked }
                                                                                                })}
                                                                                            />
                                                                                        </SettingRow>

                                                                                        {layer.nearbyConfig?.includeInPdf !== false && (
                                                                                            <SettingRow flow="wrap" label="PDF Max Features">
                                                                                                <NumericInput
                                                                                                    size="sm"
                                                                                                    value={layer.nearbyConfig?.pdfMaxFeatures || layer.nearbyConfig?.maxFeatures || 5}
                                                                                                    min={1}
                                                                                                    max={20}
                                                                                                    onChange={(value) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                        nearbyConfig: { ...layer.nearbyConfig, pdfMaxFeatures: value }
                                                                                                    })}
                                                                                                    style={{ width: 70 }}
                                                                                                />
                                                                                            </SettingRow>
                                                                                        )}
                                                                                    </div>
                                                                                )}

                                                                                <SettingRow flow="wrap" label={(
                                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                                                        <span>Fields to Display</span>
                                                                                        {selectedFields.length > 1 && layerFields.length > 0 && (() => {
                                                                                            const serviceOrder = layerFields.map(f => f.name)
                                                                                            const selectedInServiceOrder = selectedFields
                                                                                                .map(f => f.name)
                                                                                                .filter(n => serviceOrder.includes(n))
                                                                                            const expectedOrder = serviceOrder.filter(n => selectedInServiceOrder.includes(n))
                                                                                            const isInServiceOrder = selectedInServiceOrder.every((n, i) => n === expectedOrder[i])

                                                                                            return isInServiceOrder ? (
                                                                                                <span style={{ fontSize: '10px', color: 'var(--sys-color-success-main, #4caf50)' }}>
                                                                                                    ✓ Service order
                                                                                                </span>
                                                                                            ) : (
                                                                                                <Tip title="Reorder selected fields to match service/data source order" placement="top">
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        style={{
                                                                                                            background: 'none', cursor: 'pointer',
                                                                                                            borderRadius: '3px', padding: '1px 6px',
                                                                                                            fontSize: '10px',
                                                                                                            border: '1px solid var(--sys-color-warning-main, #ed6c02)',
                                                                                                            color: 'var(--sys-color-warning-main, #ed6c02)'
                                                                                                        }}
                                                                                                        onClick={(e) => {
                                                                                                            e.stopPropagation()
                                                                                                            reorderFieldsToServiceOrder(section.sectionId, layer.layerId)
                                                                                                        }}
                                                                                                        aria-label="Sort fields to service order"
                                                                                                    >
                                                                                                        ↕ Reset to service order
                                                                                                    </button>
                                                                                                </Tip>
                                                                                            )
                                                                                        })()}
                                                                                    </div>
                                                                                )}>
                                                                                    {/* Selected field order: drag to reorder. Live preview of report order; the arrows above still work too. */}
                                                                                    {selectedFields.length > 1 && (
                                                                                        <div className="selected-field-order" role="list" aria-label="Selected field display order. Drag an item to reorder.">
                                                                                            <div className="selected-field-order-label">Selected field order (drag to reorder)</div>
                                                                                            {selectedFields.map((orderField, orderIdx) => (
                                                                                                <div
                                                                                                    key={orderField.name}
                                                                                                    role="listitem"
                                                                                                    className="field-order-item"
                                                                                                    draggable
                                                                                                    onDragStart={(e) => { e.dataTransfer.setData('text/plain', orderField.name); e.dataTransfer.effectAllowed = 'move'; e.currentTarget.classList.add('dragging') }}
                                                                                                    onDragEnd={(e) => { e.currentTarget.classList.remove('dragging') }}
                                                                                                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.classList.add('drag-over') }}
                                                                                                    onDragLeave={(e) => { e.currentTarget.classList.remove('drag-over') }}
                                                                                                    onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); const fromName = e.dataTransfer.getData('text/plain'); if (fromName) { moveFieldBefore(section.sectionId, layer.layerId, fromName, orderField.name) } }}
                                                                                                >
                                                                                                    <span className="drag-handle" aria-hidden="true"><DragHandleIcon /></span>
                                                                                                    <span className="field-order-num">{orderIdx + 1}</span>
                                                                                                    <span className="field-order-name">{orderField.alias && orderField.alias !== orderField.name ? `${orderField.name} (${orderField.alias})` : orderField.name}</span>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                    <div className="fields-container">
                                                                                        {layerFields.length === 0 ? (
                                                                                            <div className="field-item" style={{ justifyContent: 'center', color: 'var(--sys-color-text-light)' }}>
                                                                                                {layer.layerUrl && !layer.dataSourceId
                                                                                                    ? 'Click "Fetch Fields" or enter URL and press Tab'
                                                                                                    : 'No fields available - select a data source'}
                                                                                            </div>
                                                                                        ) : (
                                                                                            layerFields.map(field => {
                                                                                                const isSelected = selectedFields.some(f => (f.name || (f as any).n) === field.name)
                                                                                                // Show display order badge for selected fields
                                                                                                const displayOrder = isSelected
                                                                                                    ? selectedFields.findIndex(f => (f.name || (f as any).n) === field.name) + 1
                                                                                                    : -1
                                                                                                const currentAlias = getFieldAlias(section.sectionId, layer.layerId, field.name)
                                                                                                const currentFormat = getFieldFormat(section.sectionId, layer.layerId, field.name)
                                                                                                const displayAlias = field.alias !== field.name ? ` (${field.alias})` : ''
                                                                                                return (
                                                                                                    <div className="field-item" key={field.name} style={{ flexWrap: 'wrap' }}>
                                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                                                                                                            <Checkbox
                                                                                                                checked={isSelected}
                                                                                                                onChange={() => toggleFieldSelection(section.sectionId, layer.layerId, field.name)}
                                                                                                                aria-label={`Select ${field.name}`}
                                                                                                            />
                                                                                                            {isSelected && (
                                                                                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1px', flexShrink: 0 }}>
                                                                                                                    <button
                                                                                                                        type="button"
                                                                                                                        disabled={displayOrder <= 1}
                                                                                                                        onClick={(e) => { e.stopPropagation(); moveFieldOrder(section.sectionId, layer.layerId, field.name, 'up') }}
                                                                                                                        style={{
                                                                                                                            background: 'none', border: 'none', padding: '0 1px', fontSize: '10px', lineHeight: 1,
                                                                                                                            cursor: displayOrder <= 1 ? 'default' : 'pointer',
                                                                                                                            color: displayOrder <= 1 ? '#999' : 'var(--sys-color-primary-main, #1976d2)',
                                                                                                                            opacity: displayOrder <= 1 ? 0.4 : 1
                                                                                                                        }}
                                                                                                                        title="Move up"
                                                                                                                        aria-label={`Move ${field.name} up`}
                                                                                                                    >▲</button>
                                                                                                                    <span
                                                                                                                        style={{
                                                                                                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                                                                            width: '18px', height: '18px', borderRadius: '50%',
                                                                                                                            backgroundColor: 'var(--sys-color-primary-main, #1976d2)',
                                                                                                                            color: '#fff', fontSize: '10px', fontWeight: 600, lineHeight: 1
                                                                                                                        }}
                                                                                                                        title={`Display order: ${displayOrder}`}
                                                                                                                    >
                                                                                                                        {displayOrder}
                                                                                                                    </span>
                                                                                                                    <button
                                                                                                                        type="button"
                                                                                                                        disabled={displayOrder >= selectedFields.length}
                                                                                                                        onClick={(e) => { e.stopPropagation(); moveFieldOrder(section.sectionId, layer.layerId, field.name, 'down') }}
                                                                                                                        style={{
                                                                                                                            background: 'none', border: 'none', padding: '0 1px', fontSize: '10px', lineHeight: 1,
                                                                                                                            cursor: displayOrder >= selectedFields.length ? 'default' : 'pointer',
                                                                                                                            color: displayOrder >= selectedFields.length ? '#999' : 'var(--sys-color-primary-main, #1976d2)',
                                                                                                                            opacity: displayOrder >= selectedFields.length ? 0.4 : 1
                                                                                                                        }}
                                                                                                                        title="Move down"
                                                                                                                        aria-label={`Move ${field.name} down`}
                                                                                                                    >▼</button>
                                                                                                                </div>
                                                                                                            )}
                                                                                                            <span className="field-name">{field.name}</span>
                                                                                                            {displayAlias && <span className="field-alias" style={{ color: 'var(--sys-color-text-light)', fontSize: '11px' }}>{displayAlias}</span>}
                                                                                                        </div>
                                                                                                        {isSelected && (
                                                                                                            <div style={{ width: '100%', marginTop: '8px', paddingLeft: '24px' }}>
                                                                                                                {/* Alias input */}
                                                                                                                <div style={{ marginBottom: '8px' }}>
                                                                                                                    <Label style={{ fontSize: '11px', marginBottom: '2px', display: 'block' }}>Display Alias</Label>
                                                                                                                    <TextInput
                                                                                                                        size="sm"
                                                                                                                        value={currentAlias}
                                                                                                                        onChange={(e) => updateFieldAlias(section.sectionId, layer.layerId, field.name, e.target.value)}
                                                                                                                        placeholder="Display alias"
                                                                                                                        aria-label={`Alias for ${field.name}`}
                                                                                                                    />
                                                                                                                </div>

                                                                                                                {/* Format type selector */}
                                                                                                                <div style={{ marginBottom: '8px' }}>
                                                                                                                    <Label style={{ fontSize: '11px', marginBottom: '2px', display: 'block' }}>Format Type</Label>
                                                                                                                    <Select
                                                                                                                        size="sm"
                                                                                                                        value={currentFormat.type || 'auto'}
                                                                                                                        onChange={(e) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { type: e.target.value as any })}
                                                                                                                        aria-label="Format type"
                                                                                                                    >
                                                                                                                        <Option value="auto">Auto</Option>
                                                                                                                        <Option value="text">Text</Option>
                                                                                                                        <Option value="number">Number</Option>
                                                                                                                        <Option value="date">Date</Option>
                                                                                                                        <Option value="link">Link</Option>
                                                                                                                    </Select>
                                                                                                                </div>

                                                                                                                {/* Number formatting options */}
                                                                                                                {(currentFormat.type === 'number' || currentFormat.type === 'auto') && (
                                                                                                                    <div style={{ marginBottom: '8px' }}>
                                                                                                                        <Label style={{ fontSize: '11px', marginBottom: '2px', display: 'block' }}>Number Format</Label>
                                                                                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                                                                                            <Select
                                                                                                                                size="sm"
                                                                                                                                value={currentFormat.numberFormat || 'default'}
                                                                                                                                onChange={(e) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { numberFormat: e.target.value as any })}
                                                                                                                                style={{ width: '100px' }}
                                                                                                                                aria-label="Number format"
                                                                                                                            >
                                                                                                                                <Option value="default">Default</Option>
                                                                                                                                <Option value="none">No Format</Option>
                                                                                                                                <Option value="decimal">Decimal</Option>
                                                                                                                                <Option value="currency">Currency</Option>
                                                                                                                                <Option value="percent">Percent</Option>
                                                                                                                            </Select>
                                                                                                                            <Label style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                                                                                <Checkbox
                                                                                                                                    checked={currentFormat.useGrouping !== false}
                                                                                                                                    onChange={(e) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { useGrouping: (e.target as HTMLInputElement).checked })}
                                                                                                                                    aria-label="Use thousand separators"
                                                                                                                                />
                                                                                                                                Commas
                                                                                                                            </Label>
                                                                                                                            {(currentFormat.numberFormat === 'decimal' || currentFormat.numberFormat === 'currency') && (
                                                                                                                                <NumericInput
                                                                                                                                    size="sm"
                                                                                                                                    value={currentFormat.decimalPlaces ?? 2}
                                                                                                                                    min={0}
                                                                                                                                    max={10}
                                                                                                                                    onChange={(value) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { decimalPlaces: value })}
                                                                                                                                    style={{ width: '50px' }}
                                                                                                                                    aria-label="Decimal places"
                                                                                                                                />
                                                                                                                            )}
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                )}

                                                                                                                {/* Date formatting options */}
                                                                                                                {currentFormat.type === 'date' && (
                                                                                                                    <div style={{ marginBottom: '8px' }}>
                                                                                                                        <Label style={{ fontSize: '11px', marginBottom: '2px', display: 'block' }}>Date Format</Label>
                                                                                                                        <Select
                                                                                                                            size="sm"
                                                                                                                            value={currentFormat.dateFormat || 'default'}
                                                                                                                            onChange={(e) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { dateFormat: e.target.value as any })}
                                                                                                                            aria-label="Date format"
                                                                                                                        >
                                                                                                                            <Option value="default">Default</Option>
                                                                                                                            <Option value="short">Short (1/1/24)</Option>
                                                                                                                            <Option value="medium">Medium (Jan 1, 2024)</Option>
                                                                                                                            <Option value="long">Long (January 1, 2024)</Option>
                                                                                                                            <Option value="year-only">Year Only (2024)</Option>
                                                                                                                        </Select>
                                                                                                                    </div>
                                                                                                                )}

                                                                                                                {/* Text formatting options */}
                                                                                                                {currentFormat.type === 'text' && (
                                                                                                                    <div style={{ marginBottom: '8px' }}>
                                                                                                                        <Label style={{ fontSize: '11px', marginBottom: '2px', display: 'block' }}>Text Format</Label>
                                                                                                                        <Select
                                                                                                                            size="sm"
                                                                                                                            value={currentFormat.textFormat || 'default'}
                                                                                                                            onChange={(e) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { textFormat: e.target.value as any })}
                                                                                                                            aria-label="Text format"
                                                                                                                        >
                                                                                                                            <Option value="default">Default</Option>
                                                                                                                            <Option value="uppercase">UPPERCASE</Option>
                                                                                                                            <Option value="lowercase">lowercase</Option>
                                                                                                                            <Option value="titlecase">Title Case</Option>
                                                                                                                        </Select>
                                                                                                                    </div>
                                                                                                                )}

                                                                                                                {/* Link display text option */}
                                                                                                                {currentFormat.type === 'link' && (
                                                                                                                    <div style={{ marginBottom: '8px' }}>
                                                                                                                        <Label style={{ fontSize: '11px', marginBottom: '2px', display: 'block' }}>Link Display Text</Label>
                                                                                                                        <TextInput
                                                                                                                            size="sm"
                                                                                                                            value={currentFormat.linkText || ''}
                                                                                                                            onChange={(e) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { linkText: e.target.value })}
                                                                                                                            placeholder="e.g., View Document"
                                                                                                                            aria-label="Link display text"
                                                                                                                        />
                                                                                                                        <p className="hint-text" style={{ marginTop: '4px', marginBottom: 0 }}>
                                                                                                                            Text shown instead of URL. Leave blank to show the URL.
                                                                                                                        </p>
                                                                                                                    </div>
                                                                                                                )}

                                                                                                                {/* Link Base URL option */}
                                                                                                                {currentFormat.type === 'link' && (
                                                                                                                    <div style={{ marginBottom: '8px' }}>
                                                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                                                                                            <Switch
                                                                                                                                checked={currentFormat.useLinkBaseUrl || false}
                                                                                                                                onChange={(e) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { useLinkBaseUrl: (e.target as HTMLInputElement).checked })}
                                                                                                                                aria-label="Enable base URL"
                                                                                                                            />
                                                                                                                            <Label style={{ fontSize: '11px', cursor: 'pointer' }}>
                                                                                                                                Prepend Base URL
                                                                                                                            </Label>
                                                                                                                            <Tip title="Enable to prepend a base URL to the field value. Useful when field contains only filename (e.g., '12345.pdf') and needs full path." placement="top">
                                                                                                                                <span style={{ color: 'var(--sys-color-text-light)', cursor: 'help', fontSize: '11px' }}>ⓘ</span>
                                                                                                                            </Tip>
                                                                                                                        </div>
                                                                                                                        {currentFormat.useLinkBaseUrl && (
                                                                                                                            <>
                                                                                                                                <TextInput
                                                                                                                                    size="sm"
                                                                                                                                    value={currentFormat.linkBaseUrl || ''}
                                                                                                                                    onChange={(e) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { linkBaseUrl: e.target.value })}
                                                                                                                                    placeholder="https://example.com/documents/"
                                                                                                                                    aria-label="Base URL"
                                                                                                                                />
                                                                                                                                <p className="hint-text" style={{ marginTop: '4px', marginBottom: 0 }}>
                                                                                                                                    URL prefix added before field value (e.g., base + "12345.pdf")
                                                                                                                                </p>
                                                                                                                            </>
                                                                                                                        )}
                                                                                                                    </div>
                                                                                                                )}

                                                                                                                {/* Prefix/Suffix */}
                                                                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                                                                    <div style={{ flex: 1 }}>
                                                                                                                        <Label style={{ fontSize: '11px', marginBottom: '2px', display: 'block' }}>Prefix</Label>
                                                                                                                        <TextInput
                                                                                                                            size="sm"
                                                                                                                            value={currentFormat.prefix || ''}
                                                                                                                            onChange={(e) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { prefix: e.target.value })}
                                                                                                                            placeholder="$"
                                                                                                                            aria-label="Value prefix"
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                    <div style={{ flex: 1 }}>
                                                                                                                        <Label style={{ fontSize: '11px', marginBottom: '2px', display: 'block' }}>Suffix</Label>
                                                                                                                        <TextInput
                                                                                                                            size="sm"
                                                                                                                            value={currentFormat.suffix || ''}
                                                                                                                            onChange={(e) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { suffix: e.target.value })}
                                                                                                                            placeholder="%"
                                                                                                                            aria-label="Value suffix"
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        )}

                                                                                                        {/* Exclude from PDF toggle */}
                                                                                                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                            <Switch
                                                                                                                checked={getFieldExcludeFromPdf(section.sectionId, layer.layerId, field.name)}
                                                                                                                onChange={() => toggleFieldExcludeFromPdf(section.sectionId, layer.layerId, field.name)}
                                                                                                                aria-label={`Exclude ${field.name} from PDF`}
                                                                                                            />
                                                                                                            <Label style={{ fontSize: '11px', cursor: 'pointer' }}>
                                                                                                                Exclude from PDF
                                                                                                            </Label>
                                                                                                            <Tip title="Field will display in widget but not in PDF export (useful for URLs)" placement="top">
                                                                                                                <span style={{ color: 'var(--sys-color-text-light)', cursor: 'help' }}>ⓘ</span>
                                                                                                            </Tip>
                                                                                                        </div>

                                                                                                        {/* Hide NULL values toggle */}
                                                                                                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                            <Switch
                                                                                                                checked={getFieldHideNull(section.sectionId, layer.layerId, field.name)}
                                                                                                                onChange={() => toggleFieldHideNull(section.sectionId, layer.layerId, field.name)}
                                                                                                                aria-label={`Hide ${field.name} when NULL`}
                                                                                                            />
                                                                                                            <Label style={{ fontSize: '11px', cursor: 'pointer' }}>
                                                                                                                Hide when NULL
                                                                                                            </Label>
                                                                                                            <Tip title="Hide this field when value is NULL or empty" placement="top">
                                                                                                                <span style={{ color: 'var(--sys-color-text-light)', cursor: 'help' }}>ⓘ</span>
                                                                                                            </Tip>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )
                                                                                            })
                                                                                        )}
                                                                                    </div>
                                                                                </SettingRow>

                                                                                {/* Nearby Display Mode Configuration */}
                                                                                <div className="subsection-divider" style={{ marginTop: '16px' }}>Nearby Display Mode</div>
                                                                                <p className="hint-text" style={{ marginTop: '4px', marginBottom: '8px' }}>
                                                                                    Display features as a distance-sorted list.
                                                                                </p>

                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Enable Nearby Mode" tooltip="Display features as a distance-sorted list instead of a table. Ideal for showing closest facilities, parks, schools, etc." />)}>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                        <Switch
                                                                                            checked={layer.nearbyConfig?.enabled || false}
                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                nearbyConfig: {
                                                                                                    ...layer.nearbyConfig,
                                                                                                    enabled: (e.target as HTMLInputElement).checked
                                                                                                }
                                                                                            } as any)}
                                                                                            aria-label="Enable nearby mode for this layer"
                                                                                        />
                                                                                        <Tip title="Shows features sorted by distance from search point instead of in a table" placement="top">
                                                                                            <span style={{ color: 'var(--sys-color-text-light)', cursor: 'help' }}>ⓘ</span>
                                                                                        </Tip>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                {layer.nearbyConfig?.enabled && (
                                                                                    <div style={{ marginLeft: '8px', paddingLeft: '8px', borderLeft: '2px solid var(--sys-color-primary-main)' }}>
                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Title Field" tooltip="Field displayed as the main heading for each nearby feature (e.g., NAME, FACILITY_NAME)." />)}>
                                                                                            <Select
                                                                                                size="sm"
                                                                                                value={layer.nearbyConfig?.titleField || ''}
                                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                    nearbyConfig: {
                                                                                                        ...layer.nearbyConfig,
                                                                                                        titleField: e.target.value
                                                                                                    }
                                                                                                } as any)}
                                                                                            >
                                                                                                <Option value="">-- Select Field --</Option>
                                                                                                {layerFields.map(field => (
                                                                                                    <Option key={field.name} value={field.name}>{field.alias || field.name}</Option>
                                                                                                ))}
                                                                                            </Select>
                                                                                            <span style={{ fontSize: '10px', color: 'var(--sys-color-text-light)', display: 'block', marginTop: '4px' }}>
                                                                                                Main display name (required)
                                                                                            </span>
                                                                                        </SettingRow>

                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Subtitle Field" tooltip="Optional field for secondary information shown below the title (e.g., ADDRESS, PHONE, HOURS)." />)}>
                                                                                            <Select
                                                                                                size="sm"
                                                                                                value={layer.nearbyConfig?.subtitleField || ''}
                                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                    nearbyConfig: {
                                                                                                        ...layer.nearbyConfig,
                                                                                                        subtitleField: e.target.value
                                                                                                    }
                                                                                                } as any)}
                                                                                            >
                                                                                                <Option value="">-- None --</Option>
                                                                                                {layerFields.map(field => (
                                                                                                    <Option key={field.name} value={field.name}>{field.alias || field.name}</Option>
                                                                                                ))}
                                                                                            </Select>
                                                                                        </SettingRow>

                                                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                                                            <div style={{ flex: 1 }}>
                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Subtitle Prefix" tooltip="Text added before the subtitle value (e.g., 'Size: ' or 'Area: ')." />)}>
                                                                                                    <TextInput
                                                                                                        size="sm"
                                                                                                        value={layer.nearbyConfig?.subtitlePrefix || ''}
                                                                                                        onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                            nearbyConfig: {
                                                                                                                ...layer.nearbyConfig,
                                                                                                                subtitlePrefix: e.target.value
                                                                                                            }
                                                                                                        } as any)}
                                                                                                    />
                                                                                                </SettingRow>
                                                                                            </div>
                                                                                            <div style={{ flex: 1 }}>
                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Subtitle Suffix" tooltip="Text added after the subtitle value (e.g., ' acres' or ' sq ft')." />)}>
                                                                                                    <TextInput
                                                                                                        size="sm"
                                                                                                        value={layer.nearbyConfig?.subtitleSuffix || ''}
                                                                                                        placeholder="e.g., acres"
                                                                                                        onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                            nearbyConfig: {
                                                                                                                ...layer.nearbyConfig,
                                                                                                                subtitleSuffix: e.target.value
                                                                                                            }
                                                                                                        } as any)}
                                                                                                    />
                                                                                                </SettingRow>
                                                                                            </div>
                                                                                        </div>

                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Link URL Field" tooltip="Field containing a URL. Makes the title a clickable link that opens this URL." />)}>
                                                                                            <Select
                                                                                                size="sm"
                                                                                                value={layer.nearbyConfig?.linkUrlField || ''}
                                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                    nearbyConfig: {
                                                                                                        ...layer.nearbyConfig,
                                                                                                        linkUrlField: e.target.value
                                                                                                    }
                                                                                                } as any)}
                                                                                            >
                                                                                                <Option value="">-- None --</Option>
                                                                                                {layerFields.map(field => (
                                                                                                    <Option key={field.name} value={field.name}>{field.alias || field.name}</Option>
                                                                                                ))}
                                                                                            </Select>
                                                                                            <span style={{ fontSize: '10px', color: 'var(--sys-color-text-light)', display: 'block', marginTop: '4px' }}>
                                                                                                Field with URL to open on click
                                                                                            </span>
                                                                                        </SettingRow>

                                                                                        <div style={{ marginTop: '12px', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Search Settings</div>

                                                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                                                            <div style={{ flex: 1 }}>
                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Search Radius" tooltip="Maximum distance to search for nearby features." />)}>
                                                                                                    <NumericInput
                                                                                                        size="sm"
                                                                                                        value={layer.nearbyConfig?.searchRadius || 5}
                                                                                                        min={0.1}
                                                                                                        max={100}
                                                                                                        step={0.5}
                                                                                                        onChange={(value) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                            nearbyConfig: {
                                                                                                                ...layer.nearbyConfig,
                                                                                                                searchRadius: value
                                                                                                            }
                                                                                                        } as any)}
                                                                                                    />
                                                                                                </SettingRow>
                                                                                            </div>
                                                                                            <div style={{ flex: 1 }}>
                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Unit" tooltip="Distance unit for the radius." />)}>
                                                                                                    <Select
                                                                                                        size="sm"
                                                                                                        value={layer.nearbyConfig?.searchRadiusUnit || 'miles'}
                                                                                                        onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                            nearbyConfig: {
                                                                                                                ...layer.nearbyConfig,
                                                                                                                searchRadiusUnit: e.target.value
                                                                                                            }
                                                                                                        } as any)}
                                                                                                    >
                                                                                                        <Option value="feet">Feet</Option>
                                                                                                        <Option value="meters">Meters</Option>
                                                                                                        <Option value="miles">Miles</Option>
                                                                                                        <Option value="kilometers">Kilometers</Option>
                                                                                                    </Select>
                                                                                                </SettingRow>
                                                                                            </div>
                                                                                        </div>

                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Max Features" tooltip="Maximum number of nearby features to return. Set higher for comprehensive lists." />)}>
                                                                                            <NumericInput
                                                                                                size="sm"
                                                                                                value={layer.nearbyConfig?.maxFeatures || 5}
                                                                                                min={1}
                                                                                                max={50}
                                                                                                onChange={(value) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                    nearbyConfig: {
                                                                                                        ...layer.nearbyConfig,
                                                                                                        maxFeatures: value
                                                                                                    }
                                                                                                } as any)}
                                                                                            />
                                                                                        </SettingRow>

                                                                                        <div style={{ marginTop: '12px', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>Distance Display</div>

                                                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                                                            <div style={{ flex: 1 }}>
                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Distance Unit" tooltip="Unit for displaying the calculated distance to each feature." />)}>
                                                                                                    <Select
                                                                                                        size="sm"
                                                                                                        value={layer.nearbyConfig?.distanceUnit || 'miles'}
                                                                                                        onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                            nearbyConfig: {
                                                                                                                ...layer.nearbyConfig,
                                                                                                                distanceUnit: e.target.value
                                                                                                            }
                                                                                                        } as any)}
                                                                                                    >
                                                                                                        <Option value="feet">Feet</Option>
                                                                                                        <Option value="meters">Meters</Option>
                                                                                                        <Option value="miles">Miles</Option>
                                                                                                        <Option value="kilometers">Kilometers</Option>
                                                                                                    </Select>
                                                                                                </SettingRow>
                                                                                            </div>
                                                                                            <div style={{ flex: 1 }}>
                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Precision" tooltip="Decimal places for distance display." />)}>
                                                                                                    <NumericInput
                                                                                                        size="sm"
                                                                                                        value={layer.nearbyConfig?.distancePrecision ?? 2}
                                                                                                        min={0}
                                                                                                        max={4}
                                                                                                        onChange={(value) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                            nearbyConfig: {
                                                                                                                ...layer.nearbyConfig,
                                                                                                                distancePrecision: value
                                                                                                            }
                                                                                                        } as any)}
                                                                                                    />
                                                                                                </SettingRow>
                                                                                            </div>
                                                                                        </div>

                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Show Distance Badge" tooltip="Display a badge on the right side showing the distance to each feature." />)}>
                                                                                            <Switch
                                                                                                checked={layer.nearbyConfig?.showDistanceBadge !== false}
                                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                    nearbyConfig: {
                                                                                                        ...layer.nearbyConfig,
                                                                                                        showDistanceBadge: (e.target as HTMLInputElement).checked
                                                                                                    }
                                                                                                } as any)}
                                                                                            />
                                                                                        </SettingRow>

                                                                                        <div style={{ marginTop: '12px', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>PDF Export</div>

                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Include in PDF" tooltip="Whether to include this nearby features list in PDF exports." />)}>
                                                                                            <Switch
                                                                                                checked={layer.nearbyConfig?.includeInPdf !== false}
                                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                    nearbyConfig: {
                                                                                                        ...layer.nearbyConfig,
                                                                                                        includeInPdf: (e.target as HTMLInputElement).checked
                                                                                                    }
                                                                                                } as any)}
                                                                                            />
                                                                                        </SettingRow>

                                                                                        {layer.nearbyConfig?.includeInPdf !== false && (
                                                                                            <SettingRow flow="wrap" label="PDF Max Features">
                                                                                                <NumericInput
                                                                                                    size="sm"
                                                                                                    value={layer.nearbyConfig?.pdfMaxFeatures || layer.nearbyConfig?.maxFeatures || 5}
                                                                                                    min={1}
                                                                                                    max={20}
                                                                                                    onChange={(value) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                        nearbyConfig: {
                                                                                                            ...layer.nearbyConfig,
                                                                                                            pdfMaxFeatures: value
                                                                                                        }
                                                                                                    } as any)}
                                                                                                />
                                                                                            </SettingRow>
                                                                                        )}
                                                                                    </div>
                                                                                )}

                                                                                {/* Layer Info Content (Optional) */}
                                                                                <div className="subsection-divider" style={{ marginTop: '16px' }}>Layer Info Content (Optional)</div>
                                                                                <p className="hint-text" style={{ marginTop: '4px', marginBottom: '8px' }}>
                                                                                    Add supplementary text, contact info, links, or action buttons specific to this data layer.
                                                                                </p>

                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Rich Text Position" tooltip="Show the rich text content before or after the data table for this layer." />)}>
                                                                                    <div className="position-buttons">
                                                                                        <button
                                                                                            className={`position-btn ${(layer.layerRichTextPosition || 'after') === 'before' ? 'active' : ''}`}
                                                                                            onClick={() => updateLayer(section.sectionId, layer.layerId, { layerRichTextPosition: 'before' })}
                                                                                        >Before Data</button>
                                                                                        <button
                                                                                            className={`position-btn ${(layer.layerRichTextPosition || 'after') === 'after' ? 'active' : ''}`}
                                                                                            onClick={() => updateLayer(section.sectionId, layer.layerId, { layerRichTextPosition: 'after' })}
                                                                                        >After Data</button>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="HTML Content" tooltip="Rich text content supporting HTML formatting, links, phone numbers, and email addresses. Uses field placeholders from this specific layer." />)}>
                                                                                    <textarea
                                                                                        className="rich-text-editor"
                                                                                        value={layer.layerRichTextContent || ''}
                                                                                        onChange={(e) => updateLayer(section.sectionId, layer.layerId, { layerRichTextContent: e.target.value })}
                                                                                        placeholder="<p>For more information, contact...</p>"
                                                                                        aria-label="Layer rich text HTML content"
                                                                                    />
                                                                                    <div className="rich-text-help">
                                                                                        <strong>Supported HTML:</strong><br />
                                                                                        • Links: <code>&lt;a href="url"&gt;text&lt;/a&gt;</code><br />
                                                                                        • Email: <code>&lt;a href="mailto:email"&gt;text&lt;/a&gt;</code><br />
                                                                                        • Phone: <code>&lt;a href="tel:number"&gt;text&lt;/a&gt;</code><br />
                                                                                        • Bold: <code>&lt;strong&gt;text&lt;/strong&gt;</code><br />
                                                                                        <strong>Field Placeholders:</strong> <code>{'{'}FieldName{'}'}</code><br />
                                                                                        <em>Uses fields from this layer's data (first result), or header info fields.</em>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                {/* Exclude layer rich text from PDF toggle */}
                                                                                <SettingRow flow="wrap" label="Exclude from PDF">
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                        <Switch
                                                                                            checked={layer.layerRichTextExcludeFromPdf || false}
                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, { layerRichTextExcludeFromPdf: (e.target as HTMLInputElement).checked })}
                                                                                            aria-label="Exclude layer rich text from PDF"
                                                                                        />
                                                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                            Show in widget only (not in PDF export)
                                                                                        </span>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                {/* Hide layer rich text when no features toggle */}
                                                                                <SettingRow flow="wrap" label="Hide When No Features">
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                        <Switch
                                                                                            checked={layer.hideLayerRichTextWhenNoResults || false}
                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, { hideLayerRichTextWhenNoResults: (e.target as HTMLInputElement).checked })}
                                                                                            aria-label="Hide layer rich text when no features returned"
                                                                                        />
                                                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                            Only show if this layer has results
                                                                                        </span>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                {/* Layer Action Buttons */}
                                                                                <div className="button-list">
                                                                                    {toMutableRichTextButtons(layer.layerRichTextButtons || []).map((button) => (
                                                                                        <div className="button-item" key={button.buttonId}>
                                                                                            <div className="button-item-header">
                                                                                                <Label style={{ fontSize: '11px', fontWeight: 600 }}>
                                                                                                    <LinkIcon /> Action Button
                                                                                                </Label>
                                                                                                <button
                                                                                                    className="delete-btn"
                                                                                                    onClick={() => removeLayerRichTextButton(section.sectionId, layer.layerId, button.buttonId)}
                                                                                                    aria-label="Remove button"
                                                                                                >
                                                                                                    <TrashIcon />
                                                                                                </button>
                                                                                            </div>
                                                                                            <div className="button-item-row">
                                                                                                <div>
                                                                                                    <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>Label</Label>
                                                                                                    <TextInput
                                                                                                        size="sm"
                                                                                                        value={button.label}
                                                                                                        onChange={(e) => updateLayerRichTextButton(section.sectionId, layer.layerId, button.buttonId, { label: e.target.value })}
                                                                                                        placeholder="Button text"
                                                                                                    />
                                                                                                </div>
                                                                                                <div>
                                                                                                    <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>Style</Label>
                                                                                                    <div className="style-buttons">
                                                                                                        <button
                                                                                                            className={`style-btn ${button.style === 'default' || !button.style ? 'active' : ''}`}
                                                                                                            onClick={() => updateLayerRichTextButton(section.sectionId, layer.layerId, button.buttonId, { style: 'default' })}
                                                                                                        >Default</button>
                                                                                                        <button
                                                                                                            className={`style-btn ${button.style === 'primary' ? 'active' : ''}`}
                                                                                                            onClick={() => updateLayerRichTextButton(section.sectionId, layer.layerId, button.buttonId, { style: 'primary' })}
                                                                                                        >Primary</button>
                                                                                                        <button
                                                                                                            className={`style-btn ${button.style === 'outline' ? 'active' : ''}`}
                                                                                                            onClick={() => updateLayerRichTextButton(section.sectionId, layer.layerId, button.buttonId, { style: 'outline' })}
                                                                                                        >Outline</button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div>
                                                                                                <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>URL (supports {'{'}field{'}'} from this layer)</Label>
                                                                                                <TextInput
                                                                                                    size="sm"
                                                                                                    value={button.url}
                                                                                                    onChange={(e) => updateLayerRichTextButton(section.sectionId, layer.layerId, button.buttonId, { url: e.target.value })}
                                                                                                    placeholder="https://example.com/docs/{ZoneCode}.pdf"
                                                                                                />
                                                                                            </div>
                                                                                            <label className="display-option">
                                                                                                <Checkbox
                                                                                                    checked={button.openInNewTab !== false}
                                                                                                    onChange={(e) => updateLayerRichTextButton(section.sectionId, layer.layerId, button.buttonId, { openInNewTab: (e.target as HTMLInputElement).checked })}
                                                                                                />
                                                                                                <span>Open in new tab</span>
                                                                                            </label>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>

                                                                                <Button
                                                                                    className="add-button add-button-secondary"
                                                                                    type="tertiary"
                                                                                    onClick={() => addLayerRichTextButton(section.sectionId, layer.layerId)}
                                                                                    aria-label="Add layer action button"
                                                                                    style={{ marginBottom: '12px' }}
                                                                                >
                                                                                    <PlusIcon />
                                                                                    Add Action Button
                                                                                </Button>

                                                                                {/* Related Tables Configuration */}
                                                                                <div className="subsection-divider" style={{ marginTop: '16px' }}>Related Tables</div>
                                                                                <p className="hint-text" style={{ marginTop: '4px', marginBottom: '8px' }}>
                                                                                    Query related tables using relationship keys to show linked records.
                                                                                </p>

                                                                                {(layer.relatedTables?.length || 0) === 0 ? (
                                                                                    <div style={{
                                                                                        padding: '12px',
                                                                                        background: 'var(--sys-color-secondary-light)',
                                                                                        borderRadius: '4px',
                                                                                        textAlign: 'center',
                                                                                        color: 'var(--sys-color-text-light)',
                                                                                        fontSize: '12px'
                                                                                    }}>
                                                                                        No related tables configured
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="related-tables-list">
                                                                                        {(layer.relatedTables || []).map((relTable: RelatedTableConfig, rtIdx: number) => (
                                                                                            <div key={relTable.tableId} className="related-table-item" style={{
                                                                                                border: '1px solid var(--sys-color-divider-primary)',
                                                                                                borderRadius: '4px',
                                                                                                padding: '10px',
                                                                                                marginBottom: '8px',
                                                                                                background: 'var(--sys-color-secondary-light)'
                                                                                            }}>
                                                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                                                                    <span style={{ fontWeight: 600, fontSize: '12px' }}>{relTable.tableName || 'Untitled Table'}</span>
                                                                                                    <Tip title="Remove related table" placement="top">
                                                                                                        <button
                                                                                                            className="delete-btn"
                                                                                                            onClick={() => removeRelatedTable(section.sectionId, layer.layerId, relTable.tableId)}
                                                                                                            aria-label="Remove related table"
                                                                                                        >
                                                                                                            <TrashIcon />
                                                                                                        </button>
                                                                                                    </Tip>
                                                                                                </div>

                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Table Name" tooltip="Display name for this related table shown in headers and PDF export." />)}>
                                                                                                    <TextInput
                                                                                                        size="sm"
                                                                                                        value={relTable.tableName}
                                                                                                        onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { tableName: e.target.value })}
                                                                                                    />
                                                                                                </SettingRow>

                                                                                                <SettingRow flow="wrap" label="Data Source">
                                                                                                    <div className="ds-selector-container">
                                                                                                        {DataSourceSelector ? (
                                                                                                            <DataSourceSelector
                                                                                                                types={SUPPORTED_DS_TYPES}
                                                                                                                useDataSources={getRelatedTableUseDataSources(relTable)}
                                                                                                                mustUseDataSource
                                                                                                                onChange={(dsArr) => handleRelatedTableDataSourceChange(section.sectionId, layer.layerId, relTable.tableId, dsArr)}
                                                                                                                widgetId={id}
                                                                                                                isMultiple={false}
                                                                                                                closeDataSourceListOnChange
                                                                                                            />
                                                                                                        ) : <div style={{ padding: "8px", fontSize: "12px", color: "var(--sys-color-text-secondary)" }}>Loading data source selector...</div>}
                                                                                                    </div>
                                                                                                    {/* Show reload button if data source selected but fields not loaded */}
                                                                                                    {relTable.dataSourceId && getRelatedTableFields(relTable.tableId).length === 0 && (
                                                                                                        <button
                                                                                                            className="add-btn"
                                                                                                            style={{ marginTop: '4px', fontSize: '11px' }}
                                                                                                            onClick={async () => {
                                                                                                                const errorKey = `related-table:${relTable.tableId}`
                                                                                                                clearFetchError(errorKey)
                                                                                                                setFetchLoading(prev => ({ ...prev, [errorKey]: true }))
                                                                                                                try {
                                                                                                                    const ds = DataSourceManager.getInstance().getDataSource(relTable.dataSourceId)
                                                                                                                    if (ds) {
                                                                                                                        await ds.ready()
                                                                                                                        const schema = ds.getSchema()
                                                                                                                        if (schema?.fields && Object.keys(schema.fields).length > 0) {
                                                                                                                            const fields: AvailableField[] = Object.entries(schema.fields).map(([key, field]: [string, any]) => ({
                                                                                                                                name: field.jimuName || field.name || key,
                                                                                                                                alias: field.alias || field.jimuName || field.name || key,
                                                                                                                                type: field.esriType || field.type || 'unknown'
                                                                                                                            }))
                                                                                                                            setAvailableFieldsMap(prev => ({
                                                                                                                                ...prev,
                                                                                                                                [`related-table:${relTable.tableId}`]: fields
                                                                                                                            }))
                                                                                                                        } else {
                                                                                                                            setFetchError(errorKey, 'No fields found in data source schema.')
                                                                                                                        }
                                                                                                                    } else {
                                                                                                                        setFetchError(errorKey, 'Could not access data source. Try refreshing.')
                                                                                                                    }
                                                                                                                } catch (err) {
                                                                                                                    const message = err instanceof Error ? err.message : 'Failed to load fields.'
                                                                                                                    setFetchError(errorKey, message)
                                                                                                                } finally {
                                                                                                                    setFetchLoading(prev => ({ ...prev, [errorKey]: false }))
                                                                                                                }
                                                                                                            }}
                                                                                                            disabled={fetchLoading[`related-table:${relTable.tableId}`]}
                                                                                                        >
                                                                                                            {fetchLoading[`related-table:${relTable.tableId}`] ? 'Loading...' : 'Reload Fields'}
                                                                                                        </button>
                                                                                                    )}
                                                                                                </SettingRow>

                                                                                                <div style={{ textAlign: 'center', color: 'var(--sys-color-text-light)', fontSize: '11px', margin: '8px 0' }}>
                                                                                                    — OR use direct URL —
                                                                                                </div>

                                                                                                <SettingRow flow="wrap" label="Table URL">
                                                                                                    <TextInput
                                                                                                        size="sm"
                                                                                                        value={relTable.tableUrl || ''}
                                                                                                        onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, {
                                                                                                            tableUrl: e.target.value,
                                                                                                            dataSourceId: e.target.value ? '' : relTable.dataSourceId,
                                                                                                            useDataSource: e.target.value ? undefined : relTable.useDataSource
                                                                                                        } as any)}
                                                                                                        onBlur={(e) => {
                                                                                                            if (e.target.value) {
                                                                                                                fetchRelatedTableFields(relTable.tableId, e.target.value)
                                                                                                            }
                                                                                                        }}
                                                                                                        placeholder="https://...FeatureServer/1"
                                                                                                    />
                                                                                                    {relTable.tableUrl && !relTable.dataSourceId && getRelatedTableFields(relTable.tableId).length === 0 && (
                                                                                                        <button
                                                                                                            className="add-btn"
                                                                                                            style={{ marginTop: '4px', fontSize: '11px' }}
                                                                                                            onClick={() => fetchRelatedTableFields(relTable.tableId, relTable.tableUrl)}
                                                                                                            disabled={fetchLoading[`related-table:${relTable.tableId}`]}
                                                                                                        >
                                                                                                            {fetchLoading[`related-table:${relTable.tableId}`] ? 'Loading...' : 'Fetch Fields'}
                                                                                                        </button>
                                                                                                    )}
                                                                                                    {fetchErrors[`related-table:${relTable.tableId}`] && (
                                                                                                        <NativeAlert
                                                                                                            type="error"
                                                                                                            withIcon
                                                                                                            open
                                                                                                            style={{ marginTop: '8px', fontSize: '11px' }}
                                                                                                        >
                                                                                                            {fetchErrors[`related-table:${relTable.tableId}`]}
                                                                                                        </NativeAlert>
                                                                                                    )}
                                                                                                </SettingRow>

                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Relationship Type" tooltip="How to join data: 'Key' uses matching field values, 'Relationship Class' uses ArcGIS Server relationships, 'Spatial' queries by geometry." />)}>
                                                                                                    <Select
                                                                                                        size="sm"
                                                                                                        value={relTable.relationshipType || 'key'}
                                                                                                        onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { relationshipType: e.target.value as any })}
                                                                                                    >
                                                                                                        <Option value="key">Foreign Key</Option>
                                                                                                        <Option value="relationshipClass">Relationship Class</Option>
                                                                                                        <Option value="spatial">Spatial</Option>
                                                                                                    </Select>
                                                                                                </SettingRow>

                                                                                                {relTable.relationshipType === 'key' || !relTable.relationshipType ? (
                                                                                                    <>
                                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Primary Key Field" tooltip="Field in the parent layer that matches records (e.g., PARCEL_ID, OBJECTID)." />)}>
                                                                                                            <Select
                                                                                                                size="sm"
                                                                                                                value={relTable.primaryKeyField || ''}
                                                                                                                onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { primaryKeyField: e.target.value })}
                                                                                                            >
                                                                                                                <Option value="">-- Select field from parent layer --</Option>
                                                                                                                {layerFields.map(field => (
                                                                                                                    <Option key={field.name} value={field.name}>
                                                                                                                        {field.alias !== field.name ? `${field.alias} (${field.name})` : field.name}
                                                                                                                    </Option>
                                                                                                                ))}
                                                                                                            </Select>
                                                                                                            {layerFields.length === 0 && (
                                                                                                                <p className="hint-text" style={{ marginTop: '4px', color: '#f5a623' }}>
                                                                                                                    Select a data source or fetch fields for parent layer first
                                                                                                                </p>
                                                                                                            )}
                                                                                                        </SettingRow>
                                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Foreign Key Field" tooltip="Field in the related table that matches the primary key field." />)}>
                                                                                                            <Select
                                                                                                                size="sm"
                                                                                                                value={relTable.foreignKeyField || ''}
                                                                                                                onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { foreignKeyField: e.target.value })}
                                                                                                            >
                                                                                                                <Option value="">-- Select field from related table --</Option>
                                                                                                                {getRelatedTableFields(relTable.tableId).map(field => (
                                                                                                                    <Option key={field.name} value={field.name}>
                                                                                                                        {field.alias !== field.name ? `${field.alias} (${field.name})` : field.name}
                                                                                                                    </Option>
                                                                                                                ))}
                                                                                                            </Select>
                                                                                                            {getRelatedTableFields(relTable.tableId).length === 0 && (
                                                                                                                <p className="hint-text" style={{ marginTop: '4px', color: '#f5a623' }}>
                                                                                                                    Click "Fetch Fields" above to load available fields
                                                                                                                </p>
                                                                                                            )}
                                                                                                        </SettingRow>
                                                                                                    </>
                                                                                                ) : relTable.relationshipType === 'spatial' ? (
                                                                                                    <>
                                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Spatial Relationship" tooltip="How geometries should relate: intersects (overlap), contains, within, touches, etc." />)}>
                                                                                                            <Select
                                                                                                                size="sm"
                                                                                                                value={relTable.spatialRelationship || 'intersects'}
                                                                                                                onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { spatialRelationship: e.target.value as any })}
                                                                                                            >
                                                                                                                <Option value="intersects">Intersects</Option>
                                                                                                                <Option value="contains">Contains</Option>
                                                                                                                <Option value="within">Within</Option>
                                                                                                                <Option value="crosses">Crosses</Option>
                                                                                                                <Option value="touches">Touches</Option>
                                                                                                                <Option value="overlaps">Overlaps</Option>
                                                                                                                <Option value="nearby">Nearby (with buffer)</Option>
                                                                                                            </Select>
                                                                                                        </SettingRow>
                                                                                                        <SettingRow flow="wrap" label="Buffer Distance">
                                                                                                            <div className="input-row">
                                                                                                                <NumericInput
                                                                                                                    size="sm"
                                                                                                                    value={relTable.spatialBuffer || 0}
                                                                                                                    min={0}
                                                                                                                    onChange={(value) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { spatialBuffer: value })}
                                                                                                                    style={{ width: 70 }}
                                                                                                                />
                                                                                                                <Select
                                                                                                                    size="sm"
                                                                                                                    value={relTable.spatialBufferUnit || 'feet'}
                                                                                                                    onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { spatialBufferUnit: e.target.value as any })}
                                                                                                                    style={{ width: 100 }}
                                                                                                                >
                                                                                                                    <Option value="feet">Feet</Option>
                                                                                                                    <Option value="meters">Meters</Option>
                                                                                                                    <Option value="miles">Miles</Option>
                                                                                                                    <Option value="kilometers">Kilometers</Option>
                                                                                                                </Select>
                                                                                                            </div>
                                                                                                        </SettingRow>
                                                                                                        <SettingRow flow="wrap" label="Use Parent Geometry">
                                                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                                <Switch
                                                                                                                    checked={relTable.useParentGeometry !== false}
                                                                                                                    onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { useParentGeometry: (e.target as HTMLInputElement).checked })}
                                                                                                                />
                                                                                                                <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                                                    {relTable.useParentGeometry !== false ? 'Parent feature geometry' : 'Query point'}
                                                                                                                </span>
                                                                                                            </div>
                                                                                                        </SettingRow>
                                                                                                    </>
                                                                                                ) : (
                                                                                                    <SettingRow flow="wrap" label="Relationship ID">
                                                                                                        <NumericInput
                                                                                                            size="sm"
                                                                                                            value={relTable.relationshipId || 0}
                                                                                                            min={0}
                                                                                                            onChange={(value) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { relationshipId: value })}
                                                                                                            style={{ width: 80 }}
                                                                                                        />
                                                                                                    </SettingRow>
                                                                                                )}

                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Display Mode" tooltip="How to show related records: table (rows/columns), list (stacked), or card (grouped)." />)}>
                                                                                                    <Select
                                                                                                        size="sm"
                                                                                                        value={relTable.displayMode || 'table'}
                                                                                                        onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { displayMode: e.target.value as any })}
                                                                                                    >
                                                                                                        <Option value="table">Table</Option>
                                                                                                        <Option value="list">List</Option>
                                                                                                        <Option value="card">Cards</Option>
                                                                                                    </Select>
                                                                                                </SettingRow>

                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Default Sort Field" tooltip="Select a field to sort records by when they first load. Leave as 'None' to use the natural order from the query." />)}>
                                                                                                    <Select
                                                                                                        size="sm"
                                                                                                        value={relTable.defaultSortField || ''}
                                                                                                        onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { defaultSortField: e.target.value || undefined })}
                                                                                                        aria-label="Default sort field"
                                                                                                    >
                                                                                                        <Option value="">None</Option>
                                                                                                        {(relTable.fields || []).filter((f: any) => f.visible !== false).map((field: any) => (
                                                                                                            <Option key={field.name} value={field.name}>
                                                                                                                {field.alias || field.name}
                                                                                                            </Option>
                                                                                                        ))}
                                                                                                    </Select>
                                                                                                </SettingRow>

                                                                                                {relTable.defaultSortField && (
                                                                                                    <SettingRow flow="wrap" label={(<TooltipLabel label="Sort Order" tooltip="Choose ascending (A-Z, 0-9, oldest to newest) or descending (Z-A, 9-0, newest to oldest) order for the default sort." />)}>
                                                                                                        <Select
                                                                                                            size="sm"
                                                                                                            value={relTable.defaultSortOrder || 'asc'}
                                                                                                            onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { defaultSortOrder: e.target.value as any })}
                                                                                                            aria-label="Sort order"
                                                                                                        >
                                                                                                            <Option value="asc">Ascending (A→Z, 0→9, Oldest→Newest)</Option>
                                                                                                            <Option value="desc">Descending (Z→A, 9→0, Newest→Oldest)</Option>
                                                                                                        </Select>
                                                                                                    </SettingRow>
                                                                                                )}

                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Display Pane" tooltip="'Inline' shows records in the current section. 'Separate' opens a dedicated pane for the data." />)}>
                                                                                                    <Select
                                                                                                        size="sm"
                                                                                                        value={relTable.displayPane || 'inline'}
                                                                                                        onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { displayPane: e.target.value as any })}
                                                                                                    >
                                                                                                        <Option value="inline">Inline (Current Section)</Option>
                                                                                                        <Option value="separate">Separate Pane</Option>
                                                                                                    </Select>
                                                                                                </SettingRow>

                                                                                                {relTable.displayPane === 'separate' && (
                                                                                                    <SettingRow flow="wrap" label="Pane Title">
                                                                                                        <TextInput
                                                                                                            size="sm"
                                                                                                            value={relTable.separatePaneTitle || ''}
                                                                                                            placeholder={relTable.tableName || 'Related Records'}
                                                                                                            onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { separatePaneTitle: e.target.value })}
                                                                                                        />
                                                                                                    </SettingRow>
                                                                                                )}

                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Default Expanded" tooltip="Controls whether this related table section is expanded or collapsed when results are displayed. When collapsed, users can click to expand and view the data." />)}>
                                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                        <Switch
                                                                                                            checked={relTable.expanded !== false}
                                                                                                            onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { expanded: (e.target as HTMLInputElement).checked })}
                                                                                                            aria-label="Default expanded state"
                                                                                                        />
                                                                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                                            {relTable.expanded !== false ? 'Expanded by default' : 'Collapsed by default'}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </SettingRow>

                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Interactive Sorting" tooltip="Allow users to click column headers to sort data in the widget table." />)}>
                                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                        <Switch
                                                                                                            checked={relTable.enableInteractiveSorting !== false}
                                                                                                            onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { enableInteractiveSorting: (e.target as HTMLInputElement).checked })}
                                                                                                        />
                                                                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                                            Click column headers to sort
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </SettingRow>

                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Enable Chart" tooltip="Show a chart visualization of the related table data." />)}>
                                                                                                    <Switch
                                                                                                        checked={relTable.enableChart || false}
                                                                                                        onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { enableChart: (e.target as HTMLInputElement).checked })}
                                                                                                    />
                                                                                                </SettingRow>

                                                                                                <SettingRow flow="wrap" label="Max Records">
                                                                                                    <NumericInput
                                                                                                        size="sm"
                                                                                                        value={relTable.maxRecords || 50}
                                                                                                        min={1}
                                                                                                        max={500}
                                                                                                        onChange={(value) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { maxRecords: value })}
                                                                                                        style={{ width: 80 }}
                                                                                                    />
                                                                                                </SettingRow>

                                                                                                {/* Field Selection for Related Table */}
                                                                                                {(relTable.tableUrl || relTable.dataSourceId) && (
                                                                                                    <>
                                                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', marginBottom: '8px' }}>
                                                                                                            <Label style={{ fontWeight: 600, fontSize: '12px' }}>Fields to Display</Label>
                                                                                                            {relTable.tableUrl && !relTable.dataSourceId && (
                                                                                                                <Button
                                                                                                                    type="tertiary"
                                                                                                                    size="sm"
                                                                                                                    onClick={() => fetchRelatedTableFields(relTable.tableId, relTable.tableUrl)}
                                                                                                                    disabled={fetchLoading[`related-table:${relTable.tableId}`]}
                                                                                                                >
                                                                                                                    {fetchLoading[`related-table:${relTable.tableId}`] ? 'Loading...' : 'Fetch Fields'}
                                                                                                                </Button>
                                                                                                            )}
                                                                                                        </div>
                                                                                                        {/* Quick select buttons */}
                                                                                                        {getRelatedTableFields(relTable.tableId).length > 0 && (
                                                                                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                                                                                                <Button
                                                                                                                    type="tertiary"
                                                                                                                    size="sm"
                                                                                                                    style={{ fontSize: '10px', padding: '2px 8px' }}
                                                                                                                    onClick={() => {
                                                                                                                        const allFields = getRelatedTableFields(relTable.tableId)
                                                                                                                        const newFields = allFields.map(f => ({
                                                                                                                            name: f.name,
                                                                                                                            alias: f.alias || f.name,
                                                                                                                            visible: true,
                                                                                                                            format: undefined
                                                                                                                        }))
                                                                                                                        updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { fields: newFields })
                                                                                                                    }}
                                                                                                                >
                                                                                                                    Select All
                                                                                                                </Button>
                                                                                                                <Button
                                                                                                                    type="tertiary"
                                                                                                                    size="sm"
                                                                                                                    style={{ fontSize: '10px', padding: '2px 8px' }}
                                                                                                                    onClick={() => {
                                                                                                                        updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { fields: [] })
                                                                                                                    }}
                                                                                                                >
                                                                                                                    Select None
                                                                                                                </Button>
                                                                                                            </div>
                                                                                                        )}
                                                                                                        <p style={{ fontSize: '10px', color: 'var(--sys-color-text-light)', margin: '0 0 6px 0', fontStyle: 'italic' }}>
                                                                                                            {(relTable.fields?.length || 0) === 0
                                                                                                                ? '⚠ No fields selected - showing first 5 fields by default'
                                                                                                                : `${relTable.fields?.length || 0} field(s) selected`}
                                                                                                        </p>
                                                                                                        <div className="fields-container">
                                                                                                            {(() => {
                                                                                                                const rtFields = getRelatedTableFields(relTable.tableId)
                                                                                                                const selectedRtFields = relTable.fields || []

                                                                                                                if (rtFields.length === 0) {
                                                                                                                    return (
                                                                                                                        <div className="field-item" style={{ justifyContent: 'center', color: 'var(--sys-color-text-light)', fontSize: '11px' }}>
                                                                                                                            Click "Fetch Fields" to load available fields
                                                                                                                        </div>
                                                                                                                    )
                                                                                                                }

                                                                                                                return rtFields.map(field => {
                                                                                                                    const isSelected = selectedRtFields.some(f => f.name === field.name)
                                                                                                                    const currentAlias = getRelatedTableFieldAlias(relTable, field.name)
                                                                                                                    const currentFormat = getRelatedTableFieldFormat(relTable, field.name)
                                                                                                                    const displayAlias = field.alias !== field.name ? ` (${field.alias})` : ''

                                                                                                                    return (
                                                                                                                        <div className="field-item" key={field.name} style={{ flexWrap: 'wrap' }}>
                                                                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                                                                                                                                <Checkbox
                                                                                                                                    checked={isSelected}
                                                                                                                                    onChange={() => toggleRelatedTableFieldSelection(section.sectionId, layer.layerId, relTable.tableId, field.name)}
                                                                                                                                    aria-label={`Select ${field.name}`}
                                                                                                                                />
                                                                                                                                <span className="field-name" style={{ fontSize: '11px' }}>{field.name}</span>
                                                                                                                                {displayAlias && <span className="field-alias" style={{ color: 'var(--sys-color-text-light)', fontSize: '10px' }}>{displayAlias}</span>}
                                                                                                                            </div>
                                                                                                                            {isSelected && (
                                                                                                                                <div style={{ width: '100%', marginTop: '6px', paddingLeft: '24px' }}>
                                                                                                                                    <div style={{ marginBottom: '6px' }}>
                                                                                                                                        <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>Display Alias</Label>
                                                                                                                                        <TextInput
                                                                                                                                            size="sm"
                                                                                                                                            value={currentAlias}
                                                                                                                                            onChange={(e) => updateRelatedTableFieldAlias(section.sectionId, layer.layerId, relTable.tableId, field.name, e.target.value)}
                                                                                                                                            placeholder="Display alias"
                                                                                                                                        />
                                                                                                                                    </div>
                                                                                                                                    <div style={{ marginBottom: '6px' }}>
                                                                                                                                        <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>Format Type</Label>
                                                                                                                                        <Select
                                                                                                                                            size="sm"
                                                                                                                                            value={currentFormat.type || 'auto'}
                                                                                                                                            onChange={(e) => updateRelatedTableFieldFormat(section.sectionId, layer.layerId, relTable.tableId, field.name, { type: e.target.value as any })}
                                                                                                                                        >
                                                                                                                                            <Option value="auto">Auto</Option>
                                                                                                                                            <Option value="text">Text</Option>
                                                                                                                                            <Option value="number">Number</Option>
                                                                                                                                            <Option value="date">Date</Option>
                                                                                                                                            <Option value="link">Link</Option>
                                                                                                                                        </Select>
                                                                                                                                    </div>
                                                                                                                                    {(currentFormat.type === 'number' || currentFormat.type === 'auto') && (
                                                                                                                                        <div style={{ marginBottom: '6px' }}>
                                                                                                                                            <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>Number Format</Label>
                                                                                                                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                                                                                                                <Select
                                                                                                                                                    size="sm"
                                                                                                                                                    value={currentFormat.numberFormat || 'default'}
                                                                                                                                                    onChange={(e) => updateRelatedTableFieldFormat(section.sectionId, layer.layerId, relTable.tableId, field.name, { numberFormat: e.target.value as any })}
                                                                                                                                                    style={{ width: '90px' }}
                                                                                                                                                >
                                                                                                                                                    <Option value="default">Default</Option>
                                                                                                                                                    <Option value="none">No Format</Option>
                                                                                                                                                    <Option value="decimal">Decimal</Option>
                                                                                                                                                    <Option value="currency">Currency</Option>
                                                                                                                                                    <Option value="percent">Percent</Option>
                                                                                                                                                </Select>
                                                                                                                                                <Label style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                                                                                                    <Checkbox
                                                                                                                                                        checked={currentFormat.useGrouping !== false}
                                                                                                                                                        onChange={(e) => updateRelatedTableFieldFormat(section.sectionId, layer.layerId, relTable.tableId, field.name, { useGrouping: (e.target as HTMLInputElement).checked })}
                                                                                                                                                    />
                                                                                                                                                    Commas
                                                                                                                                                </Label>
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                    )}
                                                                                                                                    {currentFormat.type === 'date' && (
                                                                                                                                        <div style={{ marginBottom: '6px' }}>
                                                                                                                                            <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>Date Format</Label>
                                                                                                                                            <Select
                                                                                                                                                size="sm"
                                                                                                                                                value={currentFormat.dateFormat || 'default'}
                                                                                                                                                onChange={(e) => updateRelatedTableFieldFormat(section.sectionId, layer.layerId, relTable.tableId, field.name, { dateFormat: e.target.value as any })}
                                                                                                                                            >
                                                                                                                                                <Option value="default">Default</Option>
                                                                                                                                                <Option value="short">Short (1/1/24)</Option>
                                                                                                                                                <Option value="medium">Medium (Jan 1, 2024)</Option>
                                                                                                                                                <Option value="long">Long (January 1, 2024)</Option>
                                                                                                                                                <Option value="iso">ISO (2024-01-01)</Option>
                                                                                                                                            </Select>
                                                                                                                                        </div>
                                                                                                                                    )}
                                                                                                                                    {currentFormat.type === 'link' && (
                                                                                                                                        <div style={{ marginBottom: '6px' }}>
                                                                                                                                            <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>Link Text</Label>
                                                                                                                                            <TextInput
                                                                                                                                                size="sm"
                                                                                                                                                value={currentFormat.linkText || ''}
                                                                                                                                                onChange={(e) => updateRelatedTableFieldFormat(section.sectionId, layer.layerId, relTable.tableId, field.name, { linkText: e.target.value })}
                                                                                                                                                placeholder="Click here"
                                                                                                                                            />
                                                                                                                                        </div>
                                                                                                                                    )}
                                                                                                                                    {currentFormat.type === 'link' && (
                                                                                                                                        <div style={{ marginBottom: '6px' }}>
                                                                                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                                                                                                                <Switch
                                                                                                                                                    checked={currentFormat.useLinkBaseUrl || false}
                                                                                                                                                    onChange={(e) => updateRelatedTableFieldFormat(section.sectionId, layer.layerId, relTable.tableId, field.name, { useLinkBaseUrl: (e.target as HTMLInputElement).checked })}
                                                                                                                                                    aria-label="Enable base URL"
                                                                                                                                                />
                                                                                                                                                <Label style={{ fontSize: '10px', cursor: 'pointer' }}>
                                                                                                                                                    Prepend Base URL
                                                                                                                                                </Label>
                                                                                                                                                <Tip title="Prepend a base URL to the field value" placement="top">
                                                                                                                                                    <span style={{ color: 'var(--sys-color-text-light)', cursor: 'help', fontSize: '10px' }}>ⓘ</span>
                                                                                                                                                </Tip>
                                                                                                                                            </div>
                                                                                                                                            {currentFormat.useLinkBaseUrl && (
                                                                                                                                                <TextInput
                                                                                                                                                    size="sm"
                                                                                                                                                    value={currentFormat.linkBaseUrl || ''}
                                                                                                                                                    onChange={(e) => updateRelatedTableFieldFormat(section.sectionId, layer.layerId, relTable.tableId, field.name, { linkBaseUrl: e.target.value })}
                                                                                                                                                    placeholder="https://example.com/docs/"
                                                                                                                                                />
                                                                                                                                            )}
                                                                                                                                        </div>
                                                                                                                                    )}

                                                                                                                                    {/* Hide NULL values toggle */}
                                                                                                                                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                                                                        <Switch
                                                                                                                                            checked={getRelatedTableFieldHideNull(relTable, field.name)}
                                                                                                                                            onChange={() => toggleRelatedTableFieldHideNull(section.sectionId, layer.layerId, relTable.tableId, field.name)}
                                                                                                                                            aria-label={`Hide ${field.name} when NULL`}
                                                                                                                                        />
                                                                                                                                        <Label style={{ fontSize: '10px', cursor: 'pointer' }}>
                                                                                                                                            Hide when NULL
                                                                                                                                        </Label>
                                                                                                                                        <Tip title="Hide this column when all values are NULL or empty" placement="top">
                                                                                                                                            <span style={{ color: 'var(--sys-color-text-light)', cursor: 'help', fontSize: '11px' }}>ⓘ</span>
                                                                                                                                        </Tip>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            )}
                                                                                                                        </div>
                                                                                                                    )
                                                                                                                })
                                                                                                            })()}
                                                                                                        </div>
                                                                                                    </>
                                                                                                )}
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                )}

                                                                                <Button
                                                                                    className="add-button"
                                                                                    type="tertiary"
                                                                                    onClick={() => addRelatedTable(section.sectionId, layer.layerId)}
                                                                                    style={{ marginTop: '8px' }}
                                                                                >
                                                                                    <PlusIcon />
                                                                                    Add Related Table
                                                                                </Button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                )}

                                                <Button
                                                    className="add-button add-button-primary"
                                                    type="tertiary"
                                                    onClick={() => addLayerToSection(section.sectionId)}
                                                    aria-label="Add data source"
                                                >
                                                    <PlusIcon />
                                                    Add Data Source
                                                </Button>


                                                {/* Rich Text / Info Content (Optional) */}
                                                <div className="subsection-divider">Section Info Content (Optional)</div>
                                                <p className="hint-text">
                                                    Add supplementary text, contact info, links, or action buttons to this section.
                                                </p>

                                                <SettingRow flow="wrap" label={(<TooltipLabel label="Rich Text Position" tooltip="Show the rich text content before or after the data tables in this section." />)}>
                                                    <div className="position-buttons">
                                                        <button
                                                            className={`position-btn ${(section.richTextPosition || 'after') === 'before' ? 'active' : ''}`}
                                                            onClick={() => updateSection(section.sectionId, { richTextPosition: 'before' })}
                                                        >Before Data</button>
                                                        <button
                                                            className={`position-btn ${(section.richTextPosition || 'after') === 'after' ? 'active' : ''}`}
                                                            onClick={() => updateSection(section.sectionId, { richTextPosition: 'after' })}
                                                        >After Data</button>
                                                    </div>
                                                </SettingRow>

                                                <SettingRow flow="wrap" label={(<TooltipLabel label="HTML Content" tooltip="Rich text content supporting HTML formatting, links, phone numbers, and email addresses." />)}>
                                                    <textarea
                                                        className="rich-text-editor"
                                                        value={section.richTextContent || ''}
                                                        onChange={(e) => updateSection(section.sectionId, { richTextContent: e.target.value })}
                                                        placeholder="<p>For more information, contact...</p>"
                                                        aria-label="Rich text HTML content"
                                                    />
                                                    <div className="rich-text-help">
                                                        <strong>Supported HTML:</strong><br />
                                                        • Links: <code>&lt;a href="url"&gt;text&lt;/a&gt;</code><br />
                                                        • Email: <code>&lt;a href="mailto:email"&gt;text&lt;/a&gt;</code><br />
                                                        • Phone: <code>&lt;a href="tel:number"&gt;text&lt;/a&gt;</code><br />
                                                        • Bold: <code>&lt;strong&gt;text&lt;/strong&gt;</code><br />
                                                        <strong>Field Placeholders:</strong> <code>{'{'}FieldName{'}'}</code><br />
                                                        <em>Uses fields from this section's data layers (first result), or header info fields.</em>
                                                    </div>
                                                </SettingRow>

                                                {/* Exclude rich text from PDF toggle */}
                                                <SettingRow flow="wrap" label="Exclude from PDF">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Switch
                                                            checked={section.richTextExcludeFromPdf || false}
                                                            onChange={(e) => updateSection(section.sectionId, { richTextExcludeFromPdf: (e.target as HTMLInputElement).checked })}
                                                            aria-label="Exclude rich text from PDF"
                                                        />
                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                            Show in widget only (not in PDF export)
                                                        </span>
                                                    </div>
                                                </SettingRow>

                                                {/* Hide rich text when no features toggle */}
                                                <SettingRow flow="wrap" label="Hide When No Features">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Switch
                                                            checked={section.hideRichTextWhenNoResults || false}
                                                            onChange={(e) => updateSection(section.sectionId, { hideRichTextWhenNoResults: (e.target as HTMLInputElement).checked })}
                                                            aria-label="Hide rich text when no features returned"
                                                        />
                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                            Only show if at least one data layer has results
                                                        </span>
                                                    </div>
                                                </SettingRow>

                                                {/* Action Buttons */}
                                                <div className="button-list">
                                                    {toMutableRichTextButtons(section.richTextButtons || []).map((button) => (
                                                        <div className="button-item" key={button.buttonId}>
                                                            <div className="button-item-header">
                                                                <Label style={{ fontSize: '11px', fontWeight: 600 }}>
                                                                    <LinkIcon /> Action Button
                                                                </Label>
                                                                <button
                                                                    className="delete-btn"
                                                                    onClick={() => removeRichTextButton(section.sectionId, button.buttonId)}
                                                                    aria-label="Remove button"
                                                                >
                                                                    <TrashIcon />
                                                                </button>
                                                            </div>
                                                            <div className="button-item-row">
                                                                <div>
                                                                    <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>Label</Label>
                                                                    <TextInput
                                                                        size="sm"
                                                                        value={button.label}
                                                                        onChange={(e) => updateRichTextButton(section.sectionId, button.buttonId, { label: e.target.value })}
                                                                        placeholder="Button text"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>Style</Label>
                                                                    <div className="button-style-selector">
                                                                        <button
                                                                            className={`button-style-btn ${(button.style || 'default') === 'default' ? 'active' : ''}`}
                                                                            onClick={() => updateRichTextButton(section.sectionId, button.buttonId, { style: 'default' })}
                                                                        >Default</button>
                                                                        <button
                                                                            className={`button-style-btn ${button.style === 'primary' ? 'active' : ''}`}
                                                                            onClick={() => updateRichTextButton(section.sectionId, button.buttonId, { style: 'primary' })}
                                                                        >Primary</button>
                                                                        <button
                                                                            className={`button-style-btn ${button.style === 'outline' ? 'active' : ''}`}
                                                                            onClick={() => updateRichTextButton(section.sectionId, button.buttonId, { style: 'outline' })}
                                                                        >Outline</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>URL (supports {'{'}field{'}'} from section layers)</Label>
                                                                <TextInput
                                                                    size="sm"
                                                                    value={button.url}
                                                                    onChange={(e) => updateRichTextButton(section.sectionId, button.buttonId, { url: e.target.value })}
                                                                    placeholder="https://example.com/docs/{ZoneCode}.pdf"
                                                                />
                                                            </div>
                                                            <label className="display-option">
                                                                <Checkbox
                                                                    checked={button.openInNewTab !== false}
                                                                    onChange={(e) => updateRichTextButton(section.sectionId, button.buttonId, { openInNewTab: (e.target as HTMLInputElement).checked })}
                                                                />
                                                                <span>Open in new tab</span>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>

                                                <Button
                                                    className="add-button add-button-secondary"
                                                    type="tertiary"
                                                    onClick={() => addRichTextButton(section.sectionId)}
                                                    aria-label="Add action button"
                                                >
                                                    <PlusIcon />
                                                    Add Action Button
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}

                        <Button
                            className="add-button add-button-primary"
                            type="tertiary"
                            onClick={() => addSection()}
                            aria-label="Add section"
                        >
                            <PlusIcon />
                            Add Section
                        </Button>
                    </div>
                </div>
            </div>

            {/* ============================================ */}
            {/* ENHANCED PDF EXPORT SETTINGS */}
            {/* ============================================ */}
            <div className="collapsible-panel">
                <div
                    className="collapsible-panel-header"
                    onClick={() => togglePanel('pdf-export')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && togglePanel('pdf-export')}
                    aria-expanded={expandedPanels.has('pdf-export')}
                >
                    <div className="collapsible-panel-header-left">
                        <span className="collapsible-panel-title">PDF Export Settings</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('pdf-export') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('pdf-export') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <p className="hint-text">
                            Configure the appearance of exported PDF reports (portrait 8.5" × 11" format).
                        </p>

                        {/* Logo Upload Section */}
                        <div className="pdf-section-card">
                            <div className="pdf-section-title">
                                <ImageIcon />
                                Logo / Image
                            </div>

                            <input
                                ref={logoInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                style={{ display: 'none' }}
                                aria-label="Upload logo"
                            />

                            {pdfHeader.logoBase64 ? (
                                <>
                                    <div className="logo-preview-container">
                                        <img
                                            src={pdfHeader.logoBase64}
                                            alt={logoConfig.altText || 'Logo preview'}
                                            className="logo-preview"
                                            style={{
                                                borderRadius: logoConfig.shape === 'circle' ? '50%' :
                                                    logoConfig.shape === 'rounded' ? `${logoConfig.borderRadius || 4}px` : '0',
                                                backgroundColor: logoConfig.backgroundColor || 'transparent'
                                            }}
                                        />
                                        <div style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                            {pdfHeader.logoFileName}
                                            {logoConfig.originalWidth && logoConfig.originalHeight && (
                                                <span style={{ marginLeft: '8px' }}>
                                                    ({logoConfig.originalWidth} × {logoConfig.originalHeight}px)
                                                </span>
                                            )}
                                        </div>
                                        <div className="logo-actions">
                                            <Button size="sm" type="secondary" onClick={() => logoInputRef.current?.click()}>
                                                Change
                                            </Button>
                                            <Button size="sm" type="secondary" onClick={removeLogo}>
                                                Remove
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Size Settings Subsection */}
                                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--sys-color-divider-secondary)' }}>
                                        <div style={{ fontWeight: 500, fontSize: '12px', marginBottom: '8px', color: 'var(--sys-color-primary-main)' }}>
                                            Size Settings
                                        </div>

                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Size Mode" tooltip="Auto: maintains aspect ratio within max dimensions. Fit: scales to fit container. Stretch: fills exact dimensions. Custom: specify exact size." />)}>
                                            <Select
                                                size="sm"
                                                value={logoConfig.sizeMode || 'auto'}
                                                onChange={(e) => updateLogo({ sizeMode: e.target.value as ImageSizeMode })}
                                                style={{ width: '100%' }}
                                            >
                                                <Option value="auto">Auto (fit within max size, keep aspect ratio)</Option>
                                                <Option value="fit">Fit (scale to max size, keep aspect ratio)</Option>
                                                <Option value="custom">Custom (exact size, keep aspect ratio)</Option>
                                                <Option value="stretch">Stretch (exact size, may distort)</Option>
                                            </Select>
                                        </SettingRow>
                                        <p className="hint-text" style={{ marginTop: '2px', marginBottom: '8px' }}>
                                            {logoConfig.sizeMode === 'stretch'
                                                ? 'Image will be stretched to exact dimensions (may distort)'
                                                : logoConfig.sizeMode === 'custom'
                                                    ? 'Image will scale to exact width, height calculated from aspect ratio'
                                                    : 'Image will scale to fit within maximum dimensions'
                                            }
                                        </p>

                                        {/* Auto/Fit Mode: Max dimensions */}
                                        {(!logoConfig.sizeMode || logoConfig.sizeMode === 'auto' || logoConfig.sizeMode === 'fit') && (
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <SettingRow flow="wrap" label="Max Width (mm)" style={{ flex: 1 }}>
                                                    <NumericInput
                                                        size="sm"
                                                        value={logoConfig.maxWidth ?? 50}
                                                        min={10}
                                                        max={100}
                                                        onChange={(value) => updateLogo({ maxWidth: Number(value) })}
                                                        style={{ width: '100%' }}
                                                    />
                                                </SettingRow>
                                                <SettingRow flow="wrap" label="Max Height (mm)" style={{ flex: 1 }}>
                                                    <NumericInput
                                                        size="sm"
                                                        value={logoConfig.maxHeight ?? 25}
                                                        min={5}
                                                        max={60}
                                                        onChange={(value) => updateLogo({ maxHeight: Number(value) })}
                                                        style={{ width: '100%' }}
                                                    />
                                                </SettingRow>
                                            </div>
                                        )}

                                        {/* Custom Mode: Width only (height from aspect ratio) */}
                                        {logoConfig.sizeMode === 'custom' && (
                                            <SettingRow flow="wrap" label="Width (mm)">
                                                <NumericInput
                                                    size="sm"
                                                    value={logoConfig.customWidth ?? 40}
                                                    min={5}
                                                    max={100}
                                                    onChange={(value) => updateLogo({ customWidth: Number(value) })}
                                                    style={{ width: 100 }}
                                                />
                                                <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                    Height auto-calculated from aspect ratio
                                                </span>
                                            </SettingRow>
                                        )}

                                        {/* Stretch Mode: Both dimensions */}
                                        {logoConfig.sizeMode === 'stretch' && (
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <SettingRow flow="wrap" label="Width (mm)" style={{ flex: 1 }}>
                                                    <NumericInput
                                                        size="sm"
                                                        value={logoConfig.customWidth ?? 40}
                                                        min={5}
                                                        max={100}
                                                        onChange={(value) => updateLogo({ customWidth: Number(value) })}
                                                        style={{ width: '100%' }}
                                                    />
                                                </SettingRow>
                                                <SettingRow flow="wrap" label="Height (mm)" style={{ flex: 1 }}>
                                                    <NumericInput
                                                        size="sm"
                                                        value={logoConfig.customHeight ?? 20}
                                                        min={5}
                                                        max={60}
                                                        onChange={(value) => updateLogo({ customHeight: Number(value) })}
                                                        style={{ width: '100%' }}
                                                    />
                                                </SettingRow>
                                            </div>
                                        )}
                                    </div>

                                    {/* Position & Layout Subsection */}
                                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--sys-color-divider-secondary)' }}>
                                        <div style={{ fontWeight: 500, fontSize: '12px', marginBottom: '8px', color: 'var(--sys-color-primary-main)' }}>
                                            Position &amp; Layout
                                        </div>

                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Horizontal Position" tooltip="Where the logo appears horizontally in the PDF header." />)}>
                                            <div className="position-buttons">
                                                <button
                                                    className={`position-btn ${(logoConfig.position || 'left') === 'left' ? 'active' : ''}`}
                                                    onClick={() => updateLogo({ position: 'left' })}
                                                    title="Align logo to left"
                                                >Left</button>
                                                <button
                                                    className={`position-btn ${logoConfig.position === 'center' ? 'active' : ''}`}
                                                    onClick={() => updateLogo({ position: 'center' })}
                                                    title="Center logo horizontally"
                                                >Center</button>
                                                <button
                                                    className={`position-btn ${logoConfig.position === 'right' ? 'active' : ''}`}
                                                    onClick={() => updateLogo({ position: 'right' })}
                                                    title="Align logo to right"
                                                >Right</button>
                                            </div>
                                        </SettingRow>

                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Vertical Alignment" tooltip="How the logo aligns vertically within the header space." />)}>
                                            <div className="position-buttons">
                                                <button
                                                    className={`position-btn ${logoConfig.verticalAlign === 'top' ? 'active' : ''}`}
                                                    onClick={() => updateLogo({ verticalAlign: 'top' })}
                                                    title="Align logo to top"
                                                >Top</button>
                                                <button
                                                    className={`position-btn ${(!logoConfig.verticalAlign || logoConfig.verticalAlign === 'middle') ? 'active' : ''}`}
                                                    onClick={() => updateLogo({ verticalAlign: 'middle' })}
                                                    title="Center logo vertically"
                                                >Middle</button>
                                                <button
                                                    className={`position-btn ${logoConfig.verticalAlign === 'bottom' ? 'active' : ''}`}
                                                    onClick={() => updateLogo({ verticalAlign: 'bottom' })}
                                                    title="Align logo to bottom"
                                                >Bottom</button>
                                            </div>
                                        </SettingRow>

                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Padding (mm)" tooltip="Space around the logo in millimeters. Adds visual breathing room between logo and other elements." />)}>
                                            <NumericInput
                                                size="sm"
                                                value={logoConfig.padding ?? 0}
                                                min={0}
                                                max={10}
                                                onChange={(value) => updateLogo({ padding: Number(value) })}
                                                style={{ width: 80 }}
                                            />
                                        </SettingRow>

                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Header Height (mm)" tooltip="Total height of the PDF header area including logo, title, and date. Increase if content is overlapping." />)}>
                                            <NumericInput
                                                size="sm"
                                                value={pdfHeader.headerHeight ?? 35}
                                                min={20}
                                                max={80}
                                                onChange={(value) => updatePdfHeader({ headerHeight: Number(value) })}
                                                style={{ width: 80 }}
                                            />
                                            <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                Total header area height
                                            </span>
                                        </SettingRow>
                                    </div>

                                    {/* Appearance Subsection */}
                                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--sys-color-divider-secondary)' }}>
                                        <div style={{ fontWeight: 500, fontSize: '12px', marginBottom: '8px', color: 'var(--sys-color-primary-main)' }}>
                                            Appearance
                                        </div>

                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Shape" tooltip="Logo shape: default (rectangle), circle (circular crop), or rounded (rounded corners)." />)}>
                                            <Select
                                                size="sm"
                                                value={logoConfig.shape || 'default'}
                                                onChange={(e) => updateLogo({ shape: e.target.value as any })}
                                                style={{ width: '100%' }}
                                            >
                                                <Option value="default">Default (rectangular)</Option>
                                                <Option value="rounded">Rounded corners</Option>
                                                <Option value="circle">Circle</Option>
                                            </Select>
                                        </SettingRow>

                                        {/* Border radius for rounded shape */}
                                        {logoConfig.shape === 'rounded' && (
                                            <SettingRow flow="wrap" label={(<TooltipLabel label="Corner Radius (mm)" tooltip="How rounded the corners should be. Higher values create more rounded corners." />)}>
                                                <NumericInput
                                                    size="sm"
                                                    value={logoConfig.borderRadius ?? 2}
                                                    min={1}
                                                    max={20}
                                                    onChange={(value) => updateLogo({ borderRadius: Number(value) })}
                                                    style={{ width: 80 }}
                                                />
                                            </SettingRow>
                                        )}

                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Background Color" tooltip="Background color behind the logo. Useful for logos with transparent backgrounds. Leave empty for transparent." />)}>
                                            <div className="color-input-row">
                                                <input
                                                    type="color"
                                                    className="color-picker"
                                                    value={logoConfig.backgroundColor || '#FFFFFF'}
                                                    onChange={(e) => updateLogo({ backgroundColor: e.target.value })}
                                                />
                                                <TextInput
                                                    size="sm"
                                                    value={logoConfig.backgroundColor || ''}
                                                    onChange={(e) => updateLogo({ backgroundColor: e.target.value })}
                                                    placeholder="Transparent"
                                                    style={{ width: 90 }}
                                                />
                                                {logoConfig.backgroundColor && (
                                                    <Button
                                                        size="sm"
                                                        type="tertiary"
                                                        onClick={() => updateLogo({ backgroundColor: undefined })}
                                                        style={{ padding: '0 8px' }}
                                                    >
                                                        Clear
                                                    </Button>
                                                )}
                                            </div>
                                        </SettingRow>

                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Alt Text (Accessibility)" tooltip="WCAG 1.1.1: Descriptive text for screen readers. Describe the logo content, e.g., 'City of Grand Junction logo'." />)}>
                                            <TextInput
                                                size="sm"
                                                value={logoConfig.altText || ''}
                                                onChange={(e) => updateLogo({ altText: e.target.value })}
                                                placeholder="e.g., City of Grand Junction logo"
                                            />
                                        </SettingRow>
                                        <p className="hint-text" style={{ marginTop: '2px' }}>
                                            WCAG 1.1.1: Describes the logo for screen readers
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="logo-upload-area" onClick={() => logoInputRef.current?.click()}>
                                    <UploadIcon />
                                    <div style={{ marginTop: '8px', fontSize: '12px' }}>Click to upload logo</div>
                                    <div style={{ fontSize: '10px', color: 'var(--sys-color-text-light)', marginTop: '4px' }}>
                                        PNG, JPG, GIF, SVG (max 1MB)
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Header Content Section */}
                        <div className="pdf-section-card">
                            <div className="pdf-section-title">
                                <PdfIcon />
                                Header Content
                            </div>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Title Mode" tooltip="'Default' uses the searched address as title. 'Custom' lets you specify a fixed report title." />)}>
                                <Select
                                    size="sm"
                                    value={pdfHeader.titleMode || 'default'}
                                    onChange={(e) => updatePdfHeader({ titleMode: e.target.value as 'default' | 'custom' })}
                                    style={{ width: '100%' }}
                                >
                                    <Option value="default">Default (Address/Parcel)</Option>
                                    <Option value="custom">Custom Title</Option>
                                </Select>
                            </SettingRow>

                            {pdfHeader.titleMode === 'custom' && (
                                <SettingRow flow="wrap" label={(<TooltipLabel label="Report Title" tooltip="Custom title text to display at the top of each PDF report instead of the searched address." />)}>
                                    <TextInput
                                        size="sm"
                                        value={pdfHeader.reportTitle || ''}
                                        onChange={(e) => updatePdfHeader({ reportTitle: e.target.value })}
                                        placeholder="Property Report"
                                    />
                                </SettingRow>
                            )}

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Title Position" tooltip="Horizontal alignment of the report title in the PDF header." />)}>
                                <div className="position-buttons">
                                    <button
                                        className={`position-btn ${(pdfHeader.titlePosition || 'center') === 'left' ? 'active' : ''}`}
                                        onClick={() => updatePdfHeader({ titlePosition: 'left' })}
                                    >Left</button>
                                    <button
                                        className={`position-btn ${(pdfHeader.titlePosition || 'center') === 'center' ? 'active' : ''}`}
                                        onClick={() => updatePdfHeader({ titlePosition: 'center' })}
                                    >Center</button>
                                    <button
                                        className={`position-btn ${(pdfHeader.titlePosition || 'center') === 'right' ? 'active' : ''}`}
                                        onClick={() => updatePdfHeader({ titlePosition: 'right' })}
                                    >Right</button>
                                </div>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Show Date" tooltip="Display the report generation date in the PDF header." />)}>
                                <Switch
                                    checked={pdfHeader.showGeneratedDate !== false}
                                    onChange={(e) => updatePdfHeader({ showGeneratedDate: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Header Background" tooltip="Background color for the PDF header area. Use white for a clean look or match your organization's branding." />)}>
                                <div className="color-input-row">
                                    <input
                                        type="color"
                                        className="color-picker"
                                        value={pdfHeader.headerColor || '#FFFFFF'}
                                        onChange={(e) => updatePdfHeader({ headerColor: e.target.value })}
                                    />
                                    <TextInput
                                        size="sm"
                                        value={pdfHeader.headerColor || '#FFFFFF'}
                                        onChange={(e) => updatePdfHeader({ headerColor: e.target.value })}
                                        style={{ width: 90 }}
                                    />
                                </div>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Header Text Color" tooltip="Text color for title and date in the PDF header. Ensure good contrast with the background color." />)}>
                                <div className="color-input-row">
                                    <input
                                        type="color"
                                        className="color-picker"
                                        value={pdfHeader.headerTextColor || '#333333'}
                                        onChange={(e) => updatePdfHeader({ headerTextColor: e.target.value })}
                                    />
                                    <TextInput
                                        size="sm"
                                        value={pdfHeader.headerTextColor || '#333333'}
                                        onChange={(e) => updatePdfHeader({ headerTextColor: e.target.value })}
                                        style={{ width: 90 }}
                                    />
                                </div>
                            </SettingRow>
                        </div>

                        {/* Footer Section */}
                        <div className="pdf-section-card">
                            <div className="pdf-section-title">
                                <FooterIcon />
                                Footer
                            </div>

                            <SettingRow flow="wrap" label={(
                                <TooltipLabel
                                    label="Show Footer"
                                    tooltip="Include a footer on each PDF page. Contains page numbers, contact info, and disclaimer text."
                                />
                            )}>

                                <Switch
                                    checked={pdfFooter.enabled !== false}
                                    onChange={(e) => updatePdfFooter({ enabled: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            {pdfFooter.enabled !== false && (
                                <>
                                    <SettingRow flow="wrap" label={(
                                        <TooltipLabel
                                            label="Show Page Numbers"
                                            tooltip="Display page numbers in the footer (e.g., 'Page 1 of 5'). Helps readers navigate multi-page reports."
                                        />
                                    )}>

                                        <Switch
                                            checked={pdfFooter.showPageNumbers !== false}
                                            onChange={(e) => updatePdfFooter({ showPageNumbers: (e.target as HTMLInputElement).checked })}
                                        />
                                    </SettingRow>

                                    <SettingRow flow="wrap" label={(
                                        <TooltipLabel
                                            label="Page Number Position"
                                            tooltip="Where to place page numbers in the footer. Right is most common for formal documents."
                                        />
                                    )}>

                                        <div className="position-buttons">
                                            <button
                                                className={`position-btn ${(pdfFooter.pageNumberPosition || 'right') === 'left' ? 'active' : ''}`}
                                                onClick={() => updatePdfFooter({ pageNumberPosition: 'left' })}
                                            >Left</button>
                                            <button
                                                className={`position-btn ${(pdfFooter.pageNumberPosition || 'right') === 'center' ? 'active' : ''}`}
                                                onClick={() => updatePdfFooter({ pageNumberPosition: 'center' })}
                                            >Center</button>
                                            <button
                                                className={`position-btn ${(pdfFooter.pageNumberPosition || 'right') === 'right' ? 'active' : ''}`}
                                                onClick={() => updatePdfFooter({ pageNumberPosition: 'right' })}
                                            >Right</button>
                                        </div>
                                    </SettingRow>

                                    <SettingRow flow="wrap" label={(
                                        <TooltipLabel
                                            label="Contact Info"
                                            tooltip="Department name, phone number, or other contact information for questions about the report."
                                        />
                                    )}>

                                        <TextInput
                                            size="sm"
                                            value={pdfFooter.contactText || ''}
                                            onChange={(e) => updatePdfFooter({ contactText: e.target.value })}
                                            placeholder="e.g., Planning Department | 970-555-1234"
                                        />
                                    </SettingRow>

                                    {pdfFooter.contactText && (
                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Contact Position" tooltip="Horizontal position of the contact information in the PDF footer." />)}>
                                            <div className="position-buttons">
                                                <button
                                                    className={`position-btn ${(pdfFooter.contactPosition || 'left') === 'left' ? 'active' : ''}`}
                                                    onClick={() => updatePdfFooter({ contactPosition: 'left' })}
                                                >Left</button>
                                                <button
                                                    className={`position-btn ${pdfFooter.contactPosition === 'center' ? 'active' : ''}`}
                                                    onClick={() => updatePdfFooter({ contactPosition: 'center' })}
                                                >Center</button>
                                                <button
                                                    className={`position-btn ${pdfFooter.contactPosition === 'right' ? 'active' : ''}`}
                                                    onClick={() => updatePdfFooter({ contactPosition: 'right' })}
                                                >Right</button>
                                            </div>
                                        </SettingRow>
                                    )}

                                    <SettingRow flow="wrap" label={(
                                        <TooltipLabel
                                            label="Disclaimer Text"
                                            tooltip="Legal disclaimer text shown in small print at the bottom of each page. Common for government reports to note data accuracy limitations."
                                        />
                                    )}>

                                        <textarea
                                            className="textarea-input"
                                            value={pdfFooter.disclaimerText || ''}
                                            onChange={(e) => updatePdfFooter({ disclaimerText: e.target.value })}
                                            placeholder="DISCLAIMER: This product is for informational purposes..."
                                        />
                                    </SettingRow>

                                    <SettingRow flow="wrap" label={(<TooltipLabel label="Footer Height (mm)" tooltip="Height of the footer area in millimeters. Increase if disclaimer text is getting cut off." />)}>
                                        <NumericInput
                                            size="sm"
                                            value={pdfFooter.footerHeight || 18}
                                            min={10}
                                            max={40}
                                            onChange={(value) => updatePdfFooter({ footerHeight: value })}
                                            style={{ width: 80 }}
                                        />
                                    </SettingRow>
                                </>
                            )}
                        </div>

                        {/* Map Screenshot Section */}
                        <div className="pdf-section-card">
                            <div className="pdf-section-title">
                                <MapIcon />
                                Map Screenshot
                            </div>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Include Map" tooltip="Include a screenshot of the map showing the selected location in the PDF header." />)}>
                                <Switch
                                    checked={pdfHeader.includeMap !== false}
                                    onChange={(e) => updatePdfHeader({ includeMap: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            {pdfHeader.includeMap !== false && (
                                <SettingRow flow="wrap" label={(<TooltipLabel label="Map Height (mm)" tooltip="Height of the map image in millimeters. Larger maps show more context but use more page space." />)}>
                                    <NumericInput
                                        size="sm"
                                        value={pdfHeader.mapHeight || 75}
                                        min={30}
                                        max={150}
                                        onChange={(value) => updatePdfHeader({ mapHeight: value })}
                                        style={{ width: 80 }}
                                    />
                                </SettingRow>
                            )}

                            {pdfHeader.includeMap !== false && (
                                <SettingRow flow="wrap" label={(<TooltipLabel label="Map Scale Mode" tooltip="How to determine the map zoom level. 'Fixed Scale' uses a specific scale value you define. 'Fit to Geometry' automatically zooms to show the entire highlighted geometry (e.g., parcel boundary) from the Highlight Layer, useful when features vary in size." />)}>
                                    <Select
                                        size="sm"
                                        value={pdfHeader.mapScaleMode || 'fixed'}
                                        onChange={(e) => updatePdfHeader({ mapScaleMode: e.target.value as 'fixed' | 'fitGeometry' })}
                                    >
                                        <Option value="fixed">Fixed Scale</Option>
                                        <Option value="fitGeometry">Fit to Geometry</Option>
                                    </Select>
                                </SettingRow>
                            )}

                            {pdfHeader.includeMap !== false && (pdfHeader.mapScaleMode || 'fixed') === 'fixed' && (
                                <SettingRow flow="wrap" label={(<TooltipLabel label="Map Scale" tooltip="Map scale for the PDF screenshot. Smaller values = more zoomed in, larger values = more zoomed out. Note: Very small scales (under ~500) may result in blurry imagery if the basemap lacks high-resolution tiles. Examples: 564 = building detail, 1500 = parcel level, 2500 = default, 5000 = neighborhood, 10000 = district." />)}>
                                    <NumericInput
                                        size="sm"
                                        value={pdfHeader.mapScale || 2500}
                                        step={100}
                                        onChange={(value) => updatePdfHeader({ mapScale: value })}
                                        style={{ width: 100 }}
                                    />
                                </SettingRow>
                            )}

                            {pdfHeader.includeMap !== false && pdfHeader.mapScaleMode === 'fitGeometry' && (
                                <SettingRow flow="wrap" label={(<TooltipLabel label="Fit Padding" tooltip="Padding factor around the geometry when using Fit to Geometry mode. 1.0 = no padding (geometry fills entire map), 1.2 = 20% padding (default), 1.5 = 50% padding. Higher values show more context around the feature." />)}>
                                    <NumericInput
                                        size="sm"
                                        value={pdfHeader.mapFitPadding || 1.2}
                                        min={1.0}
                                        max={3.0}
                                        step={0.1}
                                        onChange={(value) => updatePdfHeader({ mapFitPadding: value })}
                                        style={{ width: 80 }}
                                    />
                                </SettingRow>
                            )}
                        </div>

                        {/* Data Layout Section */}
                        <div className="pdf-section-card">
                            <div className="pdf-section-title">
                                <LayoutIcon />
                                Data Layout
                            </div>

                            <SettingRow flow="wrap" label={(
                                <TooltipLabel
                                    label="Layout Style"
                                    tooltip="How single-record data is arranged: Two-Column (label: value pairs), Table (rows/columns), Cards (boxed groups), Auto (chooses based on record count)."
                                />
                            )}>

                                <Select
                                    size="sm"
                                    value={pdfStyle.dataLayout || 'two-column'}
                                    onChange={(e) => updatePdfStyle({ dataLayout: e.target.value as any })}
                                >
                                    <Option value="two-column">Two-Column</Option>
                                    <Option value="table">Table</Option>
                                    <Option value="cards">Cards</Option>
                                    <Option value="auto">Auto</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(
                                <TooltipLabel
                                    label="Section Headers"
                                    tooltip="Background color for section header bars in the PDF. Should contrast with white text for readability."
                                />
                            )}>

                                <div className="color-input-row">
                                    <input
                                        type="color"
                                        className="color-picker"
                                        value={pdfStyle.sectionHeaderColor || '#4A90A4'}
                                        onChange={(e) => updatePdfStyle({ sectionHeaderColor: e.target.value })}
                                    />
                                    <TextInput
                                        size="sm"
                                        value={pdfStyle.sectionHeaderColor || '#4A90A4'}
                                        onChange={(e) => updatePdfStyle({ sectionHeaderColor: e.target.value })}
                                        style={{ width: 90 }}
                                    />
                                </div>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(
                                <TooltipLabel
                                    label="Alternate Row"
                                    tooltip="Background color for alternate table rows (zebra striping). Use a subtle color like light gray for best results."
                                />
                            )}>

                                <div className="color-input-row">
                                    <input
                                        type="color"
                                        className="color-picker"
                                        value={pdfStyle.alternateRowColor || '#F8F8F8'}
                                        onChange={(e) => updatePdfStyle({ alternateRowColor: e.target.value })}
                                    />
                                    <TextInput
                                        size="sm"
                                        value={pdfStyle.alternateRowColor || '#F8F8F8'}
                                        onChange={(e) => updatePdfStyle({ alternateRowColor: e.target.value })}
                                        style={{ width: 90 }}
                                    />
                                </div>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(
                                <TooltipLabel
                                    label="Link Color"
                                    tooltip="Color for hyperlinks in the PDF. Standard web blue (#0066CC) is recommended for familiarity."
                                />
                            )}>

                                <div className="color-input-row">
                                    <input
                                        type="color"
                                        className="color-picker"
                                        value={pdfStyle.linkColor || '#0066CC'}
                                        onChange={(e) => updatePdfStyle({ linkColor: e.target.value })}
                                    />
                                    <TextInput
                                        size="sm"
                                        value={pdfStyle.linkColor || '#0066CC'}
                                        onChange={(e) => updatePdfStyle({ linkColor: e.target.value })}
                                        style={{ width: 90 }}
                                    />
                                </div>
                            </SettingRow>
                        </div>

                        {/* Typography Section */}
                        <div className="pdf-section-card">
                            <div className="pdf-section-title">
                                <TextIcon />
                                Typography
                            </div>

                            <SettingRow flow="wrap" label={(
                                <TooltipLabel
                                    label="Font Family"
                                    tooltip="PDF font. Built-in fonts (Helvetica, Times, Courier) support ASCII only. For Polish/Unicode characters, use Noto Sans or other Google Fonts which are downloaded at PDF generation time."
                                />
                            )}>

                                <Select
                                    size="sm"
                                    value={pdfStyle.fontFamily || 'helvetica'}
                                    onChange={(e) => updatePdfStyle({ fontFamily: e.target.value as any })}
                                    style={{ width: '100%' }}
                                >
                                    <Option value="helvetica">Helvetica (Default)</Option>
                                    <Option value="times">Times New Roman</Option>
                                    <Option value="courier">Courier (Monospace)</Option>
                                    <Option disabled>── Google Fonts ──</Option>
                                    <Option value="Roboto">Roboto</Option>
                                    <Option value="Open Sans">Open Sans</Option>
                                    <Option value="Lato">Lato</Option>
                                    <Option value="Montserrat">Montserrat</Option>
                                    <Option value="Oswald">Oswald</Option>
                                    <Option value="Raleway">Raleway</Option>
                                    <Option value="Poppins">Poppins</Option>
                                    <Option value="Nunito">Nunito</Option>
                                    <Option value="Ubuntu">Ubuntu</Option>
                                    <Option value="Merriweather">Merriweather</Option>
                                    <Option value="PT Sans">PT Sans</Option>
                                    <Option value="Playfair Display">Playfair Display</Option>
                                    <Option value="Source Sans Pro">Source Sans Pro</Option>
                                    <Option value="Noto Sans">Noto Sans</Option>
                                    <Option disabled>── Custom ──</Option>
                                    <Option value="custom">Upload Custom Font (TTF)</Option>
                                </Select>
                            </SettingRow>

                            {!['helvetica', 'times', 'courier', 'custom'].includes(pdfStyle.fontFamily || 'helvetica') && (
                                <p className="hint-text" style={{ color: 'var(--sys-color-primary-main)' }}>
                                    Google Fonts are loaded automatically when generating PDF.
                                </p>
                            )}

                            {pdfStyle.fontFamily === 'custom' && (
                                <>
                                    <div className="font-upload-section">
                                        <input
                                            ref={fontRegularInputRef}
                                            type="file"
                                            accept=".ttf"
                                            onChange={(e) => handleFontUpload(e, 'regular')}
                                            style={{ display: 'none' }}
                                            aria-label="Upload regular font"
                                        />
                                        <input
                                            ref={fontBoldInputRef}
                                            type="file"
                                            accept=".ttf"
                                            onChange={(e) => handleFontUpload(e, 'bold')}
                                            style={{ display: 'none' }}
                                            aria-label="Upload bold font"
                                        />

                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Regular Font (Required)" tooltip="Upload a TrueType (.ttf) font file for regular text. This is required for custom fonts to work." />)}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                                                <Button
                                                    size="sm"
                                                    type="secondary"
                                                    onClick={() => fontRegularInputRef.current?.click()}
                                                >
                                                    <UploadIcon /> Upload TTF
                                                </Button>
                                                {pdfStyle.customFont?.regularBase64 && (
                                                    <span style={{ fontSize: '11px', color: 'var(--sys-color-success-main)' }}>
                                                        ✓ {pdfStyle.customFont.name || 'Font'} loaded
                                                    </span>
                                                )}
                                            </div>
                                        </SettingRow>

                                        <SettingRow flow="wrap" label={(<TooltipLabel label="Bold Font (Optional)" tooltip="Upload a bold variant of your font. If not provided, the regular font will be used for bold text." />)}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                                                <Button
                                                    size="sm"
                                                    type="secondary"
                                                    onClick={() => fontBoldInputRef.current?.click()}
                                                    disabled={!pdfStyle.customFont?.regularBase64}
                                                >
                                                    <UploadIcon /> Upload TTF
                                                </Button>
                                                {pdfStyle.customFont?.boldBase64 && (
                                                    <span style={{ fontSize: '11px', color: 'var(--sys-color-success-main)' }}>
                                                        ✓ Bold loaded
                                                    </span>
                                                )}
                                            </div>
                                        </SettingRow>

                                        {pdfStyle.customFont?.regularBase64 && (
                                            <SettingRow flow="wrap" label={(<TooltipLabel label="Font Name" tooltip="Display name for the font. Used in the PDF metadata and for reference." />)}>
                                                <TextInput
                                                    size="sm"
                                                    value={pdfStyle.customFont?.name || ''}
                                                    onChange={(e) => updatePdfStyle({
                                                        customFont: {
                                                            ...pdfStyle.customFont,
                                                            name: e.target.value
                                                        }
                                                    })}
                                                    placeholder="Custom Font Name"
                                                />
                                            </SettingRow>
                                        )}

                                        {pdfStyle.customFont?.regularBase64 && (
                                            <Button
                                                size="sm"
                                                type="tertiary"
                                                onClick={removeCustomFont}
                                                style={{ marginTop: '8px' }}
                                            >
                                                <TrashIcon /> Remove Custom Font
                                            </Button>
                                        )}
                                    </div>

                                    <p className="hint-text">
                                        Upload TTF font files. Regular weight is required; bold is optional (will use regular if not provided).
                                    </p>
                                </>
                            )}
                        </div>

                        {/* PDF Table Settings Section */}
                        <div className="pdf-section-card">
                            <div className="pdf-section-title">
                                <TableIcon />
                                PDF Table Settings
                            </div>
                            <p className="hint-text" style={{ marginTop: 0, marginBottom: '12px' }}>
                                These settings control table appearance in the PDF export, not the on-screen widget display.
                            </p>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Table Header Background" tooltip="Background color for table column headers. Use your organization's brand color or a dark color for good contrast with white text." />)}>
                                <div className="color-input-row">
                                    <input
                                        type="color"
                                        className="color-picker"
                                        value={pdfStyle.tableHeaderBgColor || '#1A6B7C'}
                                        onChange={(e) => updatePdfStyle({ tableHeaderBgColor: e.target.value })}
                                    />
                                    <TextInput
                                        size="sm"
                                        value={pdfStyle.tableHeaderBgColor || '#1A6B7C'}
                                        onChange={(e) => updatePdfStyle({ tableHeaderBgColor: e.target.value })}
                                        style={{ width: 90 }}
                                    />
                                </div>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Table Header Text" tooltip="Text color for column header labels. Use white or a light color when using a dark header background." />)}>
                                <div className="color-input-row">
                                    <input
                                        type="color"
                                        className="color-picker"
                                        value={pdfStyle.tableHeaderTextColor || '#FFFFFF'}
                                        onChange={(e) => updatePdfStyle({ tableHeaderTextColor: e.target.value })}
                                    />
                                    <TextInput
                                        size="sm"
                                        value={pdfStyle.tableHeaderTextColor || '#FFFFFF'}
                                        onChange={(e) => updatePdfStyle({ tableHeaderTextColor: e.target.value })}
                                        style={{ width: 90 }}
                                    />
                                </div>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(
                                <TooltipLabel
                                    label="Layer Title Background"
                                    tooltip="Background color for layer title headers that appear when a section contains multiple data layers. Use a different color from Table Header to distinguish between layer titles and column headers."
                                />
                            )}>
                                <div className="color-input-row">
                                    <input
                                        type="color"
                                        className="color-picker"
                                        value={pdfStyle.layerTitleBgColor || '#69812D'}
                                        onChange={(e) => updatePdfStyle({ layerTitleBgColor: e.target.value })}
                                    />
                                    <TextInput
                                        size="sm"
                                        value={pdfStyle.layerTitleBgColor || '#69812D'}
                                        onChange={(e) => updatePdfStyle({ layerTitleBgColor: e.target.value })}
                                        style={{ width: 90 }}
                                    />
                                </div>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(
                                <TooltipLabel
                                    label="Layer Title Text"
                                    tooltip="Text color for layer title headers. Should contrast well with the Layer Title Background color for readability."
                                />
                            )}>
                                <div className="color-input-row">
                                    <input
                                        type="color"
                                        className="color-picker"
                                        value={pdfStyle.layerTitleTextColor || '#FFFFFF'}
                                        onChange={(e) => updatePdfStyle({ layerTitleTextColor: e.target.value })}
                                    />
                                    <TextInput
                                        size="sm"
                                        value={pdfStyle.layerTitleTextColor || '#FFFFFF'}
                                        onChange={(e) => updatePdfStyle({ layerTitleTextColor: e.target.value })}
                                        style={{ width: 90 }}
                                    />
                                </div>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Header Font Size" tooltip="Font size for table column headers in the PDF. Smaller sizes fit more columns but may be harder to read." />)}>
                                <Select
                                    size="sm"
                                    value={String(pdfStyle.tableHeaderFontSize || 8)}
                                    onChange={(e) => updatePdfStyle({ tableHeaderFontSize: Number(e.target.value) })}
                                >
                                    <Option value="6">6pt (Small)</Option>
                                    <Option value="7">7pt</Option>
                                    <Option value="8">8pt (Default)</Option>
                                    <Option value="9">9pt</Option>
                                    <Option value="10">10pt (Large)</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Data Font Size" tooltip="Font size for table data cells in the PDF. Smaller sizes fit more content but may affect readability." />)}>
                                <Select
                                    size="sm"
                                    value={String(pdfStyle.tableDataFontSize || 8)}
                                    onChange={(e) => updatePdfStyle({ tableDataFontSize: Number(e.target.value) })}
                                >
                                    <Option value="6">6pt (Small)</Option>
                                    <Option value="7">7pt</Option>
                                    <Option value="8">8pt (Default)</Option>
                                    <Option value="9">9pt</Option>
                                    <Option value="10">10pt (Large)</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Data Text Color" tooltip="Text color for table data cells. Use dark colors for good contrast with light backgrounds." />)}>
                                <div className="color-input-row">
                                    <input
                                        type="color"
                                        className="color-picker"
                                        value={pdfStyle.tableDataTextColor || '#333333'}
                                        onChange={(e) => updatePdfStyle({ tableDataTextColor: e.target.value })}
                                    />
                                    <TextInput
                                        size="sm"
                                        value={pdfStyle.tableDataTextColor || '#333333'}
                                        onChange={(e) => updatePdfStyle({ tableDataTextColor: e.target.value })}
                                        style={{ width: 90 }}
                                    />
                                </div>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Show Table Borders" tooltip="Display grid lines and borders around table cells. Helps visually separate data but uses more ink when printing." />)}>
                                <Switch
                                    checked={pdfStyle.tableShowBorders !== false}
                                    onChange={(e) => updatePdfStyle({ tableShowBorders: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            {pdfStyle.tableShowBorders !== false && (
                                <SettingRow flow="wrap" label={(<TooltipLabel label="Border Color" tooltip="Color for table grid lines and borders. Light gray provides subtle separation without overwhelming the data." />)}>
                                    <div className="color-input-row">
                                        <input
                                            type="color"
                                            className="color-picker"
                                            value={pdfStyle.tableBorderColor || '#CCCCCC'}
                                            onChange={(e) => updatePdfStyle({ tableBorderColor: e.target.value })}
                                        />
                                        <TextInput
                                            size="sm"
                                            value={pdfStyle.tableBorderColor || '#CCCCCC'}
                                            onChange={(e) => updatePdfStyle({ tableBorderColor: e.target.value })}
                                            style={{ width: 90 }}
                                        />
                                    </div>
                                </SettingRow>
                            )}

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Striped Rows" tooltip="Alternate row background colors for easier reading. Recommended for tables with many rows." />)}>
                                <Switch
                                    checked={pdfStyle.tableStripedRows !== false}
                                    onChange={(e) => updatePdfStyle({ tableStripedRows: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Row Height" tooltip="Height of each data row in millimeters. Larger values improve readability but fit fewer rows per page." />)}>
                                <Select
                                    size="sm"
                                    value={String(pdfStyle.tableRowHeight || 7)}
                                    onChange={(e) => updatePdfStyle({ tableRowHeight: Number(e.target.value) })}
                                >
                                    <Option value="5">5mm (Compact)</Option>
                                    <Option value="6">6mm</Option>
                                    <Option value="7">7mm (Default)</Option>
                                    <Option value="8">8mm</Option>
                                    <Option value="9">9mm (Spacious)</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Max Columns" tooltip="Maximum number of columns to display in PDF tables. Additional columns will be truncated. Consider page width when setting this value." />)}>
                                <Select
                                    size="sm"
                                    value={String(pdfStyle.tableMaxColumns || 6)}
                                    onChange={(e) => updatePdfStyle({ tableMaxColumns: Number(e.target.value) })}
                                >
                                    <Option value="1">1 column</Option>
                                    <Option value="2">2 columns</Option>
                                    <Option value="3">3 columns</Option>
                                    <Option value="4">4 columns</Option>
                                    <Option value="5">5 columns</Option>
                                    <Option value="6">6 columns (Default)</Option>
                                    <Option value="8">8 columns</Option>
                                    <Option value="10">10 columns</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Max Rows" tooltip="Maximum number of data rows per table in the PDF. Additional rows will be truncated. Use higher values for comprehensive reports." />)}>
                                <Select
                                    size="sm"
                                    value={String(pdfStyle.tableMaxRows || 15)}
                                    onChange={(e) => updatePdfStyle({ tableMaxRows: Number(e.target.value) })}
                                >
                                    <Option value="5">5 rows</Option>
                                    <Option value="10">10 rows</Option>
                                    <Option value="15">15 rows (Default)</Option>
                                    <Option value="20">20 rows</Option>
                                    <Option value="25">25 rows</Option>
                                    <Option value="50">50 rows</Option>
                                    <Option value="100">100 rows (All)</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Header Row Height" tooltip="Height of the table header row in millimeters. May need to be larger if column names are long." />)}>
                                <Select
                                    size="sm"
                                    value={String(pdfStyle.tableHeaderHeight || 8)}
                                    onChange={(e) => updatePdfStyle({ tableHeaderHeight: Number(e.target.value) })}
                                >
                                    <Option value="6">6mm (Compact)</Option>
                                    <Option value="7">7mm</Option>
                                    <Option value="8">8mm (Default)</Option>
                                    <Option value="9">9mm</Option>
                                    <Option value="10">10mm (Spacious)</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Cell Padding" tooltip="Space between cell content and cell borders in millimeters. More padding improves readability but uses more space." />)}>
                                <Select
                                    size="sm"
                                    value={String(pdfStyle.tableCellPadding || 2)}
                                    onChange={(e) => updatePdfStyle({ tableCellPadding: Number(e.target.value) })}
                                >
                                    <Option value="1">1mm (Tight)</Option>
                                    <Option value="2">2mm (Default)</Option>
                                    <Option value="3">3mm</Option>
                                    <Option value="4">4mm (Spacious)</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Include Related Tables" tooltip="Include related table data (child records, linked tables) in the PDF export. Disable if PDFs are too long." />)}>
                                <Switch
                                    checked={config.pdfIncludeRelatedTables || false}
                                    onChange={(e) => updateConfig('pdfIncludeRelatedTables', (e.target as HTMLInputElement).checked)}
                                />
                            </SettingRow>
                            <p className="hint-text" style={{ marginTop: '4px', marginBottom: '8px' }}>
                                When enabled, related table data configured on layers will be included in PDF export
                            </p>
                        </div>

                        {/* WCAG Accessibility Settings Section */}
                        <div className="pdf-section-card">
                            <div className="pdf-section-title">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
                                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 12.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zM8 4a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 8 4zm0 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                                </svg>
                                Accessibility (WCAG 2.1)
                            </div>
                            <p className="hint-text" style={{ marginBottom: '12px' }}>
                                These options enhance PDF accessibility for users with disabilities. Enabling all options ensures WCAG 2.1 AA compliance.
                            </p>

                            {/* Document Metadata */}
                            <div style={{ marginBottom: '8px', fontWeight: 500, fontSize: '12px', color: 'var(--sys-color-primary-main)' }}>
                                Document Metadata (WCAG 2.4.2)
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="Document Language">
                                    <Select
                                        size="sm"
                                        value={pdfAccessibility.documentLanguage || 'en-US'}
                                        onChange={(e) => updatePdfAccessibility({ documentLanguage: e.target.value })}
                                    >
                                        <Option value="af">Afrikaans</Option>
                                        <Option value="sq">Albanian (Shqip)</Option>
                                        <Option value="am">Amharic (አማርኛ)</Option>
                                        <Option value="ar">Arabic (العربية)</Option>
                                        <Option value="ar-EG">Arabic (Egypt)</Option>
                                        <Option value="ar-SA">Arabic (Saudi Arabia)</Option>
                                        <Option value="hy">Armenian (Hayeren)</Option>
                                        <Option value="ast">Asturian (Asturianu)</Option>
                                        <Option value="az">Azerbaijani (Azərbaycan)</Option>
                                        <Option value="eu">Basque (Euskara)</Option>
                                        <Option value="be">Belarusian (Беларуская)</Option>
                                        <Option value="bn">Bengali (বাংলা)</Option>
                                        <Option value="bs">Bosnian (Bosanski)</Option>
                                        <Option value="br">Breton (Brezhoneg)</Option>
                                        <Option value="bg">Bulgarian (Български)</Option>
                                        <Option value="my">Burmese (မြန်မာ)</Option>
                                        <Option value="ca">Catalan (Català)</Option>
                                        <Option value="zh">Chinese (中文)</Option>
                                        <Option value="zh-HK">Chinese (Hong Kong)</Option>
                                        <Option value="zh-CN">Chinese (Simplified)</Option>
                                        <Option value="zh-TW">Chinese (Traditional)</Option>
                                        <Option value="co">Corsican (Corsu)</Option>
                                        <Option value="hr">Croatian (Hrvatski)</Option>
                                        <Option value="cs">Czech (Čeština)</Option>
                                        <Option value="da">Danish (Dansk)</Option>
                                        <Option value="nl">Dutch (Nederlands)</Option>
                                        <Option value="nl-BE">Dutch (Belgium/Flemish)</Option>
                                        <Option value="en-AU">English (Australia)</Option>
                                        <Option value="en-CA">English (Canada)</Option>
                                        <Option value="en-IE">English (Ireland)</Option>
                                        <Option value="en-NZ">English (New Zealand)</Option>
                                        <Option value="en-ZA">English (South Africa)</Option>
                                        <Option value="en-GB">English (UK)</Option>
                                        <Option value="en-US">English (US)</Option>
                                        <Option value="eo">Esperanto</Option>
                                        <Option value="et">Estonian (Eesti)</Option>
                                        <Option value="fo">Faroese (Føroyskt)</Option>
                                        <Option value="tl">Filipino/Tagalog</Option>
                                        <Option value="fi">Finnish (Suomi)</Option>
                                        <Option value="fr">French (Français)</Option>
                                        <Option value="fr-BE">French (Belgium)</Option>
                                        <Option value="fr-CA">French (Canada)</Option>
                                        <Option value="fr-CH">French (Switzerland)</Option>
                                        <Option value="fy">Frisian (Frysk)</Option>
                                        <Option value="gl">Galician (Galego)</Option>
                                        <Option value="ka">Georgian (ქართული)</Option>
                                        <Option value="de">German (Deutsch)</Option>
                                        <Option value="de-AT">German (Austria)</Option>
                                        <Option value="de-CH">German (Switzerland)</Option>
                                        <Option value="el">Greek (Ελληνικά)</Option>
                                        <Option value="gu">Gujarati (ગુજરાતી)</Option>
                                        <Option value="ha">Hausa</Option>
                                        <Option value="haw">Hawaiian (ʻŌlelo Hawaiʻi)</Option>
                                        <Option value="he">Hebrew (עברית)</Option>
                                        <Option value="hi">Hindi (हिन्दी)</Option>
                                        <Option value="hu">Hungarian (Magyar)</Option>
                                        <Option value="is">Icelandic (Íslenska)</Option>
                                        <Option value="ig">Igbo</Option>
                                        <Option value="id">Indonesian (Bahasa Indonesia)</Option>
                                        <Option value="ga">Irish (Gaeilge)</Option>
                                        <Option value="it">Italian (Italiano)</Option>
                                        <Option value="it-CH">Italian (Switzerland)</Option>
                                        <Option value="ja">Japanese (日本語)</Option>
                                        <Option value="jv">Javanese (Basa Jawa)</Option>
                                        <Option value="kn">Kannada (ಕನ್ನಡ)</Option>
                                        <Option value="kk">Kazakh (Қазақ)</Option>
                                        <Option value="km">Khmer (ខ្មែរ)</Option>
                                        <Option value="rw">Kinyarwanda</Option>
                                        <Option value="ko">Korean (한국어)</Option>
                                        <Option value="ku">Kurdish (Kurdî)</Option>
                                        <Option value="ckb">Kurdish (Sorani)</Option>
                                        <Option value="ky">Kyrgyz (Кыргызча)</Option>
                                        <Option value="lo">Lao (ລາວ)</Option>
                                        <Option value="la">Latin (Latina)</Option>
                                        <Option value="lv">Latvian (Latviešu)</Option>
                                        <Option value="lt">Lithuanian (Lietuvių)</Option>
                                        <Option value="lb">Luxembourgish (Lëtzebuergesch)</Option>
                                        <Option value="mk">Macedonian (Македонски)</Option>
                                        <Option value="mg">Malagasy</Option>
                                        <Option value="ms">Malay (Bahasa Melayu)</Option>
                                        <Option value="ml">Malayalam (മലയാളം)</Option>
                                        <Option value="mt">Maltese (Malti)</Option>
                                        <Option value="mi">Māori (Te Reo Māori)</Option>
                                        <Option value="mr">Marathi (मराठी)</Option>
                                        <Option value="mn">Mongolian (Монгол)</Option>
                                        <Option value="ne">Nepali (नेपाली)</Option>
                                        <Option value="no">Norwegian (Norsk)</Option>
                                        <Option value="nb">Norwegian Bokmål</Option>
                                        <Option value="nn">Norwegian Nynorsk</Option>
                                        <Option value="sme">Northern Sami</Option>
                                        <Option value="oc">Occitan</Option>
                                        <Option value="or">Odia (ଓଡ଼ିଆ)</Option>
                                        <Option value="ps">Pashto (پښتو)</Option>
                                        <Option value="fa">Persian/Farsi (فارسی)</Option>
                                        <Option value="pl">Polish (Polski)</Option>
                                        <Option value="pt">Portuguese (Português)</Option>
                                        <Option value="pt-BR">Portuguese (Brazil)</Option>
                                        <Option value="pa">Punjabi (ਪੰਜਾਬੀ)</Option>
                                        <Option value="ro">Romanian (Română)</Option>
                                        <Option value="rm">Romansh (Rumantsch)</Option>
                                        <Option value="ru">Russian (Русский)</Option>
                                        <Option value="sm">Samoan (Gagana Samoa)</Option>
                                        <Option value="gd">Scottish Gaelic (Gàidhlig)</Option>
                                        <Option value="sr">Serbian (Српски)</Option>
                                        <Option value="sr-Latn">Serbian (Latin)</Option>
                                        <Option value="si">Sinhala (සිංහල)</Option>
                                        <Option value="sk">Slovak (Slovenčina)</Option>
                                        <Option value="sl">Slovenian (Slovenščina)</Option>
                                        <Option value="so">Somali (Soomaali)</Option>
                                        <Option value="es">Spanish (Español)</Option>
                                        <Option value="es-AR">Spanish (Argentina)</Option>
                                        <Option value="es-MX">Spanish (Mexico)</Option>
                                        <Option value="sw">Swahili (Kiswahili)</Option>
                                        <Option value="sv">Swedish (Svenska)</Option>
                                        <Option value="ta">Tamil (தமிழ்)</Option>
                                        <Option value="tt">Tatar (Татар)</Option>
                                        <Option value="te">Telugu (తెలుగు)</Option>
                                        <Option value="th">Thai (ไทย)</Option>
                                        <Option value="to">Tongan (Lea Faka-Tonga)</Option>
                                        <Option value="tr">Turkish (Türkçe)</Option>
                                        <Option value="tk">Turkmen (Türkmen)</Option>
                                        <Option value="uk">Ukrainian (Українська)</Option>
                                        <Option value="ur">Urdu (اردو)</Option>
                                        <Option value="uz">Uzbek (Oʻzbekcha)</Option>
                                        <Option value="vi">Vietnamese (Tiếng Việt)</Option>
                                        <Option value="cy">Welsh (Cymraeg)</Option>
                                        <Option value="xh">Xhosa (isiXhosa)</Option>
                                        <Option value="yi">Yiddish (ייִדיש)</Option>
                                        <Option value="yo">Yoruba (Yorùbá)</Option>
                                        <Option value="zu">Zulu (isiZulu)</Option>
                                    </Select>
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    Language code embedded in PDF for screen readers. Polish and other Latin-extended languages require Unicode fonts (Noto Sans).
                                </p>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="Document Author">
                                    <TextInput
                                        size="sm"
                                        value={pdfAccessibility.documentAuthor || ''}
                                        onChange={(e) => updatePdfAccessibility({ documentAuthor: e.target.value })}
                                        placeholder="e.g., GIS Division"
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    Author name in PDF metadata
                                </p>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="Document Creator">
                                    <TextInput
                                        size="sm"
                                        value={pdfAccessibility.documentCreator || ''}
                                        onChange={(e) => updatePdfAccessibility({ documentCreator: e.target.value })}
                                        placeholder="e.g., Property Report Widget"
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    Application/creator name in PDF metadata
                                </p>
                            </div>

                            {/* Alt Text Templates */}
                            <div style={{ marginBottom: '8px', marginTop: '16px', fontWeight: 500, fontSize: '12px', color: 'var(--sys-color-primary-main)' }}>
                                Alt Text Templates (WCAG 1.1.1)
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="Include Map Alt Text">
                                    <Switch
                                        checked={pdfAccessibility.includeMapAltText !== false}
                                        onChange={(e) => updatePdfAccessibility({ includeMapAltText: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                            </div>

                            {pdfAccessibility.includeMapAltText !== false && (
                                <div style={{ marginBottom: '12px', marginLeft: '16px' }}>
                                    <SettingRow flow="wrap" label="Map Alt Text Template">
                                        <TextInput
                                            size="sm"
                                            value={pdfAccessibility.mapAltTextTemplate || 'Map showing the location of {address}'}
                                            onChange={(e) => updatePdfAccessibility({ mapAltTextTemplate: e.target.value })}
                                            placeholder="Map showing the location of {address}"
                                        />
                                    </SettingRow>
                                    <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                        Use {'{address}'} as placeholder for the searched address
                                    </p>
                                </div>
                            )}

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="Include Logo Alt Text">
                                    <Switch
                                        checked={pdfAccessibility.includeLogoAltText !== false}
                                        onChange={(e) => updatePdfAccessibility({ includeLogoAltText: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                            </div>

                            {pdfAccessibility.includeLogoAltText !== false && (
                                <div style={{ marginBottom: '12px', marginLeft: '16px' }}>
                                    <SettingRow flow="wrap" label="Logo Alt Text Template">
                                        <TextInput
                                            size="sm"
                                            value={pdfAccessibility.logoAltTextTemplate || 'Organization logo'}
                                            onChange={(e) => updatePdfAccessibility({ logoAltTextTemplate: e.target.value })}
                                            placeholder="Organization logo"
                                        />
                                    </SettingRow>
                                </div>
                            )}

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="Chart Alt Text Template">
                                    <TextInput
                                        size="sm"
                                        value={pdfAccessibility.chartAltTextTemplate || 'Chart showing {chartType} visualization of {dataDescription}'}
                                        onChange={(e) => updatePdfAccessibility({ chartAltTextTemplate: e.target.value })}
                                        placeholder="Chart showing {chartType} visualization of {dataDescription}"
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    Use {'{chartType}'} and {'{dataDescription}'} as placeholders
                                </p>
                            </div>

                            {/* Table Summary Templates */}
                            <div style={{ marginBottom: '8px', marginTop: '16px', fontWeight: 500, fontSize: '12px', color: 'var(--sys-color-primary-main)' }}>
                                Table Summary Templates (WCAG 1.3.1)
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="Include Table Summaries">
                                    <Switch
                                        checked={pdfAccessibility.includeTableSummaries !== false}
                                        onChange={(e) => updatePdfAccessibility({ includeTableSummaries: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                            </div>

                            {pdfAccessibility.includeTableSummaries !== false && (
                                <div style={{ marginBottom: '12px', marginLeft: '16px' }}>
                                    <SettingRow flow="wrap" label="Table Summary Template">
                                        <TextInput
                                            size="sm"
                                            value={pdfAccessibility.tableSummaryTemplate || 'Data table: {layerTitle} - {recordCount} records, {columnCount} columns'}
                                            onChange={(e) => updatePdfAccessibility({ tableSummaryTemplate: e.target.value })}
                                            placeholder="Data table: {layerTitle} - {recordCount} records, {columnCount} columns"
                                        />
                                    </SettingRow>
                                    <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                        Use {'{layerTitle}'}, {'{recordCount}'}, {'{columnCount}'} as placeholders
                                    </p>
                                </div>
                            )}

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="Include Related Table Summaries">
                                    <Switch
                                        checked={pdfAccessibility.includeRelatedTableSummaries !== false}
                                        onChange={(e) => updatePdfAccessibility({ includeRelatedTableSummaries: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                            </div>

                            {pdfAccessibility.includeRelatedTableSummaries !== false && (
                                <div style={{ marginBottom: '12px', marginLeft: '16px' }}>
                                    <SettingRow flow="wrap" label="Related Table Summary Template">
                                        <TextInput
                                            size="sm"
                                            value={pdfAccessibility.relatedTableSummaryTemplate || 'Related data: {tableName} - {recordCount} records, {columnCount} columns'}
                                            onChange={(e) => updatePdfAccessibility({ relatedTableSummaryTemplate: e.target.value })}
                                            placeholder="Related data: {tableName} - {recordCount} records, {columnCount} columns"
                                        />
                                    </SettingRow>
                                    <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                        Use {'{tableName}'}, {'{recordCount}'}, {'{columnCount}'} as placeholders
                                    </p>
                                </div>
                            )}

                            {/* Font & Reading Settings */}
                            <div style={{ marginBottom: '8px', marginTop: '16px', fontWeight: 500, fontSize: '12px', color: 'var(--sys-color-primary-main)' }}>
                                Font &amp; Reading Order
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="Minimum Font Size (pt)">
                                    <NumericInput
                                        size="sm"
                                        value={pdfAccessibility.minimumFontSize || 9}
                                        min={6}
                                        max={14}
                                        onChange={(value) => updatePdfAccessibility({ minimumFontSize: value })}
                                        style={{ width: 80 }}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    WCAG 1.4.4: Minimum font size for readability (recommended: 9pt)
                                </p>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="Reading Order Markers">
                                    <Switch
                                        checked={pdfAccessibility.includeReadingOrderMarkers !== false}
                                        onChange={(e) => updatePdfAccessibility({ includeReadingOrderMarkers: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    WCAG 1.3.2: Include markers to aid screen reader navigation order
                                </p>
                            </div>

                            {/* Visible Text Options */}
                            <div style={{ marginBottom: '8px', marginTop: '16px', fontWeight: 500, fontSize: '12px', color: 'var(--sys-color-primary-main)' }}>
                                Visible Accessibility Text
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="Show Map Alt Text">
                                    <Switch
                                        checked={pdfStyle.showAccessibilityText !== false}
                                        onChange={(e) => updatePdfStyle({ showAccessibilityText: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    WCAG 1.1.1: Shows "[Map Image: ...]" description above the map
                                </p>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="Show Table Summaries">
                                    <Switch
                                        checked={pdfStyle.showTableSummaries !== false}
                                        onChange={(e) => updatePdfStyle({ showTableSummaries: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    WCAG 1.3.1: Shows "Data table: [Name] - X records" before tables
                                </p>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="Show Related Table Summaries">
                                    <Switch
                                        checked={pdfStyle.showRelatedTableSummaries !== false}
                                        onChange={(e) => updatePdfStyle({ showRelatedTableSummaries: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    WCAG 1.3.1: Shows "Related data: [Name] - X records" before related tables
                                </p>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="Show Full URLs">
                                    <Switch
                                        checked={pdfStyle.showFullUrlsInPdf || false}
                                        onChange={(e) => updatePdfStyle({ showFullUrlsInPdf: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    WCAG 2.4.4: Shows full URL after link text for printed documents
                                </p>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="Show Section Numbers">
                                    <Switch
                                        checked={pdfStyle.showSectionNumbers || false}
                                        onChange={(e) => updatePdfStyle({ showSectionNumbers: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    WCAG 1.3.1: Numbers sections (e.g., "1. Zoning", "2. Permits")
                                </p>
                            </div>

                            {/* Navigation Options */}
                            <div style={{ marginBottom: '8px', marginTop: '16px', fontWeight: 500, fontSize: '12px', color: 'var(--sys-color-primary-main)' }}>
                                Navigation &amp; Structure
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="PDF Bookmarks">
                                    <Switch
                                        checked={pdfStyle.enablePdfBookmarks !== false}
                                        onChange={(e) => updatePdfStyle({ enablePdfBookmarks: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    WCAG 2.4.5: Adds clickable bookmarks in PDF viewer sidebar
                                </p>
                            </div>

                            {pdfStyle.enablePdfBookmarks !== false && (
                                <div style={{ marginBottom: '12px', marginLeft: '16px' }}>
                                    <SettingRow flow="wrap" label="Hierarchical Bookmarks">
                                        <Switch
                                            checked={pdfStyle.enableHierarchicalBookmarks !== false}
                                            onChange={(e) => updatePdfStyle({ enableHierarchicalBookmarks: (e.target as HTMLInputElement).checked })}
                                        />
                                    </SettingRow>
                                    <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                        Creates nested bookmarks: Section → Layer → Related Table
                                    </p>
                                </div>
                            )}

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="Table of Contents">
                                    <Switch
                                        checked={pdfStyle.enableTableOfContents || false}
                                        onChange={(e) => updatePdfStyle({ enableTableOfContents: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    WCAG 2.4.5: Adds a Table of Contents page after the header
                                </p>
                            </div>

                            {pdfStyle.enableTableOfContents && (
                                <>
                                    <div style={{ marginBottom: '12px', marginLeft: '16px' }}>
                                        <SettingRow flow="wrap" label="TOC Title">
                                            <TextInput
                                                size="sm"
                                                value={pdfStyle.tocTitle || 'Table of Contents'}
                                                onChange={(e) => updatePdfStyle({ tocTitle: e.target.value })}
                                                placeholder="Table of Contents"
                                            />
                                        </SettingRow>
                                    </div>
                                    <div style={{ marginBottom: '12px', marginLeft: '16px' }}>
                                        <SettingRow flow="wrap" label="Include Layers in TOC">
                                            <Switch
                                                checked={pdfStyle.tocIncludeLayers !== false}
                                                onChange={(e) => updatePdfStyle({ tocIncludeLayers: (e.target as HTMLInputElement).checked })}
                                            />
                                        </SettingRow>
                                    </div>
                                    <div style={{ marginBottom: '12px', marginLeft: '16px' }}>
                                        <SettingRow flow="wrap" label="Include Related Tables in TOC">
                                            <Switch
                                                checked={pdfStyle.tocIncludeRelatedTables || false}
                                                onChange={(e) => updatePdfStyle({ tocIncludeRelatedTables: (e.target as HTMLInputElement).checked })}
                                            />
                                        </SettingRow>
                                    </div>
                                    <div style={{ marginBottom: '12px', marginLeft: '16px' }}>
                                        <SettingRow flow="wrap" label="Page Break After TOC">
                                            <Switch
                                                checked={pdfStyle.tocPageBreakAfter !== false}
                                                onChange={(e) => updatePdfStyle({ tocPageBreakAfter: (e.target as HTMLInputElement).checked })}
                                            />
                                        </SettingRow>
                                    </div>
                                </>
                            )}

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="Full Timestamp">
                                    <Switch
                                        checked={pdfStyle.showGeneratedTimestamp || false}
                                        onChange={(e) => updatePdfStyle({ showGeneratedTimestamp: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    WCAG 3.2.1: Shows date + time instead of just date
                                </p>
                            </div>

                            {/* Visual Accessibility */}
                            <div style={{ marginBottom: '8px', marginTop: '16px', fontWeight: 500, fontSize: '12px', color: 'var(--sys-color-primary-main)' }}>
                                Visual Accessibility
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="High Contrast Mode">
                                    <Switch
                                        checked={pdfStyle.highContrastMode || false}
                                        onChange={(e) => updatePdfStyle({ highContrastMode: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    WCAG 1.4.3: Uses black text and high contrast colors
                                </p>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label="Large Text Mode">
                                    <Switch
                                        checked={pdfStyle.largeTextMode || false}
                                        onChange={(e) => updatePdfStyle({ largeTextMode: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    WCAG 1.4.4: Increases all font sizes by ~25%
                                </p>
                            </div>

                            {/* Contact Info */}
                            <div style={{ marginBottom: '8px', marginTop: '16px', fontWeight: 500, fontSize: '12px', color: 'var(--sys-color-primary-main)' }}>
                                Accessibility Support
                            </div>

                            <div style={{ marginBottom: '0' }}>
                                <SettingRow flow="wrap" label="Accessibility Contact">
                                    <TextInput
                                        size="sm"
                                        value={pdfStyle.accessibilityContact || ''}
                                        onChange={(e) => updatePdfStyle({ accessibilityContact: e.target.value })}
                                        placeholder="e.g., For accessibility help: 970-555-1234"
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    WCAG 3.3.5: Contact info shown in footer for accessibility questions
                                </p>
                            </div>
                        </div>

                        {/* Related Tables PDF Settings Section */}
                        <div className="pdf-section-card">
                            <div className="pdf-section-title">
                                <DataIcon />
                                Related Tables (PDF)
                            </div>
                            <p className="hint-text" style={{ marginTop: 0, marginBottom: '12px' }}>
                                Additional settings for how related tables appear in PDF exports.
                            </p>

                            {config.pdfIncludeRelatedTables && (
                                <>
                                    <SettingRow flow="wrap" label="Include Related Table Charts">
                                        <Switch
                                            checked={config.pdfIncludeRelatedTableCharts !== false}
                                            onChange={(evt, checked) => {
                                                updateConfig('pdfIncludeRelatedTableCharts', checked)
                                            }}
                                        />
                                    </SettingRow>
                                    <p className="hint-text" style={{ marginTop: '2px', marginBottom: '8px' }}>
                                        Capture and include charts from related tables in PDF
                                    </p>

                                    <SettingRow flow="wrap" label="Related Table Header Color">
                                        <TextInput
                                            size="sm"
                                            type="text"
                                            value={pdfStyle.relatedTableHeaderColor || '#DCDCDC'}
                                            onChange={(e) => updatePdfStyle({ relatedTableHeaderColor: e.target.value })}
                                            style={{ width: 100 }}
                                        />
                                    </SettingRow>

                                    <SettingRow flow="wrap" label="Related Table Indent (mm)">
                                        <NumericInput
                                            size="sm"
                                            value={pdfStyle.relatedTableIndent || 5}
                                            min={0}
                                            max={20}
                                            onChange={(value) => updatePdfStyle({ relatedTableIndent: value })}
                                            style={{ width: 80 }}
                                        />
                                    </SettingRow>

                                    <SettingRow flow="wrap" label="Related Table Max Rows">
                                        <NumericInput
                                            size="sm"
                                            value={pdfStyle.relatedTableMaxRows || 10}
                                            min={1}
                                            max={50}
                                            onChange={(value) => updatePdfStyle({ relatedTableMaxRows: value })}
                                            style={{ width: 80 }}
                                        />
                                    </SettingRow>
                                    <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                        Maximum rows per related table in PDF export
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Chart Settings Section */}
                        <div className="pdf-section-card">
                            <div className="pdf-section-title">
                                <ChartIcon />
                                Default Chart Settings
                            </div>
                            <p className="hint-text" style={{ marginTop: 0, marginBottom: '12px' }}>
                                Default settings applied to all charts. Individual layer/section charts can override these.
                            </p>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Chart Type" tooltip="Default visualization type for charts. Bar charts work well for comparisons, pie/donut for proportions, line/area for trends." />)}>
                                <Select
                                    size="sm"
                                    value={config.defaultChartConfig?.chartType || 'bar'}
                                    onChange={(e) => updateDefaultChartConfig({ chartType: e.target.value as any })}
                                >
                                    <Option value="bar">Bar Chart</Option>
                                    <Option value="pie">Pie Chart</Option>
                                    <Option value="donut">Donut Chart</Option>
                                    <Option value="area">Area Chart</Option>
                                    <Option value="line">Line Chart</Option>
                                    <Option value="radialBar">Radial Bar</Option>
                                    <Option value="composite">Composite</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Show Legend" tooltip="Display a legend explaining chart colors and categories. Recommended for charts with multiple data series." />)}>
                                <Switch
                                    checked={config.defaultChartConfig?.showLegend !== false}
                                    onChange={(e) => updateDefaultChartConfig({ showLegend: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Legend Position" tooltip="Where to place the chart legend relative to the chart area." />)}>
                                <Select
                                    size="sm"
                                    value={config.defaultChartConfig?.legendPosition || 'bottom'}
                                    onChange={(e) => updateDefaultChartConfig({ legendPosition: e.target.value as any })}
                                >
                                    <Option value="top">Top</Option>
                                    <Option value="bottom">Bottom</Option>
                                    <Option value="left">Left</Option>
                                    <Option value="right">Right</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Show Values" tooltip="Display numeric values directly on chart elements (bars, slices, etc.). Useful for precise readings." />)}>
                                <Switch
                                    checked={config.defaultChartConfig?.showValues || false}
                                    onChange={(e) => updateDefaultChartConfig({ showValues: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Show Grid" tooltip="Display background grid lines for easier value estimation. Applies to bar, line, and area charts." />)}>
                                <Switch
                                    checked={config.defaultChartConfig?.showGrid !== false}
                                    onChange={(e) => updateDefaultChartConfig({ showGrid: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Animations" tooltip="Enable smooth animations when charts load or update. Disable for faster rendering or reduced motion preferences." />)}>
                                <Switch
                                    checked={config.defaultChartConfig?.animate !== false}
                                    onChange={(e) => updateDefaultChartConfig({ animate: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Stacked" tooltip="Stack bar/area chart series on top of each other instead of side-by-side. Shows part-to-whole relationships." />)}>
                                <Switch
                                    checked={config.defaultChartConfig?.stacked || false}
                                    onChange={(e) => updateDefaultChartConfig({ stacked: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Chart Height (px)" tooltip="Default height of charts in pixels. Taller charts show more detail but take more screen space." />)}>
                                <NumericInput
                                    size="sm"
                                    value={config.defaultChartConfig?.height || 200}
                                    min={100}
                                    max={500}
                                    onChange={(value) => updateDefaultChartConfig({ height: value })}
                                    style={{ width: 80 }}
                                />
                            </SettingRow>
                        </div>

                        {/* Widget Table Settings Section - For On-Screen Display */}
                        <div className="pdf-section-card">
                            <div className="pdf-section-title">
                                <TableIcon />
                                On-Screen Table Settings
                            </div>
                            <p className="hint-text" style={{ marginTop: 0, marginBottom: '12px' }}>
                                These settings control the interactive table display in the widget, not the PDF export.
                            </p>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Enable Sorting" tooltip="Allow users to click column headers to sort table data. Ascending/descending toggle on each click." />)}>
                                <Switch
                                    checked={config.defaultTableConfig?.enableSorting !== false}
                                    onChange={(e) => updateDefaultTableConfig({ enableSorting: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Enable Filtering" tooltip="Show filter inputs above columns to search/filter table data. Useful for tables with many rows." />)}>
                                <Switch
                                    checked={config.defaultTableConfig?.enableFiltering || false}
                                    onChange={(e) => updateDefaultTableConfig({ enableFiltering: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Enable Pagination" tooltip="Split large tables into pages instead of showing all rows. Improves performance for large datasets." />)}>
                                <Switch
                                    checked={config.defaultTableConfig?.enablePagination !== false}
                                    onChange={(e) => updateDefaultTableConfig({ enablePagination: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            {config.defaultTableConfig?.enablePagination !== false && (
                                <SettingRow flow="wrap" label={(<TooltipLabel label="Page Size" tooltip="Number of rows to display per page when pagination is enabled." />)}>
                                    <Select
                                        size="sm"
                                        value={String(config.defaultTableConfig?.pageSize || 10)}
                                        onChange={(e) => updateDefaultTableConfig({ pageSize: Number(e.target.value) })}
                                    >
                                        <Option value="5">5 rows</Option>
                                        <Option value="10">10 rows</Option>
                                        <Option value="25">25 rows</Option>
                                        <Option value="50">50 rows</Option>
                                        <Option value="100">100 rows</Option>
                                    </Select>
                                </SettingRow>
                            )}

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Sticky Header" tooltip="Keep column headers visible when scrolling through long tables. Recommended for better usability." />)}>
                                <Switch
                                    checked={config.defaultTableConfig?.stickyHeader !== false}
                                    onChange={(e) => updateDefaultTableConfig({ stickyHeader: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Striped Rows" tooltip="Alternate row background colors for easier reading across wide tables." />)}>
                                <Switch
                                    checked={config.defaultTableConfig?.stripedRows !== false}
                                    onChange={(e) => updateDefaultTableConfig({ stripedRows: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Highlight on Hover" tooltip="Highlight table rows when the mouse hovers over them. Helps track which row you're viewing." />)}>
                                <Switch
                                    checked={config.defaultTableConfig?.highlightOnHover !== false}
                                    onChange={(e) => updateDefaultTableConfig({ highlightOnHover: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Compact Mode" tooltip="Reduce row height and padding for denser data display. Shows more rows in limited space." />)}>
                                <Switch
                                    checked={config.defaultTableConfig?.compactMode || false}
                                    onChange={(e) => updateDefaultTableConfig({ compactMode: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label="Show Row Numbers" tooltip="Display row numbers in the first column. Helps reference specific records." />)}>
                                <Switch
                                    checked={config.defaultTableConfig?.showRowNumbers || false}
                                    onChange={(e) => updateDefaultTableConfig({ showRowNumbers: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Setting