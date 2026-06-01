import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { getToken } from '../api/client';

interface LinkItem {
  id: number;
  short_code: string;
  original_url: string;
  title: string;
  click_count: number;
  created_at: string;
  is_active: number;
}

export default function Dashboard() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [linksRes, keysRes] = await Promise.all([
          api.get('/links'),
          api.get('/auth/keys'),
        ]);
        setLinks(linksRes.data.links);
        setApiKey(keysRes.data.apiKey);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (getToken()) fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this link? All click data will be lost.')) return;
    await api.delete(`/links/${id}`);
    setLinks(links.filter((l) => l.id !== id));
  };

  const handleToggle = async (id: number, current: number) => {
    await api.put(`/links/${id}`, { isActive: current === 0 });
    setLinks(links.map((l) => (l.id === id ? { ...l, is_active: current === 0 ? 1 : 0 } : l)));
  };

  const baseUrl = window.location.origin;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Links</h1>
        <Link
          to="/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create Link
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 mb-8">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Your API Key
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={apiKey}
            readOnly
            className="flex-1 border rounded-lg px-3 py-2 bg-gray-50 text-sm font-mono"
          />
          <button
            onClick={() => navigator.clipboard.writeText(apiKey)}
            className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
          >
            Copy
          </button>
        </div>
      </div>

      {links.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No links yet</p>
          <Link to="/create" className="text-blue-600 hover:underline">
            Create your first short link
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((link) => (
            <div
              key={link.id}
              className="bg-white rounded-xl shadow-sm border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {link.title || link.original_url}
                  </p>
                  <a
                    href={`${baseUrl}/${link.short_code}`}
                    target="_blank"
                    className="text-blue-600 text-sm hover:underline"
                  >
                    {baseUrl}/{link.short_code}
                  </a>
                  <p className="text-gray-400 text-sm truncate mt-1">
                    {link.original_url}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Created {new Date(link.created_at).toLocaleDateString()}{' '}
                    &middot; {link.click_count} clicks
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(link.id, link.is_active)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      link.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {link.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <Link
                    to={`/link/${link.id}`}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100"
                  >
                    Stats
                  </Link>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
