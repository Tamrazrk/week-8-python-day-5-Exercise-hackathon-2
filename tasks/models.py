from django.db import models
from django.contrib.auth.models import User
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

class Task(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    due_date = models.DateTimeField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_overdue(self):
        if self.due_date and timezone.now() > self.due_date:
            return True
        return False

    @property
    def is_near_deadline(self):
        if self.due_date and (timezone.now() + timedelta(days=1)) > self.due_date and not self.is_overdue:
            return True
        return False

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message}"