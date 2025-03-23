from django.contrib import admin
from .models import Action, MQTTButton

admin.site.register(Action)
admin.site.register(MQTTButton)
