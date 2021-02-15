package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.Species
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table(name = "species")
data class SpeciesEntity(
        @Id
        @Column(name = "id")
        val id: Int? = null,

        @Column(name = "species_code")
        val code: String,
        @Column(name = "species_name")
        val name: String,
        @Column(name = "species_group_code")
        val groupCode: String? = null,
        @Column(name = "species_group_name")
        val groupName: String? = null,
        @Column(name = "source")
        val source: String? = null) {

        fun toSpecies() = Species(
            code = code,
            name = name,
    )
}
