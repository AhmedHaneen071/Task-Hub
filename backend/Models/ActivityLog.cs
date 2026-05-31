namespace TaskHub.Api.Models;

public sealed class ActivityLog
{
    public int Id { get; set; }
    public required string Message { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int ProjectId { get; set; }
    public Project? Project { get; set; }

    public int UserId { get; set; }
    public AppUser? User { get; set; }
}
