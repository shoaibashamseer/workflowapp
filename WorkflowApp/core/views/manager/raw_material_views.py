
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from core.models import RawMaterial
from core.serializers.raw_material_serializer import RawMaterialSerializer


class RawMaterialViewSet(ModelViewSet):
    queryset = RawMaterial.objects.all().order_by("id")
    serializer_class = RawMaterialSerializer
    permission_classes = [IsAuthenticated]


    def destroy(self, request, *args, **kwargs):
        material = self.get_object()

        if material.variants.exists():
            return Response(
                {"error": "Cannot delete material with variants"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        material.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)