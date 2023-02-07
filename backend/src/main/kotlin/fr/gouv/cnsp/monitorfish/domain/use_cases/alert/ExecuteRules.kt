package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.rules.InputSource
import fr.gouv.cnsp.monitorfish.domain.entities.rules.Rule
import fr.gouv.cnsp.monitorfish.domain.entities.rules.type.RuleTypeMapping
import fr.gouv.cnsp.monitorfish.domain.repositories.RuleRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.alert.rules.ExecutePnoAndLanWeightToleranceRule
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled

@UseCase
class ExecuteRules(
    private val ruleRepository: RuleRepository,
    private val executePnoAndLanWeightToleranceRule: ExecutePnoAndLanWeightToleranceRule,
) {
    private val logger: Logger = LoggerFactory.getLogger(ExecuteRules::class.java)

    // At every 5 minutes, after 1 minute of initial delay
    @Scheduled(fixedDelay = 300000, initialDelay = 6000)
    fun execute() {
        logger.info("RULES: Starting rules executor")
        val rules = ruleRepository.findAll()
            .filter { it.active }
        logger.info("RULES: Found ${rules.size} rules to execute")

        rules.forEach {
            when (it.value.inputSource) {
                InputSource.Logbook -> {
                    executeLogbookRules(it)
                }
            }
        }
        logger.info("RULES: End of rules executor")
    }

    private fun executeLogbookRules(rule: Rule) {
        when (rule.value.name) {
            RuleTypeMapping.PNO_LAN_WEIGHT_TOLERANCE -> {
                logger.info("PNO_LAN_WEIGHT_TOLERANCE: Executing...")
                executePnoAndLanWeightToleranceRule.execute(rule)
            }
        }
    }
}
