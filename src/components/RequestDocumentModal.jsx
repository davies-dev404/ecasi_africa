import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Building, FileText, Send, CheckCircle2 } from 'lucide-react';
import { adminRegistrationService } from '@/services/adminRegistrationService';

const RequestDocumentModal = ({ isOpen, onClose, documentTitle, documentNumber }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    purpose: '',
  });
  const [submittedMailto, setSubmittedMailto] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    adminRegistrationService.addInquiry({
      channel: 'Email',
      inquiryType: 'Policy Document Access Request',
      fullName: formData.name.trim(),
      email: formData.email.trim(),
      organisation: formData.organization.trim(),
      courseTitle: `${documentTitle}${documentNumber ? ` (#${documentNumber})` : ''}`,
      message: formData.purpose.trim(),
    });

    // Subject and body formulation for optional default email client copy
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
    setSubmittedMailto(mailtoUrl);
    setIsSubmitted(true);
  };

  const handleCloseModal = () => {
    setIsSubmitted(false);
    setSubmittedMailto('');
    setFormData({ name: '', email: '', organization: '', purpose: '' });
    onClose();
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
            onClick={handleCloseModal}
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
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-200/50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isSubmitted ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">Access Request Recorded!</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Thank you, <strong>{formData.name}</strong>. Your request for <strong>{documentTitle}</strong> has been logged with ECAS Institute.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <a
                    href={submittedMailto}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    <Mail className="h-4 w-4 text-amber-600" />
                    Also Open in Default Email App
                  </a>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
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
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RequestDocumentModal;
