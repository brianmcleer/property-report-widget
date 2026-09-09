// Widget-level type shims for third-party packages this widget imports. Mode B
// companion to src/exb-editor-shims.d.ts (the shared master copy from
// widgets\_vs, which is copied verbatim and never edited per widget). Visual
// Studio only; webpack ignores these files and types against the real packages.
// Members are `any` on purpose: these declarations exist so the Error List stays
// empty under the EB 1.21 pnpm layout, not to replace the packages' own types.

declare module 'calcite-components' {
  export const CalciteIcon: any
  export const CalciteButton: any
  export const CalciteLoader: any
  const _default: any
  export default _default
}

declare module '@tanstack/react-table' {
  export type ColumnDef<TData = any, TValue = unknown> = any
  export type SortingState = any[]
  export type ColumnFiltersState = any[]
  export type PaginationState = any
  export type ColumnSizingState = any
  export const useReactTable: any
  export const getCoreRowModel: any
  export const getSortedRowModel: any
  export const getFilteredRowModel: any
  export const getPaginationRowModel: any
  export const flexRender: any
}

declare module 'html2canvas' {
  const html2canvas: any
  export default html2canvas
}

declare module 'jspdf' {
  export class jsPDF {
    constructor(options?: any)
    [key: string]: any
  }
  export default jsPDF
}

declare module 'recharts' {
  export const BarChart: any
  export const Bar: any
  export const XAxis: any
  export const YAxis: any
  export const Tooltip: any
  export const ResponsiveContainer: any
  export const PieChart: any
  export const Pie: any
  export const Cell: any
  export const Legend: any
  export const CartesianGrid: any
  export const AreaChart: any
  export const Area: any
  export const LineChart: any
  export const Line: any
  export const RadialBarChart: any
  export const RadialBar: any
  export const ComposedChart: any
  export const LabelList: any
}

// ---- ArcGIS Maps SDK modules this widget imports as both value and type ----
// The master shim's `declare module 'esri/*'` exports a default value, which is
// enough for `new Point(...)` but not for `let p: Point`. A class default export
// serves both uses. Specific module names take precedence over the wildcard.
declare module 'esri/geometry/Point' { export default class Point { constructor(props?: any); [key: string]: any } }
declare module 'esri/geometry/Extent' { export default class Extent { constructor(props?: any); [key: string]: any } }
declare module 'esri/geometry/Polygon' { export default class Polygon { constructor(props?: any); [key: string]: any } }
declare module 'esri/geometry/Polyline' { export default class Polyline { constructor(props?: any); [key: string]: any } }
declare module 'esri/geometry/SpatialReference' { export default class SpatialReference { constructor(props?: any); [key: string]: any } }
declare module 'esri/Graphic' { export default class Graphic { constructor(props?: any); [key: string]: any } }
declare module 'esri/layers/FeatureLayer' { export default class FeatureLayer { constructor(props?: any); [key: string]: any } }
declare module 'esri/layers/GraphicsLayer' { export default class GraphicsLayer { constructor(props?: any); [key: string]: any } }
declare module 'esri/geometry/geometryEngine' {
  export const buffer: any
  export const geodesicBuffer: any
  export const distance: any
  export const geodesicLength: any
  export const intersects: any
  export const contains: any
  export const union: any
  export const simplify: any
  export const planarArea: any
  export const geodesicArea: any
  const _default: any
  export default _default
}

// ---- jimu-core members the master shim does not list (message actions) ----
// Ambient module declarations with the same name merge, so this only adds members.
declare module 'jimu-core' {
  export type Message = any
  export type MessageDescription = any
  export type DataRecordsSelectionChangeMessage = any
  export type DataRecordSetChangeMessage = any
  export type ActionSettingProps<T = any> = any
  export type MessageType = any
  export const MutableStoreManager: any
  export class AbstractMessageAction {
    id: string
    label: string
    widgetId: string
    [key: string]: any
    constructor(...args: any[])
  }
}
