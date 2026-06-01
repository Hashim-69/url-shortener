import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function CreateLink() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [title, setTitle] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');
  const [created, setCreated] = useState<any>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreated(null);

    try {
      const res = await api.post('/links', {
        originalUrl,
        customSlug: customSlug || undefined,
        title: title || undefined,
        expiresAt: expiresAt || undefined,
      });
      setCreated(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create link');
    }
  };

  const baseUrl = window.location.origin;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create Short Link</h1>

      {created && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-green-700 font-medium mb-2">Link created!</p>
          <a
            href={`${baseUrl}/${created.shortCode}`}
            target="_blank"
            className="text-blue-600 hover:underline block"
          >
            {baseUrl}/{created.shortCode}
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(`${baseUrl}/${created.shortCode}`)}
            className="mt-2 text-sm px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            Copy to clipboard
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination URL *
          </label>
          <input
            type="url"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://example.com/very/long/url"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom Slug (optional)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">{baseUrl}/</span>
            <input
              type="text"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder="my-custom-slug"
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Link"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date (optional)
          </label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 rounded-lg border hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
