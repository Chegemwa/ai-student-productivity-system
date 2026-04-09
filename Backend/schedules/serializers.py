from rest_framework import serializers
from .models import Schedule, ScheduleItem, StudyAvailability


class StudyAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyAvailability
        fields = [
            "id",
            "day_of_week",
            "start_time",
            "end_time",
            "created_at",
        ]
        read_only_fields = ["created_at"]
        # NOTE: 'user' is intentionally excluded — it is set from
        # request.user in the view, never from user-supplied data.


class ScheduleItemSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source="task.title", read_only=True)
    task_due_date = serializers.DateTimeField(source="task.due_date", read_only=True)

    class Meta:
        model = ScheduleItem
        fields = [
            "id",
            "schedule",
            "task",
            "task_title",
            "task_due_date",
            "study_date",
            "start_datetime",
            "end_datetime",
            "allocated_minutes",
        ]


class ScheduleSerializer(serializers.ModelSerializer):
    items = ScheduleItemSerializer(
        many=True, read_only=True, source="scheduleitem_set"
    )

    class Meta:
        model = Schedule
        fields = [
            "id",
            "user",
            "title",
            "period_start",
            "period_end",
            "generated_at",
            "total_allocated_minutes",
            "items",
        ]