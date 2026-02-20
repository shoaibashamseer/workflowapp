from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        new_password = request.data.get("new_password")

        if not new_password or len(new_password) < 6:
            return Response(
                {"error": "Password must be at least 6 characters"},
                status=400
            )

        user = request.user
        user.set_password(new_password)
        user.save()

        profile = user.userprofile
        profile.must_change_password = False
        profile.save()

        return Response({"status": "password_changed"})
