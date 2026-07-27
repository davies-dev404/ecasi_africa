import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Building, FileText, Send } from 'lucide-react';

const RequestDocumentModal = ({ isOpen, onClose, documentTitle, documentNumber }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    purpose: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Subject and body formulation for the email client
    const subject = `Document Request: ${documentTitle}`;
    const body = `Hello ECAS Team,

I am writing to request access to the restricted policy document: "${documentTitle}"${documentNumber ? ` (Policy #${documentNumber})` : ''}.

Here are my details for verification:
- Full Name: ${formData.name}
- Email Address: ${formData.email}
- Organization / Institution: ${formData.organization}
- Reason for Access: ${formData.purpose}

Please let me know the procedure to access or receive this document.

Best regards,
${formData.name}`;

    const mailtoUrl = `mailto:info@ecasiafrica.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    alert(`Thank you, ${formData.name}! Your request has been prepared in your email client. If it did not open automatically, please send your details to info@ecasiafrica.org.`);
    onClose();
    setFormData({ name: '', email: '', organization: '', purpose: '' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl relative z-10 border border-slate-100"
          >
            {/* Header */}
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-slate-800 text-lg">Request Document Access</h3>
                  <p className="text-xs text-slate-500 font-medium">Please enter your details to request access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-slate-200/50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {/* Document Banner */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Requested File</span>
                <span className="text-sm font-semibold text-slate-700 leading-snug">
                  {documentTitle} {documentNumber && `#${documentNumber}`}
                </span>
              </div>

              {/* Name field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-slate-700 placeholder-slate-400 bg-slate-50/50 font-medium"
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-slate-700 placeholder-slate-400 bg-slate-50/50 font-medium"
                  />
                </div>
              </div>

              {/* Organization field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Organization / Institution</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    name="organization"
                    required
                    value={formData.organization}
                    onChange={handleInputChange}
                    placeholder="Enter your organization name"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-slate-700 placeholder-slate-400 bg-slate-50/50 font-medium"
                  />
                </div>
              </div>

              {/* Purpose field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block font-sans">Reason for Access Request</label>
                <textarea
                  name="purpose"
                  required
                  rows={3}
                  value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="Explain why you require access to this document..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-slate-700 placeholder-slate-400 bg-slate-50/50 font-medium resize-none"
                />
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Send className="h-4.5 w-4.5" />
                  <span>Submit Access Request</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RequestDocumentModal;
