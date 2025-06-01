/**
 * RTL Context Provider
 * Provides right-to-left layout direction context based on language
 */

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { I18nManager } from 'react-native';
import { useLanguage } from './LanguageContext';

// Context type definition
interface RTLContextType {
  isRTL: boolean;
  toggleRTL: (force?: boolean) => void;
}

// Create context with default values
const RTLContext = createContext<RTLContextType>({
  isRTL: false,
  toggleRTL: () => {},
});

// Props for provider
interface RTLProviderProps {
  children: ReactNode;
}

/**
 * RTL Provider Component
 * Wraps the app to provide RTL context
 */
export const RTLProvider: React.FC<RTLProviderProps> = ({ children }) => {
  const { isRTL: isLanguageRTL } = useLanguage();
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);

  // Update RTL state when language RTL changes
  useEffect(() => {
    if (isLanguageRTL !== isRTL) {
      toggleRTL(isLanguageRTL);
    }
  }, [isLanguageRTL, isRTL]);

  // Toggle RTL direction
  const toggleRTL = (force?: boolean) => {
    const newValue = force !== undefined ? force : !isRTL;

    if (newValue !== isRTL) {
      // Set RTL state
      setIsRTL(newValue);

      // Update React Native I18nManager
      if (I18nManager.isRTL !== newValue) {
        I18nManager.forceRTL(newValue);

        // In a real app, we would need to restart the app here
        // to fully apply RTL changes, as some components may not
        // respond to runtime RTL changes.
      }
    }
  };

  // Context value
  const value = {
    isRTL,
    toggleRTL,
  };

  return <RTLContext.Provider value={value}>{children}</RTLContext.Provider>;
};

/**
 * Custom hook to use RTL context
 */
export const useRTL = () => useContext(RTLContext);

export default RTLContext;
