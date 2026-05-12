#!/bin/bash
set -e

CERTS_DIR="$(cd "$(dirname "$0")/.." && pwd)/certs"

rm -rf "$CERTS_DIR"
mkdir -p "$CERTS_DIR/kafka" "$CERTS_DIR/monitorfish"

echo "Generating Kafka SSL certificates in $CERTS_DIR..."

# 1. Create CA
openssl genrsa -out "$CERTS_DIR/kafka/ca.key" 4096
openssl req -x509 -new -key "$CERTS_DIR/kafka/ca.key" -days 3650 -out "$CERTS_DIR/kafka/ca.crt" -subj "/CN=MonitorFishKafkaCA"

# 2. Kafka broker key + CSR + signed certificate
openssl genrsa -out "$CERTS_DIR/kafka/kafka.key" 4096
openssl req -new -key "$CERTS_DIR/kafka/kafka.key" -out "$CERTS_DIR/kafka/kafka.csr" -subj "/CN=localhost"
openssl x509 -req -in "$CERTS_DIR/kafka/kafka.csr" -CA "$CERTS_DIR/kafka/ca.crt" -CAkey "$CERTS_DIR/kafka/ca.key" \
  -CAcreateserial -out "$CERTS_DIR/kafka/kafka.crt" -days 3650

# 3. Client (monitorfish) key + CSR + signed certificate
openssl genrsa -out "$CERTS_DIR/monitorfish/monitorfish.key" 4096
openssl req -new -key "$CERTS_DIR/monitorfish/monitorfish.key" -out "$CERTS_DIR/monitorfish/monitorfish.csr" -subj "/CN=monitorfish"
openssl x509 -req -in "$CERTS_DIR/monitorfish/monitorfish.csr" -CA "$CERTS_DIR/kafka/ca.crt" -CAkey "$CERTS_DIR/kafka/ca.key" \
  -CAcreateserial -out "$CERTS_DIR/monitorfish/monitorfish.crt" -days 3650

# 4. PKCS12 keystores
openssl pkcs12 -export \
  -in "$CERTS_DIR/kafka/kafka.crt" -inkey "$CERTS_DIR/kafka/kafka.key" \
  -out "$CERTS_DIR/kafka/kafka.p12" -name kafka -password pass:changeit
openssl pkcs12 -export \
  -in "$CERTS_DIR/monitorfish/monitorfish.crt" -inkey "$CERTS_DIR/monitorfish/monitorfish.key" \
  -out "$CERTS_DIR/monitorfish/monitorfish.p12" -name monitorfish -password pass:changeit

# 5. Truststores (PKCS12)
keytool -import -trustcacerts -alias CARoot -file "$CERTS_DIR/kafka/ca.crt" \
  -keystore "$CERTS_DIR/kafka/kafka-truststore.p12" -storetype PKCS12 -storepass changeit -noprompt
keytool -import -trustcacerts -alias CARoot -file "$CERTS_DIR/kafka/ca.crt" \
  -keystore "$CERTS_DIR/monitorfish/monitorfish-truststore.p12" -storetype PKCS12 -storepass changeit -noprompt

# 6. Copy client truststore and keystore next to broker certs (for docker-compose / Kafka broker config)
cp "$CERTS_DIR/monitorfish/monitorfish-truststore.p12" "$CERTS_DIR/kafka/monitorfish-truststore.p12"
cp "$CERTS_DIR/monitorfish/monitorfish.p12" "$CERTS_DIR/kafka/monitorfish.p12"

# 7. Write key password file (used by Kafka broker config)
echo "changeit" > "$CERTS_DIR/kafka/kafka.keypass"

echo "✓ Certificates generated in $CERTS_DIR"
echo ""
echo "Set these env vars for the backend:"
echo "  MONITORFISH_KAFKA_AIS_KEYSTORE=$CERTS_DIR/monitorfish/monitorfish.p12"
echo "  MONITORFISH_KAFKA_AIS_KEYSTORE_PASSWORD=changeit"
echo "  MONITORFISH_KAFKA_AIS_KEY_PASSWORD=changeit"
echo "  MONITORFISH_KAFKA_AIS_TRUSTSTORE=$CERTS_DIR/monitorfish/monitorfish-truststore.p12"
echo "  MONITORFISH_KAFKA_AIS_TRUSTSTORE_PASSWORD=changeit"
