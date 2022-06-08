import mqtt from 'mqtt';

// MQTT
const mqtt_host = 'broker.emqx.io';
const mqtt_port = '1883';
const mqtt_clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
const mqtt_connectUrl = `mqtt://${mqtt_host}:${mqtt_port}`;
const mqtt_topic = 'nmlab-securitycam-mqtt-channel';
const mqtt_publisher = mqtt.connect(mqtt_connectUrl, {
  mqtt_clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'emqx',
  password: 'public',
  reconnectPeriod: 1000,
});

function publish(mqtt_client, topic, msg_json) {
  const msg_string = JSON.stringify(msg_json);
  mqtt_client.publish(topic, msg_string, { qos: 0, retain: false }, error => {
    if (error) {
      console.error(error);
    }
  });
}

export { publish, mqtt_publisher, mqtt_topic };
