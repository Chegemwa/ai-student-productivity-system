from rest_framework import generics, permissions
from services.prioritizer import calculate_priority_score
from .models import Task
from .serializers import TaskSerializer


class TaskListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).order_by("due_date")

    def perform_create(self, serializer):
        task = serializer.save(user=self.request.user)
        # Persist the score so the scheduler can read it directly
        task.priority_score = calculate_priority_score(task)
        task.save(update_fields=["priority_score"])


class TaskRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        task = serializer.save()
        # Recalculate after any update (due_date or difficulty may have changed)
        task.priority_score = calculate_priority_score(task)
        task.save(update_fields=["priority_score"])