import React, { useState, useEffect, useCallback } from 'react';
import { 
  Lock, LayoutDashboard, BookOpen, FileText, Image as ImageIcon, Scale, 
  Briefcase, Video, Book, FileBadge, Calendar, GraduationCap,
  Plus, Edit2, Trash2, LogOut, CheckCircle2, AlertTriangle, HelpCircle, 
  RotateCcw, Download, Copy, FileCode, Upload, ListCollapse
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { dataService } from '@/lib/dataService';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const { toast } = useToast();
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [isMfaRequired, setIsMfaRequired] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [adminUser, setAdminUser] = useState(null); // { username, role }
  const [authError, setAuthError] = useState('');
  const [lockoutTime, setLockoutTime] = useState(0);

  // 2FA Setup state
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [pendingSecret, setPendingSecret] = useState('');
  const [setupCode, setSetupCode] = useState('');

  // Admin Registration state (for Super Admins)
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Admin');

  // Active tab state
  const [activeTab, setActiveTab] = useState('dashboard');

  // Loaded data state
  const [publications, setPublications] = useState([]);
  const [reports, setReports] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [videos, setVideos] = useState([]);
  const [books, setBooks] = useState([]);
  const [briefs, setBriefs] = useState([]);
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState({});
  const [coursesLinks, setCoursesLinks] = useState([]);

  // Search filter states
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editItem, setEditItem] = useState(null); // The item being added/edited
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Special editing states for Course Links
  const [menuEditItem, setMenuEditItem] = useState(null);
  const [showMenuModal, setShowMenuModal] = useState(false);

  const loadAllData = () => {
    setPublications(dataService.getPublications());
    setReports(dataService.getReports());
    setGallery(dataService.getGalleryImages());
    setPolicies(dataService.getPolicies());
    setVacancies(dataService.getVacancies());
    setVideos(dataService.getVideos());
    setBooks(dataService.getBooks());
    setBriefs(dataService.getPolicyBriefs());
    setEvents(dataService.getEvents());
    setCourses(dataService.getCourses());
    setCoursesLinks(dataService.getCoursesLinks());
  };

  const handleLogout = useCallback(() => {
    fetch('/api/auth.php?action=logout')
      .finally(() => {
        setIsAuthenticated(false);
        setAdminUser(null);
        setIsMfaRequired(false);
        setMfaCode('');
        toast({
          title: "Logged Out",
          description: "You have been securely logged out.",
        });
      });
  }, [toast]);

  // Handle lockout countdown
  useEffect(() => {
    if (lockoutTime <= 0) return;
    const timer = setInterval(() => {
      setLockoutTime(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTime]);

  // Check auth on load
  useEffect(() => {
    fetch('/api/auth.php?action=status')
      .then(res => {
        if (!res.ok) throw new Error("Unauthenticated");
        return res.json();
      })
      .then(data => {
        if (data.status === 'authenticated') {
          setIsAuthenticated(true);
          setAdminUser({ username: data.username, role: data.role, two_factor_enabled: data.two_factor_enabled });
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  // Fetch all data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  // Inactivity timeout: 15 minutes
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
        toast({
          title: "Session Expired",
          description: "Logged out automatically due to 15 minutes of inactivity.",
          variant: "destructive"
        });
      }, 15 * 60 * 1000); // 15 minutes
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(eventName => {
      window.addEventListener(eventName, resetTimer);
    });

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach(eventName => {
        window.removeEventListener(eventName, resetTimer);
      });
    };
  }, [isAuthenticated, handleLogout, toast]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (lockoutTime > 0) return;
    setAuthError('');

    fetch('/api/auth.php?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, captcha_token: captchaToken })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || `Error ${res.status}`);
        }
        return data;
      })
      .then(data => {
        if (data.status === '2fa_required') {
          setIsMfaRequired(true);
          setAuthError('');
          toast({
            title: "MFA Required",
            description: "Please enter your 2FA verification code.",
          });
        } else if (data.status === 'authenticated') {
          setIsAuthenticated(true);
          setAdminUser({ username: data.username, role: data.role, two_factor_enabled: data.two_factor_enabled });
          setAuthError('');
          setPassword('');
          toast({
            title: "Access Granted",
            description: `Welcome back, ${data.username}.`,
          });
        }
      })
      .catch(err => {
        setAuthError(err.message);
        if (err.message.includes('Locked out') || err.message.includes('429')) {
          setLockoutTime(900); // 15 minutes lockout
        }
      });
  };

  const handle2FAVerify = (e) => {
    e.preventDefault();
    setAuthError('');

    fetch('/api/auth.php?action=verify_2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: mfaCode })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'MFA validation failed');
        return data;
      })
      .then(data => {
        setIsAuthenticated(true);
        setAdminUser({ username: data.username, role: data.role, two_factor_enabled: data.two_factor_enabled });
        setIsMfaRequired(false);
        setMfaCode('');
        setPassword('');
        toast({
          title: "Access Granted",
          description: `Logged in securely with 2FA as ${data.username}.`,
        });
      })
      .catch(err => {
        setAuthError(err.message);
      });
  };

  const start2FASetup = () => {
    fetch('/api/auth.php?action=setup_2fa')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setPendingSecret(data.secret);
          // Use standard qrserver API to render a secure TOTP setup QR code
          setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.otpauth_url)}`);
          setIsSettingUp2FA(true);
        } else {
          toast({
            title: "Setup Failed",
            description: data.message || "Failed to initialize 2FA.",
            variant: "destructive"
          });
        }
      })
      .catch(() => {
        toast({
          title: "Setup Error",
          description: "Could not connect to authentication API.",
          variant: "destructive"
        });
      });
  };

  const confirm2FASetup = (e) => {
    e.preventDefault();
    fetch('/api/auth.php?action=confirm_2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: setupCode })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setAdminUser(prev => ({ ...prev, two_factor_enabled: true }));
          setIsSettingUp2FA(false);
          setSetupCode('');
          toast({
            title: "2FA Enabled",
            description: "Two-Factor Authentication has been successfully enabled on your account.",
          });
        } else {
          toast({
            title: "Verification Failed",
            description: data.message || "Incorrect code entered.",
            variant: "destructive"
          });
        }
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Could not verify code.",
          variant: "destructive"
        });
      });
  };

  const handleRegisterAdmin = (e) => {
    e.preventDefault();
    fetch('/api/auth.php?action=register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: regUsername, password: regPassword, role: regRole })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          toast({
            title: "Account Registered",
            description: `Successfully registered new ${regRole} account for ${regUsername}.`,
          });
          setRegUsername('');
          setRegPassword('');
        } else {
          toast({
            title: "Registration Failed",
            description: data.message || "Error creating account.",
            variant: "destructive"
          });
        }
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Network communication failure.",
          variant: "destructive"
        });
      });
  };

  // Reset to default
  const handleResetDefaults = () => {
    if (window.confirm("Are you sure you want to reset ALL database contents to their original defaults? This will erase all database changes!")) {
      dataService.resetAllData()
        .then(() => {
          loadAllData();
          toast({
            title: "Database Reset Complete",
            description: "All database resources have been restored to original file defaults.",
          });
        })
        .catch(() => {
          toast({
            title: "Reset Failed",
            description: "Error resetting content.",
            variant: "destructive"
          });
        });
    }
  };


  // Save changes wrapper
  const saveCategoryData = (category, data) => {
    switch (category) {
      case 'publications':
        dataService.savePublications(data);
        setPublications(data);
        break;
      case 'reports':
        dataService.saveReports(data);
        setReports(data);
        break;
      case 'gallery':
        dataService.saveGalleryImages(data);
        setGallery(data);
        break;
      case 'policies':
        dataService.savePolicies(data);
        setPolicies(data);
        break;
      case 'vacancies':
        dataService.saveVacancies(data);
        setVacancies(data);
        break;
      case 'videos':
        dataService.saveVideos(data);
        setVideos(data);
        break;
      case 'books':
        dataService.saveBooks(data);
        setBooks(data);
        break;
      case 'briefs':
        dataService.savePolicyBriefs(data);
        setBriefs(data);
        break;
      case 'events':
        dataService.saveEvents(data);
        setEvents(data);
        break;
      case 'courses':
        dataService.saveCourses(data);
        setCourses(data);
        break;
      case 'courses_links':
        dataService.saveCoursesLinks(data);
        setCoursesLinks(data);
        break;
      default:
        break;
    }
  };

  // Generic File Upload Handler
  const handleFileUpload = (e, fieldName, type = 'image') => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (max 8MB for images, 15MB for documents/videos)
    const limit = type === 'image' ? 8 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size > limit) {
      alert(`File is too large. Maximum size is ${type === 'image' ? '8MB' : '15MB'}.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      handleFieldChange(fieldName, uploadEvent.target.result);
      toast({
        title: "File Loaded",
        description: `${file.name} successfully embedded in dynamic content.`,
      });
    };
    reader.readAsDataURL(file);
  };

  // Open Add Form
  const openAddModal = () => {
    let defaultFields = {};
    switch (activeTab) {
      case 'publications':
        defaultFields = { id: `pub-${Date.now()}`, title: '', type: 'Policy Document', image: '', pages: 'PDF Document', date: new Date().getFullYear().toString(), authors: 'ECAS Institute', abstract: '', tags: [], downloadUrl: '' };
        break;
      case 'reports':
        defaultFields = { id: `rep-${Date.now()}`, title: '', type: 'Project Report', image: '', pages: 'PDF Document', date: new Date().getFullYear().toString(), authors: 'ECAS Institute', summary: '', tags: [], downloadUrl: '' };
        break;
      case 'gallery':
        defaultFields = { id: `gal-${Date.now()}`, src: '', category: 'events', title: '', description: '' };
        break;
      case 'policies':
        defaultFields = { id: `pol-${Date.now()}`, title: '', type: 'Governance', country: 'ECAS Institute', pages: 'Internal', tags: [], summary: '', url: '', isSensitive: false };
        break;
      case 'vacancies':
        defaultFields = { id: `vac-${Date.now()}`, title: '', type: 'Full-time', location: 'Nairobi, Kenya', description: '', deadline: '' };
        break;
      case 'videos':
        defaultFields = { id: `vid-${Date.now()}`, image: '', title: '', type: 'Webinar', date: '', url: '' };
        break;
      case 'books':
        defaultFields = { id: `book-${Date.now()}`, image: '', title: '', author: '', downloadUrl: '' };
        break;
      case 'briefs':
        defaultFields = { id: `brief-${Date.now()}`, title: '', summary: '', date: '', tags: [], downloadUrl: '' };
        break;
      case 'events':
        defaultFields = { id: `evt-${Date.now()}`, title: '', date: '', venue: '', type: 'Workshop', desc: '' };
        break;
      default:
        return;
    }
    setEditItem({ isNew: true, fields: defaultFields });
    setShowModal(true);
  };

  // Open Edit Form
  const openEditModal = (item) => {
    let fields = { ...item };
    if (fields.tags && Array.isArray(fields.tags)) {
      fields.tagString = fields.tags.join(', ');
    } else {
      fields.tagString = '';
    }
    setEditItem({ isNew: false, fields });
    setShowModal(true);
  };

  // Handle Form Change
  const handleFieldChange = (key, value) => {
    setEditItem(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [key]: value
      }
    }));
  };

  // Submit Add/Edit Form
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const fields = { ...editItem.fields };

    // Post-process tags if needed
    if (fields.tagString !== undefined) {
      fields.tags = fields.tagString.split(',').map(t => t.trim()).filter(t => t.length > 0);
      delete fields.tagString;
    }

    if (activeTab === 'courses') {
      const updatedCourses = { ...courses };
      updatedCourses[fields.slug].content = fields.content;
      saveCategoryData('courses', updatedCourses);
    } else {
      let list = [];
      switch (activeTab) {
        case 'publications': list = [...publications]; break;
        case 'reports': list = [...reports]; break;
        case 'gallery': list = [...gallery]; break;
        case 'policies': list = [...policies]; break;
        case 'vacancies': list = [...vacancies]; break;
        case 'videos': list = [...videos]; break;
        case 'books': list = [...books]; break;
        case 'briefs': list = [...briefs]; break;
        case 'events': list = [...events]; break;
        default: return;
      }

      if (editItem.isNew) {
        list.unshift(fields);
      } else {
        const index = list.findIndex(item => (activeTab === 'events' ? item.title === fields.title : item.id === fields.id));
        if (index > -1) {
          list[index] = fields;
        }
      }

      saveCategoryData(activeTab, list);
    }

    setShowModal(false);
    setEditItem(null);
    toast({
      title: editItem.isNew ? "Created Successfully" : "Updated Successfully",
      description: `Saved to local data storage.`,
    });
  };

  // Confirm delete
  const handleDeleteItem = (item) => {
    setDeleteConfirmItem(item);
  };

  // Execute delete
  const executeDelete = () => {
    if (!deleteConfirmItem) return;

    if (activeTab === 'courses') {
      const updatedCourses = { ...courses };
      delete updatedCourses[deleteConfirmItem.slug];
      saveCategoryData('courses', updatedCourses);
    } else {
      let list = [];
      switch (activeTab) {
        case 'publications': list = [...publications]; break;
        case 'reports': list = [...reports]; break;
        case 'gallery': list = [...gallery]; break;
        case 'policies': list = [...policies]; break;
        case 'vacancies': list = [...vacancies]; break;
        case 'videos': list = [...videos]; break;
        case 'books': list = [...books]; break;
        case 'briefs': list = [...briefs]; break;
        case 'events': list = [...events]; break;
        default: return;
      }

      const filtered = list.filter(item => (activeTab === 'events' ? item.title !== deleteConfirmItem.title : item.id !== deleteConfirmItem.id));
      saveCategoryData(activeTab, filtered);
    }

    setDeleteConfirmItem(null);
    toast({
      title: "Deleted Successfully",
      description: `Removed from local storage.`,
    });
  };

  // ─── Course Navigation Menu Management Helpers ─────────────────────────────
  
  const openAddMenuModal = (parentCategory = null) => {
    setMenuEditItem({
      isNew: true,
      label: '',
      path: '',
      isCategory: parentCategory ? false : true,
      id: '',
      parentCategory: parentCategory ? parentCategory.id : 'none'
    });
    setShowMenuModal(true);
  };

  const openEditMenuModal = (item, parentCategory = null) => {
    setMenuEditItem({
      isNew: false,
      originalLabel: item.label,
      label: item.label,
      path: item.path,
      isCategory: item.id ? true : false,
      id: item.id || '',
      parentCategory: parentCategory ? parentCategory.id : 'none'
    });
    setShowMenuModal(true);
  };

  const handleMenuSubmit = (e) => {
    e.preventDefault();
    let updatedMenu = [...coursesLinks];

    if (menuEditItem.isNew) {
      if (menuEditItem.isCategory) {
        // Add new category
        if (!menuEditItem.id) {
          menuEditItem.id = menuEditItem.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        }
        updatedMenu.push({
          label: menuEditItem.label,
          path: menuEditItem.path || `/executive-training/${menuEditItem.id}`,
          id: menuEditItem.id,
          children: []
        });
      } else {
        // Add child link to a category
        const parent = updatedMenu.find(m => m.id === menuEditItem.parentCategory);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push({
            label: menuEditItem.label,
            path: menuEditItem.path
          });
        } else {
          // Add as direct root item without children
          updatedMenu.push({
            label: menuEditItem.label,
            path: menuEditItem.path
          });
        }
      }
    } else {
      // Editing existing
      if (menuEditItem.isCategory) {
        const item = updatedMenu.find(m => m.id === menuEditItem.id);
        if (item) {
          item.label = menuEditItem.label;
          item.path = menuEditItem.path;
        }
      } else {
        // Child link update
        // 1. Remove from original parent
        updatedMenu = updatedMenu.map(m => {
          if (m.children) {
            const filteredChildren = m.children.filter(c => c.label !== menuEditItem.originalLabel);
            if (filteredChildren.length !== m.children.length) {
              return { ...m, children: filteredChildren };
            }
          }
          return m;
        });

        // 2. Add to new target parent (or root if parentCategory is 'none')
        if (menuEditItem.parentCategory !== 'none') {
          updatedMenu = updatedMenu.map(m => {
            if (m.id === menuEditItem.parentCategory) {
              const children = m.children ? [...m.children] : [];
              children.push({ label: menuEditItem.label, path: menuEditItem.path });
              return { ...m, children };
            }
            return m;
          });
        } else {
          // Put on root
          updatedMenu.push({ label: menuEditItem.label, path: menuEditItem.path });
        }
      }
    }

    saveCategoryData('courses_links', updatedMenu);
    setShowMenuModal(false);
    setMenuEditItem(null);
    toast({
      title: "Navigation Updated",
      description: "Dropdown courses list successfully adjusted.",
    });
  };

  const deleteMenuLink = (label, parentId = null) => {
    if (!window.confirm(`Are you sure you want to remove link "${label}" from menu?`)) return;
    
    let updatedMenu = [...coursesLinks];
    if (parentId) {
      updatedMenu = updatedMenu.map(m => {
        if (m.id === parentId && m.children) {
          return { ...m, children: m.children.filter(c => c.label !== label) };
        }
        return m;
      });
    } else {
      updatedMenu = updatedMenu.filter(m => m.label !== label);
    }
    saveCategoryData('courses_links', updatedMenu);
    toast({
      title: "Menu Item Removed",
      description: "The item has been deleted from navigation dropdown.",
    });
  };

  // Copy code utility
  const copyToClipboard = (text, category) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${category} data copied to clipboard.`,
    });
  };

  // Download json utility
  const downloadJSONFile = (filename, content) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helpers to render stats cards
  const getTabIcon = (tab, size = 18) => {
    switch (tab) {
      case 'dashboard': return <LayoutDashboard size={size} />;
      case 'publications': return <BookOpen size={size} />;
      case 'reports': return <FileText size={size} />;
      case 'gallery': return <ImageIcon size={size} />;
      case 'policies': return <Scale size={size} />;
      case 'vacancies': return <Briefcase size={size} />;
      case 'videos': return <Video size={size} />;
      case 'books': return <Book size={size} />;
      case 'briefs': return <FileBadge size={size} />;
      case 'events': return <Calendar size={size} />;
      case 'courses': return <GraduationCap size={size} />;
      case 'courses_links': return <ListCollapse size={size} />;
      default: return <HelpCircle size={size} />;
    }
  };

  // Pre-process items for viewing in tabs
  const getFilteredItems = () => {
    let items = [];
    switch (activeTab) {
      case 'publications': items = publications; break;
      case 'reports': items = reports; break;
      case 'gallery': items = gallery; break;
      case 'policies': items = policies; break;
      case 'vacancies': items = vacancies; break;
      case 'videos': items = videos; break;
      case 'books': items = books; break;
      case 'briefs': items = briefs; break;
      case 'events': items = events; break;
      case 'courses': items = Object.values(courses); break;
      default: return [];
    }

    if (!searchQuery) return items;

    return items.filter(item => {
      const title = item.title || item.slug || '';
      const author = item.authors || item.author || '';
      const summary = item.abstract || item.summary || item.desc || item.description || '';
      return title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             author.toLowerCase().includes(searchQuery.toLowerCase()) ||
             summary.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
        <SEO title="Admin Login | ECASI Africa" description="Administrator Login Portal" />
        <Header />
        <div className="flex-grow flex items-center justify-center py-24 px-4 bg-slate-950/80">
          <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-md text-center">
            <div className="w-16 h-16 bg-ecasi-green/20 text-ecasi-green border border-ecasi-green/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock size={32} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">Admin Login</h1>
            <p className="text-slate-400 text-sm mb-8">Access restricted to ECAS Institute administrators.</p>
            
            {isMfaRequired ? (
              <form onSubmit={handle2FAVerify} className="space-y-5 text-left">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Two-Factor Authentication Code</label>
                  <input 
                    type="text" 
                    value={mfaCode}
                    onChange={e => setMfaCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 tracking-widest text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-ecasi-green focus:border-transparent transition-all"
                    required
                  />
                  <p className="text-slate-500 text-xs mt-2 text-center">Open your Authenticator app (e.g. Google Authenticator) to get the code.</p>
                </div>
                
                {authError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 border border-red-900/50 p-3 rounded-xl">
                    <AlertTriangle size={16} />
                    <span>{authError}</span>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => { setIsMfaRequired(false); setAuthError(''); }}
                    className="flex-1 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold py-3 rounded-xl transition-all border border-slate-800"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-ecasi-green hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg"
                  >
                    Verify
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-5 text-left">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Username</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="username"
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-ecasi-green focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={lockoutTime > 0}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-ecasi-green focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={lockoutTime > 0}
                  />
                </div>
                
                {authError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 border border-red-900/50 p-3 rounded-xl">
                    <AlertTriangle size={16} />
                    <span>{authError}</span>
                  </div>
                )}
                
                <button 
                  type="submit" 
                  disabled={lockoutTime > 0}
                  className="w-full bg-ecasi-green hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-ecasi-green/10 flex items-center justify-center gap-2"
                >
                  {lockoutTime > 0 ? `Locked Out (${Math.ceil(lockoutTime / 60)}m)` : 'Access Portal'}
                </button>
              </form>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      <SEO title="Admin Control Dashboard | ECASI Africa" description="Admin Dashboard for Website Resource updates" />
      <Header />

      <section className="bg-slate-950/80 pt-24 pb-8 border-b border-slate-800">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-ecasi-green/20 border border-ecasi-green/30 text-ecasi-green rounded-2xl">
              <LayoutDashboard size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">Admin Portal</h1>
              <p className="text-slate-400 text-sm">Update and manage website resources, media, and listings.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleResetDefaults}
              className="px-4 py-2 border border-slate-700 hover:border-slate-600 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
              title="Reset all dynamic edits and restore default files"
            >
              <RotateCcw size={16} />
              Reset to Defaults
            </button>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </section>

      <section className="py-8 flex-grow">
        <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="space-y-2 lg:col-span-1">
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80 space-y-1">
              <span className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-3 px-3">Overview</span>
              
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-ecasi-green text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>

              <span className="block text-slate-500 text-xs font-bold uppercase tracking-wider mt-5 mb-3 px-3">Resources Menu</span>
              
              {[
                { id: 'gallery', label: 'Gallery Photos' },
                { id: 'publications', label: 'Publications' },
                { id: 'policies', label: 'Policies & Laws' },
                { id: 'reports', label: 'Reports' },
                { id: 'vacancies', label: 'Vacancies' },
                { id: 'videos', label: 'Videos' },
                { id: 'books', label: 'Books' },
                { id: 'briefs', label: 'Policy Briefs' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-ecasi-green/20 text-ecasi-green border-l-4 border-ecasi-green' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                >
                  {getTabIcon(tab.id, 16)}
                  {tab.label}
                </button>
              ))}

              <span className="block text-slate-500 text-xs font-bold uppercase tracking-wider mt-5 mb-3 px-3">General Content</span>

              {[
                { id: 'events', label: 'Upcoming Events' },
                { id: 'courses', label: 'Trainings / Courses' },
                { id: 'courses_links', label: 'Course Dropdown Menu' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-ecasi-green/20 text-ecasi-green border-l-4 border-ecasi-green' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
                >
                  {getTabIcon(tab.id, 16)}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Dashboard Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {activeTab === 'dashboard' ? (
              <div className="space-y-6">
                
                {/* Intro message */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-slate-950/20 border border-slate-850 p-6 rounded-3xl flex items-start gap-4">
                    <div className="p-3 bg-ecasi-green/10 text-ecasi-green rounded-xl shrink-0">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">Secure Admin Database Connected</h2>
                      <p className="text-slate-400 text-sm leading-relaxed mb-2">
                        You are logged in as <strong className="text-white">{adminUser?.username}</strong> ({adminUser?.role}). Administrative actions on this portal are fully audited and logged securely.
                      </p>
                      <span className="inline-block text-[11px] text-slate-500">
                        IP Address: Logged | HTTPS: Enforced
                      </span>
                    </div>
                  </div>
                </div>

                {/* Super Admin - Account Registration Panel */}
                {adminUser?.role === 'Super Admin' && (
                  <div className="bg-slate-950/20 border border-slate-850 p-6 rounded-3xl">
                    <h2 className="text-lg font-bold text-white mb-1">Create New Admin Account</h2>
                    <p className="text-slate-500 text-xs mb-4">Register new administrative users. This section is restricted to Super Admins only.</p>
                    
                    <form onSubmit={handleRegisterAdmin} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="block text-slate-400 text-xs font-semibold mb-1">Username</label>
                        <input 
                          type="text" 
                          value={regUsername} 
                          onChange={e => setRegUsername(e.target.value)} 
                          placeholder="new_admin" 
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs font-semibold mb-1">Password</label>
                        <input 
                          type="password" 
                          value={regPassword} 
                          onChange={e => setRegPassword(e.target.value)} 
                          placeholder="••••••••" 
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs font-semibold mb-1">Access Role</label>
                        <select 
                          value={regRole} 
                          onChange={e => setRegRole(e.target.value)} 
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                        >
                          <option value="Admin">Standard Admin</option>
                          <option value="Super Admin">Super Admin</option>
                        </select>
                      </div>
                      <button 
                        type="submit" 
                        className="py-2.5 bg-ecasi-green hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow"
                      >
                        Register Admin
                      </button>
                    </form>
                  </div>
                )}


                {/* Counts Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[
                    { id: 'publications', label: 'Publications', count: publications.length, color: 'text-emerald-400' },
                    { id: 'reports', label: 'Reports', count: reports.length, color: 'text-blue-400' },
                    { id: 'gallery', label: 'Gallery Photos', count: gallery.length, color: 'text-amber-400' },
                    { id: 'policies', label: 'Policies', count: policies.length, color: 'text-purple-400' },
                    { id: 'vacancies', label: 'Vacancies', count: vacancies.length, color: 'text-red-400' },
                    { id: 'videos', label: 'Videos', count: videos.length, color: 'text-indigo-400' },
                    { id: 'books', label: 'Books', count: books.length, color: 'text-cyan-400' },
                    { id: 'briefs', label: 'Policy Briefs', count: briefs.length, color: 'text-teal-400' },
                    { id: 'events', label: 'Events', count: events.length, color: 'text-pink-400' },
                    { id: 'courses', label: 'Courses Content', count: Object.keys(courses).length, color: 'text-yellow-400' },
                    { id: 'courses_links', label: 'Navigation Links', count: coursesLinks.length, color: 'text-rose-400' }
                  ].map(stat => (
                    <button 
                      key={stat.id}
                      onClick={() => setActiveTab(stat.id)}
                      className="bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/80 p-5 rounded-2xl text-left transition-all group shrink-0"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className={`p-2 bg-slate-900 group-hover:bg-slate-800 rounded-xl ${stat.color} transition-all`}>
                          {getTabIcon(stat.id, 16)}
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">{stat.count}</span>
                      </div>
                      <span className="block text-sm font-semibold text-slate-300">{stat.label}</span>
                      <span className="block text-slate-500 text-xs mt-1">Manage &rarr;</span>
                    </button>
                  ))}
                </div>

                {/* Deployment Exports Section */}
                <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800/80">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-slate-900 text-ecasi-green rounded-xl">
                      <FileCode size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Deployment Export Center</h2>
                      <p className="text-slate-500 text-xs">Copy or download JSON data structures to apply your local edits permanently to the code files.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'publications', filename: 'publicationsData.json', data: JSON.stringify(publications, null, 2) },
                      { key: 'reports', filename: 'reportsData.json', data: JSON.stringify(reports, null, 2) },
                      { key: 'gallery', filename: 'galleryData.json', data: JSON.stringify(gallery, null, 2) },
                      { key: 'policies', filename: 'policiesData.json', data: JSON.stringify(policies, null, 2) },
                      { key: 'vacancies', filename: 'vacanciesData.json', data: JSON.stringify(vacancies, null, 2) },
                      { key: 'videos', filename: 'videosData.json', data: JSON.stringify(videos, null, 2) },
                      { key: 'books', filename: 'booksData.json', data: JSON.stringify(books, null, 2) },
                      { key: 'briefs', filename: 'policyBriefsData.json', data: JSON.stringify(briefs, null, 2) },
                      { key: 'events', filename: 'eventsData.js', data: `export const eventsData = ${JSON.stringify(events, null, 2)};` },
                      { key: 'courses', filename: 'coursesData.json', data: JSON.stringify(courses, null, 2) },
                      { key: 'courses_links', filename: 'coursesLinks.json', data: JSON.stringify(coursesLinks, null, 2) }
                    ].map(exp => (
                      <div key={exp.key} className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl flex items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-300">{exp.filename}</span>
                          <span className="text-slate-600 text-xs">({exp.key === 'events' ? 'JS Module' : 'JSON Raw'})</span>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button 
                            onClick={() => copyToClipboard(exp.data, exp.filename)}
                            className="p-2 hover:bg-slate-900 border border-slate-800 text-slate-300 rounded-lg hover:text-white flex items-center gap-1.5 text-xs transition-colors"
                          >
                            <Copy size={13} />
                            Copy
                          </button>
                          <button 
                            onClick={() => downloadJSONFile(exp.filename, exp.data)}
                            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg hover:text-white flex items-center gap-1.5 text-xs transition-colors"
                          >
                            <Download size={13} />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : activeTab === 'courses_links' ? (
              
              // Course Menu Category/Link manager
              <div className="bg-slate-950/40 rounded-3xl border border-slate-800/80 overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-slate-900 text-ecasi-green rounded-xl">
                      <ListCollapse size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Course Dropdown Menu Manager</h2>
                      <p className="text-slate-500 text-xs">Add new categories or links to organize the &quot;Executive Training&quot; header menu.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={() => openAddMenuModal(null)}
                      className="px-4 py-2 bg-ecasi-green hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Plus size={16} />
                      Add Main Category
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {coursesLinks.map((menuItem, idx) => {
                    const isCat = menuItem.id ? true : false;
                    return (
                      <div key={idx} className="bg-slate-900/60 rounded-2xl border border-slate-850 p-5 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-850/50 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">{menuItem.label}</span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400">
                              {isCat ? 'Category Dropdown' : 'Direct Link'}
                            </span>
                            <span className="text-slate-500 text-xs font-mono">{menuItem.path}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isCat && (
                              <button 
                                onClick={() => openAddMenuModal(menuItem)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                              >
                                <Plus size={12} />
                                Add Sub-Link
                              </button>
                            )}
                            <button 
                              onClick={() => openEditMenuModal(menuItem, null)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                              title="Edit Category Name/Path"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button 
                              onClick={() => deleteMenuLink(menuItem.label, null)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Render Sub links */}
                        {isCat && (
                          <div className="pl-6 space-y-2">
                            {menuItem.children && menuItem.children.length === 0 ? (
                              <div className="text-slate-650 text-xs italic py-2">No nested course links added yet.</div>
                            ) : (
                              menuItem.children && menuItem.children.map((child, cIdx) => (
                                <div key={cIdx} className="bg-slate-950/30 px-4 py-2.5 rounded-xl flex items-center justify-between text-sm hover:bg-slate-950/50 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-300">{child.label}</span>
                                    <span className="text-slate-600 text-xs font-mono">{child.path}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button 
                                      onClick={() => openEditMenuModal(child, menuItem)}
                                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                                      title="Edit Child Link"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button 
                                      onClick={() => deleteMenuLink(child.label, menuItem.id)}
                                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded transition-colors"
                                      title="Remove Child Link"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>

            ) : (
              
              // Resource List & Manager View
              <div className="bg-slate-950/40 rounded-3xl border border-slate-800/80 overflow-hidden">
                
                {/* Header Actions */}
                <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-slate-900 text-ecasi-green rounded-xl">
                      {getTabIcon(activeTab, 20)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold capitalize">{activeTab.replace('_', ' ')} Manager</h2>
                      <p className="text-slate-500 text-xs">Add, edit, or delete items in this listing.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <input 
                      type="text" 
                      placeholder="Search listings..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-ecasi-green focus:border-transparent transition-all w-full md:max-w-xs"
                    />
                    
                    {/* HIDE ADD BUTTON FOR STATIC COURSES */}
                    {activeTab !== 'courses' && (
                      <button 
                        onClick={openAddModal}
                        className="px-4 py-2 bg-ecasi-green hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all shrink-0"
                      >
                        <Plus size={16} />
                        Add New
                      </button>
                    )}
                  </div>
                </div>

                {/* Table list */}
                <div className="overflow-x-auto">
                  {getFilteredItems().length === 0 ? (
                    <div className="py-16 text-center text-slate-500">
                      <p className="text-lg">No items found in this section.</p>
                      {activeTab !== 'courses' && (
                        <button onClick={openAddModal} className="mt-2 text-ecasi-green hover:underline text-sm font-medium">Create the first item</button>
                      )}
                    </div>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-850 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-4">Title / Primary Detail</th>
                          <th className="px-6 py-4">Category / Type</th>
                          {activeTab !== 'courses' && activeTab !== 'gallery' && (
                            <th className="px-6 py-4">Authors / Date</th>
                          )}
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/50">
                        {getFilteredItems().map((item, index) => {
                          const title = item.title || item.slug || '';
                          const subText = item.authors || item.author || item.venue || '';
                          const tag = item.type || item.category || (item.isPast ? 'Past Event' : 'Upcoming');
                          const date = item.date || item.deadline || '';

                          return (
                            <tr key={index} className="hover:bg-slate-900/20 transition-colors">
                              <td className="px-6 py-4 max-w-md">
                                <div className="font-bold text-white leading-snug line-clamp-1">{title}</div>
                                {subText && <div className="text-slate-500 text-xs mt-1 line-clamp-1">{subText}</div>}
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-ecasi-green">
                                  {tag}
                                </span>
                              </td>
                              {activeTab !== 'courses' && activeTab !== 'gallery' && (
                                <td className="px-6 py-4 text-slate-400 text-xs">
                                  <div>{date || 'N/A'}</div>
                                </td>
                              )}
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => openEditModal(item)}
                                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                                    title="Edit item"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  {activeTab !== 'courses' && (
                                    <button 
                                      onClick={() => handleDeleteItem(item)}
                                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                      title="Delete item"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      </section>

      {/* Editor Modal */}
      {showModal && editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-scale-in">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editItem.isNew ? 'Create New' : 'Edit'} {activeTab.slice(0, -1)}
              </h3>
              <button 
                onClick={() => { setShowModal(false); setEditItem(null); }}
                className="p-1 hover:bg-slate-800 text-slate-500 hover:text-white rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
              
              {/* Publications & Reports Editor Fields */}
              {(activeTab === 'publications' || activeTab === 'reports') && (
                <>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Title</label>
                    <input 
                      type="text" 
                      value={editItem.fields.title}
                      onChange={e => handleFieldChange('title', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1">Type</label>
                      <input 
                        type="text" 
                        value={editItem.fields.type}
                        onChange={e => handleFieldChange('type', e.target.value)}
                        placeholder="e.g. Policy Document"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1">Date / Year</label>
                      <input 
                        type="text" 
                        value={editItem.fields.date}
                        onChange={e => handleFieldChange('date', e.target.value)}
                        placeholder="e.g. 2026 or Resource"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1">Authors</label>
                      <input 
                        type="text" 
                        value={editItem.fields.authors}
                        onChange={e => handleFieldChange('authors', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1">Pages count/info</label>
                      <input 
                        type="text" 
                        value={editItem.fields.pages}
                        onChange={e => handleFieldChange('pages', e.target.value)}
                        placeholder="e.g. PDF Document or 12 Pages"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      />
                    </div>
                  </div>

                  {/* Cover Image Upload (PNG, JPG, JPEG) */}
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 space-y-3">
                    <label className="block text-slate-300 text-xs font-semibold">Cover Image (Supported: PNG, JPG, JPEG • max 8MB)</label>
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      {editItem.fields.image && (
                        <img src={editItem.fields.image} alt="Preview" className="w-16 h-20 object-cover rounded border border-slate-800 bg-slate-900 shrink-0" />
                      )}
                      <div className="flex-grow w-full space-y-2">
                        <input 
                          type="text" 
                          value={editItem.fields.image}
                          onChange={e => handleFieldChange('image', e.target.value)}
                          placeholder="Image URL or upload below..."
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                        />
                        <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-dashed border-slate-800 text-slate-400 text-xs">
                          <Upload size={14} className="text-slate-500" />
                          <span>Upload Image File:</span>
                          <input 
                            type="file" 
                            accept=".png,.jpg,.jpeg"
                            onChange={e => handleFileUpload(e, 'image', 'image')}
                            className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document/PDF Upload OR URL Link */}
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 space-y-3">
                    <label className="block text-slate-300 text-xs font-semibold">Document File (Direct URL Link OR PDF Upload)</label>
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        value={editItem.fields.downloadUrl}
                        onChange={e => handleFieldChange('downloadUrl', e.target.value)}
                        placeholder="Link / URL to the PDF Document..."
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      />
                      <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-dashed border-slate-800 text-slate-400 text-xs">
                        <Upload size={14} className="text-slate-500" />
                        <span>Or upload local PDF file:</span>
                        <input 
                          type="file" 
                          accept=".pdf"
                          onChange={e => handleFileUpload(e, 'downloadUrl', 'document')}
                          className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Tags (Comma-separated)</label>
                    <input 
                      type="text" 
                      value={editItem.fields.tagString}
                      onChange={e => handleFieldChange('tagString', e.target.value)}
                      placeholder="e.g. Climate, Sustainability, Food"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">{activeTab === 'publications' ? 'Abstract' : 'Summary'}</label>
                    <textarea 
                      rows={4}
                      value={activeTab === 'publications' ? editItem.fields.abstract : editItem.fields.summary}
                      onChange={e => handleFieldChange(activeTab === 'publications' ? 'abstract' : 'summary', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                    />
                  </div>
                </>
              )}

              {/* Gallery Editor Fields */}
              {activeTab === 'gallery' && (
                <>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Title</label>
                    <input 
                      type="text" 
                      value={editItem.fields.title}
                      onChange={e => handleFieldChange('title', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Category</label>
                    <select 
                      value={editItem.fields.category}
                      onChange={e => handleFieldChange('category', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                    >
                      <option value="events">Events & Conferences</option>
                      <option value="fieldwork">Field Work</option>
                      <option value="training">Training Programs</option>
                      <option value="community">Community Engagement</option>
                    </select>
                  </div>

                  {/* Photo upload (PNG, JPG, JPEG) */}
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 space-y-3">
                    <label className="block text-slate-300 text-xs font-semibold">Gallery Image File (Supported: PNG, JPG, JPEG • max 8MB)</label>
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      {editItem.fields.src && (
                        <img src={editItem.fields.src} alt="Preview" className="w-20 h-16 object-cover rounded border border-slate-800 bg-slate-900 shrink-0" />
                      )}
                      <div className="flex-grow w-full space-y-2">
                        <input 
                          type="text" 
                          value={editItem.fields.src}
                          onChange={e => handleFieldChange('src', e.target.value)}
                          placeholder="Image URL or upload below..."
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                          required
                        />
                        <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-dashed border-slate-800 text-slate-400 text-xs">
                          <Upload size={14} className="text-slate-500" />
                          <span>Upload Photo:</span>
                          <input 
                            type="file" 
                            accept=".png,.jpg,.jpeg"
                            onChange={e => handleFileUpload(e, 'src', 'image')}
                            className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Description</label>
                    <textarea 
                      rows={3}
                      value={editItem.fields.description}
                      onChange={e => handleFieldChange('description', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                    />
                  </div>
                </>
              )}

              {/* Policies laws editor */}
              {activeTab === 'policies' && (
                <>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Title</label>
                    <input 
                      type="text" 
                      value={editItem.fields.title}
                      onChange={e => handleFieldChange('title', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1">Type</label>
                      <input 
                        type="text" 
                        value={editItem.fields.type}
                        onChange={e => handleFieldChange('type', e.target.value)}
                        placeholder="e.g. Governance, ethics"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1">Country / Institution</label>
                      <input 
                        type="text" 
                        value={editItem.fields.country}
                        onChange={e => handleFieldChange('country', e.target.value)}
                        placeholder="e.g. Kenya or ECAS Institute"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1">Date</label>
                      <input 
                        type="text" 
                        value={editItem.fields.date}
                        onChange={e => handleFieldChange('date', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1">Pages info</label>
                      <input 
                        type="text" 
                        value={editItem.fields.pages}
                        onChange={e => handleFieldChange('pages', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      />
                    </div>
                  </div>

                  {/* Policy PDF document upload OR Link */}
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 space-y-3">
                    <label className="block text-slate-300 text-xs font-semibold">Document File (Direct URL Link OR PDF Upload)</label>
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        value={editItem.fields.url}
                        onChange={e => handleFieldChange('url', e.target.value)}
                        placeholder="Document URL or upload PDF below..."
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      />
                      <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-dashed border-slate-800 text-slate-400 text-xs">
                        <Upload size={14} className="text-slate-500" />
                        <span>Or upload Policy PDF File:</span>
                        <input 
                          type="file" 
                          accept=".pdf"
                          onChange={e => handleFileUpload(e, 'url', 'document')}
                          className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Tags (Comma-separated)</label>
                    <input 
                      type="text" 
                      value={editItem.fields.tagString}
                      onChange={e => handleFieldChange('tagString', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                    />
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <input 
                      type="checkbox" 
                      id="isSensitive"
                      checked={editItem.fields.isSensitive}
                      onChange={e => handleFieldChange('isSensitive', e.target.checked)}
                      className="h-4 w-4 bg-slate-950 border border-slate-850 rounded text-ecasi-green focus:ring-ecasi-green"
                    />
                    <label htmlFor="isSensitive" className="text-slate-300 text-sm font-semibold select-none cursor-pointer">
                      Is Sensitive Document? (Requires Request Document dialog)
                    </label>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Summary</label>
                    <textarea 
                      rows={3}
                      value={editItem.fields.summary}
                      onChange={e => handleFieldChange('summary', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                    />
                  </div>
                </>
              )}

              {/* Vacancies editor fields */}
              {activeTab === 'vacancies' && (
                <>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Position Title</label>
                    <input 
                      type="text" 
                      value={editItem.fields.title}
                      onChange={e => handleFieldChange('title', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1">Contract Type</label>
                      <select 
                        value={editItem.fields.type}
                        onChange={e => handleFieldChange('type', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1">Location</label>
                      <input 
                        type="text" 
                        value={editItem.fields.location}
                        onChange={e => handleFieldChange('location', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Application Deadline</label>
                    <input 
                      type="text" 
                      value={editItem.fields.deadline}
                      onChange={e => handleFieldChange('deadline', e.target.value)}
                      placeholder="e.g. August 15, 2026"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Job Description & Details</label>
                    <textarea 
                      rows={5}
                      value={editItem.fields.description}
                      onChange={e => handleFieldChange('description', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                    />
                  </div>
                </>
              )}

              {/* Videos editor fields */}
              {activeTab === 'videos' && (
                <>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Video Title</label>
                    <input 
                      type="text" 
                      value={editItem.fields.title}
                      onChange={e => handleFieldChange('title', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1">Video Type</label>
                      <input 
                        type="text" 
                        value={editItem.fields.type}
                        onChange={e => handleFieldChange('type', e.target.value)}
                        placeholder="e.g. Webinar, Recorded Session"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1">Date</label>
                      <input 
                        type="text" 
                        value={editItem.fields.date}
                        onChange={e => handleFieldChange('date', e.target.value)}
                        placeholder="e.g. June 2026"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      />
                    </div>
                  </div>

                  {/* Video thumbnail image upload (PNG, JPG, JPEG) */}
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 space-y-3">
                    <label className="block text-slate-300 text-xs font-semibold">Video Thumbnail Cover (Supported: PNG, JPG, JPEG • max 8MB)</label>
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      {editItem.fields.image && (
                        <img src={editItem.fields.image} alt="Preview" className="w-20 h-14 object-cover rounded border border-slate-800 bg-slate-900 shrink-0" />
                      )}
                      <div className="flex-grow w-full space-y-2">
                        <input 
                          type="text" 
                          value={editItem.fields.image}
                          onChange={e => handleFieldChange('image', e.target.value)}
                          placeholder="Image URL or upload below..."
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                        />
                        <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-dashed border-slate-800 text-slate-400 text-xs">
                          <Upload size={14} className="text-slate-500" />
                          <span>Upload Thumbnail:</span>
                          <input 
                            type="file" 
                            accept=".png,.jpg,.jpeg"
                            onChange={e => handleFileUpload(e, 'image', 'image')}
                            className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Video Player selector (YouTube Link or Direct Video Upload) */}
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 space-y-3">
                    <label className="block text-slate-300 text-xs font-semibold">Video Source (YouTube Link OR Direct MP4 Upload)</label>
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        value={editItem.fields.url}
                        onChange={e => handleFieldChange('url', e.target.value)}
                        placeholder="YouTube Link (e.g., https://youtube.com/watch?v=...) or URL link..."
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      />
                      <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-dashed border-slate-800 text-slate-400 text-xs">
                        <Upload size={14} className="text-slate-500" />
                        <span>Or upload local direct MP4 video:</span>
                        <input 
                          type="file" 
                          accept="video/mp4"
                          onChange={e => handleFileUpload(e, 'url', 'document')}
                          className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Books Editor Fields */}
              {activeTab === 'books' && (
                <>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Book Title</label>
                    <input 
                      type="text" 
                      value={editItem.fields.title}
                      onChange={e => handleFieldChange('title', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Author(s)</label>
                    <input 
                      type="text" 
                      value={editItem.fields.author}
                      onChange={e => handleFieldChange('author', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                    />
                  </div>

                  {/* Book cover image upload (PNG, JPG, JPEG) */}
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 space-y-3">
                    <label className="block text-slate-300 text-xs font-semibold">Book Cover Image (Supported: PNG, JPG, JPEG • max 8MB)</label>
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      {editItem.fields.image && (
                        <img src={editItem.fields.image} alt="Preview" className="w-16 h-20 object-cover rounded border border-slate-800 bg-slate-900 shrink-0" />
                      )}
                      <div className="flex-grow w-full space-y-2">
                        <input 
                          type="text" 
                          value={editItem.fields.image}
                          onChange={e => handleFieldChange('image', e.target.value)}
                          placeholder="Image URL or upload below..."
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                        />
                        <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-dashed border-slate-800 text-slate-400 text-xs">
                          <Upload size={14} className="text-slate-500" />
                          <span>Upload Cover:</span>
                          <input 
                            type="file" 
                            accept=".png,.jpg,.jpeg"
                            onChange={e => handleFileUpload(e, 'image', 'image')}
                            className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Book PDF Upload OR Link */}
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 space-y-3">
                    <label className="block text-slate-300 text-xs font-semibold">Book Document (Direct URL Link OR PDF Upload)</label>
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        value={editItem.fields.downloadUrl}
                        onChange={e => handleFieldChange('downloadUrl', e.target.value)}
                        placeholder="Download / Read Link or upload PDF below..."
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      />
                      <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-dashed border-slate-800 text-slate-400 text-xs">
                        <Upload size={14} className="text-slate-500" />
                        <span>Or upload Book PDF file:</span>
                        <input 
                          type="file" 
                          accept=".pdf"
                          onChange={e => handleFileUpload(e, 'downloadUrl', 'document')}
                          className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Policy Briefs Editor Fields */}
              {activeTab === 'briefs' && (
                <>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Brief Title</label>
                    <input 
                      type="text" 
                      value={editItem.fields.title}
                      onChange={e => handleFieldChange('title', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1">Date</label>
                      <input 
                        type="text" 
                        value={editItem.fields.date}
                        onChange={e => handleFieldChange('date', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      />
                    </div>
                  </div>

                  {/* Policy brief document upload OR Link */}
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 space-y-3">
                    <label className="block text-slate-300 text-xs font-semibold">Brief Document (Direct URL Link OR PDF Upload)</label>
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        value={editItem.fields.downloadUrl}
                        onChange={e => handleFieldChange('downloadUrl', e.target.value)}
                        placeholder="Download URL or upload PDF below..."
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      />
                      <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-dashed border-slate-800 text-slate-400 text-xs">
                        <Upload size={14} className="text-slate-500" />
                        <span>Or upload Brief PDF:</span>
                        <input 
                          type="file" 
                          accept=".pdf"
                          onChange={e => handleFileUpload(e, 'downloadUrl', 'document')}
                          className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Tags (Comma-separated)</label>
                    <input 
                      type="text" 
                      value={editItem.fields.tagString}
                      onChange={e => handleFieldChange('tagString', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Summary Description</label>
                    <textarea 
                      rows={4}
                      value={editItem.fields.summary}
                      onChange={e => handleFieldChange('summary', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                    />
                  </div>
                </>
              )}

              {/* Events Editor Fields */}
              {activeTab === 'events' && (
                <>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Event Title</label>
                    <input 
                      type="text" 
                      value={editItem.fields.title}
                      onChange={e => handleFieldChange('title', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1">Date (YYYY-MM-DD)</label>
                      <input 
                        type="date" 
                        value={editItem.fields.date}
                        onChange={e => handleFieldChange('date', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1">Type / Category</label>
                      <input 
                        type="text" 
                        value={editItem.fields.type}
                        onChange={e => handleFieldChange('type', e.target.value)}
                        placeholder="e.g. Workshop"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Venue</label>
                    <input 
                      type="text" 
                      value={editItem.fields.venue}
                      onChange={e => handleFieldChange('venue', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Description</label>
                    <textarea 
                      rows={4}
                      value={editItem.fields.desc}
                      onChange={e => handleFieldChange('desc', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                    />
                  </div>
                </>
              )}

              {/* Trainings / Courses Editor Fields */}
              {activeTab === 'courses' && (
                <>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Course Slug</label>
                    <input 
                      type="text" 
                      value={editItem.fields.slug}
                      onChange={e => handleFieldChange('slug', e.target.value)}
                      placeholder="e.g. agricultural-carbon-credit-markets"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      required
                      disabled={true}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Page HTML Content (Wordpress Elementor Replicated Markup)</label>
                    <textarea 
                      rows={12}
                      value={editItem.fields.content}
                      onChange={e => handleFieldChange('content', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-4 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                      required
                    />
                  </div>
                </>
              )}

            </form>

            <div className="p-6 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-950/20 rounded-b-3xl">
              <button 
                type="button"
                onClick={() => { setShowModal(false); setEditItem(null); }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleFormSubmit}
                className="px-5 py-2.5 bg-ecasi-green hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-ecasi-green/5"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Menu Navigation Edit Modal */}
      {showMenuModal && menuEditItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md flex flex-col shadow-2xl animate-scale-in">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {menuEditItem.isNew ? 'Add Menu' : 'Edit Menu'} Link
              </h3>
              <button 
                onClick={() => { setShowMenuModal(false); setMenuEditItem(null); }}
                className="p-1 hover:bg-slate-800 text-slate-500 hover:text-white rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleMenuSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Menu Label / Text</label>
                <input 
                  type="text" 
                  value={menuEditItem.label}
                  onChange={e => setMenuEditItem(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g. Energy Transition"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Target Page URL / Path</label>
                <input 
                  type="text" 
                  value={menuEditItem.path}
                  onChange={e => setMenuEditItem(prev => ({ ...prev, path: e.target.value }))}
                  placeholder="e.g. /executive-training/energy"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                  required={!menuEditItem.isCategory}
                />
              </div>

              {menuEditItem.isNew && (
                <div className="flex items-center gap-3 py-2">
                  <input 
                    type="checkbox" 
                    id="isCategory"
                    checked={menuEditItem.isCategory}
                    onChange={e => setMenuEditItem(prev => ({ ...prev, isCategory: e.target.checked }))}
                    className="h-4 w-4 bg-slate-950 border border-slate-850 rounded text-ecasi-green focus:ring-ecasi-green"
                  />
                  <label htmlFor="isCategory" className="text-slate-300 text-sm font-semibold select-none cursor-pointer">
                    Is this a Category Dropdown? (Can have nested sub-links)
                  </label>
                </div>
              )}

              {/* Show ID field only for Category Dropdown */}
              {menuEditItem.isCategory && (
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Category Unique ID (slug)</label>
                  <input 
                    type="text" 
                    value={menuEditItem.id}
                    onChange={e => setMenuEditItem(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="e.g. carbon-markets"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                    required
                    disabled={!menuEditItem.isNew}
                  />
                </div>
              )}

              {/* Parent category selector for sub links */}
              {!menuEditItem.isCategory && (
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Parent Dropdown Category</label>
                  <select 
                    value={menuEditItem.parentCategory}
                    onChange={e => setMenuEditItem(prev => ({ ...prev, parentCategory: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ecasi-green"
                  >
                    <option value="none">None (Display directly on main level)</option>
                    {coursesLinks.filter(m => m.id).map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => { setShowMenuModal(false); setMenuEditItem(null); }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-ecasi-green hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  Save Menu Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-sm text-center shadow-2xl animate-scale-in">
            <div className="w-12 h-12 bg-red-950/30 text-red-500 border border-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Resource?</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Are you sure you want to delete <strong>&quot;{deleteConfirmItem.title || deleteConfirmItem.slug}&quot;</strong>? This action will remove it immediately from the browser preview.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 py-2.5 bg-red-650 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Admin;
