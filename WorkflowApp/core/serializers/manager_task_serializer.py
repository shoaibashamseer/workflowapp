# core/serializers/manager_task_serializer.py
from rest_framework import serializers
from core.models import Task


class ManagerTaskSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source="order.id", read_only=True)
    product = serializers.CharField(source="order.product.name", read_only=True)
    step_name = serializers.CharField(source="workflow_step.name", read_only=True)
    assigned_to = serializers.CharField(source="assigned_to.name", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "order_id",
            "product",
            "step_name",
            "assigned_to",
            "status",
            "started_at",
            "completed_at",
        ]
