from rest_framework import serializers
from core.models import Task


class TaskSerializer(serializers.ModelSerializer):
    workflow_step_name = serializers.CharField(
        source="workflow_step.name", read_only=True
    )
    workflow_role_name = serializers.CharField(
        source="workflow_step.role.name", read_only=True
    )
    customer_name = serializers.CharField(
        source="order.customer.name",
        read_only=True
    )

    customer_company = serializers.CharField(
        source="order.customer.company_name",
        read_only=True
    )

    product_name = serializers.CharField(
        source="order_item.product.name",
        read_only=True
    )

    quantity = serializers.IntegerField(
        source="order_item.quantity",
        read_only=True
    )

    order_id = serializers.IntegerField(source="order.id", read_only=True)
    order_item_id = serializers.IntegerField(source="order_item.id", read_only=True)

    order_delivery_date = serializers.DateField(
        source="order.delivery_date",
        read_only=True
    )
    assigned_to_name = serializers.SerializerMethodField()
    class Meta:
        model = Task
        fields = [
            "id",
            "order_id",
            "order_item_id",
            "workflow_step_name",
            "workflow_role_name",
            "customer_name",
            "customer_company",
            "product_name",
            "quantity",
            "order_delivery_date",
            "status",
            "assigned_to",
            "assigned_to_name",
        ]

    def get_assigned_to_name(self, obj):
        if not obj.assigned_to:
            return None
        return getattr(obj.assigned_to, "username", None) or f"User {obj.assigned_to.id}"
