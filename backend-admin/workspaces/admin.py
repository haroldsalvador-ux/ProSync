from django.contrib import admin
from .models import Workspace


@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display  = ['name', 'department', 'owner', 'created_at']
    list_filter   = ['department']
    search_fields = ['name', 'owner']
    readonly_fields = ['id', 'created_at', 'updated_at']
