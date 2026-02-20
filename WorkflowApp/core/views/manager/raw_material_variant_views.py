from rest_framework.viewsets import ModelViewSet
from rest_framework import serializers
from core.models import RawMaterialVariant,OrderItemMaterial
from rest_framework.response import Response
from rest_framework import status

class RawMaterialVariantSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source="material.name", read_only=True)
    low_stock = serializers.SerializerMethodField()

    class Meta:
        model = RawMaterialVariant
        fields = [
            "id",
            "material",
            "material_name",
            "name",
            "stock",
            "unit",
            "base_cost",
            "low_stock",
        ]

    def get_low_stock(self, obj):
        if not obj.material:
            return False
        return obj.stock <= obj.material.low_stock_limit

class RawMaterialVariantViewSet(ModelViewSet):
    queryset = RawMaterialVariant.objects.select_related("material").all()
    serializer_class = RawMaterialVariantSerializer

    def destroy(self, request, *args, **kwargs):
        variant = self.get_object()

        if OrderItemMaterial.objects.filter(material_variant=variant).exists():
            return Response(
                {"error": "Variant already used in orders"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        variant.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)