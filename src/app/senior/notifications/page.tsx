'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/providers';
import { Bell, AlertTriangle, CheckCircle2, Info, BrainCircuit, FileText, Inbox, Clock } from 'lucide-react';
import Link from 'next/link';

const NOTIFICATION_CONFIG: Record<string, { color: string; border: string; icon: React.ReactNode }> = {
  ESCALATION: { color: 'bg-rose-950/60', border: 'border-rose-800', icon: <AlertTriangle className="h-4 w-4 text-rose-400" /> },
  CHECKLIST: { color: 'bg-amber-950/60', border: 'border-amber-800', icon: <Clock className="h-4 w-4 text-amber-400" /> },
  FILING: { color: 'bg-blue-950/60', border: 'border-blue-800', icon: <FileText className="h-4 w-4 text-blue-400" /> },
  PAYMENT: { color: 'bg-emerald-950/60', border: 'border-emerald-800', icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> },
  DIGEST: { color: 'bg-slate-900', border: 'border-slate-800', icon: <Info className="h-4 w-4 text-slate-400" /> },
};

const PAGE_MAP: Record<string, string> = {
  ESCALATION: '/senior/review',
  CHECKLIST: '/senior/checklist',
  FILING: '/senior/drafts',
  PAYMENT: '/admin/finance',
  DIGEST: '/senior/dashboard',
};

export default function SeniorNotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/senior/notifications');
      if (res.ok) {
        const d = await res.json();
        setNotifications(d.notifications || []);
        setUnreadCount(d.unreadCount || 0);
      }
    } catch {
      toast('Failed to load notifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/senior/notifications/read', { method: 'POST' });
      if (res.ok) {
        toast('All notifications marked as read.', 'success');
        fetchNotifications();
      }
    } catch {
      toast('Failed to mark notifications.', 'error');
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const priorityTypes = ['ESCALATION', 'CHECKLIST', 'FILING'];
  const priority = notifications.filter(n => priorityTypes.includes(n.type));
  const standard = notifications.filter(n => !priorityTypes.includes(n.type));

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <Bell className="h-6 w-6 text-[#C9A84C]" /> Senior Chambers Notifications
            {unreadCount > 0 && (
              <span className="ml-1 h-6 w-6 rounded-full bg-rose-600 text-white text-[11px] font-extrabold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-300">Escalations, checklist alerts, draft submissions, and case updates from your team</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllRead} className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-2 rounded-xl border border-slate-700">
            Mark All as Read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-4 border-slate-800 border-t-[#C9A84C] rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="h-16 w-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-bold">No notifications yet. Your chambers inbox is clear.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Priority Alerts */}
          {priority.length > 0 && (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400 mb-3 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Priority Alerts ({priority.length})
              </p>
              <div className="space-y-3">
                {priority.map(n => {
                  const cfg = NOTIFICATION_CONFIG[n.type] || NOTIFICATION_CONFIG['DIGEST'];
                  const link = PAGE_MAP[n.type] || '/senior/dashboard';
                  return (
                    <Link href={link} key={n.id}>
                      <div className={`p-4 rounded-2xl border ${cfg.color} ${cfg.border} flex items-start gap-3 cursor-pointer hover:brightness-110 transition ${!n.read ? 'ring-1 ring-rose-700/40' : 'opacity-70'}`}>
                        <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-extrabold text-white text-xs truncate">{n.title}</p>
                            {!n.read && <span className="h-2 w-2 rounded-full bg-rose-500 flex-shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5">{n.body}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Standard Notifications */}
          {standard.length > 0 && (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" /> All Notifications ({standard.length})
              </p>
              <div className="space-y-2.5">
                {standard.map(n => {
                  const cfg = NOTIFICATION_CONFIG[n.type] || NOTIFICATION_CONFIG['DIGEST'];
                  const link = PAGE_MAP[n.type] || '/senior/dashboard';
                  return (
                    <Link href={link} key={n.id}>
                      <div className={`p-3.5 rounded-xl border ${cfg.color} ${cfg.border} flex items-start gap-3 cursor-pointer hover:brightness-110 transition ${!n.read ? '' : 'opacity-60'}`}>
                        <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-white text-xs truncate">{n.title}</p>
                            {!n.read && <span className="h-2 w-2 rounded-full bg-blue-400 flex-shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{n.body}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
