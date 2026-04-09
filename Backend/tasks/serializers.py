from rest_framework import serializers
from .models import Task


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