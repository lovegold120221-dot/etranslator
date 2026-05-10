/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { create } from 'zustand';
import { ConversationTurn } from './state';

interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isSuperAdmin: boolean;
  loading: boolean;
  initialized: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const MOCK_USER: AuthUser = {
  id: 'local-user',
  email: 'local@example.com',
  displayName: 'Local User',
  photoURL: null,
};

export const useAuth = create<AuthState>((set) => {
  setTimeout(() => {
     set({ user: MOCK_USER, loading: false, initialized: true, isSuperAdmin: true });
  }, 100);

  return {
    user: null,
    isSuperAdmin: false,
    loading: true,
    initialized: false,
    signInWithGoogle: async () => {},
    signOut: async () => {},
    signInWithEmail: async () => {},
    signUpWithEmail: async () => {},
    resetPassword: async () => {}
  };
});

export const db = {} as any; // mock db object

export const updateUserSettings = async (userId: string, newSettings: Partial<{ systemPrompt: string; voice: string }>) => {
  localStorage.setItem('user_settings', JSON.stringify(newSettings));
};

export const updateUserConversations = async (userId: string, turns: ConversationTurn[]) => {
  const lastTurn = turns[turns.length - 1];
  if (!lastTurn || !lastTurn.isFinal) return;

  const stored = localStorage.getItem('user_history');
  const history = stored ? JSON.parse(stored) : [];
  
  history.push({
    id: Date.now().toString(),
    role: lastTurn.role,
    text: lastTurn.text,
    translation: lastTurn.translation || '',
    transcription: lastTurn.transcription || '',
    timestamp: new Date().toISOString(),
    userId: userId,
  });

  localStorage.setItem('user_history', JSON.stringify(history));
  window.dispatchEvent(new Event('historyUpdated'));
};

export const clearUserConversations = async (userId: string) => {
  localStorage.removeItem('user_history');
  window.dispatchEvent(new Event('historyUpdated'));
};
