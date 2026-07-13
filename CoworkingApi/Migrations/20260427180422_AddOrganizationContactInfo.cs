using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoworkingApi.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizationContactInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Website",
                table: "Organizations",
                newName: "ContactInfo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ContactInfo",
                table: "Organizations",
                newName: "Website");
        }
    }
}
