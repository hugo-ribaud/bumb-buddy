/**
 * Language Switcher Component
 * A component for switching between available languages
 * Uses react-native-element-dropdown for a more customizable experience
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, useColorScheme } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useLanguage } from '../contexts/LanguageContext';
import FontedText from './FontedText';
import LanguageFlag from './LanguageFlag';

interface LanguageOption {
  value: string;
  label: string;
  nativeLabel: string;
}

export const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
        <LanguageFlag languageCode={item.value} size='medium' />
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
          <View className='w-6 h-6 rounded-full bg-primary dark:bg-primary-dark items-center justify-center'>
            <FontedText className='text-white font-bold text-xs'>✓</FontedText>
          </View>
        )}
      </View>
    );
  };

  // Render the flag icon on the left side of the dropdown
  const renderLeftIcon = (languageCode: string) => {
    return (
      <View className='mr-2.5'>
        <LanguageFlag languageCode={languageCode} size='medium' />
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
    <View className='my-2.5'>
      <FontedText variant='body' className='mb-2 font-medium'>
        {t('settings.languageLabel')}
      </FontedText>

      <Dropdown
        style={{
          height: 56,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? '#374151' : '#e5e7eb',
          backgroundColor: isDark ? '#1f2937' : 'white',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDark ? 0.2 : 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
        containerStyle={{
          borderRadius: 12,
          backgroundColor: isDark ? '#1f2937' : 'white',
          borderWidth: 1,
          borderColor: isDark ? '#374151' : '#e5e7eb',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.25 : 0.1,
          shadowRadius: 5,
          elevation: 5,
        }}
        itemContainerStyle={{
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#374151' : '#f0f0f0',
        }}
        activeColor={isDark ? '#374151' : '#f9fafb'}
        selectedTextStyle={{
          fontSize: 16,
          fontWeight: '500',
          color: isDark ? '#f9fafb' : '#1f2937',
        }}
        placeholderStyle={{
          fontSize: 16,
          color: isDark ? '#9ca3af' : '#6b7280',
        }}
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
    </View>
  );
};

export default LanguageSwitcher;
