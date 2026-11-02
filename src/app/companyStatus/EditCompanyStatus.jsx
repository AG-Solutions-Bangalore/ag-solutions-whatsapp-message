import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import { Loader2, Edit, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ButtonConfig } from "@/config/ButtonConfig";
import useApiToken from "@/components/common/UseToken";

const EditCompanyStatus = ({ companyStatusId }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    companyStatus: "",
  });
  const [originalData, setOriginalData] = useState(null);
  const token = useApiToken();

  // Fetch state data
  const fetchStateData = async () => {
    setIsFetching(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-company-status-by-id/${companyStatusId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Fix: Access the first item in the companyStatus array
      const companyStatusData = response.data.companyStatus[0] || {};

      setFormData({
        companyStatus: companyStatusData.companyStatus || "",
      });

      setOriginalData({
        companyStatus: companyStatusData.companyStatus || "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch company status data",
        variant: "destructive",
      });
      setOpen(false);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchStateData();
    }
  }, [open]);

  // Handle form submission
  const handleSubmit = async () => {
    const missingFields = [];
    if (!formData.companyStatus) missingFields.push("Company Status");
    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <div>
            <p>Please fill in the following fields:</p>
            <ul className="list-disc pl-5">
              {missingFields.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
          </div>
        ),
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${BASE_URL}/api/panel-update-companys-status/${companyStatusId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data.code == 200) {
        toast({
          title: "Success",
          description: response.data.msg,
        });

        await queryClient.invalidateQueries(["companyStatus"]);
        setOpen(false);
      } else {
        toast({
          title: "Error",
          description: response.data.msg,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update Company Status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if there are changes
  const hasChanges =
    originalData && formData.companyStatus !== originalData.companyStatus;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`transition-all duration-200 ${
                  isHovered ? "bg-blue-50" : ""
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Edit
                  className={`h-4 w-4 transition-all duration-200 ${
                    isHovered ? "text-blue-500" : ""
                  }`}
                />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Company Status</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent className="md:w-80">
        {isFetching ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Edit Company Status</h4>
              <p className="text-sm text-muted-foreground">
                Update company status details
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <label htmlFor="companyStatus" className="text-sm font-medium">
                  Company Status
                </label>
                <div className="relative">
                  <Input
                    id="companyStatus"
                    placeholder="Enter company status"
                    value={formData.companyStatus}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        companyStatus: e.target.value,
                      }))
                    }
                    className={hasChanges ? "pr-8 border-blue-200" : ""}
                  />
                  {hasChanges && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <RefreshCcw
                        className="h-4 w-4 text-blue-500 cursor-pointer hover:rotate-180 transition-all duration-300"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            companyStatus: originalData.companyStatus,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {hasChanges && (
                <Alert className="bg-blue-50 border-blue-200 mt-2">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-blue-600 text-sm">
                    You have unsaved changes
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isLoading || !hasChanges}
                className={`mt-2 relative overflow-hidden ${
                  hasChanges
                    ? `${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`
                    : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Company Status"
                )}
                {hasChanges && !isLoading && (
                  <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
                )}
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default EditCompanyStatus;
