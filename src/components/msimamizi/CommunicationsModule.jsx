import React, { useState } from 'react';
import {
  Mail,
  Bell,
  Megaphone,
  FileCode2,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import {
  hasPermission,
  msimamiziEnterpriseService,
} from '@/services/msimamiziEnterpriseService';

export default function CommunicationsModule({
  activeTab,
  communications = [],
  templates = [],
  announcements = [],
  registrations = [],
  inquiries = [],
  currentUser,
  onDataChange,
  showToast,
}) {
  const canWrite = hasPermission(currentUser, 'communications.write');

  const [emailForm, setEmailForm] = useState({
    channel: 'Email',
    category: 'Admissions',
    recipientName: '',
    recipientContact: '',
    subject: '',
    body: '',
    templateName: '',
  });
  const [sending, setSending] = useState(false);

  const [tplForm, setTplForm] = useState({ name: '', channel: 'Email', category: 'Admissions', subject: '', body: '' });
  const [annForm, setAnnForm] = useState({ title: '', body: '', audience: 'All Website Visitors', status: 'Published' });

  const applyTemplate = (tplId) => {
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) return;
    setEmailForm((prev) => ({
      ...prev,
      channel: tpl.channel || 'Email',
      category: tpl.category || 'General',
      subject: tpl.subject || '',
      body: tpl.body || '',
      templateName: tpl.name,
    }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!canWrite) return;
    setSending(true);
    const rec = await msimamiziEnterpriseService.sendCommunication(emailForm, currentUser);
    setSending(false);
    onDataChange();
    showToast(`Message logged (${rec.deliveryStatus}).`);
    if (emailForm.channel === 'WhatsApp' && emailForm.recipientContact) {
      const digits = emailForm.recipientContact.replace(/[^0-9]/g, '');
      if (digits) window.open(`https://wa.me/${digits}?text=${encodeURIComponent(emailForm.body)}`, '_blank', 'noopener,noreferrer');
    }
    setEmailForm({ channel: 'Email', category: 'Admissions', recipientName: '', recipientContact: '', subject: '', body: '', templateName: '' });
  };

  // 1. MESSAGE TEMPLATES
  if (activeTab === 'message-templates') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-black text-[#032e42] flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-[#008000]" /> Reusable Message Templates ({templates.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {templates.map((t) => (
              <div key={t.id} className="p-4 space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#032e42]">{t.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#008000] text-[10px] font-bold">{t.channel}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">{t.category}</span>
                  </div>
                  {canWrite && (
                    <button
                      type="button"
                      onClick={() => { msimamiziEnterpriseService.deleteTemplate(t.id); onDataChange(); }}
                      className="text-slate-400 hover:text-[#DC4545] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="font-semibold text-slate-700">{t.subject}</p>
                <p className="text-[#718096] whitespace-pre-line line-clamp-3">{t.body}</p>
              </div>
            ))}
          </div>
        </div>

        {canWrite && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!tplForm.name.trim()) return;
              msimamiziEnterpriseService.saveTemplate(tplForm, currentUser);
              setTplForm({ name: '', channel: 'Email', category: 'Admissions', subject: '', body: '' });
              onDataChange();
              showToast('Template saved.');
            }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 text-xs h-fit"
          >
            <h3 className="text-sm font-black text-[#032e42] flex items-center gap-1.5"><Plus className="w-4 h-4 text-[#008000]" /> New Template</h3>
            <input required placeholder="Template Name" value={tplForm.name} onChange={(e) => setTplForm({ ...tplForm, name: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            <div className="grid grid-cols-2 gap-2">
              <select value={tplForm.channel} onChange={(e) => setTplForm({ ...tplForm, channel: e.target.value })} className="h-9 px-2.5 rounded-xl border border-slate-300 bg-white">
                <option>Email</option>
                <option>WhatsApp</option>
              </select>
              <select value={tplForm.category} onChange={(e) => setTplForm({ ...tplForm, category: e.target.value })} className="h-9 px-2.5 rounded-xl border border-slate-300 bg-white">
                <option>Admissions</option>
                <option>Finance</option>
                <option>CRM</option>
                <option>Recruitment</option>
                <option>General</option>
              </select>
            </div>
            <input required placeholder="Subject" value={tplForm.subject} onChange={(e) => setTplForm({ ...tplForm, subject: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            <textarea required rows={5} placeholder="Message body (supports {{name}}, {{courseTitle}}...)" value={tplForm.body} onChange={(e) => setTplForm({ ...tplForm, body: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300" />
            <button type="submit" className="w-full py-2.5 rounded-xl bg-[#008000] text-white font-bold cursor-pointer">Save Template</button>
          </form>
        )}
      </div>
    );
  }

  // 2. ANNOUNCEMENTS
  if (activeTab === 'announcements') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-black text-[#032e42] flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#008000]" /> Institutional &amp; Website Announcements ({announcements.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {announcements.length === 0 ? (
              <div className="p-10 text-center text-xs text-[#718096]">No announcements created yet.</div>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="p-4 text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#032e42]">{ann.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ann.status === 'Published' ? 'bg-emerald-100 text-[#16A36A]' : 'bg-slate-200 text-slate-700'
                      }`}>{ann.status}</span>
                    </div>
                    {canWrite && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            msimamiziEnterpriseService.saveAnnouncement({ ...ann, status: ann.status === 'Published' ? 'Draft' : 'Published' }, currentUser);
                            onDataChange();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-[10.5px] cursor-pointer"
                        >
                          {ann.status === 'Published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { msimamiziEnterpriseService.deleteAnnouncement(ann.id, currentUser); onDataChange(); }}
                          className="text-slate-400 hover:text-[#DC4545] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-slate-600 whitespace-pre-line">{ann.body}</p>
                  <p className="text-[10.5px] text-[#718096]">Audience: {ann.audience} • By {ann.createdBy}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {canWrite && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!annForm.title.trim()) return;
              msimamiziEnterpriseService.saveAnnouncement(annForm, currentUser);
              setAnnForm({ title: '', body: '', audience: 'All Website Visitors', status: 'Published' });
              onDataChange();
              showToast('Announcement saved & synced.');
            }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 text-xs h-fit"
          >
            <h3 className="text-sm font-black text-[#032e42]">Publish Announcement</h3>
            <input required placeholder="Announcement Headline" value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
            <select value={annForm.audience} onChange={(e) => setAnnForm({ ...annForm, audience: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white">
              <option>All Website Visitors</option>
              <option>Registered Delegates</option>
              <option>Internal Staff</option>
            </select>
            <select value={annForm.status} onChange={(e) => setAnnForm({ ...annForm, status: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white">
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
            <textarea required rows={5} placeholder="Announcement message..." value={annForm.body} onChange={(e) => setAnnForm({ ...annForm, body: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300" />
            <button type="submit" className="w-full py-2.5 rounded-xl bg-[#008000] text-white font-bold cursor-pointer">Save Announcement</button>
          </form>
        )}
      </div>
    );
  }

  // 3. EMAIL CENTRE & NOTIFICATIONS
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      {canWrite && (
        <form onSubmit={handleSend} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5 text-xs h-fit">
          <h2 className="text-base font-black text-[#032e42] flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#008000]" /> Compose Message
          </h2>

          <div>
            <label className="block font-bold text-[#032e42] mb-1">Load Reusable Template</label>
            <select onChange={(e) => applyTemplate(e.target.value)} defaultValue="" className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white">
              <option value="">— Select Template —</option>
              {templates.map((t) => <option key={t.id} value={t.id}>[{t.channel}] {t.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Channel</label>
              <select value={emailForm.channel} onChange={(e) => setEmailForm({ ...emailForm, channel: e.target.value })} className="w-full h-9 px-2.5 rounded-xl border border-slate-300 bg-white">
                <option value="Email">Email</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#032e42] mb-1">Category</label>
              <select value={emailForm.category} onChange={(e) => setEmailForm({ ...emailForm, category: e.target.value })} className="w-full h-9 px-2.5 rounded-xl border border-slate-300 bg-white">
                <option>Admissions</option>
                <option>Invoice Reminder</option>
                <option>Payment Confirmation</option>
                <option>Follow-up</option>
                <option>Vacancy Notice</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#032e42] mb-1">Recipient Name</label>
            <input
              list="comm-recipients"
              value={emailForm.recipientName}
              onChange={(e) => setEmailForm({ ...emailForm, recipientName: e.target.value })}
              placeholder="Delegate or Lead Name"
              className="w-full h-9 px-3 rounded-xl border border-slate-300"
            />
            <datalist id="comm-recipients">
              {registrations.map((r) => <option key={r.id} value={[r.firstName, r.lastName].filter(Boolean).join(' ')} />)}
              {inquiries.map((i) => <option key={i.id} value={i.fullName} />)}
            </datalist>
          </div>

          <div>
            <label className="block font-bold text-[#032e42] mb-1">
              {emailForm.channel === 'WhatsApp' ? 'WhatsApp Phone Number *' : 'Recipient Email *'}
            </label>
            <input
              required
              type={emailForm.channel === 'Email' ? 'email' : 'text'}
              value={emailForm.recipientContact}
              onChange={(e) => setEmailForm({ ...emailForm, recipientContact: e.target.value })}
              placeholder={emailForm.channel === 'WhatsApp' ? '+2547...' : 'delegate@organisation.org'}
              className="w-full h-9 px-3 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-bold text-[#032e42] mb-1">Subject *</label>
            <input required value={emailForm.subject} onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })} className="w-full h-9 px-3 rounded-xl border border-slate-300" />
          </div>

          <div>
            <label className="block font-bold text-[#032e42] mb-1">Message Body *</label>
            <textarea required rows={6} value={emailForm.body} onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300" />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full py-2.5 rounded-xl bg-[#032e42] hover:bg-[#06405c] text-white font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-[#008000]" />
            <span>{sending ? 'Dispatching...' : `Send & Log ${emailForm.channel}`}</span>
          </button>
        </form>
      )}

      <div className={`${canWrite ? 'lg:col-span-3' : 'lg:col-span-5'} bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden`}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-[#032e42] flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#008000]" /> {activeTab === 'notifications' ? 'Notification History' : 'Communication Delivery Log'} ({communications.length})
          </h2>
        </div>
        <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
          {communications.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#718096]">No messages dispatched yet.</div>
          ) : (
            communications.map((msg) => (
              <div key={msg.id} className="p-4 text-xs space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#008000] font-bold text-[10px]">{msg.channel}</span>
                    <span className="font-bold text-[#032e42]">{msg.subject}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#16A36A]">
                    <CheckCircle2 className="w-3 h-3" /> {msg.deliveryStatus}
                  </span>
                </div>
                <p className="text-[11px] text-[#718096]">
                  To: <strong>{msg.recipientName || msg.recipientContact}</strong> ({msg.recipientContact}) • By {msg.sentBy} • {new Date(msg.sentAt).toLocaleString()}
                </p>
                <p className="text-slate-600 line-clamp-2">{msg.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
