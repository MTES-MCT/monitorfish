package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

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
) {

    fun toSpecies() = Species(
        code = code,
        name = name,
    )
}
