namespace TaskHub.Api.Dtos;

public sealed record DashboardDto(
    int TotalProjects,
    int ActiveProjects,
    int OpenTasks,
    int CompletedTasks,
    IReadOnlyCollection<ProjectDto> PriorityProjects,
    IReadOnlyCollection<TaskDto> MyTasks,
    IReadOnlyCollection<ActivityDto> RecentActivity);
