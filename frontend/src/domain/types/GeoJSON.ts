/**
 * Typescript types for the GeoJSON RFC7946 specification. This is not fully RFC-compliant due to lack of support for
 * ranged number data types.
 *
 * See https://tools.ietf.org/html/rfc7946
 */
export declare namespace GeoJSON {
  /**
   * Inside this document, the term "geometry type" refers to seven case-sensitive strings: "Point", "MultiPoint",
   * "LineString", "MultiLineString", "Polygon", "MultiPolygon", and "GeometryCollection".
   */
  export type Geometry = Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon | GeometryCollection
  export type GeometryType = Geometry['type']

  /**
   * ...the term "GeoJSON types" refers to nine case-sensitive strings: "Feature", "FeatureCollection", and the
   * geometry types listed above.
   */
  export type GeoJson = Geometry | Feature | FeatureCollection
  export type GeoJsonType = GeoJson['type']

  // types

  /**
   * A position is an array of numbers. There MUST be two or more elements. The first two elements are longitude and
   * latitude, or easting and northing, precisely in that order and using decimal numbers. Altitude or elevation MAY
   * be included as an optional third element.
   *
   * Implementations SHOULD NOT extend positions beyond three elements because the semantics of extra elements are
   * unspecified and ambiguous.
   */
  export type Position = [latitude: number, longitude: number, elevation?: number]

  export type Record = { [key in string | number]: unknown }

  /**
   * Properties inherit to all GeoJSON types
   */
  export interface GeometryBase extends Record {
    /**
     * A GeoJSON object MAY have a member named "bbox" to include information on the coordinate range for its
     * Geometries, Features, or FeatureCollections. The value of the bbox member MUST be an array of length 2*n
     * where n is the number of dimensions represented in the contained geometries, with all axes of the most
     * southwesterly point followed by all axes of the more northeasterly point. The axes order of a bbox follows
     * the axes order of geometries.
     */
    bbox?: number[]

    /**
     * A GeoJSON object MAY have other members.
     *
     * Members not described in this specification ("foreign members") MAY be used in a GeoJSON document. Note that
     * support for foreign members can vary across implementations, and no normative processing model for foreign
     * members is defined.
     */
  }

  // geometry types

  export interface Point extends GeometryBase {
    /**
     * For type "Point", the "coordinates" member is a single position.
     */
    coordinates: Position
    type: 'Point'
  }

  export interface MultiPoint extends GeometryBase {
    /**
     * For type "MultiPoint", the "coordinates" member is an array of positions.
     */
    coordinates: Position[]
    type: 'MultiPoint'
  }

  export interface LineString extends GeometryBase {
    /**
     * For type "LineString", the "coordinates" member is an array of two or more positions.
     */
    coordinates: { 0: Position; 1: Position } & Position[]
    type: 'LineString'
  }

  export interface MultiLineString extends GeometryBase {
    /**
     *  For type "MultiLineString", the "coordinates" member is an array of LineString coordinate arrays.
     */
    coordinates: LineString['coordinates'][]
    type: 'MultiLineString'
  }

  /**
   * To specify a constraint specific to Polygons, it is useful to introduce the concept of a linear ring:
   *  - A linear ring is a closed LineString with four or more positions.
   *  - The first and last positions are equivalent, and they MUST contain identical values; their representation
   *    SHOULD also be identical.
   *  - A linear ring is the boundary of a surface or the boundary of a hole in a surface.
   *  - A linear ring MUST follow the right-hand rule with respect to the area it bounds, i.e., exterior rings are
   *  counterclockwise, and holes are clockwise.
   */
  export type LinearRing = { 0: Position; 1: Position; 2: Position; 3: Position } & Position[]

  export interface Polygon extends GeometryBase {
    /**
     * For type "Polygon", the "coordinates" member MUST be an array of linear ring coordinate arrays.
     *
     * For Polygons with more than one of these rings, the first MUST be the exterior ring, and any others MUST be
     * interior rings. The exterior ring bounds the surface, and the interior rings (if present) bound holes within
     * the surface.
     */
    coordinates: LinearRing[]
    type: 'Polygon'
  }

  export interface MultiPolygon extends GeometryBase {
    /**
     * For type "MultiPolygon", the "coordinates" member is an array of Polygon coordinate arrays.
     */
    coordinates: Polygon['coordinates'][]
    type: 'MultiPolygon'
  }

  export interface GeometryCollection {
    /**
     *  A GeometryCollection has a member with the name "geometries". The value of "geometries" is an array. Each
     *  element of this array is a GeoJSON Geometry object. It is possible for this array to be empty.
     */
    geometries: Geometry[]
    /**
     * A GeoJSON object with type "GeometryCollection" is a Geometry object.
     */
    type: 'GeometryCollection'
  }

  // GeoJSON types

  export interface Feature {
    /**
     * A Feature object has a member with the name "geometry". The value of the geometry member SHALL be either a
     * Geometry object as defined above or, in the case that the Feature is unlocated, a JSON null value.
     */
    geometry: Geometry | null
    /**
     * If a Feature has a commonly used identifier, that identifier SHOULD be included as a member of the Feature object
     * with the name "id", and the value of this member is either a JSON string or number.
     */
    id?: string | number
    /**
     * A Feature object has a member with the name "properties". The value of the properties member is an object
     * (any JSON object or a JSON null value).
     */
    properties: Record | null
    /**
     * A Feature object has a "type" member with the value "Feature".
     */
    type: 'Feature'
  }

  export interface FeatureCollection {
    /**
     * A FeatureCollection object has a member with the name "features". The value of "features" is a JSON array. Each
     * element of the array is a Feature object as defined above. It is possible for this array to be empty.
     */
    features: Feature[]
    /**
     * A GeoJSON object with the type "FeatureCollection" is a FeatureCollection object.
     */
    type: 'FeatureCollection'
  }
}
