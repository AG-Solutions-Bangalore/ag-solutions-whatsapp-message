import useApiToken from "@/components/common/UseToken";
import { SearchSelect } from "@/components/common/SearchSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import BASE_URL from "@/config/BaseUrl";
import {EXCEL_URL}  from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import {
  Download,
  FileImage,
  FileSpreadsheet,
  SquarePlus,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";

const CreateUploadData = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingBranches, setIsFetchingBranches] = useState(false);
  const [branches, setBranches] = useState([]);
  const { toast } = useToast();
  const token = useApiToken();

  const [formData, setFormData] = useState({
    data_type: "Individual",
    uploaded_file: null,
    file_attached: "No",
    data_image: null,
    message: "",
    branch_id: "",
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        data_type: "Individual",
        uploaded_file: null,
        file_attached: "No",
        data_image: null,
        message: "",
        branch_id: "",
      });
      setBranches([]);
    }
  }, [open]);

  // Fetch branches when dialog opens
  useEffect(() => {
    if (open) {
      fetchBranches();
    }
  }, [open]);

  const fetchBranches = async () => {
    setIsFetchingBranches(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/panel-fetch-branch`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Directly set branches from response.data.data (no 'code' check)
      if (response?.data?.data && Array.isArray(response.data.data)) {
        setBranches(response.data.data);
      } else {
        toast({
          title: "Error",
          description: "Invalid branch data received",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Could not load branches",
        variant: "destructive",
      });
    } finally {
      setIsFetchingBranches(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: e.target.files[0] || null,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    let errors = [];
    if (!formData.uploaded_file) errors.push("Please upload an Excel file");
    if (!formData.branch_id) errors.push("Please select a branch");
    if (formData.file_attached === "Yes" && !formData.data_image)
      errors.push("Please upload an image/PDF file.");
    if (formData.data_type === "Common" && !formData.message)
      errors.push("Please enter a message.");

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

    const data = new FormData();
    data.append("data_type", formData.data_type);
    data.append("uploaded_file", formData.uploaded_file);
    data.append("file_attached", formData.file_attached);
    data.append("data_image", formData.data_image);
    data.append("message", formData.message);
    data.append("branch_id", formData.branch_id);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/panel-create-upload-data`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response?.data?.code === 200) {
        toast({
          title: "Success",
          description: response?.data?.msg || "Data created successfully!",
        });
        setOpen(false);
        if (onSuccess) onSuccess();
      } else if (response?.data?.code === 400) {
        toast({
          title: "Error",
          description: response?.data?.msg || "Duplicate User!",
          variant: "destructive",
        });
      } else {
        throw new Error(response?.data?.msg || "Failed to create user.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
        >
          <SquarePlus className="h-4 w-4 mr-2" /> Upload Data
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-md bg-gradient-to-b from-white to-gray-50 shadow-lg border-yellow-200 p-0"
        aria-describedby={undefined}
      >
        <DialogHeader className="bg-yellow-50 px-4 pt-4 pb-2 border-b border-yellow-100">
          <DialogTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <Upload className="h-4 w-4 mr-2 text-yellow-500" />
            Upload New Data
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 py-3 space-y-3">
          {/* Branch Dropdown */}
          <div className="space-y-1.5">
            <Label
              htmlFor="branch"
              className="text-xs font-medium text-gray-700"
            >
              Branch *
            </Label>
            <SearchSelect
              options={branches}
              value={formData.branch_id}
              onChange={(val) => handleInputChange("branch_id", val)}
              placeholder="Select Branch"
              disabled={isFetchingBranches}
              getLabel={(b) => b.branch_name || b.name || b.id}
              getValue={(b) => String(b.id)}
            />
            {isFetchingBranches && (
              <p className="text-xs text-gray-500">Loading branches...</p>
            )}
          </div>

          {/* Data Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">
              Data Type
            </Label>
            <RadioGroup
              value={formData.data_type}
              onValueChange={(value) => handleInputChange("data_type", value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-1 bg-gray-50 px-3 py-1 rounded-md border border-gray-100 hover:bg-yellow-50">
                <RadioGroupItem
                  value="Individual"
                  id="individual"
                  className="text-black h-4 w-4"
                />
                <Label htmlFor="individual" className="cursor-pointer text-sm">
                  Individual
                </Label>
              </div>
              <div className="flex items-center space-x-1 bg-gray-50 px-3 py-1 rounded-md border border-gray-100 hover:bg-yellow-50">
                <RadioGroupItem
                  value="Common"
                  id="common"
                  className="text-black h-4 w-4"
                />
                <Label htmlFor="common" className="cursor-pointer text-sm">
                  Common
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Uploaded File */}
          <div className="space-y-1.5">
            <Label
              htmlFor="uploaded_file"
              className="text-xs font-medium text-gray-700 flex items-center"
            >
              <FileSpreadsheet className="h-3 w-3 mr-1 text-green-500" />
              Excel File
            </Label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-2 hover:border-yellow-300">
              <Input
                id="uploaded_file"
                type="file"
                accept=".xls,.xlsx"
                onChange={(e) => handleFileChange(e, "uploaded_file")}
                className="text-xs p-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload Excel (.xls/.xlsx)
              </p>
            </div>
            <Button
  variant="outline"
  size="sm"
  onClick={() =>
    window.open(
      `${EXCEL_URL}/${formData.data_type === "Individual" ? "Individual.xlsx" : "Common.xlsx"}`,
      "_blank"
    )
  }
  className="text-xs h-7 px-2 bg-gray-50 hover:bg-yellow-50 border-gray-200"
>
  <Download className="h-3 w-3 mr-1" />
  Download {formData.data_type} Sample
</Button>
          </div>

          {/* File Attached */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">
              File Attached
            </Label>
            <RadioGroup
              value={formData.file_attached}
              onValueChange={(value) =>
                handleInputChange("file_attached", value)
              }
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-1 bg-gray-50 px-3 py-1 rounded-md border border-gray-100 hover:bg-yellow-50">
                <RadioGroupItem
                  value="Yes"
                  id="yes"
                  className="text-black h-4 w-54"
                />
                <Label htmlFor="yes" className="cursor-pointer text-sm">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-1 bg-gray-50 px-3 py-1 rounded-md border border-gray-100 hover:bg-yellow-50">
                <RadioGroupItem
                  value="No"
                  id="no"
                  className="text-black h-4 w-4"
                />
                <Label htmlFor="no" className="cursor-pointer text-sm">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Data Image (conditional) */}
          {formData.file_attached === "Yes" && (
            <div className="space-y-1.5 animate-fadeIn">
              <Label
                htmlFor="data_image"
                className="text-xs font-medium text-gray-700 flex items-center"
              >
                <FileImage className="h-3 w-3 mr-1 text-blue-500" />
                Image/PDF
              </Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-2 hover:border-yellow-300">
                <Input
                  id="data_image"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, "data_image")}
                  className="text-xs p-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload image or PDF
                </p>
              </div>
            </div>
          )}

          {/* Message (conditional) */}
          {formData.data_type === "Common" && (
            <div className="space-y-1.5 animate-fadeIn">
              <Label
                htmlFor="message"
                className="text-xs font-medium text-gray-700"
              >
                Message
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder="Enter message here..."
                className="min-h-[80px] text-sm resize-none border-gray-200 focus:border-yellow-300 focus:ring focus:ring-yellow-100"
              />
            </div>
          )}
        </div>

        <DialogFooter className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="h-8 px-3 border-gray-200 hover:bg-gray-100 text-gray-700 text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || isFetchingBranches}
            loading={isLoading}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {isLoading ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload className="mr-1.5 h-3 w-3" />
                Upload Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUploadData;
