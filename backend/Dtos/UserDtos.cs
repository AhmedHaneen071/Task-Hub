using System.ComponentModel.DataAnnotations;

namespace TaskHub.Api.Dtos;

public sealed record UserDto(
    int Id,
    string FullName,
    string Email,
    string Role,
    string? AvatarUrl,
    bool IsActive,
    DateTime CreatedAt);

public sealed class CreateUserRequest
{
    [Required, MinLength(2), MaxLength(120)]
    public required string FullName { get; set; }

    [Required, EmailAddress, MaxLength(180)]
    public required string Email { get; set; }

    [Required, MinLength(8), MaxLength(100)]
    public required string Password { get; set; }

    [Required, RegularExpression("Admin|User")]
    public string Role { get; set; } = "User";

    [Url]
    public string? AvatarUrl { get; set; }
}

public sealed class UpdateUserRequest
{
    [Required, MinLength(2), MaxLength(120)]
    public required string FullName { get; set; }

    [Required, RegularExpression("Admin|User")]
    public required string Role { get; set; }

    [Url]
    public string? AvatarUrl { get; set; }

    public bool IsActive { get; set; } = true;
}
