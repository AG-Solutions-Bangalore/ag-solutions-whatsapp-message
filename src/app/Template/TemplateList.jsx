import Page from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
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
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ButtonConfig } from "@/config/ButtonConfig";
import LoaderComponent, {
  ErrorLoaderComponent,
} from "@/components/common/LoaderComponent";
import useApiToken from "@/components/common/UseToken";
import { encryptId } from "@/components/common/Encryption";
import { useToast } from "@/hooks/use-toast";
import EditTemplateDialog from "./EditTemplateDialog";

// --- CreateTemplateDialog Component (unchanged) ---
const CreateTemplateDialog = ({ open, onOpenChange, onSuccess }) => {
  const token = useApiToken();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [templateIsImage, setTemplateIsImage] = useState("No");
  const [templateNoOfValues, setTemplateNoOfValues] = useState("0");

  const handleSubmit = async () => {
    if (!templateName.trim() || !templateId.trim()) {
      toast({
        title: "Error",
        description: "Template Name and Template ID are required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/panel-create-template`,
        {
          template_name: templateName.trim(),
          template_id: templateId.trim(),
          template_isImage: templateIsImage,
          template_no_of_values: Number(templateNoOfValues || 0),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response?.data?.code === 200) {
        toast({
          title: "Success",
          description: response?.data?.msg || "Template created successfully!",
        });
        setTemplateName("");
        setTemplateId("");
        setTemplateIsImage("No");
        setTemplateNoOfValues("0");
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        throw new Error(response?.data?.msg || "Failed to create template.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to create template.",
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
          <DialogTitle>Add New Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="templateName">
              Template Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter template name"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="templateId">
              Template ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="templateId"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              placeholder="Enter template ID"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="templateIsImage">Is Image</Label>
            <div className="flex items-center gap-3">
              <input
                id="templateIsImage"
                type="checkbox"
                checked={templateIsImage === "Yes"}
                onChange={(e) =>
                  setTemplateIsImage(e.target.checked ? "Yes" : "No")
                }
                className="h-4 w-4"
              />
              <Label htmlFor="templateIsImage" className="font-normal">
                {templateIsImage}
              </Label>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="templateNoOfValues">No. of Values</Label>
            <Input
              id="templateNoOfValues"
              type="number"
              min="0"
              value={templateNoOfValues}
              onChange={(e) => setTemplateNoOfValues(e.target.value)}
              placeholder="Enter number of values"
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
            {isLoading ? "Creating..." : "Create Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Main TemplateList Component (redesigned) ---
const TemplateList = () => {
  const token = useApiToken();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Data fetching
  const {
    data: templates,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-template-list`,
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
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete handler
  const handleDelete = async () => {
    if (!templateToDelete) return;
    setIsDeleting(true);
    try {
      const deleteId = templateToDelete.id || templateToDelete.template_id;
      const response = await axios.delete(
        `${BASE_URL}/api/panel-delete-template/${deleteId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response?.data?.code === 200) {
        toast({
          title: "Success",
          description: response?.data?.msg || "Template deleted successfully.",
        });
        refetch();
      } else {
        throw new Error(response?.data?.msg || "Failed to delete template.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to delete template.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  // Columns definition
  const columns = [
    {
      id: "slNo",
      header: "Sl.no",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "template_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Template Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("template_name")}</div>,
    },
    {
      accessorKey: "template_id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Template ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("template_id")}</div>,
    },
    {
      accessorKey: "template_isImage",
      header: "Is Image",
      cell: ({ row }) => (
        <div>
          {String(row.getValue("template_isImage") ?? "No").toLowerCase() === "yes" ||
          row.getValue("template_isImage") === true
            ? "Yes"
            : "No"}
        </div>
      ),
    },
    {
      accessorKey: "template_no_of_values",
      header: "No. of Values",
      cell: ({ row }) => <div>{row.getValue("template_no_of_values") ?? 0}</div>,
    },
    {
      accessorKey: "template_status",
      header: "Status",
      cell: ({ row }) => <div>{row.getValue("template_status")}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Template</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: templates || [],
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
        <LoaderComponent data={"Template Data"} />
      </Page>
    );

  if (isError)
    return (
      <Page>
        <ErrorLoaderComponent
          data="Template List Data"
          onClick={() => refetch()}
        />
      </Page>
    );

  return (
    <Page>
      <div className="w-full p-4">
        <div className="flex text-left text-2xl text-gray-800 font-[400]">
          Template List
        </div>

        {/* Toolbar: Search, Columns, Add Template */}
        <div className="flex items-center py-4 gap-4 flex-wrap">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search template..."
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
            <Plus className="h-4 w-4 mr-2" /> Add Template
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
            Total Templates: {table.getFilteredRowModel().rows.length}
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
      <EditTemplateDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        selectedUser={selectedTemplate}
        onSuccess={refetch}
      />

      {/* Create Dialog */}
      <CreateTemplateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refetch}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the template{" "}
              <strong>{templateToDelete?.template_name}</strong>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              loading={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
};

export default TemplateList;
