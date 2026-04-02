"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Plus, RefreshCw, CheckCircle2, XCircle,
  Crown, Calendar, Save, AlertCircle, Pencil,
} from "lucide-react";
import api from "@/lib/axios";

type Campaign = {
  id: number;
  name: string;
  nameAm: string | null;
  starterTitle: string | null;
  starterDescription: string | null;
  invitationTitle: string | null;
  invitationDescription: string | null;
  startDate: string;
  endDate: string | null;
  isEnabled: boolean;
  isCurrent: boolean;
  isActive: boolean;
  createdAt: string;
};

const inputCls = "w-full bg-slate-50 border border-slate-200 text-[#004360] font-normal rounded-2xl py-4 px-4 focus:ring-2 focus:ring-[#FF6B0B]/50 focus:border-[#FF6B0B]/50 outline-none transition-all";
const textareaCls = "w-full max-w-full box-border bg-slate-50 border border-slate-200 text-[#004360] font-normal rounded-2xl py-4 px-4 focus:ring-2 focus:ring-[#FF6B0B]/50 focus:border-[#FF6B0B]/50 outline-none transition-all min-h-[120px] resize-y";
const labelCls = "text-[12px] font-bold text-[#004360] uppercase tracking-widest";
const sectionHeaderCls = "col-span-full text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 border-b border-slate-100 pb-2 mt-2";

type FormState = {
  nameAm: string;
  starterTitle: string;
  starterDescription: string;
  invitationTitle: string;
  invitationDescription: string;
  startDate: string;
  endDate: string;
};

const emptyForm = (): FormState => ({
  nameAm: "",
  starterTitle: "",
  starterDescription: "",
  invitationTitle: "",
  invitationDescription: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
});

