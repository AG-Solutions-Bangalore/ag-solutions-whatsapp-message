import Page from "@/app/dashboard/page";
import AssignDataDialog from "@/components/AssignDataDialog";
import LoaderComponent, {
  ErrorLoaderComponent,
} from "@/components/common/LoaderComponent";
import useApiToken from "@/components/common/UseToken";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import {
  ArrowUpDown,
  ChevronDown,
  Edit,
  MinusCircle,
  Search,
  Smartphone,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import CreateUserDialog from "../commonCreateDialog/CreateUserDialog";
import EditUserDialog from "../companyEditDialog/EditUserDialog";
import { useToast } from "@/hooks/use-toast";

const CompanyUserView = () => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const token = useApiToken();
  const user_Type = useSelector((state) => state.auth.user_type);
  const { toast } = useToast();
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeUserId, setRemoveUserId] = useState(null);
  const [deviceAlertOpen, setDeviceAlertOpen] = useState(false);
  const [selectedDeviceUser, setSelectedDeviceUser] = useState(null);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-company-by-id/1`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
  });

  // State for users table
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const handleRemoveAssignData = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/panel-remove-user-assign-data`,
        { user_id: removeUserId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res?.data?.code === 200) {
        toast({
          title: "Success",
          description: res.data.msg || "Assigned data removed successfully",
        });
        setRemoveOpen(false);
        refetch();
      } else {
        throw new Error(res?.data?.msg);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove assigned data",
        variant: "destructive",
      });
    }
  };
  const openDeviceAlert = (user) => {
    setSelectedDeviceUser(user);
    setDeviceAlertOpen(true);
  };
  const handleRemoveDevice = async () => {
    if (!selectedDeviceUser) return;

    try {
      const res = await axios.put(
        `${BASE_URL}/api/panel-remove-user-device/${selectedDeviceUser.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res?.data?.code === 200) {
        toast({
          title: "Success",
          description:
            res.data.msg || `Device removed for ${selectedDeviceUser.name}`,
        });
        setDeviceAlertOpen(false);
        refetch();
      } else {
        throw new Error(res?.data?.msg);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove device",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      id: "slNo",
      header: "Sl No",
      cell: ({ row, table }) => (
        <div>
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            row.index +
            1}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "mobile",
      header: "Mobile",
      cell: ({ row }) => <div>{row.getValue("mobile")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      id: "device",
      header: "Device",
      cell: ({ row }) => {
        const user = row.original;
        const hasDevice = !!user.device_id;

        return hasDevice ? (
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center justify-center gap-1 w-28 px-3 py-1 bg-green-100 text-green-500 rounded-full hover:bg-green-200"
            onClick={() => openDeviceAlert(user)}
          >
            <Smartphone className="h-4 w-4" />
            <span className="text-xs font-medium">Remove</span>
          </Button>
        ) : (
          <span className="flex items-center justify-center gap-1 w-28 px-3 py-1 bg-red-400 text-white text-xs font-medium rounded-full">
            <Smartphone className="h-4 w-4" />
            No Device
          </span>
        );
      },
    },

    {
      header: "Total / Pending",
      cell: ({ row }) => {
        const total = row.original.total_count;
        const pending = row.original.pending_count;

        return (
          <span className="text-sm text-gray-900">
            {total} / {pending}
          </span>
        );
      },
    },
    {
      accessorKey: "user_type",
      header: "User Type",
      cell: ({ row }) => {
        const userType = row.getValue("user_type");
        let label, color;

        switch (userType) {
          case 1:
            label = "User";
            color = "bg-red-500 text-white";
            break;
          case 2:
            label = "Admin";
            color = "bg-blue-500 text-white";
            break;
          default:
            label = "Unknown";
            color = "bg-gray-400 text-white";
        }

        return (
          <Badge className={`px-2 py-1 rounded-md ${color}`}>{label}</Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");
        return (
          <span
            className={status === "Active" ? "text-green-600" : "text-red-600"}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const user = row.original;
        const pending = row.original.pending_count;

        return (
          <div className="flex flex-row gap-1">
            {Number(user_Type) !== 1 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit User</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setAssignUserId(user.id);
                      setAssignOpen(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Assign Data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {pending > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setRemoveUserId(user.id);
                        setRemoveOpen(true);
                      }}
                    >
                      <UserMinus className="h-4 w-4 text-red-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove Assigned Data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
    },
  ];

  // Create the table instance for users
  const table = useReactTable({
    data: data?.user || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Handle opening edit dialog
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  // Render loading state
  if (isLoading) {
    return (
      <Page>
        <LoaderComponent data={"User Data"} />
      </Page>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Page>
        <ErrorLoaderComponent data="User Data" onClick={() => refetch()} />
      </Page>
    );
  }
  const company = data?.company;
  return (
    <Page>
      <div className="w-full p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl text-gray-800 font-[400]">User Details</div>
        </div>

        <Card className="mb-4">
          <CardHeader className="py-3">
            <CardTitle className="text-lg">{company.company_name}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 py-2">
            <div>
              <p className="text-xs text-gray-500">Company Sort</p>
              <p className="font-medium text-sm">{company.company_type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Mobile</p>
              <p className="font-medium text-sm">{company.company_mobile}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium text-sm">{company.company_email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p
                className={`font-medium text-sm ${
                  company.company_status === "Active"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {company.company_status}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User List Section */}
        <div className="mt-8">
          <div className="text-xl text-gray-800 font-[400] mb-4">User List</div>

          {/* Search and column filter */}
          <div className="flex items-center py-4">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search users..."
                value={globalFilter || ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            {company.company_no_of_user > company.no_of_user_exist && (
              <CreateUserDialog onSuccess={refetch} />
            )}
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          className={`${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Total: {table.getFilteredRowModel().rows.length}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* Edit User Dialog Component */}
        <EditUserDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          selectedUser={selectedUser}
          onSuccess={refetch}
        />
        <AssignDataDialog
          open={assignOpen}
          onOpenChange={setAssignOpen}
          userId={assignUserId}
          onSuccess={refetch}
        />
        <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Assigned Data?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will remove all assigned data for this user. This
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={handleRemoveAssignData}
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={deviceAlertOpen} onOpenChange={setDeviceAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Device?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the assigned device for{" "}
                <b>{selectedDeviceUser?.name}</b>. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={handleRemoveDevice}
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Page>
  );
};

export default CompanyUserView;
