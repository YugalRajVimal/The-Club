import { toast } from "react-toastify";
import { ApiRequestError } from "@/lib/api/adminClient";

export function toastApiError(err: unknown, fallback: string) {
  if (err instanceof ApiRequestError) {
    if (err.code === "FORBIDDEN") {
      toast.error("You don't have permission for this action.");
      return;
    }
    toast.error(err.message || fallback);
    return;
  }
  toast.error(fallback);
}
