import { useState } from 'react';
import { ShieldAlert, X, Compass } from 'lucide-react';

export default function DisclaimerBanner({ lang, onOpenGuide }) {
  const [isDismissed, setIsDismissed] = useState(false);
  const isUrdu = lang === 'ur';

  if (isDismissed) return null;

  return (
    <aside 
      aria-label="Public Disclaimer"
      className="bg-amber-500/15 border-b border-amber-500/30 text-amber-950 dark:text-amber-200 dark:bg-amber-950/60 text-xs py-2.5 px-4 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <p className={`leading-tight text-[11px] sm:text-xs ${isUrdu ? 'urdu-text' : ''}`}>
            {isUrdu ? (
              <span>
                <strong>غیر سرکاری معلوماتی ایگریگیٹر:</strong> یہ پورٹل کسی حکومتی ادارے سے براہِ راست منسلک نہیں ہے۔ درخواست ہمیشہ اصل سرکاری پورٹل (.gov.pk) پر دیں۔
              </span>
            ) : (
              <span>
                <strong>Independent Public Aggregator:</strong> Not directly affiliated with the Government of Pakistan. Listings are crawled from public notices—always verify directly on official agency websites (.gov.pk).
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenGuide && (
            <button
              type="button"
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-900 dark:text-amber-100 font-bold text-[11px] border border-amber-500/30 transition cursor-pointer"
            >
              <Compass className="w-3 h-3" />
              <span>{isUrdu ? 'رہنمائی و فلو' : 'How It Works'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 p-1 rounded-md transition cursor-pointer"
            title="Dismiss Notice"
            aria-label="Dismiss disclaimer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}