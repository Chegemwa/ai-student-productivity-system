from django.contrib import admin
from .models import StudyAvailability, Schedule, ScheduleItem

admin.site.register(StudyAvailability)
admin.site.register(Schedule)
admin.site.register(ScheduleItem)