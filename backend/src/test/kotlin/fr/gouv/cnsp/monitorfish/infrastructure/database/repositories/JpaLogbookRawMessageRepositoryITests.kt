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
            "<ers:OPS AD=\"FRA\" FR=\"OOE\" ON=\"OOF20190126059903\" OD=\"2021-01-28\" OT=\"23:53\" EVL=\"TurboCatch (3.5-5)\">\n" +
                "<ers:DAT TM=\"CU\">\n" +
                "<ers:ERS RN=\"OOE20210128025702\" RD=\"2021-01-28\" RT=\"23:53\">\n" +
                "<ers:LOG IR=\"FRA000730810\" RC=\"FGRH\" XR=\"GV710812\" NA=\"LE MUREX\" MA=\"YALA\" MD=\"PENMARCH \" FS=\"FRA\">\n" +
                "<ers:FAR LR=\"0\" IS=\"0\" DA=\"2021-01-28\" TI=\"22:01\">\n" +
                "<ers:POS LT=\"51.323\" LG=\"-5.724\"/>\n" +
                "<ers:GEA GE=\"OTT\" ME=\"110\" GC=\"20;2\" FO=\"4\" DU=\"960\" FD=\"80\"/>\n" +
                "<ers:SPE SN=\"ANF\" WT=\"207.40\" MM=\"EST\">\n" +
                "<ers:RAS FA=\"27\" SA=\"7\" ID=\"g\" EZ=\"GBR\" SR=\"31E4\"/>\n" +
                "<ers:PRO PS=\"FRE\" PR=\"GUT\" TY=\"BUL\" CF=\"1.22\"/>\n" +
                "<ers:ESPE Type=\"nat\" MR=\"20210035\"/>\n" +
                "</ers:SPE>\n" +
                "<ers:SPE SN=\"COD\" WT=\"35.10\" MM=\"EST\">\n" +
                "<ers:RAS FA=\"27\" SA=\"7\" ID=\"g\" EZ=\"GBR\" SR=\"31E4\"/>\n" +
                "<ers:PRO PS=\"FRE\" PR=\"GUT\" TY=\"BUL\" CF=\"1.17\"/>\n" +
                "<ers:ESPE Type=\"nat\" MR=\"20210035\"/>\n" +
                "</ers:SPE>\n" +
                "<ers:SPE SN=\"RJC\" WT=\"339.00\" MM=\"EST\">\n" +
                "<ers:RAS FA=\"27\" SA=\"7\" ID=\"g\" EZ=\"GBR\" SR=\"31E4\"/>\n" +
                "<ers:PRO PS=\"FRE\" PR=\"GUT\" TY=\"BUL\" CF=\"1.13\"/>\n" +
                "<ers:ESPE Type=\"nat\" MR=\"20210035\"/>\n" +
                "</ers:SPE>\n" +
                "<ers:SPE SN=\"RJM\" WT=\"728.85\" MM=\"EST\">\n" +
                "<ers:RAS FA=\"27\" SA=\"7\" ID=\"g\" EZ=\"GBR\" SR=\"31E4\"/>\n" +
                "<ers:PRO PS=\"FRE\" PR=\"GUT\" TY=\"BUL\" CF=\"1.13\"/>\n" +
                "<ers:ESPE Type=\"nat\" MR=\"20210035\"/>\n" +
                "</ers:SPE>\n" +
                "<ers:SPE SN=\"LEZ\" WT=\"26.50\" MM=\"EST\">\n" +
                "<ers:RAS FA=\"27\" SA=\"7\" ID=\"g\" EZ=\"GBR\" SR=\"31E4\"/>\n" +
                "<ers:PRO PS=\"FRE\" PR=\"GUT\" TY=\"BUL\" CF=\"1.06\"/>\n" +
                "<ers:ESPE Type=\"nat\" MR=\"20210035\"/>\n" +
                "</ers:SPE>\n" +
                "<ers:SPE SN=\"WIT\" WT=\"84.80\" MM=\"EST\">\n" +
                "<ers:RAS FA=\"27\" SA=\"7\" ID=\"g\" EZ=\"GBR\" SR=\"31E4\"/>\n" +
                "<ers:PRO PS=\"FRE\" PR=\"GUT\" TY=\"BUL\" CF=\"1.06\"/>\n" +
                "<ers:ESPE Type=\"nat\" MR=\"20210035\"/>\n" +
                "</ers:SPE>\n" +
                "<ers:SPE SN=\"HAD\" WT=\"228.15\" MM=\"EST\">\n" +
                "<ers:RAS FA=\"27\" SA=\"7\" ID=\"g\" EZ=\"GBR\" SR=\"31E4\"/>\n" +
                "<ers:PRO PS=\"FRE\" PR=\"GUT\" TY=\"BUL\" CF=\"1.17\"/>\n" +
                "<ers:ESPE Type=\"nat\" MR=\"20210035\"/>\n" +
                "</ers:SPE>\n" +
                "<ers:SPE SN=\"SOL\" WT=\"13.52\" MM=\"EST\">\n" +
                "<ers:RAS FA=\"27\" SA=\"7\" ID=\"g\" EZ=\"GBR\" SR=\"31E4\"/>\n" +
                "<ers:PRO PS=\"FRE\" PR=\"GUT\" TY=\"BUL\" CF=\"1.04\"/>\n" +
                "<ers:ESPE Type=\"nat\" MR=\"20210035\"/>\n" +
                "</ers:SPE>\n" +
                "<ers:SPE SN=\"SDV\" WT=\"6.65\" MM=\"EST\">\n" +
                "<ers:RAS FA=\"27\" SA=\"7\" ID=\"g\" EZ=\"GBR\" SR=\"31E4\"/>\n" +
                "<ers:PRO PS=\"FRE\" PR=\"GUT\" TY=\"BUL\" CF=\"1.33\"/>\n" +
                "<ers:ESPE Type=\"nat\" MR=\"20210035\"/>\n" +
                "</ers:SPE>\n" +
                "<ers:SPE SN=\"SCL\" WT=\"25.00\" MM=\"EST\">\n" +
                "<ers:RAS FA=\"27\" SA=\"7\" ID=\"g\" EZ=\"GBR\" SR=\"31E4\"/>\n" +
                "<ers:PRO PS=\"FRE\" PR=\"GUT\" TY=\"BUL\" CF=\"1\"/>\n" +
                "<ers:ESPE Type=\"nat\" MR=\"20210035\"/>\n" +
                "</ers:SPE>\n" +
                "<ers:SPE SN=\"TUR\" WT=\"27.25\" MM=\"EST\">\n" +
                "<ers:RAS FA=\"27\" SA=\"7\" ID=\"g\" EZ=\"GBR\" SR=\"31E4\"/>\n" +
                "<ers:PRO PS=\"FRE\" PR=\"GUT\" TY=\"BUL\" CF=\"1.09\"/>\n" +
                "<ers:ESPE Type=\"nat\" MR=\"20210035\"/>\n" +
                "</ers:SPE>\n" +
                "<ers:SPE SN=\"POL\" WT=\"5.85\" MM=\"EST\">\n" +
                "<ers:RAS FA=\"27\" SA=\"7\" ID=\"g\" EZ=\"GBR\" SR=\"31E4\"/>\n" +
                "<ers:PRO PS=\"FRE\" PR=\"GUT\" TY=\"BUL\" CF=\"1.17\"/>\n" +
                "<ers:ESPE Type=\"nat\" MR=\"20210035\"/>\n" +
                "</ers:SPE>\n" +
                "<ers:EFAR Type=\"nat\" DF=\"8\"/>\n" +
                "</ers:FAR>\n" +
                "<ers:ELOG Type=\"nat\" TN=\"20210035\"/>\n" +
                "</ers:LOG>\n" +
                "</ers:ERS>\n" +
                "</ers:DAT>\n" +
                "</ers:OPS>",
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
