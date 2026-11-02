import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import BASE_URL from "@/config/BaseUrl";
import useApiToken from "../common/UseToken";

const CompanyListToogle = ({ initialStatus, companyId, onStatusChange }) => {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const token = useApiToken();
  const handleToggle = async () => {
    setIsLoading(true);
    const newStatus = status === "Active" ? "Inactive" : "Active";

    try {
      const response = await axios.put(
        `${BASE_URL}/api/panel-update-company-status/${companyId}`,
        { company_status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data?.code === 200) {
        toast({
          title: "Success",
          description:
            response?.data?.msg || `Team status changed to ${newStatus}`,
        });

        setStatus(newStatus);
        if (onStatusChange) {
          onStatusChange(newStatus);
        }
      } else {
        throw new Error(response?.data?.msg || "Failed to update status");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center space-x-1 px-2 py-1 rounded 
      ${
        status === "Active"
          ? "text-green-800 hover:bg-green-100"
          : "text-gray-800 hover:bg-gray-100"
      } transition-colors`}
    >
      <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      <span>{status}</span>
    </button>
  );
};

export default CompanyListToogle;
