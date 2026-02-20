from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from core.models import DailyLedger


class MonthlyReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        month = request.query_params.get("month")  # format: YYYY-MM

        qs = DailyLedger.objects.filter(
            created_by=request.user,
            date__startswith=month
        )

        credit = qs.filter(type="credit").aggregate(total=Sum("amount"))["total"] or 0
        debit = qs.filter(type="debit").aggregate(total=Sum("amount"))["total"] or 0

        profit = credit - debit

        return Response({
            "month": month,
            "total_credit": credit,
            "total_debit": debit,
            "profit": profit,
            "status": "PROFIT" if profit >= 0 else "LOSS"
        })
