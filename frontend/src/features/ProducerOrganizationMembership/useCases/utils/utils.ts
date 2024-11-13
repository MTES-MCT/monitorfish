import { read, utils } from 'xlsx'

import type { ProducerOrganizationMembership } from '@features/ProducerOrganizationMembership/types'

const EMPTY_CSV_ERROR = 'Le CSV ajouté est vide.'

/**
 * The exported CSV from SYSADH has columns (with bad UTF-8) :
 * - N� CFR du navire   <- Used as `internalReferenceNumber`
 * - N� immatriculation nationale du navire
 * - navImoNo
 * - Nom du navire
 * - Cat�gorie du navire
 * - Identifiant armateur
 * - D�signation armateur
 * - Adresse armateur
 * - Date adh�sion      <- Used as `joiningDate`
 * - Date sortie
 * - Type d'adh�sion
 * - Adh�sion           <- Used as `organizationName`
 * - Esp�ce	Libell� esp�ce
 *
 * @param file
 */
export const getNextMembershipsFromFile = async (file: File): Promise<ProducerOrganizationMembership[]> => {
  const arrayBuffer = await file.arrayBuffer()

  const workbook = read(arrayBuffer, { FS: ';', raw: true, type: 'array' })
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
    internalReferenceNumber: getFieldOrThrow(row, 0),
    joiningDate: getFieldOrThrow(row, 8),
    organizationName: getFieldOrThrow(row, 11)
  }))
}

const getFieldOrThrow = (row: string[], columnIndex: number) => {
  const value = row[columnIndex]
  if (!value) {
    throw new Error(`Le CSV contient un champ vide à la colonne ${columnIndex}`)
  }

  return value
}
