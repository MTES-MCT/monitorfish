package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import com.vladmihalcea.hibernate.type.array.ListArrayType
import com.vladmihalcea.hibernate.type.json.JsonBinaryType
import fr.gouv.cnsp.monitorfish.domain.entities.controls.Control
import fr.gouv.cnsp.monitorfish.domain.entities.controls.GearControl
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import org.hibernate.annotations.TypeDefs
import java.time.Instant
import java.time.ZoneOffset.UTC
import javax.persistence.*

@Entity
@TypeDefs(
        TypeDef(name = "jsonb",
                typeClass = JsonBinaryType::class),
        TypeDef(name = "integer-array",
                typeClass = ListArrayType::class)
)
@Table(name = "controls")
@SecondaryTable(name = "infractions", pkJoinColumns = [PrimaryKeyJoinColumn(name = "id")])
data class ControlEntity(
        @Id
        @Column(name = "id")
        var id: Int,
        @Column(name = "vessel_id")
        var vesselId: Int,
        @OneToOne(cascade = [CascadeType.ALL])
        @JoinColumn(name = "controller_id", referencedColumnName = "id")
        var controller: ControllerEntity,
        @Column(name = "control_type")
        var controlType: String? = null,
        @Column(name = "control_datetime_utc")
        var controlDatetimeUtc: Instant? = null,
        @Column(name = "input_start_datetime_utc")
        var inputStartDatetimeUtc: Instant? = null,
        @Column(name = "input_end_datetime_utc")
        var inputEndDatetimeUtc: Instant? = null,
        @Column(name = "facade")
        var facade: String? = null,
        @Column(name = "longitude")
        var longitude: Double? = null,
        @Column(name = "latitude")
        var latitude: Double? = null,
        @Column(name = "port_locode")
        var portLocode: String? = null,
        @Column(name = "mission_order")
        var missionOrder: Boolean? = null,
        @Column(name = "vessel_targeted")
        var vesselTargeted: Boolean? = null,
        @Column(name = "cnsp_called_unit")
        var cnspCalledUnit: Boolean? = null,
        @Column(name = "cooperative")
        var cooperative: Boolean? = null,
        @Column(name = "pre_control_comments")
        var preControlComments: String? = null,
        @Column(name = "infraction")
        var infraction: Boolean? = null,
        @Type(type = "integer-array")
        @Column(name = "infraction_ids")
        var infractionIds: List<Int>? = listOf(),
        @Column(name = "diversion")
        var diversion: Boolean? = null,
        @Column(name = "escort_to_quay")
        var escortToQuay: Boolean? = null,
        @Column(name = "seizure")
        var seizure: Boolean? = null,
        @Column(name = "seizure_comments")
        var seizureComments: String? = null,
        @Column(name = "post_control_comments")
        var postControlComments: String? = null,
        @Type(type = "jsonb")
        @Column(name = "gear_controls", columnDefinition = "jsonb")
        var gearControls: String? = null) {
        
    fun toControl(mapper: ObjectMapper) = Control(
            id = id,
            vesselId = vesselId,
            controller = controller.toController(),
            controlType = controlType,
            controlDatetimeUtc = controlDatetimeUtc?.atZone(UTC),
            inputStartDatetimeUtc = inputStartDatetimeUtc?.atZone(UTC),
            inputEndDatetimeUtc = inputEndDatetimeUtc?.atZone(UTC),
            facade = facade,
            longitude = longitude,
            latitude = latitude,
            portLocode = portLocode,
            missionOrder = missionOrder,
            vesselTargeted = vesselTargeted,
            cnspCalledUnit = cnspCalledUnit,
            cooperative = cooperative,
            preControlComments = preControlComments,
            infraction = infraction,
            diversion = diversion,
            escortToQuay = escortToQuay,
            seizure = seizure,
            seizureComments = seizureComments,
            postControlComments = postControlComments,
            gearControls = mapper.readValue(gearControls, mapper.typeFactory
                    .constructCollectionType(MutableList::class.java, GearControl::class.java))
    )
}
