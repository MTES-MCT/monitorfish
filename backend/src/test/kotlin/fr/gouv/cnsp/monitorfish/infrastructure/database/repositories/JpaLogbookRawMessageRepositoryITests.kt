package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSMessagesFound
import org.assertj.core.api.Assertions
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.context.annotation.Import
import org.springframework.transaction.annotation.Transactional

@Import(MapperConfiguration::class)
class JpaLogbookRawMessageRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaLogbookRawMessageRepository: JpaLogbookRawMessageRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache("logbook_raw_message")?.clear()
    }

    @Test
    @Transactional
    fun `findRawMessage Should return the raw message`() {
        // When
        val rawMessage = jpaLogbookRawMessageRepository.findRawMessage("OOF20190126059903")

        // Then
        assertThat(rawMessage).isEqualTo(
            "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><ers:OPS xmlns:ers=\"http://ec.europa.eu/fisheries/schema/ers/v3\" AD=\"FRA\" FR=\"OOF\" ON=\"OOF20250704017200\" OD=\"2025-07-04\" OT=\"21:44\" EVL=\"IKTUS 4.6.7\"><ers:DAT TM=\"CU\"><ers:ERS RN=\"OOF20250704017200\" RD=\"2025-07-04\" RT=\"21:44\"><ers:LOG IR=\"XXX\" RC=\"\" XR=\"\" NA=\"VESSEL NAME\" MA=\"Jean Bon\" MD=\"56, rue du Croisic, 44100, Nantes\" FS=\"FRA\"><ers:DEP DA=\"2025-07-04\" TI=\"21:44\" PO=\"FROII\" AA=\"FSH\"><ers:GEA GE=\"OTT\" ME=\"80\" GC=\"17.0;0.0\"/></ers:DEP><ers:ELOG Type=\"nat\" CH=\"FRA\" TN=\"20250055\"/></ers:LOG></ers:ERS></ers:DAT></ers:OPS>",
        )
    }

    @Test
    @Transactional
    fun `findRawMessage Should throw an exception When the message is not found`() {
        // When
        val throwable = Assertions.catchThrowable { jpaLogbookRawMessageRepository.findRawMessage("BAD_OP") }

        // Then
        assertThat(throwable).isInstanceOf(NoERSMessagesFound::class.java)
    }
}
