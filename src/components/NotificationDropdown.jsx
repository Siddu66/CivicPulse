import React, { useState } from 'react';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Complaint #CP-1022 Updated', message: 'Status changed to In Progress by Tahsildar Office', time: '10m ago', unread: true },
    { id: 2, title: 'Emergency Broadcast', message: 'Water main repair active near Ward 14', time: '1h ago', unread: true },
    { id: 3, title: 'Resolution Alert', message: 'Please verify completion for #CP-1019', time: '2h ago', unread: false },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-blue-600 transition rounded-xl hover:bg-slate-100"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[11px] text-blue-600 hover:underline font-semibold">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {notifications.map((n) => (
              <div key={n.id} className={`p-3 text-xs space-y-1 transition ${n.unread ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}>
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{n.title}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                </div>
                <p className="text-slate-600">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}