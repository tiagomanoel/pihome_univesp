from django.db import models
from django.core.exceptions import ValidationError

class Action(models.Model):
    id = models.AutoField(primary_key=True)
    action = models.TextField(null=True, blank=True)  # Permitir valores nulos
    date = models.DateField()
    time = models.TimeField()
    topic = models.TextField(null=True, blank=True)  # Permitir valores nulos

    def clean(self):
        if self.action not in ["ON", "OFF"]:
            raise ValidationError("Action must be 'ON' or 'OFF'")

    def __str__(self):
        return f"Action on {self.date} at {self.time} with action: {self.action} on topic: {self.topic}"

class MQTTButton(models.Model):
    name = models.CharField(max_length=255)
    ip = models.CharField(max_length=255)
    port = models.IntegerField()
    topic = models.CharField(max_length=255)
    create_button = models.BooleanField(default=False)

    def __str__(self):
        return f"Button {self.name} for topic {self.topic}"
