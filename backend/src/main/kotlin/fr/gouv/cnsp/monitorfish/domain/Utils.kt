package fr.gouv.cnsp.monitorfish.domain

import java.security.MessageDigest

fun hash(toHash: String): String {
    val lowercaseToHash = toHash.lowercase()

    return MessageDigest
        .getInstance("SHA-256")
        .digest(lowercaseToHash.toByteArray())
        .fold("") { str, it -> str + "%02x".format(it) }
}
