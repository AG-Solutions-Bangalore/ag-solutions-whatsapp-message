import LoaderComponent, {
  ErrorLoaderComponent,
} from "@/components/common/LoaderComponent";
import useApiToken from "@/components/common/UseToken";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { CalendarClock, Edit, Phone, Search } from "lucide-react";
import React, { useState } from "react";
import Page from "../dashboard/page";
import FollowupDialog from "../uploadData/FollowupDialog";
import FollowupStatusDialog from "./FollowupStatusDialog";

const PendingFollowUp = () => {
  const [activeTab, setActiveTab] = useState("Pending");
  const [followupStatusId, setFollowupStatusId] = useState(null);
  const [followupId, setFollowupId] = useState(null);
  const [followupDialogOpen, setFollowupDialogOpen] = useState(false);
  const [followupsStatusDialogOpen, setFollowupStatusDialogOpen] =
    useState(false);
  const [currentStatus, setCurrentStatus] = useState("");

  const token = useApiToken();

  const {
    data: uploadData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["uploadData"],
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-upload-data`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
  });

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const filteredData = React.useMemo(() => {
    if (!uploadData?.dataUpload || activeTab === "all") {
      return uploadData?.dataUpload || [];
    }
    return uploadData.dataUpload.filter(
      (item) => item.data_status === activeTab,
    );
  }, [uploadData, activeTab]);

  const columns = [
    {
      accessorKey: "index",
      header: "Sl.No",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },

    {
      accessorKey: "mobile_no", // keep as is, but we'll override display
      header: "Mobile Number",
      cell: ({ row }) => {
        // Get both values from the row data
        const originalMobile = row.getValue("mobile_no");
        const newMobile = row.getValue("mobile_no_new");

        // Determine which number to show
        const displayMobile = newMobile ?? originalMobile;

        if (!displayMobile) return "-";

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={`tel:${displayMobile}`}
                  className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
                >
                  <Phone className="h-4 w-4" />
                  {displayMobile}
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Call {displayMobile}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const id = row.original.id;
        const status = row.original.data_status;

        return (
          <div className="flex flex-row">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFollowupStatusId(id);
                      setCurrentStatus(status);
                      setFollowupStatusDialogOpen(true);
                    }}
                  >
                    <Edit className="text-blue-500 w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Set Follow-up</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFollowupId(id);
                      setFollowupDialogOpen(true);
                    }}
                    disabled
                  >
                    <CalendarClock className="text-blue-500 w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Set Follow-up</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
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
        pageSize: 10,
      },
    },
  });

  // Render loading state
  if (isLoading) {
    return (
      <Page>
        <LoaderComponent data={"Upload Data"} />
      </Page>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Page>
        <ErrorLoaderComponent data="Upload Data" onClick={() => refetch()} />
      </Page>
    );
  }
  return (
    <Page>
      <div className="w-full p-0 grid grid-cols-1">
        {/* Header + Search */}
        <div className="flex flex-row items-center justify-between gap-2 md:flex-col md:items-start mb-2">
          {/* Title */}
          <div className="text-left text-lg md:text-2xl text-gray-800 font-normal">
            Pending List
          </div>

          {/* Search */}
          <div className="relative w-40 sm:w-48 md:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by mobile no..."
              value={table.getState().globalFilter || ""}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full text-sm md:text-base"
            />
          </div>
        </div>

        <Tabs
          defaultValue="Pending"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-4"
        >
          <TabsList className="h-full grid grid-cols-2 w-full shadow-lg">
            <TabsTrigger value="Pending">
              Pending (
              {uploadData?.dataUpload?.filter(
                (item) => item.data_status === "Pending",
              ).length || 0}
              )
            </TabsTrigger>

            <TabsTrigger value="Completed">
              Completed (
              {uploadData?.dataUpload?.filter(
                (item) => item.data_status === "Completed",
              ).length || 0}
              )
            </TabsTrigger>
          </TabsList>
        </Tabs>

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

        {/* Row selection and pagination button */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Total Entries: &nbsp;
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
      <FollowupDialog
        open={followupDialogOpen}
        onOpenChange={setFollowupDialogOpen}
        followupId={followupId}
        onSuccess={() => refetch()}
      />
      <FollowupStatusDialog
        open={followupsStatusDialogOpen}
        onOpenChange={setFollowupStatusDialogOpen}
        followupId={followupStatusId}
        onSuccess={() => refetch()}
        currentStatus={currentStatus}
      />
    </Page>
  );
};

export default PendingFollowUp;
