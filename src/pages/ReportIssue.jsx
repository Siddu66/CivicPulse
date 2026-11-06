
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ReportIssue() {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    incident_district: '',
    incident_area: '',
    incident_ward: '',
  });

  const [coordinates, setCoordinates] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === 'location') {
      setCoordinates(null);
      setLocationMessage(
        'Address edited manually. Detect GPS again to attach coordinates.'
      );
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('GPS is not supported by this browser.');
      return;
    }

    setDetecting(true);
    setLocationMessage('Detecting your GPS location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setCoordinates({ latitude, longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept-Language': 'en' } }
          );

          if (!response.ok) throw new Error('Address lookup failed');

          const data = await response.json();

          setFormData((previous) => ({
            ...previous,
            location: data.display_name || previous.location,
          }));

          setLocationMessage(
            'GPS detected. Please verify the incident district, area and ward below.'
          );
        } catch {
          setLocationMessage(
            'GPS coordinates detected. Enter the address and incident area manually.'
          );
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        const messages = {
          1: 'Location permission denied. Allow location access in your browser.',
          2: 'Current location could not be determined.',
          3: 'GPS request timed out. Please try again.',
        };

        setLocationMessage(
          messages[error.code] || 'Unable to detect location.'
        );
        setDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMessage('Please select a JPG, PNG or WEBP image.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image must be smaller than 5 MB.');
      e.target.value = '';
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccess(false);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const session = sessionData.session;

      if (!session) {
        throw new Error('Please log in before submitting a complaint.');
      }

      const body = new FormData();

      body.append('title', formData.title);
      body.append('location', formData.location);
      body.append('description', formData.description);
      body.append('category', '');

      // Actual location where the incident occurred
      body.append('incident_district', formData.incident_district.trim());
      body.append('incident_area', formData.incident_area.trim());
      body.append('incident_ward', formData.incident_ward.trim());

      if (coordinates) {
        body.append('latitude', String(coordinates.latitude));
        body.append('longitude', String(coordinates.longitude));
      }

      if (image) body.append('image', image);

      const response = await fetch(
        'http://127.0.0.1:5000/api/complaints',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit report.');
      }

      setSuccess(true);
      setMessage(
        `Report submitted successfully! Complaint ID: ${data.complaint.id}`
      );

      setFormData({
        title: '',
        location: '',
        description: '',
        incident_district: '',
        incident_area: '',
        incident_ward: '',
      });

      setCoordinates(null);
      setImage(null);
      setPreview('');
      setLocationMessage('');
      e.target.reset();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const mapUrl = coordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.longitude - 0.005},${coordinates.latitude - 0.005},${coordinates.longitude + 0.005},${coordinates.latitude + 0.005}&layer=mapnik&marker=${coordinates.latitude},${coordinates.longitude}`
    : '';

  const inputClass =
    'w-full mt-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Report a Community Problem
      </h2>

      <p className="text-sm text-gray-500 mb-6">
        Report problems from anywhere. The complaint will be sent to the
        administrator responsible for the incident location.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Issue Title
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Broken streetlight"
            className={inputClass}
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <label className="block text-sm font-medium text-gray-700">
              Complaint Address
            </label>

            <button
              type="button"
              onClick={detectLocation}
              disabled={detecting}
              className="text-sm font-semibold text-blue-600 disabled:text-gray-400"
            >
              {detecting ? 'Detecting...' : '📍 Detect My Location'}
            </button>
          </div>

          <input
            type="text"
            name="location"
            required
            value={formData.location}
            onChange={handleChange}
            placeholder="GPS address or enter the incident address"
            className={inputClass}
          />

          {locationMessage && (
            <p className="text-xs text-gray-600 mt-2">
              {locationMessage}
            </p>
          )}

          {coordinates && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-green-700">
                GPS: {coordinates.latitude.toFixed(6)},{' '}
                {coordinates.longitude.toFixed(6)}
              </p>

              <iframe
                title="Detected complaint location"
                src={mapUrl}
                className="w-full h-64 rounded-lg border"
                loading="lazy"
              />

              <a
                href={`https://www.openstreetmap.org/?mlat=${coordinates.latitude}&mlon=${coordinates.longitude}#map=17/${coordinates.latitude}/${coordinates.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 underline"
              >
                Open location in map
              </a>
            </div>
          )}
        </div>

        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-3">
          <div>
            <h3 className="font-semibold text-gray-800">
              Incident Area Details
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Enter where the problem occurred, even if it is outside your
              registered residential area.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incident District
            </label>
            <input
              type="text"
              name="incident_district"
              required
              value={formData.incident_district}
              onChange={handleChange}
              placeholder="e.g. Mysuru"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incident Area / Locality
            </label>
            <input
              type="text"
              name="incident_area"
              required
              value={formData.incident_area}
              onChange={handleChange}
              placeholder="e.g. Vijayanagar"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incident Ward
            </label>
            <input
              type="text"
              name="incident_ward"
              required
              value={formData.incident_ward}
              onChange={handleChange}
              placeholder="e.g. Ward 12"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            rows="4"
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide details about the issue..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Issue Photo (Optional)
          </label>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />

          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG or WEBP. Maximum size: 5 MB.
          </p>

          {preview && (
            <div className="mt-3">
              <img
                src={preview}
                alt="Complaint preview"
                className="max-h-56 rounded-lg border object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setPreview('');
                }}
                className="block mt-2 text-sm text-red-600"
              >
                Remove photo
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500">
          The system will suggest the complaint category and priority.
        </p>

        <button
          type="submit"
          disabled={loading || detecting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg"
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>

        {message && (
          <p
            className={`text-sm font-medium text-center ${success ? 'text-green-600' : 'text-red-600'
              }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
