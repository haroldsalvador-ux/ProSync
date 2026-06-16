import uuid
from django.db import models


class AppUser(models.Model):
    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email         = models.EmailField(max_length=254, unique=True)
    password_hash = models.CharField(max_length=255)
    full_name     = models.CharField(max_length=255)
    role          = models.CharField(max_length=50, default='member')
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        managed  = False
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.full_name} ({self.email})'
