import { useVirtualizer } from '@tanstack/react-virtual'
import { useCallback } from 'react'

export function useTableVirtualizer({ estimateSize, ref, rows }) {
  return useVirtualizer({
    count: rows.length,
    estimateSize: () => estimateSize,
    getItemKey: useCallback((index: number) => `${rows[index]?.id}`, [rows]),
    getScrollElement: () => ref.current,
    overscan: 10,
    scrollPaddingEnd: 40,
    scrollPaddingStart: 40
  })
}
