from django.urls import path
from .views import MetricsView, AuditLogListView

urlpatterns = [
    path('metrics/', MetricsView.as_view(),      name='admin-metrics'),
    path('logs/',    AuditLogListView.as_view(),  name='admin-logs'),
]
