import { useVirtualizer } from '@tanstack/react-virtual'
import { type MutableRefObject, useCallback } from 'react'

type UseTableVirtualizerProps = {
  estimateSize: number
  overscan: number
  ref: MutableRefObject<HTMLDivElement | null>
  rows: any
}
export function useTableVirtualizer({ estimateSize, overscan, ref, rows }: UseTableVirtualizerProps) {
  return useVirtualizer({
    count: rows.length,
    estimateSize: () => estimateSize,
    gap: 5,
    getItemKey: useCallback((index: number) => `${rows[index]?.id}`, [rows]),
    getScrollElement: () => ref.current,
    overscan,
    scrollPaddingEnd: 50,
    scrollPaddingStart: 40
  })
}
