from rest_framework.viewsets import ModelViewSet
from core.models import Order
from core.serializers.order_serializer import OrderSerializer

class OrderViewSet(ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
