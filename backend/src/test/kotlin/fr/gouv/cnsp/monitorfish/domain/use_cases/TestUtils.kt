package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.domain.entities.ers.Catch
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessage
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.DEP
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.Acknowledge
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.FAR
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.PNO
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime

object TestUtils {
    fun getDummyERSMessage(): List<ERSMessage> {
        val gearOne = Gear()
        gearOne.gear = "OTB"
        val gearTwo = Gear()
        gearTwo.gear = "DRB"

        val catchOne = Catch()
        catchOne.species = "TTV"
        val catchTwo = Catch()
        catchTwo.species = "SMV"
        val catchThree = Catch()
        catchThree.species = "PNB"

        val dep = DEP()
        dep.gearOnboard = listOf(gearOne, gearTwo)
        dep.speciesOnboard = listOf(catchOne)
        dep.departurePort = "AEFAT"

        val far = FAR()
        far.gear = "OTB"
        far.catches = listOf(catchTwo, catchThree)
        far.mesh = 120.0

        val pno = PNO()
        pno.catchOnboard = listOf(catchOne, catchTwo, catchThree)
        pno.port = "AEJAZ"

        return listOf(
                ERSMessage(operationNumber = "", tripNumber = 345, ersId = "", operationType = ERSOperationType.DAT, messageType = "DEP",
                        message = dep, operationDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(24)),
                ERSMessage(operationNumber = "", tripNumber = 345, ersId = "", operationType = ERSOperationType.DAT, messageType = "FAR",
                        message = far, operationDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12)),
                ERSMessage(operationNumber = "", tripNumber = 345, ersId = "", operationType = ERSOperationType.DAT, messageType = "PNO",
                        message = pno, operationDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(0)))
    }

    fun getCorrectedDummyERSMessage(): List<ERSMessage> {
        val catchOne = Catch()
        catchOne.species = "TTV"
        val catchTwo = Catch()
        catchTwo.species = "SMV"
        val catchThree = Catch()
        catchThree.species = "PNB"

        val far = FAR()
        far.gear = "OTB"
        far.catches = listOf(catchOne, catchTwo)
        far.mesh = 120.0

        val farToCorrect = FAR()
        farToCorrect.gear = "OTB"
        farToCorrect.catches = listOf(catchOne, catchTwo, catchThree)
        farToCorrect.mesh = 120.0

        return listOf(
                ERSMessage(operationNumber = "", tripNumber = 345, ersId = "9065646811", operationType = ERSOperationType.DAT, messageType = "FAR",
                        message = far, operationDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12)),
                ERSMessage(operationNumber = "", tripNumber = 345, ersId = "", referencedErsId = "9065646811", operationType = ERSOperationType.COR, messageType = "FAR",
                        message = farToCorrect, operationDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12))
                )
    }

    fun getRETDummyERSMessage(): List<ERSMessage> {
        val catchOne = Catch()
        catchOne.species = "TTV"
        val catchTwo = Catch()
        catchTwo.species = "SMV"
        val catchThree = Catch()
        catchThree.species = "PNB"

        val far = FAR()
        far.gear = "OTB"
        far.catches = listOf(catchOne, catchTwo)
        far.mesh = 120.0

        val farTwo = FAR()
        farTwo.gear = "OTB"
        farTwo.catches = listOf(catchOne, catchTwo, catchThree)
        farTwo.mesh = 120.0

        val farAck = Acknowledge()
        farAck.returnStatus = "000"

        val farBadAck = Acknowledge()
        farBadAck.returnStatus = "002"
        farBadAck.rejectionCause = "Oops"

        return listOf(
                ERSMessage(operationNumber = "", tripNumber = 345, ersId = "9065646811", operationType = ERSOperationType.DAT, messageType = "FAR",
                        message = far, operationDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12)),
                ERSMessage(operationNumber = "", tripNumber = 345, ersId = "9065646816", referencedErsId = "9065646811", operationType = ERSOperationType.RET, messageType = "",
                        message = farBadAck, operationDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12)),
                ERSMessage(operationNumber = "", tripNumber = 345, ersId = "9065646813", operationType = ERSOperationType.DAT, messageType = "FAR",
                        message = farTwo, operationDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12)),
                ERSMessage(operationNumber = "", tripNumber = 345, ersId = "9065646818", referencedErsId = "9065646813", operationType = ERSOperationType.RET, messageType = "",
                        message = farAck, operationDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12))
        )
    }
}