/** @jsx jsx */
/** @jsxFrag React.Fragment */
import { React, jsx, css, Immutable, DataSourceTypes, DataSourceManager, type UseDataSource, type ImmutableArray } from 'jimu-core'
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
import { hooks as __exbI18nHooks } from 'jimu-core';
import __exbI18nMessages from './translations/default';

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

// Structural props type rather than AllWidgetSettingProps<IMConfig>. Under the
// mode B editor shim (WIDGETHANDOFF Section 12) jimu-for-builder is a shorthand
// module, so its members cannot be used as generic types; webpack ignores this
// file's types either way. The fields listed are the ones this panel reads.
type SettingProps = {
    id: string
    config: IMConfig
    onSettingChange: (settings: any, ...rest: any[]) => void
    useDataSources?: any
    useMapWidgetIds?: any
    intl?: any
    theme?: any
    portalUrl?: string
    [key: string]: any
}

const Setting = (props: SettingProps) => {
  const t = __exbI18nHooks.useTranslation(__exbI18nMessages);
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
                    newConfig = newConfig.set(key as any, importedSettings[key])
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
            config: config.set(key as any, value)
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
            alert(t('pleaseSelectAnImageFilePng'))
            return
        }

        // Validate file size (max 1MB for better quality logos)
        if (file.size > 1024 * 1024) {
            alert(t('imageFileSizeMustBeLess'))
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
            alert(t('pleaseSelectATtfFontFile'))
            return
        }

        // Validate file size (max 2MB per font)
        if (file.size > 2 * 1024 * 1024) {
            alert(t('fontFileSizeMustBeLess'))
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
                        <span className="collapsible-panel-title">{t('mapConnection')}</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('map-connection') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('map-connection') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <SettingRow flow="wrap" label={t('selectMapWidget')}>
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
                        <span className="collapsible-panel-title">{t('settingsImportExport')}</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('import-export') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('import-export') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <div className="import-export-section">
                            <p className="hint-text">
                                {t('exportOrImportWidgetConfigurationTo')}
                            </p>

                            <div className="import-export-buttons">
                                <button
                                    className="import-export-btn"
                                    onClick={exportSettingsToXml}
                                    aria-label={t('exportSettingsToXml')}
                                >
                                    <ExportIcon />
                                    {t('exportSettings')}
                                </button>

                                <button
                                    className="import-export-btn"
                                    onClick={() => importInputRef.current?.click()}
                                    aria-label={t('importSettingsFromXml')}
                                >
                                    <ImportIcon />
                                    {t('importSettings')}
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
                                <strong>{t('exportedSettingsInclude')}</strong> {t('coordinateDisplaySearchSourcesGeocodersLayers')}
                                <br /><br />
                                <strong>{t('notExported')}</strong> {t('mapWidgetConnectionMustBeSet')}
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
                        <span className="collapsible-panel-title">{t('performanceSettings')}</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('performance-settings') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('performance-settings') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <p className="hint-text">
                            {t('configurePerformanceOptimizationsForFasterQuery')}
                        </p>

                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label={t('clientSideQuerying')}
                                tooltip={t('whenEnabledQueriesLayersAlreadyLoaded')}
                            />
                        )}>
                            <Switch
                                checked={config.enableClientSideQuery || false}
                                onChange={(e) => updateConfig('enableClientSideQuery', (e.target as HTMLInputElement).checked)}
                                aria-label={t('enableClientSideQuerying')}
                            />
                        </SettingRow>
                        <p className="hint-text" style={{ marginTop: '4px' }}>
                            <strong>{t('tip')}</strong> {t('enableThisForSignificantlyFasterQueries')}
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
                        <span className="collapsible-panel-title">{t('reportOptions')}</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('report-options') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('report-options') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label={t('reportSummaryTemplate')}
                                tooltip={t('optionalPlainLanguageSentenceShownAbove')}
                            />
                        )}>
                            <TextArea
                                value={config.reportSummaryTemplate || ''}
                                onChange={(e) => updateConfig('reportSummaryTemplate', e.target.value)}
                                placeholder={t('thisAcresAcreParcelAtAddress')}
                                style={{ minHeight: 60 }}
                            />
                        </SettingRow>
                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label={t('permalinkUrlParameter')}
                                tooltip={t('queryStringParameterUsedByThe')}
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
                                label={t('autoOpenPanelFromPermalink')}
                                tooltip={t('whenAReportLinkIsOpened')}
                            />
                        )}>
                            <Switch
                                checked={config.permalinkAutoOpen !== false}
                                onChange={(e) => updateConfig('permalinkAutoOpen', e.target.checked)}
                                aria-label={t('autoOpenPanelFromPermalink')}
                            />
                        </SettingRow>
                        <SettingRow flow="no-wrap" label={(
                            <TooltipLabel
                                label={t('enableComparison')}
                                tooltip={t('showTheCompareButtonInThe')}
                            />
                        )}>
                            <Switch
                                checked={config.enableComparison !== false}
                                onChange={(e) => updateConfig('enableComparison', e.target.checked)}
                                aria-label={t('enableComparison')}
                            />
                        </SettingRow>
                        <SettingRow flow="no-wrap" label={(
                            <TooltipLabel
                                label={t('enableReportLink')}
                                tooltip={t('showTheCopyLinkButtonIn')}
                            />
                        )}>
                            <Switch
                                checked={config.enablePermalink !== false}
                                onChange={(e) => updateConfig('enablePermalink', e.target.checked)}
                                aria-label={t('enableReportLink')}
                            />
                        </SettingRow>
                        <SettingRow flow="no-wrap" label={(
                            <TooltipLabel
                                label={t('enableCsvExport')}
                                tooltip={t('showACsvDownloadButtonOn')}
                            />
                        )}>
                            <Switch
                                checked={config.enableCsvExport !== false}
                                onChange={(e) => updateConfig('enableCsvExport', e.target.checked)}
                                aria-label={t('enableCsvExport')}
                            />
                        </SettingRow>
                        <SettingRow flow="no-wrap" label={(
                            <TooltipLabel
                                label={t('enableRecentSearches')}
                                tooltip={t('rememberRecentPropertySearchesInThe')}
                            />
                        )}>
                            <Switch
                                checked={config.enableRecentSearches !== false}
                                onChange={(e) => updateConfig('enableRecentSearches', e.target.checked)}
                                aria-label={t('enableRecentSearches')}
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
                        <span className="collapsible-panel-title">{t('coordinateDisplay')}</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('coordinate-display') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('coordinate-display') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <p className="hint-text">
                            {t('configureHowCoordinatesAreDisplayedIn')}
                        </p>

                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label={t('enableUseCurrentLocation')}
                                tooltip={t('showAUseCurrentLocationButton')}
                            />
                        )}>

                            <Switch
                                checked={config.enableUseCurrentLocation !== false}
                                onChange={(e) => updateConfig('enableUseCurrentLocation', (e.target as HTMLInputElement).checked)}
                                aria-label={t('enableUseCurrentLocationButton')}
                            />
                        </SettingRow>
                        {config.enableUseCurrentLocation !== false && (
                            <p className="hint-text" style={{ marginTop: '2px', marginBottom: '8px' }}>
                                {t('addsAGpsButtonToQuery')}
                            </p>
                        )}

                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label={t('showCoordinates')}
                                tooltip={t('displayTheQueryPointCoordinatesIn')}
                            />
                        )}>

                            <Switch
                                checked={config.showCoordinates !== false}
                                onChange={(e) => updateConfig('showCoordinates', (e.target as HTMLInputElement).checked)}
                                aria-label={t('showCoordinatesInResults')}
                            />
                        </SettingRow>

                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label={t('coordinateSystem')}
                                tooltip={t('chooseHowCoordinatesAreDisplayedMap')}
                            />
                        )}>

                            <Select
                                size="sm"
                                value={config.coordinateSystem || 'map'}
                                onChange={(e) => updateConfig('coordinateSystem', e.target.value)}
                                style={{ width: '100%' }}
                            >
                                <Option value="map">{t('mapNativeOriginalUnits')}</Option>
                                <Option value="wgs84">{t('latLonDegreesWgs84')}</Option>
                                <Option value="webmercator">{t('xYMetersWebMercator')}</Option>
                                <Option value="custom">{t('customWkid')}</Option>
                            </Select>
                        </SettingRow>

                        {config.coordinateSystem === 'custom' && (
                            <>
                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label="WKID"
                                        tooltip={t('enterTheWellKnownIdEpsg')}
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
                                        label={t('displayLabel')}
                                        tooltip={t('optionalLabelShownInTheCoordinate')}
                                    />
                                )}>
                                    <TextInput
                                        size="sm"
                                        value={config.customCoordinateLabel || ''}
                                        onChange={(e) => updateConfig('customCoordinateLabel', e.target.value)}
                                        placeholder={t('eGEtrs89PolandCs92')}
                                        style={{ width: '100%' }}
                                    />
                                </SettingRow>

                                <p className="hint-text" style={{ marginTop: '4px' }}>
                                    {t('commonWKIDs2180Poland2583225833')}
                                </p>
                            </>
                        )}

                        {config.coordinateSystem === 'wgs84' && (
                            <SettingRow flow="wrap" label={(
                                <TooltipLabel
                                    label={t('format')}
                                    tooltip={t('decimalDegrees390639AreMore')}
                                />
                            )}>

                                <Select
                                    size="sm"
                                    value={config.coordinateFormat || 'decimal'}
                                    onChange={(e) => updateConfig('coordinateFormat', e.target.value)}
                                    style={{ width: '100%' }}
                                >
                                    <Option value="decimal">{t('decimalDegreesEG390639')}</Option>
                                    <Option value="dms">{t('degreesMinutesSecondsEG39')}</Option>
                                </Select>
                            </SettingRow>
                        )}

                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label={t('decimalPrecision')}
                                tooltip={t('numberOfDecimalPlacesForLat')}
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
                        <span className="collapsible-panel-title">{t('searchSources')}</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('search-sources') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('search-sources') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <p className="hint-text">
                            {t('configureSearchSourcesResultsFromAll')}
                        </p>

                        {searchSources.length === 0 ? (
                            <div className="empty-state">
                                <SearchIcon />
                                <span>{t('noSearchSourcesConfigured')}</span>
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
                                                    {source.type === 'geocoder' ? t('geocoder') : source.type === 'url' ? 'URL' : t('layer')}
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
                                                    aria-label={t('enableSourceName', { sourceName: source.sourceName })}
                                                />
                                                <Tip title={t('removeSource')} placement="top">
                                                    <button
                                                        className="delete-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            removeSearchSource(source.sourceId)
                                                        }}
                                                        aria-label={t('removeSourceName', { sourceName: source.sourceName })}
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
                                                        label={t('sourceName')}
                                                        tooltip={t('displayNameShownInSearchSuggestions')}
                                                    />
                                                )}>
                                                    <TextInput
                                                        size="sm"
                                                        value={source.sourceName}
                                                        onChange={(e) => updateSearchSource(source.sourceId, { sourceName: e.target.value })}
                                                        aria-label={t('sourceName2')}
                                                    />
                                                </SettingRow>

                                                {source.type === 'geocoder' && (
                                                    <>
                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label={t('geocoderUrl')}
                                                                tooltip={t('arcGISWorldGeocoderOrCustomGeocoding')}
                                                            />
                                                        )}>
                                                            <TextInput
                                                                size="sm"
                                                                value={source.geocoderUrl || ''}
                                                                onChange={(e) => updateSearchSource(source.sourceId, { geocoderUrl: e.target.value })}
                                                                placeholder="https://geocode.arcgis.com/..."
                                                                aria-label={t('geocoderUrl')}
                                                            />
                                                        </SettingRow>
                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label={t('maxSuggestions')}
                                                                tooltip={t('maximumNumberOfAddressSuggestionsTo')}
                                                            />
                                                        )}>
                                                            <NumericInput
                                                                size="sm"
                                                                value={source.maxSuggestions || 6}
                                                                min={1}
                                                                max={20}
                                                                onChange={(value) => updateSearchSource(source.sourceId, { maxSuggestions: value })}
                                                                style={{ width: 80 }}
                                                                aria-label={t('maximumSuggestions')}
                                                            />
                                                        </SettingRow>
                                                    </>
                                                )}

                                                {source.type === 'layer' && (
                                                    <>
                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label={t('searchLayer')}
                                                                tooltip={t('featureLayerToSearchUsersCan')}
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
                                                                ) : <div style={{ padding: "8px", fontSize: "12px", color: "var(--sys-color-text-secondary)" }}>{t('loadingDataSourceSelector')}</div>}
                                                            </div>
                                                        </SettingRow>

                                                        {source.dataSourceId && (
                                                            <>
                                                                <SettingRow flow="wrap" label={(
                                                                    <TooltipLabel
                                                                        label={t('searchFields')}
                                                                        tooltip={t('whichTextFieldsToSearchSelect')}
                                                                    />
                                                                )}>
                                                                    <div className="fields-container">
                                                                        {stringFields.length === 0 ? (
                                                                            <div className="field-item" style={{ justifyContent: 'center', color: 'var(--sys-color-text-light)' }}>
                                                                                {t('noTextFieldsAvailable')}
                                                                            </div>
                                                                        ) : (
                                                                            stringFields.map(field => {
                                                                                const isSelected = toMutableStringArray(source.searchFields).includes(field.name)
                                                                                return (
                                                                                    <div className="field-item" key={field.name}>
                                                                                        <Checkbox
                                                                                            checked={isSelected}
                                                                                            onChange={() => toggleSearchFieldSelection(source.sourceId, field.name)}
                                                                                            aria-label={t('selectAlias', { alias: field.alias || field.name })}
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
                                                                        label={t('displayField')}
                                                                        tooltip={t('fieldShownInSearchSuggestionsChoose')}
                                                                    />
                                                                )}>
                                                                    <Select
                                                                        size="sm"
                                                                        value={source.displayField || ''}
                                                                        onChange={(e) => updateSearchSource(source.sourceId, { displayField: e.target.value })}
                                                                        aria-label={t('displayField2')}
                                                                    >
                                                                        <Option value="">{t('selectField')}</Option>
                                                                        {searchLayerFields.map(field => (
                                                                            <Option key={field.name} value={field.name}>
                                                                                {field.alias || field.name}
                                                                            </Option>
                                                                        ))}
                                                                    </Select>
                                                                </SettingRow>

                                                                <SettingRow flow="wrap" label={(
                                                                    <TooltipLabel
                                                                        label={t('maxSuggestions')}
                                                                        tooltip={t('maximumMatchingFeaturesToShowIn')}
                                                                    />
                                                                )}>
                                                                    <NumericInput
                                                                        size="sm"
                                                                        value={source.maxSuggestions || 6}
                                                                        min={1}
                                                                        max={20}
                                                                        onChange={(value) => updateSearchSource(source.sourceId, { maxSuggestions: value })}
                                                                        style={{ width: 80 }}
                                                                        aria-label={t('maximumSuggestions')}
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
                                                                label={t('serviceUrl')}
                                                                tooltip={t('arcGISRestEndpointUrlFeatureServerOr')}
                                                            />
                                                        )}>
                                                            <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                                                                <TextInput
                                                                    size="sm"
                                                                    value={source.url || ''}
                                                                    onChange={(e) => updateSearchSource(source.sourceId, { url: e.target.value } as any)}
                                                                    placeholder="https://services.arcgis.com/.../FeatureServer/0"
                                                                    aria-label={t('restServiceUrl')}
                                                                    style={{ flex: 1 }}
                                                                />
                                                                <Button
                                                                    size="sm"
                                                                    type="primary"
                                                                    disabled={!source.url || urlSourceFieldsLoading[source.sourceId]}
                                                                    onClick={() => fetchSearchSourceUrlFields(source.sourceId, source.url)}
                                                                    aria-label={t('loadFieldsFromUrl')}
                                                                >
                                                                    {urlSourceFieldsLoading[source.sourceId] ? 'Loading...' : t('loadFields')}
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
                                                            {t('enterAFeatureLayerRestEndpoint')}
                                                        </p>

                                                        {(() => {
                                                            const urlFields = getSearchSourceUrlFields(source.sourceId)
                                                            const urlStringFields = urlFields.filter(f =>
                                                                f.type === 'esriFieldTypeString' || f.type === 'string'
                                                            )

                                                            if (urlFields.length === 0) {
                                                                return (
                                                                    <div className="hint-text" style={{ fontStyle: 'italic', padding: '8px 0' }}>
                                                                        {t('clickLoadFieldsToFetchAvailable')}
                                                                    </div>
                                                                )
                                                            }

                                                            return (
                                                                <>
                                                                    <SettingRow flow="wrap" label={(<TooltipLabel label={t('searchFields')} tooltip={t('selectWhichTextFieldsUsersCan')} />)}>
                                                                        <div className="fields-container">
                                                                            {urlStringFields.length === 0 ? (
                                                                                <div className="field-item" style={{ justifyContent: 'center', color: 'var(--sys-color-text-light)' }}>
                                                                                    {t('noTextFieldsAvailable')}
                                                                                </div>
                                                                            ) : (
                                                                                urlStringFields.map(field => {
                                                                                    const isSelected = toMutableStringArray(source.searchFields).includes(field.name)
                                                                                    return (
                                                                                        <div className="field-item" key={field.name}>
                                                                                            <Checkbox
                                                                                                checked={isSelected}
                                                                                                onChange={() => toggleSearchFieldSelection(source.sourceId, field.name)}
                                                                                                aria-label={t('selectAlias', { alias: field.alias || field.name })}
                                                                                            />
                                                                                            <span className="field-name">{field.alias || field.name}</span>
                                                                                        </div>
                                                                                    )
                                                                                })
                                                                            )}
                                                                        </div>
                                                                    </SettingRow>

                                                                    <SettingRow flow="wrap" label={(<TooltipLabel label={t('displayField')} tooltip={t('theFieldValueShownInSearch')} />)}>
                                                                        <Select
                                                                            size="sm"
                                                                            value={source.displayField || ''}
                                                                            onChange={(e) => updateSearchSource(source.sourceId, { displayField: e.target.value })}
                                                                            aria-label={t('displayField2')}
                                                                        >
                                                                            <Option value="">{t('selectField')}</Option>
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

                                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('maxSuggestions')} tooltip={t('maximumNumberOfSuggestionsToShow')} />)}>
                                                            <NumericInput
                                                                size="sm"
                                                                value={source.maxSuggestions || 6}
                                                                min={1}
                                                                max={20}
                                                                onChange={(value) => updateSearchSource(source.sourceId, { maxSuggestions: value })}
                                                                style={{ width: 80 }}
                                                                aria-label={t('maximumSuggestions')}
                                                            />
                                                        </SettingRow>
                                                    </>
                                                )}

                                                {/* Highlight Options - for layer and url types */}
                                                {(source.type === 'layer' || source.type === 'url') && (
                                                    <>
                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label={t('highlightGeometry')}
                                                                tooltip={t('drawFeatureOutlineFillOnMap')}
                                                            />
                                                        )}>
                                                            <Switch
                                                                checked={source.highlightEnabled || false}
                                                                onChange={(e) => updateSearchSource(source.sourceId, {
                                                                    highlightEnabled: (e.target as HTMLInputElement).checked
                                                                } as any)}
                                                                aria-label={t('enableGeometryHighlight')}
                                                            />
                                                        </SettingRow>
                                                        {source.highlightEnabled && (
                                                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('highlightColor')} tooltip={t('colorUsedToHighlightTheSelected')} />)}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <input
                                                                        type="color"
                                                                        value={source.highlightColor || '#00FFFF'}
                                                                        onChange={(e) => updateSearchSource(source.sourceId, {
                                                                            highlightColor: e.target.value
                                                                        } as any)}
                                                                        style={{ width: 40, height: 28, padding: 0, border: '1px solid #ccc', cursor: 'pointer' }}
                                                                        aria-label={t('highlightColor2')}
                                                                    />
                                                                    <TextInput
                                                                        size="sm"
                                                                        value={source.highlightColor || '#00FFFF'}
                                                                        onChange={(e) => updateSearchSource(source.sourceId, {
                                                                            highlightColor: e.target.value
                                                                        } as any)}
                                                                        style={{ width: 80 }}
                                                                        aria-label={t('highlightColorHex')}
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
                                aria-label={t('addGeocoderSource')}
                            >
                                <PinIcon />
                                <span className="source-type-label">{t('addGeocoder')}</span>
                            </button>
                            <button
                                className="source-type-btn"
                                onClick={() => addSearchSource('layer')}
                                aria-label={t('addLayerSource')}
                            >
                                <LayersIcon />
                                <span className="source-type-label">{t('addLayerSearch')}</span>
                            </button>
                            <button
                                className="source-type-btn"
                                onClick={() => addSearchSource('url')}
                                aria-label={t('addRestUrlSource')}
                            >
                                <DataIcon />
                                <span className="source-type-label">{t('addRestUrl')}</span>
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
                        <span className="collapsible-panel-title">{t('reportHeaderInfo')}</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('header-info') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('header-info') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <p className="hint-text">
                            {t('configureALayerToDisplayAdditional')}
                        </p>

                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label={t('enableHeaderInfo')}
                                tooltip={t('queryAParcelLayerToDisplay')}
                            />
                        )}>

                            <Switch
                                checked={config.headerInfo?.enabled || false}
                                onChange={(e) => {
                                    const current = (config.headerInfo || { enabled: false, displayFields: [] }) as any
                                    updateConfig('headerInfo', { ...current, enabled: (e.target as HTMLInputElement).checked } as any)
                                }}
                                aria-label={t('enableHeaderInfoLayer')}
                            />
                        </SettingRow>

                        {config.headerInfo?.enabled && (
                            <>
                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label={t('dataSource')}
                                        tooltip={t('selectAFeatureLayerTypicallyParcels')}
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
                                        ) : <div style={{ padding: "8px", fontSize: "12px", color: "var(--sys-color-text-secondary)" }}>{t('loadingDataSourceSelector')}</div>}
                                    </div>
                                </SettingRow>

                                <div style={{ textAlign: 'center', color: 'var(--sys-color-text-light)', fontSize: '11px', margin: '8px 0' }}>
                                    {t('orUseDirectUrl')}
                                </div>

                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('restServiceUrl')} tooltip={t('directFeatureLayerRestEndpointUrl')} />)}>
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
                                        aria-label={t('restServiceUrl')}
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
                                                label={t('displayFields')}
                                                tooltip={t('selectWhichFieldsToShowIn')}
                                            />
                                        )}>

                                            <div className="fields-container">
                                                {loadingHeaderInfoFields ? (
                                                    <div className="field-item" style={{ justifyContent: 'center', color: 'var(--sys-color-text-light)' }}>
                                                        {t('loadingFields')}
                                                    </div>
                                                ) : headerFields.length === 0 ? (
                                                    <div className="field-item" style={{ justifyContent: 'center', color: 'var(--sys-color-text-light)' }}>
                                                        {config.headerInfo?.layerUrl || config.headerInfo?.dataSourceId
                                                            ? t('noFieldsAvailable')
                                                            : t('enterAUrlOrSelectA')}
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
                                                                        aria-label={t('selectAlias', { alias: field.alias || field.name })}
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
                                                                            placeholder={t('displayAlias')}
                                                                            aria-label={t('aliasForName', { name: field.name })}
                                                                            style={{ width: '100%' }}
                                                                        />
                                                                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <Switch
                                                                                checked={getHeaderInfoFieldExcludeFromPdf(field.name)}
                                                                                onChange={() => toggleHeaderInfoFieldExcludeFromPdf(field.name)}
                                                                                aria-label={t('excludeNameFromPdf', { name: field.name })}
                                                                            />
                                                                            <Label style={{ fontSize: '11px', cursor: 'pointer' }}>
                                                                                {t('excludeFromPdf')}
                                                                            </Label>
                                                                            <Tip title={t('fieldWillDisplayInWidgetHeader')} placement="top">
                                                                                <span style={{ color: 'var(--sys-color-text-light)', cursor: 'help' }}>ⓘ</span>
                                                                            </Tip>
                                                                        </div>
                                                                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <Switch
                                                                                checked={getHeaderInfoFieldHideNull(field.name)}
                                                                                onChange={() => toggleHeaderInfoFieldHideNull(field.name)}
                                                                                aria-label={t('hideNameWhenNull', { name: field.name })}
                                                                            />
                                                                            <Label style={{ fontSize: '11px', cursor: 'pointer' }}>
                                                                                {t('hideWhenNull')}
                                                                            </Label>
                                                                            <Tip title={t('hideThisFieldWhenValueIs')} placement="top">
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
                                        label={t('headerTitleGeocoderUrl')}
                                        tooltip={t('optionalProvideAGeocoderUrlFor')}
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
                                        aria-label={t('geocoderUrlForHeaderTitle')}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '4px', fontSize: '11px' }}>
                                    {t('optionalProvideAGeocoderUrlTo')}
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
                        <span className="collapsible-panel-title">{t('highlightLayer')}</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('highlight-layer') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('highlight-layer') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <p className="hint-text">
                            {t('configureALayerToHighlightOn')}
                        </p>

                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label={t('enableHighlightLayer')}
                                tooltip={t('queryAPolygonLayerTypicallyParcels')}
                            />
                        )}>

                            <Switch
                                checked={config.highlightLayer?.enabled || false}
                                onChange={(e) => {
                                    const current = (config.highlightLayer || { enabled: false }) as any
                                    updateConfig('highlightLayer', { ...current, enabled: (e.target as HTMLInputElement).checked } as any)
                                }}
                                aria-label={t('enableHighlightLayer2')}
                            />
                        </SettingRow>

                        {config.highlightLayer?.enabled && (
                            <>
                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label={t('dataSource')}
                                        tooltip={t('selectTheLayerToQueryFor')}
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
                                        ) : <div style={{ padding: "8px", fontSize: "12px", color: "var(--sys-color-text-secondary)" }}>{t('loadingDataSourceSelector')}</div>}
                                    </div>
                                </SettingRow>

                                <div style={{ textAlign: 'center', color: 'var(--sys-color-text-light)', fontSize: '11px', margin: '8px 0' }}>
                                    {t('orUseDirectUrl')}
                                </div>

                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label={t('restServiceUrl')}
                                        tooltip={t('alternativeToDataSourceEnterThe')}
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
                                        aria-label={t('restServiceUrl')}
                                    />
                                </SettingRow>

                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label={t('highlightColor')}
                                        tooltip={t('theOutlineStrokeColorForHighlighted')}
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
                                            aria-label={t('highlightColor2')}
                                        />
                                        <TextInput
                                            size="sm"
                                            value={config.highlightLayer?.highlightColor || '#00FFFF'}
                                            onChange={(e) => {
                                                const current = (config.highlightLayer || { enabled: true }) as any
                                                updateConfig('highlightLayer', { ...current, highlightColor: e.target.value } as any)
                                            }}
                                            style={{ width: 80 }}
                                            aria-label={t('highlightColorHex')}
                                        />
                                    </div>
                                </SettingRow>

                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label={t('fillOpacity')}
                                        tooltip={t('controlsPolygonFillTransparency0Outline')}
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
                                        aria-label={t('fillOpacity2')}
                                    />
                                    <p className="hint-text" style={{ marginTop: 4, marginBottom: 0 }}>
                                        {t('_0OutlineOnly1SolidFill')}
                                    </p>
                                </SettingRow>

                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label={t('outputSpatialReferenceWkid')}
                                        tooltip={t('overrideTheAutomaticSpatialReferenceDetection')}
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
                                        placeholder={t('auto')}
                                        aria-label={t('outputSpatialReferenceWkid2')}
                                    />
                                    <p className="hint-text" style={{ marginTop: 4, marginBottom: 0 }}>
                                        {t('leaveEmptyForAutomaticUsesMap')}
                                    </p>
                                </SettingRow>

                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label={t('geometryOffsetDatumCorrection')}
                                        tooltip={t('manuallyOffsetHighlightGeometryToCorrect')}
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
                                                aria-label={t('geometryXOffset')}
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
                                                aria-label={t('geometryYOffset')}
                                            />
                                        </div>
                                    </div>
                                    <p className="hint-text" style={{ marginTop: 4, marginBottom: 0 }}>
                                        {t('positiveXEastPositiveYNorth')}
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
                        <span className="collapsible-panel-title">{t('propertyPreview')}</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('property-preview') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('property-preview') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <p className="hint-text">
                            {t('displayAPreviewOfTheSelected')}
                        </p>

                        <SettingRow flow="wrap" label={(
                            <TooltipLabel
                                label={t('enablePropertyPreview')}
                                tooltip={t('showsACardAtTheTop')}
                            />
                        )}>

                            <Switch
                                checked={config.propertyPreview?.enabled || false}
                                onChange={(e) => {
                                    const current = (config.propertyPreview || {}) as PropertyPreviewConfig
                                    updateConfig('propertyPreview', { ...current, enabled: (e.target as HTMLInputElement).checked })
                                }}
                                aria-label={t('enablePropertyPreview2')}
                            />
                        </SettingRow>

                        {config.propertyPreview?.enabled && (
                            <>
                                <div className="subsection-divider">{t('mapPreview')}</div>

                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label={t('showMapPreview')}
                                        tooltip={t('displayASmallSatelliteAerialMap')}
                                    />
                                )}>

                                    <Switch
                                        checked={config.propertyPreview?.showMapPreview !== false}
                                        onChange={(e) => {
                                            const current = (config.propertyPreview || { enabled: true }) as PropertyPreviewConfig
                                            updateConfig('propertyPreview', { ...current, showMapPreview: (e.target as HTMLInputElement).checked })
                                        }}
                                        aria-label={t('showMapPreview2')}
                                    />
                                </SettingRow>

                                {config.propertyPreview?.showMapPreview !== false && (
                                    <>
                                        <SettingRow flow="wrap" label={(
                                            <TooltipLabel
                                                label={t('mapHeightPx')}
                                                tooltip={t('heightOfTheMapPreviewImage')}
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
                                                label={t('highlightColor')}
                                                tooltip={t('colorUsedToHighlightTheProperty')}
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

                                <div className="subsection-divider">{t('attributeDisplay')}</div>

                                <SettingRow flow="wrap" label={(
                                    <TooltipLabel
                                        label={t('showAttributes')}
                                        tooltip={t('displayHeaderInfoFieldsInThe')}
                                    />
                                )}>
                                    <Switch
                                        checked={config.propertyPreview?.showAttributes !== false}
                                        onChange={(e) => {
                                            const current = (config.propertyPreview || { enabled: true }) as PropertyPreviewConfig
                                            updateConfig('propertyPreview', { ...current, showAttributes: (e.target as HTMLInputElement).checked })
                                        }}
                                        aria-label={t('showAttributesInPropertyPreview')}
                                    />
                                </SettingRow>

                                {config.propertyPreview?.showAttributes !== false && (
                                    <SettingRow flow="wrap" label={(
                                        <TooltipLabel
                                            label={t('attributeLayout')}
                                            tooltip={t('horizontalInlineRowVerticalStackedList')}
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
                                            <Option value="horizontal">{t('horizontal')}</Option>
                                            <Option value="vertical">{t('vertical')}</Option>
                                            <Option value="grid">{t('grid')}</Option>
                                        </Select>
                                    </SettingRow>
                                )}

                                <div className="subsection-divider">{t('actions')}</div>

                                <div className="display-options-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
                                    <label className="display-option">
                                        <Checkbox
                                            checked={config.propertyPreview?.showZoomButton !== false}
                                            onChange={(e) => {
                                                const current = (config.propertyPreview || { enabled: true }) as PropertyPreviewConfig
                                                updateConfig('propertyPreview', { ...current, showZoomButton: (e.target as HTMLInputElement).checked })
                                            }}
                                        />
                                        <span>{t('zoomButton')}</span>
                                    </label>
                                    <label className="display-option">
                                        <Checkbox
                                            checked={config.propertyPreview?.showCopyButton !== false}
                                            onChange={(e) => {
                                                const current = (config.propertyPreview || { enabled: true }) as PropertyPreviewConfig
                                                updateConfig('propertyPreview', { ...current, showCopyButton: (e.target as HTMLInputElement).checked })
                                            }}
                                        />
                                        <span>{t('copyAddress')}</span>
                                    </label>
                                </div>

                                <p className="hint-text" style={{ marginTop: '8px' }}>
                                    {t('attributesAreAutomaticallyPopulatedFromHeader')}
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
                        <span className="collapsible-panel-title">{t('reportSections')}</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('report-sections') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('report-sections') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <p className="hint-text">
                            {t('configureSectionsForThePropertyReport')}
                        </p>

                        {sections.length === 0 ? (
                            <div className="empty-state">
                                <DataIcon />
                                <span>{t('noReportSectionsConfigured')}</span>
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
                                                    <Tip title={t('moveUp')} placement="left">
                                                        <button
                                                            className="reorder-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                moveSection(section.sectionId, 'up')
                                                            }}
                                                            disabled={isFirst}
                                                            aria-label={t('moveSectionUp')}
                                                        >
                                                            <MoveUpIcon />
                                                        </button>
                                                    </Tip>
                                                    <Tip title={t('moveDown')} placement="left">
                                                        <button
                                                            className="reorder-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                moveSection(section.sectionId, 'down')
                                                            }}
                                                            disabled={isLast}
                                                            aria-label={t('moveSectionDown')}
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
                                                    {(layers.length !== 1 ? t('layersCountLayers', { layersCount: layers.length }) : t('layersCountLayer', { layersCount: layers.length }))}
                                                </span>
                                            </div>
                                            <div className="list-item-actions">
                                                <Tip title={t('removeSection')} placement="top">
                                                    <button
                                                        className="delete-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            removeSection(section.sectionId)
                                                        }}
                                                        aria-label={t('removeSectionTitle', { sectionTitle: section.sectionTitle })}
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </Tip>
                                            </div>
                                        </div>

                                        <div style={{ display: isSectionExpanded ? 'block' : 'none' }}>
                                            <div className="list-item-content">
                                                <div className="subsection-divider">{t('sectionSettings')}</div>

                                                <SettingRow flow="wrap" label={(
                                                    <TooltipLabel
                                                        label={t('sectionTitle')}
                                                        tooltip={t('displayNameForThisSectionIn')}
                                                    />
                                                )}>

                                                    <TextInput
                                                        size="sm"
                                                        value={section.sectionTitle}
                                                        onChange={(e) => updateSection(section.sectionId, { sectionTitle: e.target.value })}
                                                        aria-label={t('sectionTitle2')}
                                                    />
                                                </SettingRow>

                                                <SettingRow flow="wrap" label={(
                                                    <TooltipLabel
                                                        label={t('excludeFromPdf')}
                                                        tooltip={t('whenEnabledThisEntireSectionWill')}
                                                    />
                                                )}>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Switch
                                                            checked={section.excludeFromPdf || false}
                                                            onChange={(e) => updateSection(section.sectionId, { excludeFromPdf: (e.target as HTMLInputElement).checked })}
                                                            aria-label={t('excludeThisSectionFromPdfExport')}
                                                        />
                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                            {section.excludeFromPdf ? t('sectionWillNotAppearInPdf') : t('sectionWillAppearInPdfExports')}
                                                        </span>
                                                    </div>
                                                </SettingRow>

                                                <SettingRow flow="wrap" label={(
                                                    <TooltipLabel
                                                        label={t('displayOptions')}
                                                        tooltip={t('chooseHowDataIsPresentedTable')}
                                                    />
                                                )}>

                                                    <div className="display-options-row">
                                                        <label className="display-option">
                                                            <Checkbox
                                                                checked={section.displayAsTable}
                                                                onChange={(e) => updateSection(section.sectionId, { displayAsTable: (e.target as HTMLInputElement).checked })}
                                                            />
                                                            <span>{t('table')}</span>
                                                        </label>
                                                        <label className="display-option">
                                                            <Checkbox
                                                                checked={section.displayAsChart}
                                                                onChange={(e) => updateSection(section.sectionId, { displayAsChart: (e.target as HTMLInputElement).checked })}
                                                            />
                                                            <span>{t('chart')}</span>
                                                        </label>
                                                    </div>
                                                </SettingRow>

                                                <SettingRow flow="wrap" label={(
                                                    <TooltipLabel
                                                        label={t('displayPane')}
                                                        tooltip={t('inlineShowsResultsInTheMain')}
                                                    />
                                                )}>

                                                    <Select
                                                        size="sm"
                                                        value={section.displayPane || 'inline'}
                                                        onChange={(e) => updateSection(section.sectionId, { displayPane: e.target.value as any })}
                                                    >
                                                        <Option value="inline">{t('inlineResultsPanel')}</Option>
                                                        <Option value="separate">{t('separatePane')}</Option>
                                                    </Select>
                                                </SettingRow>

                                                <SettingRow flow="wrap" label={(
                                                    <TooltipLabel
                                                        label={t('defaultExpandedState')}
                                                        tooltip={t('initialCollapseStateWhenResultsLoad')}
                                                    />
                                                )}>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Select
                                                            size="sm"
                                                            value={section.expanded === false ? 'collapsed' : 'expanded'}
                                                            onChange={(e) => updateSection(section.sectionId, { expanded: e.target.value === 'expanded' })}
                                                        >
                                                            <Option value="expanded">{t('expanded')}</Option>
                                                            <Option value="collapsed">{t('collapsed')}</Option>
                                                        </Select>
                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                            {section.expanded === false ? t('sectionStartsCollapsedWhenResultsLoad') : t('sectionStartsExpandedWhenResultsLoad')}
                                                        </span>
                                                    </div>
                                                </SettingRow>

                                                <SettingRow flow="wrap" label={(
                                                    <TooltipLabel
                                                        label={t('sectionAlerts')}
                                                        tooltip={t('rulesEvaluatedAgainstThisSectionS')}
                                                    />
                                                )}>
                                                    <div style={{ width: '100%' }}>
                                                        {getSectionAlerts(section).map((al: any, ai: number) => (
                                                            <div key={al.alertId || ai} style={{ border: '1px solid var(--sys-color-divider-secondary, #e0e0e0)', borderRadius: 4, padding: 6, marginBottom: 6 }}>
                                                                <TextInput size="sm" placeholder={t('fieldNameEGFloodzone')} value={al.field || ''} onChange={(e) => updateSectionAlert(section, ai, { field: e.target.value })} style={{ marginBottom: 4 }} aria-label={t('alertFieldName')} />
                                                                <Select size="sm" value={al.operator || 'equals'} onChange={(e) => updateSectionAlert(section, ai, { operator: (e.target as HTMLSelectElement).value })} style={{ marginBottom: 4 }} aria-label={t('alertOperator')}>
                                                                    <Option value="equals">{t('equals')}</Option>
                                                                    <Option value="notEquals">{t('doesNotEqual')}</Option>
                                                                    <Option value="contains">{t('contains')}</Option>
                                                                    <Option value="greaterThan">{t('greaterThan')}</Option>
                                                                    <Option value="lessThan">{t('lessThan')}</Option>
                                                                    <Option value="isEmpty">{t('isEmpty')}</Option>
                                                                    <Option value="isNotEmpty">{t('isNotEmpty')}</Option>
                                                                </Select>
                                                                {al.operator !== 'isEmpty' && al.operator !== 'isNotEmpty' && (
                                                                    <TextInput size="sm" placeholder={t('valueToCompare')} value={al.value || ''} onChange={(e) => updateSectionAlert(section, ai, { value: e.target.value })} style={{ marginBottom: 4 }} aria-label={t('alertComparisonValue')} />
                                                                )}
                                                                <TextInput size="sm" placeholder={t('bannerMessage')} value={al.message || ''} onChange={(e) => updateSectionAlert(section, ai, { message: e.target.value })} style={{ marginBottom: 4 }} aria-label={t('alertBannerMessage')} />
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                    <Select size="sm" value={al.severity || 'warning'} onChange={(e) => updateSectionAlert(section, ai, { severity: (e.target as HTMLSelectElement).value })} aria-label={t('alertSeverity')} style={{ width: 110 }}>
                                                                        <Option value="info">{t('info')}</Option>
                                                                        <Option value="warning">{t('warning')}</Option>
                                                                        <Option value="critical">{t('critical')}</Option>
                                                                    </Select>
                                                                    <Button size="sm" type="tertiary" onClick={() => removeSectionAlert(section, ai)} aria-label={t('removeThisAlert')}>{t('remove')}</Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <Button size="sm" onClick={() => addSectionAlert(section)} aria-label={t('addANewAlertRule')}>{t('addAlert')}</Button>
                                                    </div>
                                                </SettingRow>

                                                {section.displayPane === 'separate' && (
                                                    <>
                                                        <SettingRow flow="wrap" label={t('paneTitle')}>
                                                            <TextInput
                                                                size="sm"
                                                                value={section.separatePaneTitle || ''}
                                                                placeholder={section.sectionTitle || t('sectionDetails')}
                                                                onChange={(e) => updateSection(section.sectionId, { separatePaneTitle: e.target.value })}
                                                            />
                                                        </SettingRow>
                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label={t('recordThreshold')}
                                                                tooltip={t('onlyOpenInSeparatePaneWhen')}
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
                                                                    {(section.separatePaneThreshold || 0) === 0 ? t('alwaysUseSeparatePane') : t('useSeparatePaneWhenSeparatePaneThresholdRecords', { separatePaneThreshold: section.separatePaneThreshold })}
                                                                </span>
                                                            </div>
                                                        </SettingRow>
                                                    </>
                                                )}

                                                {section.displayAsTable && (
                                                    <>
                                                        <div className="subsection-divider">{t('tableConfiguration')}</div>
                                                        <p className="hint-text">
                                                            {t('sortingAndResizingOnlyApplyWhen')}
                                                        </p>

                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label={t('columnSorting')}
                                                                tooltip={t('allowUsersToClickColumnHeaders')}
                                                            />
                                                        )}>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Switch
                                                                    checked={section.tableConfig?.enableSorting !== false}
                                                                    onChange={(e) => updateSectionTableConfig(section.sectionId, { enableSorting: (e.target as HTMLInputElement).checked })}
                                                                    aria-label={t('enableColumnSorting')}
                                                                />
                                                                <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                    {t('allowUsersToSortByColumn')}
                                                                </span>
                                                            </div>
                                                        </SettingRow>

                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label={t('columnResizing')}
                                                                tooltip={t('allowUsersToDragColumnBorders')}
                                                            />
                                                        )}>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Switch
                                                                    checked={section.tableConfig?.resizableColumns || false}
                                                                    onChange={(e) => updateSectionTableConfig(section.sectionId, { resizableColumns: (e.target as HTMLInputElement).checked })}
                                                                    aria-label={t('enableColumnResizing')}
                                                                />
                                                                <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                    {t('allowUsersToResizeColumns')}
                                                                </span>
                                                            </div>
                                                        </SettingRow>

                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label={t('stripedRows')}
                                                                tooltip={t('alternateRowBackgroundColorsZebraStriping')}
                                                            />
                                                        )}>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Switch
                                                                    checked={section.tableConfig?.stripedRows !== false}
                                                                    onChange={(e) => updateSectionTableConfig(section.sectionId, { stripedRows: (e.target as HTMLInputElement).checked })}
                                                                    aria-label={t('enableStripedRows')}
                                                                />
                                                                <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                    {t('alternatingRowColors')}
                                                                </span>
                                                            </div>
                                                        </SettingRow>

                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label={t('highlightOnHover')}
                                                                tooltip={t('showAVisualHighlightWhenThe')}
                                                            />
                                                        )}>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Switch
                                                                    checked={section.tableConfig?.highlightOnHover !== false}
                                                                    onChange={(e) => updateSectionTableConfig(section.sectionId, { highlightOnHover: (e.target as HTMLInputElement).checked })}
                                                                    aria-label={t('enableHighlightOnHover')}
                                                                />
                                                                <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                    {t('highlightRowOnHover')}
                                                                </span>
                                                            </div>
                                                        </SettingRow>

                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label={t('compactMode')}
                                                                tooltip={t('reduceRowPaddingToFitMore')}
                                                            />
                                                        )}>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Switch
                                                                    checked={section.tableConfig?.compactMode || false}
                                                                    onChange={(e) => updateSectionTableConfig(section.sectionId, { compactMode: (e.target as HTMLInputElement).checked })}
                                                                    aria-label={t('enableCompactMode')}
                                                                />
                                                                <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                    {t('reduceRowPadding')}
                                                                </span>
                                                            </div>
                                                        </SettingRow>

                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label={t('pagination')}
                                                                tooltip={t('splitLargeTablesIntoPagesImproves')}
                                                            />
                                                        )}>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Switch
                                                                    checked={section.tableConfig?.enablePagination !== false}
                                                                    onChange={(e) => updateSectionTableConfig(section.sectionId, { enablePagination: (e.target as HTMLInputElement).checked })}
                                                                    aria-label={t('enablePagination')}
                                                                />
                                                                <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                    {t('paginateLargeTables')}
                                                                </span>
                                                            </div>
                                                        </SettingRow>

                                                        {section.tableConfig?.enablePagination !== false && (
                                                            <SettingRow flow="wrap" label={(
                                                                <TooltipLabel
                                                                    label={t('pageSize')}
                                                                    tooltip={t('numberOfRowsToDisplayPer')}
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
                                                        <div className="subsection-divider">{t('chartConfiguration')}</div>

                                                        {/* Chart Mode Toggle */}
                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label={t('chartMode')}
                                                                tooltip={t('groupByCategoryAggregatesRecordsBy')}
                                                            />
                                                        )}>
                                                            <Select
                                                                size="sm"
                                                                value={section.chartConfig?.chartMode || 'category'}
                                                                onChange={(e) => updateSectionChartConfig(section.sectionId, { chartMode: e.target.value as ChartMode })}
                                                                aria-label={t('chartMode2')}
                                                            >
                                                                <Option value="category">{t('groupByCategory')}</Option>
                                                                <Option value="fields">{t('compareFields')}</Option>
                                                            </Select>
                                                        </SettingRow>
                                                        <p className="hint-text" style={{ marginTop: '4px', marginBottom: '8px' }}>
                                                            {section.chartConfig?.chartMode === 'fields'
                                                                ? t('compareValuesOfMultipleNumericFields')
                                                                : t('groupRecordsByACategoryField')
                                                            }
                                                        </p>

                                                        {/* CATEGORY MODE */}
                                                        {(section.chartConfig?.chartMode || 'category') === 'category' && (
                                                            <>
                                                                {/* Category Field (X-axis / Labels) */}
                                                                <SettingRow flow="wrap" label={(
                                                                    <TooltipLabel
                                                                        label={t('categoryField')}
                                                                        tooltip={t('fieldUsedToGroupDataE')}
                                                                    />
                                                                )}>
                                                                    <Select
                                                                        size="sm"
                                                                        value={section.chartField || section.chartConfig?.categoryField || ''}
                                                                        onChange={(e) => {
                                                                            updateSection(section.sectionId, { chartField: e.target.value })
                                                                            updateSectionChartConfig(section.sectionId, { categoryField: e.target.value })
                                                                        }}
                                                                        aria-label={t('categoryFieldForChartLabels')}
                                                                    >
                                                                        <Option value="">{t('selectCategoryField')}</Option>
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
                                                                        label={t('aggregation')}
                                                                        tooltip={t('howToCalculateChartValuesCount')}
                                                                    />
                                                                )}>
                                                                    <Select
                                                                        size="sm"
                                                                        value={section.chartConfig?.aggregation || 'count'}
                                                                        onChange={(e) => updateSectionChartConfig(section.sectionId, { aggregation: e.target.value as AggregationType })}
                                                                        aria-label={t('aggregationType')}
                                                                    >
                                                                        <Option value="count">{t('countRecords')}</Option>
                                                                        <Option value="sum">{t('sumValues')}</Option>
                                                                        <Option value="avg">{t('averageValues')}</Option>
                                                                        <Option value="min">{t('minimumValue')}</Option>
                                                                        <Option value="max">{t('maximumValue')}</Option>
                                                                    </Select>
                                                                </SettingRow>

                                                                {/* Value Field (only shown when not using Count) */}
                                                                {section.chartConfig?.aggregation && section.chartConfig.aggregation !== 'count' && (
                                                                    <>
                                                                        <SettingRow flow="wrap" label={(
                                                                            <TooltipLabel
                                                                                label={t('valueField')}
                                                                                tooltip={t('numericFieldToAggregateSumAverage')}
                                                                            />
                                                                        )}>
                                                                            <Select
                                                                                size="sm"
                                                                                value={section.chartConfig?.valueField || ''}
                                                                                onChange={(e) => updateSectionChartConfig(section.sectionId, { valueField: e.target.value })}
                                                                                aria-label={t('numericValueFieldToAggregate')}
                                                                            >
                                                                                <Option value="">{t('selectNumericField')}</Option>
                                                                                {getSectionNumericFields(section).map(field => (
                                                                                    <Option key={field.name} value={field.name}>
                                                                                        {field.alias || field.name}
                                                                                    </Option>
                                                                                ))}
                                                                            </Select>
                                                                        </SettingRow>
                                                                        {getSectionNumericFields(section).length === 0 && (
                                                                            <NativeAlert type="warning" text={t('noNumericFieldsAvailableAddLayers')} style={{ marginBottom: '12px' }} />
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
                                                                        label={t('compareFields')}
                                                                        tooltip={t('selectNumericFieldsToCompareSide')}
                                                                    />
                                                                )}>
                                                                    <div style={{ width: '100%' }}>
                                                                        {getSectionNumericFields(section).length === 0 ? (
                                                                            <NativeAlert type="info" text={t('addDataLayersWithNumericFields')} />
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
                                                                                                    title={t('changeSeriesColor')}
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
                                                                    {t('selectFieldsToCompareEachField')}
                                                                </p>

                                                                {/* Optional grouping for field comparison */}
                                                                <SettingRow flow="wrap" label={(
                                                                    <TooltipLabel
                                                                        label={t('groupByOptional')}
                                                                        tooltip={t('optionallySplitFieldComparisonByA')}
                                                                    />
                                                                )}>
                                                                    <Select
                                                                        size="sm"
                                                                        value={section.chartConfig?.groupByField || ''}
                                                                        onChange={(e) => updateSectionChartConfig(section.sectionId, { groupByField: e.target.value })}
                                                                        aria-label={t('optionalGroupingField')}
                                                                    >
                                                                        <Option value="">{t('noGroupingSumAll')}</Option>
                                                                        {getSectionFields(section).map(field => (
                                                                            <Option key={field.name} value={field.name}>
                                                                                {field.alias || field.name}
                                                                            </Option>
                                                                        ))}
                                                                    </Select>
                                                                </SettingRow>
                                                                <p className="hint-text" style={{ marginTop: '4px', marginBottom: '8px' }}>
                                                                    {t('optionallyGroupTheFieldComparisonBy')}
                                                                </p>
                                                            </>
                                                        )}

                                                        {/* Chart Type */}
                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label={t('chartType')}
                                                                tooltip={t('barAreaLineBestForComparisons')}
                                                            />
                                                        )}>
                                                            <Select
                                                                size="sm"
                                                                value={section.chartConfig?.chartType || config.defaultChartConfig?.chartType || 'bar'}
                                                                onChange={(e) => updateSectionChartConfig(section.sectionId, { chartType: e.target.value as ChartType })}
                                                                aria-label={t('chartType2')}
                                                            >
                                                                <Option value="bar">{t('barChart')}</Option>
                                                                <Option value="pie">{t('pieChart')}</Option>
                                                                <Option value="donut">{t('donutChart')}</Option>
                                                                <Option value="area">{t('areaChart')}</Option>
                                                                <Option value="line">{t('lineChart')}</Option>
                                                                <Option value="radialBar">{t('radialBar')}</Option>
                                                            </Select>
                                                        </SettingRow>

                                                        {/* Sort Options - only for category mode */}
                                                        {(section.chartConfig?.chartMode || 'category') === 'category' && (
                                                            <div className="input-row">
                                                                <div style={{ flex: 1 }}>
                                                                    <SettingRow flow="wrap" label={(
                                                                        <TooltipLabel
                                                                            label={t('sortBy')}
                                                                            tooltip={t('howToOrderChartCategoriesBy')}
                                                                        />
                                                                    )}>
                                                                        <Select
                                                                            size="sm"
                                                                            value={section.chartConfig?.sortBy || 'value'}
                                                                            onChange={(e) => updateSectionChartConfig(section.sectionId, { sortBy: e.target.value as any })}
                                                                        >
                                                                            <Option value="value">{t('value')}</Option>
                                                                            <Option value="label">{t('label')}</Option>
                                                                            <Option value="none">{t('none')}</Option>
                                                                        </Select>
                                                                    </SettingRow>
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <SettingRow flow="wrap" label={(
                                                                        <TooltipLabel
                                                                            label={t('order')}
                                                                            tooltip={t('descendingShowsLargestValuesFirstAscending')}
                                                                        />
                                                                    )}>
                                                                        <Select
                                                                            size="sm"
                                                                            value={section.chartConfig?.sortOrder || 'desc'}
                                                                            onChange={(e) => updateSectionChartConfig(section.sectionId, { sortOrder: e.target.value as any })}
                                                                        >
                                                                            <Option value="desc">{t('descending')}</Option>
                                                                            <Option value="asc">{t('ascending')}</Option>
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
                                                                        label={t('maxCategories')}
                                                                        tooltip={t('limitNumberOfChartCategoriesDisplayed')}
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
                                                                    {t('extraCategoriesGroupedAsOther')}
                                                                </p>
                                                            </>
                                                        )}

                                                        {/* Stacked option for multi-series */}
                                                        {section.chartConfig?.chartMode === 'fields' && (section.chartConfig?.chartType === 'bar' || section.chartConfig?.chartType === 'area') && (
                                                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('stacked')} tooltip={t('stackBarAreaSegmentsOnTop')} />)}>
                                                                <Switch
                                                                    checked={section.chartConfig?.stacked || false}
                                                                    onChange={(e) => updateSectionChartConfig(section.sectionId, { stacked: (e.target as HTMLInputElement).checked })}
                                                                />
                                                            </SettingRow>
                                                        )}

                                                        {/* Display Options */}
                                                        <SettingRow flow="wrap" label={t('displayOptions')}>
                                                            <div className="display-options-row">
                                                                <label className="display-option">
                                                                    <Checkbox
                                                                        checked={section.chartConfig?.showLegend !== false}
                                                                        onChange={(e) => updateSectionChartConfig(section.sectionId, { showLegend: (e.target as HTMLInputElement).checked })}
                                                                    />
                                                                    <span>{t('legend')}</span>
                                                                </label>
                                                                <label className="display-option">
                                                                    <Checkbox
                                                                        checked={section.chartConfig?.showValues || false}
                                                                        onChange={(e) => updateSectionChartConfig(section.sectionId, { showValues: (e.target as HTMLInputElement).checked })}
                                                                    />
                                                                    <span>{t('values')}</span>
                                                                </label>
                                                                <label className="display-option">
                                                                    <Checkbox
                                                                        checked={section.chartConfig?.showGrid !== false}
                                                                        onChange={(e) => updateSectionChartConfig(section.sectionId, { showGrid: (e.target as HTMLInputElement).checked })}
                                                                    />
                                                                    <span>{t('grid')}</span>
                                                                </label>
                                                            </div>
                                                        </SettingRow>

                                                        {/* Chart Height */}
                                                        <SettingRow flow="wrap" label={(
                                                            <TooltipLabel
                                                                label={t('chartHeightPx')}
                                                                tooltip={t('heightOfTheChartInPixels')}
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
                                                                label={t('chartDescription')}
                                                                tooltip={t('optionalExplanatoryTextShownWithThe')}
                                                            />
                                                        )}>
                                                            <TextArea
                                                                value={section.chartConfig?.chartDescription || ''}
                                                                onChange={(e) => updateSectionChartConfig(section.sectionId, { chartDescription: e.target.value })}
                                                                placeholder={t('optionalHtmlDescriptionToExplainThe')}
                                                                style={{ width: '100%', minHeight: '60px', fontSize: '12px' }}
                                                            />
                                                        </SettingRow>

                                                        {section.chartConfig?.chartDescription && (
                                                            <SettingRow flow="wrap" label={(
                                                                <TooltipLabel
                                                                    label={t('descriptionPosition')}
                                                                    tooltip={t('whereToDisplayTheDescriptionRelative')}
                                                                />
                                                            )}>
                                                                <Select
                                                                    size="sm"
                                                                    value={section.chartConfig?.chartDescriptionPosition || 'after'}
                                                                    onChange={(e) => updateSectionChartConfig(section.sectionId, { chartDescriptionPosition: e.target.value as any })}
                                                                    style={{ width: '100%' }}
                                                                >
                                                                    <Option value="before">{t('aboveChart')}</Option>
                                                                    <Option value="after">{t('belowChart')}</Option>
                                                                </Select>
                                                            </SettingRow>
                                                        )}

                                                        {/* Exclude Chart from PDF */}
                                                        <SettingRow flow="wrap" label={t('showInWidgetOnly')}>
                                                            <Switch
                                                                checked={section.chartExcludeFromPdf || false}
                                                                onChange={(e) => updateSection(section.sectionId, { chartExcludeFromPdf: (e.target as HTMLInputElement).checked })}
                                                            />
                                                        </SettingRow>
                                                        <p className="hint-text" style={{ marginTop: '4px', marginBottom: '8px' }}>
                                                            {t('whenEnabledChartDisplaysInWidget')}
                                                        </p>

                                                        {getSectionFields(section).length === 0 && (
                                                            <NativeAlert
                                                                type="info"
                                                                text={t('addDataLayersBelowAndConfigure')}
                                                                style={{ marginTop: '8px' }}
                                                            />
                                                        )}
                                                    </>
                                                )}

                                                <div className="subsection-divider">{t('dataLayersLayersCount', { layersCount: layers.length })}</div>

                                                {layers.length === 0 ? (
                                                    <div className="empty-state" style={{ padding: '16px' }}>
                                                        <LayersIcon />
                                                        <span>{t('noLayersInThisSection')}</span>
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
                                                                            {layer.layerTitle || t('untitledLayer')}
                                                                        </span>
                                                                        <span className="item-badge" style={{ fontSize: '10px', padding: '1px 6px' }}>
                                                                            {(selectedFields.length !== 1 ? t('selectedFieldsCountFields', { selectedFieldsCount: selectedFields.length }) : t('selectedFieldsCountField', { selectedFieldsCount: selectedFields.length }))}
                                                                        </span>
                                                                    </div>
                                                                    <Tip title={t('removeLayer')} placement="top">
                                                                        <button
                                                                            className="delete-btn"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                removeLayerFromSection(section.sectionId, layer.layerId)
                                                                            }}
                                                                            aria-label={t('removeLayerTitle', { layerTitle: layer.layerTitle || 'layer' })}
                                                                        >
                                                                            <TrashIcon />
                                                                        </button>
                                                                    </Tip>
                                                                </div>

                                                                <div style={{ display: isLayerExpanded ? 'block' : 'none' }}>
                                                                    <div className="nested-item-content">
                                                                        <SettingRow flow="wrap" label={(
                                                                            <TooltipLabel
                                                                                label={t('dataSource')}
                                                                                tooltip={t('selectAFeatureLayerFromThe')}
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
                                                                                ) : <div style={{ padding: "8px", fontSize: "12px", color: "var(--sys-color-text-secondary)" }}>{t('loadingDataSourceSelector')}</div>}
                                                                            </div>
                                                                        </SettingRow>

                                                                        <div style={{ textAlign: 'center', color: 'var(--sys-color-text-light)', fontSize: '11px', margin: '8px 0' }}>
                                                                            {t('orUseDirectUrl')}
                                                                        </div>

                                                                        <SettingRow flow="wrap" label={(
                                                                            <TooltipLabel
                                                                                label={t('restServiceUrl')}
                                                                                tooltip={t('alternativeEnterADirectArcGISRest')}
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
                                                                                aria-label={t('restServiceUrl')}
                                                                            />
                                                                            {layer.layerUrl && !layer.dataSourceId && layerFields.length === 0 && (
                                                                                <button
                                                                                    className="add-btn"
                                                                                    style={{ marginTop: '4px', fontSize: '11px' }}
                                                                                    onClick={() => fetchFieldsFromUrl(layer.layerUrl)}
                                                                                    disabled={fetchLoading[`layer:${layer.layerUrl}`]}
                                                                                >
                                                                                    {fetchLoading[`layer:${layer.layerUrl}`] ? 'Loading...' : t('fetchFields')}
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
                                                                                label={t('layerTitle')}
                                                                                tooltip={t('displayNameForThisLayerIn')}
                                                                            />
                                                                        )}>

                                                                            <TextInput
                                                                                size="sm"
                                                                                value={layer.layerTitle}
                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, { layerTitle: e.target.value })}
                                                                                aria-label={t('layerTitle2')}
                                                                            />
                                                                        </SettingRow>

                                                                        <SettingRow flow="wrap" label={(
                                                                            <TooltipLabel
                                                                                label={t('defaultExpanded')}
                                                                                tooltip={t('controlsWhetherThisDataLayerIs')}
                                                                            />
                                                                        )}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                <Switch
                                                                                    checked={layer.expanded !== false}
                                                                                    onChange={(e) => updateLayer(section.sectionId, layer.layerId, { expanded: (e.target as HTMLInputElement).checked })}
                                                                                    aria-label={t('defaultExpandedState2')}
                                                                                />
                                                                                <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                    {layer.expanded !== false ? t('expandedByDefault') : t('collapsedByDefault')}
                                                                                </span>
                                                                            </div>
                                                                        </SettingRow>

                                                                        <SettingRow flow="wrap" label={(
                                                                            <TooltipLabel
                                                                                label={t('displayMode')}
                                                                                tooltip={t('howToDisplayRecordsWhenMultiple')}
                                                                            />
                                                                        )}>
                                                                            <Select
                                                                                size="sm"
                                                                                value={layer.displayMode || 'table'}
                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, { displayMode: e.target.value as any })}
                                                                                aria-label={t('displayMode2')}
                                                                            >
                                                                                <Option value="table">{t('table')}</Option>
                                                                                <Option value="list">{t('list')}</Option>
                                                                                <Option value="card">{t('cards')}</Option>
                                                                            </Select>
                                                                        </SettingRow>

                                                                        <SettingRow flow="wrap" label={(
                                                                            <TooltipLabel
                                                                                label={t('defaultSortField')}
                                                                                tooltip={t('selectAFieldToSortResults')}
                                                                            />
                                                                        )}>
                                                                            <Select
                                                                                size="sm"
                                                                                value={layer.defaultSortField || ''}
                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, { defaultSortField: e.target.value || undefined })}
                                                                                aria-label={t('defaultSortField2')}
                                                                            >
                                                                                <Option value="">{t('none')}</Option>
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
                                                                                    label={t('sortOrder')}
                                                                                    tooltip={t('chooseAscendingAZ09')}
                                                                                />
                                                                            )}>
                                                                                <Select
                                                                                    size="sm"
                                                                                    value={layer.defaultSortOrder || 'asc'}
                                                                                    onChange={(e) => updateLayer(section.sectionId, layer.layerId, { defaultSortOrder: e.target.value as any })}
                                                                                    aria-label={t('sortOrder2')}
                                                                                >
                                                                                    <Option value="asc">{t('ascendingAZ09Oldest')}</Option>
                                                                                    <Option value="desc">{t('descendingZA90Newest')}</Option>
                                                                                </Select>
                                                                            </SettingRow>
                                                                        )}

                                                                        {(layer.dataSourceId || layer.layerUrl) && (
                                                                            <>
                                                                                <SettingRow flow="wrap" label={(
                                                                                    <TooltipLabel
                                                                                        label={t('bufferDistance')}
                                                                                        tooltip={t('expandTheSearchAreaAroundThe')}
                                                                                    />
                                                                                )}>

                                                                                    <div className="input-row">
                                                                                        <NumericInput
                                                                                            size="sm"
                                                                                            value={layer.bufferDistance || 0}
                                                                                            min={0}
                                                                                            onChange={(value) => updateLayer(section.sectionId, layer.layerId, { bufferDistance: value })}
                                                                                            style={{ width: 80 }}
                                                                                            aria-label={t('bufferDistance2')}
                                                                                        />
                                                                                        <Select
                                                                                            size="sm"
                                                                                            value={layer.bufferUnit || 'feet'}
                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, { bufferUnit: e.target.value as any })}
                                                                                            style={{ width: 110 }}
                                                                                            aria-label={t('bufferUnit')}
                                                                                        >
                                                                                            <Option value="feet">{t('feet')}</Option>
                                                                                            <Option value="meters">{t('meters')}</Option>
                                                                                            <Option value="miles">{t('miles')}</Option>
                                                                                            <Option value="kilometers">{t('kilometers')}</Option>
                                                                                        </Select>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                {/* No Results Message Configuration */}
                                                                                <div className="subsection-divider" style={{ marginTop: '12px' }}>{t('noResultsMessage')}</div>

                                                                                <SettingRow flow="wrap" label={(
                                                                                    <TooltipLabel
                                                                                        label={t('useCustomText')}
                                                                                        tooltip={t('whenEnabledDisplayCustomTextInstead')}
                                                                                    />
                                                                                )}>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                        <Switch
                                                                                            checked={layer.useCustomNoResultsText || false}
                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, { useCustomNoResultsText: (e.target as HTMLInputElement).checked })}
                                                                                            aria-label={t('useCustomNoResultsText')}
                                                                                        />
                                                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                            {t('useCustomMessageWhenNoFeatures')}
                                                                                        </span>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                {layer.useCustomNoResultsText && (
                                                                                    <SettingRow flow="wrap" label={(
                                                                                        <TooltipLabel
                                                                                            label={t('customMessage')}
                                                                                            tooltip={t('enterTheTextToDisplayWhen')}
                                                                                        />
                                                                                    )}>
                                                                                        <TextInput
                                                                                            size="sm"
                                                                                            value={layer.customNoResultsText || ''}
                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, { customNoResultsText: e.target.value })}
                                                                                            placeholder={t('eGNoZoningRestrictionsApply')}
                                                                                            style={{ width: '100%' }}
                                                                                            aria-label={t('customNoResultsMessage')}
                                                                                        />
                                                                                        <p className="hint-text" style={{ marginTop: '4px', marginBottom: 0 }}>
                                                                                            {t('leaveEmptyToHideTheMessage')}
                                                                                        </p>
                                                                                    </SettingRow>
                                                                                )}

                                                                                {/* Row Interaction with Map */}
                                                                                <div className="subsection-divider" style={{ marginTop: '12px' }}>{t('rowMapInteraction')}</div>

                                                                                <SettingRow flow="wrap" label={(
                                                                                    <TooltipLabel
                                                                                        label={t('showAllOnMap')}
                                                                                        tooltip={t('automaticallyDisplayAllQueriedFeaturesFrom')}
                                                                                    />
                                                                                )}>

                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                        <Switch
                                                                                            checked={layer.showAllOnMap || false}
                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, { showAllOnMap: (e.target as HTMLInputElement).checked })}
                                                                                            aria-label={t('showAllFeaturesOnMap')}
                                                                                        />
                                                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                            {t('displayAllFeaturesOnMapWhen')}
                                                                                        </span>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                <SettingRow flow="wrap" label={(
                                                                                    <TooltipLabel
                                                                                        label={t('highlightOnHover')}
                                                                                        tooltip={t('drawFeatureOutlineOnMapWhen')}
                                                                                    />
                                                                                )}>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                        <Switch
                                                                                            checked={layer.enableRowHighlight || false}
                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, { enableRowHighlight: (e.target as HTMLInputElement).checked })}
                                                                                            aria-label={t('enableRowHighlightOnHover')}
                                                                                        />
                                                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                            {t('highlightGeometryWhenHoveringRows')}
                                                                                        </span>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                <SettingRow flow="wrap" label={(
                                                                                    <TooltipLabel
                                                                                        label={t('zoomOnClick')}
                                                                                        tooltip={t('panAndZoomMapToFeature')}
                                                                                    />
                                                                                )}>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                        <Switch
                                                                                            checked={layer.enableRowZoom || false}
                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, { enableRowZoom: (e.target as HTMLInputElement).checked })}
                                                                                            aria-label={t('enableZoomOnRowClick')}
                                                                                        />
                                                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                            {t('zoomToFeatureWhenClickingRows')}
                                                                                        </span>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                {layer.enableRowZoom && (
                                                                                    <SettingRow flow="wrap" label={(
                                                                                        <TooltipLabel
                                                                                            label={t('zoomScale')}
                                                                                            tooltip={t('mapScaleWhenZoomingToFeatures')}
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
                                                                                                {t('smallerMoreZoomedIn')}
                                                                                            </span>
                                                                                        </div>
                                                                                    </SettingRow>
                                                                                )}

                                                                                {layer.showAllOnMap && (
                                                                                    <SettingRow flow="wrap" label={(
                                                                                        <TooltipLabel
                                                                                            label={t('showAllColor')}
                                                                                            tooltip={t('colorUsedToDisplayAllFeatures')}
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
                                                                                            label={t('highlightColor')}
                                                                                            tooltip={t('colorUsedToHighlightFeaturesOn')}
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
                                                                                            label={t('fillOpacity')}
                                                                                            tooltip={t('polygonInteriorTransparency0OutlineOnly')}
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
                                                                                                {t('forPolygonFills01')}
                                                                                            </span>
                                                                                        </div>
                                                                                    </SettingRow>
                                                                                )}

                                                                                {/* Nearby Display Mode */}
                                                                                <div className="subsection-divider" style={{ marginTop: '12px' }}>{t('nearbyDisplayMode')}</div>
                                                                                <p className="hint-text" style={{ marginBottom: '8px' }}>
                                                                                    {t('displayFeaturesSortedByDistanceWith')}
                                                                                </p>

                                                                                <SettingRow flow="wrap" label={(
                                                                                    <TooltipLabel
                                                                                        label={t('enableNearbyMode')}
                                                                                        tooltip={t('showsFeaturesAsDistanceSortedCards')}
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
                                                                                            aria-label={t('enableNearbyModeForThisLayer')}
                                                                                        />
                                                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                            {t('showsDistanceSortedListInsteadOf')}
                                                                                        </span>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                {layer.nearbyConfig?.enabled && (
                                                                                    <div style={{ marginLeft: '12px', paddingLeft: '12px', borderLeft: '2px solid var(--sys-color-primary-main)' }}>
                                                                                        {/* Title Field */}
                                                                                        <SettingRow flow="wrap" label={(
                                                                                            <TooltipLabel
                                                                                                label={t('titleField')}
                                                                                                tooltip={t('mainDisplayFieldForEachNearby')}
                                                                                            />
                                                                                        )}>
                                                                                            <Select
                                                                                                size="sm"
                                                                                                value={layer.nearbyConfig?.titleField || ''}
                                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                    nearbyConfig: { ...layer.nearbyConfig, titleField: e.target.value }
                                                                                                })}
                                                                                            >
                                                                                                <Option value="">{t('selectField')}</Option>
                                                                                                {layerFields.map(field => (
                                                                                                    <Option key={field.name} value={field.name}>{field.alias || field.name}</Option>
                                                                                                ))}
                                                                                            </Select>
                                                                                        </SettingRow>

                                                                                        {/* Subtitle Field */}
                                                                                        <SettingRow flow="wrap" label={(
                                                                                            <TooltipLabel
                                                                                                label={t('subtitleField')}
                                                                                                tooltip={t('secondaryInfoShownBelowTitleE')}
                                                                                            />
                                                                                        )}>
                                                                                            <Select
                                                                                                size="sm"
                                                                                                value={layer.nearbyConfig?.subtitleField || ''}
                                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                    nearbyConfig: { ...layer.nearbyConfig, subtitleField: e.target.value }
                                                                                                })}
                                                                                            >
                                                                                                <Option value="">{t('none2')}</Option>
                                                                                                {layerFields.map(field => (
                                                                                                    <Option key={field.name} value={field.name}>{field.alias || field.name}</Option>
                                                                                                ))}
                                                                                            </Select>
                                                                                        </SettingRow>

                                                                                        {layer.nearbyConfig?.subtitleField && (
                                                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                                                <div style={{ flex: 1 }}>
                                                                                                    <SettingRow flow="wrap" label={t('prefix')}>
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
                                                                                                    <SettingRow flow="wrap" label={t('suffix')}>
                                                                                                        <TextInput
                                                                                                            size="sm"
                                                                                                            value={layer.nearbyConfig?.subtitleSuffix || ''}
                                                                                                            placeholder={t('eGAcres')}
                                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                                nearbyConfig: { ...layer.nearbyConfig, subtitleSuffix: e.target.value }
                                                                                                            })}
                                                                                                        />
                                                                                                    </SettingRow>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}

                                                                                        {/* Link URL Field */}
                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('linkUrlField')} tooltip={t('optionalFieldContainingAUrlWhen')} />)}>
                                                                                            <Select
                                                                                                size="sm"
                                                                                                value={layer.nearbyConfig?.linkUrlField || ''}
                                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                    nearbyConfig: { ...layer.nearbyConfig, linkUrlField: e.target.value }
                                                                                                })}
                                                                                            >
                                                                                                <Option value="">{t('none2')}</Option>
                                                                                                {layerFields.map(field => (
                                                                                                    <Option key={field.name} value={field.name}>{field.alias || field.name}</Option>
                                                                                                ))}
                                                                                            </Select>
                                                                                        </SettingRow>

                                                                                        {/* Query Settings */}
                                                                                        <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 500, color: 'var(--sys-color-text-dark)' }}>
                                                                                            {t('querySettings')}
                                                                                        </div>

                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('maxFeatures')} tooltip={t('maximumNumberOfNearbyFeaturesTo')} />)}>
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
                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('searchRadius')} tooltip={t('maximumDistanceToSearchForNearby')} />)}>
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
                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('unit')} tooltip={t('distanceUnitForTheSearchRadius')} />)}>
                                                                                                    <Select
                                                                                                        size="sm"
                                                                                                        value={layer.nearbyConfig?.searchRadiusUnit || 'miles'}
                                                                                                        onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                            nearbyConfig: { ...layer.nearbyConfig, searchRadiusUnit: e.target.value as any }
                                                                                                        })}
                                                                                                    >
                                                                                                        <Option value="feet">{t('feet')}</Option>
                                                                                                        <Option value="meters">{t('meters')}</Option>
                                                                                                        <Option value="miles">{t('miles')}</Option>
                                                                                                        <Option value="kilometers">{t('kilometers')}</Option>
                                                                                                    </Select>
                                                                                                </SettingRow>
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* Distance Display */}
                                                                                        <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 500, color: 'var(--sys-color-text-dark)' }}>
                                                                                            {t('distanceDisplay')}
                                                                                        </div>

                                                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                                                            <div style={{ flex: 1 }}>
                                                                                                <SettingRow flow="wrap" label={t('displayUnit')}>
                                                                                                    <Select
                                                                                                        size="sm"
                                                                                                        value={layer.nearbyConfig?.distanceUnit || 'miles'}
                                                                                                        onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                            nearbyConfig: { ...layer.nearbyConfig, distanceUnit: e.target.value as any }
                                                                                                        })}
                                                                                                    >
                                                                                                        <Option value="feet">{t('feet')}</Option>
                                                                                                        <Option value="meters">{t('meters')}</Option>
                                                                                                        <Option value="miles">{t('miles')}</Option>
                                                                                                        <Option value="kilometers">{t('kilometers')}</Option>
                                                                                                    </Select>
                                                                                                </SettingRow>
                                                                                            </div>
                                                                                            <div style={{ flex: 1 }}>
                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('precision')} tooltip={t('numberOfDecimalPlacesForDistance')} />)}>
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

                                                                                        <SettingRow flow="no-wrap" label={t('showDistanceBadge')}>
                                                                                            <Switch
                                                                                                checked={layer.nearbyConfig?.showDistanceBadge !== false}
                                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                    nearbyConfig: { ...layer.nearbyConfig, showDistanceBadge: (e.target as HTMLInputElement).checked }
                                                                                                })}
                                                                                            />
                                                                                        </SettingRow>

                                                                                        {/* PDF Settings */}
                                                                                        <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 500, color: 'var(--sys-color-text-dark)' }}>
                                                                                            {t('pdfExport')}
                                                                                        </div>

                                                                                        <SettingRow flow="no-wrap" label={t('includeInPdf')}>
                                                                                            <Switch
                                                                                                checked={layer.nearbyConfig?.includeInPdf !== false}
                                                                                                onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                    nearbyConfig: { ...layer.nearbyConfig, includeInPdf: (e.target as HTMLInputElement).checked }
                                                                                                })}
                                                                                            />
                                                                                        </SettingRow>

                                                                                        {layer.nearbyConfig?.includeInPdf !== false && (
                                                                                            <SettingRow flow="wrap" label={t('pdfMaxFeatures')}>
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
                                                                                        <span>{t('fieldsToDisplay')}</span>
                                                                                        {selectedFields.length > 1 && layerFields.length > 0 && (() => {
                                                                                            const serviceOrder = layerFields.map(f => f.name)
                                                                                            const selectedInServiceOrder = selectedFields
                                                                                                .map(f => f.name)
                                                                                                .filter(n => serviceOrder.includes(n))
                                                                                            const expectedOrder = serviceOrder.filter(n => selectedInServiceOrder.includes(n))
                                                                                            const isInServiceOrder = selectedInServiceOrder.every((n, i) => n === expectedOrder[i])

                                                                                            return isInServiceOrder ? (
                                                                                                <span style={{ fontSize: '10px', color: 'var(--sys-color-success-main, #4caf50)' }}>
                                                                                                    {t('serviceOrder')}
                                                                                                </span>
                                                                                            ) : (
                                                                                                <Tip title={t('reorderSelectedFieldsToMatchService')} placement="top">
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
                                                                                                        aria-label={t('sortFieldsToServiceOrder')}
                                                                                                    >
                                                                                                        {t('resetToServiceOrder')}
                                                                                                    </button>
                                                                                                </Tip>
                                                                                            )
                                                                                        })()}
                                                                                    </div>
                                                                                )}>
                                                                                    {/* Selected field order: drag to reorder. Live preview of report order; the arrows above still work too. */}
                                                                                    {selectedFields.length > 1 && (
                                                                                        <div className="selected-field-order" role="list" aria-label={t('selectedFieldDisplayOrderDragAn')}>
                                                                                            <div className="selected-field-order-label">{t('selectedFieldOrderDragToReorder')}</div>
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
                                                                                                    ? t('clickFetchFieldsOrEnterUrl')
                                                                                                    : t('noFieldsAvailableSelectAData')}
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
                                                                                                                aria-label={t('selectName', { name: field.name })}
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
                                                                                                                        title={t('moveUp')}
                                                                                                                        aria-label={t('moveNameUp', { name: field.name })}
                                                                                                                    >▲</button>
                                                                                                                    <span
                                                                                                                        style={{
                                                                                                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                                                                            width: '18px', height: '18px', borderRadius: '50%',
                                                                                                                            backgroundColor: 'var(--sys-color-primary-main, #1976d2)',
                                                                                                                            color: '#fff', fontSize: '10px', fontWeight: 600, lineHeight: 1
                                                                                                                        }}
                                                                                                                        title={t('displayOrderDisplayOrder', { displayOrder })}
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
                                                                                                                        title={t('moveDown')}
                                                                                                                        aria-label={t('moveNameDown', { name: field.name })}
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
                                                                                                                    <Label style={{ fontSize: '11px', marginBottom: '2px', display: 'block' }}>{t('displayAlias2')}</Label>
                                                                                                                    <TextInput
                                                                                                                        size="sm"
                                                                                                                        value={currentAlias}
                                                                                                                        onChange={(e) => updateFieldAlias(section.sectionId, layer.layerId, field.name, e.target.value)}
                                                                                                                        placeholder={t('displayAlias')}
                                                                                                                        aria-label={t('aliasForName', { name: field.name })}
                                                                                                                    />
                                                                                                                </div>

                                                                                                                {/* Format type selector */}
                                                                                                                <div style={{ marginBottom: '8px' }}>
                                                                                                                    <Label style={{ fontSize: '11px', marginBottom: '2px', display: 'block' }}>{t('formatType')}</Label>
                                                                                                                    <Select
                                                                                                                        size="sm"
                                                                                                                        value={currentFormat.type || 'auto'}
                                                                                                                        onChange={(e) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { type: e.target.value as any })}
                                                                                                                        aria-label={t('formatType2')}
                                                                                                                    >
                                                                                                                        <Option value="auto">{t('auto')}</Option>
                                                                                                                        <Option value="text">{t('text')}</Option>
                                                                                                                        <Option value="number">{t('number')}</Option>
                                                                                                                        <Option value="date">{t('date')}</Option>
                                                                                                                        <Option value="link">{t('link')}</Option>
                                                                                                                    </Select>
                                                                                                                </div>

                                                                                                                {/* Number formatting options */}
                                                                                                                {(currentFormat.type === 'number' || currentFormat.type === 'auto') && (
                                                                                                                    <div style={{ marginBottom: '8px' }}>
                                                                                                                        <Label style={{ fontSize: '11px', marginBottom: '2px', display: 'block' }}>{t('numberFormat')}</Label>
                                                                                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                                                                                            <Select
                                                                                                                                size="sm"
                                                                                                                                value={currentFormat.numberFormat || 'default'}
                                                                                                                                onChange={(e) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { numberFormat: e.target.value as any })}
                                                                                                                                style={{ width: '100px' }}
                                                                                                                                aria-label={t('numberFormat2')}
                                                                                                                            >
                                                                                                                                <Option value="default">{t('default')}</Option>
                                                                                                                                <Option value="none">{t('noFormat')}</Option>
                                                                                                                                <Option value="decimal">{t('decimal')}</Option>
                                                                                                                                <Option value="currency">{t('currency')}</Option>
                                                                                                                                <Option value="percent">{t('percent')}</Option>
                                                                                                                            </Select>
                                                                                                                            <Label style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                                                                                <Checkbox
                                                                                                                                    checked={currentFormat.useGrouping !== false}
                                                                                                                                    onChange={(e) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { useGrouping: (e.target as HTMLInputElement).checked })}
                                                                                                                                    aria-label={t('useThousandSeparators')}
                                                                                                                                />
                                                                                                                                {t('commas')}
                                                                                                                            </Label>
                                                                                                                            {(currentFormat.numberFormat === 'decimal' || currentFormat.numberFormat === 'currency') && (
                                                                                                                                <NumericInput
                                                                                                                                    size="sm"
                                                                                                                                    value={currentFormat.decimalPlaces ?? 2}
                                                                                                                                    min={0}
                                                                                                                                    max={10}
                                                                                                                                    onChange={(value) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { decimalPlaces: value })}
                                                                                                                                    style={{ width: '50px' }}
                                                                                                                                    aria-label={t('decimalPlaces')}
                                                                                                                                />
                                                                                                                            )}
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                )}

                                                                                                                {/* Date formatting options */}
                                                                                                                {currentFormat.type === 'date' && (
                                                                                                                    <div style={{ marginBottom: '8px' }}>
                                                                                                                        <Label style={{ fontSize: '11px', marginBottom: '2px', display: 'block' }}>{t('dateFormat')}</Label>
                                                                                                                        <Select
                                                                                                                            size="sm"
                                                                                                                            value={currentFormat.dateFormat || 'default'}
                                                                                                                            onChange={(e) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { dateFormat: e.target.value as any })}
                                                                                                                            aria-label={t('dateFormat2')}
                                                                                                                        >
                                                                                                                            <Option value="default">{t('default')}</Option>
                                                                                                                            <Option value="short">{t('short1124')}</Option>
                                                                                                                            <Option value="medium">{t('mediumJan12024')}</Option>
                                                                                                                            <Option value="long">{t('longJanuary12024')}</Option>
                                                                                                                            <Option value="year-only">{t('yearOnly2024')}</Option>
                                                                                                                        </Select>
                                                                                                                    </div>
                                                                                                                )}

                                                                                                                {/* Text formatting options */}
                                                                                                                {currentFormat.type === 'text' && (
                                                                                                                    <div style={{ marginBottom: '8px' }}>
                                                                                                                        <Label style={{ fontSize: '11px', marginBottom: '2px', display: 'block' }}>{t('textFormat')}</Label>
                                                                                                                        <Select
                                                                                                                            size="sm"
                                                                                                                            value={currentFormat.textFormat || 'default'}
                                                                                                                            onChange={(e) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { textFormat: e.target.value as any })}
                                                                                                                            aria-label={t('textFormat2')}
                                                                                                                        >
                                                                                                                            <Option value="default">{t('default')}</Option>
                                                                                                                            <Option value="uppercase">{t('uppercase')}</Option>
                                                                                                                            <Option value="lowercase">{t('lowercase')}</Option>
                                                                                                                            <Option value="titlecase">{t('titleCase')}</Option>
                                                                                                                        </Select>
                                                                                                                    </div>
                                                                                                                )}

                                                                                                                {/* Link display text option */}
                                                                                                                {currentFormat.type === 'link' && (
                                                                                                                    <div style={{ marginBottom: '8px' }}>
                                                                                                                        <Label style={{ fontSize: '11px', marginBottom: '2px', display: 'block' }}>{t('linkDisplayText')}</Label>
                                                                                                                        <TextInput
                                                                                                                            size="sm"
                                                                                                                            value={currentFormat.linkText || ''}
                                                                                                                            onChange={(e) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { linkText: e.target.value })}
                                                                                                                            placeholder={t('eGViewDocument')}
                                                                                                                            aria-label={t('linkDisplayText2')}
                                                                                                                        />
                                                                                                                        <p className="hint-text" style={{ marginTop: '4px', marginBottom: 0 }}>
                                                                                                                            {t('textShownInsteadOfUrlLeave')}
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
                                                                                                                                aria-label={t('enableBaseUrl')}
                                                                                                                            />
                                                                                                                            <Label style={{ fontSize: '11px', cursor: 'pointer' }}>
                                                                                                                                {t('prependBaseUrl')}
                                                                                                                            </Label>
                                                                                                                            <Tip title={t('enableToPrependABaseUrl')} placement="top">
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
                                                                                                                                    aria-label={t('baseUrl')}
                                                                                                                                />
                                                                                                                                <p className="hint-text" style={{ marginTop: '4px', marginBottom: 0 }}>
                                                                                                                                    {t('urlPrefixAddedBeforeFieldValue')}
                                                                                                                                </p>
                                                                                                                            </>
                                                                                                                        )}
                                                                                                                    </div>
                                                                                                                )}

                                                                                                                {/* Prefix/Suffix */}
                                                                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                                                                    <div style={{ flex: 1 }}>
                                                                                                                        <Label style={{ fontSize: '11px', marginBottom: '2px', display: 'block' }}>{t('prefix')}</Label>
                                                                                                                        <TextInput
                                                                                                                            size="sm"
                                                                                                                            value={currentFormat.prefix || ''}
                                                                                                                            onChange={(e) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { prefix: e.target.value })}
                                                                                                                            placeholder="$"
                                                                                                                            aria-label={t('valuePrefix')}
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                    <div style={{ flex: 1 }}>
                                                                                                                        <Label style={{ fontSize: '11px', marginBottom: '2px', display: 'block' }}>{t('suffix')}</Label>
                                                                                                                        <TextInput
                                                                                                                            size="sm"
                                                                                                                            value={currentFormat.suffix || ''}
                                                                                                                            onChange={(e) => updateFieldFormat(section.sectionId, layer.layerId, field.name, { suffix: e.target.value })}
                                                                                                                            placeholder="%"
                                                                                                                            aria-label={t('valueSuffix')}
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
                                                                                                                aria-label={t('excludeNameFromPdf', { name: field.name })}
                                                                                                            />
                                                                                                            <Label style={{ fontSize: '11px', cursor: 'pointer' }}>
                                                                                                                {t('excludeFromPdf')}
                                                                                                            </Label>
                                                                                                            <Tip title={t('fieldWillDisplayInWidgetBut')} placement="top">
                                                                                                                <span style={{ color: 'var(--sys-color-text-light)', cursor: 'help' }}>ⓘ</span>
                                                                                                            </Tip>
                                                                                                        </div>

                                                                                                        {/* Hide NULL values toggle */}
                                                                                                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                            <Switch
                                                                                                                checked={getFieldHideNull(section.sectionId, layer.layerId, field.name)}
                                                                                                                onChange={() => toggleFieldHideNull(section.sectionId, layer.layerId, field.name)}
                                                                                                                aria-label={t('hideNameWhenNull', { name: field.name })}
                                                                                                            />
                                                                                                            <Label style={{ fontSize: '11px', cursor: 'pointer' }}>
                                                                                                                {t('hideWhenNull')}
                                                                                                            </Label>
                                                                                                            <Tip title={t('hideThisFieldWhenValueIs')} placement="top">
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
                                                                                <div className="subsection-divider" style={{ marginTop: '16px' }}>{t('nearbyDisplayMode')}</div>
                                                                                <p className="hint-text" style={{ marginTop: '4px', marginBottom: '8px' }}>
                                                                                    {t('displayFeaturesAsADistanceSorted')}
                                                                                </p>

                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('enableNearbyMode')} tooltip={t('displayFeaturesAsADistanceSorted2')} />)}>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                        <Switch
                                                                                            checked={layer.nearbyConfig?.enabled || false}
                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, {
                                                                                                nearbyConfig: {
                                                                                                    ...layer.nearbyConfig,
                                                                                                    enabled: (e.target as HTMLInputElement).checked
                                                                                                }
                                                                                            } as any)}
                                                                                            aria-label={t('enableNearbyModeForThisLayer')}
                                                                                        />
                                                                                        <Tip title={t('showsFeaturesSortedByDistanceFrom')} placement="top">
                                                                                            <span style={{ color: 'var(--sys-color-text-light)', cursor: 'help' }}>ⓘ</span>
                                                                                        </Tip>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                {layer.nearbyConfig?.enabled && (
                                                                                    <div style={{ marginLeft: '8px', paddingLeft: '8px', borderLeft: '2px solid var(--sys-color-primary-main)' }}>
                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('titleField')} tooltip={t('fieldDisplayedAsTheMainHeading')} />)}>
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
                                                                                                <Option value="">{t('selectField')}</Option>
                                                                                                {layerFields.map(field => (
                                                                                                    <Option key={field.name} value={field.name}>{field.alias || field.name}</Option>
                                                                                                ))}
                                                                                            </Select>
                                                                                            <span style={{ fontSize: '10px', color: 'var(--sys-color-text-light)', display: 'block', marginTop: '4px' }}>
                                                                                                {t('mainDisplayNameRequired')}
                                                                                            </span>
                                                                                        </SettingRow>

                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('subtitleField')} tooltip={t('optionalFieldForSecondaryInformationShown')} />)}>
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
                                                                                                <Option value="">{t('none2')}</Option>
                                                                                                {layerFields.map(field => (
                                                                                                    <Option key={field.name} value={field.name}>{field.alias || field.name}</Option>
                                                                                                ))}
                                                                                            </Select>
                                                                                        </SettingRow>

                                                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                                                            <div style={{ flex: 1 }}>
                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('subtitlePrefix')} tooltip={t('textAddedBeforeTheSubtitleValue')} />)}>
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
                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('subtitleSuffix')} tooltip={t('textAddedAfterTheSubtitleValue')} />)}>
                                                                                                    <TextInput
                                                                                                        size="sm"
                                                                                                        value={layer.nearbyConfig?.subtitleSuffix || ''}
                                                                                                        placeholder={t('eGAcres')}
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

                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('linkUrlField')} tooltip={t('fieldContainingAUrlMakesThe')} />)}>
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
                                                                                                <Option value="">{t('none2')}</Option>
                                                                                                {layerFields.map(field => (
                                                                                                    <Option key={field.name} value={field.name}>{field.alias || field.name}</Option>
                                                                                                ))}
                                                                                            </Select>
                                                                                            <span style={{ fontSize: '10px', color: 'var(--sys-color-text-light)', display: 'block', marginTop: '4px' }}>
                                                                                                {t('fieldWithUrlToOpenOn')}
                                                                                            </span>
                                                                                        </SettingRow>

                                                                                        <div style={{ marginTop: '12px', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>{t('searchSettings')}</div>

                                                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                                                            <div style={{ flex: 1 }}>
                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('searchRadius')} tooltip={t('maximumDistanceToSearchForNearby2')} />)}>
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
                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('unit')} tooltip={t('distanceUnitForTheRadius')} />)}>
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
                                                                                                        <Option value="feet">{t('feet')}</Option>
                                                                                                        <Option value="meters">{t('meters')}</Option>
                                                                                                        <Option value="miles">{t('miles')}</Option>
                                                                                                        <Option value="kilometers">{t('kilometers')}</Option>
                                                                                                    </Select>
                                                                                                </SettingRow>
                                                                                            </div>
                                                                                        </div>

                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('maxFeatures')} tooltip={t('maximumNumberOfNearbyFeaturesTo2')} />)}>
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

                                                                                        <div style={{ marginTop: '12px', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>{t('distanceDisplay')}</div>

                                                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                                                            <div style={{ flex: 1 }}>
                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('distanceUnit')} tooltip={t('unitForDisplayingTheCalculatedDistance')} />)}>
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
                                                                                                        <Option value="feet">{t('feet')}</Option>
                                                                                                        <Option value="meters">{t('meters')}</Option>
                                                                                                        <Option value="miles">{t('miles')}</Option>
                                                                                                        <Option value="kilometers">{t('kilometers')}</Option>
                                                                                                    </Select>
                                                                                                </SettingRow>
                                                                                            </div>
                                                                                            <div style={{ flex: 1 }}>
                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('precision')} tooltip={t('decimalPlacesForDistanceDisplay')} />)}>
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

                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('showDistanceBadge')} tooltip={t('displayABadgeOnTheRight')} />)}>
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

                                                                                        <div style={{ marginTop: '12px', fontSize: '11px', fontWeight: 500, marginBottom: '6px' }}>{t('pdfExport')}</div>

                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('includeInPdf')} tooltip={t('whetherToIncludeThisNearbyFeatures')} />)}>
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
                                                                                            <SettingRow flow="wrap" label={t('pdfMaxFeatures')}>
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
                                                                                <div className="subsection-divider" style={{ marginTop: '16px' }}>{t('layerInfoContentOptional')}</div>
                                                                                <p className="hint-text" style={{ marginTop: '4px', marginBottom: '8px' }}>
                                                                                    {t('addSupplementaryTextContactInfoLinks')}
                                                                                </p>

                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('richTextPosition')} tooltip={t('showTheRichTextContentBefore')} />)}>
                                                                                    <div className="position-buttons">
                                                                                        <button
                                                                                            className={`position-btn ${(layer.layerRichTextPosition || 'after') === 'before' ? 'active' : ''}`}
                                                                                            onClick={() => updateLayer(section.sectionId, layer.layerId, { layerRichTextPosition: 'before' })}
                                                                                        >{t('beforeData')}</button>
                                                                                        <button
                                                                                            className={`position-btn ${(layer.layerRichTextPosition || 'after') === 'after' ? 'active' : ''}`}
                                                                                            onClick={() => updateLayer(section.sectionId, layer.layerId, { layerRichTextPosition: 'after' })}
                                                                                        >{t('afterData')}</button>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('htmlContent')} tooltip={t('richTextContentSupportingHtmlFormatting')} />)}>
                                                                                    <textarea
                                                                                        className="rich-text-editor"
                                                                                        value={layer.layerRichTextContent || ''}
                                                                                        onChange={(e) => updateLayer(section.sectionId, layer.layerId, { layerRichTextContent: e.target.value })}
                                                                                        placeholder="<p>For more information, contact...</p>"
                                                                                        aria-label={t('layerRichTextHtmlContent')}
                                                                                    />
                                                                                    <div className="rich-text-help">
                                                                                        <strong>{t('supportedHtml')}</strong><br />
                                                                                        {t('links')} <code>&lt;a href="url"&gt;text&lt;/a&gt;</code><br />
                                                                                        {t('email')} <code>&lt;a href="mailto:email"&gt;text&lt;/a&gt;</code><br />
                                                                                        {t('phone')} <code>&lt;a href="tel:number"&gt;text&lt;/a&gt;</code><br />
                                                                                        {t('bold')} <code>&lt;strong&gt;text&lt;/strong&gt;</code><br />
                                                                                        <strong>{t('fieldPlaceholders')}</strong> <code>{'{'}FieldName{'}'}</code><br />
                                                                                        <em>{t('usesFieldsFromThisLayerS')}</em>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                {/* Exclude layer rich text from PDF toggle */}
                                                                                <SettingRow flow="wrap" label={t('excludeFromPdf')}>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                        <Switch
                                                                                            checked={layer.layerRichTextExcludeFromPdf || false}
                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, { layerRichTextExcludeFromPdf: (e.target as HTMLInputElement).checked })}
                                                                                            aria-label={t('excludeLayerRichTextFromPdf')}
                                                                                        />
                                                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                            {t('showInWidgetOnlyNotIn')}
                                                                                        </span>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                {/* Hide layer rich text when no features toggle */}
                                                                                <SettingRow flow="wrap" label={t('hideWhenNoFeatures')}>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                        <Switch
                                                                                            checked={layer.hideLayerRichTextWhenNoResults || false}
                                                                                            onChange={(e) => updateLayer(section.sectionId, layer.layerId, { hideLayerRichTextWhenNoResults: (e.target as HTMLInputElement).checked })}
                                                                                            aria-label={t('hideLayerRichTextWhenNo')}
                                                                                        />
                                                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                            {t('onlyShowIfThisLayerHas')}
                                                                                        </span>
                                                                                    </div>
                                                                                </SettingRow>

                                                                                {/* Layer Action Buttons */}
                                                                                <div className="button-list">
                                                                                    {toMutableRichTextButtons(layer.layerRichTextButtons || []).map((button) => (
                                                                                        <div className="button-item" key={button.buttonId}>
                                                                                            <div className="button-item-header">
                                                                                                <Label style={{ fontSize: '11px', fontWeight: 600 }}>
                                                                                                    <LinkIcon /> {t('actionButton')}
                                                                                                </Label>
                                                                                                <button
                                                                                                    className="delete-btn"
                                                                                                    onClick={() => removeLayerRichTextButton(section.sectionId, layer.layerId, button.buttonId)}
                                                                                                    aria-label={t('removeButton')}
                                                                                                >
                                                                                                    <TrashIcon />
                                                                                                </button>
                                                                                            </div>
                                                                                            <div className="button-item-row">
                                                                                                <div>
                                                                                                    <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>{t('label')}</Label>
                                                                                                    <TextInput
                                                                                                        size="sm"
                                                                                                        value={button.label}
                                                                                                        onChange={(e) => updateLayerRichTextButton(section.sectionId, layer.layerId, button.buttonId, { label: e.target.value })}
                                                                                                        placeholder={t('buttonText')}
                                                                                                    />
                                                                                                </div>
                                                                                                <div>
                                                                                                    <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>{t('style')}</Label>
                                                                                                    <div className="style-buttons">
                                                                                                        <button
                                                                                                            className={`style-btn ${button.style === 'default' || !button.style ? 'active' : ''}`}
                                                                                                            onClick={() => updateLayerRichTextButton(section.sectionId, layer.layerId, button.buttonId, { style: 'default' })}
                                                                                                        >{t('default')}</button>
                                                                                                        <button
                                                                                                            className={`style-btn ${button.style === 'primary' ? 'active' : ''}`}
                                                                                                            onClick={() => updateLayerRichTextButton(section.sectionId, layer.layerId, button.buttonId, { style: 'primary' })}
                                                                                                        >{t('primary')}</button>
                                                                                                        <button
                                                                                                            className={`style-btn ${button.style === 'outline' ? 'active' : ''}`}
                                                                                                            onClick={() => updateLayerRichTextButton(section.sectionId, layer.layerId, button.buttonId, { style: 'outline' })}
                                                                                                        >{t('outline')}</button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div>
                                                                                                <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>{t('urlSupportsFieldFromThisLayer')}</Label>
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
                                                                                                <span>{t('openInNewTab')}</span>
                                                                                            </label>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>

                                                                                <Button
                                                                                    className="add-button add-button-secondary"
                                                                                    type="tertiary"
                                                                                    onClick={() => addLayerRichTextButton(section.sectionId, layer.layerId)}
                                                                                    aria-label={t('addLayerActionButton')}
                                                                                    style={{ marginBottom: '12px' }}
                                                                                >
                                                                                    <PlusIcon />
                                                                                    {t('addActionButton')}
                                                                                </Button>

                                                                                {/* Related Tables Configuration */}
                                                                                <div className="subsection-divider" style={{ marginTop: '16px' }}>{t('relatedTables')}</div>
                                                                                <p className="hint-text" style={{ marginTop: '4px', marginBottom: '8px' }}>
                                                                                    {t('queryRelatedTablesUsingRelationshipKeys')}
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
                                                                                        {t('noRelatedTablesConfigured')}
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
                                                                                                    <span style={{ fontWeight: 600, fontSize: '12px' }}>{relTable.tableName || t('untitledTable')}</span>
                                                                                                    <Tip title={t('removeRelatedTable')} placement="top">
                                                                                                        <button
                                                                                                            className="delete-btn"
                                                                                                            onClick={() => removeRelatedTable(section.sectionId, layer.layerId, relTable.tableId)}
                                                                                                            aria-label={t('removeRelatedTable')}
                                                                                                        >
                                                                                                            <TrashIcon />
                                                                                                        </button>
                                                                                                    </Tip>
                                                                                                </div>

                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('tableName')} tooltip={t('displayNameForThisRelatedTable')} />)}>
                                                                                                    <TextInput
                                                                                                        size="sm"
                                                                                                        value={relTable.tableName}
                                                                                                        onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { tableName: e.target.value })}
                                                                                                    />
                                                                                                </SettingRow>

                                                                                                <SettingRow flow="wrap" label={t('dataSource')}>
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
                                                                                                        ) : <div style={{ padding: "8px", fontSize: "12px", color: "var(--sys-color-text-secondary)" }}>{t('loadingDataSourceSelector')}</div>}
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
                                                                                                            {fetchLoading[`related-table:${relTable.tableId}`] ? 'Loading...' : t('reloadFields')}
                                                                                                        </button>
                                                                                                    )}
                                                                                                </SettingRow>

                                                                                                <div style={{ textAlign: 'center', color: 'var(--sys-color-text-light)', fontSize: '11px', margin: '8px 0' }}>
                                                                                                    {t('orUseDirectUrl')}
                                                                                                </div>

                                                                                                <SettingRow flow="wrap" label={t('tableUrl')}>
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
                                                                                                            {fetchLoading[`related-table:${relTable.tableId}`] ? 'Loading...' : t('fetchFields')}
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

                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('relationshipType')} tooltip={t('howToJoinDataKeyUses')} />)}>
                                                                                                    <Select
                                                                                                        size="sm"
                                                                                                        value={relTable.relationshipType || 'key'}
                                                                                                        onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { relationshipType: e.target.value as any })}
                                                                                                    >
                                                                                                        <Option value="key">{t('foreignKey')}</Option>
                                                                                                        <Option value="relationshipClass">{t('relationshipClass')}</Option>
                                                                                                        <Option value="spatial">{t('spatial')}</Option>
                                                                                                    </Select>
                                                                                                </SettingRow>

                                                                                                {relTable.relationshipType === 'key' || !relTable.relationshipType ? (
                                                                                                    <>
                                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('primaryKeyField')} tooltip={t('fieldInTheParentLayerThat')} />)}>
                                                                                                            <Select
                                                                                                                size="sm"
                                                                                                                value={relTable.primaryKeyField || ''}
                                                                                                                onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { primaryKeyField: e.target.value })}
                                                                                                            >
                                                                                                                <Option value="">{t('selectFieldFromParentLayer')}</Option>
                                                                                                                {layerFields.map(field => (
                                                                                                                    <Option key={field.name} value={field.name}>
                                                                                                                        {field.alias !== field.name ? `${field.alias} (${field.name})` : field.name}
                                                                                                                    </Option>
                                                                                                                ))}
                                                                                                            </Select>
                                                                                                            {layerFields.length === 0 && (
                                                                                                                <p className="hint-text" style={{ marginTop: '4px', color: '#f5a623' }}>
                                                                                                                    {t('selectADataSourceOrFetch')}
                                                                                                                </p>
                                                                                                            )}
                                                                                                        </SettingRow>
                                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('foreignKeyField')} tooltip={t('fieldInTheRelatedTableThat')} />)}>
                                                                                                            <Select
                                                                                                                size="sm"
                                                                                                                value={relTable.foreignKeyField || ''}
                                                                                                                onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { foreignKeyField: e.target.value })}
                                                                                                            >
                                                                                                                <Option value="">{t('selectFieldFromRelatedTable')}</Option>
                                                                                                                {getRelatedTableFields(relTable.tableId).map(field => (
                                                                                                                    <Option key={field.name} value={field.name}>
                                                                                                                        {field.alias !== field.name ? `${field.alias} (${field.name})` : field.name}
                                                                                                                    </Option>
                                                                                                                ))}
                                                                                                            </Select>
                                                                                                            {getRelatedTableFields(relTable.tableId).length === 0 && (
                                                                                                                <p className="hint-text" style={{ marginTop: '4px', color: '#f5a623' }}>
                                                                                                                    {t('clickFetchFieldsAboveToLoad')}
                                                                                                                </p>
                                                                                                            )}
                                                                                                        </SettingRow>
                                                                                                    </>
                                                                                                ) : relTable.relationshipType === 'spatial' ? (
                                                                                                    <>
                                                                                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('spatialRelationship')} tooltip={t('howGeometriesShouldRelateIntersectsOverlap')} />)}>
                                                                                                            <Select
                                                                                                                size="sm"
                                                                                                                value={relTable.spatialRelationship || 'intersects'}
                                                                                                                onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { spatialRelationship: e.target.value as any })}
                                                                                                            >
                                                                                                                <Option value="intersects">{t('intersects')}</Option>
                                                                                                                <Option value="contains">{t('contains2')}</Option>
                                                                                                                <Option value="within">{t('within')}</Option>
                                                                                                                <Option value="crosses">{t('crosses')}</Option>
                                                                                                                <Option value="touches">{t('touches')}</Option>
                                                                                                                <Option value="overlaps">{t('overlaps')}</Option>
                                                                                                                <Option value="nearby">{t('nearbyWithBuffer')}</Option>
                                                                                                            </Select>
                                                                                                        </SettingRow>
                                                                                                        <SettingRow flow="wrap" label={t('bufferDistance')}>
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
                                                                                                                    <Option value="feet">{t('feet')}</Option>
                                                                                                                    <Option value="meters">{t('meters')}</Option>
                                                                                                                    <Option value="miles">{t('miles')}</Option>
                                                                                                                    <Option value="kilometers">{t('kilometers')}</Option>
                                                                                                                </Select>
                                                                                                            </div>
                                                                                                        </SettingRow>
                                                                                                        <SettingRow flow="wrap" label={t('useParentGeometry')}>
                                                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                                <Switch
                                                                                                                    checked={relTable.useParentGeometry !== false}
                                                                                                                    onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { useParentGeometry: (e.target as HTMLInputElement).checked })}
                                                                                                                />
                                                                                                                <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                                                    {relTable.useParentGeometry !== false ? t('parentFeatureGeometry') : t('queryPoint')}
                                                                                                                </span>
                                                                                                            </div>
                                                                                                        </SettingRow>
                                                                                                    </>
                                                                                                ) : (
                                                                                                    <SettingRow flow="wrap" label={t('relationshipId')}>
                                                                                                        <NumericInput
                                                                                                            size="sm"
                                                                                                            value={relTable.relationshipId || 0}
                                                                                                            min={0}
                                                                                                            onChange={(value) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { relationshipId: value })}
                                                                                                            style={{ width: 80 }}
                                                                                                        />
                                                                                                    </SettingRow>
                                                                                                )}

                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('displayMode')} tooltip={t('howToShowRelatedRecordsTable')} />)}>
                                                                                                    <Select
                                                                                                        size="sm"
                                                                                                        value={relTable.displayMode || 'table'}
                                                                                                        onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { displayMode: e.target.value as any })}
                                                                                                    >
                                                                                                        <Option value="table">{t('table')}</Option>
                                                                                                        <Option value="list">{t('list')}</Option>
                                                                                                        <Option value="card">{t('cards')}</Option>
                                                                                                    </Select>
                                                                                                </SettingRow>

                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('defaultSortField')} tooltip={t('selectAFieldToSortRecords')} />)}>
                                                                                                    <Select
                                                                                                        size="sm"
                                                                                                        value={relTable.defaultSortField || ''}
                                                                                                        onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { defaultSortField: e.target.value || undefined })}
                                                                                                        aria-label={t('defaultSortField2')}
                                                                                                    >
                                                                                                        <Option value="">{t('none')}</Option>
                                                                                                        {(relTable.fields || []).filter((f: any) => f.visible !== false).map((field: any) => (
                                                                                                            <Option key={field.name} value={field.name}>
                                                                                                                {field.alias || field.name}
                                                                                                            </Option>
                                                                                                        ))}
                                                                                                    </Select>
                                                                                                </SettingRow>

                                                                                                {relTable.defaultSortField && (
                                                                                                    <SettingRow flow="wrap" label={(<TooltipLabel label={t('sortOrder')} tooltip={t('chooseAscendingAZ09')} />)}>
                                                                                                        <Select
                                                                                                            size="sm"
                                                                                                            value={relTable.defaultSortOrder || 'asc'}
                                                                                                            onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { defaultSortOrder: e.target.value as any })}
                                                                                                            aria-label={t('sortOrder2')}
                                                                                                        >
                                                                                                            <Option value="asc">{t('ascendingAZ09Oldest')}</Option>
                                                                                                            <Option value="desc">{t('descendingZA90Newest')}</Option>
                                                                                                        </Select>
                                                                                                    </SettingRow>
                                                                                                )}

                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('displayPane')} tooltip={t('inlineShowsRecordsInTheCurrent')} />)}>
                                                                                                    <Select
                                                                                                        size="sm"
                                                                                                        value={relTable.displayPane || 'inline'}
                                                                                                        onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { displayPane: e.target.value as any })}
                                                                                                    >
                                                                                                        <Option value="inline">{t('inlineCurrentSection')}</Option>
                                                                                                        <Option value="separate">{t('separatePane')}</Option>
                                                                                                    </Select>
                                                                                                </SettingRow>

                                                                                                {relTable.displayPane === 'separate' && (
                                                                                                    <SettingRow flow="wrap" label={t('paneTitle')}>
                                                                                                        <TextInput
                                                                                                            size="sm"
                                                                                                            value={relTable.separatePaneTitle || ''}
                                                                                                            placeholder={relTable.tableName || t('relatedRecords')}
                                                                                                            onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { separatePaneTitle: e.target.value })}
                                                                                                        />
                                                                                                    </SettingRow>
                                                                                                )}

                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('defaultExpanded')} tooltip={t('controlsWhetherThisRelatedTableSection')} />)}>
                                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                        <Switch
                                                                                                            checked={relTable.expanded !== false}
                                                                                                            onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { expanded: (e.target as HTMLInputElement).checked })}
                                                                                                            aria-label={t('defaultExpandedState2')}
                                                                                                        />
                                                                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                                            {relTable.expanded !== false ? t('expandedByDefault') : t('collapsedByDefault')}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </SettingRow>

                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('interactiveSorting')} tooltip={t('allowUsersToClickColumnHeaders2')} />)}>
                                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                        <Switch
                                                                                                            checked={relTable.enableInteractiveSorting !== false}
                                                                                                            onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { enableInteractiveSorting: (e.target as HTMLInputElement).checked })}
                                                                                                        />
                                                                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                                                                            {t('clickColumnHeadersToSort')}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </SettingRow>

                                                                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('enableChart')} tooltip={t('showAChartVisualizationOfThe')} />)}>
                                                                                                    <Switch
                                                                                                        checked={relTable.enableChart || false}
                                                                                                        onChange={(e) => updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { enableChart: (e.target as HTMLInputElement).checked })}
                                                                                                    />
                                                                                                </SettingRow>

                                                                                                <SettingRow flow="wrap" label={t('maxRecords')}>
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
                                                                                                            <Label style={{ fontWeight: 600, fontSize: '12px' }}>{t('fieldsToDisplay')}</Label>
                                                                                                            {relTable.tableUrl && !relTable.dataSourceId && (
                                                                                                                <Button
                                                                                                                    type="tertiary"
                                                                                                                    size="sm"
                                                                                                                    onClick={() => fetchRelatedTableFields(relTable.tableId, relTable.tableUrl)}
                                                                                                                    disabled={fetchLoading[`related-table:${relTable.tableId}`]}
                                                                                                                >
                                                                                                                    {fetchLoading[`related-table:${relTable.tableId}`] ? 'Loading...' : t('fetchFields')}
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
                                                                                                                    {t('selectAll')}
                                                                                                                </Button>
                                                                                                                <Button
                                                                                                                    type="tertiary"
                                                                                                                    size="sm"
                                                                                                                    style={{ fontSize: '10px', padding: '2px 8px' }}
                                                                                                                    onClick={() => {
                                                                                                                        updateRelatedTable(section.sectionId, layer.layerId, relTable.tableId, { fields: [] })
                                                                                                                    }}
                                                                                                                >
                                                                                                                    {t('selectNone')}
                                                                                                                </Button>
                                                                                                            </div>
                                                                                                        )}
                                                                                                        <p style={{ fontSize: '10px', color: 'var(--sys-color-text-light)', margin: '0 0 6px 0', fontStyle: 'italic' }}>
                                                                                                            {(relTable.fields?.length || 0) === 0
                                                                                                                ? t('noFieldsSelectedShowingFirst5')
                                                                                                                : t('fieldsCountFieldSSelected', { fieldsCount: relTable.fields?.length || 0 })}
                                                                                                        </p>
                                                                                                        <div className="fields-container">
                                                                                                            {(() => {
                                                                                                                const rtFields = getRelatedTableFields(relTable.tableId)
                                                                                                                const selectedRtFields = relTable.fields || []

                                                                                                                if (rtFields.length === 0) {
                                                                                                                    return (
                                                                                                                        <div className="field-item" style={{ justifyContent: 'center', color: 'var(--sys-color-text-light)', fontSize: '11px' }}>
                                                                                                                            {t('clickFetchFieldsToLoadAvailable')}
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
                                                                                                                                    aria-label={t('selectName', { name: field.name })}
                                                                                                                                />
                                                                                                                                <span className="field-name" style={{ fontSize: '11px' }}>{field.name}</span>
                                                                                                                                {displayAlias && <span className="field-alias" style={{ color: 'var(--sys-color-text-light)', fontSize: '10px' }}>{displayAlias}</span>}
                                                                                                                            </div>
                                                                                                                            {isSelected && (
                                                                                                                                <div style={{ width: '100%', marginTop: '6px', paddingLeft: '24px' }}>
                                                                                                                                    <div style={{ marginBottom: '6px' }}>
                                                                                                                                        <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>{t('displayAlias2')}</Label>
                                                                                                                                        <TextInput
                                                                                                                                            size="sm"
                                                                                                                                            value={currentAlias}
                                                                                                                                            onChange={(e) => updateRelatedTableFieldAlias(section.sectionId, layer.layerId, relTable.tableId, field.name, e.target.value)}
                                                                                                                                            placeholder={t('displayAlias')}
                                                                                                                                        />
                                                                                                                                    </div>
                                                                                                                                    <div style={{ marginBottom: '6px' }}>
                                                                                                                                        <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>{t('formatType')}</Label>
                                                                                                                                        <Select
                                                                                                                                            size="sm"
                                                                                                                                            value={currentFormat.type || 'auto'}
                                                                                                                                            onChange={(e) => updateRelatedTableFieldFormat(section.sectionId, layer.layerId, relTable.tableId, field.name, { type: e.target.value as any })}
                                                                                                                                        >
                                                                                                                                            <Option value="auto">{t('auto')}</Option>
                                                                                                                                            <Option value="text">{t('text')}</Option>
                                                                                                                                            <Option value="number">{t('number')}</Option>
                                                                                                                                            <Option value="date">{t('date')}</Option>
                                                                                                                                            <Option value="link">{t('link')}</Option>
                                                                                                                                        </Select>
                                                                                                                                    </div>
                                                                                                                                    {(currentFormat.type === 'number' || currentFormat.type === 'auto') && (
                                                                                                                                        <div style={{ marginBottom: '6px' }}>
                                                                                                                                            <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>{t('numberFormat')}</Label>
                                                                                                                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                                                                                                                <Select
                                                                                                                                                    size="sm"
                                                                                                                                                    value={currentFormat.numberFormat || 'default'}
                                                                                                                                                    onChange={(e) => updateRelatedTableFieldFormat(section.sectionId, layer.layerId, relTable.tableId, field.name, { numberFormat: e.target.value as any })}
                                                                                                                                                    style={{ width: '90px' }}
                                                                                                                                                >
                                                                                                                                                    <Option value="default">{t('default')}</Option>
                                                                                                                                                    <Option value="none">{t('noFormat')}</Option>
                                                                                                                                                    <Option value="decimal">{t('decimal')}</Option>
                                                                                                                                                    <Option value="currency">{t('currency')}</Option>
                                                                                                                                                    <Option value="percent">{t('percent')}</Option>
                                                                                                                                                </Select>
                                                                                                                                                <Label style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                                                                                                    <Checkbox
                                                                                                                                                        checked={currentFormat.useGrouping !== false}
                                                                                                                                                        onChange={(e) => updateRelatedTableFieldFormat(section.sectionId, layer.layerId, relTable.tableId, field.name, { useGrouping: (e.target as HTMLInputElement).checked })}
                                                                                                                                                    />
                                                                                                                                                    {t('commas')}
                                                                                                                                                </Label>
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                    )}
                                                                                                                                    {currentFormat.type === 'date' && (
                                                                                                                                        <div style={{ marginBottom: '6px' }}>
                                                                                                                                            <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>{t('dateFormat')}</Label>
                                                                                                                                            <Select
                                                                                                                                                size="sm"
                                                                                                                                                value={currentFormat.dateFormat || 'default'}
                                                                                                                                                onChange={(e) => updateRelatedTableFieldFormat(section.sectionId, layer.layerId, relTable.tableId, field.name, { dateFormat: e.target.value as any })}
                                                                                                                                            >
                                                                                                                                                <Option value="default">{t('default')}</Option>
                                                                                                                                                <Option value="short">{t('short1124')}</Option>
                                                                                                                                                <Option value="medium">{t('mediumJan12024')}</Option>
                                                                                                                                                <Option value="long">{t('longJanuary12024')}</Option>
                                                                                                                                                <Option value="iso">{t('iso20240101')}</Option>
                                                                                                                                            </Select>
                                                                                                                                        </div>
                                                                                                                                    )}
                                                                                                                                    {currentFormat.type === 'link' && (
                                                                                                                                        <div style={{ marginBottom: '6px' }}>
                                                                                                                                            <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>{t('linkText')}</Label>
                                                                                                                                            <TextInput
                                                                                                                                                size="sm"
                                                                                                                                                value={currentFormat.linkText || ''}
                                                                                                                                                onChange={(e) => updateRelatedTableFieldFormat(section.sectionId, layer.layerId, relTable.tableId, field.name, { linkText: e.target.value })}
                                                                                                                                                placeholder={t('clickHere')}
                                                                                                                                            />
                                                                                                                                        </div>
                                                                                                                                    )}
                                                                                                                                    {currentFormat.type === 'link' && (
                                                                                                                                        <div style={{ marginBottom: '6px' }}>
                                                                                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                                                                                                                <Switch
                                                                                                                                                    checked={currentFormat.useLinkBaseUrl || false}
                                                                                                                                                    onChange={(e) => updateRelatedTableFieldFormat(section.sectionId, layer.layerId, relTable.tableId, field.name, { useLinkBaseUrl: (e.target as HTMLInputElement).checked })}
                                                                                                                                                    aria-label={t('enableBaseUrl')}
                                                                                                                                                />
                                                                                                                                                <Label style={{ fontSize: '10px', cursor: 'pointer' }}>
                                                                                                                                                    {t('prependBaseUrl')}
                                                                                                                                                </Label>
                                                                                                                                                <Tip title={t('prependABaseUrlToThe')} placement="top">
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
                                                                                                                                            aria-label={t('hideNameWhenNull', { name: field.name })}
                                                                                                                                        />
                                                                                                                                        <Label style={{ fontSize: '10px', cursor: 'pointer' }}>
                                                                                                                                            {t('hideWhenNull')}
                                                                                                                                        </Label>
                                                                                                                                        <Tip title={t('hideThisColumnWhenAllValues')} placement="top">
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
                                                                                    {t('addRelatedTable')}
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
                                                    aria-label={t('addDataSource2')}
                                                >
                                                    <PlusIcon />
                                                    {t('addDataSource')}
                                                </Button>


                                                {/* Rich Text / Info Content (Optional) */}
                                                <div className="subsection-divider">{t('sectionInfoContentOptional')}</div>
                                                <p className="hint-text">
                                                    {t('addSupplementaryTextContactInfoLinks2')}
                                                </p>

                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('richTextPosition')} tooltip={t('showTheRichTextContentBefore2')} />)}>
                                                    <div className="position-buttons">
                                                        <button
                                                            className={`position-btn ${(section.richTextPosition || 'after') === 'before' ? 'active' : ''}`}
                                                            onClick={() => updateSection(section.sectionId, { richTextPosition: 'before' })}
                                                        >{t('beforeData')}</button>
                                                        <button
                                                            className={`position-btn ${(section.richTextPosition || 'after') === 'after' ? 'active' : ''}`}
                                                            onClick={() => updateSection(section.sectionId, { richTextPosition: 'after' })}
                                                        >{t('afterData')}</button>
                                                    </div>
                                                </SettingRow>

                                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('htmlContent')} tooltip={t('richTextContentSupportingHtmlFormatting2')} />)}>
                                                    <textarea
                                                        className="rich-text-editor"
                                                        value={section.richTextContent || ''}
                                                        onChange={(e) => updateSection(section.sectionId, { richTextContent: e.target.value })}
                                                        placeholder="<p>For more information, contact...</p>"
                                                        aria-label={t('richTextHtmlContent')}
                                                    />
                                                    <div className="rich-text-help">
                                                        <strong>{t('supportedHtml')}</strong><br />
                                                        {t('links')} <code>&lt;a href="url"&gt;text&lt;/a&gt;</code><br />
                                                        {t('email')} <code>&lt;a href="mailto:email"&gt;text&lt;/a&gt;</code><br />
                                                        {t('phone')} <code>&lt;a href="tel:number"&gt;text&lt;/a&gt;</code><br />
                                                        {t('bold')} <code>&lt;strong&gt;text&lt;/strong&gt;</code><br />
                                                        <strong>{t('fieldPlaceholders')}</strong> <code>{'{'}FieldName{'}'}</code><br />
                                                        <em>{t('usesFieldsFromThisSectionS')}</em>
                                                    </div>
                                                </SettingRow>

                                                {/* Exclude rich text from PDF toggle */}
                                                <SettingRow flow="wrap" label={t('excludeFromPdf')}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Switch
                                                            checked={section.richTextExcludeFromPdf || false}
                                                            onChange={(e) => updateSection(section.sectionId, { richTextExcludeFromPdf: (e.target as HTMLInputElement).checked })}
                                                            aria-label={t('excludeRichTextFromPdf')}
                                                        />
                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                            {t('showInWidgetOnlyNotIn')}
                                                        </span>
                                                    </div>
                                                </SettingRow>

                                                {/* Hide rich text when no features toggle */}
                                                <SettingRow flow="wrap" label={t('hideWhenNoFeatures')}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Switch
                                                            checked={section.hideRichTextWhenNoResults || false}
                                                            onChange={(e) => updateSection(section.sectionId, { hideRichTextWhenNoResults: (e.target as HTMLInputElement).checked })}
                                                            aria-label={t('hideRichTextWhenNoFeatures')}
                                                        />
                                                        <span style={{ fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                            {t('onlyShowIfAtLeastOne')}
                                                        </span>
                                                    </div>
                                                </SettingRow>

                                                {/* Action Buttons */}
                                                <div className="button-list">
                                                    {toMutableRichTextButtons(section.richTextButtons || []).map((button) => (
                                                        <div className="button-item" key={button.buttonId}>
                                                            <div className="button-item-header">
                                                                <Label style={{ fontSize: '11px', fontWeight: 600 }}>
                                                                    <LinkIcon /> {t('actionButton')}
                                                                </Label>
                                                                <button
                                                                    className="delete-btn"
                                                                    onClick={() => removeRichTextButton(section.sectionId, button.buttonId)}
                                                                    aria-label={t('removeButton')}
                                                                >
                                                                    <TrashIcon />
                                                                </button>
                                                            </div>
                                                            <div className="button-item-row">
                                                                <div>
                                                                    <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>{t('label')}</Label>
                                                                    <TextInput
                                                                        size="sm"
                                                                        value={button.label}
                                                                        onChange={(e) => updateRichTextButton(section.sectionId, button.buttonId, { label: e.target.value })}
                                                                        placeholder={t('buttonText')}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>{t('style')}</Label>
                                                                    <div className="button-style-selector">
                                                                        <button
                                                                            className={`button-style-btn ${(button.style || 'default') === 'default' ? 'active' : ''}`}
                                                                            onClick={() => updateRichTextButton(section.sectionId, button.buttonId, { style: 'default' })}
                                                                        >{t('default')}</button>
                                                                        <button
                                                                            className={`button-style-btn ${button.style === 'primary' ? 'active' : ''}`}
                                                                            onClick={() => updateRichTextButton(section.sectionId, button.buttonId, { style: 'primary' })}
                                                                        >{t('primary')}</button>
                                                                        <button
                                                                            className={`button-style-btn ${button.style === 'outline' ? 'active' : ''}`}
                                                                            onClick={() => updateRichTextButton(section.sectionId, button.buttonId, { style: 'outline' })}
                                                                        >{t('outline')}</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Label style={{ fontSize: '10px', marginBottom: '2px', display: 'block' }}>{t('urlSupportsFieldFromSectionLayers')}</Label>
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
                                                                <span>{t('openInNewTab')}</span>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>

                                                <Button
                                                    className="add-button add-button-secondary"
                                                    type="tertiary"
                                                    onClick={() => addRichTextButton(section.sectionId)}
                                                    aria-label={t('addActionButton2')}
                                                >
                                                    <PlusIcon />
                                                    {t('addActionButton')}
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
                            aria-label={t('addSection2')}
                        >
                            <PlusIcon />
                            {t('addSection')}
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
                        <span className="collapsible-panel-title">{t('pdfExportSettings')}</span>
                    </div>
                    <span className={`collapsible-panel-toggle ${!expandedPanels.has('pdf-export') ? 'collapsed' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </div>
                <div className={`collapsible-panel-content ${expandedPanels.has('pdf-export') ? 'expanded' : ''}`}>
                    <div className="collapsible-panel-inner">
                        <p className="hint-text">
                            {t('configureTheAppearanceOfExportedPdf')}
                        </p>

                        {/* Logo Upload Section */}
                        <div className="pdf-section-card">
                            <div className="pdf-section-title">
                                <ImageIcon />
                                {t('logoImage')}
                            </div>

                            <input
                                ref={logoInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                style={{ display: 'none' }}
                                aria-label={t('uploadLogo')}
                            />

                            {pdfHeader.logoBase64 ? (
                                <>
                                    <div className="logo-preview-container">
                                        <img
                                            src={pdfHeader.logoBase64}
                                            alt={logoConfig.altText || t('logoPreview')}
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
                                                    {t('originalWidthOriginalHeightPx', { originalWidth: logoConfig.originalWidth, originalHeight: logoConfig.originalHeight })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="logo-actions">
                                            <Button size="sm" type="secondary" onClick={() => logoInputRef.current?.click()}>
                                                {t('change')}
                                            </Button>
                                            <Button size="sm" type="secondary" onClick={removeLogo}>
                                                {t('remove')}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Size Settings Subsection */}
                                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--sys-color-divider-secondary)' }}>
                                        <div style={{ fontWeight: 500, fontSize: '12px', marginBottom: '8px', color: 'var(--sys-color-primary-main)' }}>
                                            {t('sizeSettings')}
                                        </div>

                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('sizeMode')} tooltip={t('autoMaintainsAspectRatioWithinMax')} />)}>
                                            <Select
                                                size="sm"
                                                value={logoConfig.sizeMode || 'auto'}
                                                onChange={(e) => updateLogo({ sizeMode: e.target.value as ImageSizeMode })}
                                                style={{ width: '100%' }}
                                            >
                                                <Option value="auto">{t('autoFitWithinMaxSizeKeep')}</Option>
                                                <Option value="fit">{t('fitScaleToMaxSizeKeep')}</Option>
                                                <Option value="custom">{t('customExactSizeKeepAspectRatio')}</Option>
                                                <Option value="stretch">{t('stretchExactSizeMayDistort')}</Option>
                                            </Select>
                                        </SettingRow>
                                        <p className="hint-text" style={{ marginTop: '2px', marginBottom: '8px' }}>
                                            {logoConfig.sizeMode === 'stretch'
                                                ? t('imageWillBeStretchedToExact')
                                                : logoConfig.sizeMode === 'custom'
                                                    ? t('imageWillScaleToExactWidth')
                                                    : t('imageWillScaleToFitWithin')
                                            }
                                        </p>

                                        {/* Auto/Fit Mode: Max dimensions */}
                                        {(!logoConfig.sizeMode || logoConfig.sizeMode === 'auto' || logoConfig.sizeMode === 'fit') && (
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <SettingRow flow="wrap" label={t('maxWidthMm')} style={{ flex: 1 }}>
                                                    <NumericInput
                                                        size="sm"
                                                        value={logoConfig.maxWidth ?? 50}
                                                        min={10}
                                                        max={100}
                                                        onChange={(value) => updateLogo({ maxWidth: Number(value) })}
                                                        style={{ width: '100%' }}
                                                    />
                                                </SettingRow>
                                                <SettingRow flow="wrap" label={t('maxHeightMm')} style={{ flex: 1 }}>
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
                                            <SettingRow flow="wrap" label={t('widthMm')}>
                                                <NumericInput
                                                    size="sm"
                                                    value={logoConfig.customWidth ?? 40}
                                                    min={5}
                                                    max={100}
                                                    onChange={(value) => updateLogo({ customWidth: Number(value) })}
                                                    style={{ width: 100 }}
                                                />
                                                <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                    {t('heightAutoCalculatedFromAspectRatio')}
                                                </span>
                                            </SettingRow>
                                        )}

                                        {/* Stretch Mode: Both dimensions */}
                                        {logoConfig.sizeMode === 'stretch' && (
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <SettingRow flow="wrap" label={t('widthMm')} style={{ flex: 1 }}>
                                                    <NumericInput
                                                        size="sm"
                                                        value={logoConfig.customWidth ?? 40}
                                                        min={5}
                                                        max={100}
                                                        onChange={(value) => updateLogo({ customWidth: Number(value) })}
                                                        style={{ width: '100%' }}
                                                    />
                                                </SettingRow>
                                                <SettingRow flow="wrap" label={t('heightMm')} style={{ flex: 1 }}>
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
                                            {t('positionLayout')}
                                        </div>

                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('horizontalPosition')} tooltip={t('whereTheLogoAppearsHorizontallyIn')} />)}>
                                            <div className="position-buttons">
                                                <button
                                                    className={`position-btn ${(logoConfig.position || 'left') === 'left' ? 'active' : ''}`}
                                                    onClick={() => updateLogo({ position: 'left' })}
                                                    title={t('alignLogoToLeft')}
                                                >{t('left')}</button>
                                                <button
                                                    className={`position-btn ${logoConfig.position === 'center' ? 'active' : ''}`}
                                                    onClick={() => updateLogo({ position: 'center' })}
                                                    title={t('centerLogoHorizontally')}
                                                >{t('center')}</button>
                                                <button
                                                    className={`position-btn ${logoConfig.position === 'right' ? 'active' : ''}`}
                                                    onClick={() => updateLogo({ position: 'right' })}
                                                    title={t('alignLogoToRight')}
                                                >{t('right')}</button>
                                            </div>
                                        </SettingRow>

                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('verticalAlignment')} tooltip={t('howTheLogoAlignsVerticallyWithin')} />)}>
                                            <div className="position-buttons">
                                                <button
                                                    className={`position-btn ${logoConfig.verticalAlign === 'top' ? 'active' : ''}`}
                                                    onClick={() => updateLogo({ verticalAlign: 'top' })}
                                                    title={t('alignLogoToTop')}
                                                >{t('top')}</button>
                                                <button
                                                    className={`position-btn ${(!logoConfig.verticalAlign || logoConfig.verticalAlign === 'middle') ? 'active' : ''}`}
                                                    onClick={() => updateLogo({ verticalAlign: 'middle' })}
                                                    title={t('centerLogoVertically')}
                                                >{t('middle')}</button>
                                                <button
                                                    className={`position-btn ${logoConfig.verticalAlign === 'bottom' ? 'active' : ''}`}
                                                    onClick={() => updateLogo({ verticalAlign: 'bottom' })}
                                                    title={t('alignLogoToBottom')}
                                                >{t('bottom')}</button>
                                            </div>
                                        </SettingRow>

                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('paddingMm')} tooltip={t('spaceAroundTheLogoInMillimeters')} />)}>
                                            <NumericInput
                                                size="sm"
                                                value={logoConfig.padding ?? 0}
                                                min={0}
                                                max={10}
                                                onChange={(value) => updateLogo({ padding: Number(value) })}
                                                style={{ width: 80 }}
                                            />
                                        </SettingRow>

                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('headerHeightMm')} tooltip={t('totalHeightOfThePdfHeader')} />)}>
                                            <NumericInput
                                                size="sm"
                                                value={pdfHeader.headerHeight ?? 35}
                                                min={20}
                                                max={80}
                                                onChange={(value) => updatePdfHeader({ headerHeight: Number(value) })}
                                                style={{ width: 80 }}
                                            />
                                            <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--sys-color-text-light)' }}>
                                                {t('totalHeaderAreaHeight')}
                                            </span>
                                        </SettingRow>
                                    </div>

                                    {/* Appearance Subsection */}
                                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--sys-color-divider-secondary)' }}>
                                        <div style={{ fontWeight: 500, fontSize: '12px', marginBottom: '8px', color: 'var(--sys-color-primary-main)' }}>
                                            {t('appearance')}
                                        </div>

                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('shape')} tooltip={t('logoShapeDefaultRectangleCircleCircular')} />)}>
                                            <Select
                                                size="sm"
                                                value={logoConfig.shape || 'default'}
                                                onChange={(e) => updateLogo({ shape: e.target.value as any })}
                                                style={{ width: '100%' }}
                                            >
                                                <Option value="default">{t('defaultRectangular')}</Option>
                                                <Option value="rounded">{t('roundedCorners')}</Option>
                                                <Option value="circle">{t('circle')}</Option>
                                            </Select>
                                        </SettingRow>

                                        {/* Border radius for rounded shape */}
                                        {logoConfig.shape === 'rounded' && (
                                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('cornerRadiusMm')} tooltip={t('howRoundedTheCornersShouldBe')} />)}>
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

                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('backgroundColor')} tooltip={t('backgroundColorBehindTheLogoUseful')} />)}>
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
                                                    placeholder={t('transparent')}
                                                    style={{ width: 90 }}
                                                />
                                                {logoConfig.backgroundColor && (
                                                    <Button
                                                        size="sm"
                                                        type="tertiary"
                                                        onClick={() => updateLogo({ backgroundColor: undefined })}
                                                        style={{ padding: '0 8px' }}
                                                    >
                                                        {t('clear')}
                                                    </Button>
                                                )}
                                            </div>
                                        </SettingRow>

                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('altTextAccessibility')} tooltip={t('wcag111DescriptiveText')} />)}>
                                            <TextInput
                                                size="sm"
                                                value={logoConfig.altText || ''}
                                                onChange={(e) => updateLogo({ altText: e.target.value })}
                                                placeholder={t('eGCityOfGrandJunction')}
                                            />
                                        </SettingRow>
                                        <p className="hint-text" style={{ marginTop: '2px' }}>
                                            {t('wcag111DescribesThe')}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="logo-upload-area" onClick={() => logoInputRef.current?.click()}>
                                    <UploadIcon />
                                    <div style={{ marginTop: '8px', fontSize: '12px' }}>{t('clickToUploadLogo')}</div>
                                    <div style={{ fontSize: '10px', color: 'var(--sys-color-text-light)', marginTop: '4px' }}>
                                        {t('pngJpgGifSvgMax1mb')}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Header Content Section */}
                        <div className="pdf-section-card">
                            <div className="pdf-section-title">
                                <PdfIcon />
                                {t('headerContent')}
                            </div>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('titleMode')} tooltip={t('defaultUsesTheSearchedAddressAs')} />)}>
                                <Select
                                    size="sm"
                                    value={pdfHeader.titleMode || 'default'}
                                    onChange={(e) => updatePdfHeader({ titleMode: e.target.value as 'default' | 'custom' })}
                                    style={{ width: '100%' }}
                                >
                                    <Option value="default">{t('defaultAddressParcel')}</Option>
                                    <Option value="custom">{t('customTitle')}</Option>
                                </Select>
                            </SettingRow>

                            {pdfHeader.titleMode === 'custom' && (
                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('reportTitle')} tooltip={t('customTitleTextToDisplayAt')} />)}>
                                    <TextInput
                                        size="sm"
                                        value={pdfHeader.reportTitle || ''}
                                        onChange={(e) => updatePdfHeader({ reportTitle: e.target.value })}
                                        placeholder={t('propertyReport')}
                                    />
                                </SettingRow>
                            )}

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('titlePosition')} tooltip={t('horizontalAlignmentOfTheReportTitle')} />)}>
                                <div className="position-buttons">
                                    <button
                                        className={`position-btn ${(pdfHeader.titlePosition || 'center') === 'left' ? 'active' : ''}`}
                                        onClick={() => updatePdfHeader({ titlePosition: 'left' })}
                                    >{t('left')}</button>
                                    <button
                                        className={`position-btn ${(pdfHeader.titlePosition || 'center') === 'center' ? 'active' : ''}`}
                                        onClick={() => updatePdfHeader({ titlePosition: 'center' })}
                                    >{t('center')}</button>
                                    <button
                                        className={`position-btn ${(pdfHeader.titlePosition || 'center') === 'right' ? 'active' : ''}`}
                                        onClick={() => updatePdfHeader({ titlePosition: 'right' })}
                                    >{t('right')}</button>
                                </div>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('showDate')} tooltip={t('displayTheReportGenerationDateIn')} />)}>
                                <Switch
                                    checked={pdfHeader.showGeneratedDate !== false}
                                    onChange={(e) => updatePdfHeader({ showGeneratedDate: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('headerBackground')} tooltip={t('backgroundColorForThePdfHeader')} />)}>
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

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('headerTextColor')} tooltip={t('textColorForTitleAndDate')} />)}>
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
                                {t('footer')}
                            </div>

                            <SettingRow flow="wrap" label={(
                                <TooltipLabel
                                    label={t('showFooter')}
                                    tooltip={t('includeAFooterOnEachPdf')}
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
                                            label={t('showPageNumbers')}
                                            tooltip={t('displayPageNumbersInTheFooter')}
                                        />
                                    )}>

                                        <Switch
                                            checked={pdfFooter.showPageNumbers !== false}
                                            onChange={(e) => updatePdfFooter({ showPageNumbers: (e.target as HTMLInputElement).checked })}
                                        />
                                    </SettingRow>

                                    <SettingRow flow="wrap" label={(
                                        <TooltipLabel
                                            label={t('pageNumberPosition')}
                                            tooltip={t('whereToPlacePageNumbersIn')}
                                        />
                                    )}>

                                        <div className="position-buttons">
                                            <button
                                                className={`position-btn ${(pdfFooter.pageNumberPosition || 'right') === 'left' ? 'active' : ''}`}
                                                onClick={() => updatePdfFooter({ pageNumberPosition: 'left' })}
                                            >{t('left')}</button>
                                            <button
                                                className={`position-btn ${(pdfFooter.pageNumberPosition || 'right') === 'center' ? 'active' : ''}`}
                                                onClick={() => updatePdfFooter({ pageNumberPosition: 'center' })}
                                            >{t('center')}</button>
                                            <button
                                                className={`position-btn ${(pdfFooter.pageNumberPosition || 'right') === 'right' ? 'active' : ''}`}
                                                onClick={() => updatePdfFooter({ pageNumberPosition: 'right' })}
                                            >{t('right')}</button>
                                        </div>
                                    </SettingRow>

                                    <SettingRow flow="wrap" label={(
                                        <TooltipLabel
                                            label={t('contactInfo')}
                                            tooltip={t('departmentNamePhoneNumberOrOther')}
                                        />
                                    )}>

                                        <TextInput
                                            size="sm"
                                            value={pdfFooter.contactText || ''}
                                            onChange={(e) => updatePdfFooter({ contactText: e.target.value })}
                                            placeholder={t('eGPlanningDepartment970555')}
                                        />
                                    </SettingRow>

                                    {pdfFooter.contactText && (
                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('contactPosition')} tooltip={t('horizontalPositionOfTheContactInformation')} />)}>
                                            <div className="position-buttons">
                                                <button
                                                    className={`position-btn ${(pdfFooter.contactPosition || 'left') === 'left' ? 'active' : ''}`}
                                                    onClick={() => updatePdfFooter({ contactPosition: 'left' })}
                                                >{t('left')}</button>
                                                <button
                                                    className={`position-btn ${pdfFooter.contactPosition === 'center' ? 'active' : ''}`}
                                                    onClick={() => updatePdfFooter({ contactPosition: 'center' })}
                                                >{t('center')}</button>
                                                <button
                                                    className={`position-btn ${pdfFooter.contactPosition === 'right' ? 'active' : ''}`}
                                                    onClick={() => updatePdfFooter({ contactPosition: 'right' })}
                                                >{t('right')}</button>
                                            </div>
                                        </SettingRow>
                                    )}

                                    <SettingRow flow="wrap" label={(
                                        <TooltipLabel
                                            label={t('disclaimerText')}
                                            tooltip={t('legalDisclaimerTextShownInSmall')}
                                        />
                                    )}>

                                        <textarea
                                            className="textarea-input"
                                            value={pdfFooter.disclaimerText || ''}
                                            onChange={(e) => updatePdfFooter({ disclaimerText: e.target.value })}
                                            placeholder={t('disclaimerThisProductIsForInformational')}
                                        />
                                    </SettingRow>

                                    <SettingRow flow="wrap" label={(<TooltipLabel label={t('footerHeightMm')} tooltip={t('heightOfTheFooterAreaIn')} />)}>
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
                                {t('mapScreenshot')}
                            </div>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('includeMap')} tooltip={t('includeAScreenshotOfTheMap')} />)}>
                                <Switch
                                    checked={pdfHeader.includeMap !== false}
                                    onChange={(e) => updatePdfHeader({ includeMap: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            {pdfHeader.includeMap !== false && (
                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('mapHeightMm')} tooltip={t('heightOfTheMapImageIn')} />)}>
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
                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('mapScaleMode')} tooltip={t('howToDetermineTheMapZoom')} />)}>
                                    <Select
                                        size="sm"
                                        value={pdfHeader.mapScaleMode || 'fixed'}
                                        onChange={(e) => updatePdfHeader({ mapScaleMode: e.target.value as 'fixed' | 'fitGeometry' })}
                                    >
                                        <Option value="fixed">{t('fixedScale')}</Option>
                                        <Option value="fitGeometry">{t('fitToGeometry')}</Option>
                                    </Select>
                                </SettingRow>
                            )}

                            {pdfHeader.includeMap !== false && (pdfHeader.mapScaleMode || 'fixed') === 'fixed' && (
                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('mapScale')} tooltip={t('mapScaleForThePdfScreenshot')} />)}>
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
                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('fitPadding')} tooltip={t('paddingFactorAroundTheGeometryWhen')} />)}>
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
                                {t('dataLayout')}
                            </div>

                            <SettingRow flow="wrap" label={(
                                <TooltipLabel
                                    label={t('layoutStyle')}
                                    tooltip={t('howSingleRecordDataIsArranged')}
                                />
                            )}>

                                <Select
                                    size="sm"
                                    value={pdfStyle.dataLayout || 'two-column'}
                                    onChange={(e) => updatePdfStyle({ dataLayout: e.target.value as any })}
                                >
                                    <Option value="two-column">{t('twoColumn')}</Option>
                                    <Option value="table">{t('table')}</Option>
                                    <Option value="cards">{t('cards')}</Option>
                                    <Option value="auto">{t('auto')}</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(
                                <TooltipLabel
                                    label={t('sectionHeaders')}
                                    tooltip={t('backgroundColorForSectionHeaderBars')}
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
                                    label={t('alternateRow')}
                                    tooltip={t('backgroundColorForAlternateTableRows')}
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
                                    label={t('linkColor')}
                                    tooltip={t('colorForHyperlinksInThePdf')}
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
                                {t('typography')}
                            </div>

                            <SettingRow flow="wrap" label={(
                                <TooltipLabel
                                    label={t('fontFamily')}
                                    tooltip={t('pdfFontBuiltInFontsHelvetica')}
                                />
                            )}>

                                <Select
                                    size="sm"
                                    value={pdfStyle.fontFamily || 'helvetica'}
                                    onChange={(e) => updatePdfStyle({ fontFamily: e.target.value as any })}
                                    style={{ width: '100%' }}
                                >
                                    <Option value="helvetica">{t('helveticaDefault')}</Option>
                                    <Option value="times">{t('timesNewRoman')}</Option>
                                    <Option value="courier">{t('courierMonospace')}</Option>
                                    <Option disabled>{t('googleFonts')}</Option>
                                    <Option value="Roboto">{t('roboto')}</Option>
                                    <Option value="Open Sans">{t('openSans')}</Option>
                                    <Option value="Lato">{t('lato')}</Option>
                                    <Option value="Montserrat">{t('montserrat')}</Option>
                                    <Option value="Oswald">{t('oswald')}</Option>
                                    <Option value="Raleway">{t('raleway')}</Option>
                                    <Option value="Poppins">{t('poppins')}</Option>
                                    <Option value="Nunito">{t('nunito')}</Option>
                                    <Option value="Ubuntu">{t('ubuntu')}</Option>
                                    <Option value="Merriweather">{t('merriweather')}</Option>
                                    <Option value="PT Sans">{t('ptSans')}</Option>
                                    <Option value="Playfair Display">{t('playfairDisplay')}</Option>
                                    <Option value="Source Sans Pro">{t('sourceSansPro')}</Option>
                                    <Option value="Noto Sans">{t('notoSans')}</Option>
                                    <Option disabled>{t('custom')}</Option>
                                    <Option value="custom">{t('uploadCustomFontTtf')}</Option>
                                </Select>
                            </SettingRow>

                            {!['helvetica', 'times', 'courier', 'custom'].includes(pdfStyle.fontFamily || 'helvetica') && (
                                <p className="hint-text" style={{ color: 'var(--sys-color-primary-main)' }}>
                                    {t('googleFontsAreLoadedAutomaticallyWhen')}
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
                                            aria-label={t('uploadRegularFont')}
                                        />
                                        <input
                                            ref={fontBoldInputRef}
                                            type="file"
                                            accept=".ttf"
                                            onChange={(e) => handleFontUpload(e, 'bold')}
                                            style={{ display: 'none' }}
                                            aria-label={t('uploadBoldFont')}
                                        />

                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('regularFontRequired')} tooltip={t('uploadATrueTypeTtfFontFile')} />)}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                                                <Button
                                                    size="sm"
                                                    type="secondary"
                                                    onClick={() => fontRegularInputRef.current?.click()}
                                                >
                                                    <UploadIcon /> {t('uploadTtf')}
                                                </Button>
                                                {pdfStyle.customFont?.regularBase64 && (
                                                    <span style={{ fontSize: '11px', color: 'var(--sys-color-success-main)' }}>
                                                        ✓ {pdfStyle.customFont.name || t('font')} {t('loaded')}
                                                    </span>
                                                )}
                                            </div>
                                        </SettingRow>

                                        <SettingRow flow="wrap" label={(<TooltipLabel label={t('boldFontOptional')} tooltip={t('uploadABoldVariantOfYour')} />)}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                                                <Button
                                                    size="sm"
                                                    type="secondary"
                                                    onClick={() => fontBoldInputRef.current?.click()}
                                                    disabled={!pdfStyle.customFont?.regularBase64}
                                                >
                                                    <UploadIcon /> {t('uploadTtf')}
                                                </Button>
                                                {pdfStyle.customFont?.boldBase64 && (
                                                    <span style={{ fontSize: '11px', color: 'var(--sys-color-success-main)' }}>
                                                        {t('boldLoaded')}
                                                    </span>
                                                )}
                                            </div>
                                        </SettingRow>

                                        {pdfStyle.customFont?.regularBase64 && (
                                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('fontName')} tooltip={t('displayNameForTheFontUsed')} />)}>
                                                <TextInput
                                                    size="sm"
                                                    value={pdfStyle.customFont?.name || ''}
                                                    onChange={(e) => updatePdfStyle({
                                                        customFont: {
                                                            ...pdfStyle.customFont,
                                                            name: e.target.value
                                                        }
                                                    })}
                                                    placeholder={t('customFontName')}
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
                                                <TrashIcon /> {t('removeCustomFont')}
                                            </Button>
                                        )}
                                    </div>

                                    <p className="hint-text">
                                        {t('uploadTtfFontFilesRegularWeight')}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* PDF Table Settings Section */}
                        <div className="pdf-section-card">
                            <div className="pdf-section-title">
                                <TableIcon />
                                {t('pdfTableSettings')}
                            </div>
                            <p className="hint-text" style={{ marginTop: 0, marginBottom: '12px' }}>
                                {t('theseSettingsControlTableAppearanceIn')}
                            </p>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('tableHeaderBackground')} tooltip={t('backgroundColorForTableColumnHeaders')} />)}>
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

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('tableHeaderText')} tooltip={t('textColorForColumnHeaderLabels')} />)}>
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
                                    label={t('layerTitleBackground')}
                                    tooltip={t('backgroundColorForLayerTitleHeaders')}
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
                                    label={t('layerTitleText')}
                                    tooltip={t('textColorForLayerTitleHeaders')}
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

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('headerFontSize')} tooltip={t('fontSizeForTableColumnHeaders')} />)}>
                                <Select
                                    size="sm"
                                    value={String(pdfStyle.tableHeaderFontSize || 8)}
                                    onChange={(e) => updatePdfStyle({ tableHeaderFontSize: Number(e.target.value) })}
                                >
                                    <Option value="6">{t('_6ptSmall')}</Option>
                                    <Option value="7">{t('_7pt')}</Option>
                                    <Option value="8">{t('_8ptDefault')}</Option>
                                    <Option value="9">{t('_9pt')}</Option>
                                    <Option value="10">{t('_10ptLarge')}</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('dataFontSize')} tooltip={t('fontSizeForTableDataCells')} />)}>
                                <Select
                                    size="sm"
                                    value={String(pdfStyle.tableDataFontSize || 8)}
                                    onChange={(e) => updatePdfStyle({ tableDataFontSize: Number(e.target.value) })}
                                >
                                    <Option value="6">{t('_6ptSmall')}</Option>
                                    <Option value="7">{t('_7pt')}</Option>
                                    <Option value="8">{t('_8ptDefault')}</Option>
                                    <Option value="9">{t('_9pt')}</Option>
                                    <Option value="10">{t('_10ptLarge')}</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('dataTextColor')} tooltip={t('textColorForTableDataCells')} />)}>
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

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('showTableBorders')} tooltip={t('displayGridLinesAndBordersAround')} />)}>
                                <Switch
                                    checked={pdfStyle.tableShowBorders !== false}
                                    onChange={(e) => updatePdfStyle({ tableShowBorders: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            {pdfStyle.tableShowBorders !== false && (
                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('borderColor')} tooltip={t('colorForTableGridLinesAnd')} />)}>
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

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('stripedRows')} tooltip={t('alternateRowBackgroundColorsForEasier')} />)}>
                                <Switch
                                    checked={pdfStyle.tableStripedRows !== false}
                                    onChange={(e) => updatePdfStyle({ tableStripedRows: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('rowHeight')} tooltip={t('heightOfEachDataRowIn')} />)}>
                                <Select
                                    size="sm"
                                    value={String(pdfStyle.tableRowHeight || 7)}
                                    onChange={(e) => updatePdfStyle({ tableRowHeight: Number(e.target.value) })}
                                >
                                    <Option value="5">{t('_5mmCompact')}</Option>
                                    <Option value="6">{t('_6mm')}</Option>
                                    <Option value="7">{t('_7mmDefault')}</Option>
                                    <Option value="8">{t('_8mm')}</Option>
                                    <Option value="9">{t('_9mmSpacious')}</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('maxColumns')} tooltip={t('maximumNumberOfColumnsToDisplay')} />)}>
                                <Select
                                    size="sm"
                                    value={String(pdfStyle.tableMaxColumns || 6)}
                                    onChange={(e) => updatePdfStyle({ tableMaxColumns: Number(e.target.value) })}
                                >
                                    <Option value="1">{t('_1Column')}</Option>
                                    <Option value="2">{t('_2Columns')}</Option>
                                    <Option value="3">{t('_3Columns')}</Option>
                                    <Option value="4">{t('_4Columns')}</Option>
                                    <Option value="5">{t('_5Columns')}</Option>
                                    <Option value="6">{t('_6ColumnsDefault')}</Option>
                                    <Option value="8">{t('_8Columns')}</Option>
                                    <Option value="10">{t('_10Columns')}</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('maxRows')} tooltip={t('maximumNumberOfDataRowsPer')} />)}>
                                <Select
                                    size="sm"
                                    value={String(pdfStyle.tableMaxRows || 15)}
                                    onChange={(e) => updatePdfStyle({ tableMaxRows: Number(e.target.value) })}
                                >
                                    <Option value="5">{t('_5Rows')}</Option>
                                    <Option value="10">{t('_10Rows')}</Option>
                                    <Option value="15">{t('_15RowsDefault')}</Option>
                                    <Option value="20">{t('_20Rows')}</Option>
                                    <Option value="25">{t('_25Rows')}</Option>
                                    <Option value="50">{t('_50Rows')}</Option>
                                    <Option value="100">{t('_100RowsAll')}</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('headerRowHeight')} tooltip={t('heightOfTheTableHeaderRow')} />)}>
                                <Select
                                    size="sm"
                                    value={String(pdfStyle.tableHeaderHeight || 8)}
                                    onChange={(e) => updatePdfStyle({ tableHeaderHeight: Number(e.target.value) })}
                                >
                                    <Option value="6">{t('_6mmCompact')}</Option>
                                    <Option value="7">{t('_7mm')}</Option>
                                    <Option value="8">{t('_8mmDefault')}</Option>
                                    <Option value="9">{t('_9mm')}</Option>
                                    <Option value="10">{t('_10mmSpacious')}</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('cellPadding')} tooltip={t('spaceBetweenCellContentAndCell')} />)}>
                                <Select
                                    size="sm"
                                    value={String(pdfStyle.tableCellPadding || 2)}
                                    onChange={(e) => updatePdfStyle({ tableCellPadding: Number(e.target.value) })}
                                >
                                    <Option value="1">{t('_1mmTight')}</Option>
                                    <Option value="2">{t('_2mmDefault')}</Option>
                                    <Option value="3">{t('_3mm')}</Option>
                                    <Option value="4">{t('_4mmSpacious')}</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('includeRelatedTables')} tooltip={t('includeRelatedTableDataChildRecords')} />)}>
                                <Switch
                                    checked={config.pdfIncludeRelatedTables || false}
                                    onChange={(e) => updateConfig('pdfIncludeRelatedTables', (e.target as HTMLInputElement).checked)}
                                />
                            </SettingRow>
                            <p className="hint-text" style={{ marginTop: '4px', marginBottom: '8px' }}>
                                {t('whenEnabledRelatedTableDataConfigured')}
                            </p>
                        </div>

                        {/* WCAG Accessibility Settings Section */}
                        <div className="pdf-section-card">
                            <div className="pdf-section-title">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
                                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 12.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zM8 4a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 8 4zm0 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                                </svg>
                                {t('accessibilityWcag21')}
                            </div>
                            <p className="hint-text" style={{ marginBottom: '12px' }}>
                                {t('theseOptionsEnhancePdfAccessibilityFor')}
                            </p>

                            {/* Document Metadata */}
                            <div style={{ marginBottom: '8px', fontWeight: 500, fontSize: '12px', color: 'var(--sys-color-primary-main)' }}>
                                {t('documentMetadataWcag242')}
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('documentLanguage')}>
                                    <Select
                                        size="sm"
                                        value={pdfAccessibility.documentLanguage || 'en-US'}
                                        onChange={(e) => updatePdfAccessibility({ documentLanguage: e.target.value })}
                                    >
                                        <Option value="af">{t('afrikaans')}</Option>
                                        <Option value="sq">{t('albanianShqip')}</Option>
                                        <Option value="am">{t('amharic')}</Option>
                                        <Option value="ar">{t('arabic')}</Option>
                                        <Option value="ar-EG">{t('arabicEgypt')}</Option>
                                        <Option value="ar-SA">{t('arabicSaudiArabia')}</Option>
                                        <Option value="hy">{t('armenianHayeren')}</Option>
                                        <Option value="ast">{t('asturianAsturianu')}</Option>
                                        <Option value="az">{t('azerbaijaniAzRbaycan')}</Option>
                                        <Option value="eu">{t('basqueEuskara')}</Option>
                                        <Option value="be">{t('belarusian')}</Option>
                                        <Option value="bn">{t('bengali')}</Option>
                                        <Option value="bs">{t('bosnianBosanski')}</Option>
                                        <Option value="br">{t('bretonBrezhoneg')}</Option>
                                        <Option value="bg">{t('bulgarian')}</Option>
                                        <Option value="my">{t('burmese')}</Option>
                                        <Option value="ca">{t('catalanCatal')}</Option>
                                        <Option value="zh">{t('chinese')}</Option>
                                        <Option value="zh-HK">{t('chineseHongKong')}</Option>
                                        <Option value="zh-CN">{t('chineseSimplified')}</Option>
                                        <Option value="zh-TW">{t('chineseTraditional')}</Option>
                                        <Option value="co">{t('corsicanCorsu')}</Option>
                                        <Option value="hr">{t('croatianHrvatski')}</Option>
                                        <Option value="cs">{t('czechETina')}</Option>
                                        <Option value="da">{t('danishDansk')}</Option>
                                        <Option value="nl">{t('dutchNederlands')}</Option>
                                        <Option value="nl-BE">{t('dutchBelgiumFlemish')}</Option>
                                        <Option value="en-AU">{t('englishAustralia')}</Option>
                                        <Option value="en-CA">{t('englishCanada')}</Option>
                                        <Option value="en-IE">{t('englishIreland')}</Option>
                                        <Option value="en-NZ">{t('englishNewZealand')}</Option>
                                        <Option value="en-ZA">{t('englishSouthAfrica')}</Option>
                                        <Option value="en-GB">{t('englishUk')}</Option>
                                        <Option value="en-US">{t('englishUs')}</Option>
                                        <Option value="eo">{t('esperanto')}</Option>
                                        <Option value="et">{t('estonianEesti')}</Option>
                                        <Option value="fo">{t('faroeseFRoyskt')}</Option>
                                        <Option value="tl">{t('filipinoTagalog')}</Option>
                                        <Option value="fi">{t('finnishSuomi')}</Option>
                                        <Option value="fr">{t('frenchFranAis')}</Option>
                                        <Option value="fr-BE">{t('frenchBelgium')}</Option>
                                        <Option value="fr-CA">{t('frenchCanada')}</Option>
                                        <Option value="fr-CH">{t('frenchSwitzerland')}</Option>
                                        <Option value="fy">{t('frisianFrysk')}</Option>
                                        <Option value="gl">{t('galicianGalego')}</Option>
                                        <Option value="ka">{t('georgian')}</Option>
                                        <Option value="de">{t('germanDeutsch')}</Option>
                                        <Option value="de-AT">{t('germanAustria')}</Option>
                                        <Option value="de-CH">{t('germanSwitzerland')}</Option>
                                        <Option value="el">{t('greek')}</Option>
                                        <Option value="gu">{t('gujarati')}</Option>
                                        <Option value="ha">{t('hausa')}</Option>
                                        <Option value="haw">{t('hawaiianLeloHawaiI')}</Option>
                                        <Option value="he">{t('hebrew')}</Option>
                                        <Option value="hi">{t('hindi')}</Option>
                                        <Option value="hu">{t('hungarianMagyar')}</Option>
                                        <Option value="is">{t('icelandicSlenska')}</Option>
                                        <Option value="ig">{t('igbo')}</Option>
                                        <Option value="id">{t('indonesianBahasaIndonesia')}</Option>
                                        <Option value="ga">{t('irishGaeilge')}</Option>
                                        <Option value="it">{t('italianItaliano')}</Option>
                                        <Option value="it-CH">{t('italianSwitzerland')}</Option>
                                        <Option value="ja">{t('japanese')}</Option>
                                        <Option value="jv">{t('javaneseBasaJawa')}</Option>
                                        <Option value="kn">{t('kannada')}</Option>
                                        <Option value="kk">{t('kazakh')}</Option>
                                        <Option value="km">{t('khmer')}</Option>
                                        <Option value="rw">{t('kinyarwanda')}</Option>
                                        <Option value="ko">{t('korean')}</Option>
                                        <Option value="ku">{t('kurdishKurd')}</Option>
                                        <Option value="ckb">{t('kurdishSorani')}</Option>
                                        <Option value="ky">{t('kyrgyz')}</Option>
                                        <Option value="lo">{t('lao')}</Option>
                                        <Option value="la">{t('latinLatina')}</Option>
                                        <Option value="lv">{t('latvianLatvieU')}</Option>
                                        <Option value="lt">{t('lithuanianLietuvi')}</Option>
                                        <Option value="lb">{t('luxembourgishLTzebuergesch')}</Option>
                                        <Option value="mk">{t('macedonian')}</Option>
                                        <Option value="mg">{t('malagasy')}</Option>
                                        <Option value="ms">{t('malayBahasaMelayu')}</Option>
                                        <Option value="ml">{t('malayalam')}</Option>
                                        <Option value="mt">{t('malteseMalti')}</Option>
                                        <Option value="mi">{t('mOriTeReoMOri')}</Option>
                                        <Option value="mr">{t('marathi')}</Option>
                                        <Option value="mn">{t('mongolian')}</Option>
                                        <Option value="ne">{t('nepali')}</Option>
                                        <Option value="no">{t('norwegianNorsk')}</Option>
                                        <Option value="nb">{t('norwegianBokmL')}</Option>
                                        <Option value="nn">{t('norwegianNynorsk')}</Option>
                                        <Option value="sme">{t('northernSami')}</Option>
                                        <Option value="oc">{t('occitan')}</Option>
                                        <Option value="or">{t('odia')}</Option>
                                        <Option value="ps">{t('pashto')}</Option>
                                        <Option value="fa">{t('persianFarsi')}</Option>
                                        <Option value="pl">{t('polishPolski')}</Option>
                                        <Option value="pt">{t('portuguesePortuguS')}</Option>
                                        <Option value="pt-BR">{t('portugueseBrazil')}</Option>
                                        <Option value="pa">{t('punjabi')}</Option>
                                        <Option value="ro">{t('romanianRomN')}</Option>
                                        <Option value="rm">{t('romanshRumantsch')}</Option>
                                        <Option value="ru">{t('russian')}</Option>
                                        <Option value="sm">{t('samoanGaganaSamoa')}</Option>
                                        <Option value="gd">{t('scottishGaelicGIdhlig')}</Option>
                                        <Option value="sr">{t('serbian')}</Option>
                                        <Option value="sr-Latn">{t('serbianLatin')}</Option>
                                        <Option value="si">{t('sinhala')}</Option>
                                        <Option value="sk">{t('slovakSlovenIna')}</Option>
                                        <Option value="sl">{t('slovenianSlovenIna')}</Option>
                                        <Option value="so">{t('somaliSoomaali')}</Option>
                                        <Option value="es">{t('spanishEspaOl')}</Option>
                                        <Option value="es-AR">{t('spanishArgentina')}</Option>
                                        <Option value="es-MX">{t('spanishMexico')}</Option>
                                        <Option value="sw">{t('swahiliKiswahili')}</Option>
                                        <Option value="sv">{t('swedishSvenska')}</Option>
                                        <Option value="ta">{t('tamil')}</Option>
                                        <Option value="tt">{t('tatar')}</Option>
                                        <Option value="te">{t('telugu')}</Option>
                                        <Option value="th">{t('thai')}</Option>
                                        <Option value="to">{t('tonganLeaFakaTonga')}</Option>
                                        <Option value="tr">{t('turkishTRkE')}</Option>
                                        <Option value="tk">{t('turkmenTRkmen')}</Option>
                                        <Option value="uk">{t('ukrainian')}</Option>
                                        <Option value="ur">{t('urdu')}</Option>
                                        <Option value="uz">{t('uzbekOZbekcha')}</Option>
                                        <Option value="vi">{t('vietnameseTiNgViT')}</Option>
                                        <Option value="cy">{t('welshCymraeg')}</Option>
                                        <Option value="xh">{t('xhosaIsiXhosa')}</Option>
                                        <Option value="yi">{t('yiddish')}</Option>
                                        <Option value="yo">{t('yorubaYorB')}</Option>
                                        <Option value="zu">{t('zuluIsiZulu')}</Option>
                                    </Select>
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    {t('languageCodeEmbeddedInPdfFor')}
                                </p>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('documentAuthor')}>
                                    <TextInput
                                        size="sm"
                                        value={pdfAccessibility.documentAuthor || ''}
                                        onChange={(e) => updatePdfAccessibility({ documentAuthor: e.target.value })}
                                        placeholder={t('eGGisDivision')}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    {t('authorNameInPdfMetadata')}
                                </p>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('documentCreator')}>
                                    <TextInput
                                        size="sm"
                                        value={pdfAccessibility.documentCreator || ''}
                                        onChange={(e) => updatePdfAccessibility({ documentCreator: e.target.value })}
                                        placeholder={t('eGPropertyReportWidget')}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    {t('applicationCreatorNameInPdfMetadata')}
                                </p>
                            </div>

                            {/* Alt Text Templates */}
                            <div style={{ marginBottom: '8px', marginTop: '16px', fontWeight: 500, fontSize: '12px', color: 'var(--sys-color-primary-main)' }}>
                                {t('altTextTemplatesWcag11')}
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('includeMapAltText')}>
                                    <Switch
                                        checked={pdfAccessibility.includeMapAltText !== false}
                                        onChange={(e) => updatePdfAccessibility({ includeMapAltText: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                            </div>

                            {pdfAccessibility.includeMapAltText !== false && (
                                <div style={{ marginBottom: '12px', marginLeft: '16px' }}>
                                    <SettingRow flow="wrap" label={t('mapAltTextTemplate')}>
                                        <TextInput
                                            size="sm"
                                            value={pdfAccessibility.mapAltTextTemplate || 'Map showing the location of {address}'}
                                            onChange={(e) => updatePdfAccessibility({ mapAltTextTemplate: e.target.value })}
                                            placeholder={t('mapShowingTheLocationOfAddress')}
                                        />
                                    </SettingRow>
                                    <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                        {t('use')} {'{address}'} {t('asPlaceholderForTheSearchedAddress')}
                                    </p>
                                </div>
                            )}

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('includeLogoAltText')}>
                                    <Switch
                                        checked={pdfAccessibility.includeLogoAltText !== false}
                                        onChange={(e) => updatePdfAccessibility({ includeLogoAltText: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                            </div>

                            {pdfAccessibility.includeLogoAltText !== false && (
                                <div style={{ marginBottom: '12px', marginLeft: '16px' }}>
                                    <SettingRow flow="wrap" label={t('logoAltTextTemplate')}>
                                        <TextInput
                                            size="sm"
                                            value={pdfAccessibility.logoAltTextTemplate || 'Organization logo'}
                                            onChange={(e) => updatePdfAccessibility({ logoAltTextTemplate: e.target.value })}
                                            placeholder={t('organizationLogo')}
                                        />
                                    </SettingRow>
                                </div>
                            )}

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('chartAltTextTemplate')}>
                                    <TextInput
                                        size="sm"
                                        value={pdfAccessibility.chartAltTextTemplate || 'Chart showing {chartType} visualization of {dataDescription}'}
                                        onChange={(e) => updatePdfAccessibility({ chartAltTextTemplate: e.target.value })}
                                        placeholder={t('chartShowingChartTypeVisualizationOfDataDescription')}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    {t('use')} {'{chartType}'} and {'{dataDescription}'} {t('asPlaceholders')}
                                </p>
                            </div>

                            {/* Table Summary Templates */}
                            <div style={{ marginBottom: '8px', marginTop: '16px', fontWeight: 500, fontSize: '12px', color: 'var(--sys-color-primary-main)' }}>
                                {t('tableSummaryTemplatesWcag13')}
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('includeTableSummaries')}>
                                    <Switch
                                        checked={pdfAccessibility.includeTableSummaries !== false}
                                        onChange={(e) => updatePdfAccessibility({ includeTableSummaries: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                            </div>

                            {pdfAccessibility.includeTableSummaries !== false && (
                                <div style={{ marginBottom: '12px', marginLeft: '16px' }}>
                                    <SettingRow flow="wrap" label={t('tableSummaryTemplate')}>
                                        <TextInput
                                            size="sm"
                                            value={pdfAccessibility.tableSummaryTemplate || 'Data table: {layerTitle} - {recordCount} records, {columnCount} columns'}
                                            onChange={(e) => updatePdfAccessibility({ tableSummaryTemplate: e.target.value })}
                                            placeholder={t('dataTableLayerTitleRecordCountRecordsColumnCount')}
                                        />
                                    </SettingRow>
                                    <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                        {t('use')} {'{layerTitle}'}, {'{recordCount}'}, {'{columnCount}'} {t('asPlaceholders')}
                                    </p>
                                </div>
                            )}

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('includeRelatedTableSummaries')}>
                                    <Switch
                                        checked={pdfAccessibility.includeRelatedTableSummaries !== false}
                                        onChange={(e) => updatePdfAccessibility({ includeRelatedTableSummaries: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                            </div>

                            {pdfAccessibility.includeRelatedTableSummaries !== false && (
                                <div style={{ marginBottom: '12px', marginLeft: '16px' }}>
                                    <SettingRow flow="wrap" label={t('relatedTableSummaryTemplate')}>
                                        <TextInput
                                            size="sm"
                                            value={pdfAccessibility.relatedTableSummaryTemplate || 'Related data: {tableName} - {recordCount} records, {columnCount} columns'}
                                            onChange={(e) => updatePdfAccessibility({ relatedTableSummaryTemplate: e.target.value })}
                                            placeholder={t('relatedDataTableNameRecordCountRecordsColumnCount')}
                                        />
                                    </SettingRow>
                                    <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                        {t('use')} {'{tableName}'}, {'{recordCount}'}, {'{columnCount}'} {t('asPlaceholders')}
                                    </p>
                                </div>
                            )}

                            {/* Font & Reading Settings */}
                            <div style={{ marginBottom: '8px', marginTop: '16px', fontWeight: 500, fontSize: '12px', color: 'var(--sys-color-primary-main)' }}>
                                {t('fontReadingOrder')}
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('minimumFontSizePt')}>
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
                                    {t('wcag144MinimumFont')}
                                </p>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('readingOrderMarkers')}>
                                    <Switch
                                        checked={pdfAccessibility.includeReadingOrderMarkers !== false}
                                        onChange={(e) => updatePdfAccessibility({ includeReadingOrderMarkers: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    {t('wcag132IncludeMarkers')}
                                </p>
                            </div>

                            {/* Visible Text Options */}
                            <div style={{ marginBottom: '8px', marginTop: '16px', fontWeight: 500, fontSize: '12px', color: 'var(--sys-color-primary-main)' }}>
                                {t('visibleAccessibilityText')}
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('showMapAltText')}>
                                    <Switch
                                        checked={pdfStyle.showAccessibilityText !== false}
                                        onChange={(e) => updatePdfStyle({ showAccessibilityText: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    {t('wcag111ShowsMap')}
                                </p>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('showTableSummaries')}>
                                    <Switch
                                        checked={pdfStyle.showTableSummaries !== false}
                                        onChange={(e) => updatePdfStyle({ showTableSummaries: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    {t('wcag131ShowsData')}
                                </p>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('showRelatedTableSummaries')}>
                                    <Switch
                                        checked={pdfStyle.showRelatedTableSummaries !== false}
                                        onChange={(e) => updatePdfStyle({ showRelatedTableSummaries: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    {t('wcag131ShowsRelated')}
                                </p>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('showFullURLs')}>
                                    <Switch
                                        checked={pdfStyle.showFullUrlsInPdf || false}
                                        onChange={(e) => updatePdfStyle({ showFullUrlsInPdf: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    {t('wcag244ShowsFull')}
                                </p>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('showSectionNumbers')}>
                                    <Switch
                                        checked={pdfStyle.showSectionNumbers || false}
                                        onChange={(e) => updatePdfStyle({ showSectionNumbers: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    {t('wcag131NumbersSections')}
                                </p>
                            </div>

                            {/* Navigation Options */}
                            <div style={{ marginBottom: '8px', marginTop: '16px', fontWeight: 500, fontSize: '12px', color: 'var(--sys-color-primary-main)' }}>
                                {t('navigationStructure')}
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('pdfBookmarks')}>
                                    <Switch
                                        checked={pdfStyle.enablePdfBookmarks !== false}
                                        onChange={(e) => updatePdfStyle({ enablePdfBookmarks: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    {t('wcag245AddsClickable')}
                                </p>
                            </div>

                            {pdfStyle.enablePdfBookmarks !== false && (
                                <div style={{ marginBottom: '12px', marginLeft: '16px' }}>
                                    <SettingRow flow="wrap" label={t('hierarchicalBookmarks')}>
                                        <Switch
                                            checked={pdfStyle.enableHierarchicalBookmarks !== false}
                                            onChange={(e) => updatePdfStyle({ enableHierarchicalBookmarks: (e.target as HTMLInputElement).checked })}
                                        />
                                    </SettingRow>
                                    <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                        {t('createsNestedBookmarksSectionLayerRelated')}
                                    </p>
                                </div>
                            )}

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('tableOfContents')}>
                                    <Switch
                                        checked={pdfStyle.enableTableOfContents || false}
                                        onChange={(e) => updatePdfStyle({ enableTableOfContents: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    {t('wcag245AddsA')}
                                </p>
                            </div>

                            {pdfStyle.enableTableOfContents && (
                                <>
                                    <div style={{ marginBottom: '12px', marginLeft: '16px' }}>
                                        <SettingRow flow="wrap" label={t('tocTitle')}>
                                            <TextInput
                                                size="sm"
                                                value={pdfStyle.tocTitle || 'Table of Contents'}
                                                onChange={(e) => updatePdfStyle({ tocTitle: e.target.value })}
                                                placeholder={t('tableOfContents')}
                                            />
                                        </SettingRow>
                                    </div>
                                    <div style={{ marginBottom: '12px', marginLeft: '16px' }}>
                                        <SettingRow flow="wrap" label={t('includeLayersInToc')}>
                                            <Switch
                                                checked={pdfStyle.tocIncludeLayers !== false}
                                                onChange={(e) => updatePdfStyle({ tocIncludeLayers: (e.target as HTMLInputElement).checked })}
                                            />
                                        </SettingRow>
                                    </div>
                                    <div style={{ marginBottom: '12px', marginLeft: '16px' }}>
                                        <SettingRow flow="wrap" label={t('includeRelatedTablesInToc')}>
                                            <Switch
                                                checked={pdfStyle.tocIncludeRelatedTables || false}
                                                onChange={(e) => updatePdfStyle({ tocIncludeRelatedTables: (e.target as HTMLInputElement).checked })}
                                            />
                                        </SettingRow>
                                    </div>
                                    <div style={{ marginBottom: '12px', marginLeft: '16px' }}>
                                        <SettingRow flow="wrap" label={t('pageBreakAfterToc')}>
                                            <Switch
                                                checked={pdfStyle.tocPageBreakAfter !== false}
                                                onChange={(e) => updatePdfStyle({ tocPageBreakAfter: (e.target as HTMLInputElement).checked })}
                                            />
                                        </SettingRow>
                                    </div>
                                </>
                            )}

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('fullTimestamp')}>
                                    <Switch
                                        checked={pdfStyle.showGeneratedTimestamp || false}
                                        onChange={(e) => updatePdfStyle({ showGeneratedTimestamp: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    {t('wcag321ShowsDate')}
                                </p>
                            </div>

                            {/* Visual Accessibility */}
                            <div style={{ marginBottom: '8px', marginTop: '16px', fontWeight: 500, fontSize: '12px', color: 'var(--sys-color-primary-main)' }}>
                                {t('visualAccessibility')}
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('highContrastMode')}>
                                    <Switch
                                        checked={pdfStyle.highContrastMode || false}
                                        onChange={(e) => updatePdfStyle({ highContrastMode: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    {t('wcag143UsesBlack')}
                                </p>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <SettingRow flow="wrap" label={t('largeTextMode')}>
                                    <Switch
                                        checked={pdfStyle.largeTextMode || false}
                                        onChange={(e) => updatePdfStyle({ largeTextMode: (e.target as HTMLInputElement).checked })}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    {t('wcag144IncreasesAll')}
                                </p>
                            </div>

                            {/* Contact Info */}
                            <div style={{ marginBottom: '8px', marginTop: '16px', fontWeight: 500, fontSize: '12px', color: 'var(--sys-color-primary-main)' }}>
                                {t('accessibilitySupport')}
                            </div>

                            <div style={{ marginBottom: '0' }}>
                                <SettingRow flow="wrap" label={t('accessibilityContact')}>
                                    <TextInput
                                        size="sm"
                                        value={pdfStyle.accessibilityContact || ''}
                                        onChange={(e) => updatePdfStyle({ accessibilityContact: e.target.value })}
                                        placeholder={t('eGForAccessibilityHelp970')}
                                    />
                                </SettingRow>
                                <p className="hint-text" style={{ marginTop: '2px', marginBottom: '0' }}>
                                    {t('wcag335ContactInfo')}
                                </p>
                            </div>
                        </div>

                        {/* Related Tables PDF Settings Section */}
                        <div className="pdf-section-card">
                            <div className="pdf-section-title">
                                <DataIcon />
                                {t('relatedTablesPdf')}
                            </div>
                            <p className="hint-text" style={{ marginTop: 0, marginBottom: '12px' }}>
                                {t('additionalSettingsForHowRelatedTables')}
                            </p>

                            {config.pdfIncludeRelatedTables && (
                                <>
                                    <SettingRow flow="wrap" label={t('includeRelatedTableCharts')}>
                                        <Switch
                                            checked={config.pdfIncludeRelatedTableCharts !== false}
                                            onChange={(evt, checked) => {
                                                updateConfig('pdfIncludeRelatedTableCharts', checked)
                                            }}
                                        />
                                    </SettingRow>
                                    <p className="hint-text" style={{ marginTop: '2px', marginBottom: '8px' }}>
                                        {t('captureAndIncludeChartsFromRelated')}
                                    </p>

                                    <SettingRow flow="wrap" label={t('relatedTableHeaderColor')}>
                                        <TextInput
                                            size="sm"
                                            type="text"
                                            value={pdfStyle.relatedTableHeaderColor || '#DCDCDC'}
                                            onChange={(e) => updatePdfStyle({ relatedTableHeaderColor: e.target.value })}
                                            style={{ width: 100 }}
                                        />
                                    </SettingRow>

                                    <SettingRow flow="wrap" label={t('relatedTableIndentMm')}>
                                        <NumericInput
                                            size="sm"
                                            value={pdfStyle.relatedTableIndent || 5}
                                            min={0}
                                            max={20}
                                            onChange={(value) => updatePdfStyle({ relatedTableIndent: value })}
                                            style={{ width: 80 }}
                                        />
                                    </SettingRow>

                                    <SettingRow flow="wrap" label={t('relatedTableMaxRows')}>
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
                                        {t('maximumRowsPerRelatedTableIn')}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Chart Settings Section */}
                        <div className="pdf-section-card">
                            <div className="pdf-section-title">
                                <ChartIcon />
                                {t('defaultChartSettings')}
                            </div>
                            <p className="hint-text" style={{ marginTop: 0, marginBottom: '12px' }}>
                                {t('defaultSettingsAppliedToAllCharts')}
                            </p>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('chartType')} tooltip={t('defaultVisualizationTypeForChartsBar')} />)}>
                                <Select
                                    size="sm"
                                    value={config.defaultChartConfig?.chartType || 'bar'}
                                    onChange={(e) => updateDefaultChartConfig({ chartType: e.target.value as any })}
                                >
                                    <Option value="bar">{t('barChart')}</Option>
                                    <Option value="pie">{t('pieChart')}</Option>
                                    <Option value="donut">{t('donutChart')}</Option>
                                    <Option value="area">{t('areaChart')}</Option>
                                    <Option value="line">{t('lineChart')}</Option>
                                    <Option value="radialBar">{t('radialBar')}</Option>
                                    <Option value="composite">{t('composite')}</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('showLegend')} tooltip={t('displayALegendExplainingChartColors')} />)}>
                                <Switch
                                    checked={config.defaultChartConfig?.showLegend !== false}
                                    onChange={(e) => updateDefaultChartConfig({ showLegend: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('legendPosition')} tooltip={t('whereToPlaceTheChartLegend')} />)}>
                                <Select
                                    size="sm"
                                    value={config.defaultChartConfig?.legendPosition || 'bottom'}
                                    onChange={(e) => updateDefaultChartConfig({ legendPosition: e.target.value as any })}
                                >
                                    <Option value="top">{t('top')}</Option>
                                    <Option value="bottom">{t('bottom')}</Option>
                                    <Option value="left">{t('left')}</Option>
                                    <Option value="right">{t('right')}</Option>
                                </Select>
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('showValues')} tooltip={t('displayNumericValuesDirectlyOnChart')} />)}>
                                <Switch
                                    checked={config.defaultChartConfig?.showValues || false}
                                    onChange={(e) => updateDefaultChartConfig({ showValues: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('showGrid')} tooltip={t('displayBackgroundGridLinesForEasier')} />)}>
                                <Switch
                                    checked={config.defaultChartConfig?.showGrid !== false}
                                    onChange={(e) => updateDefaultChartConfig({ showGrid: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('animations')} tooltip={t('enableSmoothAnimationsWhenChartsLoad')} />)}>
                                <Switch
                                    checked={config.defaultChartConfig?.animate !== false}
                                    onChange={(e) => updateDefaultChartConfig({ animate: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('stacked')} tooltip={t('stackBarAreaChartSeriesOn')} />)}>
                                <Switch
                                    checked={config.defaultChartConfig?.stacked || false}
                                    onChange={(e) => updateDefaultChartConfig({ stacked: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('chartHeightPx')} tooltip={t('defaultHeightOfChartsInPixels')} />)}>
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
                                {t('onScreenTableSettings')}
                            </div>
                            <p className="hint-text" style={{ marginTop: 0, marginBottom: '12px' }}>
                                {t('theseSettingsControlTheInteractiveTable')}
                            </p>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('enableSorting')} tooltip={t('allowUsersToClickColumnHeaders3')} />)}>
                                <Switch
                                    checked={config.defaultTableConfig?.enableSorting !== false}
                                    onChange={(e) => updateDefaultTableConfig({ enableSorting: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('enableFiltering')} tooltip={t('showFilterInputsAboveColumnsTo')} />)}>
                                <Switch
                                    checked={config.defaultTableConfig?.enableFiltering || false}
                                    onChange={(e) => updateDefaultTableConfig({ enableFiltering: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('enablePagination2')} tooltip={t('splitLargeTablesIntoPagesInstead')} />)}>
                                <Switch
                                    checked={config.defaultTableConfig?.enablePagination !== false}
                                    onChange={(e) => updateDefaultTableConfig({ enablePagination: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            {config.defaultTableConfig?.enablePagination !== false && (
                                <SettingRow flow="wrap" label={(<TooltipLabel label={t('pageSize')} tooltip={t('numberOfRowsToDisplayPer2')} />)}>
                                    <Select
                                        size="sm"
                                        value={String(config.defaultTableConfig?.pageSize || 10)}
                                        onChange={(e) => updateDefaultTableConfig({ pageSize: Number(e.target.value) })}
                                    >
                                        <Option value="5">{t('_5Rows')}</Option>
                                        <Option value="10">{t('_10Rows')}</Option>
                                        <Option value="25">{t('_25Rows')}</Option>
                                        <Option value="50">{t('_50Rows')}</Option>
                                        <Option value="100">{t('_100Rows')}</Option>
                                    </Select>
                                </SettingRow>
                            )}

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('stickyHeader')} tooltip={t('keepColumnHeadersVisibleWhenScrolling')} />)}>
                                <Switch
                                    checked={config.defaultTableConfig?.stickyHeader !== false}
                                    onChange={(e) => updateDefaultTableConfig({ stickyHeader: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('stripedRows')} tooltip={t('alternateRowBackgroundColorsForEasier2')} />)}>
                                <Switch
                                    checked={config.defaultTableConfig?.stripedRows !== false}
                                    onChange={(e) => updateDefaultTableConfig({ stripedRows: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('highlightOnHover')} tooltip={t('highlightTableRowsWhenTheMouse')} />)}>
                                <Switch
                                    checked={config.defaultTableConfig?.highlightOnHover !== false}
                                    onChange={(e) => updateDefaultTableConfig({ highlightOnHover: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('compactMode')} tooltip={t('reduceRowHeightAndPaddingFor')} />)}>
                                <Switch
                                    checked={config.defaultTableConfig?.compactMode || false}
                                    onChange={(e) => updateDefaultTableConfig({ compactMode: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>

                            <SettingRow flow="wrap" label={(<TooltipLabel label={t('showRowNumbers')} tooltip={t('displayRowNumbersInTheFirst')} />)}>
                                <Switch
                                    checked={config.defaultTableConfig?.showRowNumbers || false}
                                    onChange={(e) => updateDefaultTableConfig({ showRowNumbers: (e.target as HTMLInputElement).checked })}
                                />
                            </SettingRow>
                            <SettingRow tag='label' label={t('showHelpGuide')}>
                              <Switch checked={props.config?.showHelp !== false} onChange={(evt) => { props.onSettingChange({ id: (props as any).id, config: (props.config as any).set('showHelp', evt.target.checked) }) }} aria-label={t('showTheQuestionMarkButtonThat')} />
                            </SettingRow>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Setting