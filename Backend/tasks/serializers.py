from rest_framework import serializers
from .models import Task, TaskGroup
from django.contrib.auth.models import User


class TaskSerializer(serializers.ModelSerializer):
    priority_score = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "course",
            "due_date",
            "difficulty",
            "estimated_minutes",
            "status",
            "priority_score",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "priority_score",
            "created_at",
            "updated_at",
        ]

    def get_priority_score(self, obj):
        try:
            from services.prioritizer import calculate_priority_score
            return calculate_priority_score(obj)
        except Exception:
            return 0.0


class TaskGroupMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class TaskGroupSerializer(serializers.ModelSerializer):
    members = TaskGroupMemberSerializer(many=True, read_only=True)
    created_by_username = serializers.CharField(
        source="created_by.username", read_only=True
    )
    task_title = serializers.CharField(source="task.title", read_only=True)
    task_course = serializers.CharField(source="task.course", read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = TaskGroup
        fields = [
            "id",
            "task",
            "task_title",
            "task_course",
            "course",
            "invite_code",
            "created_by_username",
            "members",
            "member_count",
            "created_at",
        ]
        read_only_fields = [
            "invite_code",
            "created_by_username",
            "members",
            "member_count",
            "created_at",
        ]

    def get_member_count(self, obj):
        return obj.members.count()