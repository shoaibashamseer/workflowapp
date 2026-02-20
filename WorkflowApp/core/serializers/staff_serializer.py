from rest_framework import serializers
from django.contrib.auth import get_user_model
from core.models import UserProfile

User = get_user_model()


class StaffSerializer(serializers.ModelSerializer):
    role = serializers.IntegerField(write_only=True, required=False)
    role_name = serializers.CharField(
        source="userprofile.role.name", read_only=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "is_active",
            "role",
            "role_name",
        ]

    def update(self, instance, validated_data):
        role_id = validated_data.pop("role", None)
        instance = super().update(instance, validated_data)

        if role_id is not None:
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            profile.role_id = role_id
            profile.save()

        return instance
