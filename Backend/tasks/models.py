from django.db import models
from django.contrib.auth.models import User
import random
import string

def generate_invite_code():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=8))

class Task(models.Model):

    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard')
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    course = models.CharField(max_length=120)

    due_date = models.DateTimeField()

    estimated_minutes = models.IntegerField()

    difficulty = models.CharField(
        max_length=10,
        choices=DIFFICULTY_CHOICES
    )

    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='pending'
    )

    priority_score = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return self.title

class TaskGroup(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="groups",
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_task_groups",
    )
    members = models.ManyToManyField(
        User,
        related_name="task_groups",
        blank=True,
    )
    course = models.CharField(max_length=100)
    invite_code = models.CharField(max_length=12, unique=True, default=generate_invite_code)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Group for '{self.task.title}' ({self.course})"