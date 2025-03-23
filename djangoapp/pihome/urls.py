from django.urls import path, include
from pihome.views import (
    index, 
    lightRoom, 
    teste, 
    execute_mqtt_action, 
    test_mqtt_connection, 
    save_mqtt_button, 
    update_mqtt_button, 
    delete_mqtt_button, 
    create_user, 
    logout_view
)
from django.conf import settings
from django.conf.urls.static import static

app_name = 'pihome'

urlpatterns = [
    path('', index, name='index'),
    path('teste/', teste, name='teste'),
    path('light-room/', lightRoom, name='lightRoom'),
    path('execute-mqtt-action/', execute_mqtt_action, name='execute_mqtt_action'),
    path('test-mqtt-connection/', test_mqtt_connection, name='test_mqtt_connection'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('save-mqtt-button/', save_mqtt_button, name='save_mqtt_button'),
    path('update-mqtt-button/<int:id>/', update_mqtt_button, name='update_mqtt_button'),
    path('delete-mqtt-button/<int:id>/', delete_mqtt_button, name='delete_mqtt_button'),
    path('create-user/', create_user, name='create_user'),
    path('logout/', logout_view, name='logout'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

