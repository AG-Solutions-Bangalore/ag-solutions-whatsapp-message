import Page from "@/app/dashboard/page";
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
import { useState } from "react";
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
import { ArrowUpDown, ChevronDown, Edit, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ButtonConfig } from "@/config/ButtonConfig";
import LoaderComponent, {
  ErrorLoaderComponent,
} from "@/components/common/LoaderComponent";
import useApiToken from "@/components/common/UseToken";
import { useToast } from "@/hooks/use-toast";

const Pipeline = () => {
  const token = useApiToken();
  const navigate = useNavigate();

  // State for table
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  // Fetch pipeline list
  const {
    data: pipelines,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-pipeline-list`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data.data;
    },
  });

  // Columns
  const columns = [
    {
      id: "slNo",
      header: "Sl.no",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "pipeline_name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting()}>
          Pipeline Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("pipeline_name")}</div>,
    },
    {
      id: "subs_count",
      header: "Details Count",
      cell: ({ row }) => {
        const count = row.original.subs_count || 0;
        return <span>{count}</span>;
      },
    },
    {
      accessorKey: "pipeline_status",
      header: "Status",
      cell: ({ row }) => <div>{row.getValue("pipeline_status")}</div>,
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const pipeline = row.original;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/edit-pipeline/${pipeline.id}`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Pipeline</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
  ];

  const table = useReactTable({
    data: pipelines || [],
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
        <LoaderComponent data="Pipeline Data" />
      </Page>
    );
  if (isError)
    return (
      <Page>
        <ErrorLoaderComponent data="Pipeline List" onClick={refetch} />
      </Page>
    );

  return (
    <Page>
      <div className="w-full p-4">
        <div className="flex text-left text-2xl text-gray-800 font-[400] mb-4">
          Pipeline List
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search pipeline..."
              value={table.getState().globalFilter || ""}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((c) => c.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      checked={col.getIsVisible()}
                      onCheckedChange={(v) => col.toggleVisibility(!!v)}
                    >
                      {col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
              onClick={() => navigate("/add-pipeline")}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Pipeline
            </Button>
          </div>
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
                      className={ButtonConfig.tableHeader}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
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
                    No pipelines found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Total Pipelines: {table.getFilteredRowModel().rows.length}
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
    </Page>
  );
};

export default Pipeline;
