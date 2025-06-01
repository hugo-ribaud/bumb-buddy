import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

// A simple button that toggles between light and dark mode
const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { isDark } = useTheme();
  const { theme, updateTheme } = usePreferences();

  const handleToggleTheme = useCallback(async () => {
    // Calculate what the new theme will be
    let newTheme: 'light' | 'dark' | 'system';
    if (theme === 'system') {
      newTheme = isDark ? 'light' : 'dark';
    } else if (theme === 'light') {
      newTheme = 'dark';
    } else {
      newTheme = 'light';
    }

    // Update theme using PreferencesContext (handles both local and remote storage)
    await updateTheme(newTheme);
  }, [theme, isDark, updateTheme]);

  return (
    <TouchableOpacity
      onPress={handleToggleTheme}
      className={`flex-row items-center ${className}`}
    >
      <View
        className={`p-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
      >
        <Ionicons
          name={isDark ? 'moon' : 'sunny'}
          size={20}
          color={isDark ? '#FFFFFF' : '#000000'}
        />
      </View>
      <Text className={`ml-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
        {theme === 'system' ? 'System' : isDark ? 'Dark' : 'Light'}
      </Text>
    </TouchableOpacity>
  );
};

export default ThemeToggle;
