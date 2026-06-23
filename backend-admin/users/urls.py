from django.urls import path
from .views import AppUserListView, AppUserToggleBlockView

urlpatterns = [
    path('',               AppUserListView.as_view(),       name='admin-users-list'),
    path('<uuid:pk>/block/', AppUserToggleBlockView.as_view(), name='admin-users-toggle-block'),
]