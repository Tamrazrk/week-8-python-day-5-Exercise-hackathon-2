from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('user',)

    def create(self, validated_data):
        print(self.context['request'])
        print(validated_data)
        user = self.context['request'].user
        return Task.objects.create(**validated_data)
    
    def get_status_display(self, obj):
        return obj.get_status_display()