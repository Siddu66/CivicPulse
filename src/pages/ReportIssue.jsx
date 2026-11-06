import React, { useState } from 'react';

export default function ReportIssue() {
  const [formData, setFormData] = useState({ title: '', category: 'Roads', location: '', description: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Report submitted successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Report a Community Problem</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Issue Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Broken streetlight on Main St"
            className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option>Roads & Potholes</option>
            <option>Sanitation & Garbage</option>
            <option>Water Supply</option>
            <option>Electricity & Lighting</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            required
            placeholder="Street address or landmark"
            className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows="4"
            required
            placeholder="Provide details about the issue..."
            className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Submit Report
        </button>
      </form>
    </div>
  );
}