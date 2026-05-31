using System.ComponentModel.DataAnnotations;

namespace TaskHub.Api.Dtos;

public sealed record CategoryDto(int Id, string Name, string Color, string? Description, int ProjectCount);

public class CreateCategoryRequest
{
    [Required, MinLength(2), MaxLength(80)]
    public required string Name { get; set; }

    [Required, RegularExpression("^#[0-9a-fA-F]{6}$")]
    public required string Color { get; set; }

    [MaxLength(300)]
    public string? Description { get; set; }
}

public sealed class UpdateCategoryRequest : CreateCategoryRequest
{
}
