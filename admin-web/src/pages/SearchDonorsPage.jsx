import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Droplet,
  MapPin,
  Phone,
  Mail,
  Shield,
  Eye,
  CheckCircle2,
  Calendar,
  Loader2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function SearchDonorsPage() {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('O+');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('Available');

  const [availableCities, setAvailableCities] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // Load initial cities
    async function loadCities() {
      try {
        const res = await api.get('/admin/donors?limit=1');
        if (res.data.availableCities) {
          setAvailableCities(res.data.availableCities);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadCities();
    // Run default search
    handleSearch();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const res = await api.get('/admin/donors', {
        params: {
          blood_group: selectedBloodGroup,
          city: selectedCity,
          district: selectedDistrict,
          availability_status: selectedAvailability,
          registration_status: 'APPROVED', // Only approved donors in emergency search
          limit: 100
        }
      });

      if (res.data.success) {
        setResults(res.data.donors || []);
        if (res.data.availableCities) {
          setAvailableCities(res.data.availableCities);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-100 text-crimson-800 text-xs font-semibold mb-2">
          <Shield className="w-3.5 h-3.5 text-crimson-600" />
          <span>Authorized Clinical Search Tool</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Emergency Blood Donor Search
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Quickly identify and mobilize verified, active voluntary blood donors by blood type and geographic location
        </p>
      </div>

      {/* Filter Control Box */}
      <form onSubmit={handleSearch} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* Blood Group */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-crimson-600 fill-crimson-600" />
              <span>Blood Group *</span>
            </label>
            <select
              value={selectedBloodGroup}
              onChange={(e) => setSelectedBloodGroup(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-extrabold text-sm focus:border-crimson-600 focus:outline-none bg-white"
            >
              <option value="">Any Blood Group</option>
              {bloodGroups.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>City / Region</span>
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium text-xs focus:border-crimson-600 focus:outline-none bg-white"
            >
              <option value="">All Available Cities</option>
              {availableCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>District (Optional)</span>
            </label>
            <input
              type="text"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              placeholder="e.g. Chennai"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:border-crimson-600 focus:outline-none"
            />
          </div>

          {/* Availability */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Availability Status</span>
            </label>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium text-xs focus:border-crimson-600 focus:outline-none bg-white"
            >
              <option value="Available">Available (Ready to donate)</option>
              <option value="Not Available">Not Available (Resting)</option>
              <option value="">All Availability Statuses</option>
            </select>
          </div>

        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">
            * Filters automatically match verified approved donors in accordance with hospital privacy protocols.
          </span>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 disabled:bg-crimson-400 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>SEARCH DONORS</span>
          </button>
        </div>
      </form>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-sm">
            Search Results ({results.length} Matching Donor{results.length !== 1 ? 's' : ''})
          </h3>
          {searched && (
            <span className="text-xs text-slate-500">
              Filtered for: <strong>{selectedBloodGroup || 'All'}</strong> in <strong>{selectedCity || 'All Cities'}</strong>
            </span>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-crimson-600" />
            <p className="text-xs">Querying database for available matching donors...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 space-y-2">
            <Droplet className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">No matching donors found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try broadening your search parameters or selecting "All Cities" to locate regional blood donors.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs hover:border-crimson-200 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-crimson-700 to-crimson-500 text-white flex items-center justify-center font-extrabold text-lg shadow-sm shadow-crimson-600/30">
                      {d.blood_group}
                    </div>
                    <StatusBadge status={d.availability_status} type="availability" />
                  </div>

                  <h4 className="font-bold text-slate-900 text-base">{d.full_name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{d.city}, {d.district}</span>
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Direct Contact:</span>
                    </span>
                    <a href={`tel:${d.mobile}`} className="font-mono font-bold text-crimson-700 hover:underline">
                      {d.mobile}
                    </a>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Last Donation:</span>
                    </span>
                    <span className="font-medium text-slate-800">
                      {d.last_donation_date ? new Date(d.last_donation_date).toLocaleDateString('en-GB') : 'First Time'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Emergency: {d.emergency_contact_number || 'N/A'}
                  </span>
                  <Link
                    to={`/admin/donors/${d.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-crimson-600 hover:text-crimson-700"
                  >
                    <span>View Record</span>
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
