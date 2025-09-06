import React, { useState } from 'react';
import { useUserStore } from '../store/user';

export const OnboardingDialog: React.FC = () => {
  const user = useUserStore(s => s.user);
  const loading = useUserStore(s => s.loading);
  const onboard = useUserStore(s => s.onboard);
  const [open, setOpen] = useState(true);
  const [form, setForm] = useState({ email: '', username: '', password: '', bio: '', role: 'developer' });
  const [customRole, setCustomRole] = useState('');

  if (user || !open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const roleToSave = form.role === 'other' ? (customRole || 'other') : form.role;
    await onboard({ email: form.email, username: form.username, password: form.password, bio: form.bio || undefined, role: roleToSave });
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-black border border-neutral-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Welcome</h2>
        <p className="text-sm text-gray-400 mb-6">Create a lightweight profile to save your workflows.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Username</label>
            <input required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Bio</label>
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white min-h-20" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Role / Profession</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white">
              <option value="developer">Developer</option>
              <option value="designer">Designer</option>
              <option value="product">Product Manager</option>
              <option value="qa">QA / Tester</option>
              <option value="data">Data / Analytics</option>
              <option value="devops">DevOps / SRE</option>
              <option value="support">Support</option>
              <option value="other">Other</option>
            </select>
            {form.role === 'other' && (
              <input
                placeholder="Your role"
                value={customRole}
                onChange={e => setCustomRole(e.target.value)}
                className="mt-2 w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white"
              />
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white">Skip</button>
            <button disabled={loading} className="px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-100 disabled:opacity-60">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}; 