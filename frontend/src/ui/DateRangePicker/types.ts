export type DateOrTimeInputRef = {
  boxSpan: HTMLSpanElement
  /**
   * Focus the first input in the group.
   *
   * @param inLastInputOfTheGroup - If `true`, focus the last input in the group instead of the first one
   */
  focus: (inLastInputOfTheGroup?: boolean) => void
}

export enum DateRangePosition {
  END = 'END',
  START = 'START'
}

/** In the shape of ["YYYY", "MM", "DD"]. */
export type DateTuple = [string, string, string]

export type DateTupleRange = [DateTuple, DateTuple]

/** In the shape of ["hh", "mm"]. */
export type TimeTuple = [string, string]
