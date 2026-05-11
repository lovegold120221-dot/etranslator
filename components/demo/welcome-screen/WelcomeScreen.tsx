
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef, useMemo } from 'react';
import './WelcomeScreen.css';
import { useLogStore, useSettings } from '../../../lib/state';
import { Languages, ShieldCheck } from 'lucide-react';

const WelcomeScreen: React.FC = () => {
  const turns = useLogStore(state => state.turns);
  const { language1, language2, autoDetect, isDetecting } = useSettings();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever turns update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [turns]);

  const combinedTurns = useMemo(() => {
    const result = [];
    let i = 0;
    while (i < turns.length) {
      if (turns[i].role === 'user') {
        const userTurn = turns[i];
        let agentTurn = null;
        if (i + 1 < turns.length && turns[i+1].role === 'agent') {
          agentTurn = turns[i+1];
          i += 2;
        } else {
          i++;
        }
        result.push({ userTurn, agentTurn });
      } else {
        result.push({ userTurn: null, agentTurn: turns[i] });
        i++;
      }
    }
    return result;
  }, [turns]);

  if (turns.length === 0) {
    return (
      <div className="welcome-screen">
        <div className="welcome-content empty">
        </div>
      </div>
    );
  }

  return (
    <div className="welcome-screen chat-layout" ref={scrollRef}>
      <div className="chat-thread">
        {combinedTurns.map((phrase, index) => {
          const originalText = phrase.userTurn?.text?.trim() || '';
          const translationText = (phrase.agentTurn?.translation || phrase.agentTurn?.text || '').trim();
          
          const isInterim = (phrase.userTurn && !phrase.userTurn.isFinal) || (phrase.agentTurn && !phrase.agentTurn.isFinal);
          const isAtEnd = index === combinedTurns.length - 1;

          // Check if there's an actual distinct translation
          const hasDistinctTranslation = translationText && originalText && translationText.toLowerCase() !== originalText.toLowerCase();

          return (
            <div 
              key={index} 
              className={`turn-block ${isInterim ? 'interim' : 'final'}`}
            >
              <div className="turn-inner">
                <div className="turn-text-wrapper group relative">
                  
                  {/* Original Text */}
                  {originalText && (
                     <p className={`turn-text original-text ${hasDistinctTranslation ? 'with-translation' : ''}`}>
                       {originalText}
                       {(isInterim && isAtEnd && !translationText) && <span className="cursor"></span>}
                     </p>
                  )}

                  {/* Translation Text (Agent) */}
                  {translationText && (
                    <div className="translation-container mt-2 flex flex-col items-start gap-2">
                       <p className={`turn-text translation-text ${hasDistinctTranslation ? 'text-blue-200' : ''}`}>
                         {translationText}
                         {(isInterim && isAtEnd) && <span className="cursor"></span>}
                       </p>
                       
                       {/* Language Indicator */}
                       {hasDistinctTranslation && phrase.agentTurn?.isFinal && (
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 px-3 py-1 bg-[#1f1f22] border border-[#3c4043] rounded-full text-xs text-[#80868b] shadow-lg">
                           <Languages className="w-3.5 h-3.5" />
                           <span>Translated</span>
                           {autoDetect && !isDetecting && (
                             <span className="flex items-center gap-1 ml-2 pl-2 border-l border-[#3c4043] text-emerald-400">
                               <ShieldCheck className="w-3.5 h-3.5" />
                               {language2} Detected
                             </span>
                           )}
                         </div>
                       )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WelcomeScreen;
