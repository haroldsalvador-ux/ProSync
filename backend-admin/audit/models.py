import uuid
from django.db import models


class AuditLog(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_email  = models.CharField(max_length=255)
    action      = models.CharField(max_length=100)
    entity_type = models.CharField(max_length=50)
    entity_id   = models.UUIDField(null=True, blank=True)
    details     = models.JSONField(null=True, blank=True)
    created_at  = models.DateTimeField()

    class Meta:
        managed  = False   # Spring Boot escribe; Django solo lee
        db_table = 'audit_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.action} — {self.user_email}'
