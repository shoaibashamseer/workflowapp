from rest_framework import serializers
from core.models import RawMaterial


class RawMaterialSerializer(serializers.ModelSerializer):

    class Meta:
        model = RawMaterial
        fields = [
            "id",
            "name",
            "low_stock_limit",

        ]
