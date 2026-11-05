import React from "react";

const WhatsAppWidget = () => {
  const phoneNumber = "254728925306";
  const defaultMessage = encodeURIComponent(
    "Hello ECAS Institute, I would like to inquire about your executive training programs and courses."
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Inquire Now on WhatsApp"
        className="relative group flex items-center gap-2.5 px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium rounded-full shadow-[0_4px_16px_rgba(37,211,102,0.45)] hover:shadow-[0_6px_22px_rgba(37,211,102,0.6)] transition-all duration-300 hover:scale-105 active:scale-95"
        style={{ fontFamily: "'Roboto', sans-serif" }}
      >
        {/* Unread message indicator badge */}
        <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-[#e53e3e] text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
          1
        </span>

        {/* WhatsApp Icon */}
        <svg
          className="w-6 h-6 fill-current flex-shrink-0"
          viewBox="0 0 24 24"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.174.232-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.42-.101.825zM12.004 2C6.48 2 2 6.48 2 12.008c0 1.947.562 3.766 1.533 5.309L2 22.5l5.347-1.401A9.957 9.957 0 0012.004 22c5.523 0 10.004-4.48 10.004-9.992C22.008 6.48 11.527 2 12.004 2z" />
        </svg>

        {/* Text */}
        <span className="text-[14px] font-bold tracking-wide whitespace-nowrap">
          Inquire Now
        </span>
      </a>
    </div>
  );
};

export default WhatsAppWidget;

