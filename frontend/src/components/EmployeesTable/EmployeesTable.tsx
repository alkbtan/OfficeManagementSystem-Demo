import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { ChipProps } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { Employee } from "../../services/employeeService";

interface EmployeesTableProps {
  rows: Employee[];
}

const columns: GridColDef[] = [
  {
    field: "employee",
    headerName: "Employee",
    flex: 1.5,
    minWidth: 260,
    renderCell: (params) => (
      <Stack direction="row" spacing={2} alignItems="center" height="100%">
        <Avatar sx={{ bgcolor: "primary.main" }}>
          {params.row.firstName.charAt(0)}
        </Avatar>
        <Box>
          <Typography fontWeight="bold">
            {params.row.firstName} {params.row.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {params.row.email}
          </Typography>
        </Box>
      </Stack>
    ),
  },
  {
    field: "department",
    headerName: "Department",
    flex: 1,
  },
  {
    field: "status",
    headerName: "Status",
    width: 150,
    renderCell: (params) => {
      const color: ChipProps["color"] =
        params.value === "Active" ? "success" : "error";
      return <Chip label={params.value} color={color} size="small" />;
    },
  },
  {
    field: "createdAt",
    headerName: "Created",
    width: 170,
    valueGetter: (_, row) => new Date(row.createdAt).toLocaleDateString(),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 150,
    sortable: false,
    renderCell: () => (
      <Stack direction="row" spacing={1}>
        <Tooltip title="View">
          <IconButton color="info">
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton color="primary">
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
  },
];

function EmployeesTable({ rows }: EmployeesTableProps) {
  return (
    <Box sx={{ height: 650, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[5, 10, 20]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        disableRowSelectionOnClick
        sx={{
          border: 0,
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f5f5f5",
            fontSize: 15,
            fontWeight: "bold",
          },
          "& .MuiDataGrid-cell": {
            alignItems: "center",
          },
        }}
      />
    </Box>
  );
}

export default EmployeesTable;