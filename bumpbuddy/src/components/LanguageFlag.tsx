import { Text, View, useColorScheme } from 'react-native';

import React from 'react';
import { getLanguageFlag } from '../i18n/languages';

interface LanguageFlagProps {
  languageCode: string;
  size?: 'small' | 'medium' | 'large';
}

// Flag component using emoji flags from the language context
const LanguageFlag: React.FC<LanguageFlagProps> = ({
  languageCode,
  size = 'medium',
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Size mapping
  const sizeMap = {
    small: 18,
    medium: 28,
    large: 42,
  };

  const fontSize = sizeMap[size];
  const containerSize = fontSize * 1.2;

  // Get the flag from language settings
  const flag = getLanguageFlag(languageCode);

  return (
    <View
      className={`items-center justify-center rounded-full overflow-hidden ${
        isDark
          ? 'bg-[#333] border-[#555] border-[0.5px]'
          : 'bg-white border border-[#f0f0f0]'
      } ${isDark ? 'shadow-sm' : 'shadow'}`}
      style={{
        height: containerSize,
        width: containerSize,
      }}
    >
      <Text style={{ fontSize }}>{flag}</Text>
    </View>
  );
};

export default LanguageFlag;
