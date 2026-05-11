/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useSettings, useUI } from '../lib/state';
import c from 'classnames';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';
import { useAuth, clearUserConversations } from '../lib/auth';
import React, { useEffect, useState, useMemo } from 'react';
import { Trash2, X, Clock, Languages, MessageSquare, ShieldCheck, ChevronRight, User, Settings as SettingsIcon, LogOut, ExternalLink, Mail, Shield, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AVAILABLE_LANGUAGES } from '../lib/constants';

type TabType = 'history' | 'profile';

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useUI();
  const {
    systemPrompt, language1, language2, topic, autoDetect, isDetecting,
    setSystemPrompt, setTopic, setAutoDetect, setLanguage1, setLanguage2
  } = useSettings();
  const { connected } = useLiveAPIContext();
  const { user, signOut, isSuperAdmin } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [history, setHistory] = useState<any[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!user) return;

    const loadHistory = () => {
      const stored = localStorage.getItem('user_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        const mapped = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })).sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime());
        setHistory(mapped.slice(0, 100));
      } else {
        setHistory([]);
      }
    };

    loadHistory();
    window.addEventListener('historyUpdated', loadHistory);

    return () => window.removeEventListener('historyUpdated', loadHistory);
  }, [user]);

  // Group history by sessions (items within 30 min of each other)
  const sessions = useMemo(() => {
    if (history.length === 0) return [];
    
    const groups: any[][] = [];
    let currentGroup: any[] = [];
    
    history.forEach((item, index) => {
      if (index === 0) {
        currentGroup.push(item);
      } else {
        const prevItem = history[index - 1];
        const diff = prevItem.timestamp.getTime() - item.timestamp.getTime();
        
        if (diff < 30 * 60 * 1000) { // 30 minutes
          currentGroup.push(item);
        } else {
          groups.push(currentGroup);
          currentGroup = [item];
        }
      }
    });
    
    if (currentGroup.length > 0) groups.push(currentGroup);
    return groups;
  }, [history]);

  const handleClearHistory = async () => {
    if (user && confirm('Are you sure you want to clear your translation history?')) {
      await clearUserConversations(user.id);
    }
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 top-20 bg-black/80 backdrop-blur-[2px] z-[60]"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-20 bottom-0 w-full max-w-md bg-[#0a0a0b] border-l border-t border-[#1f1f22] z-[70] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#1f1f22] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-600/20">
                  {activeTab === 'history' && <Clock className="w-5 h-5 text-blue-400" />}
                  {activeTab === 'profile' && <User className="w-5 h-5 text-blue-400" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white capitalize">{activeTab}</h3>
                  <p className="text-[10px] text-[#52525b] uppercase tracking-widest font-bold">Multilinguahe Pro</p>
                </div>
              </div>
              <button 
                onClick={toggleSidebar}
                className="p-2 text-[#71717a] hover:text-white hover:bg-[#1f1f22] rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex p-2 gap-1 bg-[#121214] mx-6 mt-6 rounded-2xl border border-[#1f1f22]">
              {(['history', 'profile'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={c(
                    "flex-1 py-2 text-xs font-bold rounded-xl transition-all capitalize",
                    activeTab === tab 
                      ? "bg-[#1f1f22] text-white shadow-sm" 
                      : "text-[#71717a] hover:text-[#a1a1aa]"
                  )}
                >
                  {tab === 'history' ? 'History' : 'Profile'}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#1f1f22]">
              <AnimatePresence mode="wait">
                {activeTab === 'history' && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between px-2">
                      <h4 className="text-[11px] font-semibold text-[#80868b] tracking-wider uppercase">Translation Logs</h4>
                      <button
                        onClick={handleClearHistory}
                        className="p-1.5 text-[#5f6368] hover:text-[#e4e4e7] transition-all rounded"
                        title="Clear History"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-8">
                      {sessions.length > 0 ? (
                        sessions.map((session, sIdx) => {
                          const oldestItem = session[session.length - 1];
                          
                          return (
                          <div key={sIdx} className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#1f1f22]" />
                              <span className="text-[10px] font-mono text-[#80868b] flex items-center gap-1.5 bg-[#121214] px-3 py-1 rounded-full border border-[#1f1f22]">
                                <Clock className="w-3 h-3 text-[#5f6368]" />
                                {oldestItem.timestamp.toLocaleDateString()} <span className="text-[#3c4043]">|</span> {oldestItem.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#1f1f22]" />
                            </div>
                            <div className="space-y-2">
                              {[...session].reverse().map((item) => {
                                const isExpanded = expandedItems.has(item.id);
                                return (
                                <div 
                                  key={item.id} 
                                  onClick={(e) => toggleExpand(item.id, e)}
                                  className="group p-4 bg-transparent border border-[#1f1f22] rounded-xl hover:border-[#3c4043] transition-colors relative cursor-pointer"
                                >
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-[#3c4043] rounded-l-xl transition-colors" />
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-start justify-between gap-3">
                                      <p className={c(
                                        "text-[14px] text-[#e4e4e7] leading-relaxed transition-all",
                                        !isExpanded ? "line-clamp-1" : ""
                                      )}>
                                        {item.text}
                                      </p>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[10px] text-[#5f6368] font-mono mt-0.5">
                                          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <ChevronDown className={c("w-3 h-3 text-[#5f6368] transition-transform", isExpanded && "rotate-180")} />
                                      </div>
                                    </div>
                                    <AnimatePresence>
                                      {isExpanded && item.translation && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          exit={{ opacity: 0, height: 0 }}
                                          className="overflow-hidden"
                                        >
                                          <div className="pt-2 mt-1 border-t border-[#1f1f22]">
                                            <p className="text-[14px] text-[#98beff] font-medium leading-relaxed">
                                              {item.translation}
                                            </p>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              )})}
                            </div>
                          </div>
                        )})
                      ) : (
                        <div className="p-8 text-center space-y-3 mt-10">
                          <MessageSquare className="w-6 h-6 text-[#3c4043] mx-auto" />
                          <p className="text-xs text-[#5f6368]">No translations yet</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-8"
                  >
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="mb-4">
                        <div className="w-20 h-20 bg-[#1f1f22] rounded-full mx-auto flex items-center justify-center text-[#71717a]">
                          <User className="w-8 h-8" />
                        </div>
                      </div>
                      <h4 className="text-lg font-medium text-white mb-1">Local User</h4>
                      <p className="text-xs text-[#80868b] flex items-center gap-1.5">
                        <Mail className="w-3 h-3" /> local@example.com
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[11px] font-semibold text-[#80868b] uppercase tracking-wider px-2">Language Pairs</h4>
                      <div className="flex flex-col gap-3">
                        {/* Staff Language */}
                        <div className="space-y-1.5 px-2">
                          <p className="text-[10px] text-[#80868b] uppercase tracking-wider">Staff Language</p>
                          <div className="relative">
                            <select 
                              value={language1}
                              onChange={(e) => setLanguage1(e.target.value)}
                              className="w-full bg-[#121214] border border-[#1f1f22] rounded-xl px-4 py-3 text-[14px] text-[#e4e4e7] appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50"
                            >
                              {AVAILABLE_LANGUAGES.filter(l => l.value !== 'auto').map(lang => (
                                <option key={lang.value} value={lang.value}>{lang.name}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#80868b] pointer-events-none" />
                          </div>
                        </div>

                        {/* Guest Language */}
                        <div className="space-y-1.5 px-2">
                          <p className="text-[10px] text-[#80868b] uppercase tracking-wider">Guest Language</p>
                          <div className="relative">
                            <select 
                              value={autoDetect ? 'auto' : language2}
                              onChange={(e) => {
                                if (e.target.value === 'auto') {
                                  setAutoDetect(true);
                                } else {
                                  setAutoDetect(false);
                                  setLanguage2(e.target.value);
                                }
                              }}
                              className="w-full bg-[#121214] border border-[#1f1f22] rounded-xl px-4 py-3 text-[14px] text-[#e4e4e7] appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50"
                            >
                              {AVAILABLE_LANGUAGES.map(lang => (
                                <option key={lang.value} value={lang.value}>{lang.name}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#80868b] pointer-events-none" />
                          </div>
                          
                          {autoDetect && (
                            <div className="px-2 py-1 flex items-center justify-between">
                              <p className="text-[14px] text-[#e4e4e7]">
                                {isDetecting ? (
                                  <span className="flex items-center gap-2 text-blue-400 text-xs font-medium">
                                    <span className="relative flex h-1.5 w-1.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                                    </span>
                                    Detecting guest language...
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Detected: {language2}
                                  </span>
                                )}
                              </p>
                              {isDetecting && (
                                <button 
                                  onClick={() => setAutoDetect(true)} // Re-trigger detection
                                  className="text-[10px] text-blue-500 hover:underline uppercase tracking-tighter font-bold"
                                >
                                  Restart
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Settings tab removed */}
              </AnimatePresence>
            </div>

            {/* Footer Action */}
            <div className="p-6 bg-[#0a0a0b] border-t border-[#1f1f22]">
              <button
                onClick={toggleSidebar}
                className="w-full h-14 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shadow-xl"
              >
                Done
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
