using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskHub.Api.Data;
using TaskHub.Api.Dtos;
using TaskHub.Api.Models;

namespace TaskHub.Api.Controllers;

[Authorize]
[Route("api/comments")]
public sealed class CommentsController(ApplicationDbContext db) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<CommentDto>>> GetAll([FromQuery] int? taskId)
    {
        var query = CommentQuery();

        if (taskId.HasValue)
        {
            query = query.Where(comment => comment.TaskId == taskId.Value);
        }

        if (!IsAdmin)
        {
            query = query.Where(comment =>
                comment.AuthorId == CurrentUserId ||
                comment.Task!.AssigneeId == CurrentUserId ||
                comment.Task.Project!.OwnerId == CurrentUserId);
        }

        var comments = await query
            .OrderByDescending(comment => comment.CreatedAt)
            .ToListAsync();

        return Ok(comments.Select(ToDto).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CommentDto>> GetById(int id)
    {
        var comment = await CommentQuery().SingleOrDefaultAsync(candidate => candidate.Id == id);
        if (comment is null)
        {
            return NotFound();
        }

        if (!CanAccessComment(comment))
        {
            return Forbid();
        }

        return Ok(ToDto(comment));
    }

    [HttpPost]
    public async Task<ActionResult<CommentDto>> Create(CreateCommentRequest request)
    {
        var task = await db.Tasks
            .Include(candidate => candidate.Project)
            .SingleOrDefaultAsync(candidate => candidate.Id == request.TaskId);

        if (task is null)
        {
            return BadRequest(new { message = "Task does not exist." });
        }

        if (!IsAdmin && task.Project!.OwnerId != CurrentUserId && task.AssigneeId != CurrentUserId)
        {
            return Forbid();
        }

        var authorId = IsAdmin && request.AuthorId.HasValue ? request.AuthorId.Value : CurrentUserId;
        if (!await db.Users.AnyAsync(user => user.Id == authorId && user.IsActive))
        {
            return BadRequest(new { message = "Author does not exist or is inactive." });
        }

        var comment = new TaskComment
        {
            Message = request.Message.Trim(),
            TaskId = request.TaskId,
            AuthorId = authorId
        };

        db.Comments.Add(comment);
        db.ActivityLogs.Add(new ActivityLog
        {
            ProjectId = task.ProjectId,
            UserId = CurrentUserId,
            Message = $"Commented on task \"{task.Title}\"."
        });

        await db.SaveChangesAsync();
        comment = await CommentQuery().SingleAsync(candidate => candidate.Id == comment.Id);

        return CreatedAtAction(nameof(GetById), new { id = comment.Id }, ToDto(comment));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CommentDto>> Update(int id, UpdateCommentRequest request)
    {
        var comment = await CommentQuery().SingleOrDefaultAsync(candidate => candidate.Id == id);
        if (comment is null)
        {
            return NotFound();
        }

        if (!IsAdmin && comment.AuthorId != CurrentUserId)
        {
            return Forbid();
        }

        comment.Message = request.Message.Trim();
        await db.SaveChangesAsync();

        return Ok(ToDto(comment));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var comment = await CommentQuery().SingleOrDefaultAsync(candidate => candidate.Id == id);
        if (comment is null)
        {
            return NotFound();
        }

        if (!IsAdmin && comment.AuthorId != CurrentUserId)
        {
            return Forbid();
        }

        db.Comments.Remove(comment);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private IQueryable<TaskComment> CommentQuery() =>
        db.Comments
            .Include(comment => comment.Author)
            .Include(comment => comment.Task)
                .ThenInclude(task => task!.Project);

    private bool CanAccessComment(TaskComment comment) =>
        IsAdmin ||
        comment.AuthorId == CurrentUserId ||
        comment.Task?.AssigneeId == CurrentUserId ||
        comment.Task?.Project?.OwnerId == CurrentUserId;
}
