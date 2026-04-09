from datetime import datetime, timedelta

from django.db import transaction
from django.utils import timezone

from services.prioritizer import prioritize_tasks_for_user
from schedules.models import StudyAvailability, Schedule, ScheduleItem

DAY_MAP = {
    0: "mon",
    1: "tue",
    2: "wed",
    3: "thu",
    4: "fri",
    5: "sat",
    6: "sun",
}


def normalize_day(value):
    if not value:
        return ""
    return value.strip().lower()[:3]


def combine_date_and_time(date_value, time_value):
    naive_dt = datetime.combine(date_value, time_value)
    return timezone.make_aware(naive_dt, timezone.get_current_timezone())


def get_user_availability_for_date(user, target_date):
    day_code = DAY_MAP[target_date.weekday()]
    availabilities = StudyAvailability.objects.filter(user=user)
    matching_slots = []
    for slot in availabilities:
        if normalize_day(slot.day_of_week) == day_code:
            matching_slots.append(slot)
    return matching_slots


@transaction.atomic
def generate_schedule_for_user(user, period_start, period_end):
    prioritized_tasks = list(prioritize_tasks_for_user(user))
    now = timezone.now()

    # Only schedule tasks with future due dates.
    prioritized_tasks = [t for t in prioritized_tasks if t.due_date > now]

    if not prioritized_tasks:
        return None

    # Check the user has at least one availability slot — fail fast
    # with a clear None rather than creating an empty schedule.
    if not StudyAvailability.objects.filter(user=user).exists():
        return None

    # Remove any existing schedule for this exact date range so
    # re-generating does not create duplicates.
    Schedule.objects.filter(
        user=user,
        period_start=period_start,
        period_end=period_end,
    ).delete()

    schedule = Schedule.objects.create(
        user=user,
        title=f"Study Schedule {period_start} to {period_end}",
        period_start=period_start,
        period_end=period_end,
        total_allocated_minutes=0,
    )

    remaining_minutes = {task.id: int(task.estimated_minutes) for task in prioritized_tasks}

    current_date = period_start
    total_allocated = 0

    while current_date <= period_end:
        daily_slots = get_user_availability_for_date(user, current_date)

        for slot in daily_slots:
            slot_start = combine_date_and_time(current_date, slot.start_time)
            slot_end = combine_date_and_time(current_date, slot.end_time)

            if slot_end <= slot_start:
                continue

            current_pointer = slot_start

            for task in prioritized_tasks:
                minutes_left = remaining_minutes.get(task.id, 0)
                if minutes_left <= 0:
                    continue
                if current_pointer >= task.due_date:
                    continue

                available_until = min(slot_end, task.due_date)
                available_minutes = int(
                    (available_until - current_pointer).total_seconds() // 60
                )
                if available_minutes <= 0:
                    continue

                allocated = min(minutes_left, available_minutes)
                item_end = current_pointer + timedelta(minutes=allocated)

                ScheduleItem.objects.create(
                    schedule=schedule,
                    task=task,
                    study_date=current_date,
                    start_datetime=current_pointer,
                    end_datetime=item_end,
                    allocated_minutes=allocated,
                )

                remaining_minutes[task.id] -= allocated
                total_allocated += allocated
                current_pointer = item_end

                if current_pointer >= slot_end:
                    break

        current_date += timedelta(days=1)

    # If no items were allocated (all tasks due before any slot),
    # clean up the empty schedule and signal failure.
    if total_allocated == 0:
        schedule.delete()
        return None

    schedule.total_allocated_minutes = total_allocated
    schedule.save()
    return schedule
