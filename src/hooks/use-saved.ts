import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { getSavedIds, toggleSaved } from "@/lib/account.functions";
import { useAuth } from "./use-auth";

export function useSavedSchemes() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const fetchIds = useServerFn(getSavedIds);
  const toggleFn = useServerFn(toggleSaved);

  const { data } = useQuery({
    queryKey: ["account", "savedIds", user?.id],
    queryFn: () => fetchIds(),
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: (schemeId: string) => toggleFn({ data: { schemeId } }),
    onSuccess: (res) => {
      toast.success(res.saved ? "Saved to your list" : "Removed from saved schemes");
      void qc.invalidateQueries({ queryKey: ["account"] });
    },
    onError: () => toast.error("Couldn't update saved schemes. Please try again."),
  });

  const savedIds = new Set(user ? (data ?? []) : []);
  const toggle = (schemeId: string) => {
    if (!user) {
      toast("Sign in to save schemes", { description: "Your saved list stays with your account." });
      void navigate({ to: "/auth", search: { redirect: window.location.pathname } });
      return;
    }
    mutation.mutate(schemeId);
  };
  return { savedIds, toggle, pending: mutation.isPending };
}
