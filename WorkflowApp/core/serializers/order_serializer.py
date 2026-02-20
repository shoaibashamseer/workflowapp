from rest_framework import serializers
from core.models import Order
from core.serializers.order_item_serializer import OrderItemSerializer
from core.services.task_creator import create_tasks_for_order


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "customer",
            "delivery_date",
            "delivery_method",
            "order_get_method",
            "items",
        ]

    def create(self, validated_data):
        items_data = validated_data.pop("items")

        # 1️⃣ Create order
        order = Order.objects.create(**validated_data)

        # 2️⃣ Create order items + features
        for item_data in items_data:
            serializer = OrderItemSerializer(
                data=item_data,
                context={"order": order}
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()

        # 3️⃣ Create tasks
        create_tasks_for_order(order)

        return order
