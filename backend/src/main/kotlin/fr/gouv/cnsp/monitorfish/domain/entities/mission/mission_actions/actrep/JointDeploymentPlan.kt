package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.actrep

import fr.gouv.cnsp.monitorfish.domain.entities.fao_area.FAOArea
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.MissionActionType
import fr.gouv.cnsp.monitorfish.domain.use_cases.fleet_segment.hasFaoCodeIncludedIn

/**
 * JDP MED / EASTERN ATLANTIC operational zones
 *
 * cf. https://extranet.legipeche.metier.developpement-durable.gouv.fr/fichier/pdf/med_jdp_2024_med_sg_final_fr_cle5197c6.pdf?arg=25289&cle=c065370e6727cc3f839e254fcc19c4b24e36dc9d&file=pdf%2Fmed_jdp_2024_med_sg_final_fr_cle5197c6.pdf
 */
val MEDITERRANEAN_OPERATIONAL_ZONES = listOf("37.1", "37.2", "37.3")
val EASTERN_ATLANTIC_OPERATIONAL_ZONES = listOf("34.1.2", "27.7", "27.8", "27.9", "27.10")

/**
 * JDP NORTH SEA operational zones
 *
 * cf. https://extranet.legipeche.metier.developpement-durable.gouv.fr/fichier/pdf/ed_decision_2023-24_-_ns_jdp_2024_planning_-_adoption_fr_cle11191a.pdf?arg=25287&cle=a5d3eecb0e2bdd9a229e8b34bf5ae11f96e89118&file=pdf%2Fed_decision_2023-24_-_ns_jdp_2024_planning_-_adoption_fr_cle11191a.pdf
 */
val NORTH_SEA_OPERATIONAL_ZONES = listOf("27.4", "27.3.a")

/**
 * JDP WESTERN WATERS operational zones
 *
 * cf. https://extranet.legipeche.metier.developpement-durable.gouv.fr/fichier/pdf/ed_decision_2023-25_-_ww_jdp_2024_planning_-_adoption_fr_cle128883.pdf?arg=25288&cle=9a2d7705425e766258f0d648353a05aa04249faf&file=pdf%2Fed_decision_2023-25_-_ww_jdp_2024_planning_-_adoption_fr_cle128883.pdf
 */
val WESTERN_WATERS_OPERATIONAL_ZONES = listOf("27.5", "27.6", "27.7", "27.8", "27.9", "27.10", "34.1.1", "34.1.2", "34.2.0")

enum class JointDeploymentPlan(private val species: List<FaoZonesAndSpecy>, private val operationalZones: List<String>) {
    MEDITERRANEAN_AND_EASTERN_ATLANTIC(
        MEDITERRANEAN_AND_EASTERN_ATLANTIC_SPECIES,
        MEDITERRANEAN_OPERATIONAL_ZONES + EASTERN_ATLANTIC_OPERATIONAL_ZONES,
    ),
    NORTH_SEA(NORTH_SEA_SPECIES, NORTH_SEA_OPERATIONAL_ZONES),
    WESTERN_WATERS(WESTERN_WATERS_SPECIES, WESTERN_WATERS_OPERATIONAL_ZONES),
    ;

    fun getSpeciesCodes(): List<String> {
        return this.species.map { it.second }.distinct()
    }

    private fun getOperationalZones(): List<String> {
        return this.operationalZones
    }

