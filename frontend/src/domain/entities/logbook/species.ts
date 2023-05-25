import type { DeclaredLogbookSpecies } from '../vessel/types'

const NOT_FOUND = -1

export function getSummedSpeciesOnBoard(speciesOnBoard: DeclaredLogbookSpecies[]) {
  return speciesOnBoard.reduce((accumulator: DeclaredLogbookSpecies[], specy: DeclaredLogbookSpecies) => {
    const previousSpecyIndex = accumulator.findIndex(existingSpecy => existingSpecy.species === specy.species)

    if (previousSpecyIndex !== NOT_FOUND && accumulator[previousSpecyIndex]) {
      const nextSpecy = { ...accumulator[previousSpecyIndex] }
      // @ts-ignore
      nextSpecy.weight = (nextSpecy.weight || 0) + specy.weight
      accumulator[previousSpecyIndex] = nextSpecy as DeclaredLogbookSpecies

      return accumulator
    }

    return accumulator.concat(specy)
  }, [])
}
