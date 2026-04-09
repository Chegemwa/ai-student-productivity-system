from django.utils import timezone
from tasks.models import Task


def get_difficulty_score(difficulty):
    difficulty_map = {
        "easy": 1,
        "medium": 2,
        "hard": 3,
    }
    return difficulty_map.get(difficulty, 1)


def get_deadline_proximity_score(due_date):
    current_time = timezone.now()
    time_difference = due_date - current_time
    hours_left = time_difference.total_seconds() / 3600

    if hours_left <= 24:
        return 5
    elif hours_left <= 72:
        return 4
    elif hours_left <= 168:
        return 3
    elif hours_left <= 336:
        return 2
    else:
        return 1


def calculate_priority_score(task):
    deadline_score = get_deadline_proximity_score(task.due_date)
    difficulty_score = get_difficulty_score(task.difficulty)

    urgency_weight = 0.7
    difficulty_weight = 0.3

    priority_score = (urgency_weight * deadline_score) + (
        difficulty_weight * difficulty_score
    )

    return round(priority_score, 2)


def prioritize_tasks_for_user(user):
    tasks = Task.objects.filter(user=user, status="pending")

    scored_tasks = []

    for task in tasks:
        task.priority_score = calculate_priority_score(task)
        scored_tasks.append(task)

    scored_tasks.sort(key=lambda x: x.priority_score, reverse=True)

    return scored_tasks