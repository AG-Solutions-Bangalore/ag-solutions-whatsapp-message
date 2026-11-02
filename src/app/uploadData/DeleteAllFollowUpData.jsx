import useApiToken from "@/components/common/UseToken";
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
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

const DeleteAllFollowUpData = ({
  open,
  onOpenChange,
  onSuccess,
  followupdeleteId,
  formData,
  setFormData,
  handleStatusChange,
  handleInputChange,
}) => {
  const token = useApiToken();

  const [isLoading, setIsLoading] = useState(false);
  const { data: statusData, isLoading: statusLoading } = useQuery({
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
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      if (!formData.data_created) {
        toast({
          title: "Error",
          description: "Please select the Followup date.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      const response = await axios.post(
        `${BASE_URL}/api/panel-delete-upload-data-all`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response?.data?.code === 200) {
        toast({
          title: "Success",
          description: response?.data?.msg || "Deleted successfully!",
        });
        onSuccess();
        onOpenChange(false);
        setFormData({
          data_created: "",
          data_status: "",
        });
      } else if (response?.data?.code === 400) {
        toast({
          title: "Error",
          description: response?.data?.msg || "Duplicate User!",
          variant: "destructive",
        });
      } else {
        throw new Error(response?.data?.msg || "Failed to delete follow-up.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteAll = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/panel-delete-upload-datas`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response?.data?.code === 200) {
        toast({
          title: "Success",
          description: response?.data?.msg || "Deleted successfully!",
        });
        onSuccess();
        onOpenChange(false);
      } else if (response?.data?.code === 400) {
        toast({
          title: "Error",
          description: response?.data?.msg || "Duplicate User!",
          variant: "destructive",
        });
      } else {
        throw new Error(response?.data?.msg || "Failed to delete follow-up.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
        </DialogHeader>
        This action cannot be undone. This will permanently delete the selected
        company status.{" "}
        <div className="space-y-3">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.data_status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {statusData?.map((status) => (
                  <SelectItem key={status.id} value={status.companyStatus}>
                    {status.companyStatus}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="data_created" className="text-right">
              Date<span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              id="data_created"
              name="data_created"
              value={formData.data_created}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleDeleteAll}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} `}
          >
            Delete All
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            loading={isLoading}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} mb-2`}
          >
            {isLoading ? <>Deleteting...</> : "Delete Follow-up"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAllFollowUpData;
