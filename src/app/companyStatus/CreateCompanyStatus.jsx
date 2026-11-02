import useApiToken from "@/components/common/UseToken";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { SquarePlus } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const CreateCompanyStatus = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyStatus: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = useApiToken();

  const { pathname } = useLocation();
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
      const response = await axios.post(
        `${BASE_URL}/api/panel-create-company-status`,
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

        setFormData({
          companyStatus: "",
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
        description: error.response?.data?.message || "Failed to create Buyer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {pathname === "/company-status" ? (
          <Button
            variant="default"
            className={` ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            <SquarePlus className="h-4 w-4 " /> Company Status
          </Button>
        ) : pathname === "/purchase/create" ||
          pathname === "/dispatch/create" ||
          "/purchase/edit" ? (
          <p className="text-xs text-red-600  w-32 hover:text-red-300 cursor-pointer">
            Company Status <span className="text-red-500 ml-1">*</span>
          </p>
        ) : (
          <span />
        )}
      </PopoverTrigger>
      <PopoverContent className="md:w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">
              Create New Company Status
            </h4>
            <p className="text-sm text-muted-foreground">
              Enter the details for the new Company Status
            </p>
          </div>
          <div className="grid gap-2">
            <Input
              id="companyStatus"
              placeholder="Enter Company Status"
              value={formData.companyStatus}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  companyStatus: e.target.value,
                }))
              }
            />

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
              className={`mt-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
            >
              {isLoading ? <>Creating...</> : "Create Company Status"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CreateCompanyStatus;
