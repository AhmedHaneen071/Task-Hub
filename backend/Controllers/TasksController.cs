using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskHub.Api.Data;
using TaskHub.Api.Dtos;
using TaskHub.Api.Models;

namespace TaskHub.Api.Controllers;

[Authorize]
[Route("api/tasks")]
public sealed class TasksController(ApplicationDbContext db) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<TaskDto>>> GetAll([FromQuery] int? projectId)
    {
        var query = db.Tasks.AsQueryable();

        if (projectId.HasValue)
        {
            query = query.Where(task => task.ProjectId == projectId.Value);
        }

        if (!IsAdmin)
        {
            query = query.Where(task =>
                task.AssigneeId == CurrentUserId ||
                task.Project!.OwnerId == CurrentUserId);
        }

        var tasks = await query
            .OrderBy(task => task.DueDate ?? DateTime.MaxValue)
            .Select(task => new TaskDto(
                task.Id,
                task.Title,
                task.Description,
                task.Status.ToString(),
                task.DueDate,
                task.CreatedAt,
                task.ProjectId,
                task.Project!.Name,
                task.AssigneeId,
                task.Assignee != null ? task.Assignee.FullName : null,
                task.Comments.Count))
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskDto>> GetById(int id)
    {
        var task = await TaskQuery().SingleOrDefaultAsync(candidate => candidate.Id == id);
        if (task is null)
        {
            return NotFound();
        }

        if (!CanAccessTask(task))
        {
            return Forbid();
        }

        return Ok(ToDto(task));
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> Create(CreateTaskRequest request)
    {
        var project = await db.Projects
            .Include(candidate => candidate.Tasks)
            .SingleOrDefaultAsync(candidate => candidate.Id == request.ProjectId);

        if (project is null)
        {
            return BadRequest(new { message = "Project does not exist." });
        }

        if (!IsAdmin && project.OwnerId != CurrentUserId)
        {
            return Forbid();
        }

        if (request.AssigneeId.HasValue &&
            !await db.Users.AnyAsync(user => user.Id == request.AssigneeId.Value && user.IsActive))
        {
            return BadRequest(new { message = "Assignee does not exist or is inactive." });
        }

        var task = new ProjectTask
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Status = request.Status,
            DueDate = request.DueDate,
            ProjectId = request.ProjectId,
            AssigneeId = request.AssigneeId
        };

        db.Tasks.Add(task);
        db.ActivityLogs.Add(new ActivityLog
        {
            ProjectId = request.ProjectId,
            UserId = CurrentUserId,
            Message = $"Created task \"{task.Title}\"."
        });

        await db.SaveChangesAsync();
        task = await TaskQuery().SingleAsync(candidate => candidate.Id == task.Id);

        return CreatedAtAction(nameof(GetById), new { id = task.Id }, ToDto(task));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TaskDto>> Update(int id, UpdateTaskRequest request)
    {
        var task = await TaskQuery().SingleOrDefaultAsync(candidate => candidate.Id == id);
        if (task is null)
        {
            return NotFound();
        }

        if (!IsAdmin && task.Project!.OwnerId != CurrentUserId && task.AssigneeId != CurrentUserId)
        {
            return Forbid();
        }

        var destinationProject = await db.Projects.FindAsync(request.ProjectId);
        if (destinationProject is null)
        {
            return BadRequest(new { message = "Destination project does not exist." });
        }

        if (!IsAdmin && destinationProject.OwnerId != CurrentUserId)
        {
            // If moving to a project the user doesn't own, they must at least be an admin.
            // Assignees can update task details but shouldn't move tasks to projects they don't own.
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "You do not have permission to move tasks to this project." });
        }

        if (request.AssigneeId.HasValue &&
            !await db.Users.AnyAsync(user => user.Id == request.AssigneeId.Value && user.IsActive))
        {
            return BadRequest(new { message = "Assignee does not exist or is inactive." });
        }

        task.Title = request.Title.Trim();
        task.Description = request.Description.Trim();
        task.Status = request.Status;
        task.DueDate = request.DueDate;
        task.ProjectId = request.ProjectId;
        task.AssigneeId = request.AssigneeId;

        db.ActivityLogs.Add(new ActivityLog
        {
            ProjectId = request.ProjectId,
            UserId = CurrentUserId,
            Message = $"Updated task \"{task.Title}\"."
        });

        await db.SaveChangesAsync();
        task = await TaskQuery().SingleAsync(candidate => candidate.Id == task.Id);

        return Ok(ToDto(task));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await TaskQuery().SingleOrDefaultAsync(candidate => candidate.Id == id);
        if (task is null)
        {
            return NotFound();
        }

        if (!IsAdmin && task.Project!.OwnerId != CurrentUserId)
        {
            return Forbid();
        }

        db.Tasks.Remove(task);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private IQueryable<ProjectTask> TaskQuery() =>
        db.Tasks
            .Include(task => task.Project)
            .Include(task => task.Assignee)
            .Include(task => task.Comments);

    private bool CanAccessTask(ProjectTask task) =>
        IsAdmin ||
        task.AssigneeId == CurrentUserId ||
        task.Project?.OwnerId == CurrentUserId;
}
