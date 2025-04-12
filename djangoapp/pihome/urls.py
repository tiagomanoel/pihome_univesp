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
    logout_view,
    signup_or_login_redirect,
    project_info,
    license_view,
    group_view,
    integrator_project_view,
    pi_db_list,
    PiDBList,
)
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views


app_name = 'pihome'

urlpatterns = [
    path('', signup_or_login_redirect, name='signup_or_login_redirect'),
    path('index/', index, name='index'),
    path('logout/', logout_view, name='logout'),
    path('teste/', teste, name='teste'),
    path('light-room/', lightRoom, name='lightRoom'),
    path('execute-mqtt-action/', execute_mqtt_action, name='execute_mqtt_action'),
    path('test-mqtt-connection/', test_mqtt_connection, name='test_mqtt_connection'),
    path('accounts/', include('allauth.urls')),
    path('accounts/signup/', create_user, name='account_signup'),
    path('save-mqtt-button/', save_mqtt_button, name='save_mqtt_button'),
    path('update-mqtt-button/<int:button_id>/', update_mqtt_button, name='update_mqtt_button'),
    path('delete-mqtt-button/<int:id>/', delete_mqtt_button, name='delete_mqtt_button'),
    path('create-user/', create_user, name='create_user'),
    path('project-info/', project_info, name='project_info'),
    path('license/', license_view, name='license'),
    path('group/', group_view, name='group'),
    path('integrator-project/', integrator_project_view, name='integrator_project'),
    path('api/devices/', pi_db_list, name='pi_db_list'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

