import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import api from '../api/client';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface LinkData {
  id: number;
  short_code: string;
  original_url: string;
  title: string;
  created_at: string;
  is_active: number;
}

interface StatsData {
  totalClicks: number;
  clicksOverTime: { date: string; count: number }[];
  referrers: { source: string; count: number }[];
  devices: { device: string; count: number }[];
}

export default function LinkDetail() {
  const { id } = useParams();
  const [link, setLink] = useState<LinkData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [linkRes, statsRes, qrRes] = await Promise.all([
          api.get(`/links/${id}`),
          api.get(`/links/${id}/analytics`),
          api.post(`/links/${id}/qr`),
        ]);
        setLink(linkRes.data);
        setStats(statsRes.data);
        setQrCode(qrRes.data.qrCode);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!link || !stats) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>Link not found</p>
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const baseUrl = window.location.origin;

  const lineData = {
    labels: stats.clicksOverTime.map((c) => c.date),
    datasets: [
      {
        label: 'Clicks',
        data: stats.clicksOverTime.map((c) => c.count),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const doughnutData = {
    labels: stats.referrers.map((r) => r.source),
    datasets: [
      {
        data: stats.referrers.map((r) => r.count),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      },
    ],
  };

  const deviceData = {
    labels: stats.devices.map((d) => d.device),
    datasets: [
      {
        data: stats.devices.map((d) => d.count),
        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        to="/dashboard"
        className="text-blue-600 hover:underline text-sm mb-4 inline-block"
      >
        &larr; Back to Dashboard
      </Link>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h1 className="text-xl font-bold mb-2">
          {link.title || link.original_url}
        </h1>
        <a
          href={`${baseUrl}/${link.short_code}`}
          target="_blank"
          className="text-blue-600 hover:underline"
        >
          {baseUrl}/{link.short_code}
        </a>
        <p className="text-gray-400 text-sm mt-1 truncate">
          {link.original_url}
        </p>
        <div className="flex gap-4 mt-3 text-sm text-gray-500">
          <span>Created {new Date(link.created_at).toLocaleDateString()}</span>
          <span
            className={
              link.is_active ? 'text-green-600' : 'text-red-600'
            }
          >
            {link.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">
            {stats.totalClicks}
          </p>
          <p className="text-sm text-gray-500">Total Clicks</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
          <p className="text-3xl font-bold text-green-600">
            {stats.referrers.find((r) => r.source === 'Direct')?.count || 0}
          </p>
          <p className="text-sm text-gray-500">Direct Visits</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">
            {stats.devices.find((d) => d.device === 'Mobile')?.count || 0}
          </p>
          <p className="text-sm text-gray-500">Mobile Visits</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">
            {stats.clicksOverTime.length > 0
              ? stats.clicksOverTime.length
              : 0}
          </p>
          <p className="text-sm text-gray-500">Active Days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-4">Clicks Over Time</h2>
          {stats.clicksOverTime.length > 0 ? (
            <Line data={lineData} options={{ responsive: true }} />
          ) : (
            <p className="text-gray-400 text-center py-8">No clicks yet</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-4">Referrers</h2>
          {stats.referrers.length > 0 ? (
            <div className="flex items-center justify-center">
              <div className="w-48">
                <Doughnut
                  data={doughnutData}
                  options={{ responsive: true }}
                />
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No data yet</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-4">Device Breakdown</h2>
          {stats.devices.length > 0 ? (
            <div className="flex items-center justify-center">
              <div className="w-48">
                <Doughnut
                  data={deviceData}
                  options={{ responsive: true }}
                />
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No data yet</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <h2 className="font-semibold mb-4">QR Code</h2>
          {qrCode ? (
            <div>
              <img
                src={qrCode}
                alt="QR Code"
                className="mx-auto w-40 h-40"
              />
              <a
                href={qrCode}
                download={`qr-${link.short_code}.png`}
                className="inline-block mt-3 text-sm text-blue-600 hover:underline"
              >
                Download QR
              </a>
            </div>
          ) : (
            <p className="text-gray-400 py-8">Loading...</p>
          )}
        </div>
      </div>

      {stats.referrers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
          <h2 className="font-semibold mb-4">Referrer Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium text-gray-500">Source</th>
                  <th className="pb-2 font-medium text-gray-500">Clicks</th>
                  <th className="pb-2 font-medium text-gray-500">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {stats.referrers.map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2">{r.source}</td>
                    <td className="py-2">{r.count}</td>
                    <td className="py-2">
                      {stats.totalClicks > 0
                        ? ((r.count / stats.totalClicks) * 100).toFixed(1) + '%'
                        : '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
