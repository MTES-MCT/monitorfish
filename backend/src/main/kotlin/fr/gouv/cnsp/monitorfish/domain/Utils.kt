package fr.gouv.cnsp.monitorfish.domain

import java.security.MessageDigest

fun hash(toHash: String) = MessageDigest
    .getInstance("SHA-256")
    .digest(toHash.toByteArray())
    .fold("") { str, it -> str + "%02x".format(it) }
