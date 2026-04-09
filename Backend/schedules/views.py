from datetime import date, timedelta

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from services.scheduler import generate_schedule_for_user
from .models import Schedule, StudyAvailability
from .serializers import (
    ScheduleSerializer,
    StudyAvailabilitySerializer,
)


# ── Study Availability ────────────────────────────────────────────────

class StudyAvailabilityListCreateView(generics.ListCreateAPIView):
    serializer_class = StudyAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudyAvailability.objects.filter(
            user=self.request.user
        ).order_by("day_of_week", "start_time")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class StudyAvailabilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StudyAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudyAvailability.objects.filter(user=self.request.user)


# ── Schedule generation ───────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_schedule_view(request):
    user = request.user
    period_start = date.today()
    period_end = date.today() + timedelta(days=7)

    schedule = generate_schedule_for_user(user, period_start, period_end)

    if not schedule:
        return Response(
            {
                "message": (
                    "No valid tasks or availability found for scheduling. "
                    "Make sure you have pending tasks with future due dates "
                    "and at least one availability slot set."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    schedule.title = "This Week's Study Plan"
    schedule.save()

    serializer = ScheduleSerializer(schedule)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_schedules_view(request):
    user = request.user
    schedules = Schedule.objects.filter(user=user).order_by("-id")
    serializer = ScheduleSerializer(schedules, many=True)
    return Response(serializer.data)