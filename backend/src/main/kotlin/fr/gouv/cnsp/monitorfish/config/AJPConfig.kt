package fr.gouv.cnsp.monitorfish.config

import org.apache.catalina.connector.Connector
import org.apache.coyote.ajp.AbstractAjpProtocol
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory
import org.springframework.boot.web.server.WebServerFactoryCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.net.InetAddress

@Configuration
class AJPConfig {
    @Autowired
    private val AJPProperties: AJPProperties? = null

    @Bean
    fun servletContainer(): WebServerFactoryCustomizer<TomcatServletWebServerFactory?>? {
        return WebServerFactoryCustomizer { server: TomcatServletWebServerFactory? ->
            if (server is TomcatServletWebServerFactory) {
                server.addAdditionalTomcatConnectors(redirectConnector())
            }
        }
    }

    private fun redirectConnector(): Connector? {
        val connector = Connector("AJP/1.3")
        connector.scheme = "http"
        connector.port = AJPProperties?.port?.toInt() ?: 8000
        connector.secure = false
        connector.allowTrace = false
        (connector.protocolHandler as AbstractAjpProtocol<*>).secretRequired = false
        (connector.protocolHandler as AbstractAjpProtocol<*>).address = InetAddress.getByName( "0.0.0.0" )

        return connector
    }
}