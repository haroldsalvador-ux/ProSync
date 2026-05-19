import uuid
from django.db import models


class DepartmentEnum(models.TextChoices):
    ENGINEERING = 'Engineering', 'Engineering'
    MARKETING   = 'Marketing',   'Marketing'
    DESIGN      = 'Design',      'Design'
    PRODUCT     = 'Product',     'Product'
    SALES       = 'Sales',       'Sales'
    HR          = 'HR',          'HR'
    FINANCE     = 'Finance',     'Finance'
    OPERATIONS  = 'Operations',  'Operations'


class Workspace(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name        = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    department  = models.CharField(max_length=50, choices=DepartmentEnum.choices, blank=True, null=True)
    owner       = models.CharField(max_length=255, blank=True, null=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        managed  = False   # Django no toca la tabla; la gestiona 001_initial_schema.sql
        db_table = 'workspaces'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
