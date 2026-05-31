using Microsoft.EntityFrameworkCore;
using TaskHub.Api.Models;
using TaskHub.Api.Services;

namespace TaskHub.Api.Data;

public sealed class DatabaseSeeder(ApplicationDbContext db, IPasswordService passwordService) : IDatabaseSeeder
{
    public async Task SeedAsync()
    {
        if (await db.Users.AnyAsync())
        {
            return;
        }

        var admin = new AppUser
        {
            FullName = "Admin User",
            Email = "admin@taskhub.local",
            PasswordHash = passwordService.HashPassword("Admin123!"),
            Role = UserRoles.Admin,
            AvatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80"
        };

        var maya = new AppUser
        {
            FullName = "Maya Khan",
            Email = "maya@taskhub.local",
            PasswordHash = passwordService.HashPassword("User123!"),
            Role = UserRoles.User,
            AvatarUrl = "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=160&q=80"
        };

        var alex = new AppUser
        {
            FullName = "Alex Reed",
            Email = "alex@taskhub.local",
            PasswordHash = passwordService.HashPassword("User123!"),
            Role = UserRoles.User,
            AvatarUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80"
        };

        var categories = new[]
        {
            new Category { Name = "Product", Color = "#2563eb", Description = "Customer-facing product work" },
            new Category { Name = "Operations", Color = "#16a34a", Description = "Internal process and delivery work" },
            new Category { Name = "Research", Color = "#f97316", Description = "Discovery, analysis, and validation" }
        };

        var portal = new Project
        {
            Name = "Client Portal Refresh",
            Description = "Modernize the customer portal with faster task tracking and searchable activity history.",
            Status = ProjectStatus.Active,
            Priority = ProjectPriority.High,
            DueDate = DateTime.UtcNow.AddDays(30),
            Owner = maya,
            Category = categories[0]
        };

        var onboarding = new Project
        {
            Name = "Partner Onboarding Playbook",
            Description = "Build a repeatable onboarding workflow with document checks, approvals, and handoff notes.",
            Status = ProjectStatus.Planning,
            Priority = ProjectPriority.Medium,
            DueDate = DateTime.UtcNow.AddDays(45),
            Owner = alex,
            Category = categories[1]
        };

        var dashboardTask = new ProjectTask
        {
            Title = "Ship dashboard API",
            Description = "Expose project counts, open tasks, and recent activity for the Angular dashboard.",
            Status = WorkTaskStatus.InProgress,
            DueDate = DateTime.UtcNow.AddDays(7),
            Project = portal,
            Assignee = maya
        };

        var filterTask = new ProjectTask
        {
            Title = "Design activity filters",
            Description = "Create searchable filters for project events and task discussions.",
            Status = WorkTaskStatus.Review,
            DueDate = DateTime.UtcNow.AddDays(10),
            Project = portal,
            Assignee = alex
        };

        var checklistTask = new ProjectTask
        {
            Title = "Draft kickoff checklist",
            Description = "Create a standard checklist for every new partner implementation.",
            Status = WorkTaskStatus.ToDo,
            DueDate = DateTime.UtcNow.AddDays(12),
            Project = onboarding,
            Assignee = alex
        };

        db.Users.AddRange(admin, maya, alex);
        db.Categories.AddRange(categories);
        db.Projects.AddRange(portal, onboarding);
        db.Tasks.AddRange(dashboardTask, filterTask, checklistTask);

        db.Comments.Add(new TaskComment
        {
            Message = "Initial endpoint contract is ready for frontend integration.",
            Task = dashboardTask,
            Author = maya
        });

        db.ActivityLogs.AddRange(
            new ActivityLog { Project = portal, User = maya, Message = "Created project roadmap and assigned first tasks." },
            new ActivityLog { Project = onboarding, User = alex, Message = "Added onboarding milestones for operations review." });

        await db.SaveChangesAsync();
    }
}
