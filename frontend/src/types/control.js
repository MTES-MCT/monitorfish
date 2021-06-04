/**
 * @typedef Infraction
 * @property {string} infraction
 * @property {string} infractionCategory
 * @property {string} natinfCode
 * @property {string} regulation
 */

/**
 * @typedef GearControl
 * @property {number} controlledMesh
 * @property {number} declaredMesh
 * @property {string} gearCode
 * @property {string} gearName
 * @property {boolean} gearWasControlled
 */

/**
 * @typedef Controller
 * @property {string} administration
 * @property {string} controller
 * @property {string} controllerType
 */

/**
 * @typedef VesselControl
 * @property {boolean} cnspCalledUnit
 * @property {string} controlDatetimeUtc
 * @property {string} controlType
 * @property {boolean} cooperative
 * @property {boolean} diversion
 * @property {boolean} escortToQuay
 * @property {string} facade
 * @property {boolean} infraction
 * @property {string} inputEndDatetimeUtc
 * @property {string} inputStartDatetimeUtc
 * @property {string} latitude
 * @property {string} longitude
 * @property {string} missionOrder
 * @property {string} portLocode
 * @property {string} portName
 * @property {string} postControlComments
 * @property {string} preControlComments
 * @property {boolean} seizure
 * @property {string} seizureComments
 * @property {boolean} vesselTargeted
 * @property {Controller} controller
 * @property {GearControl[]} gearControls
 * @property {Infraction[]} infractions
 */

/**
 * @typedef ControlResume
 * @property {VesselControl[]} controls
 * @property {number} numberOfAerialControls
 * @property {number} numberOfDiversions
 * @property {number} numberOfEscortsToQuay
 * @property {number} numberOfFishingInfractions
 * @property {number} numberOfLandControls
 * @property {number} numberOfSeaControls
 * @property {number} numberOfSecurityInfractions
 * @property {number} numberOfSeizures
 * @property {number} vesselId
 */

/**
 * @typedef LastControls
 * @property {ControlAndText} SEA - Contrôle_en_mer
 * @property {ControlAndText} LAND - Contrôle à la débarque
 */

/**
 * @typedef ControlAndText
 * @property {VesselControl} control
 * @property {string} text
 */
