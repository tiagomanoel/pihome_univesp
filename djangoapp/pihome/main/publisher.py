import paho.mqtt.client as mqtt

mqtt_client = mqtt.Client(client_id='djangoapp', protocol=mqtt.MQTTv5)
mqtt_client.connect('localhost', 1883, 60)
mqtt_client.publish('cmnd/messages/POWER', 'ON')