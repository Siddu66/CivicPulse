import React from 'react';

export default function MapContainer({ issues = [] }) {
  return (
    <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 relative overflow-hidden min-h-[350px] flex flex-col justify-between shadow-inner">
      {/* Overlay Header */}
      <div className="z-10 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-sm border border-slate-200/80 flex justify-between items-center max-w-md">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">🗺️ Interactive GIS Map View</h4>
          <p className="text-[11px] text-slate-500">Live community complaints mapped by location coordinates</p>
        </div>
        <span className="text-xs font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">
          {issues.length} Markers
        </span>
      </div>

      {/* Map Graphic Mock (Ready for Leaflet / Google Maps API) */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-3 my-auto py-8">
        {issues.slice(0, 3).map((issue, idx) => (
          <div key={idx} className="bg-white/95 p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1 transform hover:-translate-y-1 transition">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping mr-1.5"></span>
            <span className="font-bold text-slate-800">{issue.title}</span>
            <p className="text-[10px] text-slate-500">📍 {issue.location || 'Sector 4, Main Rd'}</p>
          </div>
        ))}
      </div>

      {/* Map Control Footer */}
      <div className="z-10 flex justify-between items-center text-[11px] text-slate-500 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200/60">
        <span>Map Engine: OpenStreetMap / Leaflet GIS</span>
        <span className="font-semibold text-blue-600">Click marker for details</span>
      </div>
    </div>
  );
}