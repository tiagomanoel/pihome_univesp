from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from pihome.models import Action, MQTTButton
from django.utils import timezone
import os
import paho.mqtt.client as mqtt
import json

def logout_view(request):
    logout(request)
    return redirect('pihome:index')

@login_required
def index(request):
    buttons = MQTTButton.objects.all()
    return render(request, 'pihome/index.html', {'buttons': buttons})

def lightRoom(request):
    if request.method == 'POST':
        mqtt_client = mqtt.Client(client_id='djangoapp', protocol=mqtt.MQTTv5)
        mqtt_client.connect('localhost', 1883, 60)
        mqtt_client.publish('cmnd/messages/POWER', 'TOGGLE')

        return JsonResponse({'message': 'Light toggled and action saved'})
    return JsonResponse({'error': 'Invalid request'}, status=400)

def teste(request):
    return render(request, 'pihome/teste.html')

def execute_mqtt_action(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            ip = data.get('ip')
            port = int(data.get('port'))
            topic = data.get('topic')
            message = data.get('message', 'TOGGLE')

            if not ip or not port or not topic:
                return JsonResponse({'error': 'Missing required parameters'}, status=400)

            mqtt_client = mqtt.Client(client_id='web_client', protocol=mqtt.MQTTv5)
            mqtt_client.connect(ip, port, 60)
            mqtt_client.publish(topic, message)

            return JsonResponse({'message': f'Message "{message}" sent to topic "{topic}" on broker "{ip}:{port}"'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request'}, status=400)

def test_mqtt_connection(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            ip = data.get('ip')
            port = int(data.get('port'))

            mqtt_client = mqtt.Client(client_id='test_client', protocol=mqtt.MQTTv5)
            mqtt_client.connect(ip, port, 60)
            mqtt_client.disconnect()

            return JsonResponse({'message': 'Connection successful'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request'}, status=400)

def save_mqtt_button(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        ip = data.get('ip')
        port = data.get('port')
        topic = data.get('topic')
        create_button = data.get('create_button', False)

        button = MQTTButton(name=name, ip=ip, port=port, topic=topic, create_button=create_button)
        button.save()

        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'failed'}, status=400)

def update_mqtt_button(request, id):
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            button = MQTTButton.objects.get(id=id)
            button.name = data.get('name')
            button.ip = data.get('ip')
            button.port = data.get('port')
            button.topic = data.get('topic')
            button.create_button = data.get('create_button', False)
            button.save()
            return JsonResponse({'status': 'success'})
        except MQTTButton.DoesNotExist:
            return JsonResponse({'status': 'failed', 'error': 'Button not found'}, status=404)
    return JsonResponse({'status': 'failed'}, status=400)

def delete_mqtt_button(request, id):
    if request.method == 'POST':
        try:
            button = MQTTButton.objects.get(id=id)
            button.delete()
            return JsonResponse({'status': 'success'})
        except MQTTButton.DoesNotExist:
            return JsonResponse({'status': 'failed', 'error': 'Button not found'}, status=404)
    return JsonResponse({'status': 'failed'}, status=400)

def create_user(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('pihome:index')
    else:
        form = UserCreationForm()

    return render(request, 'pihome/create_user.html', {'form': form})

