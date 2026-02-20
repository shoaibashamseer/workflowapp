from rest_framework import serializers
from core.models import Workflow, WorkflowStep


class WorkflowStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStep
        fields = "__all__"


class WorkflowSerializer(serializers.ModelSerializer):
    steps = WorkflowStepSerializer(
        source="workflowstep_set",
        many=True,
        read_only=True
    )

    class Meta:
        model = Workflow
        fields = ["id", "product", "name", "description", "steps"]
