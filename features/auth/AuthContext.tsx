import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('[Auth] Checking session...');

        // Timeout fallback in case Supabase is unreachable
        const timeout = setTimeout(() => {
            console.warn('[Auth] Supabase connection timeout - continuing without auth');
            setLoading(false);
        }, 10000); // 10 second timeout

        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            clearTimeout(timeout);
            console.log('[Auth] Session result:', session ? 'User logged in' : 'No session');
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        }).catch(err => {
            clearTimeout(timeout);
            console.error('[Auth] getSession error:', err);
            setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('[Auth] State changed:', _event);
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            clearTimeout(timeout);
            subscription.unsubscribe();
        };
    }, []);

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) console.error('Error signing in:', error.message);
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error signing out:', error.message);
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
