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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
        const label = cleanLinkLabel(markdownLink[1]) || 'Open Job';
        return (
          <a
            key={index}
            href={markdownLink[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 ml-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold no-underline transition-colors"
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
            className="inline-flex items-center gap-1 ml-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold no-underline transition-colors"
          >
            Open Job
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

      if (!trimmed) return <div key={idx} className="h-2" />;

      if (/^###\s+/.test(trimmed)) {
        return (
          <h3 key={idx} className="mt-1 mb-3 text-base sm:text-lg font-extrabold text-[#00401A] dark:text-emerald-400">
            {trimmed.replace(/^###\s+/, '')}
          </h3>
        );
      }

      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <div key={idx} className="mt-3 mb-1 font-bold text-slate-900 dark:text-white leading-relaxed text-xs sm:text-sm">
            {formatInline(line)}
          </div>
        );
      }

      if (trimmed.startsWith('•') || trimmed.startsWith('-') || (trimmed.startsWith('*') && !trimmed.startsWith('**'))) {
        return (
          <div key={idx} className="ml-4 my-1 text-slate-800 dark:text-slate-200 leading-relaxed text-xs sm:text-sm">
            • {formatInline(trimmed.replace(/^[\s•\-*]+/, ''))}
          </div>
        );
      }

      return (
        <p key={idx} className="my-1.5 text-slate-800 dark:text-slate-200 leading-relaxed text-xs sm:text-sm">
          {formatInline(line)}
        </p>
      );
    });
  };

  return (
    <div className="py-6 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto animate-fade-in-up">
      <div className="flex gap-6 h-[calc(100vh-140px)] min-h-[640px]">
        <div className="hidden lg:flex flex-col items-center justify-center w-56 shrink-0 bg-gradient-to-b from-emerald-50 to-white dark:from-slate-900 dark:to-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <RobotMascot state={isLoading ? 'thinking' : 'idle'} lang={lang} />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setCurrentScreen('home')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00401A] dark:text-emerald-400 hover:text-[#055825] transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.backToDirectory}</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-[#00401A] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
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

          <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col overflow-hidden transition-colors">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';

                return (
                  <div key={msg.id} className={`flex gap-3 items-start animate-fade-in-up ${isUser ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      isUser
                        ? 'bg-slate-800 dark:bg-slate-700 text-white'
                        : 'bg-gradient-to-br from-[#00401A] to-[#046a38] dark:from-emerald-700 dark:to-teal-800 text-white border border-emerald-400/40'
                    }`}>
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5 text-emerald-300" />}
                    </div>

                    <div className={`max-w-[90%] sm:max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className={`p-4 sm:p-5 rounded-2xl shadow-xs text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-[#00401A] dark:bg-emerald-600 text-white rounded-tr-none font-medium'
                          : 'bg-slate-50 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none'
                      }`}>
                        {isUser ? (
                          <p className={isUrdu ? 'urdu-text' : ''}>{msg.text}</p>
                        ) : (
                          <div className={`space-y-1.5 ${isUrdu ? 'urdu-text' : ''}`}>
                            {formatText(msg.text)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 px-1 text-[10px] text-slate-400">
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
                <div className="flex gap-3 items-center animate-fade-in-up">
                  <div className="w-9 h-9 rounded-2xl bg-[#00401A] dark:bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                    <Bot className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00401A] dark:bg-emerald-400 animate-bounce" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00401A] dark:bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00401A] dark:bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold ml-1.5">Consulting Opportunity Engine...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 shrink-0 uppercase">Suggested:</span>
              {quickPromptCategories.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item.query)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 text-slate-700 dark:text-slate-300 hover:text-[#00401A] dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shadow-2xs"
                  >
                    <Icon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <form onSubmit={handleFormSubmit} className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={isUrdu ? 'اپنا سوال یہاں لکھیں...' : 'Ask about any job, scholarship, loan or training scheme...'}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00401A] dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputQuery.trim()}
                  className="px-5 py-3 bg-[#00401A] hover:bg-[#055825] dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><span>Send</span><Send className="w-4 h-4" /></>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}