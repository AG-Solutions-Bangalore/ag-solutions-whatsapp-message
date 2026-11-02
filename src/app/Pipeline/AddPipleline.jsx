import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const AddPipeline = () => {
  const token = useApiToken();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [pipelineName, setPipelineName] = useState("");
  const [templates, setTemplates] = useState([]);
  const [subs, setSubs] = useState([
    { pipeline_sub_name: "", pipeline_sub_template: "", pipeline_sub_time: "" },
  ]);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState(null);

  // Fetch templates on mount
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
        } else {
          toast({
            title: "Error",
            description: "Failed to load templates.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.msg || "Could not load templates.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, [token, toast]);

  const addSub = () => {
    setSubs([
      ...subs,
      {
        pipeline_sub_name: "",
        pipeline_sub_template: "",
        pipeline_sub_time: "",
      },
    ]);
  };

  const confirmRemoveSub = (index) => {
    if (subs.length === 1) {
      toast({ title: "Info", description: "At least one sub is required." });
      return;
    }
    setDeleteTargetIndex(index);
    setDeleteModalOpen(true);
  };

  const removeSub = () => {
    setSubs(subs.filter((_, i) => i !== deleteTargetIndex));
    setDeleteModalOpen(false);
    setDeleteTargetIndex(null);
  };

  const handleSubChange = (index, field, value) => {
    const updated = [...subs];
    if (field === "pipeline_sub_time") {
      value = value.replace(/[^0-9]/g, "").slice(0, 3);
    }
    updated[index][field] = value;
    setSubs(updated);
  };

  const getTemplateId = (template) => {
    if (!template) return "";
    if (typeof template === "object") {
      return String(template.template_id || template.id || "");
    }
    return String(template);
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
        subs: subs.map((sub) => ({
          pipeline_sub_name: sub.pipeline_sub_name.trim(),
          pipeline_sub_template: getTemplateId(sub.pipeline_sub_template),
          pipeline_sub_time: sub.pipeline_sub_time.trim(),
        })),
      };

      const response = await axios.post(
        `${BASE_URL}/api/panel-create-pipeline`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response?.data?.code === 200) {
        toast({
          title: "Success",
          description: response?.data?.msg || "Pipeline created successfully!",
        });
        navigate("/pipeline-list");
      } else {
        throw new Error(response?.data?.msg || "Failed to create pipeline.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to create pipeline.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page>
      <div className="w-full p-4">
        {/* Page Title */}
        <h1 className="text-2xl text-gray-800 font-[400] mb-6">
          Add New Pipeline
        </h1>

        <div className="space-y-4">
          {/* Pipeline Name */}
          <div>
            <Label htmlFor="pipelineName">
              Pipeline Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pipelineName"
              value={pipelineName}
              onChange={(e) => setPipelineName(e.target.value)}
              placeholder="Enter pipeline name"
            />
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
            <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_40px] gap-3 px-3 pb-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <span>
                Detail Name <span className="text-red-500">*</span>
              </span>
              <span>
                Template <span className="text-red-500">*</span>
              </span>
              <span>
               Campaign Starts In (days) <span className="text-red-500">*</span>
              </span>
              <span></span>
            </div>

            {subs.map((sub, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_40px] gap-3 items-end border border-gray-200 rounded-md px-3 py-2 mb-2"
              >
                <div>
                  <Label
                    htmlFor={`sub-name-${index}`}
                    className="text-xs md:hidden"
                  >
                    Sub Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`sub-name-${index}`}
                    value={sub.pipeline_sub_name}
                    onChange={(e) =>
                      handleSubChange(
                        index,
                        "pipeline_sub_name",
                        e.target.value,
                      )
                    }
                    placeholder="Detail Name"
                    required
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <Label
                    htmlFor={`sub-template-${index}`}
                    className="text-xs md:hidden"
                  >
                    Template <span className="text-red-500">*</span>
                  </Label>
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

                <div>
                  <Label
                    htmlFor={`sub-time-${index}`}
                    className="text-xs md:hidden"
                  >
                   Campaign Starts In <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`sub-time-${index}`}
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
                    className="h-8 text-sm"
                    inputMode="numeric"
                    maxLength={3}
                  />
                </div>

                <div className="flex items-end justify-center pb-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                    onClick={() => confirmRemoveSub(index)}
                    type="button"
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
              onClick={() => navigate("/pipeline-list")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || isLoadingTemplates}
              className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
            >
              {isLoading ? "Creating..." : "Create Pipeline"}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" /> Remove Sub
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this sub pipeline entry? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteTargetIndex(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={removeSub}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
};

export default AddPipeline;
