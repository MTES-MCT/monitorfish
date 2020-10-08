package fr.gouv.cnsp.monitorfish.infrastructure.api.inputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.entities.PositionType
import fr.gouv.cnsp.monitorfish.domain.helpers.degreeMinuteToDecimal
import fr.gouv.cnsp.monitorfish.infrastructure.api.inputs.exceptions.NAFMessageParsingException
import java.time.LocalDateTime
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import kotlin.properties.Delegates

class NAFPositionDataInput(private val naf: String) {

    private lateinit var dateTime: ZonedDateTime
    private var from: CountryCode? = null
    private var destination: CountryCode? = null
    private var date: String? = null
    private var time: String? = null
    private var flagState: CountryCode? = null
    private var vesselName: String? = null
    private var internalReferenceNumber: String? = null
    private var IRCS: String? = null
    private var externalReferenceNumber: String? = null
    private var latitude by Delegates.notNull<Double>()
    private var longitude by Delegates.notNull<Double>()
    private var course by Delegates.notNull<Double>()
    private var speed by Delegates.notNull<Double>()
    private var tripNumber: Int? = null

    private val fieldSize = 2
    private val fieldCodeIndex = 0
    private val fieldValueIndex = 1
    private val positionMessageType = "POS"
    private val dateTimeFormat = "yyyyMMddHHmm"

    init {
        naf.split("//")
                .forEach { fieldString ->
                    val field = fieldString.split("/")

                    if (field.isNotEmpty() && field.size == fieldSize) {
                        val code = field[fieldCodeIndex]
                        val value = field[fieldValueIndex]

                        when (code) {
                            "TM" -> if (value != positionMessageType) throw NAFMessageParsingException("Unhandled message type \"$value\"", naf)
                            // Internal number
                            // i.e //IR/DEU009876//
                            "IR" -> this.internalReferenceNumber = value
                            // Radio call sign
                            // i.e //RC/MGDD4//
                            "RC" -> this.IRCS = value
                            "NA" -> this.vesselName = value
                            "XR" -> this.externalReferenceNumber
                            "FS" -> this.flagState = getCountryOrThrowIfCountryNotFound(value)
                            "FR" -> this.from = getCountryOrThrowIfCountryNotFound(value)
                            "AD" -> this.destination = getCountryOrThrowIfCountryNotFound(value)
                            "TN" -> this.tripNumber = value.toInt()
                            "TI" -> this.time = value
                            "DA" -> this.date = value
                            // Latitude
                            // i.e //LA/N4533// or //LA/S2344//
                            "LA" -> this.latitude = getLatLonFromString(value)
                            // Latitude in LT format
                            // i.e //LT/45.544// or //LT/-23.743//
                            "LT"
                            -> this.latitude = value.toDouble()
                            // Longitude
                            // i.e //LO/W04411//or //LO/E16600//
                            "LO" -> this.longitude = getLatLonFromString(value)
                            // Longitude in LG format
                            // i.e //LG/-044.174// or //LG/+166.000//
                            "LG" -> this.longitude = value.toDouble()
                            "SP" -> this.speed = value.toDouble().div(10)
                            "CO" -> this.course = value.toDouble()

                            else -> {
                                // TODO : Log
                            }
                        }
                    }
                }.run {
                    setZoneDateTimeFromString()
                }
    }

    private fun getCountryOrThrowIfCountryNotFound(value: String): CountryCode? {
        return if (value.isNotEmpty()) {
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
                IRCS = IRCS,
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
                positionType = PositionType.VMS
        )
    }
}