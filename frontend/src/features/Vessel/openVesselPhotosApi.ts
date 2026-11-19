import { monitorfishApi } from '@api/api'
import { RtkCacheTagType } from '@api/constants'
import { z } from 'zod'

/** The website, with the contribution form. */
export const OPEN_VESSEL_PHOTOS_URL = 'https://openvesselphotos.org'
/** Replaced by a stub when running locally (`openvesselphotos-stubs` in docker-compose.yml). */
const CONFIGURED_OPEN_VESSEL_PHOTOS_API_URL = import.meta.env.FRONTEND_OPEN_VESSEL_PHOTOS_API_URL
const OPEN_VESSEL_PHOTOS_API_URL =
  CONFIGURED_OPEN_VESSEL_PHOTOS_API_URL === undefined || CONFIGURED_OPEN_VESSEL_PHOTOS_API_URL === ''
    ? OPEN_VESSEL_PHOTOS_URL
    : CONFIGURED_OPEN_VESSEL_PHOTOS_API_URL

const OPEN_VESSEL_PHOTOS_API_KEY = import.meta.env.FRONTEND_OPEN_VESSEL_PHOTOS_API_KEY
const OPEN_VESSEL_PHOTOS_APP_ID = import.meta.env.FRONTEND_OPEN_VESSEL_PHOTOS_APP_ID

/** Without its key and public id, MonitorFish can show the photos but can't follow the review of the photos sent. */
export const IS_OPEN_VESSEL_PHOTOS_SUBMISSIONS_TRACKING_ENABLED =
  !!OPEN_VESSEL_PHOTOS_API_KEY && !!OPEN_VESSEL_PHOTOS_APP_ID

export type OpenVesselPhotoKeys = {
  cfr: string | undefined
  mmsi: string | undefined
}

export type OpenVesselPhoto = {
  attribution: string
  url: string
}

const OpenVesselPhotosVesselSchema = z.object({
  photos: z.array(
    z.object({
      attribution: z.string(),
      urls: z.object({
        cfr: z.string().nullish(),
        mmsi: z.string().nullish()
      })
    })
  )
})

export enum OpenVesselPhotoSubmissionStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

const OpenVesselPhotoSubmissionSchema = z.object({
  cfr: z.string().nullish(),
  id: z.number(),
  mmsi: z.string().nullish(),
  rejectReason: z.string().nullish(),
  status: z.enum(OpenVesselPhotoSubmissionStatus),
  vesselName: z.string().nullish()
})

export type OpenVesselPhotoSubmission = z.infer<typeof OpenVesselPhotoSubmissionSchema>

export function getOpenVesselPhotosContributeUrl(
  { cfr, mmsi }: OpenVesselPhotoKeys,
  contributorId?: string | undefined
): string {
  const params = new URLSearchParams()
  if (cfr) {
    params.set('cfr', cfr)
  }
  if (mmsi) {
    params.set('mmsi', mmsi)
  }
  if (IS_OPEN_VESSEL_PHOTOS_SUBMISSIONS_TRACKING_ENABLED && OPEN_VESSEL_PHOTOS_APP_ID && contributorId) {
    params.set('app', OPEN_VESSEL_PHOTOS_APP_ID)
    params.set('contributorId', contributorId)
  }

  const query = params.toString()

  return `${OPEN_VESSEL_PHOTOS_URL}/fr/contribute${query ? `?${query}` : ''}`
}

/**
 * Pseudonymous and stable id of a user in Open Vessel Photos, to follow the review of its photos without sending
 * its e-mail.
 */
export async function getOpenVesselPhotosContributorId(email: string): Promise<string> {
  const data = new TextEncoder().encode(`monitorfish:${email.trim().toLowerCase()}`)
  const digest = await crypto.subtle.digest('SHA-256', data)

  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('')
}

export function isSubmissionOfVessel(submission: OpenVesselPhotoSubmission, { cfr, mmsi }: OpenVesselPhotoKeys) {
  return (!!cfr && submission.cfr === cfr) || (!!mmsi && submission.mmsi === mmsi)
}

async function fetchFirstPhoto(keyType: 'cfr' | 'mmsi', key: string): Promise<OpenVesselPhoto | undefined> {
  const response = await fetch(`${OPEN_VESSEL_PHOTOS_API_URL}/v1/${keyType}/${encodeURIComponent(key)}`)
  if (!response.ok) {
    return undefined
  }

  const parsed = OpenVesselPhotosVesselSchema.safeParse(await response.json())
  const firstPhoto = parsed.success ? parsed.data.photos[0] : undefined
  const url = firstPhoto?.urls[keyType]
  if (!firstPhoto || !url) {
    return undefined
  }

  return { attribution: firstPhoto.attribution, url }
}

function getApiKeyHeaders(): HeadersInit {
  return { 'x-api-key': OPEN_VESSEL_PHOTOS_API_KEY ?? '' }
}

export const openVesselPhotosApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    // A missing photo is not an error for the user: any failure falls back to the "add a photo" invitation
    getOpenVesselPhoto: builder.query<OpenVesselPhoto | null, OpenVesselPhotoKeys>({
      providesTags: () => [{ type: RtkCacheTagType.OpenVesselPhotos }],
      queryFn: async ({ cfr, mmsi }) => {
        try {
          const photo =
            (cfr ? await fetchFirstPhoto('cfr', cfr) : undefined) ??
            (mmsi ? await fetchFirstPhoto('mmsi', mmsi) : undefined)

          return { data: photo ?? null }
        } catch {
          return { data: null }
        }
      }
    }),

    // Following the reviews is a bonus: a failure only delays the notifications until the next poll
    getOpenVesselPhotoSubmissions: builder.query<OpenVesselPhotoSubmission[], string>({
      providesTags: () => [{ type: RtkCacheTagType.OpenVesselPhotoSubmissions }],
      queryFn: async contributorId => {
        try {
          const response = await fetch(
            `${OPEN_VESSEL_PHOTOS_API_URL}/v1/submissions?contributorId=${encodeURIComponent(contributorId)}`,
            { headers: getApiKeyHeaders() }
          )
          if (!response.ok) {
            return { data: [] }
          }

          const parsed = z.array(OpenVesselPhotoSubmissionSchema).safeParse(await response.json())

          return { data: parsed.success ? parsed.data : [] }
        } catch {
          return { data: [] }
        }
      }
    }),

    markOpenVesselPhotoSubmissionAsSeen: builder.mutation<void, { contributorId: string; id: number }>({
      invalidatesTags: () => [
        { type: RtkCacheTagType.OpenVesselPhotoSubmissions },
        { type: RtkCacheTagType.OpenVesselPhotos }
      ],
      onQueryStarted: ({ contributorId, id }, { dispatch }) => {
        dispatch(
          openVesselPhotosApi.util.updateQueryData('getOpenVesselPhotoSubmissions', contributorId, submissions =>
            submissions.filter(submission => submission.id !== id)
          )
        )
      },
      queryFn: async ({ id }) => {
        try {
          await fetch(`${OPEN_VESSEL_PHOTOS_API_URL}/v1/submissions/${id}/seen`, {
            headers: getApiKeyHeaders(),
            method: 'POST'
          })
        } catch {
          // Shown again at the next poll, and marked as seen then
        }

        return { data: undefined }
      }
    })
  })
})

export const {
  useGetOpenVesselPhotoQuery,
  useGetOpenVesselPhotoSubmissionsQuery,
  useMarkOpenVesselPhotoSubmissionAsSeenMutation
} = openVesselPhotosApi
