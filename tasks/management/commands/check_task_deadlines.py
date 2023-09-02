# tasks/management/commands/check_task_deadlines.py

from django.core.management.base import BaseCommand
from tasks.models import Task, Notification

class Command(BaseCommand):
    help = 'Checks tasks that are near their deadlines or overdue and sends notifications.'

    def handle(self, *args, **kwargs):
        for task in Task.objects.filter(status='pending'):
            if task.is_overdue:
                Notification.objects.create(
                    user=task.user,
                    task=task,
                    message=f"Your task '{task.title}' is overdue!"
                )
            elif task.is_near_deadline:
                Notification.objects.create(
                    user=task.user,
                    task=task,
                    message=f"Reminder: Your task '{task.title}' is nearing its deadline."
                )
