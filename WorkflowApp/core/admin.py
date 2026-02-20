from django.contrib import admin

from core.models import (
    Role,
    User,
    UserProfile,
    Customer,
    Product,
    ProductProperty,
    Workflow,
    WorkflowStep,
    Order,
    OrderItem,
    OrderFeatureValue,
    Task,
    RawMaterial,
    RawMaterialVariant,
)

# --------------------
# BASIC REGISTRATIONS
# --------------------

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "role")
    list_filter = ("role",)
    search_fields = ("name",)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("id","user","role")

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "phone", "is_frequent")
    search_fields = ("name", "phone")
    list_filter = ("is_frequent",)


# --------------------
# PRODUCT CONFIG
# --------------------

class ProductPropertyInline(admin.TabularInline):
    model = ProductProperty
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "wholesale_price","retail_price", "is_active")
    search_fields = ("name",)
    list_filter = ("is_active",)
    inlines = [ProductPropertyInline]


# --------------------
# WORKFLOW CONFIG
# --------------------

class WorkflowStepInline(admin.TabularInline):
    model = WorkflowStep
    extra = 1


@admin.register(Workflow)
class WorkflowAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "product")
    list_filter = ("product",)
    search_fields = ("name",)
    inlines = [WorkflowStepInline]


@admin.register(WorkflowStep)
class WorkflowStepAdmin(admin.ModelAdmin):
    list_display = ("id", "workflow", "name", "sequence_order", "role")
    list_filter = ("workflow", "role")
    ordering = ("workflow", "sequence_order")


# --------------------
# ORDER & EXECUTION
# --------------------
class OrderFeatureInline(admin.TabularInline):
    model = OrderFeatureValue
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer",
        "delivery_date",
        "status",
        "created_at",
    )
    list_filter = ("status","created_at")
    search_fields = ("id", "customer__name")

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "product", "workflow")
    inlines = [OrderFeatureInline]


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "workflow_step",
        "assigned_to",
        "status",
        "started_at",
        "completed_at",
    )
    list_filter = ("status", "assigned_to", "workflow_step")
    ordering = ("order", "workflow_step__sequence_order")

class RawMaterialVariantInline(admin.TabularInline):
    model = RawMaterialVariant
    extra = 1
    fields = (
        "name",
        "stock",
        "unit",
        "base_cost",
    )

@admin.register(RawMaterial)
class RawMaterialAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "low_stock_limit",
    )
    search_fields = ("name",)
    inlines = [RawMaterialVariantInline]

@admin.register(RawMaterialVariant)
class RawMaterialVariantAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "material",
        "name",
        "stock",
        "unit",
        "base_cost",
        "low_stock_status",
    )

    list_filter = ("material",)
    search_fields = ("name", "material__name")

    # ⭐ SHOW LOW STOCK IN ADMIN LIST
    def low_stock_status(self, obj):
        if obj.material and obj.stock <= obj.material.low_stock_limit:
            return "⚠ LOW STOCK"
        return "OK"

    low_stock_status.short_description = "Status"
