package fr.gouv.cnsp.monitorfish.infrastructure.api.bff.utils

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Configuration
import org.springframework.security.oauth2.jwt.JwtDecoder

@Configuration
class JwtDecoderTestConfig {
    @Autowired
    private lateinit var jwtDecoder: JwtDecoder
}
