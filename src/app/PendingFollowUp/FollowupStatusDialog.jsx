import useApiToken from "@/components/common/UseToken";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import BASE_URL from "@/config/BaseUrl";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";

const FollowupStatusDialog = ({
  open,
  onOpenChange,
  followupId,
  onSuccess,
  currentStatus,
}) => {
  const token = useApiToken();
  const { toast } = useToast();

  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  const { data: statusData } = useQuery({
    queryKey: ["companyStatus"],
    queryFn: async () => {
      const res = await axios.get(
        `${BASE_URL}/api/panel-fetch-company-status`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return res.data.companyStatus;
    },
  });

  useEffect(() => {
    if (open) {
      setSelectedStatus(currentStatus);
    }
  }, [open, currentStatus]);

  const handleSubmit = async (value) => {
    if (!followupId || value === selectedStatus) return;

    setIsLoading(true);
    try {
      const res = await axios.put(
        `${BASE_URL}/api/panel-update-followup/${followupId}`,
        { data_status: value },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res?.data?.code === 200) {
        toast({
          title: "Success",
          description: res.data.msg || "Follow-up updated",
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error(res?.data?.msg);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Update failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !isLoading && onOpenChange(v)}>
      <DialogContent className="max-w-[320px] p-4">
        <div className="grid gap-3">
          <Label className="text-sm font-medium">Change Status</Label>

          <div className="flex flex-col items-center gap-2">
            {statusData?.map((status) => {
              const isActive = status.companyStatus === selectedStatus;

              return (
                <Button
                  key={status.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  disabled={isLoading}
                  className={`w-full max-w-[200px] capitalize ${
                    isActive ? "bg-blue-600 text-white" : "hover:bg-blue-50"
                  }`}
                  onClick={() => handleSubmit(status.companyStatus)}
                >
                  {status.companyStatus}
                </Button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowupStatusDialog;
