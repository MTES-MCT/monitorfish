package fr.gouv.cnsp.monitorfish.domain

import fr.gouv.cnsp.monitorfish.Utils
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.w3c.dom.Element
import org.xml.sax.SAXParseException
import java.security.MessageDigest
import javax.xml.parsers.DocumentBuilderFactory

fun hash(toHash: String): String {
    val lowercaseToHash = toHash.lowercase()

    return MessageDigest
        .getInstance("SHA-256")
        .digest(lowercaseToHash.toByteArray())
        .fold("") { str, it -> str + "%02x".format(it) }
}

private val logger: Logger = LoggerFactory.getLogger(Utils::class.java)

fun extractBossNameAndAddressFromERS(xml: String?): Pair<String, String>? {
    if (xml.isNullOrEmpty()) {
        return null
    }

    // Set up the parser
    val factory = DocumentBuilderFactory.newInstance()
    factory.isNamespaceAware = true
    val builder = factory.newDocumentBuilder()
    val document =
        try {
            builder.parse(xml.byteInputStream())
        } catch (e: SAXParseException) {
            logger.error("Could not parse the XML", e)

            return null
        }

    // Get the LOG element (any namespace)
    val logElements = document.getElementsByTagNameNS("*", "LOG")
    if (logElements.length < 1) {
        return null
    }

    val log = logElements.item(0) as Element
    val name = log.getAttribute("MA")
    val address = log.getAttribute("MD")

    return Pair(name, address)
}
