import type { VesselIdentityForVesselGroup } from '@features/VesselGroup/types'

const EMPTY_CSV_ERROR = 'Le CSV ajouté est vide.'

/**
 * The CSV column order:
 *   CFR
 *   Nom
 *   Pavillon
 *   Call Sign
 *   Marquage externe
 * @param file
 */
export const getVesselsFromFile = async (file: File): Promise<VesselIdentityForVesselGroup[]> => {
  const { read, utils } = await import('xlsx')
  const arrayBuffer = await file.arrayBuffer()

  const workbook = read(arrayBuffer, { FS: ',', raw: true, type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    throw new Error(EMPTY_CSV_ERROR)
  }
  const worksheet = workbook.Sheets[sheetName]
  if (!worksheet) {
    throw new Error(EMPTY_CSV_ERROR)
  }

  const rowsAsArray: string[][] = utils.sheet_to_json<string[]>(worksheet, { header: 1 }).slice(1)

  return rowsAsArray.map(row => ({
    cfr: row[0],
    externalIdentification: row[4],
    flagState: row[2] ?? 'UNDEFINED',
    ircs: row[3],
    name: row[1],
    vesselId: undefined,
    vesselIdentifier: undefined
  }))
}
