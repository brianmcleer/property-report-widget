/// <reference lib="es2020" />
/// <reference lib="dom" />

// Editor-only declarations for Experience Builder 1.21 / pnpm layouts.
// These declarations emit no JavaScript and do not alter widget behavior.

declare module '@emotion/react/jsx-runtime' {
  export * from 'react/jsx-runtime'
}

// Visual Studio can fail to follow widget-local pnpm links when the widget
// folder is opened directly. Experience Builder still bundles the real
// packages listed in package.json at runtime.
declare module '@tanstack/react-table' {
  export type ColumnDef<TData = any, TValue = unknown> = any
  export type SortingState = any[]
  export type ColumnFiltersState = any[]
  export type PaginationState = any
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
}

// ArcGIS Maps SDK modules are ESM at runtime. Some Visual Studio TypeScript
// hosts resolve the pnpm-linked declaration files as scripts instead of modules.
declare module 'esri/Graphic' {
  export default class Graphic {
    constructor(properties?: any)
    [key: string]: any
  }
}

declare module 'esri/geometry/Point' {
  export default class Point {
    constructor(properties?: any)
    [key: string]: any
  }
}

declare module 'esri/geometry/Extent' {
  export default class Extent {
    constructor(properties?: any)
    [key: string]: any
  }
}

declare module 'esri/geometry/SpatialReference' {
  export default class SpatialReference {
    constructor(properties?: any)
    [key: string]: any
  }
}

declare module 'esri/geometry/Polygon' {
  export default class Polygon {
    constructor(properties?: any)
    [key: string]: any
  }
}

declare module 'esri/geometry/Polyline' {
  export default class Polyline {
    constructor(properties?: any)
    [key: string]: any
  }
}

declare module 'esri/geometry/geometryEngine' {
  export const buffer: any
}

declare module 'esri/layers/FeatureLayer' {
  export default class FeatureLayer {
    constructor(properties?: any)
    [key: string]: any
  }
}

declare module 'esri/layers/GraphicsLayer' {
  export default class GraphicsLayer {
    constructor(properties?: any)
    [key: string]: any
  }
}

// Visual Studio sometimes ignores the widget-level tsconfig when a widget
// folder is opened directly. Keep the ES2016/ES2017 APIs visible even under
// that fallback analysis mode. These are standard JavaScript runtime APIs.
interface Array<T> {
  includes(searchElement: T, fromIndex?: number): boolean
}

interface ReadonlyArray<T> {
  includes(searchElement: T, fromIndex?: number): boolean
}

interface ObjectConstructor {
  entries(value: any): Array<[string, any]>
  values<T>(value: { [key: string]: T } | ArrayLike<T>): T[]
  values(value: any): any[]
}
