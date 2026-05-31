namespace TaskHub.Api.Models;

public sealed class ProjectTask
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public WorkTaskStatus Status { get; set; } = WorkTaskStatus.ToDo;
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int ProjectId { get; set; }
    public Project? Project { get; set; }

    public int? AssigneeId { get; set; }
    public AppUser? Assignee { get; set; }

    public ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
}

public enum WorkTaskStatus
{
    ToDo = 1,
    InProgress = 2,
    Review = 3,
    Done = 4
}
