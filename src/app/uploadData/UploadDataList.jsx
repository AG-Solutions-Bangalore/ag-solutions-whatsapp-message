import React, { useEffect, useState } from "react";
import Page from "../dashboard/page";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  Search,
  Loader2,
  Calendar,
  SquarePlus,
  Trash2,
  ArrowLeftRight,
  Edit3,
} from "lucide-react";
import Loader from "@/components/loader/Loader";
import { ButtonConfig } from "@/config/ButtonConfig";
import CreateUploadData from "./CreateUploadData";
import FollowupDialog from "./FollowupDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeleteFollowUp from "./DeleteFollowUp";
import moment from "moment/moment";
import DeleteAllFollowUpData from "./DeleteAllFollowUpData";
import LoaderComponent, {
  ErrorLoaderComponent,
} from "@/components/common/LoaderComponent";
import useApiToken from "@/components/common/UseToken";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import ExchangeFollowupDialog from "./ExchangeFollowupDialog";

const UpdateOtherDataDialog = ({ open, onOpenChange, onSuccess, rowData }) => {
  const token = useApiToken();
  const { toast } = useToast();
  const [mobileNoNew, setMobileNoNew] = useState("");
  const [emailId, setEmailId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && rowData) {
      setMobileNoNew(rowData.mobile_no_new || "");
      setEmailId(rowData.email_id || "");
    }
  }, [open, rowData]);

  const handleSubmit = async () => {
    if (!rowData?.id) return;
    setIsLoading(true);

    try {
      const response = await axios.put(
        `${BASE_URL}/api/panel-update-upload-other-data/${rowData.id}`,
        {
          mobile_no_new: mobileNoNew,
          email_id: emailId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response?.data?.code === 200) {
        toast({
          title: "Success",
          description: response.data.msg || "Record updated successfully.",
        });
        onSuccess?.();
        onOpenChange(false);
      } else {
        throw new Error(response?.data?.msg || "Failed to update record.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.msg ||
          error.response?.data?.message ||
          "Failed to update record.",
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
          <DialogTitle>Update Email / Mobile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="mobile_no_new">Mobile No New</Label>
            <Input
              id="mobile_no_new"
              value={mobileNoNew}
              onChange={(e) => setMobileNoNew(e.target.value)}
              className="w-full"
              placeholder="Enter new mobile number"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email_id">Email ID</Label>
            <Input
              id="email_id"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              className="w-full"
              placeholder="Enter email address"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UploadDataList = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [followupId, setFollowupId] = useState(null);
  const [followupdeleteId, setFollowupdeleteId] = useState(null);
  const [followupDialogOpen, setFollowupDialogOpen] = useState(false);
  const [followupDialogExchnageOpen, setFollowupDialogExchnageOpen] =
    useState(false);
  const [followupDeleteDialogOpen, setFollowupDeleteDialogOpen] =
    useState(false);
  const [followupDeleteallDialogOpen, setFollowupDeleteallDialogOpen] =
    useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editRowData, setEditRowData] = useState(null);
  const token = useApiToken();
  const userType = useSelector((state) => state.auth.user_type);
  const [formData, setFormData] = useState({
    data_created: "",
    data_status: "",
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      data_status: value,
    }));
  };
  const queryClient = useQueryClient();
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

  // Fetch company status for filtering
  const { data: statusData } = useQuery({
    queryKey: ["companyStatus"],
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-company-status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.companyStatus;
    },
  });

  // State for table management
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  // Filter data based on active tab
  const filteredData = React.useMemo(() => {
    if (!uploadData?.dataUpload || activeTab === "all") {
      return uploadData?.dataUpload || [];
    }
    return uploadData.dataUpload.filter(
      (item) => item.data_status === activeTab,
    );
  }, [uploadData, activeTab]);

  // Define columns for the table
  const columns = [
    {
      accessorKey: "index",
      header: "Sl.no",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      header: "Name",
      accessorFn: (row) => row.user?.name || "-",
      cell: ({ row }) => (
        <div className="text-gray-800">{row.original.user?.name || "-"}</div>
      ),
    },
    {
      id: "branchName",
      header: "Branch Name",
      accessorFn: (row) => row.branch?.branch_name || "-",
      cell: ({ row }) => (
        <div className="text-gray-800">
          {row.original.branch?.branch_name || "-"}
        </div>
      ),
    },

    {
      accessorKey: "mobile_no",
      header: "Mobile Number",
      cell: ({ row }) => <div>{row.getValue("mobile_no")}</div>,
    },
    {
      accessorKey: "mobile_no_new",
      header: "Mobile No New",
      cell: ({ row }) => <div>{row.getValue("mobile_no_new") || "-"}</div>,
    },
    {
      accessorKey: "email_id",
      header: "Email ID",
      cell: ({ row }) => <div>{row.getValue("email_id") || "-"}</div>,
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => <div>{row.getValue("message")}</div>,
    },
    {
      accessorKey: "data_image",
      header: "Attachment",
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="link"
                className="text-blue-500 hover:text-blue-700"
                onClick={() => {
                  window.open(
                    `${BASE_URL}/assets/images/data_images//${row.getValue(
                      "data_image",
                    )}`,
                    "_blank",
                  );
                }}
              >
                View File
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to view attachment</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      accessorKey: "file_attached",
      header: "File Attached",
      cell: ({ row }) => <div>{row.getValue("file_attached")}</div>,
    },
    {
      accessorKey: "data_status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              row.getValue("data_status"),
            )}`}
          >
            {row.getValue("data_status")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "data_created",
      header: "Creation Date",
      cell: ({ row }) => {
        const date = row.getValue("data_created");
        return <div>{date ? moment(date).format("DD-MMM-YYYY") : "-"}</div>;
      },
    },
    {
      accessorKey: "followup_date",
      header: "Follow-up Date",
      cell: ({ row }) => {
        const date = row.getValue("followup_date");
        return <div>{date ? moment(date).format("DD-MMM-YYYY") : "-"}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const id = row.original.id;

        return (
          <div className="flex flex-row">
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
                  >
                    <Calendar className="text-blue-500 w-5 h-5" />
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
                      setEditRowData(row.original);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit3 className="text-green-500 w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Email/Mobile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {userType !== 1 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFollowupdeleteId(id);
                        setFollowupDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="text-red-500 w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Follow-up</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
    },
  ];

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Interested":
        return "bg-green-100 text-green-800";
      case "Not Interested":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      case "Follow Up":
        return "bg-purple-100 text-purple-800";
      case "Wrong Number":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Create the table instance
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
      <div className="w-full p-0 md:p-4 grid grid-cols-1">
        <div className="flex text-left text-2xl text-gray-800 font-[400]">
          Upload Data List
        </div>

        <div className="flex flex-col md:flex-row md:items-center py-4 gap-2">
          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by mobile, message..."
              value={table.getState().globalFilter || ""}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full"
            />
          </div>

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
            {userType !== 1 && <CreateUploadData onSuccess={() => refetch()} />}
            {userType !== 1 && (
              <Button
                variant="default"
                className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                onClick={() => {
                  setFollowupDeleteallDialogOpen(true);
                }}
              >
                <Trash2 className="w-5 h-5" />
                Delete All Data
              </Button>
            )}
            <Button
              variant="default"
              className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
              onClick={() => {
                setFollowupDialogExchnageOpen(true);
              }}
            >
              <ArrowLeftRight className="w-5 h-5" />
              Exchange Follow-up
            </Button>
          </div>
        </div>

        {/* Status Tabs */}
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-4"
        >
          <TabsList className="h-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full shadow-lg">
            {/* All Tab */}
            <TabsTrigger value="all">
              All ({uploadData?.dataUpload?.length || 0})
            </TabsTrigger>

            {/* Status Tabs */}
            {uploadData?.status?.map((status) => {
              const statusCount = uploadData.dataUpload.filter(
                (item) => item.data_status === status.companyStatus,
              ).length;

              return (
                <TabsTrigger
                  key={status.companyStatus}
                  value={status.companyStatus}
                >
                  {status.companyStatus} ({statusCount})
                </TabsTrigger>
              );
            })}
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

      {/* Followup Dialog */}
      <FollowupDialog
        open={followupDialogOpen}
        onOpenChange={setFollowupDialogOpen}
        followupId={followupId}
        onSuccess={() => refetch()}
      />
      <UpdateOtherDataDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => refetch()}
        rowData={editRowData}
      />
      <ExchangeFollowupDialog
        open={followupDialogExchnageOpen}
        onOpenChange={setFollowupDialogExchnageOpen}
        onSuccess={() => refetch()}
      />
      <DeleteFollowUp
        open={followupDeleteDialogOpen}
        onOpenChange={setFollowupDeleteDialogOpen}
        onSuccess={() => refetch()}
        followupdeleteId={followupdeleteId}
      />
      <DeleteAllFollowUpData
        onOpenChange={setFollowupDeleteallDialogOpen}
        open={followupDeleteallDialogOpen}
        onSuccess={() => refetch()}
        setFormData={setFormData}
        formData={formData}
        handleInputChange={handleInputChange}
        handleStatusChange={handleStatusChange}
      />
    </Page>
  );
};

export default UploadDataList;
