namespace TaskHub.Api.Models;

public sealed class AppUser
{
    public int Id { get; set; }
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public string Role { get; set; } = UserRoles.User;
    public string? AvatarUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Project> OwnedProjects { get; set; } = new List<Project>();
    public ICollection<ProjectTask> AssignedTasks { get; set; } = new List<ProjectTask>();
    public ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
    public ICollection<ActivityLog> Activities { get; set; } = new List<ActivityLog>();
}

public static class UserRoles
{
    public const string Admin = "Admin";
    public const string User = "User";
}
