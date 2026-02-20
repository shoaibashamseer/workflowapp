from rest_framework.viewsets import ReadOnlyModelViewSet
from core.models import Task
from core.serializers.task_serializer import TaskSerializer


class ManagerTaskViewSet(ReadOnlyModelViewSet):
    queryset = Task.objects.select_related(
        "order",
        "order_item",
        "workflow_step",
        "assigned_to"
    ).order_by("order_id", "workflow_step__sequence_order")

    serializer_class = TaskSerializer
