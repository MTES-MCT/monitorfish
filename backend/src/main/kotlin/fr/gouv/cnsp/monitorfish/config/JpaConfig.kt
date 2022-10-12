package fr.gouv.cnsp.monitorfish.config

import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.transaction.annotation.EnableTransactionManagement

@Configuration
@EnableJpaRepositories(basePackages = ["fr.gouv.cnsp.monitorfish.infrastructure.database.repositories"])
@EnableTransactionManagement
@EnableAutoConfiguration
@ComponentScan("fr.gouv.cnsp.monitorfish")
class JpaConfig
