import { DEFAULT_THREAT, DEFAULT_THREAT_CHARACTERIZATION } from '@features/Infraction/constants'
import { describe, expect, it } from '@jest/globals'
import { renderHook } from '@testing-library/react'

import * as infractionApis from '../../apis'
import { useGetThreatCharacterizationAsTreeOptions } from '../useGetThreatCharacterizationAsTreeOptions'

import type { Threat } from '@features/Infraction/types'

// Import after mocking to get the mocked version

/**
 * Warning: We could not add `jest` import as it makes the test to fail.
 * @see: https://github.com/swc-project/jest/issues/14#issuecomment-2525330413
 */

// @ts-ignore
jest.mock('../../apis', () => ({
  // @ts-ignore
  useGetThreatCharacterizationsQuery: jest.fn()
}))

describe('hooks/useGetThreatCharacterizationAsTreeOptions()', () => {
  const mockApiData: Threat[] = [
    {
      children: [
        {
          children: [{ label: 'NATINF-001', value: 'NATINF-001' }],
          label: 'Characterization 1',
          value: 'char-1'
        }
      ],
      label: 'Threat 1',
      value: 'threat-1'
    },
    {
      children: [
        {
          children: [
            { label: 'NATINF-002', value: 'NATINF-002' },
            { label: 'NATINF-003', value: 'NATINF-003' }
          ],
          label: 'Characterization 2',
          value: 'char-2'
        }
      ],
      label: 'Threat 2',
      value: 'threat-2'
    }
  ]

  it('should return empty array when API returns no data', () => {
    // @ts-ignore
    jest.spyOn(infractionApis, 'useGetThreatCharacterizationsQuery').mockReturnValue({
      data: undefined
    } as any)

    const { result } = renderHook(() => useGetThreatCharacterizationAsTreeOptions())

    expect(result.current).toEqual([])
  })

  it('should return API data without unknown threat when threats param is undefined', () => {
    // @ts-ignore
    jest.spyOn(infractionApis, 'useGetThreatCharacterizationsQuery').mockReturnValue({
      data: mockApiData
    } as any)

    const { result } = renderHook(() => useGetThreatCharacterizationAsTreeOptions())

    expect(result.current).toEqual(mockApiData)
  })

  it('should return API data without unknown threat when threats param is empty array', () => {
    // @ts-ignore
    jest.spyOn(infractionApis, 'useGetThreatCharacterizationsQuery').mockReturnValue({
      data: mockApiData
    } as any)

    const { result } = renderHook(() => useGetThreatCharacterizationAsTreeOptions([]))

    expect(result.current).toEqual(mockApiData)
  })

  it('should add UNKNOWN_THREAT when single value with default threat, default characterization and natinf', () => {
    // @ts-ignore
    jest.spyOn(infractionApis, 'useGetThreatCharacterizationsQuery').mockReturnValue({
      data: mockApiData
    } as any)

    const threats: Threat[] = [
      {
        children: [
          {
            children: [
              {
                label: 'NATINF-UNKNOWN',
                value: 'NATINF-UNKNOWN'
              }
            ],
            label: DEFAULT_THREAT_CHARACTERIZATION,
            value: DEFAULT_THREAT_CHARACTERIZATION
          }
        ],
        label: DEFAULT_THREAT,
        value: DEFAULT_THREAT
      }
    ]

    const { result } = renderHook(() => useGetThreatCharacterizationAsTreeOptions(threats))

    expect(result.current).toHaveLength(mockApiData.length + 1)
    expect(result.current[result.current.length - 1]).toMatchObject({
      children: [
        {
          children: [
            {
              label: 'NATINF-UNKNOWN',
              value: 'NATINF-UNKNOWN'
            }
          ],
          label: DEFAULT_THREAT_CHARACTERIZATION,
          value: DEFAULT_THREAT_CHARACTERIZATION
        }
      ],
      label: DEFAULT_THREAT,
      value: DEFAULT_THREAT
    })
  })

  it('should NOT add UNKNOWN_THREAT when multiple threats provided', () => {
    // @ts-ignore
    jest.spyOn(infractionApis, 'useGetThreatCharacterizationsQuery').mockReturnValue({
      data: mockApiData
    } as any)

    const threats: Threat[] = [
      {
        children: [
          {
            children: [{ label: 'NATINF-001', value: 'NATINF-001' }],
            label: DEFAULT_THREAT_CHARACTERIZATION,
            value: DEFAULT_THREAT_CHARACTERIZATION
          }
        ],
        label: DEFAULT_THREAT,
        value: DEFAULT_THREAT
      },
      {
        children: [
          {
            children: [{ label: 'NATINF-002', value: 'NATINF-002' }],
            label: 'Another Characterization',
            value: 'another-char'
          }
        ],
        label: 'Another Threat',
        value: 'another'
      }
    ]

    const { result } = renderHook(() => useGetThreatCharacterizationAsTreeOptions(threats))

    expect(result.current).toEqual(mockApiData)
  })

  it('should NOT add UNKNOWN_THREAT when threat label is not DEFAULT_THREAT', () => {
    // @ts-ignore
    jest.spyOn(infractionApis, 'useGetThreatCharacterizationsQuery').mockReturnValue({
      data: mockApiData
    } as any)

    const threats: Threat[] = [
      {
        children: [
          {
            children: [{ label: 'NATINF-001', value: 'NATINF-001' }],
            label: DEFAULT_THREAT_CHARACTERIZATION,
            value: DEFAULT_THREAT_CHARACTERIZATION
          }
        ],
        label: 'Custom Threat',
        value: 'custom'
      }
    ]

    const { result } = renderHook(() => useGetThreatCharacterizationAsTreeOptions(threats))

    expect(result.current).toEqual(mockApiData)
  })

  it('should NOT add UNKNOWN_THREAT when natinf is missing', () => {
    // @ts-ignore
    jest.spyOn(infractionApis, 'useGetThreatCharacterizationsQuery').mockReturnValue({
      data: mockApiData
    } as any)

    const threats: Threat[] = [
      {
        children: [
          {
            children: [],
            label: DEFAULT_THREAT_CHARACTERIZATION,
            value: DEFAULT_THREAT_CHARACTERIZATION
          }
        ],
        label: DEFAULT_THREAT,
        value: DEFAULT_THREAT
      }
    ]

    const { result } = renderHook(() => useGetThreatCharacterizationAsTreeOptions(threats))

    expect(result.current).toEqual(mockApiData)
  })

  it('should NOT add UNKNOWN_THREAT when threat has multiple characterizations', () => {
    // @ts-ignore
    jest.spyOn(infractionApis, 'useGetThreatCharacterizationsQuery').mockReturnValue({
      data: mockApiData
    } as any)

    const threats: Threat[] = [
      {
        children: [
          {
            children: [{ label: 'NATINF-001', value: 'NATINF-001' }],
            label: DEFAULT_THREAT_CHARACTERIZATION,
            value: DEFAULT_THREAT_CHARACTERIZATION
          },
          {
            children: [{ label: 'NATINF-002', value: 'NATINF-002' }],
            label: 'Another Characterization',
            value: 'another-char'
          }
        ],
        label: DEFAULT_THREAT,
        value: DEFAULT_THREAT
      }
    ]

    const { result } = renderHook(() => useGetThreatCharacterizationAsTreeOptions(threats))

    expect(result.current).toEqual(mockApiData)
  })

  it('should NOT add UNKNOWN_THREAT when characterization has multiple natinfs', () => {
    // @ts-ignore
    jest.spyOn(infractionApis, 'useGetThreatCharacterizationsQuery').mockReturnValue({
      data: mockApiData
    } as any)

    const threats: Threat[] = [
      {
        children: [
          {
            children: [
              { label: 'NATINF-001', value: 'NATINF-001' },
              { label: 'NATINF-002', value: 'NATINF-002' }
            ],
            label: DEFAULT_THREAT_CHARACTERIZATION,
            value: DEFAULT_THREAT_CHARACTERIZATION
          }
        ],
        label: DEFAULT_THREAT,
        value: DEFAULT_THREAT
      }
    ]

    const { result } = renderHook(() => useGetThreatCharacterizationAsTreeOptions(threats))

    expect(result.current).toEqual(mockApiData)
  })

  it('should NOT add UNKNOWN_THREAT when natinf value is empty string', () => {
    // @ts-ignore
    jest.spyOn(infractionApis, 'useGetThreatCharacterizationsQuery').mockReturnValue({
      data: mockApiData
    } as any)

    const threats: Threat[] = [
      {
        children: [
          {
            children: [
              {
                label: '',
                value: ''
              }
            ],
            label: DEFAULT_THREAT_CHARACTERIZATION,
            value: DEFAULT_THREAT_CHARACTERIZATION
          }
        ],
        label: DEFAULT_THREAT,
        value: DEFAULT_THREAT
      }
    ]

    const { result } = renderHook(() => useGetThreatCharacterizationAsTreeOptions(threats))

    expect(result.current).toEqual(mockApiData)
  })
})
