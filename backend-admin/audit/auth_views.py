from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate


class AdminLoginView(APIView):
    permission_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user is None or not user.is_staff:
            return Response({'message': 'Credenciales inválidas o sin permisos de Admin'}, status=401)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'username': user.username})