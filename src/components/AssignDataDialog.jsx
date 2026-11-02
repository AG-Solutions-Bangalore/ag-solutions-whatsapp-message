import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import useApiToken from "@/components/common/UseToken";
import { ButtonConfig } from "@/config/ButtonConfig";

const AssignDataDialog = ({ open, onOpenChange, userId, onSuccess }) => {
  const [noOfAssign, setNoOfAssign] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const token = useApiToken();

  const { data: statusData } = useQuery({
    queryKey: ["pendingdatacount"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/api/panel-fetch-pending-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: open,
  });

  const handleSubmit = async () => {
    if (!noOfAssign || Number(noOfAssign) <= 0) {
      toast({
        title: "Error",
        description: "Enter valid number to assign",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/panel-assign-user-data`,
        {
          user_id: userId,
          no_of_data: Number(noOfAssign),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data?.code === 200) {
        toast({
          title: "Success",
          description: res.data.msg || "Data assigned successfully",
        });
        onSuccess?.();
        onOpenChange(false);
      } else {
        throw new Error(res.data?.msg);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setNoOfAssign("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Assign Data</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Total Assignable</Label>
            <Input value={statusData?.pendind_count || 0} disabled />
          </div>

          <div className="grid gap-2">
            <Label>No of Assign</Label>
            <Input
              type="number"
              min={1}
              max={statusData?.pendind_count || 0}
              value={noOfAssign}
              onChange={(e) => setNoOfAssign(e.target.value)}
              placeholder="Enter number"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {isLoading ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignDataDialog;
