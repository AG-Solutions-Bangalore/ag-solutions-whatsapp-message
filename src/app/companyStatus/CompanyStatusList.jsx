import Page from "@/app/dashboard/page";
import LoaderComponent, {
  ErrorLoaderComponent,
} from "@/components/common/LoaderComponent";
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
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
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
import { ChevronDown, Loader2, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateCompanyStatus from "./CreateCompanyStatus";
import useApiToken from "@/components/common/UseToken";
import { useSelector } from "react-redux";

const CompanyStatusList = () => {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const token = useApiToken();

  const {
    data: companyStatus,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["companyStatus"],
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-company-status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.companyStatus;
    },
  });

  // Handle delete function
  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/panel-delete-company-status/${deleteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data?.code === 200) {
        toast({
          title: "Success",
          description:
            response?.data?.msg || "Company status deleted successfully",
        });

        await refetch();
      } else if (response?.data?.code === 400) {
        toast({
          title: "Error",
          description: response?.data?.msg || "Duplicate status!",
          variant: "destructive",
        });
      } else {
        throw new Error(
          response?.data?.msg || "Failed to delete Company status."
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete company status",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  // State for table management
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const user_Type = useSelector((state) => state.auth.user_type);

  // Define columns for the table
  const columns = [
    {
      accessorKey: "index",
      header: "Sl.no",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "companyStatus",
      header: "Company Status",
      cell: ({ row }) => <div>{row.getValue("companyStatus")}</div>,
    },
    ...(Number(user_Type) !== 1
      ? [
          {
            id: "actions",
            header: "Action",
            cell: ({ row }) => {
              const companyStatusId = row.original.id;

              return (
                <div className="flex flex-row">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteId(companyStatusId);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="text-red-500 w-5 h-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Company Status</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );
            },
          },
        ]
      : []),
  ];

  // Create the table instance
  const table = useReactTable({
    data: companyStatus || [],
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
    },
    initialState: {
      pagination: {
        pageSize: 12,
      },
    },
  });

  if (isLoading) {
    return (
      <Page>
        <LoaderComponent data={"Company Status"} />
      </Page>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Page>
        <ErrorLoaderComponent data="Company Status" onClick={() => refetch()} />
      </Page>
    );
  }

  return (
    <Page>
      <div className="w-full p-0 md:p-4 grid grid-cols-1">
        <div className="flex text-left text-2xl text-gray-800 font-[400]">
          Company Status List
        </div>

        <div className="flex flex-col md:flex-row md:items-center py-4 gap-2">
          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search company status..."
              value={table.getState().globalFilter || ""}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full"
            />
          </div>

          {/* Dropdown Menu & Create Button */}
          <div className="flex flex-col md:flex-row md:ml-auto gap-2 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
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
            {Number(user_Type) !== 1 && <CreateCompanyStatus />}
          </div>
        </div>

        {/* table */}
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
                            header.getContext()
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
                          cell.getContext()
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

        {/* row selection and pagination button */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Total Company Status: &nbsp;
            {table.getFilteredRowModel().rows.length}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected company status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              loading={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? <>Deleting...</> : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
};

export default CompanyStatusList;
