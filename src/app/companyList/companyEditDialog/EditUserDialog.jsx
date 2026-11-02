import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import BASE_URL from "@/config/BaseUrl";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ButtonConfig } from "@/config/ButtonConfig";
import useApiToken from "@/components/common/UseToken";

const EditUserDialog = ({ open, onOpenChange, selectedUser, onSuccess }) => {
  const token = useApiToken();

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = React.useState({
    mobile: "",
    email: "",
    status: "",
  });

  // Update form data when selected user changes
  React.useEffect(() => {
    if (selectedUser) {
      setFormData({
        mobile: selectedUser.mobile || "",
        email: selectedUser.email || "",
        status: selectedUser.status || "",
      });
    }
  }, [selectedUser]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle status change in dropdown
  const handleStatusChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true);

    let errors = [];
    if (!formData.mobile) errors.push("Mobile is required.");
    if (!formData.email) errors.push("Email is required.");
    if (!formData.status) errors.push("Status is required.");
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
    if (!selectedUser) return;

    try {
      const response = await axios.put(
        `${BASE_URL}/api/panel-update-user/${selectedUser.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data?.code === 200) {
        toast({
          title: "Success",
          description: response?.data?.msg || "User updated successfully!",
        });

        setFormData({ name: "", mobile: "", email: "" });

        onOpenChange(false);
        if (onSuccess) onSuccess();

        // setOpen(false);
      } else if (response?.data?.code === 400) {
        toast({
          title: "Error",
          description: response?.data?.msg || "Duplicate User!",
          variant: "destructive",
        });
      } else {
        throw new Error(response?.data?.msg || "Failed to updated user.");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.msg || "Failed to updated user.",
        variant: "destructive",
      });
      console.error("Error updating user:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="mobile">
              Mobile <span className="text-red-500">*</span>
            </Label>

            <Input
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className="col-span-3"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              onKeyPress={(e) => {
                if (!/[0-9.]/.test(e.key) && e.key !== "Backspace") {
                  e.preventDefault();
                }
              }}
            />
          </div>
          <div>
            <Label htmlFor="email">
              Email<span className="text-red-500">*</span>
            </Label>

            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div>
            <Label htmlFor="status">
              Status<span className="text-red-500">*</span>
            </Label>

            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="col-span-3">
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
            onClick={handleSubmit}
            disabled={isLoading}
            loading={isLoading}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {isLoading ? <>Updatting...</> : "Update User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
