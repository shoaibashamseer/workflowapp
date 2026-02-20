from rest_framework import serializers
from core.models import OrderItem, OrderFeatureValue, Product, Workflow


from core.models import OrderItemMaterial, RawMaterialVariant


class OrderItemSerializer(serializers.Serializer):
    product = serializers.IntegerField()
    workflow = serializers.IntegerField()
    quantity = serializers.IntegerField()
    features = serializers.ListField()
    materials = serializers.ListField(required=False)   # ⭐ NEW

    def create(self, validated_data):
        order = self.context["order"]

        product = Product.objects.get(pk=validated_data["product"])
        workflow = Workflow.objects.get(pk=validated_data["workflow"])
        quantity = validated_data.get("quantity", 1)

        item = OrderItem.objects.create(
            order=order,
            product=product,
            workflow=workflow,
            quantity=quantity
        )

        # save features
        for f in validated_data["features"]:
            OrderFeatureValue.objects.create(
                order_item=item,
                feature_name=f["name"],
                value=f["value"]
            )

        # ⭐ save selected materials
        for m in validated_data.get("materials", []):
            variant = RawMaterialVariant.objects.get(pk=m["variant"])
            used_qty = m["quantity_used"]

            if variant.stock < used_qty:
                raise serializers.ValidationError(
                    f"Not enough stock for {variant.name}"
                )

            OrderItemMaterial.objects.create(
                order_item=item,
                material_variant=variant,
                quantity_used=used_qty
            )

            variant.stock -= used_qty
            variant.save()

        return item

