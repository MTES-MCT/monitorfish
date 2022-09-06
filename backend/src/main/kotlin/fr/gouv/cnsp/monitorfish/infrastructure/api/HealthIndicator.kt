package fr.gouv.cnsp.monitorfish.infrastructure.api

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.actuate.health.HealthComponent
import org.springframework.boot.actuate.health.HealthEndpoint

@Autowired
private val healthEndpoint: HealthEndpoint? = null

fun getAlive(): HealthComponent? {
  return healthEndpoint?.health()
}
