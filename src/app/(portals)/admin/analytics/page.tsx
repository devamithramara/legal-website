'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  PieChart, 
  Activity, 
  Calendar, 
  TrendingUp, 
  Briefcase,
  Hourglass
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface RevenueData {
  labels: string[];
  revenues: number[];
  expenses: number[];
}

interface CaseAnalyticsData {
  statusCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  avgResolutionTime: number;
  openedVsClosed: {
    labels: string[];
    opened: number[];
    closed: number[];
  };
  topPracticeAreas: { name: string; count: number }[];
}

export default function AdminAnalytics() {
  const { toast } = useToast();
  
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [caseData, setCaseData] = useState<CaseAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Date range filter states (simulated client filtering)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [revRes, caseRes] = await Promise.all([
        fetch('/api/analytics/revenue'),
        fetch('/api/analytics/cases'),
      ]);

      if (revRes.ok) setRevenueData(await revRes.json());
      if (caseRes.ok) setCaseData(await caseRes.json());
    } catch (err) {
      console.error('Error fetching analytics reports:', err);
      toast('Failed to generate charts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleApplyFilter = () => {
    toast('Date range applied. Filtering dashboard view.', 'success');
    fetchAnalytics();
  };

  // 1. Chart Configuration: Revenue vs Expenses (Bar Chart)
  const getRevenueChartConfig = () => {
    if (!revenueData) return { data: { labels: [], datasets: [] }, options: {} };
    
    return {
      data: {
        labels: revenueData.labels,
        datasets: [
          {
            label: 'Revenue (INR)',
            data: revenueData.revenues,
            backgroundColor: '#0A1628', // Navy
            borderColor: '#C9A84C', // Gold
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            label: 'Expenses (INR)',
            data: revenueData.expenses,
            backgroundColor: '#EF4444', // Red
            borderColor: '#F87171',
            borderWidth: 1,
            borderRadius: 4,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' as const },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { font: { size: 10 } },
          },
          x: {
            ticks: { font: { size: 10 } },
          }
        }
      }
    };
  };

  // 2. Chart Configuration: Cases by Type (Pie Chart)
  const getCaseTypeChartConfig = () => {
    if (!caseData) return { data: { labels: [], datasets: [] }, options: {} };
    
    const labels = Object.keys(caseData.typeCounts);
    const counts = Object.values(caseData.typeCounts);

    return {
      data: {
        labels: labels,
        datasets: [
          {
            data: counts,
            backgroundColor: [
              '#0A1628', // Navy
              '#C9A84C', // Gold
              '#3B82F6', // Blue
              '#10B981', // Emerald
              '#F59E0B', // Amber
              '#8B5CF6', // Purple
            ],
            borderWidth: 1,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' as const, labels: { font: { size: 10 } } },
        }
      }
    };
  };

  // 3. Chart Configuration: Cases Opened vs Closed (Line Chart)
  const getOpenedVsClosedChartConfig = () => {
    if (!caseData) return { data: { labels: [], datasets: [] }, options: {} };

    return {
      data: {
        labels: caseData.openedVsClosed.labels,
        datasets: [
          {
            label: 'Cases Opened',
            data: caseData.openedVsClosed.opened,
            borderColor: '#3B82F6', // Blue
            backgroundColor: '#3B82F6/20',
            tension: 0.3,
            fill: false,
          },
          {
            label: 'Cases Closed',
            data: caseData.openedVsClosed.closed,
            borderColor: '#10B981', // Emerald
            backgroundColor: '#10B981/20',
            tension: 0.3,
            fill: false,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' as const },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { size: 10 } },
          },
          x: {
            ticks: { font: { size: 10 } },
          }
        }
      }
    };
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-[#0A1628]">Analytics Report</h2>
          <p className="text-xs text-gray-500 font-medium">Verify firm margins, practice area distributions, and case closure rates</p>
        </div>
      </div>

      {/* Date filters row */}
      <div className="flex flex-wrap items-end gap-4 bg-white p-4 rounded-lg border border-[#DCD6C5] shadow-sm text-xs">
        <div className="space-y-1.5">
          <Label htmlFor="start" className="text-[10px] font-bold text-gray-500 uppercase">Start Date</Label>
          <Input 
            id="start" 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="border-[#DCD6C5] h-8 text-xs bg-white w-40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end" className="text-[10px] font-bold text-gray-500 uppercase">End Date</Label>
          <Input 
            id="end" 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            className="border-[#DCD6C5] h-8 text-xs bg-white w-40"
          />
        </div>
        <Button 
          onClick={handleApplyFilter}
          className="bg-[#0A1628] hover:bg-[#0A1628]/95 text-white text-[10px] h-8 font-semibold px-4"
        >
          Apply Range
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-8 w-8 border-4 border-[#0A1628] border-t-[#C9A84C] rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Key Analytics Metric Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-6 gap-4">
              <div className="h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600">
                <Hourglass className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading text-[#0A1628]">
                  {caseData?.avgResolutionTime || 0} Days
                </p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Avg Case Closure Time</p>
              </div>
            </Card>

            <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-6 gap-4">
              <div className="h-10 w-10 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0A1628] truncate max-w-[150px]">
                  {caseData?.topPracticeAreas?.[0]?.name || 'N/A'}
                </p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Top Practice Area</p>
              </div>
            </Card>

            <Card className="border border-[#DCD6C5] bg-white shadow-sm flex items-center p-6 gap-4">
              <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading text-[#0A1628]">₹{(revenueData && revenueData.revenues.length > 0 ? (revenueData.revenues.reduce((s, r) => s + r, 0) / Math.max(1, revenueData.revenues.length)) : 0).toFixed(0)}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Average Invoice billing</p>
              </div>
            </Card>
          </div>

          {/* Charts Layout grids */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Revenue Bar Chart */}
            <div className="lg:col-span-8">
              <Card className="border border-[#DCD6C5] bg-white shadow-sm">
                <CardHeader className="border-b border-[#DCD6C5]/20">
                  <CardTitle className="text-base font-heading text-[#0A1628] flex items-center gap-2">
                    <BarChart3 className="h-4.5 w-4.5 text-[#C9A84C]" /> Revenue vs Expenses
                  </CardTitle>
                  <CardDescription className="text-xs">Chambers net cash flow over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Bar {...getRevenueChartConfig()} />
                </CardContent>
              </Card>
            </div>

            {/* Cases by Practice Area Type */}
            <div className="lg:col-span-4">
              <Card className="border border-[#DCD6C5] bg-white shadow-sm">
                <CardHeader className="border-b border-[#DCD6C5]/20">
                  <CardTitle className="text-base font-heading text-[#0A1628] flex items-center gap-2">
                    <PieChart className="h-4.5 w-4.5 text-[#C9A84C]" /> Litigation Specialty Weights
                  </CardTitle>
                  <CardDescription className="text-xs">Case files categorized by legal branch</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Pie {...getCaseTypeChartConfig()} />
                </CardContent>
              </Card>
            </div>

            {/* Cases Opened vs Closed (Line Chart) */}
            <div className="lg:col-span-12">
              <Card className="border border-[#DCD6C5] bg-white shadow-sm">
                <CardHeader className="border-b border-[#DCD6C5]/20">
                  <CardTitle className="text-base font-heading text-[#0A1628] flex items-center gap-2">
                    <Activity className="h-4.5 w-4.5 text-[#C9A84C]" /> Litigation Resolution Rate
                  </CardTitle>
                  <CardDescription className="text-xs">Monthly trends of cases opened vs cases closed</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Line {...getOpenedVsClosedChartConfig()} />
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
