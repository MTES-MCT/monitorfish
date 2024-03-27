package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import kotlinx.coroutines.runBlocking
import org.mockito.BDDMockito

fun <T> givenSuspended(block: suspend () -> T) = BDDMockito.given(runBlocking { block() })!!
