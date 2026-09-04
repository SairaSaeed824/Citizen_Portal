import { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  ArrowLeft, 
  ChevronRight, 
  RefreshCw, 
  Trash2, 
  Copy, 
  Check, 
  User, 
  Laptop,
  GraduationCap,
  Landmark,
  Building2
} from 'lucide-react';
import { askChatbot } from '../services/opportunitiesService';
import RobotMascot from '../components/RobotMascot';

// Module-level helpers keep Date/counter access out of the component body,
// so React doesn't treat them as impure calls during render.
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
      ? 'السلام علیکم! میں پبلک مواقع پورٹل کا سمارٹ معاون ہوں۔ آپ مجھ سے کسی بھی سرکاری نوکری، اسکالرشپ، لیپ ٹاپ سکیم، بلاسود قرضے یا ٹریننگ پروگرام کے بارے میں باآسانی پوچھ سکتے ہیں۔'
      : 'Welcome to the Pakistan Citizen Opportunities AI Assistant! Ask me anything about government jobs, PM & CM laptop schemes, Honhaar scholarships, Kisan loans, or free IT training certifications.',
    relatedOpportunities: [],
    timestamp: getCurrentTimestamp()
  };
}

export default function ChatbotScreen({
  setCurrentScreen,
  onSelectOpportunity,
  t,
  lang
}) {
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
      label: isUrdu ? 'ہونہار اسکالرشپ' : 'Scholarships',
      query: isUrdu ? 'پنجاب اور وفاقی حکومت کی اہم اسکالرشپس کونسی ہیں؟' : 'What scholarships are available for undergraduate students?'
    },
    {
      icon: Landmark,
      label: isUrdu ? 'بلاسود قرضے' : 'Kisan & Youth Loans',
      query: isUrdu ? 'کسان کارڈ اور پرائم منسٹر یوتھ لون کے کیا شرائط ہیں؟' : 'How can I get interest-free loans under Kisan Card or PM Youth Loan?'
    },
    {
      icon: Building2,
      label: isUrdu ? 'مفت آئی ٹی کورسز' : 'IT Certifications',
      query: isUrdu ? 'کیا وظیفے کے ساتھ مفت آئی ٹی کورسز دستیاب ہیں؟' : 'Are there free IT training programs with monthly stipends?'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const q = (textToSend || inputQuery).trim();
    if (!q || isLoading) return;

    const userMessage = {
      id: generateMessageId('user'),
      sender: 'user',
      text: q,
      timestamp: getCurrentTimestamp()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await askChatbot(q);
      const botMessage = {
        id: generateMessageId('bot'),
        sender: 'bot',
        text: response.answer,
        relatedOpportunities: response.relatedOpportunities || [],
        timestamp: getCurrentTimestamp()
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = {
        id: generateMessageId('bot-err'),
        sender: 'bot',
        text: isUrdu 
          ? 'معذرت، جواب حاصل کرنے میں کچھ مسئلہ ہوا۔ براہِ کرم دوبارہ کوشش کریں۔' 
          : 'Sorry, an error occurred while querying the assistant. Please try again.',
        relatedOpportunities: [],
        timestamp: getCurrentTimestamp()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputQuery);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: generateMessageId('welcome-reset'),
        sender: 'bot',
        text: isUrdu 
          ? 'چیٹ ری سیٹ کر دی گئی ہے۔ آپ نیا سوال پوچھ سکتے ہیں۔'
          : 'Conversation cleared. How else may I assist you with government opportunities today?',
        relatedOpportunities: [],
        timestamp: getCurrentTimestamp()
      }
    ]);
  };

  const handleCopy = (id, text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const formatText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const itemText = trimmed.replace(/^[\s•\-\*]+/, '');
        return (
          <li key={idx} className="ml-4 list-disc my-1 text-slate-800 dark:text-slate-200 leading-relaxed text-xs sm:text-sm">
            {formatInline(itemText)}
          </li>
        );
      }
      if (/^\d+\./.test(trimmed)) {
        return (
          <div key={idx} className="my-2 font-bold text-slate-900 dark:text-white leading-relaxed text-xs sm:text-sm">
            {formatInline(line)}
          </div>
        );
      }
      if (!trimmed) {
        return <div key={idx} className="h-2"></div>;
      }
      return (
        <p key={idx} className="my-1.5 text-slate-800 dark:text-slate-200 leading-relaxed text-xs sm:text-sm">
          {formatInline(line)}
        </p>
      );
    });
  };

  const formatInline = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-[#00401A] dark:text-emerald-400">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="bg-emerald-50 dark:bg-slate-800 text-[#00401A] dark:text-emerald-300 border border-emerald-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="py-6 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto animate-fade-in-up">
      <div className="flex gap-6 h-[calc(100vh-140px)] min-h-[640px]">

        {/* Side Mascot Panel — desktop only */}
        <div className="hidden lg:flex flex-col items-center justify-center w-56 shrink-0 bg-gradient-to-b from-emerald-50 to-white dark:from-slate-900 dark:to-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <RobotMascot state={isLoading ? 'thinking' : 'idle'} lang={lang} />
        </div>

        {/* Chat Column */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Top Header Bar */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setCurrentScreen('home')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00401A] dark:text-emerald-400 hover:text-[#055825] transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.backToDirectory}</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-[#00401A] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
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

          {/* Main Chat Container with elevated glow */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col overflow-hidden transition-colors">
            
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';

                return (
                  <div 
                    key={msg.id}
                    className={`flex gap-3 items-start animate-fade-in-up ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar with Glow Ring */}
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      isUser 
                        ? 'bg-slate-800 dark:bg-slate-700 text-white' 
                        : 'bg-gradient-to-br from-[#00401A] to-[#046a38] dark:from-emerald-700 dark:to-teal-800 text-white border border-emerald-400/40'
                    }`}>
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5 text-emerald-300" />}
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-[85%] sm:max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      
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

                      {/* Related Opportunities Cards inside Bot Bubble */}
                      {!isUser && msg.relatedOpportunities && msg.relatedOpportunities.length > 0 && (
                        <div className="mt-3 w-full space-y-2">
                          <span className="text-[11px] font-extrabold text-[#00401A] dark:text-emerald-400 uppercase tracking-wider block">
                            {t.relatedOppsTitle || 'Matching Opportunities:'}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {msg.relatedOpportunities.map((opp) => (
                              <div
                                key={opp.id}
                                onClick={() => onSelectOpportunity(opp)}
                                className="p-3 bg-emerald-50/80 dark:bg-slate-800 hover:bg-emerald-100/90 dark:hover:bg-slate-700 border border-emerald-200 dark:border-slate-700 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 group hover:-translate-y-0.5 hover:shadow-xs"
                              >
                                <div className="truncate">
                                  <span className="text-[10px] font-extrabold uppercase text-[#00401A] dark:text-emerald-400">
                                    {opp.category}
                                  </span>
                                  <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#00401A] dark:group-hover:text-emerald-400">
                                    {opp.extra_data?.title}
                                  </h5>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                    {opp.extra_data?.organization}
                                  </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 group-hover:translate-x-1 transition-transform" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer metadata & copy action */}
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

              {/* Animated Wave Typing Indicator */}
              {isLoading && (
                <div className="flex gap-3 items-center animate-fade-in-up">
                  <div className="w-9 h-9 rounded-2xl bg-[#00401A] dark:bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                    <Bot className="w-5 h-5 text-emerald-300 animate-spin" />
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00401A] dark:bg-emerald-400 animate-bounce"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00401A] dark:bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00401A] dark:bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold ml-1.5">Consulting Opportunity Engine...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Question Chips Bar */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 shrink-0 uppercase">Suggested:</span>
              {quickPromptCategories.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item.query)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 text-slate-700 dark:text-slate-300 hover:text-[#00401A] dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shadow-2xs hover:-translate-y-0.5 active:scale-95"
                  >
                    <Icon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Input Area */}
            <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <form onSubmit={handleFormSubmit} className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={isUrdu ? 'اپنا سوال یہاں لکھیں (مثلاً: لیپ ٹاپ سکیم کے لیے اپلائی کیسے کریں؟)...' : 'Ask about any job, scholarship, loan or training scheme...'}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00401A] dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition"
                />

                <button
                  type="submit"
                  disabled={isLoading || !inputQuery.trim()}
                  className="px-5 py-3 bg-[#00401A] hover:bg-[#055825] dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 btn-apply-glow"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-2 px-1">
                <span>Citizen Opportunities AI Assistant</span>
                <span>Always verify on official department portals (.gov.pk)</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}