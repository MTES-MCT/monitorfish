package fr.gouv.cnsp.monitorfish

import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.AbstractDBTests
import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest
class MonitorFishApplicationTests : AbstractDBTests(){

	@Test
	fun contextLoads() {
	}

}
