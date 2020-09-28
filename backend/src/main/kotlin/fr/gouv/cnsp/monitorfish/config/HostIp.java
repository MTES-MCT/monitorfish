package fr.gouv.cnsp.monitorfish.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "host")
public class HostIp {
    private String ip;

    public void setIp(String ip) {
        this.ip = ip;
    }

    public String getIp() {
        return ip;
    }
}
