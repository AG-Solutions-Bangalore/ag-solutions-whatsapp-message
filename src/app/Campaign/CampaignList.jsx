import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  AlertTriangle,
} from "lucide-react";
import Page from "@/app/dashboard/page";
import BASE_URL from "@/config/BaseUrl";
import { useToast } from "@/hooks/use-toast";
import useApiToken from "@/components/common/UseToken";
import { ButtonConfig } from "@/config/ButtonConfig";
import { SearchSelect } from "@/components/common/SearchSelect";

// ==========================================
// CREATE CAMPAIGN DIALOG
// ==========================================
const CreateCampaignDialog = ({ open, onOpenChange, onSuccess }) => {
  const token = useApiToken();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [companyStatuses, setCompanyStatuses] = useState([]);
  const [formData, setFormData] = useState({
    campaign_date: "",
    campaign_name: "",
    campaign_description: "",
    branch_id: [],
    pipeline_id: "",
    data_status: [],
    campaign_v1: "",
    campaign_v2: "",
    campaign_v3: "",
    campaign_image_url: "",
  });
  const today = new Date().toISOString().split("T")[0];

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
          setCompanyStatuses(statusRes.data.companyStatus);
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
      campaign_date: "",
      Campaign_name: "",
      campaign_description: "",
      branch_id: [],
      pipeline_id: "",
      data_status: [],
      campaign_v1: "",
      campaign_v2: "",
      campaign_v3: "",
      campaign_image_url: "",
    });
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBranchChange = (event) => {
    const selected = Array.from(event.target.selectedOptions).map(
      (option) => option.value,
    );
    setFormData((prev) => ({ ...prev, branch_id: selected }));
  };

  const handleSubmit = async () => {
    const errors = [];
    if (!formData.campaign_date)
      errors.push("Please select campaign date.");
    if (!formData.campaign_name.trim())
      errors.push("Please enter campaign name.");
    if (!formData.branch_id.length)
      errors.push("Please select at least one branch.");
    if (!formData.pipeline_id)
      errors.push("Please select a pipeline.");
    if (!formData.data_status.length)
      errors.push("Please select atleast one campaign status.");

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
        campaign_date: formData.campaign_date,
        campaign_name: formData.campaign_name.trim(),
        campaign_description: formData.campaign_description.trim(),
        branch_id: formData.branch_id.join(","),
        pipeline_id: formData.pipeline_id,
        data_status: formData.data_status.join(","),
        campaign_v1: formData.campaign_v1,
        campaign_v2: formData.campaign_v2,
        campaign_v3: formData.campaign_v3,
        campaign_image_url: formData.campaign_image_url,
      };

      const response = await axios.post(
        `${BASE_URL}/api/panel-create-campaign`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response?.data?.code === 200) {
        toast({
          title: "Success",
          description: response?.data?.msg || "Campaign created successfully!",
        });
        resetForm();
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        throw new Error(response?.data?.msg || "Failed to create campaign.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.msg ||
          error.response?.data?.message ||
          "Failed to create campaign.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-3xl max-h-[92vh] overflow-hidden p-0 flex flex-col">
        <DialogHeader className="px-6 py-5 border-b bg-white">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Create Campaign
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Add campaign details, select where it applies, and enter the campaign content.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Campaign Details */}
          <section className="overflow-hidden rounded-xl border border-gray-200">
            <div className="border-b bg-slate-50 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-800">
                Campaign Details
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">
                Enter the basic information and campaign targeting.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="campaign_date">
                  Campaign Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="campaign_date"
                  type="date"
                  min={today}
                  value={formData.campaign_date}
                  onChange={(e) =>
                    handleInputChange("campaign_date", e.target.value)
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="campaign_name">
                  Campaign Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="campaign_name"
                  value={formData.campaign_name}
                  onChange={(e) =>
                    handleInputChange("campaign_name", e.target.value)
                  }
                  placeholder="Enter campaign name"
                />
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <Label htmlFor="campaign_description">Description</Label>
                <Textarea
                  id="campaign_description"
                  rows={3}
                  value={formData.campaign_description}
                  onChange={(e) =>
                    handleInputChange("campaign_description", e.target.value)
                  }
                  className="min-h-[90px] resize-y"
                  placeholder="Enter campaign description"
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label htmlFor="campaign_branch">
                  Branches <span className="text-red-500">*</span>
                </Label>
                <SearchSelect
                  options={branches}
                  value={formData.branch_id}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, branch_id: val }))
                  }
                  placeholder="Select Branches"
                  multiple={true}
                  getLabel={(b) => b.branch_name || b.name || b.id}
                  getValue={(b) => String(b.id)}
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label htmlFor="campaign_pipeline">
                  Pipeline <span className="text-red-500">*</span>
                </Label>
                <SearchSelect
                  options={pipelines}
                  value={formData.pipeline_id}
                  onChange={(val) => handleInputChange("pipeline_id", val)}
                  placeholder="Select Pipeline"
                  getLabel={(p) => p.pipeline_name || p.name || p.id}
                  getValue={(p) => String(p.id)}
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label htmlFor="data_status">
                  Campaign Status <span className="text-red-500">*</span>
                </Label>
                <SearchSelect
                  options={companyStatuses}
                  value={formData.data_status}
                  onChange={(val) => handleInputChange("data_status", val)}
                  placeholder="Select Campaign Status"
                  multiple={true}
                  getLabel={(s) => s.companyStatus || s.name || s.value || s.id}
                  getValue={(s) =>
                    String(s.companyStatus || s.name || s.value || s.id)
                  }
                />
              </div>
            </div>
          </section>

          {/* Campaign Content */}
          <section className="overflow-hidden rounded-xl border border-gray-200">
            <div className="border-b bg-slate-50 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-800">
                Campaign Content
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">
                Add the text for each campaign version. Each field supports multiple lines.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
              <div className="space-y-1.5 min-w-0">
                <Label htmlFor="campaign_v1">Campaign V1</Label>
                <Textarea
                  id="campaign_v1"
                  rows={5}
                  value={formData.campaign_v1}
                  onChange={(e) =>
                    handleInputChange("campaign_v1", e.target.value)
                  }
                  placeholder="Enter Campaign V1 content..."
                  className="min-h-[40px] resize-y"
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label htmlFor="campaign_v2">Campaign V2</Label>
                <Textarea
                  id="campaign_v2"
                  rows={5}
                  value={formData.campaign_v2}
                  onChange={(e) =>
                    handleInputChange("campaign_v2", e.target.value)
                  }
                  placeholder="Enter Campaign V2 content..."
                  className="min-h-[40px] resize-y"
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label htmlFor="campaign_v3">Campaign V3</Label>
                <Textarea
                  id="campaign_v3"
                  rows={5}
                  value={formData.campaign_v3}
                  onChange={(e) =>
                    handleInputChange("campaign_v3", e.target.value)
                  }
                  placeholder="Enter Campaign V3 content..."
                  className="min-h-[40px] resize-y"
                />
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <Label htmlFor="campaign_image_url">Campaign Image URL</Label>
                <Input
                  id="campaign_image_url"
                  type="url"
                  value={formData.campaign_image_url}
                  onChange={(e) =>
                    handleInputChange("campaign_image_url", e.target.value)
                  }
                  placeholder="https://example.com/campaign-image.png"
                />
                <p className="text-xs text-gray-500">
                  Paste the complete image URL, including https://
                </p>
              </div>
            </div>
          </section>
        </div>

        <DialogFooter className="border-t bg-white px-6 py-4">
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
            {isLoading ? "Creating..." : "Create Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ==========================================
// UPDATE CAMPAIGN DIALOG
// ==========================================
const UpdateCampaignDialog = ({
  open,
  onOpenChange,
  branches,
  pipelines,
  token,
  onSuccess,
  toast,
}) => {
  const [updateBranchId, setUpdateBranchId] = useState("");
  const [updatePipelineId, setUpdatePipelineId] = useState("");
  const [updateSubPipelineId, setUpdateSubPipelineId] = useState("");
  const [updateCampaignSent, setUpdateCampaignSent] = useState("");
  const [updateSubPipelines, setUpdateSubPipelines] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchUpdateSubPipelines = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/panel-fetch-sub-pipeline`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response?.data?.data && Array.isArray(response.data.data)) {
          setUpdateSubPipelines(response.data.data);
        }
      } catch (error) {
        toast({
          title: "Error",
          description:
            error.response?.data?.msg ||
            error.response?.data?.message ||
            "Failed to load sub-pipeline options.",
          variant: "destructive",
        });
      }
    };

    fetchUpdateSubPipelines();
  }, [open, token, toast]);

  const handleUpdate = async () => {
    if (!updateBranchId) {
      toast({
        title: "Error",
        description: "Please select a branch.",
        variant: "destructive",
      });
      return;
    }

    if (!updateSubPipelineId) {
      toast({
        title: "Error",
        description: "Please select a sub pipeline.",
        variant: "destructive",
      });
      return;
    }

    if (!updateCampaignSent) {
      toast({
        title: "Error",
        description: "Please select a campaign status.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);
      const response = await axios.put(
        `${BASE_URL}/api/panel-update-campaign-status`,
        {
          branch_id: updateBranchId,
          pipeline_sub_id: updateSubPipelineId,
          campaign_sent: updateCampaignSent,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response?.data?.code === 200) {
        toast({
          title: "Success",
          description: response.data.msg || "Campaign status updated.",
        });
        setUpdateBranchId("");
        setUpdateSubPipelineId("");
        setUpdateCampaignSent("");
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        throw new Error(
          response?.data?.msg || "Failed to update campaign status.",
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.msg ||
          error.response?.data?.message ||
          "Failed to update campaign status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-600" /> Update Campaign Status
          </DialogTitle>
          <DialogDescription>
            Select branch, sub pipeline and target status to update campaigns.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Branch</Label>
            <SearchSelect
              options={branches}
              value={updateBranchId}
              onChange={setUpdateBranchId}
              placeholder="Select Branch"
              getLabel={(b) => b.branch_name || b.name || b.id}
              getValue={(b) => String(b.id)}
            />
          </div>

          <div>
            <Label>Sub Pipeline</Label>
            <SearchSelect
              options={updateSubPipelines}
              value={updateSubPipelineId}
              onChange={setUpdateSubPipelineId}
              placeholder="Select Sub Pipeline"
              getLabel={(sub) => sub.pipeline_sub_name || sub.name || sub.id}
              getValue={(sub) => String(sub.id)}
            />
          </div>

          <div>
            <Label>Campaign Status</Label>
            <SearchSelect
              options={["Sent", "Pending", "Hold"]}
              value={updateCampaignSent}
              onChange={setUpdateCampaignSent}
              placeholder="Select Status"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {isUpdating ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ==========================================
// DELETE CAMPAIGN DIALOG
// ==========================================
const DeleteCampaignDialog = ({
  open,
  onOpenChange,
  branches,
  pipelines,
  token,
  onSuccess,
  toast,
}) => {
  const [deleteBranchId, setDeleteBranchId] = useState("");
  const [deleteSubPipelineId, setDeleteSubPipelineId] = useState("");
  const [deleteCampaignSent, setDeleteCampaignSent] = useState([]);
  const [statusSearch, setStatusSearch] = useState("");
  const filteredStatuses = ["Sent", "Pending", "Hold"].filter((s) =>
    s.toLowerCase().includes(statusSearch.toLowerCase()),
  );
  const [deleteSubPipelines, setDeleteSubPipelines] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchDeleteSubPipelines = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/panel-fetch-sub-pipeline`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response?.data?.data && Array.isArray(response.data.data)) {
          setDeleteSubPipelines(response.data.data);
        }
      } catch (error) {
        toast({
          title: "Error",
          description:
            error.response?.data?.msg ||
            error.response?.data?.message ||
            "Failed to load sub-pipeline options.",
          variant: "destructive",
        });
      }
    };

    fetchDeleteSubPipelines();
  }, [open, token, toast]);

  const handleDelete = async () => {
    if (!deleteBranchId) {
      toast({
        title: "Error",
        description: "Please select a branch.",
        variant: "destructive",
      });
      return;
    }

    if (!deleteSubPipelineId) {
      toast({
        title: "Error",
        description: "Please select a sub pipeline.",
        variant: "destructive",
      });
      return;
    }

    if (!deleteCampaignSent.length) {
      toast({
        title: "Error",
        description: "Please select at least one campaign sent status.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);
      const response = await axios.delete(
        `${BASE_URL}/api/panel-delete-campaign`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            branch_id: deleteBranchId,
            pipeline_sub_id: deleteSubPipelineId,
            campaign_sent: deleteCampaignSent.join(", "),
          },
        },
      );

      if (response?.data?.code === 200) {
        toast({
          title: "Success",
          description: response.data.msg || "Campaign deleted successfully.",
        });
        setDeleteBranchId("");
        setDeleteSubPipelineId("");
        setDeleteCampaignSent([]);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        throw new Error(response?.data?.msg || "Failed to delete campaign.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.msg ||
          error.response?.data?.message ||
          "Failed to delete campaign.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" /> Delete Campaign
          </DialogTitle>
          <DialogDescription>
            Select branch, sub pipeline and statuses to delete campaigns.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Branch</Label>
            <SearchSelect
              options={branches}
              value={deleteBranchId}
              onChange={setDeleteBranchId}
              placeholder="Select Branch"
              getLabel={(b) => b.branch_name || b.name || b.id}
              getValue={(b) => String(b.id)}
            />
          </div>

          <div>
            <Label>Sub Pipeline</Label>
            <SearchSelect
              options={deleteSubPipelines}
              value={deleteSubPipelineId}
              onChange={setDeleteSubPipelineId}
              placeholder="Select Sub Pipeline"
              getLabel={(sub) => sub.pipeline_sub_name || sub.name || sub.id}
              getValue={(sub) => String(sub.id)}
            />
          </div>

          <div>
            <Label>Campaign Sent Statuses</Label>
            <SearchSelect
              options={["Sent", "Pending", "Hold"]}
              value={deleteCampaignSent}
              onChange={setDeleteCampaignSent}
              placeholder="Select Statuses"
              multiple={true}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ==========================================
// MAIN CAMPAIGN LIST COMPONENT
// ==========================================
const CampaignList = () => {
  const token = useApiToken();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [branches, setBranches] = useState([]);
  const [pipelines, setPipelines] = useState([]);

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

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
        `${BASE_URL}/api/panel-fetch-campaign-list`,
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
      accessorKey: "branch_name",
      header: "Branch Name",
      cell: ({ row }) => <div>{row.getValue("branch_name")}</div>,
    },
    {
      accessorKey: "campaign_name",
      header: "Campaign Name",
      cell: ({ row }) => <div>{row.getValue("campaign_name")}</div>,
    },
    {
      accessorKey: "pipeline_sub_name",
      header: "Pipeline Name",
      cell: ({ row }) => <div>{row.getValue("pipeline_sub_name")}</div>,
    },
    {
      accessorKey: "pipeline_sub_template",
      header: "Pipeline Template",
      cell: ({ row }) => <div>{row.getValue("pipeline_sub_template")}</div>,
    },
    {
      accessorKey: "campaign_v1",
      header: "Campaign V1",
      cell: ({ row }) => (
        <div className="max-w-[220px] whitespace-pre-wrap break-words">
          {row.getValue("campaign_v1") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "campaign_v2",
      header: "Campaign V2",
      cell: ({ row }) => (
        <div className="max-w-[220px] whitespace-pre-wrap break-words">
          {row.getValue("campaign_v2") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "campaign_v3",
      header: "Campaign V3",
      cell: ({ row }) => (
        <div className="max-w-[220px] whitespace-pre-wrap break-words">
          {row.getValue("campaign_v3") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "campaign_image_url",
      header: "Campaign Image URL",
      cell: ({ row }) => {
        const imageUrl = row.getValue("campaign_image_url");
        return imageUrl ? (
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="max-w-[220px] break-all text-blue-600 underline"
          >
            {imageUrl}
          </a>
        ) : (
          "-"
        );
      },
    },
    {
      accessorKey: "campaign_date",
      header: "Campaign Date",
      cell: ({ row }) => {
        const value = row.getValue("campaign_date");

        if (!value) return <div>-</div>;

        const rawDate = String(value).split("T")[0];
        const [year, month, day] = rawDate.split("-");

        if (year && month && day) {
          return <div>{`${day}-${month}-${year}`}</div>;
        }

        return <div>{value}</div>;
      },
    },
    {
      id: "campaign_counts",
      header: "Pending / Sent / Hold",
      cell: ({ row }) => (
        <div>
          {row.original.pending_count || 0} /{row.original.sent_count || 0} /{" "}
          {row.original.hold_count || 0}
        </div>
      ),
    },
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
          Campaign List
        </div>

        <div className="flex items-center justify-between gap-4 py-4">
          {/* Search */}
          <div className="relative flex-1 max-w-[550px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search campaign....."
              value={table.getState().globalFilter || ""}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="pl-9 w-80"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 flex-nowrap">
            <Button
              variant="outline"
              onClick={() => setUpdateOpen(true)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshCw className="h-4 w-4" />
              Update Campaign
            </Button>

            <Button
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Trash2 className="h-4 w-4" />
              Delete Campaign
            </Button>

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
              Add Campaign
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

      <UpdateCampaignDialog
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        branches={branches}
        pipelines={pipelines}
        token={token}
        onSuccess={refetch}
        toast={toast}
      />

      <DeleteCampaignDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        branches={branches}
        pipelines={pipelines}
        token={token}
        onSuccess={refetch}
        toast={toast}
      />
    </Page>
  );
};

export default CampaignList;
