import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertTriangle, Pencil, Plus, Radio, Satellite, Shield, Trash2 } from "lucide-react";

import api from "@/lib/api";
import { useLiveIntelligence } from "@/hooks/useLiveIntelligence";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const statusIcons = {
  Active: Satellite,
  Critical: AlertTriangle,
  Monitoring: Radio,
  Completed: Shield,
  planned: Radio,
  active: Satellite,
  completed: Shield,
};

function getMissions(data) {
  if (Array.isArray(data)) return data;
  return data?.missions || [];
}

function formatDate(value) {
  if (!value) return "Live";
  return new Date(value).toLocaleString();
}

export default function Missions() {
  useLiveIntelligence();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["missions"],
    queryFn: async () => {
      const res = await api.get("/missions/");
      return res.data;
    },
    retry: 1,
    refetchInterval: 30000,
  });

  const missions = getMissions(data);

  const [mutationError, setMutationError] = useState(null);

  const createMut = useMutation({
    mutationFn: async (payload) => (await api.post("/missions/", payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      setFormOpen(false);
      setMutationError(null);
    },
    onError: (err) => setMutationError(err?.response?.data?.detail || "Failed to create mission. Please try again."),
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, payload }) => (await api.put(`/missions/${id}`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      setEditing(null);
      setFormOpen(false);
      setMutationError(null);
    },
    onError: (err) => setMutationError(err?.response?.data?.detail || "Failed to update mission. Please try again."),
  });

  const deleteMut = useMutation({
    mutationFn: async (id) => (await api.delete(`/missions/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      setDeleteId(null);
      setMutationError(null);
    },
    onError: (err) => setMutationError(err?.response?.data?.detail || "Failed to delete mission. Please try again."),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-orbitron font-bold text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            MISSION CONTROL
          </h1>
          <p className="text-sm text-muted-foreground font-space mt-1">
            Operational missions linked to active Earth intelligence events
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> NEW MISSION
        </Button>
      </div>

      {mutationError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {mutationError}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Couldn't load missions from the backend. Check your connection and try again — if this
          keeps happening, open the browser console for details.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {missions.map((mission, index) => {
            const Icon = statusIcons[mission.status] || Satellite;
            const editable = typeof mission.id === "number";

            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold leading-tight">{mission.name || mission.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{mission.region}</p>
                    </div>
                  </div>
                  {editable && (
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(mission); setFormOpen(true); }}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(mission.id)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mt-4 line-clamp-3">{mission.objective}</p>

                <div className="mt-5 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{mission.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${mission.progress}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-white/50 p-2">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-xs font-semibold">{mission.status}</p>
                    </div>
                    <div className="rounded-xl bg-white/50 p-2">
                      <p className="text-xs text-muted-foreground">Events</p>
                      <p className="text-xs font-semibold">{mission.activeEvents || 0}</p>
                    </div>
                    <div className="rounded-xl bg-white/50 p-2">
                      <p className="text-xs text-muted-foreground">Health</p>
                      <p className="text-xs font-semibold">{mission.health}%</p>
                    </div>
                  </div>

                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Updated {formatDate(mission.lastUpdate)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogDescription>Delete this mission permanently?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMut.mutate(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={formOpen} onOpenChange={() => { setFormOpen(false); setEditing(null); }}>
        <DialogContent>
          <MissionForm
            initial={editing}
            onSubmit={(payload) =>
              editing
                ? updateMut.mutate({ id: editing.id, payload })
                : createMut.mutate(payload)
            }
            isLoading={createMut.isPending || updateMut.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MissionForm({ initial, onSubmit, isLoading }) {
  const [form, setForm] = useState({
    title: initial?.title || initial?.name || "",
    status: (initial?.status || "planned").toLowerCase(),
    description: initial?.description || "",
    objective: initial?.objective || "",
    region: initial?.region || "",
  });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input value={form.title} onChange={(event) => set("title", event.target.value)} />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(event) => set("description", event.target.value)} />
      </div>
      <div>
        <Label>Objective</Label>
        <Input value={form.objective} onChange={(event) => set("objective", event.target.value)} />
      </div>
      <div>
        <Label>Region</Label>
        <Input value={form.region} onChange={(event) => set("region", event.target.value)} />
      </div>
      <div>
        <Label>Status</Label>
        <Select value={form.status} onValueChange={(value) => set("status", value)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button disabled={isLoading} type="submit">
        {isLoading ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
