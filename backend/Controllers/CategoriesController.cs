using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskHub.Api.Data;
using TaskHub.Api.Dtos;
using TaskHub.Api.Models;

namespace TaskHub.Api.Controllers;

[Authorize]
[Route("api/categories")]
public sealed class CategoriesController(ApplicationDbContext db) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<CategoryDto>>> GetAll()
    {
        var categories = await db.Categories
            .Include(category => category.Projects)
            .OrderBy(category => category.Name)
            .ToListAsync();

        return Ok(categories.Select(ToDto).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryDto>> GetById(int id)
    {
        var category = await db.Categories
            .Include(candidate => candidate.Projects)
            .SingleOrDefaultAsync(candidate => candidate.Id == id);

        return category is null ? NotFound() : Ok(ToDto(category));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<CategoryDto>> Create(CreateCategoryRequest request)
    {
        var category = new Category
        {
            Name = request.Name.Trim(),
            Color = request.Color,
            Description = request.Description?.Trim()
        };

        db.Categories.Add(category);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = category.Id }, ToDto(category));
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<CategoryDto>> Update(int id, UpdateCategoryRequest request)
    {
        var category = await db.Categories
            .Include(candidate => candidate.Projects)
            .SingleOrDefaultAsync(candidate => candidate.Id == id);

        if (category is null)
        {
            return NotFound();
        }

        category.Name = request.Name.Trim();
        category.Color = request.Color;
        category.Description = request.Description?.Trim();

        await db.SaveChangesAsync();
        return Ok(ToDto(category));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var category = await db.Categories
            .Include(candidate => candidate.Projects)
            .SingleOrDefaultAsync(candidate => candidate.Id == id);

        if (category is null)
        {
            return NotFound();
        }

        if (category.Projects.Count > 0)
        {
            return Conflict(new { message = "Move or delete projects before deleting this category." });
        }

        db.Categories.Remove(category);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
