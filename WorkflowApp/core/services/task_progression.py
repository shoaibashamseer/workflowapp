from core.models import Task
from django.utils import timezone

def complete_task(task: Task):
    """
    Marks the given task as completed and
    unlocks the next task in the workflow.
    """

    if task.status != "in_progress":
        raise ValueError("Only IN_PROGRESS tasks can be completed")

    # complete current task
    task.status = "completed"
    task.completed_at = task.completed_at or task.started_at
    task.save()

    # find next task in sequence
    next_task = (
        Task.objects
        .filter(
            order=task.order,
            workflow_step__sequence_order__gt=task.workflow_step.sequence_order
        )
        .order_by("workflow_step__sequence_order")
        .first()
    )

    # unlock next task
    if next_task and next_task.status == "pending":
        next_task.status = "ready"
        next_task.save()

    # check if all tasks are completed
    remaining = Task.objects.filter(
        order=task.order
    ).exclude(status="completed").exists()

    if not remaining:
        task.order.status = "completed"
        task.order.save()

def start_task(task: Task):
    """
    Marks a READY task as IN_PROGRESS.
    """

    if task.status != "ready":
        raise ValueError("Only READY tasks can be started")

    task.status = "in_progress"
    task.started_at = timezone.now()
    task.save()
