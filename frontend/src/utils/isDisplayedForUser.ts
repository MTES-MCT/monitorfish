export type UserTarget = 'ALL' | 'CNSP' | 'EXTERNAL'

export function isDisplayedForUser(isSuperUser: boolean) {
  return (item: { for: UserTarget }) => {
    if (!isSuperUser && item.for === 'CNSP') {
      return false
    }

    if (isSuperUser && item.for === 'EXTERNAL') {
      return false
    }

    return true
  }
}
