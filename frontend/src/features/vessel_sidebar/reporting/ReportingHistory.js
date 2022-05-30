import React from 'react'
import { useSelector } from 'react-redux'

const ReportingHistory = () => {
  const {
    /** @type {Reporting} */
    currentAndArchivedReporting,
    /** @type {Reporting || null} */
    nextCurrentAndHistoryReporting
  } = useSelector(state => state.reporting)

  console.log(currentAndArchivedReporting, nextCurrentAndHistoryReporting)

  return <>
    Historique
  </>
}

export default ReportingHistory
