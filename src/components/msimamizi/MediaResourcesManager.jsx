import React, { useState, useEffect, useMemo } from 'react';
import {
  Camera,
  FolderOpen,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Upload,
  CheckCircle2,
  Search,
  RotateCcw,
  FileText,
  Video as VideoIcon,
  BookOpen,
  Scale,
  FileBadge,
  Book,
  Wifi,
  X,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { hasPermission } from '@/services/msimamiziEnterpriseService';
import { realtimeService } from '@/services/realtimeService';

const GALLERY_CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'training', label: 'Training Programs' },
  { id: 'events', label: 'Events & Conferences' },
  { id: 'fieldwork', label: 'Field Work' },
  { id: 'community', label: 'Community Engagement' },
];

const RESOURCE_TABS = [
  { id: 'publications', label: 'Publications', icon: BookOpen, path: '/resources/publications', urlLabel: 'PDF / Document URL', defaultType: 'Policy Document' },
  { id: 'policyBriefs', label: 'Policy Briefs', icon: FileBadge, path: '/resources/policy-briefs', urlLabel: 'PDF / Brief Download URL', defaultType: 'Policy Brief' },
  { id: 'policies', label: 'Policies & Laws', icon: Scale, path: '/resources/policies-and-laws', urlLabel: 'Policy PDF URL', defaultType: 'Governance' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/resources/reports', urlLabel: 'Report PDF URL', defaultType: 'Project Report' },
  { id: 'videos', label: 'Videos', icon: VideoIcon, path: '/resources/videos', urlLabel: 'YouTube or MP4 Video URL', defaultType: 'Webinar / Documentary' },
  { id: 'books', label: 'Books', icon: Book, path: '/resources/books', urlLabel: 'Book PDF / Store URL', defaultType: 'Handbook' },
];

function compressImageToDataUrl(file, maxWidth = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / Math.max(img.width, img.height || 1));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(reader.result);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function readPdfAsDataUrl(file, maxBytes = 3 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    if (file.size > maxBytes) {
      reject(new Error('PDF exceeds 3 MB direct upload limit. Upload to /pdfs or host via URL instead.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read PDF file.'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });
}

export default function MediaResourcesManager({ activeTab, currentUser, showToast, onDataChange }) {
  const canWrite = hasPermission(currentUser, 'cms.write');
  const isGalleryMode = activeTab === 'cms-gallery';
  const [transport, setTransport] = useState(() => realtimeService.getTransportState());

  // Gallery State
  const [galleryImages, setGalleryImages] = useState(() => dataService.getGalleryImages());
  const [galleryCatFilter, setGalleryCatFilter] = useState('all');
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState(null);
  const [galleryForm, setGalleryForm] = useState({ src: '', category: 'training', title: '', description: '' });

  // Resources State
  const [resourceSubTab, setResourceSubTab] = useState('publications');
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourcesVersion, setResourcesVersion] = useState(0);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [editingResourceItem, setEditingResourceItem] = useState(null);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    type: 'Policy Document',
    issue: '',
    date: String(new Date().getFullYear()),
    pages: 'PDF Document',
    authors: 'ECAS Institute',
    country: 'Kenya / Africa',
    summary: '',
    image: '',
    downloadUrl: '',
    tags: 'Sustainability, Policy',
    isSensitive: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const refreshGallery = () => setGalleryImages(dataService.getGalleryImages());
    const refreshResources = () => setResourcesVersion((v) => v + 1);
    const updateTransport = () => setTransport(realtimeService.getTransportState());

    window.addEventListener('ecasi_gallery_updated', refreshGallery);
    window.addEventListener('ecasi_resources_updated', refreshResources);
    window.addEventListener('ecasi_realtime_event', updateTransport);
    updateTransport();

    return () => {
      window.removeEventListener('ecasi_gallery_updated', refreshGallery);
      window.removeEventListener('ecasi_resources_updated', refreshResources);
      window.removeEventListener('ecasi_realtime_event', updateTransport);
    };
  }, []);

  const activeResourceMeta = RESOURCE_TABS.find((t) => t.id === resourceSubTab) || RESOURCE_TABS[0];

  const currentResourcesList = useMemo(() => {
    void resourcesVersion;
    const list = dataService.getResourcesByType(resourceSubTab);
    return Array.isArray(list) ? list : [];
  }, [resourceSubTab, resourcesVersion]);

  const filteredGallery = useMemo(() => {
    const q = gallerySearch.trim().toLowerCase();
    return (Array.isArray(galleryImages) ? galleryImages : []).filter((img) => {
      const catOk = galleryCatFilter === 'all' || img.category === galleryCatFilter;
      const qOk =
        !q ||
        String(img.title || '').toLowerCase().includes(q) ||
        String(img.description || '').toLowerCase().includes(q) ||
        String(img.src || '').toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [galleryImages, galleryCatFilter, gallerySearch]);

  const filteredResources = useMemo(() => {
    const q = resourceSearch.trim().toLowerCase();
    return currentResourcesList.filter((item) => {
      if (!q) return true;
      return (
        String(item.title || '').toLowerCase().includes(q) ||
        String(item.type || '').toLowerCase().includes(q) ||
        String(item.authors || item.author || '').toLowerCase().includes(q) ||
        String(item.country || '').toLowerCase().includes(q) ||
        (Array.isArray(item.tags) && item.tags.some((t) => String(t).toLowerCase().includes(q)))
      );
    });
  }, [currentResourcesList, resourceSearch]);

  const openAddGallery = () => {
    setEditingGalleryItem(null);
    setGalleryForm({ src: '', category: 'training', title: '', description: '' });
    setGalleryModalOpen(true);
  };

  const openEditGallery = (img) => {
    setEditingGalleryItem(img);
    setGalleryForm({
      id: img.id,
      src: img.src || '',
      category: img.category || 'training',
      title: img.title || '',
      description: img.description || '',
      createdAt: img.createdAt,
    });
    setGalleryModalOpen(true);
  };

  const handleGalleryFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setGalleryForm((prev) => ({
        ...prev,
        src: dataUrl,
        title: prev.title || file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '),
      }));
    } catch (err) {
      showToast(err.message || 'Could not process image file.', 'error');
    }
  };

  const handleSaveGallery = async (e) => {
    e.preventDefault();
    if (!canWrite) return;
    setIsSaving(true);
    try {
      const res = await dataService.saveGalleryImage(
        editingGalleryItem ? { ...editingGalleryItem, ...galleryForm } : galleryForm
      );
      if (res?.ok) {
        setGalleryImages(res.list);
        setGalleryModalOpen(false);
        onDataChange?.();
        showToast(
          res.serverResponse?.success === false
            ? 'Saved locally, but server sync returned an error.'
            : editingGalleryItem
              ? 'Gallery photo updated and synced in real time.'
              : 'New photo added to Gallery and synced in real time.'
        );
      } else {
        showToast(res?.error || 'Failed to save gallery image.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGallery = async (img) => {
    if (!canWrite) return;
    const key = img.id || img.src;
    if (!window.confirm(`Delete "${img.title || 'this photo'}" from the public website gallery?`)) return;
    const res = await dataService.deleteGalleryImage(key);
    if (res?.ok) {
      setGalleryImages(res.list);
      onDataChange?.();
      showToast('Photo removed from Gallery and synced.');
    } else {
      showToast(res?.error || 'Unable to delete photo.', 'error');
    }
  };

  const openAddResource = () => {
    setEditingResourceItem(null);
    setResourceForm({
      title: '',
      type: activeResourceMeta.defaultType,
      issue: resourceSubTab === 'policyBriefs' ? `Brief #${currentResourcesList.length + 1}` : '',
      date: String(new Date().getFullYear()),
      pages: resourceSubTab === 'videos' ? 'Video' : 'PDF Document',
      authors: 'ECAS Institute',
      country: 'Kenya / Africa',
      summary: '',
      image: '',
      downloadUrl: '',
      tags: 'Sustainability, Climate Action',
      isSensitive: false,
    });
    setResourceModalOpen(true);
  };

  const openEditResource = (item) => {
    setEditingResourceItem(item);
    setResourceForm({
      id: item.id,
      title: item.title || '',
      type: item.type || activeResourceMeta.defaultType,
      issue: item.issue || '',
      date: item.date || String(new Date().getFullYear()),
      pages: item.pages || 'PDF Document',
      authors: item.authors || item.author || 'ECAS Institute',
      country: item.country || 'Africa / Global',
      summary: item.abstract || item.summary || item.description || '',
      image: item.image || '',
      downloadUrl: item.downloadUrl || item.url || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      isSensitive: Boolean(item.isSensitive),
      createdAt: item.createdAt,
    });
    setResourceModalOpen(true);
  };

  const handleResourceDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readPdfAsDataUrl(file);
      setResourceForm((prev) => ({
        ...prev,
        downloadUrl: dataUrl,
        title: prev.title || file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '),
        pages: `${Math.max(1, Math.round(file.size / 1024))} KB PDF`,
      }));
    } catch (err) {
      showToast(err.message || 'Unable to load PDF.', 'error');
    }
  };

  const handleResourceCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file, 960, 0.8);
      setResourceForm((prev) => ({ ...prev, image: dataUrl }));
    } catch (err) {
      showToast(err.message || 'Unable to load cover image.', 'error');
    }
  };

  const handleSaveResource = async (e) => {
    e.preventDefault();
    if (!canWrite) return;
    setIsSaving(true);
    try {
      const payload = {
        ...resourceForm,
        author: resourceForm.authors,
        abstract: resourceForm.summary,
        description: resourceForm.summary,
        url: resourceForm.downloadUrl,
      };
      const res = await dataService.saveResourceItem(
        resourceSubTab,
        editingResourceItem ? { ...editingResourceItem, ...payload } : payload
      );
      if (res?.ok) {
        setResourcesVersion((v) => v + 1);
        setResourceModalOpen(false);
        onDataChange?.();
        showToast(
          editingResourceItem
            ? `${activeResourceMeta.label} item updated and synced.`
            : `Added to ${activeResourceMeta.label} and synced live.`
        );
      } else {
        showToast(res?.error || 'Failed to save resource.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResource = async (item) => {
    if (!canWrite) return;
    if (!window.confirm(`Delete "${item.title}" from ${activeResourceMeta.label}? This removes it from ecasiafrica.org immediately.`)) return;
    const res = await dataService.deleteResourceItem(resourceSubTab, item.id);
    if (res?.ok) {
      setResourcesVersion((v) => v + 1);
      onDataChange?.();
      showToast(`Deleted "${item.title}" and synced live.`);
    } else {
      showToast(res?.error || 'Unable to delete resource.', 'error');
    }
  };

  const liveBadge = (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#008000] border border-emerald-200">
      <Wifi className="w-3 h-3" />
      {transport === 'socket.io' ? 'Live Socket.IO Sync' : transport === 'sse' ? 'Live Real-Time Push' : 'Real-Time Sync Active'}
    </span>
  );

  // ─── GALLERY MANAGER VIEW ───────────────────────────────────────────────────
  if (isGalleryMode) {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-[#032e42] flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#008000]" /> Website Gallery Manager ({filteredGallery.length})
                </h2>
                {liveBadge}
              </div>
              <p className="text-xs text-[#718096] mt-0.5">
                Add, edit, or delete photographs shown publicly on ecasiafrica.org/gallery. Changes sync in real time.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/gallery"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F8FC] border border-slate-200 text-xs font-bold text-[#032e42] hover:bg-slate-100"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Public Gallery
              </a>
              {canWrite && (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm('Restore default built-in ECAS Institute gallery photos?')) return;
                      const res = await dataService.resetGalleryToDefaults();
                      if (res?.ok) {
                        setGalleryImages(res.list);
                        showToast('Gallery restored to default photos and synced.');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#032e42] text-xs font-bold cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore Defaults
                  </button>
                  <button
                    type="button"
                    onClick={openAddGallery}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#008000] hover:bg-[#006600] text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Gallery Photo
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={gallerySearch}
                onChange={(e) => setGallerySearch(e.target.value)}
                placeholder="Search photos by title, description or path..."
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#008000]/20"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {GALLERY_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setGalleryCatFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    galleryCatFilter === cat.id
                      ? 'bg-[#032e42] text-white'
                      : 'bg-[#F5F8FC] text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredGallery.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-[#718096]">
            No gallery photos found for this filter. Click &ldquo;Add Gallery Photo&rdquo; to upload one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGallery.map((img, idx) => (
              <div
                key={img.id || `${img.src}-${idx}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between group"
              >
                <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                  <img
                    src={img.src}
                    alt={img.title || 'ECAS Gallery'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.opacity = '0.25';
                    }}
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#032e42]/90 text-white text-[10px] font-bold uppercase tracking-wider">
                    {img.category || 'training'}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-[#032e42] line-clamp-1">{img.title || 'Untitled Photo'}</h4>
                    <p className="text-[11px] text-[#718096] line-clamp-2 mt-1">{img.description || img.src}</p>
                  </div>
                  {canWrite && (
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditGallery(img)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F5F8FC] hover:bg-slate-200 text-[#032e42] text-[11px] font-bold cursor-pointer"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGallery(img)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Gallery Modal */}
        {galleryModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="bg-[#032e42] text-white px-5 py-4 flex items-center justify-between">
                <h3 className="text-sm font-black flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#4ade80]" />
                  {editingGalleryItem ? 'Edit Gallery Photo' : 'Add New Gallery Photo'}
                </h3>
                <button type="button" onClick={() => setGalleryModalOpen(false)} className="text-white/70 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveGallery} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#032e42] mb-1">Upload Image File (Auto-compressed)</label>
                  <label className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#008000] bg-[#F5F8FC] text-[#032e42] font-bold cursor-pointer">
                    <Upload className="w-4 h-4 text-[#008000]" />
                    <span>Choose Photo (JPG, PNG, WEBP)</span>
                    <input type="file" accept="image/*" onChange={handleGalleryFileUpload} className="hidden" />
                  </label>
                </div>
                <div>
                  <label className="block font-bold text-[#032e42] mb-1">Or Image URL / Path</label>
                  <input
                    required
                    value={galleryForm.src}
                    onChange={(e) => setGalleryForm({ ...galleryForm, src: e.target.value })}
                    placeholder="/images/Gallery/... or https://..."
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                {galleryForm.src && (
                  <div className="h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img src={galleryForm.src} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#032e42] mb-1">Category</label>
                    <select
                      value={galleryForm.category}
                      onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white"
                    >
                      {GALLERY_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#032e42] mb-1">Photo Title</label>
                    <input
                      required
                      value={galleryForm.title}
                      onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                      placeholder="e.g. Executive Training Workshop"
                      className="w-full h-9 px-3 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-[#032e42] mb-1">Caption / Description</label>
                  <textarea
                    rows={2}
                    value={galleryForm.description}
                    onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                    placeholder="Short caption describing this activity..."
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setGalleryModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700 cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#008000] hover:bg-[#006600] text-white font-bold cursor-pointer">
                    <CheckCircle2 className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save & Sync Live'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── RESOURCES MANAGER VIEW ─────────────────────────────────────────────────
  const ActiveIcon = activeResourceMeta.icon;
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-[#032e42] flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-[#008000]" /> Website Resources Manager
              </h2>
              {liveBadge}
            </div>
            <p className="text-xs text-[#718096] mt-0.5">
              Add, edit, or delete Publications, Policy Briefs, Policies &amp; Laws, Reports, Videos, and Books synced live to ecasiafrica.org/resources.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={activeResourceMeta.path}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F8FC] border border-slate-200 text-xs font-bold text-[#032e42] hover:bg-slate-100"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View {activeResourceMeta.label}
            </a>
            {canWrite && (
              <>
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm(`Reset ${activeResourceMeta.label} back to built-in default items?`)) return;
                    const res = await dataService.resetResourcesToDefaults(resourceSubTab);
                    if (res?.ok) {
                      setResourcesVersion((v) => v + 1);
                      showToast(`${activeResourceMeta.label} restored to defaults and synced.`);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#032e42] text-xs font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={openAddResource}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#008000] hover:bg-[#006600] text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add {activeResourceMeta.label.replace(/s$/, '')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* 6 Resource Sub-Tabs */}
        <div className="flex flex-wrap gap-2 pt-1">
          {RESOURCE_TABS.map((tab) => {
            const IconComp = tab.icon;
            const count = (dataService.getResourcesByType(tab.id) || []).length;
            const active = resourceSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setResourceSubTab(tab.id); setResourceSearch(''); }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  active
                    ? 'bg-[#032e42] text-white shadow-sm'
                    : 'bg-[#F5F8FC] text-slate-600 hover:bg-slate-200'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={resourceSearch}
            onChange={(e) => setResourceSearch(e.target.value)}
            placeholder={`Search ${activeResourceMeta.label.toLowerCase()} by title, tag, type, or author...`}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#008000]/20"
          />
        </div>
      </div>

      {/* Resource Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#032e42] text-white uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Resource Title</th>
                <th className="py-3 px-4">Category / Type</th>
                <th className="py-3 px-4">Date / Author</th>
                <th className="py-3 px-4">Link / File</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#718096]">
                    No items in {activeResourceMeta.label}. Click &ldquo;+ Add {activeResourceMeta.label.replace(/s$/, '')}&rdquo; to publish one.
                  </td>
                </tr>
              ) : (
                filteredResources.map((item, idx) => {
                  const docUrl = item.downloadUrl || item.url || '';
                  return (
                    <tr key={item.id || idx} className="hover:bg-[#F5F8FC]/70">
                      <td className="py-3 px-4 max-w-md">
                        <p className="font-bold text-[#032e42] line-clamp-2">{item.title}</p>
                        {Array.isArray(item.tags) && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.tags.slice(0, 4).map((t) => (
                              <span key={t} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#008000] border border-emerald-200 text-[10px] font-bold">
                          {item.type || item.issue || activeResourceMeta.defaultType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-semibold text-[#032e42]">{item.date || 'Resource'}</div>
                        <div className="text-[11px] text-[#718096]">{item.authors || item.author || item.country || 'ECAS Institute'}</div>
                      </td>
                      <td className="py-3 px-4">
                        {docUrl && docUrl !== '#' ? (
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#008000] hover:underline font-bold"
                          >
                            <ExternalLink className="w-3 h-3" /> {docUrl.startsWith('data:') ? 'Uploaded File' : 'Open Link'}
                          </a>
                        ) : (
                          <span className="text-slate-400">{item.isSensitive ? 'Restricted Access' : 'No File'}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {canWrite && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditResource(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F5F8FC] hover:bg-slate-200 text-[#032e42] text-[11px] font-bold cursor-pointer"
                              >
                                <Edit className="w-3 h-3" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteResource(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Resource Modal */}
      {resourceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-[#032e42] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-black flex items-center gap-2">
                <ActiveIcon className="w-4 h-4 text-[#4ade80]" />
                {editingResourceItem ? `Edit ${activeResourceMeta.label} Item` : `Add New ${activeResourceMeta.label} Item`}
              </h3>
              <button type="button" onClick={() => setResourceModalOpen(false)} className="text-white/70 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveResource} className="p-5 space-y-3.5 text-xs overflow-y-auto">
              <div>
                <label className="block font-bold text-[#032e42] mb-1">Title *</label>
                <input
                  required
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  placeholder="Enter full document, video, or publication title..."
                  className="w-full h-9 px-3 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#032e42] mb-1">Type / Category</label>
                  <input
                    value={resourceForm.type}
                    onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#032e42] mb-1">Year / Date</label>
                  <input
                    value={resourceForm.date}
                    onChange={(e) => setResourceForm({ ...resourceForm, date: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#032e42] mb-1">
                    {resourceSubTab === 'policies' ? 'Country / Scope' : resourceSubTab === 'policyBriefs' ? 'Issue Label' : 'Authors / Source'}
                  </label>
                  <input
                    value={
                      resourceSubTab === 'policies'
                        ? resourceForm.country
                        : resourceSubTab === 'policyBriefs'
                          ? resourceForm.issue
                          : resourceForm.authors
                    }
                    onChange={(e) => {
                      if (resourceSubTab === 'policies') setResourceForm({ ...resourceForm, country: e.target.value });
                      else if (resourceSubTab === 'policyBriefs') setResourceForm({ ...resourceForm, issue: e.target.value });
                      else setResourceForm({ ...resourceForm, authors: e.target.value });
                    }}
                    className="w-full h-9 px-3 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#032e42] mb-1">{activeResourceMeta.urlLabel}</label>
                  <input
                    value={resourceForm.downloadUrl}
                    onChange={(e) => setResourceForm({ ...resourceForm, downloadUrl: e.target.value })}
                    placeholder={resourceSubTab === 'videos' ? 'https://www.youtube.com/watch?v=...' : '/pdfs/... or https://...'}
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                {resourceSubTab !== 'videos' ? (
                  <div>
                    <label className="block font-bold text-[#032e42] mb-1">Or Upload PDF (Up to 3 MB)</label>
                    <label className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl border border-dashed border-slate-300 hover:border-[#008000] bg-[#F5F8FC] font-bold text-[#032e42] cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-[#008000]" />
                      <span>Upload PDF Document</span>
                      <input type="file" accept="application/pdf,.pdf" onChange={handleResourceDocUpload} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-[#032e42] mb-1">Cover Thumbnail URL / Upload</label>
                    <input
                      value={resourceForm.image}
                      onChange={(e) => setResourceForm({ ...resourceForm, image: e.target.value })}
                      placeholder="https://... or choose image below"
                      className="w-full h-9 px-3 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#032e42] mb-1">Tags (comma separated)</label>
                  <input
                    value={resourceForm.tags}
                    onChange={(e) => setResourceForm({ ...resourceForm, tags: e.target.value })}
                    placeholder="Climate Change, Sustainability, Kenya"
                    className="w-full h-9 px-3 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#032e42] mb-1">Optional Cover Thumbnail</label>
                  <label className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl border border-dashed border-slate-300 hover:border-[#008000] bg-[#F5F8FC] font-bold text-[#032e42] cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#008000]" />
                    <span>{resourceForm.image ? 'Cover Image Ready (Replace)' : 'Upload Cover Image'}</span>
                    <input type="file" accept="image/*" onChange={handleResourceCoverUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#032e42] mb-1">Abstract / Summary / Overview</label>
                <textarea
                  rows={3}
                  value={resourceForm.summary}
                  onChange={(e) => setResourceForm({ ...resourceForm, summary: e.target.value })}
                  placeholder="Provide a brief abstract or description shown when visitors expand this resource..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              {resourceSubTab === 'policies' && (
                <label className="flex items-center gap-2 font-bold text-[#032e42] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resourceForm.isSensitive}
                    onChange={(e) => setResourceForm({ ...resourceForm, isSensitive: e.target.checked })}
                  />
                  <span>Internal / Request-Access Document (Requires visitor request instead of direct PDF download)</span>
                </label>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setResourceModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#008000] hover:bg-[#006600] text-white font-bold cursor-pointer">
                  <CheckCircle2 className="w-4 h-4" /> {isSaving ? 'Syncing...' : 'Save & Sync Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
