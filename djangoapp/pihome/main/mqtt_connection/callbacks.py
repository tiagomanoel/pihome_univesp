def on_connect(client, userdata, flags, rc, properties=None):
    print(f"Connected with result code {rc}")
    client.subscribe(client._userdata['topic'])

def on_message(client, userdata, msg):
    print(f"Message received: {msg.topic} {msg.payload}")

def on_subscribe(client, userdata, mid, granted_qos, properties=None):
    print(f"Subscribed: {mid} {granted_qos} to topic {client._userdata['topic']}")

def on_disconnect(client, userdata, rc):
    print(f"Disconnected with result code {rc}")

