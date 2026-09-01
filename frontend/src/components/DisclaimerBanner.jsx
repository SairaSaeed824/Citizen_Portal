import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, ExternalLink } from 'lucide-react';

export default function DisclaimerBanner({ lang }) {
  const [isDismissed, setIsDismissed] = useState(false);
  const isUrdu = lang === 'ur';

  if (isDismissed) return null;

  return (
    <aside 
      aria-label="Public Disclaimer"
      className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 dark:bg-amber-950/40 text-xs py-2 px-4 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className={`leading-tight text-[11px] sm:text-xs ${isUrdu ? 'urdu-text' : ''}`}>
            {isUrdu ? (
              <span>
                <strong>عوامی آگاہی نوٹس:</strong> یہ پورٹل ایک خود مختار عوامی معلوماتی ایگریگیٹر ہے اور کسی سرکاری ادارے سے براہِ راست منسلک نہیں ہے۔ درخواست دینے سے قبل متعلقہ ادارے کے اصل پورٹل سے تصدیق ضرور کریں۔
              </span>
            ) : (
              <span>
                <strong>Public Notice:</strong> This is an independent public awareness aggregator and not directly affiliated with the Government of Pakistan. Listings are aggregated from public notices—always verify details on the official agency portal before applying.
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-100 p-1 rounded transition cursor-pointer"
          title="Dismiss Notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
