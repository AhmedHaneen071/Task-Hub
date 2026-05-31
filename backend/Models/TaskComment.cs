namespace TaskHub.Api.Models;

public sealed class TaskComment
{
    public int Id { get; set; }
    public required string Message { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int TaskId { get; set; }
    public ProjectTask? Task { get; set; }

    public int AuthorId { get; set; }
    public AppUser? Author { get; set; }
}
