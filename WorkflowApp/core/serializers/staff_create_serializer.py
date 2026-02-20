from rest_framework import serializers
from django.contrib.auth import get_user_model
from core.models import UserProfile
from core.utils.passwords import generate_password

User = get_user_model()


class StaffCreateSerializer(serializers.Serializer):
    username = serializers.CharField()
    role = serializers.IntegerField()

    def create(self, validated_data):
        username = validated_data["username"]
        role_id = validated_data["role"]

        password = generate_password()

        user = User.objects.create_user(
            username=username,
            password=password
        )

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role_id = role_id
        profile.must_change_password = True
        profile.save()

        return {
            "user_id": user.id,
            "username": username,
            "password": password,
        }
