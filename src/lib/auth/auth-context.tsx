import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  useCallback,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<boolean>;
  signInWithGoogleAccount: (name: string, email: string, avatar?: string) => void;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<boolean>;
  signInAsDemoUser: () => void;
  signOutUser: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const createGuestUser = (name = "Guest Student", email = "guest@student.local") => {
  const safeEmail = email || "guest@student.local";
  const safeName = name || safeEmail.split("@")[0] || "Guest Student";
  const guestUser = {
    uid: "guest-user",
    displayName: safeName,
    email: safeEmail,
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(safeEmail)}`,
  } as unknown as User;

  return guestUser;
};

function formatAuthError(code: string, fallbackMessage: string): string {
  switch (code) {
    case "auth/api-key-not-valid":
    case "auth/invalid-api-key":
      return "Firebase API Key is missing or invalid. Please check your .env file.";
    case "auth/unauthorized-domain":
      return "Domain not authorized in Firebase Console. Add your current IP/hostname under Firebase Console -> Authentication -> Settings -> Authorized domains.";
    case "auth/operation-not-allowed":
      return "Google Sign-In is not enabled in Firebase Console.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password. Please verify your credentials and try again.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists. Please log in instead.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/popup-closed-by-user":
      return "Google sign-in popup was closed before completion.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    default:
      return fallbackMessage || "Authentication error occurred.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const rawSession = localStorage.getItem("sea-pro:user-session");
    if (rawSession) {
      try {
        const parsed = JSON.parse(rawSession) as User;
        setUser(parsed);
        setLoading(false);
        return () => { };
      } catch {
        localStorage.removeItem("sea-pro:user-session");
      }
    }

    const guestUser = createGuestUser();
    localStorage.setItem("sea-pro:user-session", JSON.stringify(guestUser));
    setUser(guestUser);
    setLoading(false);

    if (isFirebaseConfigured) {
      getRedirectResult(auth)
        .then((result) => {
          if (result?.user) {
            setUser(result.user);
            localStorage.setItem("sea-pro:user-session", JSON.stringify(result.user));
          }
        })
        .catch((err) => {
          console.error("Redirect auth error:", err);
        });

      unsub = onAuthStateChanged(
        auth,
        (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
            localStorage.setItem("sea-pro:user-session", JSON.stringify(currentUser));
          } else if (!localStorage.getItem("sea-pro:user-session")) {
            setUser(guestUser);
            localStorage.setItem("sea-pro:user-session", JSON.stringify(guestUser));
          }
          setLoading(false);
        },
        (err) => {
          console.error("Auth state listener error:", err);
          setLoading(false);
        }
      );
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const signInWithGoogleAccount = useCallback(
    (name: string, email: string, avatar?: string) => {
      const safeEmail = email || "student@gmail.com";
      const safeName = name || safeEmail.split("@")[0] || "Student";
      const googleUser = {
        uid: "guest-user",
        displayName: safeName,
        email: safeEmail,
        photoURL: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(safeEmail)}`,
      } as unknown as User;

      localStorage.setItem("sea-pro:user-session", JSON.stringify(googleUser));
      setUser(googleUser);
      setError(null);
    },
    []
  );

  const signInAsDemoUser = useCallback(() => {
    signInWithGoogleAccount("Demo Student", "demo.student@university.edu");
  }, [signInWithGoogleAccount]);

  const signInWithGoogle = async (): Promise<boolean> => {
    setError(null);
    const guestUser = createGuestUser("Student", "student@gmail.com");
    localStorage.setItem("sea-pro:user-session", JSON.stringify(guestUser));
    setUser(guestUser);
    return true;
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setError(null);
    const safeEmail = email.trim();
    const fallbackName = safeEmail.split("@")[0] || "Student";
    signInWithGoogleAccount(fallbackName, safeEmail);
    return true;
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    name: string
  ): Promise<boolean> => {
    setError(null);
    const safeEmail = email.trim();
    const safeName = name.trim() || safeEmail.split("@")[0] || "Student";
    signInWithGoogleAccount(safeName, safeEmail);
    return true;
  };

  const signOutUser = async (): Promise<void> => {
    setError(null);
    const guestUser = createGuestUser();
    localStorage.setItem("sea-pro:user-session", JSON.stringify(guestUser));
    setUser(guestUser);
    try {
      if (isFirebaseConfigured) {
        await signOut(auth);
      }
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithGoogle,
        signInWithGoogleAccount,
        signInWithEmail,
        signUpWithEmail,
        signInAsDemoUser,
        signOutUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