    /**
     * See "DÉCISION D’EXÉCUTION (UE) 2023/2376 DE LA COMMISSION":
     *  https://extranet.legipeche.metier.developpement-durable.gouv.fr/fichier/pdf/oj_l_202302376_fr_txt_cle6b198e.pdf?arg=24774&cle=7d14626b709ff7e8c62586bcd8683e7e9fcaa348&file=pdf%2Foj_l_202302376_fr_txt_cle6b198e.pdf
     */
    fun isLandControlApplicable(control: MissionAction): Boolean {
        val speciesOnboardCodes = control.speciesOnboard.mapNotNull { it.speciesCode }
        val tripFaoCodes = control.faoAreas

        val isThirdCountryVessel = EU_THIRD_COUNTRIES.contains(control.flagState)

        val isFirstJdpCurrentJdp = isFirstJdpFound(control)
        if (!isFirstJdpCurrentJdp) {
            return false
        }

        val hasSpeciesInJdp = this.species.any { (jdpFaoZones, jdpSpecy) ->
            val isSpecyFoundInJdpSpecies = speciesOnboardCodes.contains(jdpSpecy)

            val isFaoZoneFoundInJdpFaoZones = jdpFaoZones
                .any { jdpFaoCode ->
                    // The JDP FAO zone is included in at least one trip FAO code
                    tripFaoCodes.any { tripFaoCode -> tripFaoCode.contains(jdpFaoCode) }
                }

            return@any isSpecyFoundInJdpSpecies && isFaoZoneFoundInJdpFaoZones
        }

        val hasSpeciesInEUQuotas = if (isThirdCountryVessel) {
            EU_QUOTAS_SPECIES.any { quotaSpecy -> speciesOnboardCodes.contains(quotaSpecy) }
        } else {
            false
        }

        return hasSpeciesInJdp || hasSpeciesInEUQuotas
    }

    fun getFirstFaoAreaIncludedInJdp(
        control: MissionAction,
    ): FAOArea? {
        val jdpFaoAreas = this.getOperationalZones()

        if (control.actionType == MissionActionType.SEA_CONTROL && !isFirstJdpFound(control)) {
            return null
        }

        val firstFaoAreaIncludedInJdp = control.faoAreas
            .map { FAOArea(it) }
            .firstOrNull { controlFaoArea ->
                jdpFaoAreas.any { controlFaoArea.hasFaoCodeIncludedIn(it) }
            }

        return firstFaoAreaIncludedInJdp
    }

    /**
     * We use an arbitrary method to de-duplicated reporting of controls made in multiple fao areas,
     * hence in multiple JDP.
     * `JointDeploymentPlan.entries.firstOrNull` is the arbitrary rule to attach a control to only one JDP.
     * see: https://github.com/MTES-MCT/monitorfish/issues/3157#issuecomment-2093036583
     */
    private fun isFirstJdpFound(
        control: MissionAction,
    ) = JointDeploymentPlan.entries
        .firstOrNull { jdpEntry ->
            /**
             * There is an overlap between the `MEDITERRANEAN_AND_EASTERN_ATLANTIC` and the WESTERN_WATERS JDPs.
             * We add a filter by species to avoid counting all controls done in
             * `EASTERN_ATLANTIC_OPERATIONAL_ZONES without targeted species in catches.
             */
            if (control.actionType == MissionActionType.SEA_CONTROL && jdpEntry == MEDITERRANEAN_AND_EASTERN_ATLANTIC) {
                return@firstOrNull isMedJdp(control)
            }

            return@firstOrNull jdpEntry.getOperationalZones().any { jdpFaoArea ->
                control.faoAreas.any { controlFaoArea ->
                    FAOArea(controlFaoArea).hasFaoCodeIncludedIn(jdpFaoArea)
                }
            }
        } == this

    private fun isMedJdp(
        control: MissionAction,
    ) = MEDITERRANEAN_AND_EASTERN_ATLANTIC.getOperationalZones().any { jdpFaoArea ->
        /**
         * Filter by FAO zone AND `EASTERN_ATLANTIC_SPECY`
         * if the fao zone is included in the `EASTERN_ATLANTIC_OPERATIONAL_ZONES`
         */
        if (EASTERN_ATLANTIC_OPERATIONAL_ZONES.contains(jdpFaoArea)) {
            return@any control.faoAreas.any { controlFaoArea ->
                FAOArea(controlFaoArea).hasFaoCodeIncludedIn(jdpFaoArea) &&
                    control.speciesOnboard.map { it.speciesCode }.contains(EASTERN_ATLANTIC_SPECY.second)
            }
        }

        return@any control.faoAreas.any { controlFaoArea ->
            FAOArea(controlFaoArea).hasFaoCodeIncludedIn(jdpFaoArea)
        }
    }
}
