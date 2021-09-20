package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.domain.entities.ers.Catch
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessage
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.ers.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.*
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselControlAnteriority
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime

object TestUtils {
    val dummyVesselControlAnteriority = VesselControlAnteriority(
            lastControlDatetime = ZonedDateTime.now(),
            lastControlInfraction = false,
            numberRecentControls = 2.0,
            infractionScore = 2.56,
            controlRateRiskFactor = 3.56
    )

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
                ERSMessage(id = 1, analyzedByRules = listOf(), operationNumber = "", tripNumber = 345, ersId = "", operationType = ERSOperationType.DAT, messageType = "DEP",
                        message = dep, operationDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(24)),
                ERSMessage(id = 2, analyzedByRules = listOf(), operationNumber = "", tripNumber = 345, ersId = "", operationType = ERSOperationType.DAT, messageType = "FAR",
                        message = far, operationDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12)),
                ERSMessage(id = 3, analyzedByRules = listOf(), operationNumber = "", tripNumber = 345, ersId = "", operationType = ERSOperationType.DAT, messageType = "PNO",
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
                ERSMessage(id = 1, analyzedByRules = listOf(), operationNumber = "9065646811", tripNumber = 345, ersId = "9065646811", operationType = ERSOperationType.DAT, messageType = "FAR",
                        message = far, operationDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12)),
                ERSMessage(id = 2, analyzedByRules = listOf(), operationNumber = "", tripNumber = 345, ersId = "", referencedErsId = "9065646811", operationType = ERSOperationType.COR, messageType = "FAR",
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
                ERSMessage(id = 1, analyzedByRules = listOf(), operationNumber = "", tripNumber = 345, ersId = "9065646811", operationType = ERSOperationType.DAT, messageType = "FAR",
                        message = far, operationDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12)),
                ERSMessage(id = 2, analyzedByRules = listOf(), operationNumber = "", tripNumber = 345, ersId = "9065646816", referencedErsId = "9065646811", operationType = ERSOperationType.RET, messageType = "",
                        message = farBadAck, operationDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12)),
                ERSMessage(id = 3, analyzedByRules = listOf(), operationNumber = "", tripNumber = 345, ersId = "9065646813", operationType = ERSOperationType.DAT, messageType = "FAR",
                        message = farTwo, operationDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12)),
                ERSMessage(id = 4, analyzedByRules = listOf(), operationNumber = "", tripNumber = 345, ersId = "9065646818", referencedErsId = "9065646813", operationType = ERSOperationType.RET, messageType = "",
                        message = farAck, operationDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12)),
                ERSMessage(id = 4, analyzedByRules = listOf(), operationNumber = "", tripNumber = 345, ersId = "9065646818", referencedErsId = "9065646813", operationType = ERSOperationType.DEL, messageType = "",
                        message = farAck, operationDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12))
        )
    }

    fun getDummyPNOAndLANERSMessages(weightToAdd: Double = 0.0, addSpeciesToLAN: Boolean = false): List<Pair<ERSMessage, ERSMessage>> {
        val catchOne = Catch()
        catchOne.species = "TTV"
        catchOne.weight = 123.0
        val catchTwo = Catch()
        catchTwo.species = "SMV"
        catchTwo.weight = 961.5
        val catchThree = Catch()
        catchThree.species = "PNB"
        catchThree.weight = 69.7
        val catchFour = Catch()
        catchFour.species = "CQL"
        catchFour.weight = 98.2

        val catchFive = Catch()
        catchFive.species = "FGV"
        catchFive.weight = 25.5
        val catchSix = Catch()
        catchSix.species = "THB"
        catchSix.weight = 35.0
        val catchSeven = Catch()
        catchSeven.species = "VGY"
        catchSeven.weight = 66666.0
        val catchEight = Catch()
        catchEight.species = "MQP"
        catchEight.weight = 11.1

        val catchNine = Catch()
        catchNine.species = "FPS"
        catchNine.weight = 22.0

        val catchTen = Catch()
        catchTen.species = "DPD"
        catchTen.weight = 2225.0

        val firstLan = LAN()
        firstLan.catchLanded = listOf(catchOne, catchTwo, catchThree, catchFour, catchNine)

        val firstPno = PNO()
        firstPno.catchOnboard = listOf(
                catchOne.copy(weight = catchOne.weight?.plus(weightToAdd)),
                catchTwo.copy(weight = catchTwo.weight?.plus(0.5)),
                catchThree.copy(weight = catchThree.weight?.plus(weightToAdd)),
                catchFour)

        val secondLan = LAN()
        if(addSpeciesToLAN) {
            secondLan.catchLanded = listOf(catchFive, catchSix, catchSeven, catchEight, catchTen)
        } else {
            secondLan.catchLanded = listOf(catchFive, catchSix, catchSeven, catchEight)
        }
        val secondPno = PNO()
        secondPno.catchOnboard = listOf(catchFive, catchSix, catchSeven, catchEight)

        return listOf(
                Pair(ERSMessage(id = 1, analyzedByRules = listOf(), operationNumber = "456846844658", tripNumber = 125345, ersId = "456846844658",
                        operationType = ERSOperationType.DAT, messageType = "LAN", message = firstLan),
                        ERSMessage(id = 2, analyzedByRules = listOf(), operationNumber = "47177857577", tripNumber = 125345, ersId = "47177857577",
                                operationType = ERSOperationType.DAT, messageType = "PNO", message = firstPno)),
                Pair(ERSMessage(id = 3, analyzedByRules = listOf(), operationNumber = "48545254254", tripNumber = 125345, ersId = "48545254254",
                        operationType = ERSOperationType.DAT, messageType = "LAN", message = secondLan),
                        ERSMessage(id = 4, analyzedByRules = listOf(), operationNumber = "004045204504", tripNumber = 125345, ersId = "004045204504",
                                operationType = ERSOperationType.DAT, messageType = "PNO", message = secondPno)),
        )
    }
}
