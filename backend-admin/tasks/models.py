import uuid
from django.db import models


class Task(models.Model):
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace_id = models.UUIDField()
    title        = models.CharField(max_length=255)
    description  = models.TextField(blank=True, null=True)
    status       = models.CharField(max_length=50)
    priority     = models.CharField(max_length=50, blank=True, null=True)
    assignee     = models.CharField(max_length=255, blank=True, null=True)
    created_by   = models.CharField(max_length=255)
    due_date     = models.DateField(blank=True, null=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        managed  = False
        db_table = 'tasks'
        ordering = ['-created_at']

    def __str__(self):
        return self.title
