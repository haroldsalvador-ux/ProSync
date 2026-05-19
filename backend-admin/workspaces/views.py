from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import Workspace
from .serializers import WorkspaceSerializer


class WorkspaceViewSet(viewsets.ModelViewSet):
    queryset           = Workspace.objects.all()
    serializer_class   = WorkspaceSerializer
    permission_classes = [IsAdminUser]
