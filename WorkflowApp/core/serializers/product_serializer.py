from rest_framework import serializers
from core.models import Product, ProductProperty


class ProductPropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductProperty
        fields = ["id","product", "name", "field_type", "options"]


class ProductSerializer(serializers.ModelSerializer):
    properties = ProductPropertySerializer(
        source="productproperty_set",
        many=True,
        read_only=True
    )

    class Meta:
        model = Product
        fields = ["id", "name", "description", "wholesale_price","retail_price", "is_active", "properties"]
