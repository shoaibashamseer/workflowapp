from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from core.models import DailyLedger, WorkEstimate, WorkResult
from core.serializers.boss_serializers import (
    DailyLedgerSerializer,
    WorkEstimateSerializer,
    WorkResultSerializer,
)


class DailyLedgerViewSet(ModelViewSet):
    serializer_class = DailyLedgerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DailyLedger.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class WorkEstimateViewSet(ModelViewSet):
    serializer_class = WorkEstimateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkEstimate.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class WorkResultViewSet(ModelViewSet):
    serializer_class = WorkResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkResult.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
