import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  LanguageCode,
  ThemeMode,
  UnitSystem,
  setLanguage,
  setPreferences,
  setTheme,
  setUnits,
} from '../redux/slices/preferencesSlice';
import { RootState } from '../redux/store';
import preferencesService from '../services/preferencesService';

interface PreferencesContextProps {
  theme: ThemeMode;
  language: LanguageCode;
  units: UnitSystem;
  isLoading: boolean;
  updateTheme: (theme: ThemeMode) => Promise<void>;
  updateLanguage: (language: LanguageCode) => Promise<void>;
  updateUnits: (units: UnitSystem) => Promise<void>;
  syncPreferences: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextProps | undefined>(
  undefined
);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme, language, units, isLoading } = useSelector(
    (state: RootState) => state.preferences
  );
  const [initialized, setInitialized] = useState(false);

  // Load and merge preferences on mount and user change
  useEffect(() => {
    const initializePreferences = async () => {
      try {
        // If user is logged in, get both local and remote preferences
        if (user?.id) {
          const mergedPrefs = await preferencesService.getMergedPreferences(
            user.id
          );

          if (mergedPrefs.theme || mergedPrefs.language || mergedPrefs.units) {
            dispatch(
              setPreferences({
                theme: mergedPrefs.theme,
                language: mergedPrefs.language,
                units: mergedPrefs.units,
              })
            );
          }
        }
        // If no user, just load from local storage
        else {
          const localPrefs = await preferencesService.loadLocalPreferences();

          if (localPrefs.theme || localPrefs.language || localPrefs.units) {
            dispatch(
              setPreferences({
                theme: localPrefs.theme,
                language: localPrefs.language,
                units: localPrefs.units,
              })
            );
          }
        }
      } catch (error) {
        console.error('Failed to initialize preferences:', error);
      } finally {
        setInitialized(true);
      }
    };

    if (!initialized) {
      initializePreferences();
    }
  }, [dispatch, user, initialized]);

  // Handle theme updates
  const updateTheme = async (newTheme: ThemeMode) => {
    try {
      // Update Redux state immediately for UI
      dispatch(setTheme(newTheme));

      // Update local storage
      await preferencesService.saveLocalPreferences({ theme: newTheme });

      // If user is logged in, also update remote
      if (user?.id) {
        await preferencesService.syncPreferencesToServer({
          userId: user.id,
          theme: newTheme,
        });
      }
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  // Handle language updates
  const updateLanguage = async (newLanguage: LanguageCode) => {
    try {
      // Update Redux state immediately for UI
      dispatch(setLanguage(newLanguage));

      // Update local storage
      await preferencesService.saveLocalPreferences({ language: newLanguage });

      // If user is logged in, also update remote
      if (user?.id) {
        await preferencesService.syncPreferencesToServer({
          userId: user.id,
          language: newLanguage,
        });
      }
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };

  // Handle units updates
  const updateUnits = async (newUnits: UnitSystem) => {
    try {
      // Update Redux state immediately for UI
      dispatch(setUnits(newUnits));

      // Update local storage
      await preferencesService.saveLocalPreferences({ units: newUnits });

      // If user is logged in, also update remote
      if (user?.id) {
        await preferencesService.syncPreferencesToServer({
          userId: user.id,
          units: newUnits,
        });
      }
    } catch (error) {
      console.error('Failed to update units:', error);
    }
  };

  // Force a sync with the server
  const syncPreferences = async () => {
    if (!user?.id) return;

    try {
      const mergedPrefs = await preferencesService.getMergedPreferences(
        user.id
      );

      if (mergedPrefs.theme || mergedPrefs.language || mergedPrefs.units) {
        dispatch(
          setPreferences({
            theme: mergedPrefs.theme,
            language: mergedPrefs.language,
            units: mergedPrefs.units,
          })
        );
      }
    } catch (error) {
      console.error('Failed to sync preferences:', error);
    }
  };

  const contextValue: PreferencesContextProps = {
    theme,
    language,
    units,
    isLoading,
    updateTheme,
    updateLanguage,
    updateUnits,
    syncPreferences,
  };

  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextProps => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
