namespace TaskHub.Api.Dtos;

public sealed record DashboardDto(
    int TotalProjects,
    int ActiveProjects,
    int OpenTasks,
    int CompletedTasks,
    TaskStatusDistribution StatusDistribution,
    IReadOnlyCollection<ProjectDto> PriorityProjects,
    IReadOnlyCollection<TaskDto> MyTasks,
    IReadOnlyCollection<ActivityDto> RecentActivity);

public sealed record TaskStatusDistribution(
    int ToDo,
    int InProgress,
    int Review,
    int Done);
