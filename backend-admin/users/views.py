from rest_framework import generics
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AppUser
from .serializers import AppUserSerializer


class AppUserListView(generics.ListAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes     = [IsAdminUser]
    serializer_class       = AppUserSerializer
    queryset                = AppUser.objects.all()
    page_size               = 20


class AppUserToggleBlockView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes     = [IsAdminUser]

    def patch(self, request, pk):
        try:
            user = AppUser.objects.get(pk=pk)
        except AppUser.DoesNotExist:
            return Response({'message': 'Usuario no encontrado'}, status=404)

        user.is_blocked = not user.is_blocked
        user.save(update_fields=['is_blocked'])
        return Response(AppUserSerializer(user).data)