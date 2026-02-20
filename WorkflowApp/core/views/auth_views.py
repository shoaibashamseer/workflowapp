from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if not user:
        return Response({"error": "Invalid credentials"}, status=400)

    token, _ = Token.objects.get_or_create(user=user)
    profile = getattr(user, "userprofile", None)
    role = profile.role.name if profile and profile.role else None
    print("LOGIN ROLE:", role)

    return Response({
        "token": token.key,
        "id": user.id,
        "username": user.username,
        "must_change_password": profile.must_change_password,
        "role": role,
    })
