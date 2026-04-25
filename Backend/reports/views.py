from datetime import date, timedelta
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from tasks.models import Task
from schedules.models import Schedule, ScheduleItem


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def weekly_report_view(request):
    user = request.user

    # Allow ?week=1 to go back N weeks (default = current week)
    week_offset = int(request.query_params.get("week", 0))

    today = date.today()
    week_start = today - timedelta(days=today.weekday()) - timedelta(weeks=week_offset)
    week_end = week_start + timedelta(days=6)

    week_start_dt = timezone.make_aware(
        timezone.datetime.combine(week_start, timezone.datetime.min.time())
    )
    week_end_dt = timezone.make_aware(
        timezone.datetime.combine(week_end, timezone.datetime.max.time())
    )

    # ── Tasks due this week ──────────────────────────────────────────
    tasks_this_week = Task.objects.filter(
        user=user,
        due_date__gte=week_start_dt,
        due_date__lte=week_end_dt,
    )

    total_tasks = tasks_this_week.count()
    completed_tasks = tasks_this_week.filter(status="completed").count()
    pending_tasks = tasks_this_week.filter(status="pending").count()
    completion_rate = round((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0

    # ── Overdue tasks (pending and past due) ─────────────────────────
    now = timezone.now()
    overdue_tasks = Task.objects.filter(
        user=user,
        status="pending",
        due_date__lt=now,
    ).values("id", "title", "course", "due_date", "difficulty")

    # ── Schedule sessions this week ──────────────────────────────────
    schedules_this_week = Schedule.objects.filter(
        user=user,
        period_start__lte=week_end,
        period_end__gte=week_start,
    )

    all_items = ScheduleItem.objects.filter(
        schedule__in=schedules_this_week,
        study_date__gte=week_start,
        study_date__lte=week_end,
    )

    total_scheduled_minutes = sum(i.allocated_minutes for i in all_items)
    completed_sessions = sum(
        1 for i in all_items if i.end_datetime < now
    )
    missed_sessions = sum(
        1 for i in all_items
        if i.end_datetime < now and i.task.status == "pending"
    )

    # ── Breakdown by course ──────────────────────────────────────────
    course_map = {}
    for task in tasks_this_week:
        course = task.course or "Uncategorised"
        if course not in course_map:
            course_map[course] = {"course": course, "total": 0, "completed": 0}
        course_map[course]["total"] += 1
        if task.status == "completed":
            course_map[course]["completed"] += 1

    # ── All tasks due this week (for task list) ──────────────────────
    task_list = [
        {
            "id": t.id,
            "title": t.title,
            "course": t.course,
            "due_date": t.due_date,
            "status": t.status,
            "difficulty": t.difficulty,
            "priority_score": t.priority_score,
        }
        for t in tasks_this_week.order_by("due_date")
    ]

    return Response({
        "week_start": week_start,
        "week_end": week_end,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "completion_rate": completion_rate,
        "total_scheduled_minutes": total_scheduled_minutes,
        "completed_sessions": completed_sessions,
        "missed_sessions": missed_sessions,
        "tasks_by_course": list(course_map.values()),
        "overdue_tasks": list(overdue_tasks),
        "task_list": task_list,
    })