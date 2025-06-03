package fr.gouv.cnsp.monitorfish.domain.entities.authorization

data class UserAuthorization(
    val hashedEmail: String,
    val isSuperUser: Boolean,
    val service: CnspService?,
    val isAdministrator: Boolean,
)

enum class CnspService(
    val value: String,
) {
    POLE_OPS_METROPOLE("Pôle OPS métropole"),
    POLE_SIP("Pôle SIP"),
    POLE_REG_PLANIF("Pôle reg./planif."),
    POLE_OPS_OUTRE_MER("Pôle OPS outre-mer"),
    ;

    override fun toString(): String = value

    companion object {
        fun fromValue(value: String): CnspService = entries.first { it.value == value }
    }
}
