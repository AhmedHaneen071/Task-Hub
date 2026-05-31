using System.ComponentModel.DataAnnotations;
using TaskHub.Api.Models;

namespace TaskHub.Api.Dtos;

public sealed record ProjectDto(
    int Id,
    string Name,
    string Description,
    string Status,
    string Priority,
    DateTime? DueDate,
    DateTime CreatedAt,
    int OwnerId,
    string OwnerName,
    int CategoryId,
    string CategoryName,
    string CategoryColor,
    int TaskCount,
    int CompletedTaskCount);

public sealed record ProjectDetailDto(
    int Id,
    string Name,
    string Description,
    string Status,
    string Priority,
    DateTime? DueDate,
    DateTime CreatedAt,
    UserSummaryDto Owner,
    CategoryDto Category,
    IReadOnlyCollection<TaskDto> Tasks,
    IReadOnlyCollection<ActivityDto> Activities);

public class CreateProjectRequest
{
    [Required, MinLength(2), MaxLength(140)]
    public required string Name { get; set; }

    [Required, MinLength(10), MaxLength(1000)]
    public required string Description { get; set; }

    [Required]
    public ProjectStatus Status { get; set; } = ProjectStatus.Planning;

    [Required]
    public ProjectPriority Priority { get; set; } = ProjectPriority.Medium;

    public DateTime? DueDate { get; set; }

    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }

    [Range(1, int.MaxValue)]
    public int? OwnerId { get; set; }
}

public sealed class UpdateProjectRequest : CreateProjectRequest
{
}

public sealed record ActivityDto(int Id, string Message, DateTime CreatedAt, string UserName);
