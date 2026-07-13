using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using CoworkingApi.Services;

namespace CoworkingApi.Data;

public class EncryptedStringConverter : ValueConverter<string?, string?>
{
    public EncryptedStringConverter(IEncryptionService enc)
        : base(
            v => enc.Encrypt(v),
            v => enc.Decrypt(v)
        )
    { }
}