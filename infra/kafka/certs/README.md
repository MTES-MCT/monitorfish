## Create .p12 certificate for Kafka client (AIS)

### Truststore

Add Root CA:
```
keytool -importcert \
  -storetype PKCS12 \
  -keystore truststore.p12 \
  -alias monitorfish-root \
  -file ca-root.crt
```

Then intermediate CA:
```
keytool -importcert \
  -storetype PKCS12 \
  -keystore truststore.p12 \
  -alias monitorfish-intermediate \
  -file ca-1.crt
```

Verify:
```
keytool -list -v \
  -storetype PKCS12 \
  -keystore ais.diffusion.dev.monitorfish.truststore.p12
```

### Keystore

```
openssl pkcs12 -export   -in client-fullchain.crt   -inkey ais.dev.diffusion.monitorfish.key   -out ais.diffusion.dev.monitorfish.keystore.p12   -name monitorfish   -password 'pass:changeit'
```

### Set rights for monitorfish user/group in INT/PROD machine

```
sudo chown 1000:1004 /home/mf/monitorfish/infra/kafka/certs/monitorfish/*.p12
chmod 640 /home/mf/monitorfish/infra/kafka/certs/monitorfish/*.p12
```

