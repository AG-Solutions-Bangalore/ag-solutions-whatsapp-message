import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
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
    Dialog,
    DialogContent,
    DialogDescription,
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
import { useQuery } from "@tanstack/react-query";
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
    Plus,
    Search,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Page from "@/app/dashboard/page";
import BASE_URL from "@/config/BaseUrl";
import { useToast } from "@/hooks/use-toast";
import useApiToken from "@/components/common/UseToken";
import { ButtonConfig } from "@/config/ButtonConfig";
import { SearchSelect } from "@/components/common/SearchSelect";
import { Pencil } from "lucide-react";


// ==========================================
// CREATE Default Auto Campaign DIALOG
// ==========================================
const CreateCampaignDialog = ({ open, onOpenChange, onSuccess }) => {
    const token = useApiToken();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [pipelines, setPipelines] = useState([]);
    const [defaultCampaignStatuses, setDefaultCampaignStatuses] = useState([]);
    const [formData, setFormData] = useState({
        branch_id: "",
        pipeline_id: "",
        campaign_default_status: "",
    });

    useEffect(() => {
    if (!open) return;

    const fetchOptions = async () => {
      try {
        const [branchRes, pipelineRes, statusRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/panel-fetch-branch`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/panel-fetch-pipeline`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/panel-fetch-company-status`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (branchRes?.data?.data && Array.isArray(branchRes.data.data)) {
          setBranches(branchRes.data.data);
        }
        if (pipelineRes?.data?.data && Array.isArray(pipelineRes.data.data)) {
          setPipelines(pipelineRes.data.data);
        }
        if (
          statusRes?.data?.companyStatus &&
          Array.isArray(statusRes.data.companyStatus)
        ) {
          setDefaultCampaignStatuses(statusRes.data.companyStatus);
        }
      } catch (error) {
        toast({
          title: "Error",
          description:
            error.response?.data?.msg ||
            error.response?.data?.message ||
            "Failed to load campaign options.",
          variant: "destructive",
        });
      }
    };

    fetchOptions();
  }, [open, token, toast]);

    const resetForm = () => {
        setFormData({
            branch_id: "",
            pipeline_id: "",
            campaign_default_status: "",
        });
    };

    const handleInputChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const errors = [];
        if (!formData.branch_id.length)
            errors.push("Please select a branch.");
        if (!formData.pipeline_id)
            errors.push("Please select a pipeline.");
        if (!formData.campaign_default_status)
            errors.push("Please select a Default campaign status.");

        if (errors.length) {
            toast({
                title: "Error",
                description: errors.map((error, index) => (
                    <div key={index}>{error}</div>
                )),
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                branch_id: formData.branch_id,
                pipeline_id: formData.pipeline_id,
                campaign_default_status: formData.campaign_default_status,
            };
            console.log(payload);
            const response = await axios.post(
                `${BASE_URL}/api/panel-create-default-campaign`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            if (response?.data?.code === 200) {
                toast({
                    title: "Success",
                    description: response?.data?.msg || "Default Auto Campaign created successfully!",
                });
                resetForm();
                onOpenChange(false);
                if (onSuccess) onSuccess();
            } else {
                throw new Error(response?.data?.msg || "Failed to create Default Auto Campaign.");
            }
        } catch (error) {
            toast({
                title: "Error",
                description:
                    error.response?.data?.msg ||
                    error.response?.data?.message ||
                    "Failed to create Default Auto Campaign.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create Default Auto Campaign</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div>
                        <Label htmlFor="campaign_branch">Branches<span className="text-red-500">*</span></Label>
                        <SearchSelect
                            options={branches}
                            value={formData.branch_id}
                            onChange={(val) => handleInputChange("branch_id", val)}
                            placeholder="Select Branches"
                            getLabel={(b) => b.branch_name || b.name || b.id}
                            getValue={(b) => String(b.id)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="campaign_pipeline">Pipeline<span className="text-red-500">*</span></Label>
                        <SearchSelect
                            options={pipelines}
                            value={formData.pipeline_id}
                            onChange={(val) => handleInputChange("pipeline_id", val)}
                            placeholder="Select Pipeline"
                            getLabel={(p) => p.pipeline_name || p.name || p.id}
                            getValue={(p) => String(p.id)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="data_status">
                            DefaultCampaignStatus <span className="text-red-500">*</span>
                        </Label>

                        <SearchSelect
                            options={defaultCampaignStatuses}
                            value={formData.campaign_default_status}
                            onChange={(val) =>
                                handleInputChange("campaign_default_status", val)
                            }
                            placeholder="Select Default Campaign Status"
                            getLabel={(s) => s.companyStatus || s.name || s.value || s.id}
                            getValue={(s) =>
                                String(s.companyStatus || s.name || s.value || s.id)
                            }
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
                        className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                    >
                        {isLoading ? "Creating..." : "Create Default Auto Campaign"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};



// ==========================================
// Edit CAMPAIGN DIALOG
// ==========================================
const EditCampaignDialog = ({ open, onOpenChange, id, onSuccess, }) => {
    const token = useApiToken();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [pipelines, setPipelines] = useState([]);
    const [defaultCampaignStatuses, setDefaultCampaignStatuses] = useState([]);
    const [formData, setFormData] = useState({
        branch_id: "",
        pipeline_id: "",
        campaign_default_status: "",
        status: "",
    });


    useEffect(() => {
        if (!open) return;

        const fetchOptions = async () => {

            try {
                const [branchRes, pipelineRes, statusRes, campaignRes] =
                    await Promise.all([
                        axios.get(`${BASE_URL}/api/panel-fetch-branch`, {
                            headers: { Authorization: `Bearer ${token}` },
                        }),

                        axios.get(`${BASE_URL}/api/panel-fetch-pipeline-list`, {
                            headers: { Authorization: `Bearer ${token}` },
                        }),

                        axios.get(`${BASE_URL}/api/panel-fetch-company-status`, {
                            headers: { Authorization: `Bearer ${token}` },
                        }),

                        axios.get(
                            `${BASE_URL}/api/panel-fetch-default-campaign-by-id/${id}`,
                            {
                                headers: { Authorization: `Bearer ${token}` },
                            }
                        ),
                    ]);

                console.log("Branch API:", branchRes.data);
                console.log("Pipeline API:", pipelineRes.data);
                console.log("Status API:", statusRes.data);

                const campaign = campaignRes.data.data;

                console.log("Campaign:", campaign);

                setBranches(branchRes.data.data || []);
                setPipelines(pipelineRes.data.data || []);

                // IMPORTANT
                setDefaultCampaignStatuses(statusRes.data.companyStatus || []);
                console.log(
                    "Default Status Options:",
                    statusRes.data.companyStatus || statusRes.data.data
                );

                setFormData({
                    branch_id: String(campaign.branch_id),
                    pipeline_id: String(campaign.pipeline_id),
                    campaign_default_status: String(campaign.campaign_default_status),
                    status: String(campaign.status),
                });

                console.log(
                    "Selected Status:",
                    campaign.campaign_default_status
                );
            } catch (error) {
                console.log(error);

                toast({
                    title: "Error",
                    description: "Failed to fetch campaign.",
                    variant: "destructive",
                });
            }
        };

        fetchOptions();
    }, [open]);

    useEffect(() => {
        if (!open || !id) return;

        const fetchCampaign = async () => {
            try {
                const response = await axios.get(
                    `${BASE_URL}/api/panel-fetch-default-campaign-by-id/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },

                );

                const data = response.data.data;
                console.log("Campaign Data:", data);

                setFormData({
                    branch_id: String(data.branch_id),
                    pipeline_id: String(data.pipeline_id),
                    campaign_default_status: data.campaign_default_status,
                    status: data.status,

                });
            } catch (error) {
                console.log("FETCH ERROR:", error);
                console.log("Response:", error.response);

                toast({
                    title: "Error",
                    description: "Failed to fetch campaign.",
                    variant: "destructive",
                });
            }
        };

        fetchCampaign();
    }, [open, id]);

    const resetForm = () => {
        setFormData({
            branch_id: "",
            pipeline_id: "",
            campaign_default_status: "",
        });
    };

    const handleInputChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const errors = [];
        if (!formData.branch_id.length)
            errors.push("Please select a branch.");
        if (!formData.pipeline_id)
            errors.push("Please select a pipeline.");
        if (!formData.campaign_default_status)
            errors.push("Please select a Default campaign status.");

        if (errors.length) {
            toast({
                title: "Error",
                description: errors.map((error, index) => (
                    <div key={index}>{error}</div>
                )),
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                branch_id: formData.branch_id,
                pipeline_id: formData.pipeline_id,
                campaign_default_status: formData.campaign_default_status,
                status: formData.status,
            };
            console.log(payload);
            const response = await axios.put(
                `${BASE_URL}/api/panel-update-default-campaign/${id}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response?.data?.code === 200) {
                toast({
                    title: "Success",
                    description: response?.data?.msg || "Campaign updated successfully!",
                });
                onOpenChange(false);
                if (onSuccess) onSuccess();
            } else {
                throw new Error(response?.data?.msg || "Failed to Update Default Auto Campaign.");
            }
        } catch (error) {
            toast({
                title: "Error",
                description:
                    error.response?.data?.msg ||
                    error.response?.data?.message ||
                    "Failed to Update Default Auto Campaign.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    const handleUpdate = async () => {
        console.log("UPDATE BUTTON CLICKED");

        setIsLoading(true);

        try {
            const payload = {
                branch_id: Number(formData.branch_id),
                pipeline_id: Number(formData.pipeline_id),
                campaign_default_status: formData.campaign_default_status,
                status: formData.status,
            };

            console.log("Payload:", payload);

            const response = await axios.put(
                `${BASE_URL}/api/panel-update-default-campaign/${id}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("UPDATE RESPONSE", response.data);
        } catch (err) {
            console.log("UPDATE ERROR", err);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Update Default Auto Campaign</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div>
                        <Label htmlFor="campaign_branch">Branches<span className="text-red-500">*</span></Label>
                        <SearchSelect
                            options={branches}
                            value={formData.branch_id}
                            onChange={(val) => handleInputChange("branch_id", val)}
                            placeholder="Select Branches"
                            getLabel={(b) => b.branch_name || b.name || b.id}
                            getValue={(b) => String(b.id)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="campaign_pipeline">Pipeline<span className="text-red-500">*</span></Label>
                        <SearchSelect
                            options={pipelines}
                            value={formData.pipeline_id}
                            onChange={(val) => handleInputChange("pipeline_id", val)}
                            placeholder="Select Pipeline"
                            getLabel={(p) => p.pipeline_name || p.name || p.id}
                            getValue={(p) => String(p.id)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="data_status">
                            DefaultCampaignStatus <span className="text-red-500">*</span>
                        </Label>

                        <SearchSelect
                            options={defaultCampaignStatuses}
                            value={formData.campaign_default_status}
                            onChange={(val) =>
                                handleInputChange("campaign_default_status", val)
                            }
                            placeholder="Select Default Campaign Status"
                            getLabel={(item) => item.companyStatus}
                            getValue={(item) => item.companyStatus}
                        />
                    </div>
                    <div>
                        <Label>Status</Label>

                        <Select
                            value={formData.status}
                            onValueChange={(value) =>
                                handleInputChange("status", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
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
                        className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                    >
                        {isLoading ? "Updating..." : "Update Default Auto Campaign"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// ==========================================
// MAIN CAMPAIGN LIST COMPONENT
// ==========================================
const DefaultCampaignList = () => {
    const token = useApiToken();
    const { toast } = useToast();

    const [createOpen, setCreateOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    const [branches, setBranches] = useState([]);
    const [pipelines, setPipelines] = useState([]);

    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const [defaultStatuses, setDefaultStatuses] = useState([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [branchRes, pipelineRes] = await Promise.all([
                    axios.get(`${BASE_URL}/api/panel-fetch-branch`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${BASE_URL}/api/panel-fetch-pipeline-list`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (branchRes?.data?.data && Array.isArray(branchRes.data.data)) {
                    setBranches(branchRes.data.data);
                }

                if (pipelineRes?.data?.data && Array.isArray(pipelineRes.data.data)) {
                    setPipelines(pipelineRes.data.data);
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description:
                        error.response?.data?.msg ||
                        error.response?.data?.message ||
                        "Failed to load options.",
                    variant: "destructive",
                });
            }
        };

        fetchOptions();
    }, [token, toast]);

    const {
        data: campaigns,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["campaigns"],
        queryFn: async () => {
            const response = await axios.get(
                `${BASE_URL}/api/panel-fetch-default-campaign-list`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            return response.data.data;
        },
    });

    // EXACT ORIGINAL TABLE COLUMNS - UNCHANGED
    const columns = [
        {
            id: "slNo",
            header: "Sl.no",
            cell: ({ row }) => <div>{row.index + 1}</div>,
        },
        {
            accessorFn: (row) => row.branch?.branch_name,
            id: "branch_name",
            header: "Branch Name",
        },
        {
            accessorFn: (row) => row.pipeline?.pipeline_name,
            id: "pipeline_name",
            header: "Pipeline Name",
        },
        {
            accessorKey: "campaign_default_status",
            header: "Default Campaign Status",
            cell: ({ row }) => row.getValue("campaign_default_status"),
        },
        
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => row.getValue("status"),
        },
        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setEditId(row.original.id);
                        setUpdateOpen(true);
                    }}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
            ),
        }
    ];

    const table = useReactTable({
        data: campaigns || [],
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
                <div className="w-full p-4 text-center">Loading campaign data...</div>
            </Page>
        );

    if (isError)
        return (
            <Page>
                <div className="w-full p-4 text-center">
                    Failed to load campaign list.{" "}
                    <Button onClick={() => refetch()}>Retry</Button>
                </div>
            </Page>
        );

    return (
        <Page>
            <div className="w-full p-4">
                <div className="flex text-left text-2xl text-gray-800 font-[400] mb-4">
                    Default Auto Campaign List
                </div>

                <div className="flex items-center justify-between gap-4 py-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-[550px]">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search Default Auto Campaign....."
                            value={table.getState().globalFilter || ""}
                            onChange={(event) => table.setGlobalFilter(event.target.value)}
                            className="pl-9 w-80"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-2 flex-nowrap">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="whitespace-nowrap">
                                    Columns
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
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
                            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} whitespace-nowrap`}
                            onClick={() => setCreateOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Default Campaign
                        </Button>
                    </div>
                </div>

                {/* EXACT ORIGINAL TABLE */}
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
                                        No campaigns found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between py-4">
                    <div className="text-sm text-muted-foreground">
                        Total Campaigns: {table.getFilteredRowModel().rows.length}
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

            <CreateCampaignDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSuccess={refetch}
            />

            <EditCampaignDialog
                open={updateOpen}
                onOpenChange={setUpdateOpen}
                id={editId}
                onSuccess={refetch}
            />
        </Page>
    );
};

export default DefaultCampaignList;
