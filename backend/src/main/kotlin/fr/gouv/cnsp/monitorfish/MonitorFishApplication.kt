package fr.gouv.cnsp.monitorfish

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class MonitorFishApplication

fun main(args: Array<String>) {
	runApplication<MonitorFishApplication>(*args)
}
