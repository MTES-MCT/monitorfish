package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.utils

fun toSqlListString(list: List<String>?): String? = list?.joinToString(",", prefix = "(", postfix = ")")
