'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/providers';
import { BrainCircuit, Shield, AlertTriangle, User, Scale, Plus, CheckCircle2, Save } from 'lucide-react';

export default function SeniorStrategyPage() {
  const { toast } = useToast();

  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [loading, setLoading] = useState(true);

  // Strategy Form
  const [theory, setTheory] = useState('');
  const [keyArguments, setKeyArguments] = useState('');
  const [weakPoints, setWeakPoints] = useState('');
  const [counterArgs, setCounterArgs] = useState('');
  const [caseStrength, setCaseStrength] = useState('STRONG');
  const [strengthReason, setStrengthReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Opponent Profile Form
  const [opponentName, setOpponentName] = useState('');
  const [opponentFirm, setOpponentFirm] = useState('');
  const [opponentNotes, setOpponentNotes] = useState('');

  const fetchCases = async () => {
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const data = await res.json();
        setCases(data);
        if (data.length > 0) {
          setSelectedCaseId(data[0].id);
          fetchStrategyForCase(data[0].id);
        }
      }
    } catch {
      toast('Failed to load cases.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStrategyForCase = async (caseId: string) => {
    try {
      const res = await fetch(`/api/strategy/${caseId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.strategy) {
          setTheory(data.strategy.theory || '');
          setKeyArguments(data.strategy.keyArguments ? data.strategy.keyArguments.join(', ') : '');
          setWeakPoints(data.strategy.weakPoints ? data.strategy.weakPoints.join(', ') : '');
          setCounterArgs(data.strategy.counterArgs ? data.strategy.counterArgs.join(', ') : '');
          setCaseStrength(data.strategy.caseStrength || 'STRONG');
          setStrengthReason(data.strategy.strengthReason || '');
        } else {
          setTheory('');
          setKeyArguments('');
          setWeakPoints('');
          setCounterArgs('');
          setCaseStrength('STRONG');
          setStrengthReason('');
        }
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
    fetchStrategyForCase(id);
  };

  const handleSaveStrategy = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedCaseId) return;

    setSaving(true);
    try {
      const res = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedCaseId,
          theory,
          keyArguments: keyArguments.split(',').map(s => s.trim()).filter(Boolean),
          weakPoints: weakPoints.split(',').map(s => s.trim()).filter(Boolean),
          counterArgs: counterArgs.split(',').map(s => s.trim()).filter(Boolean),
          caseStrength,
          strengthReason,
        }),
      });

      if (res.ok) {
        toast('Case strategy auto-saved!', 'success');
        setLastSaved(new Date().toLocaleTimeString());
      } else {
        toast('Failed to save strategy.', 'error');
      }
    } catch {
      toast('Network error saving strategy.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddOpponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !opponentName) {
      toast('Please enter opponent advocate name.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/opponent-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedCaseId,
          advocateName: opponentName,
          firmName: opponentFirm,
          behaviorNotes: opponentNotes,
        }),
      });

      if (res.ok) {
        toast('Opponent profile recorded!', 'success');
        setOpponentName('');
        setOpponentFirm('');
        setOpponentNotes('');
      } else {
        toast('Failed to add opponent profile.', 'error');
      }
    } catch {
      toast('Network error saving opponent profile.', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-[#C9A84C]" /> Case Strategy Board & Intelligence
        </h1>
        <p className="text-xs text-slate-300">
          Formulate case theories, identify weak points, counter-arguments, and profile opponent counsel
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cases Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <h3 className="text-base font-bold font-heading text-white mb-3">Active Case Folders</h3>
            
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="h-6 w-6 border-3 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin" />
              </div>
            ) : cases.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No cases found.</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {cases.map((c) => {
                  const isSelected = selectedCaseId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCase(c.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#C9A84C]/20 border-[#C9A84C] text-white shadow-lg'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <p className="font-extrabold text-xs">📁 {c.caseNumber}</p>
                      <p className="text-[11px] font-medium text-slate-400 truncate">{c.title}</p>
                      <span className="text-[9px] font-bold text-[#C9A84C] mt-1 inline-block">🏛️ {c.court}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Strategy Editor Panel */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border border-[#C9A84C]/30 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#C9A84C]" /> Case Strategy Brief
                </h3>
                {lastSaved && <p className="text-[10px] text-emerald-400 font-bold mt-0.5">✓ Auto-saved at {lastSaved}</p>}
              </div>

              <Button
                onClick={() => handleSaveStrategy()}
                disabled={saving}
                className="bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] text-[#0A1628] font-extrabold text-xs px-5 py-2 rounded-xl shadow-lg flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Strategy'}
              </Button>
            </div>

            <form onSubmit={handleSaveStrategy} className="space-y-5 text-xs">
              <div className="space-y-1.5">
                <Label className="font-bold text-[#F3E5AB]">Theory of the Case *</Label>
                <Textarea
                  placeholder="Formulate the overarching legal theory, core narrative, and statutory foundation..."
                  value={theory}
                  onChange={(e) => setTheory(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-bold text-emerald-400">Key Arguments (comma separated)</Label>
                  <Textarea
                    placeholder="e.g. Alibi witness testimony, Lack of Sec 65B Certificate"
                    value={keyArguments}
                    onChange={(e) => setKeyArguments(e.target.value)}
                    className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl min-h-[80px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-rose-400">Weak Points & Vulnerabilities</Label>
                  <Textarea
                    placeholder="e.g. Delay in FIR lodging by 3 days, Missing original bill copies"
                    value={weakPoints}
                    onChange={(e) => setWeakPoints(e.target.value)}
                    className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl min-h-[80px]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-cyan-400">Counter-Arguments to Anticipate</Label>
                <Input
                  placeholder="e.g. Opponent will claim Sec 138 presumption of debt"
                  value={counterArgs}
                  onChange={(e) => setCounterArgs(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div className="space-y-1.5">
                  <Label className="font-bold text-[#F3E5AB]">Case Strength Rating</Label>
                  <select
                    value={caseStrength}
                    onChange={(e) => setCaseStrength(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl font-bold"
                  >
                    <option value="STRONG">STRONG (High Win Probability)</option>
                    <option value="MODERATE">MODERATE (Requires Settlement/Evidence)</option>
                    <option value="WEAK">WEAK (High Risk)</option>
                    <option value="UNCERTAIN">UNCERTAIN (Bench Dependent)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-[#F3E5AB]">Strength Justification</Label>
                  <Input
                    placeholder="e.g. Supported by Supreme Court 3-judge bench ruling"
                    value={strengthReason}
                    onChange={(e) => setStrengthReason(e.target.value)}
                    className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                  />
                </div>
              </div>
            </form>
          </Card>

          {/* Opponent Profile Form */}
          <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <h3 className="text-base font-bold font-heading text-white mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-[#C9A84C]" /> Opponent Advocate Intelligence Profile
            </h3>

            <form onSubmit={handleAddOpponent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-300">Opposing Advocate Name *</Label>
                  <Input
                    placeholder="e.g. Senior Adv. Rajesh Verma"
                    value={opponentName}
                    onChange={(e) => setOpponentName(e.target.value)}
                    className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-300">Law Firm / Chambers</Label>
                  <Input
                    placeholder="e.g. Verma Legal Chambers"
                    value={opponentFirm}
                    onChange={(e) => setOpponentFirm(e.target.value)}
                    className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-300">Behavioral & Tactical Notes</Label>
                <Input
                  placeholder="e.g. Tends to file last-minute interim applications to delay arguments..."
                  value={opponentNotes}
                  onChange={(e) => setOpponentNotes(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white text-xs rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-2 rounded-xl"
              >
                Record Opponent Profile
              </Button>
            </form>
          </Card>
        </div>

      </div>

    </div>
  );
}
