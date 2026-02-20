from rest_framework.viewsets import ModelViewSet
from core.models import WorkflowStep
from core.serializers.workflow_serializer import WorkflowStepSerializer


class WorkflowStepViewSet(ModelViewSet):
    queryset = WorkflowStep.objects.all()
    serializer_class = WorkflowStepSerializer
