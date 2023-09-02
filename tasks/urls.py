from django.urls import path
from .views import register, user_login, user_logout, dashboard, mark_notification_as_read

app_name = "tasks"

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', user_login, name='login'),
    path('logout/', user_logout, name='logout'),
    path('', dashboard, name='dashboard'),
    path('notifications/<int:notification_id>/read/', mark_notification_as_read, name='mark_notification_as_read'),

]
