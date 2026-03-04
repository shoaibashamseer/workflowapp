from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework import status
from django.utils import timezone
from django.db import transaction
from core.models import Task
from core.serializers.task_serializer import TaskSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Case, When, IntegerField
class TaskViewSet(ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        qs = Task.objects.select_related(
            "workflow_step",
            "workflow_step__role",
            "order",
            "order__customer",
            "order_item",
            "order_item__product",
        ).all()

        user_role = getattr(user.userprofile, "role", None)
        user_role = getattr(user.userprofile, "role", None)

        if user_role:
            qs = qs.filter(
                workflow_step__role=user_role
            )

        # Smart ordering:
        # 1️⃣ My in-progress first
        # 2️⃣ Ready tasks next
        # 3️⃣ Others last
        qs = qs.annotate(
            status_priority=Case(
                When(status="in_progress", assigned_to=user, then=0),
                When(status="ready", then=1),
                When(status="in_progress", then=2),
                default=3,
                output_field=IntegerField(),
            )
        )

        return qs.order_by("status_priority", "order__delivery_date", "id")

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def start(self, request, pk=None):
        task = Task.objects.select_for_update().get(pk=pk)

        if task.status != "ready":
            return Response(
                {"error": "Task already claimed"},
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

