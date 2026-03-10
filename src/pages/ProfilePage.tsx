import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Check, X, LogOut } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { updateProfile, resolveImageUrl, type ProfileUpdateData } from '@/lib/api';
import PageHeader from '@/components/PageHeader';

interface EditableFields {
  first_name: string;
  last_name: string;
  phone_number: string;
  website: string;
  business_name: string;
  products_sold: string;
  target_customer: string;
  bio: string;
}

const fieldLabels: Record<keyof EditableFields, string> = {
  first_name: 'First Name',
  last_name: 'Last Name',
  phone_number: 'Phone',
  website: 'Website',
  business_name: 'Business Name',
  products_sold: 'Products Sold',
  target_customer: 'Target Customer',
  bio: 'Bio',
};

export default function ProfilePage() {
  const { user, logout, refreshProfile, isPaid, isAdmin } = useUser();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [fields, setFields] = useState<EditableFields>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    website: user?.website || '',
    business_name: user?.business_name || '',
    products_sold: user?.products_sold || '',
    target_customer: user?.target_customer || '',
    bio: user?.bio || '',
  });

  const startEditing = useCallback(() => {
    setFields({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone_number: user?.phone_number || '',
      website: user?.website || '',
      business_name: user?.business_name || '',
      products_sold: user?.products_sold || '',
      target_customer: user?.target_customer || '',
      bio: user?.bio || '',
    });
    setEditing(true);
    setError('');
  }, [user]);

  const cancelEditing = useCallback(() => {
    setEditing(false);
    setError('');
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError('');
    try {
      const data: ProfileUpdateData = {};
      for (const key of Object.keys(fields) as (keyof EditableFields)[]) {
        if (fields[key] !== (user?.[key] || '')) {
          (data as any)[key] = fields[key];
        }
      }
      if (Object.keys(data).length > 0) {
        await updateProfile(data);
        await refreshProfile();
      }
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }, [fields, user, refreshProfile]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  // Use logo (business image) like RN app, fallback to profile_image
  const profileImgUrl = resolveImageUrl(user?.logo) || resolveImageUrl(user?.profile_image);
  const subscriptionLabel = isAdmin
    ? 'Super Admin'
    : isPaid
      ? 'Premium Member'
      : 'Trial Member';

  if (!user) {
    return (
      <div className="py-4">
        <PageHeader title="Profile" />
        <div className="text-center py-12 text-[var(--color-text-muted)]">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <PageHeader title="Profile" />

      {/* Profile header card */}
      <div className="flex flex-col items-center mb-6 p-6 rounded-xl border border-[var(--color-card-border)] bg-white">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-[var(--color-brand-pink-light)] overflow-hidden mb-3 flex items-center justify-center">
          {profileImgUrl ? (
            <img src={profileImgUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-[var(--color-brand-pink)]">
              {(user.first_name?.[0] || '').toUpperCase()}
            </span>
          )}
        </div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {user.first_name} {user.last_name}
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">{user.email}</p>
        <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
          isAdmin
            ? 'bg-purple-50 text-purple-700'
            : isPaid
              ? 'bg-green-50 text-green-700'
              : 'bg-amber-50 text-amber-700'
        }`}>
          {subscriptionLabel}
        </span>
      </div>

      {/* Edit / Save actions */}
      <div className="flex justify-end mb-3 gap-2">
        {editing ? (
          <>
            <button
              onClick={cancelEditing}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition"
            >
              <X size={16} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium text-white bg-[var(--color-brand-pink)] hover:opacity-90 disabled:opacity-50 transition"
            >
              <Check size={16} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        ) : (
          <button
            onClick={startEditing}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-[var(--color-brand-pink)] hover:bg-[var(--color-brand-pink-light)] transition"
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* Profile fields */}
      <div className="space-y-4">
        {(Object.keys(fieldLabels) as (keyof EditableFields)[]).map((key) => (
          <div key={key}>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
              {fieldLabels[key]}
            </label>
            {editing ? (
              key === 'bio' ? (
                <textarea
                  value={fields[key]}
                  onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-pink)] focus:border-transparent transition resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={fields[key]}
                  onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-pink)] focus:border-transparent transition"
                />
              )
            ) : (
              <p className="text-sm text-[var(--color-text-primary)] py-2 border-b border-[var(--color-border-light)]">
                {user[key] || <span className="text-[var(--color-text-muted)] italic">Not set</span>}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full mt-8 mb-4 flex items-center justify-center gap-2 py-3 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition"
      >
        <LogOut size={18} />
        <span className="font-medium">Log Out</span>
      </button>
    </div>
  );
}
