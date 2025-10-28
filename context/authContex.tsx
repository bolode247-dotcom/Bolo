import { getCurrentUser } from '@/appwriteFuncs/usersFunc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

interface AuthContextType {
  isLoading: boolean;
  session: boolean;
  user: any | null;
  hasCompletedOnboarding: boolean;
  selectedLanguage: string | null;
  setSelectedLanguage: (lang: string) => void;
  toggleLanguage?: () => void;
  markOnboardingComplete: () => Promise<void>;
  fetchData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [selectedLanguage, setSelectedLanguageState] = useState<string | null>(
    null,
  );

  // Save and change language
  const setSelectedLanguage = async (lang: string) => {
    try {
      setSelectedLanguageState(lang);
      i18next.changeLanguage(lang);
      await AsyncStorage.setItem('appLanguage', lang);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  };

  const toggleLanguage = () => {
    setSelectedLanguage(selectedLanguage === 'en' ? 'fr' : 'en');
  };

  // Load language on app start
  const loadLanguage = async () => {
    try {
      const lang = await AsyncStorage.getItem('appLanguage');
      if (lang) setSelectedLanguageState(lang);
      i18next.changeLanguage(lang || 'en');
    } catch (error) {
      console.log('Error loading language:', error);
    }
  };

  // Onboarding functions
  const markOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('isOnboardingComplete', 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
  };

  const loadOnboardingState = async () => {
    try {
      const onboardingValue = await AsyncStorage.getItem(
        'isOnboardingComplete',
      );
      setHasCompletedOnboarding(onboardingValue === 'true');
    } catch (error) {
      console.log('Error reading onboarding status:', error);
    }
  };

  // Fetch user session
  const fetchData = async () => {
    try {
      const res: any = await getCurrentUser();
      if (res?.session && res?.user) {
        setSession(true);
        setUser(res.user);
      } else {
        setSession(false);
        setUser(null);
      }
    } catch (error: any) {
      console.warn('Auth fetch error:', error);
      setSession(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadLanguage();
      await loadOnboardingState();
      await fetchData();
    };
    init();
  }, []);

  const value: AuthContextType = {
    isLoading,
    session,
    user,
    hasCompletedOnboarding,
    selectedLanguage,
    setSelectedLanguage,
    toggleLanguage,
    markOnboardingComplete,
    fetchData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
