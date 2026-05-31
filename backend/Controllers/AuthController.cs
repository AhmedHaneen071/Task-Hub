using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskHub.Api.Data;
using TaskHub.Api.Dtos;
using TaskHub.Api.Models;
using TaskHub.Api.Services;

namespace TaskHub.Api.Controllers;

[Route("api/auth")]
public sealed class AuthController(
    ApplicationDbContext db,
    IPasswordService passwordService,
    IJwtTokenService jwtTokenService) : ApiControllerBase
{
    [HttpPost("signup")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AuthResponse>> Signup(SignupRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var exists = await db.Users.AnyAsync(user => user.Email == normalizedEmail);
        if (exists)
        {
            return Conflict(new { message = "An account with this email already exists." });
        }

        var user = new AppUser
        {
            FullName = request.FullName.Trim(),
            Email = normalizedEmail,
            PasswordHash = passwordService.HashPassword(request.Password),
            Role = UserRoles.User
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var response = new AuthResponse(jwtTokenService.CreateToken(user), ToSummary(user));
        return CreatedAtAction(nameof(Me), null, response);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.SingleOrDefaultAsync(candidate => candidate.Email == normalizedEmail);

        if (user is null || !user.IsActive || !passwordService.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        return Ok(new AuthResponse(jwtTokenService.CreateToken(user), ToSummary(user)));
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserSummaryDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserSummaryDto>> Me()
    {
        var user = await db.Users.FindAsync(CurrentUserId);
        return user is null ? Unauthorized() : Ok(ToSummary(user));
    }
}
