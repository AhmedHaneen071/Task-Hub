using System.ComponentModel.DataAnnotations;

namespace TaskHub.Api.Dtos;

public sealed record CommentDto(
    int Id,
    string Message,
    DateTime CreatedAt,
    int TaskId,
    string TaskTitle,
    int AuthorId,
    string AuthorName);

public sealed class CreateCommentRequest
{
    [Required, MinLength(2), MaxLength(1200)]
    public required string Message { get; set; }

    [Range(1, int.MaxValue)]
    public int TaskId { get; set; }

    [Range(1, int.MaxValue)]
    public int? AuthorId { get; set; }
}

public sealed class UpdateCommentRequest
{
    [Required, MinLength(2), MaxLength(1200)]
    public required string Message { get; set; }
}
