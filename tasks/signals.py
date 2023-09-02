from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Task, Notification

@receiver(post_save, sender=Task)
def task_notifications(sender, instance, created, **kwargs):
    # Notification when a task is created
    if created:
        Notification.objects.create(
            user=instance.user,
            task=instance,
            message=f"A new task '{instance.title}' has been added to your list."
        )
    # Notification when a task is completed
    elif instance.status == "completed" and Task.objects.get(id=instance.id).status != "completed":
        Notification.objects.create(
            user=instance.user,
            task=instance,
            message=f"Congratulations! Your task '{instance.title}' has been marked as completed."
        )
    # Notification if the task is overdue
    elif instance.is_overdue:
        Notification.objects.create(
            user=instance.user,
            task=instance,
            message=f"Your task '{instance.title}' is overdue!"
        )
    # Notification if the task is near its deadline
    elif instance.is_near_deadline:
        Notification.objects.create(
            user=instance.user,
            task=instance,
            message=f"Reminder: Your task '{instance.title}' is nearing its deadline."
        )
