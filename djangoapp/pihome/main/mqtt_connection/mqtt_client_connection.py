import paho.mqtt.client as mqtt
from .callbacks import on_connect, on_message, on_subscribe, on_disconnect

class MqttClientConnection:
    def __init__(self, broker_ip: str, port: int, client_name: str, topic: str, keepalive=60):
        self.__broker_ip = broker_ip
        self.__port = port
        self.__client_name = client_name
        self.__keepalive = keepalive
        self.__topic = topic
        self.client = mqtt.Client(client_id=self.__client_name, protocol=mqtt.MQTTv5, userdata={'topic': self.__topic})

    def start_connection(self):
        self.client.on_connect = on_connect
        self.client.on_message = on_message
        self.client.on_subscribe = on_subscribe
        self.client.on_disconnect = on_disconnect
        self.client.connect(self.__broker_ip, self.__port, self.__keepalive)
        self.client.loop_start()

    def stop_connection(self):
        self.client.loop_stop()
        self.client.disconnect()

