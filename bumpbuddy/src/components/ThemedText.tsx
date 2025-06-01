import { Text, TextProps } from 'react-native';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export interface ThemedTextProps extends TextProps {
  variant?: 'primary' | 'secondary' | 'accent';
  textType?: 'primary' | 'secondary' | 'muted';
  className?: string;
}

// Component that renders a Text with theme-appropriate colors
const ThemedText: React.FC<ThemedTextProps> = ({
  variant,
  textType = 'primary',
  className = '',
  children,
  ...rest
}) => {
  const { isDark } = useTheme();

  // Get the text color based on variant and textType
  const getTextColorClass = () => {
    // Text variant color (for colored text like primary, secondary, etc.)
    if (variant) {
      switch (variant) {
        case 'primary':
          return isDark ? 'text-primary-dark' : 'text-primary-readable';
        case 'secondary':
          return isDark ? 'text-secondary-dark' : 'text-secondary-readable';
        case 'accent':
          return isDark ? 'text-accent-dark' : 'text-accent-readable';
      }
    }

    // Regular text color with improved contrast
    switch (textType) {
      case 'primary':
        return isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
      case 'secondary':
        return isDark
          ? 'text-text-secondary-dark'
          : 'text-text-secondary-light';
      case 'muted':
        return isDark ? 'text-text-muted-dark' : 'text-text-muted-light';
      default:
        return isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    }
  };

  return (
    <Text className={`${getTextColorClass()} ${className}`} {...rest}>
      {children}
    </Text>
  );
};

export default ThemedText;
