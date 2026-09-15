import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  ArrowLeft,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  User,
  Laptop,
  GraduationCap,
  Landmark,
  Building2,
  ExternalLink
} from 'lucide-react';
import { askChatbot } from '../services/opportunitiesService';
import RobotMascot from '../components/RobotMascot';

let messageIdCounter = 0;
function generateMessageId(prefix) {
  messageIdCounter += 1;
  return `${prefix}-${messageIdCounter}`;
}

function getCurrentTimestamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function buildWelcomeMessage(lang) {
  return {
    id: 'welcome',
    sender: 'bot',
    text: lang === 'ur'
      ? 'السلام علیکم! میں پبلک مواقع پورٹل کا سمارٹ معاون ہوں۔ آپ مجھ سے کسی بھی سرکاری نوکری، اسکالرشپ، لیپ ٹاپ سکیم، بلاسود قرضے یا ٹریننگ پروگرام کے بارے میں پوچھ سکتے ہیں۔'
      : 'Welcome to the Pakistan Citizen Opportunities AI Assistant! Ask me about government jobs, scholarships, loans, training programs, or other verified opportunities.',
    timestamp: getCurrentTimestamp()
  };
}

export default function ChatbotScreen({ setCurrentScreen, t, lang }) {
  const [messages, setMessages] = useState(() => [buildWelcomeMessage(lang)]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isUrdu = lang === 'ur';

  const quickPromptCategories = [
    {
      icon: Laptop,
      label: isUrdu ? 'لیپ ٹاپ سکیم' : 'Laptop Schemes',
      query: isUrdu ? 'وزیراعلیٰ لیپ ٹاپ سکیم کے لیے کون اہل ہے؟' : 'Who is eligible for the CM Punjab Laptop Scheme 2026?'
    },
    {
      icon: GraduationCap,
      label: isUrdu ? 'اسکالرشپس' : 'Scholarships',
      query: isUrdu ? 'پنجاب اور وفاقی حکومت کی اہم اسکالرشپس کونسی ہیں؟' : 'What scholarships are available for undergraduate students?'
    },
    {
      icon: Landmark,
      label: isUrdu ? 'بلاسود قرضے' : 'Loans',
      query: isUrdu ? 'بلاسود سرکاری قرضے کون سے دستیاب ہیں؟' : 'What interest-free government loans are available?'
    },
    {
      icon: Building2,
      label: isUrdu ? 'آئی ٹی ٹریننگ' : 'IT Training',
      query: isUrdu ? 'مفت آئی ٹی ٹریننگ پروگرام کون سے ہیں؟' : 'What free IT training programs are available?'
    }
  ];

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [messages.length]);

  const handleSendMessage = async (textToSend) => {
    const q = (textToSend || inputQuery).trim();
    if (!q || isLoading) return;

    setMessages((prev) => [...prev, {
      id: generateMessageId('user'),
      sender: 'user',
      text: q,
      timestamp: getCurrentTimestamp()
    }]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await askChatbot(q);
      setMessages((prev) => [...prev, {
        id: generateMessageId('bot'),
        sender: 'bot',
        text: response.answer || 'No verified answer was found.',
        timestamp: getCurrentTimestamp()
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: generateMessageId('bot-err'),
        sender: 'bot',
        text: isUrdu
          ? 'معذرت، جواب حاصل کرنے میں کچھ مسئلہ ہوا۔ براہِ کرم دوبارہ کوشش کریں۔'
          : 'Sorry, an error occurred while querying the assistant. Please try again.',
        timestamp: getCurrentTimestamp()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputQuery);
  };

  const handleClearChat = () => {
    setMessages([{
      id: generateMessageId('welcome-reset'),
      sender: 'bot',
      text: isUrdu
        ? 'چیٹ ری سیٹ کر دی گئی ہے۔ آپ نیا سوال پوچھ سکتے ہیں۔'
        : 'Conversation cleared. How else may I assist you with government opportunities today?',
      timestamp: getCurrentTimestamp()
    }]);
  };

  const handleCopy = (id, text) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const cleanLinkLabel = (label) => {
    return label
      .replace(/^\*+|\*+$/g, '')
      .replace(/\s*svg\s*$/i, '')
      .replace(/\\([\\`*_\[\]#])/g, '$1')
      .trim();
  };

  const cleanText = (text) => {
    return String(text || '')
      .replace(/\\([\\`*_\[\]#])/g, '$1')
      .replace(/\*{3,}/g, '**')
      .trim();
  };

  const formatInline = (text) => {
    const value = cleanText(text);
    const parts = value.split(/(\[(?:\*\*)?[^\]]+(?:\*\*)?\]\(https?:\/\/[^)]+\)|\*\*.*?\*\*|`.*?`|https?:\/\/\S+)/g);

    return parts.map((part, index) => {
      const markdownLink = part.match(/^\[(.*?)\]\((https?:\/\/[^)]+)\)$/);
      if (markdownLink) {
        const label = cleanLinkLabel(markdownLink[1]) || 'Open Opportunity';
        return (
          <a
            key={index}
            href={markdownLink[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 ml-1 px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold no-underline transition-colors"
          >
            {label}
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        );
      }

      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-[#00401A] dark:text-emerald-400">
            {part.slice(2, -2).replace(/\s*svg\s*$/i, '')}
          </strong>
        );
      }

      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="bg-emerald-50 dark:bg-slate-800 text-[#00401A] dark:text-emerald-300 border border-emerald-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }

      if (/^https?:\/\/\S+$/.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 ml-1 px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold no-underline transition-colors"
          >
            Open Opportunity
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        );
      }

      return part;
    });
  };

  const formatText = (text) => {
    if (!text) return null;

    return cleanText(text).split('\n').map((line, idx) => {
      const trimmed = line.trim();

      if (!trimmed) return <div key={idx} className="h-1" />;

      if (/^###\s+/.test(trimmed)) {
        return (
          <h3 key={idx} className="mt-1 mb-2 text-base font-extrabold text-[#00401A] dark:text-emerald-400">
            {trimmed.replace(/^###\s+/, '')}
          </h3>
        );
      }

      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <div key={idx} className="mt-2 mb-0.5 font-bold text-slate-900 dark:text-white leading-relaxed text-xs sm:text-sm">
            {formatInline(line)}
          </div>
        );
      }

      if (trimmed.startsWith('•') || trimmed.startsWith('-') || (trimmed.startsWith('*') && !trimmed.startsWith('**'))) {
        return (
          <div key={idx} className="ml-4 my-0.5 text-slate-800 dark:text-slate-200 leading-relaxed text-xs sm:text-sm">
            • {formatInline(trimmed.replace(/^[\s•\-*]+/, ''))}
          </div>
        );
      }

      return (
        <p key={idx} className="my-1 text-slate-800 dark:text-slate-200 leading-relaxed text-xs sm:text-sm">
          {formatInline(line)}
        </p>
      );
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-5 lg:px-6 py-2 sm:py-3">
      <div className="flex items-center justify-between gap-3 mb-2">
        <button
          onClick={() => setCurrentScreen('home')}
          className="inline-flex items-center gap-1.5 py-1 text-xs font-bold text-[#00401A] dark:text-emerald-400 hover:text-[#055825] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToDirectory}</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-[#00401A] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-extrabold">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span>Madadgar AI Assistant</span>
          </div>

          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100dvh-112px)] min-h-[520px] max-h-[820px]">
        <div className="hidden lg:flex w-48 xl:w-52 shrink-0 flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white dark:from-slate-900 dark:to-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <RobotMascot state={isLoading ? 'thinking' : 'idle'} lang={lang} />
        </div>

        <div className="flex-1 min-w-0 min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#00401A] text-white flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4 text-emerald-200" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">AI Opportunity Assistant</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">Verified citizen opportunities</p>
              </div>
            </div>
          </div>

          <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-5 py-4 space-y-3 overscroll-contain">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div key={msg.id} className={`flex gap-2.5 items-start ${isUser ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    isUser
                      ? 'bg-slate-800 dark:bg-slate-700 text-white'
                      : 'bg-gradient-to-br from-[#00401A] to-[#046a38] dark:from-emerald-700 dark:to-teal-800 text-white border border-emerald-400/40'
                  }`}>
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4 text-emerald-300" />}
                  </div>

                  <div className={`max-w-[88%] sm:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`px-3 py-2.5 rounded-2xl shadow-sm text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#00401A] dark:bg-emerald-600 text-white rounded-tr-md font-medium'
                        : 'bg-slate-50 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-md'
                    }`}>
                      {isUser ? (
                        <p className={isUrdu ? 'urdu-text' : ''}>{msg.text}</p>
                      ) : (
                        <div className={`space-y-0.5 ${isUrdu ? 'urdu-text' : ''}`}>
                          {formatText(msg.text)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer flex items-center gap-1 font-semibold"
                        >
                          {copiedId === msg.id ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Copied
                            </span>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-8 h-8 rounded-xl bg-[#00401A] dark:bg-emerald-700 text-white flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-md flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#00401A] dark:bg-emerald-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#00401A] dark:bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#00401A] dark:bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold ml-1">Consulting...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-px" />
          </div>

          <div className="px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 shrink-0 uppercase">Suggested</span>
              {quickPromptCategories.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item.query)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 text-slate-700 dark:text-slate-300 hover:text-[#00401A] dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer shadow-sm"
                  >
                    <Icon className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={isUrdu ? 'اپنا سوال یہاں لکھیں...' : 'Ask about jobs, scholarships, loans or training...'}
                className="flex-1 min-w-0 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00401A] dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition"
              />
              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="px-3.5 sm:px-4 py-2.5 bg-[#00401A] hover:bg-[#055825] dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><span>Send</span><Send className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
