from rest_framework import serializers
from core.models import DailyLedger, WorkEstimate, WorkResult


class DailyLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyLedger
        fields = "__all__"
        read_only_fields = ["created_by"]

class WorkEstimateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkEstimate
        fields = "__all__"
        read_only_fields = ["created_by"]

class WorkResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkResult
        fields = "__all__"
        read_only_fields = ["created_by"]