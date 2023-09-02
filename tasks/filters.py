import django_filters
from .models import Task

class TaskFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(lookup_expr='icontains')  # Case-insensitive search on title field
    status = django_filters.ChoiceFilter(choices=Task.STATUS_CHOICES)

    class Meta:
        model = Task
        fields = ['title', 'status']
