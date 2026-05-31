using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskHub.Api.Data;
using TaskHub.Api.Dtos;
using TaskHub.Api.Models;

namespace TaskHub.Api.Controllers;

[Authorize]
[Route("api/projects")]
public sealed class ProjectsController(ApplicationDbContext db) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<ProjectDto>>> GetAll()
    {
        var query = db.Projects
            .Include(project => project.Owner)
            .Include(project => project.Category)
            .Include(project => project.Tasks)
            .AsQueryable();

        if (!IsAdmin)
        {
            query = query.Where(project =>
                project.OwnerId == CurrentUserId ||
                project.Tasks.Any(task => task.AssigneeId == CurrentUserId));
        }

        var projects = await query
            .OrderByDescending(project => project.CreatedAt)
            .ToListAsync();

        return Ok(projects.Select(ToDto).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProjectDetailDto>> GetById(int id)
    {
        var project = await db.Projects
            .Include(candidate => candidate.Owner)
            .Include(candidate => candidate.Category)
            .Include(candidate => candidate.Tasks)
                .ThenInclude(task => task.Assignee)
            .Include(candidate => candidate.Tasks)
                .ThenInclude(task => task.Comments)
            .Include(candidate => candidate.Activities)
                .ThenInclude(activity => activity.User)
            .SingleOrDefaultAsync(candidate => candidate.Id == id);

        if (project is null)
        {
            return NotFound();
        }

        if (!CanAccessProject(project))
        {
            return Forbid();
        }

        return Ok(ToDetailDto(project));
    }

    [HttpPost]
    public async Task<ActionResult<ProjectDto>> Create(CreateProjectRequest request)
    {
        var category = await db.Categories.FindAsync(request.CategoryId);
        if (category is null)
        {
            return BadRequest(new { message = "Category does not exist." });
        }

        var ownerId = IsAdmin && request.OwnerId.HasValue ? request.OwnerId.Value : CurrentUserId;
        var owner = await db.Users.FindAsync(ownerId);
        if (owner is null || !owner.IsActive)
        {
            return BadRequest(new { message = "Owner does not exist or is inactive." });
        }

        var project = new Project
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            Status = request.Status,
            Priority = request.Priority,
            DueDate = request.DueDate,
            CategoryId = request.CategoryId,
            OwnerId = ownerId
        };

        db.Projects.Add(project);
        db.ActivityLogs.Add(new ActivityLog
        {
            Project = project,
            UserId = CurrentUserId,
            Message = "Created project."
        });

        await db.SaveChangesAsync();
        await db.Entry(project).Reference(item => item.Owner).LoadAsync();
        await db.Entry(project).Reference(item => item.Category).LoadAsync();
        await db.Entry(project).Collection(item => item.Tasks).LoadAsync();

        return CreatedAtAction(nameof(GetById), new { id = project.Id }, ToDto(project));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProjectDto>> Update(int id, UpdateProjectRequest request)
    {
        var project = await db.Projects
            .Include(candidate => candidate.Owner)
            .Include(candidate => candidate.Category)
            .Include(candidate => candidate.Tasks)
            .SingleOrDefaultAsync(candidate => candidate.Id == id);

        if (project is null)
        {
            return NotFound();
        }

        if (!IsAdmin && project.OwnerId != CurrentUserId)
        {
            return Forbid();
        }

        if (!await db.Categories.AnyAsync(category => category.Id == request.CategoryId))
        {
            return BadRequest(new { message = "Category does not exist." });
        }

        var ownerId = IsAdmin && request.OwnerId.HasValue ? request.OwnerId.Value : project.OwnerId;
        if (!await db.Users.AnyAsync(user => user.Id == ownerId && user.IsActive))
        {
            return BadRequest(new { message = "Owner does not exist or is inactive." });
        }

        project.Name = request.Name.Trim();
        project.Description = request.Description.Trim();
        project.Status = request.Status;
        project.Priority = request.Priority;
        project.DueDate = request.DueDate;
        project.CategoryId = request.CategoryId;
        project.OwnerId = ownerId;

        db.ActivityLogs.Add(new ActivityLog
        {
            ProjectId = project.Id,
            UserId = CurrentUserId,
            Message = "Updated project details."
        });

        await db.SaveChangesAsync();
        await db.Entry(project).Reference(item => item.Owner).LoadAsync();
        await db.Entry(project).Reference(item => item.Category).LoadAsync();

        return Ok(ToDto(project));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var project = await db.Projects
            .Include(candidate => candidate.Tasks)
            .SingleOrDefaultAsync(candidate => candidate.Id == id);

        if (project is null)
        {
            return NotFound();
        }

        if (!IsAdmin && project.OwnerId != CurrentUserId)
        {
            return Forbid();
        }

        db.Projects.Remove(project);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private bool CanAccessProject(Project project) =>
        IsAdmin ||
        project.OwnerId == CurrentUserId ||
        project.Tasks.Any(task => task.AssigneeId == CurrentUserId);

    private static ProjectDetailDto ToDetailDto(Project project) =>
        new(
            project.Id,
            project.Name,
            project.Description,
            project.Status.ToString(),
            project.Priority.ToString(),
            project.DueDate,
            project.CreatedAt,
            ToSummary(project.Owner!),
            ToDto(project.Category!),
            project.Tasks.OrderBy(task => task.DueDate).Select(ToDto).ToList(),
            project.Activities.OrderByDescending(activity => activity.CreatedAt).Select(ToDto).ToList());
}
