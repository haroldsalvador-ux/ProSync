from django.db import connection
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics

from .models import AuditLog
from .serializers import AuditLogSerializer


class MetricsView(APIView):
    """Métricas globales del sistema — consumidas por el dashboard de administración."""
    permission_classes = [AllowAny]  # TODO: restringir con token de admin en producción

    def get(self, request):
        with connection.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM workspaces")
            workspaces = cur.fetchone()[0]

            cur.execute("SELECT COUNT(*) FROM tasks")
            tasks = cur.fetchone()[0]

            cur.execute("SELECT COUNT(*) FROM users")
            users = cur.fetchone()[0]

            cur.execute(
                "SELECT COUNT(*) FROM audit_logs WHERE created_at > NOW() - INTERVAL '24 hours'"
            )
            recent_actions = cur.fetchone()[0]

            cur.execute(
                "SELECT action, COUNT(*) AS total FROM audit_logs "
                "GROUP BY action ORDER BY total DESC LIMIT 5"
            )
            top_actions = [{'action': r[0], 'total': r[1]} for r in cur.fetchall()]

        return Response({
            'workspaces':     workspaces,
            'tasks':          tasks,
            'users':          users,
            'recent_actions': recent_actions,
            'top_actions':    top_actions,
        })


class AuditLogListView(generics.ListAPIView):
    """Logs de auditoría paginados — 20 por página."""
    permission_classes = [AllowAny]  # TODO: restringir con token de admin en producción
    serializer_class   = AuditLogSerializer
    queryset           = AuditLog.objects.all()
    page_size          = 20
