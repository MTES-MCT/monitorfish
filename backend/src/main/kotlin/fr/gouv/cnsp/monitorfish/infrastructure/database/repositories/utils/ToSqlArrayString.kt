package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.utils

fun toSqlArrayString(list: List<String>?): String? = list?.joinToString(",", prefix = "{", postfix = "}")
