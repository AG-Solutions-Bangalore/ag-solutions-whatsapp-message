import React, { useState } from "react";
import axios from "axios";
import { Check, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import BASE_URL from "@/config/BaseUrl";
import { useToast } from "@/hooks/use-toast";
import { ButtonConfig } from "@/config/ButtonConfig";
import useApiToken from "@/components/common/UseToken";

const StatusChangePopover = ({ enquiryId, onStatusUpdate }) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const token = useApiToken();

  const handleStatusChange = async () => {
    if (!status) {
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.put(
        `${BASE_URL}/api/panel-update-enquiry-status/${enquiryId}`,
        { enquiry_company_status: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.data?.code === 200) {
        toast({
          title: "Success",
          description: response?.data?.msg || "Status updated successfully!",
        });

        setTimeout(() => {
          setOpen(false);
          if (onStatusUpdate) onStatusUpdate();
        }, 200);
      } else {
        throw new Error(response?.data?.msg || "Failed to update status");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.msg || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Change status</span>
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Change Status</p>
          </TooltipContent>
        </Tooltip>

        <PopoverContent className="w-56 p-3" align="end">
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Change Status</h4>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Cancel">Cancel</SelectItem>
                <SelectItem value="User">User</SelectItem>
              </SelectContent>
            </Select>

            {error && <p className="text-destructive text-xs">{error}</p>}

            <div className="flex justify-end">
              <Button
                onClick={handleStatusChange}
                disabled={isSubmitting || success}
                loading={isSubmitting}
                className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
              >
                {isSubmitting ? (
                  <>Updating</>
                ) : success ? (
                  <>
                    <Check className="mr-2 h-3 w-3" />
                    Updated
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};

export default StatusChangePopover;
