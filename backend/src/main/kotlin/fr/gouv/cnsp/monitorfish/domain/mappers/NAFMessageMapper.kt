package fr.gouv.cnsp.monitorfish.domain.mappers

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.position.NetworkType
import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.exceptions.NAFMessageParsingException
import fr.gouv.cnsp.monitorfish.domain.helpers.degreeMinuteToDecimal
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.LocalDateTime
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import kotlin.properties.Delegates

class NAFMessageMapper(private val naf: String) {

    private val logger: Logger = LoggerFactory.getLogger(NAFMessageMapper::class.java)

    private lateinit var dateTime: ZonedDateTime
    private var from: CountryCode? = null
    private var destination: CountryCode? = null
    private var date: String? = null
    private var time: String? = null
    private var flagState: CountryCode? = null
    private var vesselName: String? = null
    private var internalReferenceNumber: String? = null
    private var ircs: String? = null
    private var externalReferenceNumber: String? = null
    private var latitude by Delegates.notNull<Double>()
    private var longitude by Delegates.notNull<Double>()
    private var course: Double? = null
    private var speed: Double? = null
    private var tripNumber: String? = null
    private var isManual: Boolean = false
    private var networkType: NetworkType? = null

    private val noCountry = "X"
    private val positionMessageType = "POS"
    private val manualMessageType = "MAN"
    private val dateTimeFormat = "yyyyMMddHHmm"

    init {
        if (!isValidMessage(naf)) {
            throw NAFMessageParsingException("Invalid NAF format", naf)
        }

        NAFCode.values()
            .filter { it.matches(naf) }
            .forEach {
                val value: String = it.getValue(naf)!!

                try {
                    when (it) {
                        NAFCode.TYPE_OF_MESSAGE -> when (value) {
                            positionMessageType -> this.isManual = false
                            manualMessageType -> {
                                this.isManual = true
                                logger.info("Receiving new manual position")
                            }
                            else -> throw NAFMessageParsingException("Unhandled message type \"$value\"", naf)
                        }
                        NAFCode.INTERNAL_REFERENCE_NUMBER -> this.internalReferenceNumber = value
                        NAFCode.RADIO_CALL_SIGN -> this.ircs = value
                        NAFCode.VESSEL_NAME -> this.vesselName = value
                        NAFCode.EXTERNAL_REFERENCE_NUMBER -> this.externalReferenceNumber = value
                        NAFCode.FLAG -> this.flagState = getCountryOrThrowIfCountryNotFound(value)
                        NAFCode.FROM -> this.from = getCountryOrThrowIfCountryNotFound(value)
                        NAFCode.TO -> this.destination = getCountryOrThrowIfCountryNotFound(value)
                        NAFCode.TRIP_NUMBER -> this.tripNumber = value
                        NAFCode.TIME -> this.time = value
                        NAFCode.DATE -> this.date = value
                        // Latitude
                        // i.e //LA/N4533// or //LA/S2344//
                        NAFCode.LATITUDE -> this.latitude = getLatLonFromString(value)
                        // Latitude in LT format
                        // i.e //LT/45.544// or //LT/-23.743//
                        NAFCode.LATITUDE_DECIMAL -> this.latitude = value.toDouble()
                        // Longitude
                        // i.e //LO/W04411//or //LO/E16600//
                        NAFCode.LONGITUDE -> this.longitude = value.let { longitude -> getLatLonFromString(longitude) }
                        // Longitude in LG format
                        // i.e //LG/-044.174// or //LG/+166.000//
                        NAFCode.LONGITUDE_DECIMAL -> this.longitude = value.toDouble()
                        NAFCode.SPEED -> this.speed = value.toDouble().div(10)
                        NAFCode.COURSE -> this.course = value.toDouble()
                        NAFCode.NETWORK_TYPE -> {
                            when (value.isNotEmpty()) {
                                true -> this.networkType = NetworkType.valueOf(value)
                                false -> this.networkType = null
                            }
                        }
                        else -> {
                            logger.debug("VMS parsing: NAF code \"$it\" of value \"$value\" not handled")
                        }
                    }
                } catch (e: NumberFormatException) {
                    throw NAFMessageParsingException("Incorrect value at field $it", naf, e)
                }
            }.run {
                setZoneDateTimeFromString()
            }
    }

    private fun isValidMessage(message: String): Boolean {
        val startRecord: String = NAFCode.DELIMITER + NAFCode.START_RECORD.code + NAFCode.DELIMITER
        val endRecord: String = NAFCode.DELIMITER + NAFCode.END_RECORD.code + NAFCode.DELIMITER
        return message.startsWith(startRecord) && message.endsWith(endRecord)
    }

    private fun getCountryOrThrowIfCountryNotFound(value: String): CountryCode? {
        return if (value.isNotEmpty() && value != noCountry) {
            CountryCode.getByAlpha3Code(value) ?: throw NAFMessageParsingException("Country \"$value\" not found", naf)
        } else {
            null
        }
    }

    private fun setZoneDateTimeFromString() {
        if (date != null && time != null) {
            val dateTimeString = date + time
            val formatter = DateTimeFormatter.ofPattern(dateTimeFormat)
            val parsedDate = LocalDateTime.parse(dateTimeString, formatter)

            dateTime = ZonedDateTime.of(parsedDate, UTC)
        } else {
            throw NAFMessageParsingException("No date or time fields found", naf)
        }
    }

    private fun getLatLonFromString(value: String): Double {
        val regex = "([NSEW]{1})([0-9]{2,3})([0-9]{2})".toRegex()

        return try {
            regex.matchEntire(value)
                ?.destructured
                ?.let { (direction, degrees, minutes) ->
                    degreeMinuteToDecimal(direction, degrees.toInt(), minutes.toInt())
                }
                ?: throw IllegalArgumentException("Bad input \"$value\"")
        } catch (e: IllegalArgumentException) {
            throw NAFMessageParsingException("Could not parse Latitude/Longitude", naf, e)
        }
    }

    fun toPosition(): Position {
        return Position(
            internalReferenceNumber = internalReferenceNumber,
            ircs = ircs,
            externalReferenceNumber = externalReferenceNumber,
            dateTime = dateTime,
            latitude = latitude,
            longitude = longitude,
            vesselName = vesselName,
            speed = speed,
            course = course,
            flagState = flagState,
            destination = destination,
            from = from,
            tripNumber = tripNumber,
            positionType = PositionType.VMS,
            networkType = n,
            isManual = isManual,
        )
    }
}
