/**
 * Preferences Language Switcher Component
 * A component for switching languages in the preferences panel
 * Uses react-native-element-dropdown for a more customizable experience
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import FontedText from './FontedText';
import LanguageFlag from './LanguageFlag';

interface LanguageOption {
  value: string;
  label: string;
  nativeLabel: string;
}

const PreferencesLanguageSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const { isDark } = useTheme();

  // Create array of language options
  const languageOptions: LanguageOption[] = Object.entries(
    supportedLanguages
  ).map(([code, { nativeName, name }]) => ({
    value: code,
    label: name,
    nativeLabel: nativeName,
  }));

  const handleLanguageSelect = async (item: LanguageOption) => {
    if (item.value !== language) {
      await setLanguage(item.value);
    }
  };

  // Custom rendering of dropdown items
  const renderItem = (item: LanguageOption) => {
    // Ensure we have a valid language value for comparison
    const currentLanguage =
      language && Object.keys(supportedLanguages).includes(language)
        ? language
        : 'en';
    const isSelected = item.value === currentLanguage;

    return (
      <View
        className={`flex-row items-center px-4 py-3 ${
          isSelected ? 'bg-primary-light/20 dark:bg-primary-dark/30' : ''
        }`}
      >
        <View
          className={`p-px rounded-full ${
            isDark ? 'bg-[#333]' : 'bg-transparent'
          }`}
        >
          <LanguageFlag languageCode={item.value} size='medium' />
        </View>
        <View className='flex-1 ml-3'>
          <FontedText
            variant='body'
            className='font-medium text-gray-800 dark:text-gray-100'
          >
            {item.nativeLabel}
          </FontedText>
          {item.nativeLabel !== item.label && (
            <FontedText
              variant='caption'
              className='text-gray-500 dark:text-gray-300'
            >
              {item.label}
            </FontedText>
          )}
        </View>
        {isSelected && (
          <View className='items-center justify-center w-6 h-6 rounded-full bg-primary dark:bg-primary-dark'>
            <FontedText className='text-xs font-bold text-white'>✓</FontedText>
          </View>
        )}
      </View>
    );
  };

  // Render the flag icon on the left side of the dropdown
  const renderLeftIcon = (languageCode: string) => {
    return (
      <View
        className={`mr-2.5 p-px rounded-full ${
          isDark ? 'bg-[#333]' : 'bg-transparent'
        }`}
      >
        <LanguageFlag languageCode={languageCode} size='small' />
      </View>
    );
  };

  const selectedLang = languageOptions.find(item => item.value === language);
  const selectedLabel = selectedLang ? selectedLang.nativeLabel : 'English';

  // Ensure we have a valid language value, fallback to 'en' if needed
  const safeLanguage =
    language && Object.keys(supportedLanguages).includes(language)
      ? language
      : 'en';

  return (
    <Dropdown
      style={{
        height: 50,
        borderColor: isDark ? '#444' : '#e0e0e0',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: isDark ? '#333' : '#f5f5f5',
      }}
      containerStyle={{
        borderRadius: 8,
        backgroundColor: isDark ? '#333' : '#fff',
        borderWidth: 1,
        borderColor: isDark ? '#444' : '#e0e0e0',
      }}
      itemContainerStyle={{
        borderBottomWidth: isDark ? 0.5 : 1,
        borderBottomColor: isDark ? '#444' : '#f0f0f0',
      }}
      activeColor={isDark ? '#444' : '#f0f0f0'}
      placeholderStyle={{ color: isDark ? '#aaa' : '#888' }}
      selectedTextStyle={{ color: isDark ? '#fff' : '#000' }}
      itemTextStyle={{ color: isDark ? '#fff' : '#000' }}
      data={languageOptions}
      maxHeight={300}
      labelField='nativeLabel'
      valueField='value'
      value={safeLanguage}
      onChange={handleLanguageSelect}
      renderItem={renderItem}
      renderLeftIcon={() => renderLeftIcon(safeLanguage)}
      placeholder={selectedLabel || 'Select Language'}
      search={false}
    />
  );
};

export default PreferencesLanguageSwitcher;
