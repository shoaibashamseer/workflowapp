from django.db import models
from django.conf import settings

class Role(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class User(models.Model):
    name = models.CharField(max_length=150)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    must_change_password = models.BooleanField(default=True)

    def __str__(self):
        return f"User {self.user_id} - {self.role}"


class Customer(models.Model):
    TYPE_CHOICES = (
        ("wholesale", "Wholesale"),
        ("retail", "Retail"),
    )
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15, unique=True)
    customer_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default="retail"
    )
    email = models.EmailField(blank=True, null=True)
    company_name = models.CharField(max_length=150, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    is_frequent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    wholesale_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    retail_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class ProductProperty(models.Model):
    FIELD_TYPES = (
        ('text', 'Text'),
        ('number', 'Number'),
        ('dropdown', 'Dropdown'),
    )

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES)
    options = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"{self.product.name} - {self.name}"

class Workflow(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class WorkflowStep(models.Model):
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    sequence_order = models.PositiveIntegerField()
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        ordering = ['sequence_order']

    def __str__(self):
        return f"{self.workflow.name} - {self.name}"

class Order(models.Model):
    STATUS_CHOICES = (
        ('created', 'Created'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    )

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    created_by =  models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.SET_NULL,
    null=True,
    blank=True
)
    delivery_date = models.DateField()
    delivery_method = models.CharField(max_length=50)
    order_get_method = models.CharField(max_length=50 , null = True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='created')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.order.id} - {self.product.name}"

class OrderFeatureValue(models.Model):
    order_item = models.ForeignKey(
        OrderItem,
        on_delete=models.CASCADE,
        related_name="features"
    )
    feature_name = models.CharField(max_length=100)
    value = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.feature_name}: {self.value}"


class Task(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('ready', 'Ready'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    )

    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE , null = True)
    workflow_step = models.ForeignKey(WorkflowStep, on_delete=models.CASCADE)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)

class RawMaterial(models.Model):
    name = models.CharField(max_length=150)

    low_stock_limit = models.IntegerField(default=0)

    def __str__(self):
        return self.name

class RawMaterialVariant(models.Model):
    material = models.ForeignKey(
        RawMaterial,
        on_delete=models.CASCADE,
        related_name="variants"
    )
    name = models.CharField(max_length=150)  # Fish hook / Metal hook
    stock = models.FloatField(default=0)
    unit = models.CharField(max_length=20, default="pcs")
    base_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.material.name} - {self.name}"

class OrderItemMaterial(models.Model):
    order_item = models.ForeignKey(
        OrderItem,
        on_delete=models.CASCADE,
        related_name="materials"
    )
    material_variant = models.ForeignKey(
        RawMaterialVariant,
        on_delete=models.CASCADE
    )
    quantity_used = models.FloatField()

    def __str__(self):
        return f"{self.order_item} uses {self.material_variant}"

class DailyLedger(models.Model):
    date = models.DateField()
    title = models.CharField(max_length=200)
    amount = models.FloatField()
    type = models.CharField(
        max_length=10,
        choices=(("credit", "Credit"), ("debit", "Debit"))
    )
    created_by = models.ForeignKey("auth.User", on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.title} - {self.amount}"

class WorkEstimate(models.Model):
    title = models.CharField(max_length=200)

    raw_material_cost = models.FloatField(default=0)
    labour_cost = models.FloatField(default=0)
    overhead_cost = models.FloatField(default=0)
    expected_profit = models.FloatField(default=0)

    created_by = models.ForeignKey("auth.User", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class WorkResult(models.Model):
    title = models.CharField(max_length=200)

    estimated_cost = models.FloatField(default=0)
    actual_material_cost = models.FloatField(default=0)
    actual_labour_cost = models.FloatField(default=0)
    actual_overhead_cost = models.FloatField(default=0)

    amount_received = models.FloatField(default=0)

    created_by = models.ForeignKey("auth.User", on_delete=models.CASCADE)
