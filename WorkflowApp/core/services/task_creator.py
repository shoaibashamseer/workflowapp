from core.models import WorkflowStep, Task

def create_tasks_for_order(order):
    for item in order.items.all():
        steps = WorkflowStep.objects.filter(
            workflow=item.workflow
        ).order_by("sequence_order")

        first = True

        for step in steps:
            Task.objects.create(
                order=order,
                order_item=item,
                workflow_step=step,
                assigned_to=None,  # ❗ DO NOT ASSIGN
                status="ready" if first else "pending"
            )

            first = False