import useApiToken from "@/components/common/UseToken";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import React, { useEffect, useState } from "react";

const ExchangeFollowupDialog = ({ open, onOpenChange, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fromStatus, setFromStatus] = useState("");
  const [toStatus, setToStatus] = useState("");

  const { toast } = useToast();
  const token = useApiToken();

  const { data: statusData = [] } = useQuery({
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
    enabled: open,
  });

  /* Submit */
  const handleSubmit = async () => {
    if (!fromStatus || !toStatus) {
      toast({
        title: "Error",
        description: "Please select both From and To status",
        variant: "destructive",
      });
      return;
    }

    if (fromStatus === toStatus) {
      toast({
        title: "Error",
        description: "From Status and To Status cannot be the same",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/panel-update-upload-data-exchangestatus`,
        {
          data_fromstatus: fromStatus,
          data_tostatus: toStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response?.data?.code === 200) {
        toast({
          title: "Success",
          description: response?.data?.msg || "Status exchanged successfully",
        });
        onSuccess?.();
        onOpenChange(false);
      } else {
        throw new Error(response?.data?.msg);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to exchange status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* Reset on open */
  useEffect(() => {
    if (open) {
      setFromStatus("");
      setToStatus("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Exchange Follow-up Status</DialogTitle>
        </DialogHeader>

        {/* GRID: 1 col mobile, 2 col md */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* From Status */}
          <div className="grid gap-2">
            <Label>
              From Status<span className="text-red-500">*</span>
            </Label>
            <Select value={fromStatus} onValueChange={setFromStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select from status" />
              </SelectTrigger>
              <SelectContent>
                {statusData.map((status) => (
                  <SelectItem key={status.id} value={status.companyStatus}>
                    {status.companyStatus}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* To Status */}
          <div className="grid gap-2">
            <Label>
              To Status<span className="text-red-500">*</span>
            </Label>
            <Select value={toStatus} onValueChange={setToStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select to status" />
              </SelectTrigger>
              <SelectContent>
                {statusData.map((status) => (
                  <SelectItem key={status.id} value={status.companyStatus}>
                    {status.companyStatus}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            loading={isLoading}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {isLoading ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExchangeFollowupDialog;
