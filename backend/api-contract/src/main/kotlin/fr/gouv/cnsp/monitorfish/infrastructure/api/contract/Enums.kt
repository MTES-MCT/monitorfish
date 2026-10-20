package fr.gouv.cnsp.monitorfish.infrastructure.api.contract

enum class Completion { COMPLETED, TO_COMPLETE }

enum class ControlCheck { YES, NO, NOT_APPLICABLE }

enum class ControlUnitResourceType {
    AIRPLANE,
    BARGE,
    CAR,
    DRONE,
    EQUESTRIAN,
    FAST_BOAT,
    FRIGATE,
    HELICOPTER,
    HYDROGRAPHIC_SHIP,
    KAYAK,
    LIGHT_FAST_BOAT,
    MINE_DIVER,
    MOTORCYCLE,
    NET_LIFTER,
    NO_RESOURCE,
    OTHER,
    PATROL_BOAT,
    PEDESTRIAN,
    PIROGUE,
    RIGID_HULL,
    SEA_SCOOTER,
    SEMI_RIGID,
    SUPPORT_SHIP,
    TRAINING_SHIP,
    TUGBOAT,
}

enum class DiscardReason { DIM, RET, DIS }

enum class FlightGoal { VMS_AIS_CHECK, UNAUTHORIZED_FISHING, CLOSED_AREA }

enum class GroupType { DYNAMIC, FIXED, HARDCODED }

enum class InfractionType { WITH_RECORD, WITHOUT_RECORD, PENDING }

enum class LogbookMessagePurpose { ACS, ECY, GRD, LAN, OTH, REF, REP, RES, SCR, SHE, TRA }

enum class MissionActionType { SEA_CONTROL, LAND_CONTROL, AIR_CONTROL, AIR_SURVEILLANCE, OBSERVATION }

enum class ReportingType { ALERT, OBSERVATION, INFRACTION_SUSPICION }

enum class WeightControlMethod { WEIGHING, CRATE_COUNT, SAMPLING, NOT_APPLICABLE }

enum class WireType { SINGLE, MANY }
