#!/bin/bash

~/kafka/kafka_2.12-2.4.0/bin/zookeeper-server-start.sh \
      ~/kafka/kafka_2.12-2.4.0/config/zookeeper.properties &
~/kafka/kafka_2.12-2.4.0/bin/kafka-server-start.sh \
      ~/kafka/kafka_2.12-2.4.0/config/server.properties &