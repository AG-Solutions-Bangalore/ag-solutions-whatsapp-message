import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Page from "@/app/dashboard/page";
import BASE_URL from "@/config/BaseUrl";
import { useToast } from "@/hooks/use-toast";
import { ButtonConfig } from "@/config/ButtonConfig";
import useApiToken from "@/components/common/UseToken";
import { SearchSelect } from "@/components/common/SearchSelect";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EditPipeline = () => {
  const { id } = useParams();
  const token = useApiToken();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [pipelineName, setPipelineName] = useState("");
  const [pipelineStatus, setPipelineStatus] = useState("Active");
  const [subs, setSubs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [deletingSubIndex, setDeletingSubIndex] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState(null);
  const [deleteTargetSub, setDeleteTargetSub] = useState(null);
  const todayDate = new Date().toISOString().split("T")[0];

  const normalizeSub = (sub = {}) => ({
    id: sub.id ?? "",
    pipeline_sub_name: sub.pipeline_sub_name ?? "",
    pipeline_sub_template: sub.pipeline_sub_template ?? "",
    pipeline_sub_time: sub.pipeline_sub_time ?? "",
    pipeline_sub_status: sub.pipeline_sub_status || "Active",
  });

  const getTemplateValue = (template) => {
    if (!template) return "";
    if (typeof template === "object" && template !== null) {
      return String(template.template_id || template.id || "");
    }
    return String(template);
  };

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const response = await axios.get(
          `${BASE_URL}/api/panel-fetch-template`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (response?.data?.data && Array.isArray(response.data.data)) {
          setTemplates(response.data.data);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load templates.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, [token, toast]);

  // Fetch pipeline data
  useEffect(() => {
    const fetchPipeline = async () => {
      setIsFetching(true);
      try {
        const response = await axios.get(
          `${BASE_URL}/api/panel-fetch-pipeline-by-id/${id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = response.data.data;
        setPipelineName(data.pipeline_name || "");
        setPipelineStatus(data.pipeline_status || "Active");
        setSubs(Array.isArray(data.subs) ? data.subs.map(normalizeSub) : []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load pipeline data.",
          variant: "destructive",
        });
        navigate("/Pipeline-list");
      } finally {
        setIsFetching(false);
      }
    };
    if (id) fetchPipeline();
  }, [id, token, toast, navigate]);

  useEffect(() => {
    if (!templates.length || !subs.length) return;

    let changed = false;
    const normalizedSubs = subs.map((sub) => {
      if (sub.pipeline_sub_template && typeof sub.pipeline_sub_template === "object") {
        return sub;
      }

      const matchingTemplate = templates.find(
        (template) =>
          String(template.template_id || template.id || "") ===
          String(sub.pipeline_sub_template),
      );

      if (matchingTemplate) {
        changed = true;
        return { ...sub, pipeline_sub_template: matchingTemplate };
      }

      return sub;
    });

    if (changed) {
      setSubs(normalizedSubs);
    }
  }, [templates, subs]);

  // Sub management
  const addSub = () => {
    setSubs([...subs, normalizeSub({})]);
  };

  const removeSubFromState = (index) => {
    if (subs.length === 1) {
      toast({
        title: "Info",
        description: "At least one sub is required.",
      });
      return;
    }
    setSubs(subs.filter((_, i) => i !== index));
  };

  const confirmDeleteSub = (index, sub) => {
    if (subs.length === 1) {
      toast({
        title: "Info",
        description:
          "At least one sub is required. You cannot delete the last sub.",
        variant: "default",
      });
      return;
    }

    setDeleteTargetIndex(index);
    setDeleteTargetSub(sub);
    setDeleteModalOpen(true);
  };

  const handleDeleteSub = async () => {
    const index = deleteTargetIndex;
    const sub = deleteTargetSub;
    setDeleteModalOpen(false);
    setDeletingSubIndex(index);

    if (subs.length === 1) {
      toast({
        title: "Info",
        description:
          "At least one sub is required. You cannot delete the last sub.",
        variant: "default",
      });
      setDeletingSubIndex(null);
      setDeleteTargetIndex(null);
      setDeleteTargetSub(null);
      return;
    }

    if (!sub?.id) {
      removeSubFromState(index);
      setDeletingSubIndex(null);
      setDeleteTargetIndex(null);
      setDeleteTargetSub(null);
      return;
    }

    try {
      const response = await axios.delete(
        `${BASE_URL}/api/panel-delete-pipeline-sub/${sub.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response?.data?.code === 200) {
        toast({
          title: "Success",
          description: response?.data?.msg || "Sub deleted successfully!",
        });
        removeSubFromState(index);
      } else {
        throw new Error(response?.data?.msg || "Failed to delete sub.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to delete sub.",
        variant: "destructive",
      });
    } finally {
      setDeletingSubIndex(null);
      setDeleteTargetIndex(null);
      setDeleteTargetSub(null);
    }
  };

  const handleSubChange = (index, field, value) => {
    const updated = [...subs];
    if (field === "pipeline_sub_time") {
      value = value.replace(/[^0-9]/g, "").slice(0, 3);
    }
    updated[index][field] = value;
    setSubs(updated);
  };

  const handleSubmit = async () => {
    const errors = [];
    if (!pipelineName.trim()) errors.push("Pipeline Name is required.");
    subs.forEach((sub, idx) => {
      if (!sub.pipeline_sub_name.trim())
        errors.push(`Sub ${idx + 1} Name is required.`);
      if (!sub.pipeline_sub_template)
        errors.push(`Sub ${idx + 1} Template is required.`);
      if (!sub.pipeline_sub_time.trim())
        errors.push(`Sub ${idx + 1} Time is required.`);
    });

    if (errors.length) {
      toast({
        title: "Error",
        description: errors.map((e, i) => <div key={i}>{e}</div>),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        pipeline_name: pipelineName.trim(),
        pipeline_status: pipelineStatus,
        updated_date: todayDate,
        subs: subs.map((sub) => ({
          id: sub.id ?? "",
          pipeline_sub_name: sub.pipeline_sub_name.trim(),
          pipeline_sub_template: getTemplateValue(sub.pipeline_sub_template),
          pipeline_sub_time: sub.pipeline_sub_time.trim(),
          pipeline_sub_status: sub.pipeline_sub_status || "Active",
        })),
      };

      const response = await axios.put(
        `${BASE_URL}/api/panel-update-pipeline/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response?.data?.code === 200) {
        toast({
          title: "Success",
          description: response?.data?.msg || "Pipeline updated successfully!",
        });
        navigate("/Pipeline-list");
      } else {
        throw new Error(response?.data?.msg || "Failed to update pipeline.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to update pipeline.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Page>
        <div className="w-full p-4 text-center">Loading pipeline data...</div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="w-full p-4">
        {/* Page Title */}
        <h1 className="text-2xl text-gray-800 font-[400] mb-6">
          Edit Pipeline
        </h1>

        {/* Full-width form */}
        <div className="space-y-4">
          {/* Pipeline Name and Status – now on the same row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="editPipelineName">
                Pipeline Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="editPipelineName"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                placeholder="Enter pipeline name"
              />
            </div>

            <div>
              <Label htmlFor="editPipelineStatus">
                Status <span className="text-red-500">*</span>
              </Label>
              <select
                id="editPipelineStatus"
                value={pipelineStatus}
                onChange={(e) => setPipelineStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Subs */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Pipeline Details</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addSub}
                type="button"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Details
              </Button>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_40px] gap-2 px-3 pb-1 text-xs font-medium text-gray-500 uppercase tracking-wide items-center">
              <span>
                Detail Name <span className="text-red-500">*</span>
              </span>
              <span>
                Template <span className="text-red-500">*</span>
              </span>
              <span>
                 Campaign Starts In(days) <span className="text-red-500">*</span>
              </span>
              <span>Status</span>
              <span className="text-center">Action</span>
            </div>

            {subs.map((sub, index) => (
              <div
                key={sub.id || index}
                className="grid grid-cols-[1fr_1fr_1fr_1fr_40px] gap-2 items-center border border-gray-200 rounded-md px-3 py-2 mb-2"
              >
                {/* Detail Name */}
                <div>
                  <Input
                    id={`edit-sub-name-${index}`}
                    value={sub.pipeline_sub_name}
                    onChange={(e) =>
                      handleSubChange(
                        index,
                        "pipeline_sub_name",
                        e.target.value,
                      )
                    }
                    placeholder="Detail name"
                    className="h-8 text-sm w-full"
                  />
                </div>

                {/* Template */}
                <div>
                  <SearchSelect
                    options={templates}
                    value={sub.pipeline_sub_template}
                    onChange={(val) =>
                      handleSubChange(index, "pipeline_sub_template", val)
                    }
                    placeholder="Select Template"
                    disabled={isLoadingTemplates}
                    returnObject
                    getLabel={(t) =>
                       `${t.template_name || t.name || t.id} - ${
                         t.template_isImage ?? "No"
                       } - ${
                         t.template_no_of_values ?? "N/A"
                       }`
                     }
                    getValue={(t) => String(t.template_id || t.id)}
                  />
                </div>

                {/* Time */}
                <div>
                  <Input
                    id={`edit-sub-time-${index}`}
                    value={sub.pipeline_sub_time}
                    onChange={(e) =>
                      handleSubChange(
                        index,
                        "pipeline_sub_time",
                        e.target.value,
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        !/[0-9]/.test(e.key) &&
                        ![
                          "Backspace",
                          "Delete",
                          "ArrowLeft",
                          "ArrowRight",
                          "Tab",
                        ].includes(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Enter a number (0 =Today,1 =Tomorrow)"
                    className="h-8 text-sm w-full"
                    inputMode="numeric"
                    maxLength={3}
                  />
                </div>

                {/* Status */}
                <div>
                  <select
                    id={`edit-sub-status-${index}`}
                    value={sub.pipeline_sub_status || "Active"}
                    onChange={(e) =>
                      handleSubChange(
                        index,
                        "pipeline_sub_status",
                        e.target.value,
                      )
                    }
                    className="w-full h-8 border border-gray-200 rounded-md px-2 py-1 text-sm bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Delete button */}
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                    onClick={() => confirmDeleteSub(index, sub)}
                    disabled={deletingSubIndex === index}
                    title="Delete Sub"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate("/Pipeline-list")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || isFetching || isLoadingTemplates}
              className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
            >
              {isLoading ? "Updating..." : "Update Pipeline"}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" /> Delete Sub
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this sub pipeline? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteTargetIndex(null);
                setDeleteTargetSub(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSub}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
};

export default EditPipeline;
