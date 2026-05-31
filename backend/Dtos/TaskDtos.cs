using System.ComponentModel.DataAnnotations;
using TaskHub.Api.Models;

namespace TaskHub.Api.Dtos;

public sealed record TaskDto(
    int Id,
    string Title,
    string Description,
    string Status,
    DateTime? DueDate,
    DateTime CreatedAt,
    int ProjectId,
    string ProjectName,
    int? AssigneeId,
    string? AssigneeName,
    int CommentCount);

public class CreateTaskRequest
{
    [Required, MinLength(2), MaxLength(160)]
    public required string Title { get; set; }

    [Required, MinLength(10), MaxLength(1000)]
    public required string Description { get; set; }

    [Required]
    public WorkTaskStatus Status { get; set; } = WorkTaskStatus.ToDo;

    public DateTime? DueDate { get; set; }

    [Range(1, int.MaxValue)]
    public int ProjectId { get; set; }

    [Range(1, int.MaxValue)]
    public int? AssigneeId { get; set; }
}

public sealed class UpdateTaskRequest : CreateTaskRequest
{
}
