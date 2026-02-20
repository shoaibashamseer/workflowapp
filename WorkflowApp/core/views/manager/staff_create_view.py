from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.serializers.staff_create_serializer import StaffCreateSerializer


class StaffCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = StaffCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.save()
        return Response(data)
