using TaskHub.Api.Models;

namespace TaskHub.Api.Services;

public interface IJwtTokenService
{
    string CreateToken(AppUser user);
}
