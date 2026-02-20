from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework import status
from django.utils import timezone
from django.db import transaction
from core.models import Task
from core.serializers.task_serializer import TaskSerializer
from rest_framework.permissions import IsAuthenticated
class TaskViewSet(ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Task.objects.select_related(
            "workflow_step",
            "workflow_step__role",
            "assigned_to",
            "order",
            "order__customer",
            "order_item",
            "order_item__product",
        ).all()

        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(workflow_step__role__name=role)

        # hide pending tasks from worker view
        qs = qs.exclude(status="pending")

        return qs.order_by("id")


    @action(detail=True, methods=["post"])
    @transaction.atomic
    def start(self, request, pk=None):
        task = self.get_object()
        if task.status != "ready":
            return Response(
                {"error": "Task is not available"},
                status=status.HTTP_400_BAD_REQUEST
            )

        task.status = "in_progress"
        task.assigned_to = request.user
        task.started_at = timezone.now()
        task.save()
        return Response({"message": "started"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def complete(self, request, pk=None):
        task = self.get_object()
        if task.status != "in_progress":
            return Response(
                {"error": "Task is not in progress"},
                status=status.HTTP_400_BAD_REQUEST
            )

        task.status = "completed"
        task.completed_at = timezone.now()
        task.save()

        # 🔓 unlock next step in same order_item
        next_task = Task.objects.filter(
            order_item=task.order_item,
            status="pending"
        ).order_by("workflow_step__sequence_order").first()

        if next_task:
            next_task.status = "ready"
            next_task.save()

        return Response({"message": "completed"}, status=status.HTTP_200_OK)

