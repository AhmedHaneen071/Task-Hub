namespace TaskHub.Api.Models;

public sealed class Project
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Planning;
    public ProjectPriority Priority { get; set; } = ProjectPriority.Medium;
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int OwnerId { get; set; }
    public AppUser? Owner { get; set; }

    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
    public ICollection<ActivityLog> Activities { get; set; } = new List<ActivityLog>();
}

public enum ProjectStatus
{
    Planning = 1,
    Active = 2,
    Blocked = 3,
    Completed = 4
}

public enum ProjectPriority
{
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}
