from django.contrib import admin
from .models import AppUser


@admin.register(AppUser)
class AppUserAdmin(admin.ModelAdmin):
    list_display    = ['full_name', 'email', 'role', 'created_at']
    list_filter     = ['role']
    search_fields   = ['full_name', 'email']
    readonly_fields = ['id', 'password_hash', 'created_at', 'updated_at']

    def has_add_permission(self, request):
        return False
