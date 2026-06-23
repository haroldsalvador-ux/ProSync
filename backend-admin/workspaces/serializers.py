from django.db import connection
from rest_framework import serializers
from .models import Workspace


class WorkspaceSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()

    class Meta:
        model  = Workspace
        fields = ['id', 'name', 'description', 'department', 'owner',
                  'member_count', 'created_at', 'updated_at']

    def get_member_count(self, obj):
        with connection.cursor() as cur:
            cur.execute(
                "SELECT COUNT(*) FROM workspace_members WHERE workspace_id = %s",
                [str(obj.id)]
            )
            return cur.fetchone()[0]