from rest_framework import serializers
from .models import AppUser


class AppUserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AppUser
        fields = ['id', 'email', 'full_name', 'role', 'is_blocked', 'created_at']