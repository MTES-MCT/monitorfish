package fr.gouv.cnsp.monitorfish.utils

import java.text.Normalizer

object StringUtils {
    fun removeAccents(input: String): String {
        val normalizedInput = Normalizer.normalize(input, Normalizer.Form.NFD)

        return normalizedInput.replace("\\p{InCombiningDiacriticalMarks}+".toRegex(), "")
    }
}
