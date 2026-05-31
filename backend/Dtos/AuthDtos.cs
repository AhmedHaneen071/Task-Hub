using System.ComponentModel.DataAnnotations;

namespace TaskHub.Api.Dtos;

public sealed class SignupRequest
{
    [Required, MinLength(2), MaxLength(120)]
    public required string FullName { get; set; }

    [Required, EmailAddress, MaxLength(180)]
    public required string Email { get; set; }

    [Required, MinLength(8), MaxLength(100)]
    public required string Password { get; set; }
}

public sealed class LoginRequest
{
    [Required, EmailAddress]
    public required string Email { get; set; }

    [Required]
    public required string Password { get; set; }
}

public sealed record AuthResponse(string Token, UserSummaryDto User);

public sealed record UserSummaryDto(
    int Id,
    string FullName,
    string Email,
    string Role,
    string? AvatarUrl);
