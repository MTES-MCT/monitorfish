import 'simplify-geojson'

declare module 'simplify-geojson' {
  // eslint-disable-next-line import/no-default-export
  export default function simplify(geojson: any, tolerance: number): any
}
