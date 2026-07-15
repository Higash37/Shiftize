

import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";

import { User } from "./auth";

import type { UserRole } from "@/common/common-models/model-user/UserModel";

import { ServiceProvider } from "../ServiceProvider";

import { getSupabase } from "../supabase/supabase-client";

import { StoreIdStorage } from "@/common/common-utils/util-storage/StoreIdStorage";

import { validateEmail } from "@/common/common-utils/util-validation/inputValidation";

import { SecurityLogger, RateLimiter, CSRFTokenManager } from "@/common/common-utils/security/securityUtils";

import { toAsciiEmail } from "@/services/supabase/utils/asciiEmail";

const getSafeUserAgent = () => typeof navigator !== "undefined" ? navigator.userAgent : "react-native";

const getSafeOrigin = () => typeof window !== "undefined" && window.location ? window.location.origin : "app";

interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  authError: string | null;
}

type AuthAction =
  | { type: "AUTH_SUCCESS"; user: User; role: UserRole }
  | { type: "AUTH_CLEAR" }
  | { type: "AUTH_ERROR"; error: string };

const initialState: AuthState = {
  user: null,
  role: null,
  loading: true,
  authError: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_SUCCESS":

      return { user: action.user, role: action.role, loading: false, authError: null };
    case "AUTH_CLEAR":

      return { user: null, role: null, loading: false, authError: null };
    case "AUTH_ERROR":

      return { user: null, role: null, loading: false, authError: action.error };
    default:

      return state;
  }
}

interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  signIn: (emailOrUsername: string, password: string, storeId?: string) => Promise<{ role: UserRole }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [state, dispatch] = useReducer(authReducer, initialState);

  const signInInProgress = useRef(false);

  const cachedProfile = useRef<{ uid: string; nickname: string; role: UserRole; email: string; storeId: string } | null>(null);

  const signIn = useCallback(async (
    emailOrUsernameWithStore: string,
    password: string,
    storeId?: string
  ): Promise<{ role: UserRole }> => {
    try {

      const userAgent = getSafeUserAgent();
      const clientId = `${userAgent}_${getSafeOrigin()}`;

      if (!RateLimiter.isAllowed(clientId)) {

        SecurityLogger.logEvent({
          type: 'rate_limit_exceeded',
          details: 'Login rate limit exceeded',
          userAgent,
        });
        throw new Error("ログイン試行回数が上限に達しました。しばらく時間を置いてから再試行してください。");
      }

      if (!emailOrUsernameWithStore || !password) {
        SecurityLogger.logEvent({
          type: 'invalid_input',
          details: 'Empty email or password provided',
        });
        throw new Error("メールアドレスとパスワードを入力してください");
      }

      const isEmailFormatInput = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsernameWithStore);
      if (isEmailFormatInput) {

        const emailValidation = validateEmail(emailOrUsernameWithStore);
        if (!emailValidation.isValid) {
          SecurityLogger.logEvent({
            type: 'invalid_input',
            details: `Invalid email format: ${emailValidation.error}`,
          });
          throw new Error(emailValidation.error);
        }
      }

      if (password.length < 6) {
        SecurityLogger.logEvent({
          type: 'invalid_input',
          details: 'Password too short',
        });
        throw new Error("パスワードは6文字以上で入力してください");
      }

      let emailToUse = emailOrUsernameWithStore;

      if (!isEmailFormatInput) {
        if (!storeId) {
          throw new Error("店舗IDが必要です");
        }
        emailToUse = `${storeId}${emailOrUsernameWithStore}@example.com`;
      }

      emailToUse = toAsciiEmail(emailToUse);

      signInInProgress.current = true;

      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (authError || !authData.user) {
        throw new Error("メールアドレスまたはパスワードが正しくありません");
      }

      const userData = await new Promise<Record<string, any> | null>((resolve, reject) => {
        setTimeout(async () => {
          try {

            const result = await ServiceProvider.users.getUserFullProfile(authData.user!.id);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        }, 0);
      });

      if (!userData) {
        throw new Error("ユーザー情報が見つかりません");
      }

      const nickname = userData['nickname'] as string || "";
      const userRole = (userData['role'] as UserRole) || "user";
      const profile = {
        uid: authData.user.id,
        nickname,
        role: userRole,
        email: authData.user.email || "",
        storeId: userData['storeId'] || "",
      };

      cachedProfile.current = profile;

      dispatch({
        type: "AUTH_SUCCESS",
        user: profile,
        role: userRole,
      });

      if (profile.storeId) {
        StoreIdStorage.saveStoreId(profile.storeId).catch(() => {});
      }

      SecurityLogger.logEvent({
        type: 'system_event',
        details: `User ${nickname} logged in successfully`,
        userAgent,
      });

      return { role: userRole };
    } catch (error: any) {

      let errorMessage = "ログインに失敗しました";
      if (error.message) {
        errorMessage = error.message;
      }

      dispatch({ type: "AUTH_ERROR", error: errorMessage });

      throw new Error(errorMessage);
    } finally {

      signInInProgress.current = false;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {

      CSRFTokenManager.clearToken();

      cachedProfile.current = null;

      await ServiceProvider.auth.signOut();

      dispatch({ type: "AUTH_CLEAR" });

      SecurityLogger.logEvent({
        type: 'user_logout',
        details: 'User logged out',
        userAgent: getSafeUserAgent(),
      });
    } catch (error) {

      dispatch({ type: "AUTH_CLEAR" });
      throw error;
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabase();

    const fallbackOrSignOut = async (errorMessage: string) => {
      if (cachedProfile.current) {

        dispatch({
          type: "AUTH_SUCCESS",
          user: cachedProfile.current,
          role: cachedProfile.current.role,
        });
        return;
      }

      await ServiceProvider.auth.signOut();
      dispatch({ type: "AUTH_ERROR", error: errorMessage });
    };

    const fetchAndDispatchProfile = async (userId: string, email: string) => {
      try {

        const userData = await ServiceProvider.users.getUserFullProfile(userId);

        if (!userData) {
          await fallbackOrSignOut("ユーザー情報が見つかりません。");
          return;
        }

        const nickname = userData['nickname'] as string || "";
        const userRole = (userData['role'] as UserRole) || "user";
        const profile = {
          uid: userId,
          nickname,
          role: userRole,
          email,
          storeId: userData['storeId'] || "",
        };

        cachedProfile.current = profile;

        dispatch({ type: "AUTH_SUCCESS", user: profile, role: userRole });

        if (profile.storeId) {
          await StoreIdStorage.saveStoreId(profile.storeId);
        }
      } catch {
        await fallbackOrSignOut("認証エラーが発生しました。");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {

        if (signInInProgress.current && event === "SIGNED_IN") {
          return;
        }

        if (event === "TOKEN_REFRESHED" && cachedProfile.current && session?.user) {
          dispatch({
            type: "AUTH_SUCCESS",
            user: cachedProfile.current,
            role: cachedProfile.current.role,
          });
          return;
        }

        if (session?.user) {

          const userId = session.user.id;
          const email = session.user.email || "";

          setTimeout(() => {

            if (event === "USER_UPDATED") {
              const identities = session.user!.identities ?? [];

              const oauthIdentity = identities.find(
                (id) => id.provider === "google" || id.provider === "apple"
              );
              if (oauthIdentity) {

                const oauthEmail = oauthIdentity.identity_data?.['email'] as string | undefined;
                if (oauthEmail) {
                  supabase
                    .from("users")
                    .update({
                      real_email: oauthEmail,
                      oauth_provider: oauthIdentity.provider,
                      oauth_linked_at: new Date().toISOString(),
                    })
                    .eq("uid", userId)
                    .then(() => {}, () => {});
                }
              }
            }

            fetchAndDispatchProfile(userId, email);
          }, 0);
        } else {

          cachedProfile.current = null;
          dispatch({ type: "AUTH_CLEAR" });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: state.user,
    role: state.role,
    loading: state.loading,
    isAuthenticated: !!state.user && !state.authError,
    authError: state.authError,
    signIn,
    signOut,
  }), [state, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {

  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
