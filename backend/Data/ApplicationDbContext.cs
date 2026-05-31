using Microsoft.EntityFrameworkCore;
using TaskHub.Api.Models;

namespace TaskHub.Api.Data;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectTask> Tasks => Set<ProjectTask>();
    public DbSet<TaskComment> Comments => Set<TaskComment>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.ToTable("AppUsers");
            entity.HasIndex(user => user.Email).IsUnique();
            entity.Property(user => user.FullName).HasMaxLength(120);
            entity.Property(user => user.Email).HasMaxLength(180);
            entity.Property(user => user.Role).HasMaxLength(30);
            entity.Property(user => user.AvatarUrl).HasMaxLength(500);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.Property(category => category.Name).HasMaxLength(80);
            entity.Property(category => category.Color).HasMaxLength(20);
            entity.Property(category => category.Description).HasMaxLength(300);
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.Property(project => project.Name).HasMaxLength(140);
            entity.Property(project => project.Description).HasMaxLength(1000);
            entity.Property(project => project.Status).HasConversion<string>().HasMaxLength(30);
            entity.Property(project => project.Priority).HasConversion<string>().HasMaxLength(30);

            entity.HasOne(project => project.Owner)
                .WithMany(user => user.OwnedProjects)
                .HasForeignKey(project => project.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(project => project.Category)
                .WithMany(category => category.Projects)
                .HasForeignKey(project => project.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ProjectTask>(entity =>
        {
            entity.ToTable("ProjectTasks");
            entity.Property(task => task.Title).HasMaxLength(160);
            entity.Property(task => task.Description).HasMaxLength(1000);
            entity.Property(task => task.Status).HasConversion<string>().HasMaxLength(30);

            entity.HasOne(task => task.Project)
                .WithMany(project => project.Tasks)
                .HasForeignKey(task => task.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(task => task.Assignee)
                .WithMany(user => user.AssignedTasks)
                .HasForeignKey(task => task.AssigneeId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<TaskComment>(entity =>
        {
            entity.Property(comment => comment.Message).HasMaxLength(1200);

            entity.HasOne(comment => comment.Task)
                .WithMany(task => task.Comments)
                .HasForeignKey(comment => comment.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(comment => comment.Author)
                .WithMany(user => user.Comments)
                .HasForeignKey(comment => comment.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ActivityLog>(entity =>
        {
            entity.Property(activity => activity.Message).HasMaxLength(500);

            entity.HasOne(activity => activity.Project)
                .WithMany(project => project.Activities)
                .HasForeignKey(activity => activity.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(activity => activity.User)
                .WithMany(user => user.Activities)
                .HasForeignKey(activity => activity.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
