from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from core.serializers.staff_serializer import StaffSerializer

User = get_user_model()


class StaffViewSet(ModelViewSet):
    queryset = User.objects.all().select_related("userprofile__role")
    serializer_class = StaffSerializer
    permission_classes = [IsAuthenticated]
