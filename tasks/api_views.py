from rest_framework import generics, permissions
from .models import Task
from .serializers import TaskSerializer
from .filters import TaskFilter
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend


class TaskListCreateView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = TaskFilter  # Apply the filter
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ['title', 'status', 'created_at', 'due_date']

    def perform_create(self, serializer):
        # Assign the currently logged in user as the owner of the task
        serializer.save(user=self.request.user)

    def get_queryset(self, **kwargs):
        print(**kwargs)
        # Make sure users can retrive their own tasks
        return Task.objects.filter(user=self.request.user).order_by("-created_at")
    
class TaskRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]  # Authenticated users can edit

    def get_queryset(self):
        # Make sure users can only modify their own tasks
        return Task.objects.filter(user=self.request.user)
