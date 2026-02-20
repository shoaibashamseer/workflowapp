from rest_framework import serializers


class OrderFeatureSerializer(serializers.Serializer):
    name = serializers.CharField()
    value = serializers.CharField()
