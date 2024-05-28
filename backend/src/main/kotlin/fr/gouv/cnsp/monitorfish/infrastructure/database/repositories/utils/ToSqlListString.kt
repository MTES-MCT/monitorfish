package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.utils

fun toSqlListString(list: List<String>?): String? {
    return list?.joinToString(",", prefix = "(", postfix = ")")
}
