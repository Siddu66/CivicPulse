
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RoleSelection() {
    const navigate = useNavigate();

    const roles = [
        {
            title: 'Citizen',
            description: 'Report issues and track their resolution.',
            icon: '👤',
            path: '/citizen/login',
        },
        {
            title: 'Admin',
            description: 'Manage complaints and coordinate resolution.',
            icon: '🛡️',
            path: '/admin/login',
        },
        {
            title: 'Administrator',
            description: 'Access department administration services.',
            icon: '🏢',
            path: '/administrator/login',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-5 py-12">
            <div className="max-w-5xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-slate-900">
                        Welcome to <span className="text-blue-600">CivicPulse</span>
                    </h1>
                    <p className="text-slate-500 mt-3 text-lg">
                        Select your portal to continue
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {roles.map((role) => (
                        <button
                            key={role.title}
                            onClick={() => navigate(role.path)}
                            className="bg-white rounded-2xl p-8 text-left shadow-md border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition"
                        >
                            <div className="text-5xl mb-6">{role.icon}</div>

                            <h2 className="text-2xl font-bold text-slate-900">
                                {role.title}
                            </h2>

                            <p className="text-slate-500 mt-3 min-h-12">
                                {role.description}
                            </p>

                            <div className="mt-7 text-blue-600 font-bold">
                                Continue →
                            </div>
                        </button>
                    ))}
                </div>

                <div className="text-center mt-10">
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-500 hover:text-blue-600"
                    >
                        ← Back to Welcome
                    </button>
                </div>
            </div>
        </div>
    );
}
