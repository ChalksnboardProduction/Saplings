"use client";
import { useEffect, useState } from "react";

import Header from "@/components/Header";

export default function AdminPanel() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    async function fetchStudents() {
        try {
            const res = await fetch('/api/students');
            if (!res.ok) throw new Error('Failed to fetch data');
            const data = await res.json();
            setStudents(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />

            <main className="flex-grow py-28 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="font-heading text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium text-gray-600">
                            Total Registrations: {students.length}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-12 flex justify-center items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : students.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                No registrations found.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500">
                                        <tr>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Student Name</th>
                                            <th className="px-6 py-4">Class</th>
                                            <th className="px-6 py-4">Parent Name</th>
                                            <th className="px-6 py-4">Phone</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Address</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {students.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {new Date(student.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900">{student.student_name}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                        {student.class}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{student.parent_name}</td>
                                                <td className="px-6 py-4">{student.phone}</td>
                                                <td className="px-6 py-4">{student.email}</td>
                                                <td className="px-6 py-4 max-w-xs truncate" title={student.address}>
                                                    {student.address}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
