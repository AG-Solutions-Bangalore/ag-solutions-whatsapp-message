import useApiToken from "@/components/common/UseToken";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const DeleteFollowUp = ({
  open,
  onOpenChange,
  onSuccess,
  followupdeleteId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const token = useApiToken();

  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/panel-delete-upload-data/${followupdeleteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data?.code === 200) {
        toast({
          title: "Success",
          description: response?.data?.msg || "Deleted successfully!",
        });
        onSuccess();
        onOpenChange(false);
      } else if (response?.data?.code === 400) {
        toast({
          title: "Error",
          description: response?.data?.msg || "Duplicate User!",
          variant: "destructive",
        });
      } else {
        throw new Error(response?.data?.msg || "Failed to delete follow-up.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
        </DialogHeader>
        This action cannot be undone. This will permanently delete the selected
        company status.{" "}
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            loading={isLoading}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {isLoading ? <>Deleteting...</> : "Delete Follow-up"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteFollowUp;
