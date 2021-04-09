package fr.gouv.cnsp.monitorfish.domain.use_cases.dtos

import fr.gouv.cnsp.monitorfish.domain.entities.controls.Control

class ControlAndInfractionIds(var control: Control, var infractionIds: List<Int>)
