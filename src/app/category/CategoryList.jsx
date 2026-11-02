import Page from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Eye,
  Plus,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ButtonConfig } from "@/config/ButtonConfig";
import LoaderComponent, {
  ErrorLoaderComponent,
} from "@/components/common/LoaderComponent";
import useApiToken from "@/components/common/UseToken";
import { encryptId } from "@/components/common/Encryption";
import { useToast } from "@/hooks/use-toast";
import EditUserDialog from "./CategoryEditDialog/EditUserDialog";
import { useState, useEffect } from "react";


// --- CreateBranchDialog Component ---
const CreateBranchDialog = ({ open, onOpenChange, onSuccess }) => {
  const token = useApiToken();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [branchName, setBranchName] = useState("");


  const handleSubmit = async () => {
  // Validate Category Name
  if (!branchName.trim()) {
    toast({
      title: "Error",
      description: "Category name is required.",
      variant: "destructive",
    });
    return;
  }
  setIsLoading(true);

  try {
    const response = await axios.post(
      `${BASE_URL}/api/panel-create-branch`,
      {
        branch_name: branchName.trim(),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response?.data?.code === 200) {
      toast({
        title: "Success",
        description:
          response?.data?.msg || "Category created successfully!",
      });

      // Reset Form
      setBranchName("");
        onOpenChange(false);

      if (onSuccess) onSuccess();
    } else {
      throw new Error(
        response?.data?.msg || "Failed to create category."
      );
    }
  } catch (error) {
    toast({
      title: "Error",
      description:
        error.response?.data?.msg || "Failed to create category.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="branchName">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="branchName"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="Enter Category Name"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            loading={isLoading}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {isLoading ? "Creating..." : "Create Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Main CategoryList Component ---
const CategoryList = () => {
  const token = useApiToken();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Data fetching
  const {
    data: branches,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["Branches"],
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-branch-list`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data.data;
    },
  });

  // Table state
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Columns definition
  const columns = [
    {
      id: "slNo",
      header: "Sl.no",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "branch_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("branch_name")}</div>,
    },
    {
      accessorKey: "branch_status",
      header: "Status",
      cell: ({ row }) => <div>{row.getValue("branch_status")}</div>,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const viewId = row.original.id;
        const user = row.original;
        return (
          <div className="flex flex-row">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedUser(user);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Category</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: branches || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading)
    return (
      <Page>
        <LoaderComponent data={"Branch Data"} />
      </Page>
    );

  if (isError)
    return (
      <Page>
        <ErrorLoaderComponent
          data="Branch List Data"
          onClick={() => refetch()}
        />
      </Page>
    );

  return (
    <Page>
      <div className="w-full p-4">
        <div className="flex text-left text-2xl text-gray-800 font-[400]">
          Category List
        </div>

        {/* Toolbar: Search, Columns, Add Branch */}
        <div className="flex items-center py-4 gap-4 flex-wrap">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search Category..."
              value={table.getState().globalFilter || ""}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
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
                .map((column) => (
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
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
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
                  ))}
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
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Total Category: {table.getFilteredRowModel().rows.length}
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

      {/* Edit Dialog */}
      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        selectedUser={selectedUser}
        onSuccess={refetch}
      />

      {/* Create Branch Dialog */}
      <CreateBranchDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refetch}
      />
    </Page>
  );
};

export default CategoryList;