function CampaignForm({
  form, setForm, onSubmit, saving, submitLabel,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onSubmit: () => void;
  saving: boolean;
  submitLabel: React.ReactNode;
}) {
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 col-span-full">
          <label className={labelCls}>Campaign Name (Amharic)</label>
          <input value={form.nameAm} onChange={set("nameAm")} required className={inputCls} placeholder="e.g. የትንሳኤ በዓል" />
        </div>

        <div className={sectionHeaderCls}>Starter Section — shown when user clicks /start</div>

        <div className="space-y-2">
          <label className={labelCls}>Starter Title</label>
          <input value={form.starterTitle} onChange={set("starterTitle")} className={inputCls} placeholder="e.g. ለወዳጅዎ ያጋሩ፤ በወጋገን ይሸለሙ!" />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Starter Description</label>
          <textarea value={form.starterDescription} onChange={set("starterDescription")} className={textareaCls}
            placeholder={"የወጋገን ባንክን ይፋዊ ቴሌግራም ገጽ ይቀላቀሉ...\no 1ኛ ሙክት በግ\no 2ኛ ቅርጫ ስጋ\n\nLines starting with o, -, *, •, or 1. become list items."} />
        </div>

        <div className={sectionHeaderCls}>Invitation Section — shown in the shared message when A invites B</div>

        <div className="space-y-2">
          <label className={labelCls}>Invitation Title</label>
          <input value={form.invitationTitle} onChange={set("invitationTitle")} className={inputCls} placeholder="e.g. ለወዳጅዎ ያጋሩ፤ በወጋገን ይሸለሙ!" />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Invitation Description</label>
          <textarea value={form.invitationDescription} onChange={set("invitationDescription")} className={textareaCls}
            placeholder={"Use {username} for the inviter's name.\ne.g. ይህ {username} የተላከ መረጃ ነው!\nየወጋገን ባንክን ይፋዊ ቴሌግራም ገጽ ይቀላቀሉ...\n1ኛ ሙክት በግ\n2ኛ ቅርጫ ስጋ"} />
        </div>

        <div className="space-y-2">
          <label className={labelCls}>Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="date" value={form.startDate} onChange={set("startDate")} required className={inputCls + " pl-12"} />
          </div>
        </div>
        <div className="space-y-2">
          <label className={labelCls}>End Date (Optional)</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="date" value={form.endDate} onChange={set("endDate")} className={inputCls + " pl-12"} />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 flex justify-end">
        <button onClick={onSubmit} disabled={saving}
          className="flex items-center gap-3 px-8 py-4 bg-[#FF6B0B] text-white rounded-2xl font-bold text-[14px] shadow-xl shadow-[#FF6B0B]/20 hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95">
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm());

  const currentCampaign = useMemo(() => campaigns.find((c) => c.isCurrent) || null, [campaigns]);

  const fetchCampaigns = async () => {
    setLoading(true); setError(null);
    try { const { data } = await api.get<Campaign[]>("/campaigns"); setCampaigns(data); }
    catch (err: any) { setError(err?.response?.data?.message || "Failed to fetch campaigns"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); };

  const createCampaign = async () => {
    setSaving(true); setError(null);
    try {
      await api.post("/campaigns", {
        name: form.nameAm.trim(),
        nameAm: form.nameAm.trim() || null,
        starterTitle: form.starterTitle.trim() || null,
        starterDescription: form.starterDescription.trim() || null,
        invitationTitle: form.invitationTitle.trim() || null,
        invitationDescription: form.invitationDescription.trim() || null,
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      });
      setForm(emptyForm()); flash("Campaign created"); await fetchCampaigns();
    } catch (err: any) { setError(err?.response?.data?.message || "Failed to create campaign"); }
    finally { setSaving(false); }
  };

  const setCurrent = async (id: number) => {
    setSaving(true); setError(null);
    try { await api.patch(`/campaigns/${id}/current`); flash("Current campaign updated"); await fetchCampaigns(); }
    catch (err: any) { setError(err?.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const setEnabled = async (id: number, isEnabled: boolean) => {
    setSaving(true); setError(null);
    try { await api.patch(`/campaigns/${id}/enabled`, { isEnabled }); flash(isEnabled ? "Enabled" : "Disabled"); await fetchCampaigns(); }
    catch (err: any) { setError(err?.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const startEdit = (c: Campaign) => {
    setEditingId(c.id);
    setEditForm({
      nameAm: c.nameAm || "",
      starterTitle: c.starterTitle || "",
      starterDescription: c.starterDescription || "",
      invitationTitle: c.invitationTitle || "",
      invitationDescription: c.invitationDescription || "",
      startDate: new Date(c.startDate).toISOString().slice(0, 10),
      endDate: c.endDate ? new Date(c.endDate).toISOString().slice(0, 10) : "",
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true); setError(null);
    try {
      await api.patch(`/campaigns/${editingId}`, {
        name: editForm.nameAm.trim(),
        nameAm: editForm.nameAm.trim() || null,
        starterTitle: editForm.starterTitle.trim() || null,
        starterDescription: editForm.starterDescription.trim() || null,
        invitationTitle: editForm.invitationTitle.trim() || null,
        invitationDescription: editForm.invitationDescription.trim() || null,
        startDate: editForm.startDate ? new Date(editForm.startDate).toISOString() : undefined,
        endDate: editForm.endDate ? new Date(editForm.endDate).toISOString() : null,
      });
      flash("Campaign updated"); setEditingId(null); await fetchCampaigns();
    } catch (err: any) { setError(err?.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
        <div className="space-y-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <div className="px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-normal uppercase tracking-[0.3em]">Campaign Control</div>
          </motion.div>
          <h1 className="text-[36px] font-bold tracking-tight text-[#004360]">Campaigns</h1>
          <p className="text-slate-500 font-normal text-[14px] max-w-2xl">Create and manage campaigns. The bot uses the current enabled campaign for referral links.</p>
        </div>
        <button onClick={fetchCampaigns} disabled={loading || saving} className="p-5 glass rounded-2xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all shadow-sm active:scale-95 disabled:opacity-50">
          <RefreshCw className={`w-6 h-6 ${loading ? "animate-spin" : ""}`} />
        </button>
      </header>

      <div className="glass rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl"><Target className="w-6 h-6 text-blue-500" /></div>
            <div>
              <h2 className="text-[16px] font-bold text-[#004360]">Create Campaign</h2>
              <p className="text-[12px] font-normal text-slate-400">Current: <span className="font-bold">{currentCampaign ? (currentCampaign.nameAm || currentCampaign.name) : "None"}</span></p>
            </div>
          </div>
          <Crown className="w-5 h-5 text-amber-500" />
        </div>

        <div className="p-10 space-y-6">
          <AnimatePresence>
            {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-[14px] font-bold flex items-center gap-3"><AlertCircle className="w-5 h-5 flex-shrink-0" />{error}</motion.div>}
            {success && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl text-[14px] font-bold flex items-center gap-3"><CheckCircle2 className="w-5 h-5 flex-shrink-0" />{success}</motion.div>}
          </AnimatePresence>
          <CampaignForm form={form} setForm={setForm} onSubmit={createCampaign} saving={saving}
            submitLabel={saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Create Campaign</>} />
        </div>
      </div>

      <div className="glass rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="p-3 bg-slate-500/10 rounded-2xl"><Save className="w-6 h-6 text-slate-500" /></div>
          <div><h2 className="text-[16px] font-bold text-[#004360]">Campaign List</h2><p className="text-[12px] font-normal text-slate-400">Enable, set current, or edit campaigns</p></div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16"><RefreshCw className="w-8 h-8 text-slate-300 animate-spin" /></div>
        ) : campaigns.length === 0 ? (
          <div className="text-center p-16 text-slate-400 font-bold">No campaigns yet.</div>
        ) : (
          <div className="p-10 space-y-4">
            {campaigns.map((c) => (
              <div key={c.id} className="p-6 rounded-[2rem] border border-slate-100 bg-white/60 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-[16px] font-bold text-[#004360]">{c.nameAm || c.name}</p>
                    {c.isCurrent && <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-normal uppercase tracking-widest flex items-center gap-1.5"><Crown className="w-3.5 h-3.5" />current</span>}
                    {c.isEnabled
                      ? <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-normal uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />enabled</span>
                      : <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-normal uppercase tracking-widest flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" />disabled</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button onClick={() => startEdit(c)} disabled={saving || loading} className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-[12px] hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"><Pencil className="w-4 h-4" />Edit</button>
                    <button onClick={() => setCurrent(c.id)} disabled={saving || !c.isEnabled} className="px-6 py-3 rounded-2xl bg-[#004360] text-white font-bold text-[12px] hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95">Set Current</button>
                    <button onClick={() => setEnabled(c.id, !c.isEnabled)} disabled={saving} className={`px-6 py-3 rounded-2xl font-bold text-[12px] hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95 ${c.isEnabled ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"}`}>{c.isEnabled ? "Disable" : "Enable"}</button>
                  </div>
                </div>

                <p className="text-[12px] text-slate-400">Start: {new Date(c.startDate).toLocaleDateString()}{c.endDate ? ` | End: ${new Date(c.endDate).toLocaleDateString()}` : ""}</p>

                {c.starterTitle && <div className="text-[12px] text-slate-500"><span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Starter: </span>{c.starterTitle}</div>}
                {c.invitationTitle && <div className="text-[12px] text-slate-500"><span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Invitation: </span>{c.invitationTitle}</div>}

                {editingId === c.id && (
                  <div className="mt-2 pt-4 border-t border-slate-100 space-y-4">
                    <CampaignForm form={editForm} setForm={setEditForm} onSubmit={saveEdit} saving={saving}
                      submitLabel={saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>} />
                    <button onClick={() => setEditingId(null)} disabled={saving} className="px-6 py-3 rounded-2xl bg-slate-200 text-slate-700 font-bold text-[12px] hover:-translate-y-1 transition-all disabled:opacity-50">Cancel</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
