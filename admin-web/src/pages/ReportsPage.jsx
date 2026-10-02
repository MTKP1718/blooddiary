import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  Users,
  CheckCircle2,
  Calendar,
  Droplet,
  MapPin,
  Loader2,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import api from '../services/api';

export function ReportsPage() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reports');
      if (res.data.success) {
        setReports(res.data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    if (!reports?.exportData?.donors) return;

    const donors = reports.exportData.donors;
    const headers = [
      'ID',
      'Full Name',
      'Date of Birth',
      'Gender',
      'Blood Group',
      'Mobile',
      'Email',
      'Address',
      'City',
      'District',
      'State',
      'Pincode',
      'Availability Status',
      'Registration Status',
      'Last Donation Date',
      'Emergency Contact Name',
      'Emergency Contact Phone',
      'Registered At'
    ];

    const rows = donors.map(d => [
      d.id,
      `"${d.full_name?.replace(/"/g, '""')}"`,
      d.date_of_birth ? d.date_of_birth.split('T')[0] : '',
      d.gender,
      d.blood_group,
      `"${d.mobile}"`,
      d.email,
      `"${(d.address || '').replace(/"/g, '""')}"`,
      `"${d.city}"`,
      `"${d.district}"`,
      `"${d.state}"`,
      `"${d.pincode}"`,
      d.availability_status,
      d.registration_status,
      d.last_donation_date ? d.last_donation_date.split('T')[0] : '',
      `"${(d.emergency_contact_name || '').replace(/"/g, '""')}"`,
      `"${d.emergency_contact_number || ''}"`,
      d.created_at
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BloodConnect_Donors_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-crimson-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Generating administrative report summaries...</p>
      </div>
    );
  }

  const summary = reports?.summary || {};
  const bloodStats = reports?.bloodGroupStats || {};
  const cityStats = reports?.cityDistribution || {};

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileBarChart className="w-7 h-7 text-crimson-600" />
            <span>Administrative Reports & Data Export</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive audit reports, blood reserves distributions, and compliance export files
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Total Donors</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">{summary.totalDonors || 0}</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-600 block">Available</span>
          <span className="text-2xl font-black text-emerald-600 block mt-1">{summary.availableDonors || 0}</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Resting</span>
          <span className="text-2xl font-black text-slate-600 block mt-1">{summary.unavailableDonors || 0}</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-600 block">Pending Review</span>
          <span className="text-2xl font-black text-amber-600 block mt-1">{summary.pendingCount || 0}</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-600 block">Approved</span>
          <span className="text-2xl font-black text-blue-600 block mt-1">{summary.approvedCount || 0}</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-crimson-600 block">Total Donations</span>
          <span className="text-2xl font-black text-crimson-600 block mt-1">{summary.totalDonations || 0}</span>
        </div>
      </div>

      {/* Blood Group Distribution Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Blood Group Inventory Distribution</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Total Registered</th>
                <th className="py-3 px-4">Currently Available</th>
                <th className="py-3 px-4">Percentage of Registry</th>
                <th className="py-3 px-4">Readiness Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {Object.entries(bloodStats).map(([bg, data]) => {
                const pct = summary.totalDonors > 0 ? Math.round((data.total / summary.totalDonors) * 100) : 0;
                return (
                  <tr key={bg} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-crimson-50 text-crimson-700 font-extrabold text-xs border border-crimson-100">
                        {bg}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{data.total}</td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold">{data.available}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-crimson-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="font-mono text-slate-500">{pct}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {data.available > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                          Active Reserve
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700">
                          Low Reserve
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regional City Distribution Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Geographic Donor Density by City</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
          {Object.entries(cityStats).map(([city, count]) => (
            <div key={city} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-800">{city}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white text-slate-900 font-bold border border-slate-200">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
