from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Avg, Count, F, ExpressionWrapper, DurationField
from core.models import Task


class TaskReportView(APIView):
    def get(self, request):
        completed = Task.objects.filter(
            status="completed",
            started_at__isnull=False,
            completed_at__isnull=False,
        )

        duration_expr = ExpressionWrapper(
            F("completed_at") - F("started_at"),
            output_field=DurationField()
        )

        # 1️⃣ Average time per workflow step
        by_step = completed.annotate(
            duration=duration_expr
        ).values(
            "workflow_step__name"
        ).annotate(
            avg_time=Avg("duration"),
            count=Count("id")
        )

        # 2️⃣ Average time per worker
        by_worker = completed.annotate(
            duration=duration_expr
        ).values(
            "assigned_to__id"
        ).annotate(
            avg_time=Avg("duration"),
            count=Count("id")
        )

        # 3️⃣ Current workload
        status_summary = Task.objects.values("status").annotate(
            count=Count("id")
        )

        return Response({
            "by_step": by_step,
            "by_worker": by_worker,
            "status_summary": status_summary,
        })
