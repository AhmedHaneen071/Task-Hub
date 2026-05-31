namespace TaskHub.Api.Models;

public sealed class Category
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Color { get; set; }
    public string? Description { get; set; }

    public ICollection<Project> Projects { get; set; } = new List<Project>();
}
