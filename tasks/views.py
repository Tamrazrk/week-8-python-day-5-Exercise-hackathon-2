from django.utils import timezone
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import login, authenticate, logout
from .forms import RegistrationForm, LoginForm, TaskForm
from .models import Task
from django.core.paginator import Paginator
from datetime import datetime, timedelta
from django.contrib.auth.decorators import login_required
from .models import Notification
from django.shortcuts import redirect


def register(request):
    if request.method == "POST":
        form = RegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}!')
            return redirect('tasks:login')
    else:
        form = RegistrationForm()
    return render(request, 'tasks/register.html', {'form': form})

def user_login(request):
    if request.method == "POST":
        form = LoginForm(request.POST)
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('tasks:dashboard')
        else:
            messages.error(request, 'Invalid credentials')
    else:
        form = LoginForm()
    return render(request, 'tasks/login.html', {'form': form})

def user_logout(request):
    logout(request)
    return redirect('tasks:login')

@login_required
def dashboard(request):
    notifications = Notification.objects.filter(user=request.user, read=False)
    print(request.user)
    return render(request, 'tasks/dashboard.html', {'notifications': notifications, "user_name":request.user})



def mark_notification_as_read(request, notification_id):
    try:
        # Fetch the notification and mark it as read
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.read = True
        notification.save()
    except Notification.DoesNotExist:
        # Handle the error as you see fit
        pass
    return redirect('tasks:dashboard')  # Redirect back to the dashboard or wherever you're displaying notifications
