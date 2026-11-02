
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BASE_URL from "@/config/BaseUrl";
import { useToast } from "@/hooks/use-toast";
import { ButtonConfig } from "@/config/ButtonConfig";
import useApiToken from "@/components/common/UseToken";

const EditTemplateDialog = ({
  open,
  onOpenChange,
  selectedUser,
  onSuccess,
}) => {
  const token = useApiToken();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    template_name: "",
    template_id: "",
    template_status: "",
    template_isImage: "No",
    template_no_of_values: "",
  });

  // Populate form when dialog opens with selected template
  useEffect(() => {
    if (open && selectedUser) {
      setFormData({
        template_name: selectedUser.template_name || "",
        template_id: selectedUser.template_id || "",
        template_status: selectedUser.template_status || "",
        template_isImage: selectedUser.template_isImage || "No",
        template_no_of_values:
          selectedUser.template_no_of_values ?? "",
      });
    }
  }, [open, selectedUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({ ...prev, template_status: value }));
  };

  // Handle Image Yes/No checkbox
  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      template_isImage: e.target.checked ? "Yes" : "No",
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    // Validation
    const errors = [];
    if (!formData.template_name.trim())
      errors.push("Template Name is required.");
    if (!formData.template_id.trim())
      errors.push("Template ID is required.");
    if (!formData.template_status)
      errors.push("Template Status is required.");

    if (errors.length > 0) {
      toast({
        title: "Error",
        description: (
          <>
            {errors.map((err, i) => (
              <div key={i}>{err}</div>
            ))}
          </>
        ),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/api/panel-update-template/${selectedUser.id}`,
        {
          ...formData,
          template_no_of_values:
            formData.template_no_of_values === ""
              ? ""
              : Number(formData.template_no_of_values),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response?.data?.code === 200) {
        toast({
          title: "Success",
          description: response?.data?.msg || "Template updated successfully!",
        });
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        throw new Error(response?.data?.msg || "Failed to update template.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to update template.",
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
          <DialogTitle>Edit Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="template_name">
              Template Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="template_name"
              name="template_name"
              value={formData.template_name}
              onChange={handleInputChange}
              placeholder="Enter template name"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="template_id">
              Template ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="template_id"
              name="template_id"
              value={formData.template_id}
              onChange={handleInputChange}
              placeholder="Enter template ID"
            />
          </div>

          {/* Template Is Image */}
          <div className="space-y-2">
            <Label>Template Is Image</Label>
            <div className="flex items-center gap-2">
              <input
                id="template_isImage"
                type="checkbox"
                checked={formData.template_isImage === "Yes"}
                onChange={handleImageChange}
                className="h-4 w-4 cursor-pointer accent-primary"
              />
              <Label
                htmlFor="template_isImage"
                className="cursor-pointer font-normal"
              >
                {formData.template_isImage === "Yes" ? "Yes" : "No"}
              </Label>
            </div>
          </div>

          {/* Template No Of Values */}
          <div className="space-y-1">
            <Label htmlFor="template_no_of_values">
              Template No. Of Values
            </Label>
            <Input
              id="template_no_of_values"
              name="template_no_of_values"
              type="number"
              min="0"
              value={formData.template_no_of_values}
              onChange={handleInputChange}
              placeholder="Enter number of values"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="status">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.template_status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
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
            loading={isLoading}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {isLoading ? "Updating..." : "Update Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTemplateDialog;
