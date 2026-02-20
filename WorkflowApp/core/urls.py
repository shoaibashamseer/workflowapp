from django.urls import path
from core.views.auth_views import login_view
from core.views.task_views import TaskViewSet
from rest_framework.routers import DefaultRouter
from core.views.manager.product_views import ProductViewSet
from core.views.manager.product_property_views import ProductPropertyViewSet
from core.views.manager.workflow_views import WorkflowViewSet
from core.views.manager.workflow_step_views import WorkflowStepViewSet
from core.views.manager.task_monitor_views import ManagerTaskViewSet
from core.views.role_views import RoleViewSet
from core.views.customer_views import CustomerViewSet
from core.views.order_views import OrderViewSet
from core.views.manager.staff_views import StaffViewSet
from core.views.manager.report_views import TaskReportView
from core.views.manager.staff_create_view import StaffCreateView
from core.views.auth_change_password import ChangePasswordView
from core.views.manager.raw_material_variant_views import RawMaterialVariantViewSet
from core.views.manager.raw_material_views import RawMaterialViewSet
from core.views.manager.stock_alert_views import LowStockAlertView
from core.views.boss_reports import MonthlyReportView
from core.views.boss_views import (
    DailyLedgerViewSet,
    WorkEstimateViewSet,
    WorkResultViewSet,
)

router = DefaultRouter()
router.register(r"tasks", TaskViewSet,basename="tasks")
router.register("manager/products", ProductViewSet)
router.register("manager/product-properties", ProductPropertyViewSet)
router.register("manager/workflows", WorkflowViewSet)
router.register("manager/workflow-steps", WorkflowStepViewSet)
router.register("manager/tasks", ManagerTaskViewSet, basename="manager-tasks")
router.register("roles", RoleViewSet, basename="roles")
router.register("customers", CustomerViewSet)
router.register("orders", OrderViewSet)
router.register("manager/staff", StaffViewSet, basename="staff")

router.register("manager/raw-materials", RawMaterialViewSet)
router.register("manager/raw-material-variants", RawMaterialVariantViewSet)
router.register("boss/daily-ledger", DailyLedgerViewSet, basename="daily-ledger")
router.register("boss/work-estimates", WorkEstimateViewSet, basename="work-estimates")
router.register("boss/work-results", WorkResultViewSet, basename="work-results")

urlpatterns = [
    path("auth/login/", login_view),
    path("manager/reports/tasks/", TaskReportView.as_view()),
    path("manager/staff/create/", StaffCreateView.as_view()),
    path("auth/change-password/", ChangePasswordView.as_view()),
    path("manager/low-stock/", LowStockAlertView.as_view()),
    path("boss/monthly-report/", MonthlyReportView.as_view()),
]

urlpatterns += router.urls
