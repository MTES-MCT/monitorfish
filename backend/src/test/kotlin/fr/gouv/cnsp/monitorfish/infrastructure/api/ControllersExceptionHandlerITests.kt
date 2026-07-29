package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.config.SentryConfig
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendInternalErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendInternalException
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendUsageException
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotFindException
import fr.gouv.cnsp.monitorfish.domain.exceptions.NAFMessageParsingException
import fr.gouv.cnsp.monitorfish.infrastructure.exceptions.BackendRequestErrorCode
import fr.gouv.cnsp.monitorfish.infrastructure.exceptions.BackendRequestException
import org.hamcrest.Matchers.containsString
import org.hamcrest.Matchers.equalTo
import org.hamcrest.Matchers.not
import org.hamcrest.Matchers.nullValue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

private const val LEAKY_MESSAGE = "jdbc://user:hunter2@db/monitorfishdb violates constraint pnos_pkey"

/** Raises each kind of failure the handler is expected to translate, through the real Spring MVC stack. */
@RestController
@RequestMapping("/test/errors")
class ThrowingController {
    @GetMapping("/usage/{code}")
    fun throwUsageException(
        @PathVariable code: BackendUsageErrorCode,
    ): Nothing = throw BackendUsageException(code, message = "Usage failure.", data = listOf(1, 2))

    @GetMapping("/internal")
    fun throwInternalException(): Nothing =
        throw BackendInternalException(
            message = "Unprocessable resource.",
            code = BackendInternalErrorCode.UNPROCESSABLE_RESOURCE_DATA,
        )

    @GetMapping("/request")
    fun throwRequestException(): Nothing =
        throw BackendRequestException(BackendRequestErrorCode.EMPTY_UPLOADED_FILE, message = "Empty file.")

    @GetMapping("/unexpected")
    fun throwUnexpectedException(): Nothing = throw IllegalStateException(LEAKY_MESSAGE)

    @GetMapping("/could-not-find")
    fun throwCouldNotFindException(): Nothing = throw CouldNotFindException("Vessel 123 not found.")

    @GetMapping("/naf")
    fun throwNafParsingException(): Nothing = throw NAFMessageParsingException("Invalid NAF format", "//SR//AD/FRA")

    @GetMapping("/required-parameter")
    fun requireParameter(
        @RequestParam(name = "vesselId") vesselId: Int,
    ) = vesselId
}

@Import(
    MapperConfiguration::class,
    SentryConfig::class,
    ControllersExceptionHandler::class,
    ThrowingController::class,
)
@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(value = [ThrowingController::class])
class ControllersExceptionHandlerITests {
    @Autowired
    private lateinit var api: MockMvc

    /**
     * The Frontend turns this body into an empty result instead of an error,
     * see `valueOrUndefinedIfNotFoundOrThrow()`.
     */
    @Test
    fun `Should return OK with the code When the resource may legitimately be missing`() {
        api
            .perform(get("/test/errors/usage/NOT_FOUND_BUT_OK"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.code", equalTo("NOT_FOUND_BUT_OK")))
    }

    @Test
    fun `Should return NOT_FOUND When the resource is expected to exist`() {
        api
            .perform(get("/test/errors/usage/NOT_FOUND"))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.code", equalTo("NOT_FOUND")))
    }

    @Test
    fun `Should return BAD_REQUEST with the data When the request cannot be processed`() {
        api
            .perform(get("/test/errors/usage/COULD_NOT_UPDATE"))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.code", equalTo("COULD_NOT_UPDATE")))
            .andExpect(jsonPath("$.message", equalTo("Usage failure.")))
            .andExpect(jsonPath("$.data", equalTo(listOf(1, 2))))
    }

    @Test
    fun `Should return INTERNAL_SERVER_ERROR with the code When the Backend failed`() {
        api
            .perform(get("/test/errors/internal"))
            .andExpect(status().isInternalServerError)
            .andExpect(jsonPath("$.code", equalTo("UNPROCESSABLE_RESOURCE_DATA")))
            .andExpect(jsonPath("$.message", equalTo("Unprocessable resource.")))
    }

    @Test
    fun `Should return UNPROCESSABLE_ENTITY When the request is invalid`() {
        api
            .perform(get("/test/errors/request"))
            .andExpect(status().isUnprocessableEntity)
            .andExpect(jsonPath("$.code", equalTo("EMPTY_UPLOADED_FILE")))
            .andExpect(jsonPath("$.message", equalTo("Empty file.")))
    }

    @Test
    fun `Should not disclose the exception message When the exception is unexpected`() {
        api
            .perform(get("/test/errors/unexpected"))
            .andExpect(status().isInternalServerError)
            .andExpect(jsonPath("$.code", nullValue()))
            .andExpect(jsonPath("$.message", equalTo(BackendInternalException.DEFAULT_MESSAGE)))
            .andExpect(jsonPath("$.message", not(containsString("hunter2"))))
    }

    @Test
    fun `Should return BAD_REQUEST with the thrown exception type When a resource could not be found`() {
        api
            .perform(get("/test/errors/could-not-find"))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error", equalTo("Vessel 123 not found.")))
            .andExpect(jsonPath("$.type", equalTo("CouldNotFindException")))
    }

    @Test
    fun `Should return OK When a NAF message could not be parsed`() {
        api
            .perform(get("/test/errors/naf"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.error", equalTo("Invalid NAF format for NAF message \"//SR//AD/FRA\"")))
            .andExpect(jsonPath("$.type", equalTo("NAFMessageParsingException")))
    }

    @Test
    fun `Should return BAD_REQUEST naming the parameter When a required parameter is missing`() {
        api
            .perform(get("/test/errors/required-parameter"))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error", equalTo("Parameter \"vesselId\" is missing.")))
    }
}
