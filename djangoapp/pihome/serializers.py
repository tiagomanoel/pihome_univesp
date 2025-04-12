from rest_framework import serializers
from .models import Action, MQTTButton

class ActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Action
        fields = ['id', 'action', 'date', 'time', 'topic']

class MQTTButtonSerializer(serializers.ModelSerializer):
    class Meta:
        model = MQTTButton
        fields = ['id', 'name', 'ip', 'port', 'topic', 'message']
