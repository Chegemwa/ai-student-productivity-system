from django.urls import path
from .views import (
    TaskListCreateAPIView,
    TaskRetrieveUpdateDestroyAPIView,
    share_task_view,
    join_task_group_view,
    list_shared_tasks_view,
    leave_task_group_view,
)

urlpatterns = [
    path("", TaskListCreateAPIView.as_view(), name="task-list-create"),
    path("<int:pk>/", TaskRetrieveUpdateDestroyAPIView.as_view(), name="task-detail"),
    path("share/", share_task_view, name="task-share"),
    path("share/join/", join_task_group_view, name="task-join"),
    path("shared/", list_shared_tasks_view, name="task-shared-list"),
    path("shared/<int:group_id>/leave/", leave_task_group_view, name="task-leave"),
]