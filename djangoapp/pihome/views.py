from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponseForbidden
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import user_passes_test, login_required 
from django.contrib.auth.views import LoginView
from django.urls import reverse
from pihome.models import Action, MQTTButton
from django.utils import timezone
import os
import paho.mqtt.client as mqtt
import json
from django import forms
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import MQTTButton
from .serializers import MQTTButtonSerializer

def block_signup_if_users_exist(view_func):
    """Decorator to block access to signup if users already exist."""
    def _wrapped_view(request, *args, **kwargs):
        if User.objects.exists():
            # Retorna uma página de acesso negado
            return HttpResponseForbidden("Access denied: User creation is not allowed as a user already exists.")
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def logout_view(request):
    logout(request)
    return redirect('pihome:index')

@login_required
def index(request):
    buttons = MQTTButton.objects.all()
    users = User.objects.all()  # Query all users
    return render(request, 'pihome/index.html', {'buttons': buttons, 'users': users})

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

@csrf_exempt
def save_mqtt_button(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')
            ip = data.get('ip')
            port = data.get('port')
            topic = data.get('topic')
            message = data.get('message')  # Capture the message field

            if name and ip and port and topic and message:
                MQTTButton.objects.create(name=name, ip=ip, port=port, topic=topic, message=message)
                return JsonResponse({'status': 'success'})
            else:
                return JsonResponse({'status': 'error', 'message': 'Missing required fields.'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)

@csrf_exempt
def update_mqtt_button(request, button_id):  # Ensure the parameter name matches the URL pattern
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')
            ip = data.get('ip')
            port = data.get('port')
            topic = data.get('topic')
            message = data.get('message')  # Capture the message field

            button = MQTTButton.objects.get(id=button_id)  # Use the correct parameter name
            button.name = name
            button.ip = ip
            button.port = port
            button.topic = topic
            button.message = message
            button.save()

            return JsonResponse({'status': 'success'})
        except MQTTButton.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Button not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)

def delete_mqtt_button(request, id):
    if request.method == 'POST':
        try:
            button = MQTTButton.objects.get(id=id)
            button.delete()
            return JsonResponse({'status': 'success'})
        except MQTTButton.DoesNotExist:
            return JsonResponse({'status': 'failed', 'error': 'Button not found'}, status=404)
    return JsonResponse({'status': 'failed'}, status=400)

def signup_or_login_redirect(request):
    # Verifica se há usuários no banco de dados
    if not User.objects.exists():
        return redirect('account_signup')  # Redireciona para a tela de criação de usuário
    if request.user.is_authenticated:
        return redirect('pihome:index')  # Redireciona para a página inicial se o usuário já estiver autenticado
    return redirect('account_login')  # Redireciona para a tela de login

@block_signup_if_users_exist
def create_user(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            if not User.objects.exists():  # Primeiro usuário se torna superuser
                user.is_superuser = True
                user.is_staff = True
            user.save()
            login(request, user)  # Loga automaticamente o primeiro usuário
            return redirect('index')  # Redireciona para a página inicial
    else:
        form = UserCreationForm()
    return render(request, 'pihome/create_user.html', {'form': form})

@user_passes_test(lambda u: not User.objects.exists(), login_url='account_login')
def signup_redirect(request):
    # Redireciona para a tela de criação de usuário se não houver usuários
    return redirect('account_signup')

def password_reset_form_view(request):
    # Verifica se há usuários no banco de dados
    allow_user_creation = not User.objects.exists()  # False se já houver usuários
    return render(request, 'registration/password_reset_form.html', {
        'allow_user_creation': allow_user_creation,  # Passa a variável ao template
    })

def project_info(request):
    return render(request, 'pihome/project_info.html')

def license_view(request):
    return render(request, 'pihome/license.html')

def group_view(request):
    return render(request, 'pihome/group.html')

def integrator_project_view(request):
    return render(request, 'pihome/integrator_project.html')
@login_required
@api_view(['GET', 'POST'])
def pi_db_list(request):
    """
    Handle GET and POST requests for MQTTButton objects.
    """
    if request.method == 'GET':
        # Retrieve all MQTTButton objects
        buttons = MQTTButton.objects.all()
        serializer = MQTTButtonSerializer(buttons, many=True)
        return Response({"devices": serializer.data})

    elif request.method == 'POST':
        # Update an existing MQTTButton object
        serializer = MQTTButtonSerializer(data=request.data)
        if serializer.is_valid():
            try:
                button = MQTTButton.objects.get(id=request.data.get('id'))
                for attr, value in serializer.validated_data.items():
                    setattr(button, attr, value)
                button.save()
                return Response({"status": "success", "message": "Device updated successfully."})
            except MQTTButton.DoesNotExist:
                return Response({"status": "error", "message": "Device not found."}, status=404)
        return Response(serializer.errors, status=400)
@login_required
class PiDBList(APIView):
    """
    API view to retrieve and update MQTTButton objects.
    """

    def get(self, request):
        """
        Handle GET requests to retrieve all MQTTButton objects.
        """
        filter_param = request.GET.get('filter', None)
        buttons = MQTTButton.objects.all()
        serializer = MQTTButtonSerializer(buttons, many=True)
        return Response({"filter": filter_param, "devices": serializer.data})

    def post(self, request):
        """
        Handle POST requests to update an MQTTButton object.
        """
        serializer = MQTTButtonSerializer(data=request.data)
        if serializer.is_valid():
            try:
                button = MQTTButton.objects.get(id=request.data.get('id'))
                for attr, value in serializer.validated_data.items():
                    setattr(button, attr, value)
                button.save()
                return Response({"status": "success", "message": "Device updated successfully."}, status=status.HTTP_200_OK)
            except MQTTButton.DoesNotExist:
                return Response({"status": "error", "message": "Device not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

