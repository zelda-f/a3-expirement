import {
  createContext, useContext, useMemo, ReactNode,
  useEffect, useState,
} from 'react';
import {
  getAuth, onAuthStateChanged, User, signOut, Auth,
} from 'firebase/auth';
import { LoadingOverlay } from '@mantine/core';
import { useStorageEngine } from '../../storage/storageEngineHooks';
import { FirebaseStorageEngine } from '../../storage/engines/FirebaseStorageEngine';
import { UserWrapped } from '../../storage/engines/StorageEngine';

// Defines default AuthContextValue
interface AuthContextValue {
  user: UserWrapped;
  logout: () => Promise<void>;
  triggerAuth: () => void;
  verifyAdminStatus: (inputUser: UserWrapped) => Promise<boolean>;
  }

// Initializes AuthContext
const AuthContext = createContext<AuthContextValue>({
  user: {
    user: null,
    determiningStatus: false,
    isAdmin: false,
    adminVerification: false,
  },
  logout: async () => {},
  triggerAuth: () => {},
  verifyAdminStatus: () => Promise.resolve(false),
});

// Firebase auth context
export const useAuth = () => useContext(AuthContext);

// Defines the functions that are exposed in this hook.
export function AuthProvider({ children } : { children: ReactNode }) {
  // Default non-user when loading
  const loadingNullUser : UserWrapped = {
    user: null,
    determiningStatus: true,
    isAdmin: false,
    adminVerification: false,
  };

  // Default non-user when not loading
  const nonLoadingNullUser : UserWrapped = {
    user: null,
    determiningStatus: false,
    isAdmin: false,
    adminVerification: false,
  };

  // Non-auth User
  const nonAuthUser : UserWrapped = {
    user: {
      name: 'fakeName',
      email: 'fakeEmail@fake.com',
      uid: 'fakeUid',
    },
    determiningStatus: false,
    isAdmin: true,
    adminVerification: true,
  };

  const [user, setUser] = useState(loadingNullUser);
  const [enableAuthTrigger, setEnableAuthTrigger] = useState(false);
  const { storageEngine } = useStorageEngine();

  // Logs the user out by removing the user and navigating to '/login'
  const logout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(`There was an issue signing-out the user: ${error.message}`);
    } finally {
      setUser(nonLoadingNullUser);
    }
  };

  const triggerAuth = () => {
    setEnableAuthTrigger(true);
  };

  const verifyAdminStatus = async (inputUser: UserWrapped) => {
    if (storageEngine) {
      return await storageEngine.validateUser(inputUser, true);
    }
    return false;
  };

  useEffect(() => {
    // Set initialUser
    setUser(loadingNullUser);

    // Get authentication
    let auth: Auth;
    if (storageEngine instanceof FirebaseStorageEngine) {
      try {
        auth = getAuth();
      } catch {
        console.warn('No firebase store.');
      }
    }

    // Handle auth state changes for Firebase
    const handleAuthStateChanged = async (firebaseUser: User | null) => {
      // Reset the user. This also gets called on signOut
      setUser((prevUser) => ({
        user: prevUser.user,
        isAdmin: prevUser.isAdmin,
        determiningStatus: true,
        adminVerification: false,
      }));
      if (firebaseUser) {
        // Reach out to firebase to validate user
        const currUser: UserWrapped = {
          user: firebaseUser,
          determiningStatus: false,
          isAdmin: false,
          adminVerification: true,
        };
        const isAdmin = await verifyAdminStatus(currUser);
        currUser.isAdmin = !!isAdmin;
        setUser(currUser);
      } else {
        logout();
      }
    };

    // Determine authentication listener based on storageEngine and authEnabled variable
    const determineAuthentication = async () => {
      if (storageEngine instanceof FirebaseStorageEngine) {
        const authInfo = await storageEngine?.getUserManagementData('authentication');
        if (authInfo?.isEnabled) {
          // Define unsubscribe function for listening to authentication state changes when using Firebase with authentication
          const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => await handleAuthStateChanged(firebaseUser));
          return () => unsubscribe();
        }
        setUser(nonAuthUser);
      } else if (storageEngine) {
        setUser(nonAuthUser);
      }
      return () => {};
    };

    const cleanupPromise = determineAuthentication();

    return () => {
      cleanupPromise.then((cleanup) => cleanup());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageEngine, enableAuthTrigger]);

  const value = useMemo(() => ({
    user,
    triggerAuth,
    logout,
    verifyAdminStatus,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {user.determiningStatus ? <LoadingOverlay visible /> : children }
    </AuthContext.Provider>
  );
}
