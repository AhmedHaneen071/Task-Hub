using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskHub.Api.Data;
using TaskHub.Api.Dtos;
using TaskHub.Api.Models;

namespace TaskHub.Api.Controllers;

[Authorize]
[Route("api/dashboard")]
public sealed class DashboardController(ApplicationDbContext db) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DashboardDto>> Get()
    {
        var projectQuery = db.Projects.AsQueryable();
        var taskQuery = db.Tasks.AsQueryable();

        if (!IsAdmin)
        {
            projectQuery = projectQuery.Where(project =>
                project.OwnerId == CurrentUserId ||
                project.Tasks.Any(task => task.AssigneeId == CurrentUserId));

            taskQuery = taskQuery.Where(task =>
                task.AssigneeId == CurrentUserId ||
                task.Project!.OwnerId == CurrentUserId);
        }

        var totalProjects = await projectQuery.CountAsync();
        var activeProjects = await projectQuery.CountAsync(project => project.Status == ProjectStatus.Active);
        var openTasks = await taskQuery.CountAsync(task => task.Status != WorkTaskStatus.Done);
        var completedTasks = await taskQuery.CountAsync(task => task.Status == WorkTaskStatus.Done);

        var priorityProjects = await projectQuery
            .Include(p => p.Owner)
            .Include(p => p.Category)
            .Include(p => p.Tasks)
            .OrderByDescending(project => project.Priority)
            .ThenBy(project => project.DueDate ?? DateTime.MaxValue)
            .Take(4)
            .ToListAsync();

        var myTasks = await taskQuery
            .Include(t => t.Project)
            .Include(t => t.Assignee)
            .Include(t => t.Comments)
            .OrderBy(task => task.DueDate ?? DateTime.MaxValue)
            .Take(6)
            .ToListAsync();

        var projectIds = await projectQuery.Select(p => p.Id).ToListAsync();

        var activity = await db.ActivityLogs
            .Include(item => item.User)
            .Where(item => projectIds.Contains(item.ProjectId))
            .OrderByDescending(item => item.CreatedAt)
            .Take(8)
            .ToListAsync();

        var response = new DashboardDto(
            totalProjects,
            activeProjects,
            openTasks,
            completedTasks,
            priorityProjects.Select(ToDto).ToList(),
            myTasks.Select(ToDto).ToList(),
            activity.Select(ToDto).ToList());

        return Ok(response);
    }
}
