"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Crown,
  Calendar,
  Save,
  AlertCircle,
  Pencil,
} from "lucide-react";
import api from "@/lib/axios";

type Campaign = {
  id: number;
  name: string;
  nameEn: string | null;
  nameAm: string | null;
  description: string | null;
  descriptionEn: string | null;
  descriptionAm: string | null;
  startDate: string;
  endDate: string | null;
  isEnabled: boolean;
  isCurrent: boolean;
  isActive: boolean;
  createdAt: string;
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [nameEn, setNameEn] = useState("");
  const [nameAm, setNameAm] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAm, setDescriptionAm] = useState("");
  const [startDate, setStartDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [endDate, setEndDate] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNameEn, setEditNameEn] = useState("");
  const [editNameAm, setEditNameAm] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDescriptionEn, setEditDescriptionEn] = useState("");
  const [editDescriptionAm, setEditDescriptionAm] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");

  const currentCampaign = useMemo(
    () => campaigns.find((c) => c.isCurrent) || null,
    [campaigns],
  );

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Campaign[]>("/campaigns");
      setCampaigns(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const createCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const resolvedName = (nameEn.trim() || nameAm.trim()).trim();
      await api.post("/campaigns", {
        name: resolvedName,
        nameEn: nameEn.trim() || null,
        nameAm: nameAm.trim() || null,
        description: description.trim() || null,
        descriptionEn: descriptionEn.trim() || null,
        descriptionAm: descriptionAm.trim() || null,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
      });
      setNameEn("");
      setNameAm("");
      setDescription("");
      setDescriptionEn("");
      setDescriptionAm("");
      setStartDate(new Date().toISOString().slice(0, 10));
      setEndDate("");
      setSuccess("Campaign created");
      await fetchCampaigns();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create campaign");
    } finally {
      setSaving(false);
    }
  };

  const setCurrent = async (id: number) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.patch(`/campaigns/${id}/current`);
      setSuccess("Current campaign updated");
      await fetchCampaigns();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to set current campaign",
      );
    } finally {
      setSaving(false);
    }
  };

  const setEnabled = async (id: number, isEnabled: boolean) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.patch(`/campaigns/${id}/enabled`, { isEnabled });
      setSuccess(isEnabled ? "Campaign enabled" : "Campaign disabled");
      await fetchCampaigns();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update campaign");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (c: Campaign) => {
    setEditingId(c.id);
    setEditNameEn(c.nameEn || "");
    setEditNameAm(c.nameAm || "");
    setEditDescription(c.description || "");
    setEditDescriptionEn(c.descriptionEn || c.description || "");
    setEditDescriptionAm(c.descriptionAm || "");
    setEditStartDate(new Date(c.startDate).toISOString().slice(0, 10));
    setEditEndDate(
      c.endDate ? new Date(c.endDate).toISOString().slice(0, 10) : "",
    );
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNameEn("");
    setEditNameAm("");
    setEditDescription("");
    setEditDescriptionEn("");
    setEditDescriptionAm("");
    setEditStartDate("");
    setEditEndDate("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const resolvedName = (editNameEn.trim() || editNameAm.trim()).trim();
      await api.patch(`/campaigns/${editingId}`, {
        name: resolvedName,
        nameEn: editNameEn.trim() || null,
        nameAm: editNameAm.trim() || null,
        description: editDescription.trim() || null,
        descriptionEn: editDescriptionEn.trim() || null,
        descriptionAm: editDescriptionAm.trim() || null,
        startDate: editStartDate
          ? new Date(editStartDate).toISOString()
          : undefined,
        endDate: editEndDate ? new Date(editEndDate).toISOString() : null,
      });
      setSuccess("Campaign updated");
      cancelEdit();
      await fetchCampaigns();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update campaign");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-normal uppercase tracking-[0.3em]">
              Campaign Control
            </div>
          </motion.div>
          <h1 className="text-[36px] font-bold tracking-tight text-[#004360]">
            Campaigns
          </h1>
          <p className="text-slate-500 font-normal text-[14px] max-w-2xl">
            Create and manage campaigns. The bot generates referral links only
            for the current enabled campaign.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCampaigns}
            disabled={loading || saving}
            className="p-5 glass rounded-2xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-6 h-6 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <div className="glass rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden relative">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <Target className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#004360]">
                Current Campaign
              </h2>
              <p className="text-[12px] font-normal text-slate-400">
                Link generation follows this campaign
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500">
            <Crown className="w-4 h-4 text-amber-500" />
            {currentCampaign ? currentCampaign.name : "None"}
          </div>
        </div>

        <form onSubmit={createCampaign} className="p-10 space-y-6">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-[14px] font-bold flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl text-[14px] font-bold flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#004360] uppercase tracking-widest">
                Title (English)
              </label>
              <input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 text-[#004360] font-normal rounded-2xl auto-transition py-4 px-4 focus:ring-2 focus:ring-[#FF6B0B]/50 focus:border-[#FF6B0B]/50 outline-none transition-all"
                placeholder="e.g., Resurrection Festival"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#004360] uppercase tracking-widest">
                Title (Amharic)
              </label>
              <input
                value={nameAm}
                onChange={(e) => setNameAm(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 text-[#004360] font-normal rounded-2xl auto-transition py-4 px-4 focus:ring-2 focus:ring-[#FF6B0B]/50 focus:border-[#FF6B0B]/50 outline-none transition-all"
                placeholder="e.g., የትንሳኤ በዓል"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#004360] uppercase tracking-widest">
                Description (Fallback)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ maxWidth: "100%" }}
                className="w-full max-w-full box-border bg-slate-50 border border-slate-200 text-[#004360] font-normal rounded-2xl auto-transition py-4 px-4 focus:ring-2 focus:ring-[#FF6B0B]/50 focus:border-[#FF6B0B]/50 outline-none transition-all min-h-[96px] resize"
                placeholder='Used only if English/Amharic description is empty. Supports {username} and {title}. Use lines starting with o, -, *, •, or 1. for bullet points.'
              />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#004360] uppercase tracking-widest">
                Description (English)
              </label>
              <textarea
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                style={{ maxWidth: "100%" }}
                className="w-full max-w-full box-border bg-slate-50 border border-slate-200 text-[#004360] font-normal rounded-2xl auto-transition py-4 px-4 focus:ring-2 focus:ring-[#FF6B0B]/50 focus:border-[#FF6B0B]/50 outline-none transition-all min-h-[96px] resize"
                placeholder='Shown to English-speaking users. Supports {username} and {title}. Use lines starting with o, -, *, •, or 1. for bullet points.'
              />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#004360] uppercase tracking-widest">
                Description (Amharic)
              </label>
              <textarea
                value={descriptionAm}
                onChange={(e) => setDescriptionAm(e.target.value)}
                style={{ maxWidth: "100%" }}
                className="w-full max-w-full box-border bg-slate-50 border border-slate-200 text-[#004360] font-normal rounded-2xl auto-transition py-4 px-4 focus:ring-2 focus:ring-[#FF6B0B]/50 focus:border-[#FF6B0B]/50 outline-none transition-all min-h-[96px] resize"
                placeholder="{username} እና {title} ይጠቀሙ። ለዝርዝር ነጥቦች መስመሮችን በ o ወይም - ወይም 1. ጀምሩ።"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#004360] uppercase tracking-widest">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-[#004360] font-normal rounded-2xl auto-transition py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#FF6B0B]/50 focus:border-[#FF6B0B]/50 outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#004360] uppercase tracking-widest">
                End Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-[#004360] font-normal rounded-2xl auto-transition py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#FF6B0B]/50 focus:border-[#FF6B0B]/50 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
            <button
              type="submit"
              disabled={saving || loading}
              className="flex items-center gap-3 px-8 py-4 bg-[#FF6B0B] text-white rounded-2xl font-bold text-[14px] shadow-xl shadow-[#FF6B0B]/20 hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95"
            >
              {saving ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              Create Campaign
            </button>
          </div>
        </form>
      </div>

      <div className="glass rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden relative">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-500/10 rounded-2xl">
              <Save className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#004360]">
                Campaign List
              </h2>
              <p className="text-[12px] font-normal text-slate-400">
                Enable/disable and select current campaign
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16">
            <RefreshCw className="w-8 h-8 text-slate-300 animate-spin" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center p-16 text-slate-400 font-bold">
            No campaigns created yet.
          </div>
        ) : (
          <div className="p-10 space-y-4">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="p-6 rounded-[2rem] border border-slate-100 bg-white/60 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3">
                    <p className="text-[16px] font-bold text-[#004360]">
                      {c.nameAm || c.nameEn || c.name}
                    </p>
                    {c.isCurrent && (
                      <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-normal uppercase tracking-widest flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5" />
                        current
                      </span>
                    )}
                    {c.isEnabled ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-normal uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        enabled
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-normal uppercase tracking-widest flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        disabled
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-500">
                    Start: {new Date(c.startDate).toLocaleDateString()}
                    {c.endDate
                      ? ` | End: ${new Date(c.endDate).toLocaleDateString()}`
                      : ""}
                  </p>
                  {c.descriptionAm ? (
                    <p className="text-[12px] text-slate-500 whitespace-pre-wrap">
                      {c.descriptionAm}
                    </p>
                  ) : null}
                  {c.descriptionEn ? (
                    <p className="text-[12px] text-slate-500 whitespace-pre-wrap">
                      {c.descriptionEn}
                    </p>
                  ) : null}
                  {c.description && !c.descriptionEn && !c.descriptionAm ? (
                    <p className="text-[12px] text-slate-500 whitespace-pre-wrap">
                      {c.description}
                    </p>
                  ) : null}

                  {editingId === c.id ? (
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">
                            Title (English)
                          </label>
                          <input
                            value={editNameEn}
                            onChange={(e) => setEditNameEn(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-[#004360] font-normal rounded-2xl auto-transition py-3 px-4 focus:ring-2 focus:ring-[#FF6B0B]/50 focus:border-[#FF6B0B]/50 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">
                            Title (Amharic)
                          </label>
                          <input
                            value={editNameAm}
                            onChange={(e) => setEditNameAm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-[#004360] font-normal rounded-2xl auto-transition py-3 px-4 focus:ring-2 focus:ring-[#FF6B0B]/50 focus:border-[#FF6B0B]/50 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">
                            Description (Fallback)
                          </label>
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            style={{ maxWidth: "100%" }}
                            className="w-full max-w-full box-border bg-slate-50 border border-slate-200 text-[#004360] font-normal rounded-2xl auto-transition py-3 px-4 focus:ring-2 focus:ring-[#FF6B0B]/50 focus:border-[#FF6B0B]/50 outline-none transition-all min-h-[84px] resize"
                            placeholder='Supports {username} and {title}. Use lines starting with o, -, *, •, or 1.'
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">
                            Description (English)
                          </label>
                          <textarea
                            value={editDescriptionEn}
                            onChange={(e) =>
                              setEditDescriptionEn(e.target.value)
                            }
                            style={{ maxWidth: "100%" }}
                            className="w-full max-w-full box-border bg-slate-50 border border-slate-200 text-[#004360] font-normal rounded-2xl auto-transition py-3 px-4 focus:ring-2 focus:ring-[#FF6B0B]/50 focus:border-[#FF6B0B]/50 outline-none transition-all min-h-[84px] resize"
                            placeholder='Supports {username} and {title}. Use lines starting with o, -, *, •, or 1.'
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">
                            Description (Amharic)
                          </label>
                          <textarea
                            value={editDescriptionAm}
                            onChange={(e) =>
                              setEditDescriptionAm(e.target.value)
                            }
                            style={{ maxWidth: "100%" }}
                            className="w-full max-w-full box-border bg-slate-50 border border-slate-200 text-[#004360] font-normal rounded-2xl auto-transition py-3 px-4 focus:ring-2 focus:ring-[#FF6B0B]/50 focus:border-[#FF6B0B]/50 outline-none transition-all min-h-[84px] resize"
                            placeholder="{username} እና {title} ይጠቀሙ። ለዝርዝር ነጥቦች መስመሮችን በ o ወይም - ወይም 1. ጀምሩ።"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={editStartDate}
                            onChange={(e) => setEditStartDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-[#004360] font-normal rounded-2xl auto-transition py-3 px-4 focus:ring-2 focus:ring-[#FF6B0B]/50 focus:border-[#FF6B0B]/50 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={editEndDate}
                            onChange={(e) => setEditEndDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-[#004360] font-normal rounded-2xl auto-transition py-3 px-4 focus:ring-2 focus:ring-[#FF6B0B]/50 focus:border-[#FF6B0B]/50 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="px-6 py-3 rounded-2xl bg-[#FF6B0B] text-white font-bold text-[12px] hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="px-6 py-3 rounded-2xl bg-slate-200 text-slate-700 font-bold text-[12px] hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => startEdit(c)}
                    disabled={saving || loading}
                    className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-[12px] hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setCurrent(c.id)}
                    disabled={saving || !c.isEnabled}
                    className="px-6 py-3 rounded-2xl bg-[#004360] text-white font-bold text-[12px] hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95"
                  >
                    Set Current
                  </button>
                  <button
                    onClick={() => setEnabled(c.id, !c.isEnabled)}
                    disabled={saving}
                    className={`px-6 py-3 rounded-2xl font-bold text-[12px] hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95 ${
                      c.isEnabled
                        ? "bg-rose-500 text-white"
                        : "bg-emerald-500 text-white"
                    }`}
                  >
                    {c.isEnabled ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
