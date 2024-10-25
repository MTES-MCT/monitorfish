package fr.gouv.cnsp.monitorfish.fakers

import fr.gouv.cnsp.monitorfish.domain.entities.administration.Administration
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.dtos.FullControlUnit
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.dtos.FullControlUnitResource

class FullControlUnitFaker {
    companion object {
        fun fakeFullControlUnit(
            id: Int = 1,
            areaNote: String? = "Default Area Note",
            administration: Administration = fakeAdministration(),
            administrationId: Int = administration.id,
            controlUnitContactIds: List<Int> = listOf(1),
            controlUnitContacts: List<ControlUnitContact> = listOf(fakeControlUnitContact()),
            controlUnitResourceIds: List<Int> = listOf(1),
            controlUnitResources: List<FullControlUnitResource> = listOf(fakeFullControlUnitResource()),
            departmentArea: ControlUnitDepartmentArea? = fakeControlUnitDepartmentArea(),
            departmentAreaInseeCode: String? = departmentArea?.inseeCode,
            isArchived: Boolean = false,
            name: String = "Fake Control Unit Name",
            termsNote: String? = "Default Terms Note",
        ): FullControlUnit {
            return FullControlUnit(
                id = id,
                areaNote = areaNote,
                administration = administration,
                administrationId = administrationId,
                controlUnitContactIds = controlUnitContactIds,
                controlUnitContacts = controlUnitContacts,
                controlUnitResourceIds = controlUnitResourceIds,
                controlUnitResources = controlUnitResources,
                departmentArea = departmentArea,
                departmentAreaInseeCode = departmentAreaInseeCode,
                isArchived = isArchived,
                name = name,
                termsNote = termsNote,
            )
        }

        private fun fakeAdministration(
            id: Int = 1,
            isArchived: Boolean = false,
            name: String = "Fake Administration Name",
        ): Administration {
            return Administration(
                id = id,
                isArchived = isArchived,
                name = name,
            )
        }

        private fun fakeControlUnitContact(
            id: Int = 1,
            controlUnitId: Int = 1,
            email: String? = "contact@example.com",
            isEmailSubscriptionContact: Boolean = true,
            isSmsSubscriptionContact: Boolean = false,
            name: String = "Fake Contact Name",
            phone: String? = "+1234567890",
        ): ControlUnitContact {
            return ControlUnitContact(
                id = id,
                controlUnitId = controlUnitId,
                email = email,
                isEmailSubscriptionContact = isEmailSubscriptionContact,
                isSmsSubscriptionContact = isSmsSubscriptionContact,
                name = name,
                phone = phone,
            )
        }

        private fun fakeFullControlUnitResource(
            id: Int = 1,
            controlUnit: ControlUnit = fakeControlUnit(),
            controlUnitId: Int = controlUnit.id,
            isArchived: Boolean = false,
            name: String = "Fake Resource Name",
            note: String? = "Default Resource Note",
            photo: ByteArray? = null,
            station: ControlUnitStation = fakeControlUnitStation(),
            stationId: Int = station.id,
            type: ControlUnitResourceType = ControlUnitResourceType.FRIGATE,
        ): FullControlUnitResource {
            return FullControlUnitResource(
                id = id,
                controlUnit = controlUnit,
                controlUnitId = controlUnitId,
                isArchived = isArchived,
                name = name,
                note = note,
                photo = photo,
                station = station,
                stationId = stationId,
                type = type,
            )
        }

        private fun fakeControlUnit(
            id: Int = 1,
            areaNote: String? = "Default Area Note",
            administrationId: Int = 1,
            departmentAreaInseeCode: String? = "00000",
            isArchived: Boolean = false,
            name: String = "Fake Control Unit Name",
            termsNote: String? = "Default Terms Note",
        ): ControlUnit {
            return ControlUnit(
                id = id,
                areaNote = areaNote,
                administrationId = administrationId,
                departmentAreaInseeCode = departmentAreaInseeCode,
                isArchived = isArchived,
                name = name,
                termsNote = termsNote,
            )
        }

        private fun fakeControlUnitDepartmentArea(
            inseeCode: String = "00000",
            name: String = "Fake Department Area Name",
        ): ControlUnitDepartmentArea {
            return ControlUnitDepartmentArea(
                inseeCode = inseeCode,
                name = name,
            )
        }

        private fun fakeControlUnitStation(
            id: Int = 1,
            latitude: Double = 48.8566,
            longitude: Double = 2.3522,
            name: String = "Fake Station Name",
        ): ControlUnitStation {
            return ControlUnitStation(
                id = id,
                latitude = latitude,
                longitude = longitude,
                name = name,
            )
        }
    }
}
