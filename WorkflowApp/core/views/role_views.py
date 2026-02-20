from rest_framework.viewsets import ReadOnlyModelViewSet
from core.models import Role
from core.serializers.role_serializer import RoleSerializer


class RoleViewSet(ReadOnlyModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
