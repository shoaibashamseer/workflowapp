from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.models import RawMaterialVariant
from core.views.manager.raw_material_variant_views import RawMaterialVariantSerializer


class LowStockAlertView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        low_stock_items = RawMaterialVariant.objects.filter(stock__lte=100)
        serializer = RawMaterialVariantSerializer(low_stock_items, many=True)
        return Response(serializer.data)
