'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import {
  Bell,
  Send,
  Clock,
  Calendar,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  History,
  Loader2,
  Phone,
  User,
  Scale,
  MapPin,
} from 'lucide-react';

interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
  court: string;
  nextHearing: string | null;
  status: string;
  client: { name: string; email: string; phone: string | null };
  junior: { id: string; name: string } | null;
}

interface ReminderRecord {
  id: string;
  recipientType: 'CLIENT' | 'JUNIOR';
  channel: string;
  message: string;
  sentAt: string | null;
  status: 'PENDING' | 'SENT' | 'FAILED';
  scheduledFor: string | null;
  createdAt: string;
  case: { caseNumber: string; title: string; court: string; nextHearing: string | null };
  recipient: { name: string; phone: string | null };
}

interface ReminderSettings {
  id: string;
  daysBeforeHearing: number;
  morningOfHearing: boolean;
  customMessage: string | null;
}

type ActiveTab = 'upcoming' | 'settings' | 'history';

export default function AdminRemindersPage() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('upcoming');
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [settings, setSettings] = useState<ReminderSettings | null>(null);

  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [sendingCaseId, setSendingCaseId] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Settings form state
  const [settingsDays, setSettingsDays] = useState<number>(1);
  const [settingsMorning, setSettingsMorning] = useState<boolean>(true);
  const [settingsCustomMsg, setSettingsCustomMsg] = useState<string>('');

  // ── Data Fetchers ──────────────────────────────────────────────────────────

  const fetchUpcomingCases = useCallback(async () => {
    setLoadingCases(true);
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const data: CaseItem[] = await res.json();
        const now = new Date();
        const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcoming = data.filter((c) => {
          if (!c.nextHearing || c.status === 'CLOSED') return false;
          const hearingDate = new Date(c.nextHearing);
          return hearingDate >= now && hearingDate <= in7Days;
        });
        // Sort ascending by hearing date
        upcoming.sort(
          (a, b) => new Date(a.nextHearing!).getTime() - new Date(b.nextHearing!).getTime()
        );
        setCases(upcoming);
      }
    } catch (err) {
      console.error('Error fetching cases:', err);
    } finally {
      setLoadingCases(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/reminders/history');
      if (res.ok) setReminders(await res.json());
    } catch (err) {
      console.error('Error fetching reminder history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch('/api/reminders/settings');
      if (res.ok) {
        const data: ReminderSettings = await res.json();
        setSettings(data);
        setSettingsDays(data.daysBeforeHearing);
        setSettingsMorning(data.morningOfHearing);
        setSettingsCustomMsg(data.customMessage || '');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcomingCases();
    fetchSettings();
  }, [fetchUpcomingCases, fetchSettings]);

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
  }, [activeTab, fetchHistory]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleSendReminder = async (caseId: string, caseNumber: string) => {
    setSendingCaseId(caseId);
    try {
      const res = await fetch('/api/reminders/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, templateType: 'day_before' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Reminder sent for Case ${caseNumber}`, 'success');
      } else {
        toast(data.error || 'Failed to send reminder.', 'error');
      }
    } catch {
      toast('Network error sending reminder.', 'error');
    } finally {
      setSendingCaseId(null);
    }
  };

  const handleSendAll = async () => {
    if (cases.length === 0) {
      toast('No upcoming hearings to remind.', 'error');
      return;
    }
    setSendingAll(true);
    let successCount = 0;
    let failCount = 0;

    for (const c of cases) {
      try {
        const res = await fetch('/api/reminders/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caseId: c.id, templateType: 'day_before' }),
        });
        if (res.ok) successCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }

    setSendingAll(false);
    toast(
      `Bulk send complete: ${successCount} sent, ${failCount} failed.`,
      successCount > 0 ? 'success' : 'error'
    );
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/reminders/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          daysBeforeHearing: settingsDays,
          morningOfHearing: settingsMorning,
          customMessage: settingsCustomMsg || null,
        }),
      });
      if (res.ok) {
        toast('Reminder settings saved.', 'success');
        fetchSettings();
      } else {
        const data = await res.json();
        toast(data.error || 'Failed to save settings.', 'error');
      }
    } catch {
      toast('Network error saving settings.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hearingDate = new Date(dateStr);
    hearingDate.setHours(0, 0, 0, 0);
    const diff = Math.round((hearingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `In ${diff} days`;
  };

  const getUrgencyColor = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hearingDate = new Date(dateStr);
    hearingDate.setHours(0, 0, 0, 0);
    const diff = Math.round((hearingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'text-rose-600 bg-rose-50 border-rose-200';
    if (diff === 1) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
      SENT: {
        icon: <CheckCircle className="h-3 w-3" />,
        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Sent',
      },
      FAILED: {
        icon: <XCircle className="h-3 w-3" />,
        cls: 'bg-rose-50 text-rose-700 border-rose-200',
        label: 'Failed',
      },
      PENDING: {
        icon: <AlertCircle className="h-3 w-3" />,
        cls: 'bg-amber-50 text-amber-700 border-amber-200',
        label: 'Pending',
      },
    };
    const c = config[status] || config.PENDING;
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.cls}`}
      >
        {c.icon} {c.label}
      </span>
    );
  };

  // ── TAB CONTENT ─────────────────────────────────────────────────────────────

  const TabUpcoming = (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#0A1628]">Upcoming Hearings — Next 7 Days</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {cases.length} case{cases.length !== 1 ? 's' : ''} with scheduled hearings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchUpcomingCases}
            variant="outline"
            className="border-[#DCD6C5] text-xs font-semibold text-gray-600 hover:border-[#0A1628] flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            onClick={handleSendAll}
            disabled={sendingAll || cases.length === 0}
            className="bg-[#0A1628] hover:bg-[#0A1628]/90 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            {sendingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Bell className="h-3.5 w-3.5" />
            )}
            Send All Reminders
          </Button>
        </div>
      </div>

      {/* Cases list */}
      {loadingCases ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin" />
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-[#DCD6C5] rounded-xl">
          <Calendar className="h-10 w-10 text-[#C9A84C] mx-auto mb-3 opacity-60" />
          <p className="text-sm font-bold text-gray-500">No hearings in the next 7 days</p>
          <p className="text-xs text-gray-400 mt-1">Cases with upcoming hearing dates will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-[#DCD6C5] rounded-xl p-4 hover:border-[#C9A84C]/50 transition duration-200 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Case info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      {c.caseNumber}
                    </span>
                    {c.nextHearing && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getUrgencyColor(
                          c.nextHearing
                        )}`}
                      >
                        {getDaysUntil(c.nextHearing)}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-[#0A1628] text-sm leading-tight truncate pr-4">
                    {c.title}
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-[11px] text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[#C9A84C]" /> {c.court}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-[#C9A84C]" />
                      {c.nextHearing
                        ? new Date(c.nextHearing).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'TBD'}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-[#C9A84C]" />
                      {c.client.name}
                      {!c.client.phone && (
                        <span className="text-rose-400 ml-1" title="No phone number">⚠</span>
                      )}
                    </span>
                    {c.junior && (
                      <span className="flex items-center gap-1">
                        <Scale className="h-3 w-3 text-[#C9A84C]" />
                        {c.junior.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action button */}
                <Button
                  onClick={() => handleSendReminder(c.id, c.caseNumber)}
                  disabled={sendingCaseId === c.id || sendingAll}
                  className="bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0A1628] text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  {sendingCaseId === c.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Send Reminder
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const TabSettings = (
    <div className="max-w-xl space-y-6">
      <div>
        <h3 className="text-sm font-bold text-[#0A1628]">Auto-Reminder Preferences</h3>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Configure when and how hearing reminders are dispatched.
        </p>
      </div>

      {loadingSettings ? (
        <div className="flex justify-center py-12">
          <div className="h-7 w-7 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-5">
          {/* Days before */}
          <div className="space-y-2 p-4 bg-white border border-[#DCD6C5] rounded-xl">
            <Label className="text-xs font-bold text-[#0A1628]">Days Before Hearing</Label>
            <p className="text-[11px] text-gray-500">
              How many days in advance should the reminder be sent?
            </p>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSettingsDays(n)}
                  className={`px-4 py-1.5 rounded-lg border text-xs font-bold transition duration-150 ${
                    settingsDays === n
                      ? 'bg-[#0A1628] text-white border-[#0A1628]'
                      : 'bg-white text-gray-600 border-[#DCD6C5] hover:border-[#0A1628]/50'
                  }`}
                >
                  {n} day{n > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Morning of */}
          <div className="p-4 bg-white border border-[#DCD6C5] rounded-xl flex items-center justify-between">
            <div>
              <Label className="text-xs font-bold text-[#0A1628]">Morning-of Reminder</Label>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Also send a reminder on the morning of the hearing day.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSettingsMorning((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                settingsMorning ? 'bg-[#C9A84C]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  settingsMorning ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Custom message template */}
          <div className="space-y-2 p-4 bg-white border border-[#DCD6C5] rounded-xl">
            <Label className="text-xs font-bold text-[#0A1628]">
              Custom SMS Template{' '}
              <span className="font-normal text-gray-400">(optional)</span>
            </Label>
            <p className="text-[11px] text-gray-500">
              Use placeholders:{' '}
              <code className="bg-gray-100 px-1 rounded text-[10px]">{'{caseNumber}'}</code>{' '}
              <code className="bg-gray-100 px-1 rounded text-[10px]">{'{title}'}</code>{' '}
              <code className="bg-gray-100 px-1 rounded text-[10px]">{'{court}'}</code>{' '}
              <code className="bg-gray-100 px-1 rounded text-[10px]">{'{date}'}</code>{' '}
              <code className="bg-gray-100 px-1 rounded text-[10px]">{'{advocateName}'}</code>
            </p>
            <textarea
              value={settingsCustomMsg}
              onChange={(e) => setSettingsCustomMsg(e.target.value)}
              placeholder="Leave blank to use the default template."
              rows={3}
              className="w-full mt-1 text-xs border border-[#DCD6C5] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C9A84C] resize-none bg-gray-50/50"
            />

            {/* Template previews */}
            <div className="mt-3 space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Default Templates</p>
              <div className="bg-[#F5F0E8] rounded-lg p-3 space-y-2 text-[11px] text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-[#0A1628]">Day before:</strong> Reminder: Your case{' '}
                  <em>{'{caseNumber}'}</em> - <em>{'{title}'}</em> has a hearing tomorrow (
                  <em>{'{date}'}</em>) at <em>{'{court}'}</em>. Please be prepared. -{' '}
                  <em>{'{advocateName}'}</em>
                </p>
                <p>
                  <strong className="text-[#0A1628]">Morning of:</strong> Today&apos;s Hearing: Case{' '}
                  <em>{'{caseNumber}'}</em> - <em>{'{title}'}</em> at <em>{'{court}'}</em>. Hearing
                  scheduled for today <em>{'{date}'}</em>. - <em>{'{advocateName}'}</em>
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={savingSettings}
            className="bg-[#0A1628] hover:bg-[#0A1628]/90 text-white text-xs font-bold flex items-center gap-1.5"
          >
            {savingSettings ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5" />
            )}
            Save Preferences
          </Button>
        </form>
      )}
    </div>
  );

  const TabHistory = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#0A1628]">Reminder History</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Last 100 dispatch records</p>
        </div>
        <Button
          onClick={fetchHistory}
          variant="outline"
          className="border-[#DCD6C5] text-xs font-semibold text-gray-600 hover:border-[#0A1628] flex items-center gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {loadingHistory ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-[#DCD6C5] rounded-xl">
          <History className="h-10 w-10 text-[#C9A84C] mx-auto mb-3 opacity-60" />
          <p className="text-sm font-bold text-gray-500">No reminders dispatched yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Sent reminders will appear here with full details.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#DCD6C5] bg-white shadow-sm">
          <table className="min-w-full divide-y divide-[#DCD6C5]/50 text-xs">
            <thead className="bg-[#F5F0E8]">
              <tr>
                {['Case #', 'Recipient', 'Type', 'Phone', 'Message', 'Sent At', 'Status'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCD6C5]/30">
              {reminders.map((r) => (
                <tr key={r.id} className="hover:bg-[#F5F0E8]/40 transition duration-100">
                  <td className="px-4 py-3 font-bold text-[#0A1628] whitespace-nowrap">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{r.case.caseNumber}</p>
                    <p className="truncate max-w-[120px] font-semibold text-gray-700">{r.case.title}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-semibold text-[#0A1628]">{r.recipient.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        r.recipientType === 'CLIENT'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {r.recipientType}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Phone className="h-3 w-3 text-[#C9A84C]" />
                      {r.recipient.phone || <span className="text-rose-400 italic">N/A</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="truncate text-gray-600" title={r.message}>
                      {r.message}
                    </p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {r.sentAt
                      ? new Date(r.sentAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ── RENDER ──────────────────────────────────────────────────────────────────

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'upcoming', label: 'Upcoming Hearings', icon: <Bell className="h-3.5 w-3.5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-3.5 w-3.5" /> },
    { id: 'history', label: 'History', icon: <History className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading text-[#0A1628]">Hearing Reminders</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Send SMS alerts to clients and junior counsel before court hearings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
              settings
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}
          >
            <Clock className="h-3 w-3" />
            Auto: {settings ? `${settings.daysBeforeHearing}d before${settings.morningOfHearing ? ' + morning' : ''}` : 'Loading...'}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-4 gap-3">
          <div className="h-9 w-9 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600">
            <Calendar className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-lg font-bold font-heading text-[#0A1628]">{cases.length}</p>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">
              Hearings This Week
            </p>
          </div>
        </Card>

        <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-4 gap-3">
          <div className="h-9 w-9 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-lg font-bold font-heading text-[#0A1628]">
              {reminders.filter((r) => r.status === 'SENT').length}
            </p>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">
              Reminders Sent
            </p>
          </div>
        </Card>

        <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-4 gap-3">
          <div className="h-9 w-9 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-600">
            <XCircle className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-lg font-bold font-heading text-[#0A1628]">
              {cases.filter((c) => !c.client.phone).length}
            </p>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">
              Missing Phone Numbers
            </p>
          </div>
        </Card>
      </div>

      {/* Main content card with tabs */}
      <Card className="border border-[#DCD6C5] bg-white shadow-sm">
        {/* Tab bar */}
        <div className="border-b border-[#DCD6C5]/50 px-6 pt-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t transition duration-150 border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'text-[#0A1628] border-[#C9A84C] bg-[#F5F0E8]/60'
                    : 'text-gray-400 border-transparent hover:text-[#0A1628] hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-6">
          {activeTab === 'upcoming' && TabUpcoming}
          {activeTab === 'settings' && TabSettings}
          {activeTab === 'history' && TabHistory}
        </CardContent>
      </Card>
    </div>
  );
}
