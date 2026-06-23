from django.urls import path
from .views import MetricsView, VelocityView, AuditLogListView
from .auth_views import AdminLoginView

urlpatterns = [
    path('login/',             AdminLoginView.as_view(),   name='admin-login'),
    path('metrics/',           MetricsView.as_view(),      name='admin-metrics'),
    path('metrics/velocity/',  VelocityView.as_view(),     name='admin-velocity'),
    path('logs/',              AuditLogListView.as_view(), name='admin-logs'),
]