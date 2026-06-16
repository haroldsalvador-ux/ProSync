from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display    = ['title', 'status', 'priority', 'assignee', 'created_by', 'due_date']
    list_filter     = ['status', 'priority']
    search_fields   = ['title', 'assignee', 'created_by']
    readonly_fields = ['id', 'workspace_id', 'created_at', 'updated_at']

    def has_add_permission(self, request):
        return False
