from django.urls import path
from .views import (
    StudyAvailabilityListCreateView,
    StudyAvailabilityDetailView,
    generate_schedule_view,
    list_schedules_view,
)

urlpatterns = [
    # Study availability
    path(
        "availability/",
        StudyAvailabilityListCreateView.as_view(),
        name="availability-list-create",
    ),
    path(
        "availability/<int:pk>/",
        StudyAvailabilityDetailView.as_view(),
        name="availability-detail",
    ),
    # Schedules
    path("generate/", generate_schedule_view, name="generate-schedule"),
    path("", list_schedules_view, name="list-schedules"),
]