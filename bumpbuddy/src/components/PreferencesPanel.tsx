import React, { useState } from 'react';
import { ActivityIndicator, Switch, View } from 'react-native';
import { LanguageCode, ThemeMode } from '../redux/slices/preferencesSlice';

import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-native-element-dropdown';
import { usePreferences } from '../contexts/PreferencesContext';
import { useTheme } from '../contexts/ThemeContext';
import FontedText from './FontedText';
import PreferencesLanguageSwitcher from './PreferencesLanguageSwitcher';
import ThemedView from './ThemedView';
import UnitToggle from './UnitToggle';

const PreferencesPanel = () => {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const {
    theme,
    language,
    units,
    updateTheme,
    updateLanguage,
    updateUnits,
    syncPreferences,
  } = usePreferences();
  const [syncing, setSyncing] = useState(false);

  // Format the current theme for display
  const formatTheme = (theme: ThemeMode) => {
    switch (theme) {
      case 'light':
        return t('preferences.themes.light');
      case 'dark':
        return t('preferences.themes.dark');
      case 'system':
        return t('preferences.themes.system');
      default:
        return theme;
    }
  };

  // Language options
  const languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' },
    { label: 'Français', value: 'fr' },
    { label: 'Deutsch', value: 'de' },
  ];

  // Theme options
  const themeOptions = [
    { label: t('preferences.themes.light'), value: 'light' },
    { label: t('preferences.themes.dark'), value: 'dark' },
    { label: t('preferences.themes.system'), value: 'system' },
  ];

  // Handle theme change from dropdown
  const handleThemeChange = async (theme: ThemeMode) => {
    await updateTheme(theme);
  };

  // Handle language change
  const handleLanguageChange = async (lang: LanguageCode) => {
    await updateLanguage(lang);
    i18n.changeLanguage(lang);
  };

  // Force sync with server
  const handleSync = async () => {
    setSyncing(true);
    await syncPreferences();
    setSyncing(false);
  };

  return (
    <>
      <FontedText variant='heading-3' className='mb-3'>
        {t('preferences.title')}
      </FontedText>

      {/* Theme Section */}
      <View className='mb-4'>
        <FontedText variant='heading-4' className='mb-2'>
          {t('preferences.themeSettings')}
        </FontedText>

        <View className='flex-row items-center justify-between mb-3'>
          <FontedText>{t('preferences.darkMode')}</FontedText>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: '#87D9C4' }}
            thumbColor={isDark ? '#5DBDA8' : '#f4f3f4'}
          />
        </View>

        <FontedText className='mb-1'>
          {t('preferences.themeSelection')}
        </FontedText>
        <Dropdown
          data={themeOptions}
          labelField='label'
          valueField='value'
          value={theme}
          onChange={item => handleThemeChange(item.value as ThemeMode)}
          placeholder={t('preferences.selectTheme')}
          style={{
            height: 50,
            borderColor: isDark ? '#444' : '#e0e0e0',
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
            backgroundColor: isDark ? '#333' : '#f5f5f5',
          }}
          placeholderStyle={{ color: isDark ? '#aaa' : '#888' }}
          selectedTextStyle={{ color: isDark ? '#fff' : '#000' }}
          itemTextStyle={{ color: isDark ? '#fff' : '#000' }}
          containerStyle={{
            backgroundColor: isDark ? '#333' : '#fff',
            borderRadius: 8,
          }}
          activeColor={isDark ? '#444' : '#f0f0f0'}
        />
      </View>

      {/* Language Section */}
      <View className='mb-4'>
        <FontedText variant='heading-4' className='mb-2'>
          {t('preferences.languageSettings')}
        </FontedText>

        <View className='mb-3'>
          <FontedText className='mb-1'>{t('preferences.language')}</FontedText>
          <PreferencesLanguageSwitcher />
        </View>
      </View>

      {/* Units Section */}
      <View className='mb-4'>
        <FontedText variant='heading-4' className='mb-2'>
          {t('preferences.measurementSettings')}
        </FontedText>

        <View className='mb-3'>
          <FontedText className='mb-1'>{t('preferences.units')}</FontedText>
          <UnitToggle />
        </View>
      </View>

      {/* Sync Button */}
      <View className='items-center'>
        <ThemedView
          backgroundColor='primary'
          className='px-6 py-2 rounded-full'
          pressable
          onPress={handleSync}
        >
          <View className='flex-row items-center'>
            {syncing ? (
              <ActivityIndicator
                color='#fff'
                size='small'
                style={{ marginRight: 8 }}
              />
            ) : null}
            <FontedText className='font-medium text-white'>
              {syncing ? t('preferences.syncing') : t('preferences.syncNow')}
            </FontedText>
          </View>
        </ThemedView>
      </View>
    </>
  );
};

export default PreferencesPanel;
