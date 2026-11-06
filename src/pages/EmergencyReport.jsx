import React, { useState, useEffect } from 'react';

export default function EmergencyReport() {
  const [formData, setFormData] = useState({
    category: 'Water Main Burst / Severe Flooding',
    location: '',
    description: '',
    contactNumber: '',
  });

  const [gpsStatus, setGpsStatus] = useState('Detecting location...');
  const [emergencySubmitted, setEmergencySubmitted] = useState(false);

  // Auto-detect GPS location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsStatus(`Lat: ${position.coords.latitude.toFixed(4)}, Long: ${position.coords.longitude.toFixed(4)} (GPS Active)`);
          setFormData((prev) => ({
            ...prev,
            location: `GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
          }));
        },
        () => {
          setGpsStatus('GPS Permission Denied. Please enter location manually.');
        }
      );
    } else {
      setGpsStatus('Geolocation not supported by browser.');
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setEmergencySubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      
      {/* Call 112 Direct Action Card */}
      <div className="bg-red-600 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider">Immediate Hazard?</h2>
          <p className="text-red-100 text-sm mt-1">
            For life-threatening situations, dial national emergency dispatch immediately.
          </p>
        </div>
        <a
          href="tel:112"
          className="bg-white text-red-600 hover:bg-red-50 font-black px-6 py-3 rounded-xl shadow-lg transition flex items-center space-x-2 text-lg whitespace-nowrap"
        >
          <span>📞 Call 112 Now</span>
        </a>
      </div>

      {!emergencySubmitted ? (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100">
          <div className="flex items-center space-x-3 mb-6">
            <span className="p-3 bg-red-100 text-red-600 rounded-xl text-xl font-bold">🚨</span>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Report Civic Emergency</h2>
              <p className="text-xs text-slate-500">Alert local administration and rapid response teams directly</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Emergency Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Emergency Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-xl font-semibold text-sm bg-red-50/30 text-slate-800 focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option>Water Main Burst / Severe Flooding</option>
                <option>Downed High-Voltage Power Line</option>
                <option>Gas Leak / Chemical Spill</option>
                <option>Building Collapse / Structural Hazard</option>
                <option>Major Road Blockade / Landslide</option>
              </select>
            </div>

            {/* GPS & Location Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Location / Coordinates
                </label>
                <span className="text-xs font-medium text-slate-500">{gpsStatus}</span>
              </div>
              <input
                type="text"
                required
                placeholder="Street name, landmark or auto-filled GPS"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            {/* Contact Number for Quick Dispatch */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Callback Contact Phone
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            {/* Emergency Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hazard Details
              </label>
              <textarea
                rows="3"
                required
                placeholder="Briefly describe the immediate hazard and severity..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition duration-200 uppercase tracking-wider text-sm"
            >
              Broadcast Emergency Alert 🚨
            </button>
          </form>
        </div>
      ) : (
        /* Emergency Status Tracking Confirmation */
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-100 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold animate-pulse">
            🚨
          </div>
          <h3 className="text-2xl font-black text-slate-800">Emergency Alert Transmitted</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Your emergency report for <strong className="text-slate-800">{formData.category}</strong> has been prioritized and dispatched to nearby control rooms.
          </p>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs font-mono space-y-1">
            <p><strong>Tracking Ticket:</strong> EMG-9941</p>
            <p><strong>Location:</strong> {formData.location}</p>
            <p><strong>Dispatch Status:</strong> <span className="text-red-600 font-bold">ACTIVE RESPONSE</span></p>
          </div>

          <button
            onClick={() => setEmergencySubmitted(false)}
            className="mt-4 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-6 py-2.5 rounded-lg transition"
          >
            Report Another Incident
          </button>
        </div>
      )}

    </div>
  );
}