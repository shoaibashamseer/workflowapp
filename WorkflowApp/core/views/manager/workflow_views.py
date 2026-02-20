from rest_framework.viewsets import ModelViewSet
from core.models import Workflow
from core.serializers.workflow_serializer import WorkflowSerializer


class WorkflowViewSet(ModelViewSet):
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer
