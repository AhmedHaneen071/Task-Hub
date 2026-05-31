using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using TaskHub.Api.Dtos;
using TaskHub.Api.Models;

namespace TaskHub.Api.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

    protected bool IsAdmin => User.IsInRole(UserRoles.Admin);

    protected static UserSummaryDto ToSummary(AppUser user) =>
        new(user.Id, user.FullName, user.Email, user.Role, user.AvatarUrl);

    protected static UserDto ToDto(AppUser user) =>
        new(user.Id, user.FullName, user.Email, user.Role, user.AvatarUrl, user.IsActive, user.CreatedAt);

    protected static CategoryDto ToDto(Category category) =>
        new(category.Id, category.Name, category.Color, category.Description, category.Projects.Count);

    protected static ProjectDto ToDto(Project project)
    {
        var taskCount = project.Tasks.Count;
        var completedCount = project.Tasks.Count(task => task.Status == WorkTaskStatus.Done);

        return new ProjectDto(
            project.Id,
            project.Name,
            project.Description,
            project.Status.ToString(),
            project.Priority.ToString(),
            project.DueDate,
            project.CreatedAt,
            project.OwnerId,
            project.Owner?.FullName ?? "Unassigned",
            project.CategoryId,
            project.Category?.Name ?? "Uncategorized",
            project.Category?.Color ?? "#64748b",
            taskCount,
            completedCount);
    }

    protected static TaskDto ToDto(ProjectTask task) =>
        new(
            task.Id,
            task.Title,
            task.Description,
            task.Status.ToString(),
            task.DueDate,
            task.CreatedAt,
            task.ProjectId,
            task.Project?.Name ?? "Unknown project",
            task.AssigneeId,
            task.Assignee?.FullName,
            task.Comments.Count);

    protected static CommentDto ToDto(TaskComment comment) =>
        new(
            comment.Id,
            comment.Message,
            comment.CreatedAt,
            comment.TaskId,
            comment.Task?.Title ?? "Unknown task",
            comment.AuthorId,
            comment.Author?.FullName ?? "Unknown user");

    protected static ActivityDto ToDto(ActivityLog activity) =>
        new(
            activity.Id,
            activity.Message,
            activity.CreatedAt,
            activity.User?.FullName ?? "Unknown user");
}
