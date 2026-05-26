from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/',         admin.site.urls),
    path('api/workspaces/', include('workspaces.urls')),
    path('api/admin/',      include('audit.urls')),
]
