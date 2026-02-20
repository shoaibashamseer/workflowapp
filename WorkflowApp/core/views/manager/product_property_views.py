from rest_framework.viewsets import ModelViewSet
from core.models import ProductProperty
from core.serializers.product_serializer import ProductPropertySerializer


class ProductPropertyViewSet(ModelViewSet):
    queryset = ProductProperty.objects.all()
    serializer_class = ProductPropertySerializer
