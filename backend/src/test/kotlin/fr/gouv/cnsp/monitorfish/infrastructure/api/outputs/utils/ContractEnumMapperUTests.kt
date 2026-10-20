package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.utils

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import kotlin.reflect.KClass
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.ControlUnitResourceType as DomainControlUnitResourceType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagePurpose as DomainLogbookMessagePurpose
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.Completion as DomainCompletion
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.ControlCheck as DomainControlCheck
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.DiscardReason as DomainDiscardReason
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.FlightGoal as DomainFlightGoal
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.InfractionType as DomainInfractionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType as DomainMissionActionType
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.WeightControlMethod as DomainWeightControlMethod
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.WireType as DomainWireType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType as DomainReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.GroupType as DomainGroupType
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.Completion as ContractCompletion
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.ControlCheck as ContractControlCheck
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.ControlUnitResourceType as ContractControlUnitResourceType
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.DiscardReason as ContractDiscardReason
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.FlightGoal as ContractFlightGoal
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.GroupType as ContractGroupType
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.InfractionType as ContractInfractionType
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.LogbookMessagePurpose as ContractLogbookMessagePurpose
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.MissionActionType as ContractMissionActionType
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.ReportingType as ContractReportingType
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.WeightControlMethod as ContractWeightControlMethod
import fr.gouv.cnsp.monitorfish.infrastructure.api.contract.WireType as ContractWireType

class ContractEnumMapperUTests {
    companion object {
        @JvmStatic
        fun enumPairs(): List<Pair<KClass<out Enum<*>>, KClass<out Enum<*>>>> =
            listOf(
                DomainCompletion::class to ContractCompletion::class,
                DomainControlCheck::class to ContractControlCheck::class,
                DomainControlUnitResourceType::class to ContractControlUnitResourceType::class,
                DomainDiscardReason::class to ContractDiscardReason::class,
                DomainFlightGoal::class to ContractFlightGoal::class,
                DomainGroupType::class to ContractGroupType::class,
                DomainInfractionType::class to ContractInfractionType::class,
                DomainLogbookMessagePurpose::class to ContractLogbookMessagePurpose::class,
                DomainMissionActionType::class to ContractMissionActionType::class,
                DomainReportingType::class to ContractReportingType::class,
                DomainWeightControlMethod::class to ContractWeightControlMethod::class,
                DomainWireType::class to ContractWireType::class,
            )
    }

    @ParameterizedTest
    @MethodSource("enumPairs")
    fun `Domain and contract enums Should have the same constants`(
        enumPair: Pair<KClass<out Enum<*>>, KClass<out Enum<*>>>,
    ) {
        val (domainEnum, contractEnum) = enumPair

        assertThat(contractEnum.java.enumConstants.map { it.name })
            .containsExactlyInAnyOrderElementsOf(domainEnum.java.enumConstants.map { it.name })
    }
}
