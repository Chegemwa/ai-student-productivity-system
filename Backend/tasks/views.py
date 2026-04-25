from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from services.prioritizer import calculate_priority_score
from .models import Task, TaskGroup
from .serializers import TaskSerializer, TaskGroupSerializer


# ── Existing views ──────────────────────────────────────────────────────

class TaskListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).order_by("due_date")

    def perform_create(self, serializer):
        task = serializer.save(user=self.request.user)
        task.priority_score = calculate_priority_score(task)
        task.save(update_fields=["priority_score"])


class TaskRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        task = serializer.save()
        task.priority_score = calculate_priority_score(task)
        task.save(update_fields=["priority_score"])


# ── New collaborative views ───────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def share_task_view(request):
    """Share one of your tasks. Creates a TaskGroup and returns the invite code."""
    task_id = request.data.get("task_id")
    if not task_id:
        return Response(
            {"error": "task_id is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        task = Task.objects.get(id=task_id, user=request.user)
    except Task.DoesNotExist:
        return Response(
            {"error": "Task not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # One group per task -- don't create duplicates
    existing = TaskGroup.objects.filter(task=task).first()
    if existing:
        existing.members.add(request.user)
        serializer = TaskGroupSerializer(existing)
        return Response(serializer.data)

    group = TaskGroup.objects.create(
        task=task,
        created_by=request.user,
        course=task.course or "",
    )
    group.members.add(request.user)

    serializer = TaskGroupSerializer(group)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def join_task_group_view(request):
    """Join a shared task using an invite code."""
    invite_code = request.data.get("invite_code", "").strip().upper()
    if not invite_code:
        return Response(
            {"error": "invite_code is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        group = TaskGroup.objects.get(invite_code=invite_code)
    except TaskGroup.DoesNotExist:
        return Response(
            {"error": "Invalid invite code. No group found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    group.members.add(request.user)

    # Copy the shared task to the joining user if they don't have it
    already_has = Task.objects.filter(
        user=request.user,
        title=group.task.title,
        course=group.task.course,
    ).exists()

    if not already_has:
        new_task = Task.objects.create(
            user=request.user,
            title=group.task.title,
            description=group.task.description,
            course=group.task.course,
            due_date=group.task.due_date,
            estimated_minutes=group.task.estimated_minutes,
            difficulty=group.task.difficulty,
        )
        new_task.priority_score = calculate_priority_score(new_task)
        new_task.save(update_fields=["priority_score"])

    serializer = TaskGroupSerializer(group)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_shared_tasks_view(request):
    """List all groups the user is a member of."""
    groups = TaskGroup.objects.filter(members=request.user).select_related(
        "task", "created_by"
    ).prefetch_related("members")
    serializer = TaskGroupSerializer(groups, many=True)
    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def leave_task_group_view(request, group_id):
    """Leave a shared task group."""
    try:
        group = TaskGroup.objects.get(id=group_id, members=request.user)
    except TaskGroup.DoesNotExist:
        return Response(
            {"error": "Group not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    group.members.remove(request.user)
    return Response({"message": "Left the group successfully."})