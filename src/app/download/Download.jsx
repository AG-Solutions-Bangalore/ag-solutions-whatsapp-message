import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Page from "../dashboard/page";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import { Loader2 } from "lucide-react";
import { ButtonConfig } from "@/config/ButtonConfig";
import useApiToken from "@/components/common/UseToken";

const Download = () => {
  const [formData, setFormData] = useState({
    from_date: "",
    to_date: "",
    data_status: "",
  });
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const token = useApiToken();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleStatusChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      data_status: value,
    }));
  };
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ["companyStatus"],
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-company-status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.companyStatus;
    },
  });

  const handleDownload = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    let errors = [];
    if (!formData.from_date) errors.push("From date is required.");
    if (!formData.to_date) errors.push("To date is required.");

    if (errors.length > 0) {
      toast({
        title: "Error",
        description: (
          <>
            {errors.map((err, index) => (
              <div key={index}>{err}</div>
            ))}
          </>
        ),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/panel-download-upload-data-report`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "download.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Downloaded Sucessfully!",
      });
      setFormData({
        from_date: "",
        to_date: "",
        data_status: "",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Error",
        description: "Error While Downloaded !",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page>
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-4 sm:p-3 md:h-44 border border-gray-200">
        <h2 className="text-lg font-semibold mb-2">Download</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="from_date" className="text-right">
              From Date<span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              id="from_date"
              name="from_date"
              value={formData.from_date}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="to_date" className="text-right">
              To Date<span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              id="to_date"
              name="to_date"
              value={formData.to_date}
              onChange={handleInputChange}
              required
            />
          </div>
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
        </div>{" "}
        <div className="mt-4 flex justify-center">
          <Button
            onClick={handleDownload}
            disabled={isLoading}
            loading={isLoading}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {isLoading ? <>Downloading...</> : "Download"}
          </Button>
        </div>
      </div>
    </Page>
  );
};

export default Download;
