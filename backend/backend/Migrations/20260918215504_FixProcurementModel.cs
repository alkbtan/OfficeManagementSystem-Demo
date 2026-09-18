using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OfficeManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class FixProcurementModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Vendor",
                table: "ProcurementRequests",
                newName: "RequesterName");

            migrationBuilder.RenameColumn(
                name: "TotalAmount",
                table: "ProcurementRequests",
                newName: "UnitPrice");

            migrationBuilder.RenameColumn(
                name: "Requester",
                table: "ProcurementRequests",
                newName: "Project");

            migrationBuilder.RenameColumn(
                name: "RequestDate",
                table: "ProcurementRequests",
                newName: "FormDate");

            migrationBuilder.RenameColumn(
                name: "Items",
                table: "ProcurementRequests",
                newName: "TicketLink");

            migrationBuilder.RenameColumn(
                name: "ApprovedDate",
                table: "ProcurementRequests",
                newName: "PurchaseDeadline");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "ProcurementRequests",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Collecting Information",
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldDefaultValue: "Pending");

            migrationBuilder.AlterColumn<string>(
                name: "ApprovedBy",
                table: "ProcurementRequests",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovalDate",
                table: "ProcurementRequests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApprovalDocumentPath",
                table: "ProcurementRequests",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "BoletoDueDate",
                table: "ProcurementRequests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BoletoFilePath",
                table: "ProcurementRequests",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BriefDescription",
                table: "ProcurementRequests",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Classification",
                table: "ProcurementRequests",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpectedDeliveryDate",
                table: "ProcurementRequests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Floor",
                table: "ProcurementRequests",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "InvoiceNumber",
                table: "ProcurementRequests",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Item",
                table: "ProcurementRequests",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ItemId",
                table: "ProcurementRequests",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "PaymentDate",
                table: "ProcurementRequests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "ProcurementRequests",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PaymentReceiptPath",
                table: "ProcurementRequests",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ProductLink",
                table: "ProcurementRequests",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PurchaseDataFilePath",
                table: "ProcurementRequests",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                table: "ProcurementRequests",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Responsible",
                table: "ProcurementRequests",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "ShippingCost",
                table: "ProcurementRequests",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Supplier",
                table: "ProcurementRequests",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Total",
                table: "ProcurementRequests",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovalDate",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "ApprovalDocumentPath",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "BoletoDueDate",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "BoletoFilePath",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "BriefDescription",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "Classification",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "ExpectedDeliveryDate",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "Floor",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "InvoiceNumber",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "Item",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "ItemId",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "PaymentDate",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "PaymentReceiptPath",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "ProductLink",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "PurchaseDataFilePath",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "Responsible",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "ShippingCost",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "Supplier",
                table: "ProcurementRequests");

            migrationBuilder.DropColumn(
                name: "Total",
                table: "ProcurementRequests");

            migrationBuilder.RenameColumn(
                name: "UnitPrice",
                table: "ProcurementRequests",
                newName: "TotalAmount");

            migrationBuilder.RenameColumn(
                name: "TicketLink",
                table: "ProcurementRequests",
                newName: "Items");

            migrationBuilder.RenameColumn(
                name: "RequesterName",
                table: "ProcurementRequests",
                newName: "Vendor");

            migrationBuilder.RenameColumn(
                name: "PurchaseDeadline",
                table: "ProcurementRequests",
                newName: "ApprovedDate");

            migrationBuilder.RenameColumn(
                name: "Project",
                table: "ProcurementRequests",
                newName: "Requester");

            migrationBuilder.RenameColumn(
                name: "FormDate",
                table: "ProcurementRequests",
                newName: "RequestDate");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "ProcurementRequests",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Pending",
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldDefaultValue: "Collecting Information");

            migrationBuilder.AlterColumn<string>(
                name: "ApprovedBy",
                table: "ProcurementRequests",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);
        }
    }
}
