import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { createApplication } from "@/lib/account.functions";

const CHANNELS = ["Official website / app", "Common Service Centre (CSC)", "Bank branch", "Gram Panchayat / Ward office", "Anganwadi / health centre", "Other"];

export function TrackApplicationDialog({
  schemeId,
  schemeName,
  children,
}: {
  schemeId: string;
  schemeName: string;
  children: ReactNode;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const create = useServerFn(createApplication);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [via, setVia] = useState(CHANNELS[0] as string);

  const onOpenChange = (next: boolean) => {
    if (next && !user) {
      toast("Sign in to track applications");
      void navigate({ to: "/auth", search: { redirect: window.location.pathname } });
      return;
    }
    setOpen(next);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await create({ data: { schemeId, reference_no: ref, applied_on: date, lodged_via: via } });
      await qc.invalidateQueries({ queryKey: ["account"] });
      toast.success("Application added to your tracker");
      setOpen(false);
      void navigate({ to: "/tracker" });
    } catch {
      toast.error("Couldn't save the application. Please check the details.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Track your application</DialogTitle>
          <DialogDescription>
            Already applied for {schemeName}? Add it here to keep the reference number and progress in one place.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ref">Application / reference number</Label>
            <Input id="ref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. UP123456789" maxLength={60} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="applied">Applied on</Label>
              <Input id="applied" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Applied through</Label>
              <Select value={via} onValueChange={setVia}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Add to tracker"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
