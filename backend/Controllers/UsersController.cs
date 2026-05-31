using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskHub.Api.Data;
using TaskHub.Api.Dtos;
using TaskHub.Api.Models;
using TaskHub.Api.Services;

namespace TaskHub.Api.Controllers;

[Authorize]
[Route("api/users")]
public sealed class UsersController(ApplicationDbContext db, IPasswordService passwordService) : ApiControllerBase
{
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<IReadOnlyCollection<UserDto>>> GetAll()
    {
        var users = await db.Users
            .OrderBy(user => user.FullName)
            .ToListAsync();

        return Ok(users.Select(ToDto).ToList());
    }

    [HttpGet("active")]
    public async Task<ActionResult<IReadOnlyCollection<UserSummaryDto>>> GetActive()
    {
        var users = await db.Users
            .Where(user => user.IsActive)
            .OrderBy(user => user.FullName)
            .ToListAsync();

        return Ok(users.Select(ToSummary).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        if (!IsAdmin && id != CurrentUserId)
        {
            return Forbid();
        }

        var user = await db.Users.FindAsync(id);
        return user is null ? NotFound() : Ok(ToDto(user));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<UserDto>> Create(CreateUserRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(user => user.Email == normalizedEmail))
        {
            return Conflict(new { message = "Email already exists." });
        }

        var user = new AppUser
        {
            FullName = request.FullName.Trim(),
            Email = normalizedEmail,
            PasswordHash = passwordService.HashPassword(request.Password),
            Role = request.Role,
            AvatarUrl = request.AvatarUrl
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, ToDto(user));
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<UserDto>> Update(int id, UpdateUserRequest request)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        user.FullName = request.FullName.Trim();
        user.Role = request.Role;
        user.AvatarUrl = request.AvatarUrl;
        user.IsActive = request.IsActive;

        await db.SaveChangesAsync();
        return Ok(ToDto(user));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        if (user.Id == CurrentUserId)
        {
            return BadRequest(new { message = "Administrators cannot delete their own account." });
        }

        var hasRelatedData = await db.Projects.AnyAsync(project => project.OwnerId == id)
            || await db.Tasks.AnyAsync(task => task.AssigneeId == id)
            || await db.Comments.AnyAsync(comment => comment.AuthorId == id)
            || await db.ActivityLogs.AnyAsync(activity => activity.UserId == id);

        if (hasRelatedData)
        {
            user.IsActive = false;
            await db.SaveChangesAsync();
            return Ok(new { message = "User has related records and was deactivated instead.", user = ToDto(user) });
        }

        db.Users.Remove(user);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
