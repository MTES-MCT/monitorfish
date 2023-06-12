package fr.gouv.cnsp.monitorfish.infrastructure.api

import fr.gouv.cnsp.monitorfish.config.OIDCProperties
import fr.gouv.cnsp.monitorfish.config.SecurityConfig
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.use_cases.port.GetActivePorts
import fr.gouv.cnsp.monitorfish.infrastructure.api.bff.PortController
import fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.SpaController
import fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.VersionController
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.info.BuildProperties
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class SecurityConfigITests {
    /**
     * The public-key-location is set to an inner class in order to override the application.properties
     * only for this test case using the public key `bad-oidc-issuer.pub`
     */
    @Nested
    @Import(SecurityConfig::class, OIDCProperties::class)
    @WebMvcTest(
        value = [PortController::class, VersionController::class],
        properties = [
            "monitorfish.oidc.enabled=true",
            "spring.security.oauth2.resourceserver.jwt.public-key-location=classpath:bad-oidc-issuer.pub",
        ],
    )
    inner class SecurityConfigWithBadPublicKey {
        @Autowired
        private lateinit var mockMvc: MockMvc

        @MockBean
        private lateinit var getActivePorts: GetActivePorts

        @MockBean
        private lateinit var buildProperties: BuildProperties

        @Test
        fun `Should return 401 When the path is protected and contains an invalid public key (not validating the JWT)`() {
            // Given
            val jwtSignedByAnotherPrivateKey = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpc3N1ZXIuZ291di5mciIsInN1YiI6ImFsbWEiLCJhdWQiOiJzaGVuaXF1YSIsImlhdCI6MTY4NDI0MDAxOCwiZXhwIjo5MzU0MjQwNjE4fQ.l7x_Yp_0oFsLpu__PEOOc-F5MlzXrhfFDYDG25kj7dsq5_KkRm06kprIJMTtnA7JiYm44D7sFS6n6LzlkJLqjyxE17AnUUBEu1UXe373okUD9tMoLZt31e9tYyO8pQVy0roEGLepDGpJ-lvkC3hTvu-uwAxvXXK-OFx7f-GlMDpfkGNMhXYczfDmPmrCjStHAYGW8gfbE7elSXw51cbVuHOKsnqBm3SFJz3d_laO4c3SV5XFpcrlEdvP9ImQWnJU3pjiaViMB3Lj1UquCWxohT154WiVnodC549T50LkHXV4Q7ho04GK2Ivltl_CnR4rgS7HOkOZV3RICOIQm3sbXA"
            given(getActivePorts.execute()).willReturn(
                listOf(
                    Port("ET", "Etel"),
                    Port("AY", "Auray"),
                ),
            )

            // When
            mockMvc.perform(
                get("/bff/v1/ports")
                    .header("Authorization", "Bearer $jwtSignedByAnotherPrivateKey"),
            )
                // Then
                .andExpect(status().isUnauthorized)
        }
    }

    /**
     * The public-key-location is set to an inner class in order to override the application.properties
     * only for this test case using the public key `oidc-issuer.pub`
     */
    @Nested
    @Import(SecurityConfig::class, OIDCProperties::class)
    @WebMvcTest(
        value = [PortController::class, VersionController::class, SpaController::class],
        properties = [
            "monitorfish.oidc.enabled=true",
            "spring.security.oauth2.resourceserver.jwt.public-key-location=classpath:oidc-issuer.pub",
        ],
    )
    inner class SecurityConfigWithGoodPublicKey {
        @Autowired
        private lateinit var mockMvc: MockMvc

        @MockBean
        private lateinit var getActivePorts: GetActivePorts

        @MockBean
        private lateinit var buildProperties: BuildProperties

        @Test
        fun `Should return 401 When the path is protected`() {
            // Given
            given(getActivePorts.execute()).willReturn(
                listOf(
                    Port("ET", "Etel"),
                    Port("AY", "Auray"),
                ),
            )

            // When
            mockMvc.perform(get("/bff/v1/ports"))
                // Then
                .andExpect(status().isUnauthorized)
        }

        @Test
        fun `Should return 200 When the path is not protected`() {
            // Given
            `when`(buildProperties.version).thenReturn("DUMMY VERSION")
            `when`(buildProperties.get("commit.hash")).thenReturn("DUMMY HASH")

            // When
            mockMvc.perform(get("/version"))
                // Then
                .andExpect(status().isOk)
        }

        @Test
        fun `Should return 200 When the root path is not protected (and redirected to error)`() {
            // When
            mockMvc.perform(get("/"))
                // Then
                .andExpect(status().isOk)
        }

        @Test
        fun `Should return Ok When the path is protected and contains a valid public key (validating the JWT)`() {
            // Given
            /**
             * JWT build with https://dinochiesa.github.io/jwt/
             *
             * Private key is :
             * -----BEGIN PRIVATE KEY-----
             * MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC6qSbhNK/ppevW
             * UPeb0oX0xZvwK8UbiRJkc7qjZP8XE3XVTeqlShkU7wx4qyOVBD8DEZBeDavuRa2K
             * MBnCA12+0S1gOI7xDUMNpz0Wix9M4MWmHz7WbDIxZc2pTtxU5skguF7GlOa2gSiz
             * aoOn02Lb2CqZ5fzpIa6zqOXLrNkOFpE1E375w3HPu76D9yQaHc+0pcleMyPbVNW4
             * WbhJn8iMwhfi1cXZftE64bPIWOXM2fwanH6rvl3zU3dS4JPvKeW6WIXxqWGjSnP7
             * qZ/QrFtLzd/SPZ+6iqc/psp8/BTm4Gzgw/DXYlLlVlQiV9C7AAIj1/cSPFe0r3iZ
             * nN1bei5XAgMBAAECggEAe12kVp9tzCxe7CxjGddPtXCNGXS0Nvim8UETjz4G4gd4
             * j1uJw2hvn0hGo9HoGGrQAoUvNxouEbJ3eadEvtdes+in5ro6rtInCPUJCMc2DqdX
             * ue1YqHqlycQQ4t89+9b0Au4XpYNv4BsI/VteXCL3aXk63rAEMUiToCX2imBYrFfX
             * kBUUTF2ezpb7mbSfEl0NrzInVh90OGTUgaTNBTLIY2eBQYF0xRa5NhvufJYNyAGs
             * XIGXnxyd1tbrkmuElNng8PdiFMmQ68g0olLEsqEyyDdrajF8l4gVe7ZZnVly6RIw
             * w5Hn2bKByj6kTdndycD54iejeqY9MH9smSz1klSQUQKBgQDxSOgUxdbhn4i/xPbe
             * 9CVuM6V9rbJU9Xq9Hl4+P6OSlWOmmYDC/5a/JBePx9b7xT0RxWfdHfpDVMLIgy4x
             * 19ddgBmpARDUMFD8M0RQ7NUcM10LRW/Zl3nDRFjgKUUMTmI/OJfK4U9k8im5UMvn
             * lFLbQ/l+xZmFKnpYHaVtCf0QywKBgQDGC2tr5X6Wtkg8Vugy2x7/qbBWa8Xu8c7o
             * jz3PcXnqBHeCnxMuJaT8lRMkOThE8SsyzeIKFGbkeOBdDT2Ty3ds9s6Jdhm6/HQz
             * B91IJNrkBVBQVpbEjw42jNdetAL3y6Jl14isCJI3pbL3iXCDOUoVxm8M8UOVlpSD
             * XEow1XEjJQKBgEhZJxXLeLIwhu2RnsCdjnerzsyPf7CP5ty8NWAO7vouBzJWRtCx
             * mL75kIMRVfoqWzRv78PSkE8OJFXBV+GkKbSki40sf6JQVog4yxxE12XcVOLjUDV7
             * gQw2+ztDxKt6+WShkIpJ4ueO4Unq2yk2RV3v1OjZUT4nzYWMZiT64MHfAoGAV3if
             * v44jdUmZah0wfZXOgTlfiywaxkjDDHCH6mHCaRwD9Qtxm0ZBMtZdF/i1461pWQ0a
             * Mz2DnJHO9wpsEiUh4Fy6KHijMLVkVU257K1qiJ/YM0OrX7GXo3xde5SiYvPsDHNA
             * CEvY2P80pqRrr2nUUP3N+rdtFFrnyYUvt5XuXIkCgYAO22DMOR7/fYVe7VkJms1v
             * z21ORJZ4Y7aCfdoTPqSMAcYWIIfZT3UQajH37zTXu8ve6V0ExfWFSP2D8t0ryw1/
             * zhyOSeuclvxvo6UK9MeKKXNHyc3FL5EdIi08dU4QFUaVZk2dnj1vAnrPVYOthKAO
             * HZ08y3VoJp3zooC+2HFO6w==
             * -----END PRIVATE KEY-----
             */
            val jwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpc3N1ZXIuZ291di5mciIsInN1YiI6ImFsbWEiLCJhdWQiOiJzaGVuaXF1YSIsImlhdCI6MTY4NDI0MDAxOCwiZXhwIjo5MzU0MjQwNjE4fQ.l7x_Yp_0oFsLpu__PEOOc-F5MlzXrhfFDYDG25kj7dsq5_KkRm06kprIJMTtnA7JiYm44D7sFS6n6LzlkJLqjyxE17AnUUBEu1UXe373okUD9tMoLZt31e9tYyO8pQVy0roEGLepDGpJ-lvkC3hTvu-uwAxvXXK-OFx7f-GlMDpfkGNMhXYczfDmPmrCjStHAYGW8gfbE7elSXw51cbVuHOKsnqBm3SFJz3d_laO4c3SV5XFpcrlEdvP9ImQWnJU3pjiaViMB3Lj1UquCWxohT154WiVnodC549T50LkHXV4Q7ho04GK2Ivltl_CnR4rgS7HOkOZV3RICOIQm3sbXA"
            given(getActivePorts.execute()).willReturn(
                listOf(
                    Port("ET", "Etel"),
                    Port("AY", "Auray"),
                ),
            )

            // When
            mockMvc.perform(
                get("/bff/v1/ports")
                    .header("Authorization", "Bearer $jwt"),
            )
                // Then
                .andExpect(status().isOk)
        }
    }
}
