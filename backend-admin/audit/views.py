from django.db import connection
from rest_framework.permissions import IsAdminUser
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics

from .models import AuditLog
from .serializers import AuditLogSerializer


class VelocityView(APIView):
    """Métricas de velocidad del equipo — consumidas por el dashboard de velocidad."""
    authentication_classes = [TokenAuthentication]
    permission_classes     = [IsAdminUser]

    def get(self, request):
        with connection.cursor() as cur:
            # Velocidad semanal: creadas vs completadas (últimas 6 semanas)
            cur.execute("""
                WITH weeks AS (
                    SELECT DATE_TRUNC('week', created_at)::date AS week_start, COUNT(*) AS creadas
                    FROM tasks
                    WHERE created_at >= NOW() - INTERVAL '6 weeks'
                    GROUP BY 1
                ),
                completions AS (
                    SELECT DATE_TRUNC('week', updated_at)::date AS week_start, COUNT(*) AS completadas
                    FROM tasks
                    WHERE status::text = 'done' AND updated_at >= NOW() - INTERVAL '6 weeks'
                    GROUP BY 1
                )
                SELECT
                    COALESCE(w.week_start, c.week_start) AS week_start,
                    COALESCE(w.creadas, 0),
                    COALESCE(c.completadas, 0)
                FROM weeks w
                FULL OUTER JOIN completions c ON w.week_start = c.week_start
                ORDER BY 1
            """)
            weekly_velocity = [
                {'label': r[0].strftime('%d %b'), 'creadas': r[1], 'completadas': r[2]}
                for r in cur.fetchall()
            ]

            # Velocidad por miembro (top 8 por completadas)
            cur.execute("""
                SELECT
                    COALESCE(assignee, 'Sin asignar') AS member,
                    COUNT(*) FILTER (WHERE status::text = 'done')        AS completadas,
                    COUNT(*) FILTER (WHERE status::text = 'in_progress') AS en_progreso,
                    COUNT(*) FILTER (WHERE status::text IN ('todo', 'review')) AS pendientes
                FROM tasks
                WHERE assignee IS NOT NULL AND assignee <> ''
                GROUP BY assignee
                ORDER BY completadas DESC
                LIMIT 8
            """)
            member_velocity = [
                {'member': r[0], 'completadas': r[1], 'en_progreso': r[2], 'pendientes': r[3]}
                for r in cur.fetchall()
            ]

            # Tiempo medio de completado (días)
            cur.execute("""
                SELECT ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400)::numeric, 1)
                FROM tasks WHERE status::text = 'done'
            """)
            avg_days = cur.fetchone()[0] or 0

            # Tareas en riesgo (vencidas y no completadas)
            cur.execute("""
                SELECT COUNT(*) FROM tasks
                WHERE due_date < CURRENT_DATE AND status::text <> 'done'
            """)
            at_risk = cur.fetchone()[0]

            # Tasa de completado
            cur.execute("SELECT COUNT(*) FROM tasks WHERE status::text = 'done'")
            done_count = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM tasks")
            total_count = cur.fetchone()[0]
            completion_rate = round(done_count / total_count * 100, 1) if total_count else 0

        return Response({
            'weekly_velocity':    weekly_velocity,
            'member_velocity':    member_velocity,
            'avg_completion_days': float(avg_days),
            'tasks_at_risk':      at_risk,
            'completion_rate':    completion_rate,
        })


class MetricsView(APIView):
    """Métricas globales del sistema — consumidas por el dashboard de administración."""
    authentication_classes = [TokenAuthentication]
    permission_classes     = [IsAdminUser]

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
    authentication_classes = [TokenAuthentication]
    permission_classes     = [IsAdminUser]  # TODO: restringir con token de admin en producción
    serializer_class   = AuditLogSerializer
    queryset           = AuditLog.objects.all()
    page_size          = 20
