import React, { useState } from 'react';

export default function AdminDashboard() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('District');
  const [selectedDept, setSelectedDept] = useState('All');
  const [activeTab, setActiveTab] = useState('complaints');

  // Sample official metadata
  const officialProfile = {
    name: 'Rajesh Kumar',
    designation: 'Tahsildar',
    jurisdiction: 'Mangaluru Sub-Division',
    assignedDept: 'Public Works & Infrastructure',
  };

  // Sample complaints data for administration
  const [complaints, setComplaints] = useState([
    {
      id: 'CP-1021',
      title: 'Major Water Pipeline Leakage',
      category: 'Water Supply',
      priority: 'High',
      status: 'Pending',
      ward: 'Ward 14',
      reportedDate: '2026-11-05',
      reporter: 'Anish Rao',
      remarks: '',
    },
    {
      id: 'CP-1022',
      title: 'Pothole Repair Request',
      category: 'Roads & Buildings',
      priority: 'Medium',
      status: 'In Progress',
      ward: 'Ward 22',
      reportedDate: '2026-11-04',
      reporter: 'Priya Hegde',
      remarks: 'Maintenance team dispatched.',
    },
    {
      id: 'CP-1023',
      title: 'Streetlight Replacement',
      category: 'Electricity',
      priority: 'Low',
      status: 'Resolved',
      ward: 'Ward 08',
      reportedDate: '2026-11-02',
      reporter: 'Suresh Bhat',
      remarks: 'LED bulb installed successfully.',
    },
  ]);

  const handleStatusChange = (id, newStatus) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const handleRemarksChange = (id, remarks) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, remarks } : c));
  };

  const filteredComplaints = complaints.filter(c => 
    selectedDept === 'All' || c.category === selectedDept
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      
      {/* Official Jurisdiction Banner */}
      <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-bold">{officialProfile.name}</h1>
            <span className="bg-blue-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase">
              {officialProfile.designation}
            </span>
          </div>
          <p className="text-slate-300 text-sm">📍 Jurisdiction: {officialProfile.jurisdiction}</p>
        </div>
        
        {/* Scope Selector */}
        <div className="mt-4 md:mt-0 flex bg-slate-700 p-1 rounded-xl text-xs font-semibold">
          {['District', 'Taluk', 'Ward'].map((scope) => (
            <button
              key={scope}
              onClick={() => setSelectedJurisdiction(scope)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedJurisdiction === scope ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              {scope} View
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Jurisdiction Issues</p>
          <p className="text-3xl font-extrabold text-slate-800 mt-1">{complaints.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-yellow-600 uppercase">Pending Action</p>
          <p className="text-3xl font-extrabold text-yellow-600 mt-1">
            {complaints.filter(c => c.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-blue-600 uppercase">In Progress</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-1">
            {complaints.filter(c => c.status === 'In Progress').length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-green-600 uppercase">Resolved</p>
          <p className="text-3xl font-extrabold text-green-600 mt-1">
            {complaints.filter(c => c.status === 'Resolved').length}
          </p>
        </div>
      </div>

      {/* Filter & Management Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex space-x-2">
          {['complaints', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
                activeTab === tab ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab === 'complaints' ? '📋 Manage Complaints' : '👤 Official Profile'}
            </button>
          ))}
        </div>

        {activeTab === 'complaints' && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Filter Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs font-semibold p-2 border border-slate-300 rounded-lg outline-none bg-white text-slate-700"
            >
              <option value="All">All Departments</option>
              <option value="Roads & Buildings">Roads & Buildings</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Electricity">Electricity</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'complaints' ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                <th className="p-4">ID / Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Ward</th>
                <th className="p-4">Status Update</th>
                <th className="p-4">Official Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredComplaints.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <span className="text-xs font-mono text-slate-400 block">{item.id}</span>
                    <span className="font-bold text-slate-800">{item.title}</span>
                    <span className="text-xs text-slate-400 block mt-0.5">By {item.reporter} on {item.reportedDate}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-600">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold ${
                      item.priority === 'High' ? 'text-red-600' : item.priority === 'Medium' ? 'text-orange-500' : 'text-slate-500'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-semibold text-slate-600">{item.ward}</td>
                  <td className="p-4">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`text-xs font-bold p-1.5 rounded-lg border outline-none ${
                        item.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200' :
                        item.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <input
                      type="text"
                      placeholder="Add resolution details..."
                      value={item.remarks}
                      onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Official Profile View */
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm max-w-xl space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Jurisdiction & Official Details</h3>
          <div className="space-y-2 text-sm text-slate-600">
            <p><strong className="text-slate-800">Officer Name:</strong> {officialProfile.name}</p>
            <p><strong className="text-slate-800">Designation:</strong> {officialProfile.designation}</p>
            <p><strong className="text-slate-800">Assigned Jurisdiction:</strong> {officialProfile.jurisdiction}</p>
            <p><strong className="text-slate-800">Primary Department:</strong> {officialProfile.assignedDept}</p>
          </div>
        </div>
      )}

    </div>
  );
}