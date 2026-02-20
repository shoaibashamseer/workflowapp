from core.models import WorkflowStep, Task, UserProfile


def create_tasks_for_order(order):
    for item in order.items.all():
        steps = WorkflowStep.objects.filter(
            workflow=item.workflow
        ).order_by("sequence_order")

        first = True
        for step in steps:
            profile = UserProfile.objects.filter(
                role=step.role
            ).first()

            assigned_user = profile.user if profile else None
            print(
                "AUTO ASSIGN DEBUG:",
                "STEP:", step.name,
                "ROLE:", step.role,
                "USER:", assigned_user
            )

            Task.objects.create(
                order=order,
                order_item=item,
                workflow_step=step,
                assigned_to=assigned_user,
                status="ready" if first else "pending"
            )

            first = False
