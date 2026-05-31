using System.Security.Cryptography;

namespace TaskHub.Api.Services;

public sealed class PasswordService : IPasswordService
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int DefaultIterations = 100_000;

    public string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            DefaultIterations,
            HashAlgorithmName.SHA256,
            HashSize);

        return $"pbkdf2:{DefaultIterations}:{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
    }

    public bool VerifyPassword(string password, string storedHash)
    {
        var parts = storedHash.Split(':');
        if (parts.Length != 4 || parts[0] != "pbkdf2")
        {
            return false;
        }

        if (!int.TryParse(parts[1], out var iterations))
        {
            return false;
        }

        var salt = Convert.FromBase64String(parts[2]);
        var expectedHash = Convert.FromBase64String(parts[3]);
        var actualHash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            iterations,
            HashAlgorithmName.SHA256,
            expectedHash.Length);

        return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
    }
}
