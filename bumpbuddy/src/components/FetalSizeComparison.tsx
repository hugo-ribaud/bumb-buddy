import { Image, View } from 'react-native';

import FontedText from '@/components/FontedText';
import ThemedView from '@/components/ThemedView';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface FetalSizeComparisonProps {
  weekNumber: number;
  itemName: string;
  imageUrl: string;
  sizeInCm?: number;
  sizeInInches?: number;
  weightInG?: number;
  weightInOz?: number;
  compact?: boolean;
}

const FetalSizeComparison: React.FC<FetalSizeComparisonProps> = ({
  weekNumber,
  itemName = '',
  imageUrl = '',
  sizeInCm,
  sizeInInches,
  weightInG,
  weightInOz,
  compact = false,
}) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const { units } = usePreferences();

  const isMetric = units === 'metric';

  const getImageUrl = (url: string) => {
    // Handle missing URLs
    if (!url) return '';

    // If it's a full URL, use it directly
    if (url.startsWith('http')) {
      return url;
    }

    // Otherwise, assume it's a relative path
    return url;
  };

  // Format the item name to be displayed (capitalize)
  const formattedName = itemName
    ? itemName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : t('fetalSize.notAvailable');

  return (
    <ThemedView
      backgroundColor='surface'
      className={`rounded-xl overflow-hidden ${compact ? 'p-2' : 'p-4'}`}
    >
      <View className='flex-row items-center'>
        {imageUrl && (
          <View
            className={`${
              compact ? 'w-12 h-12' : 'w-20 h-20'
            } rounded-lg overflow-hidden mr-3 items-center justify-center`}
          >
            <Image
              source={{ uri: getImageUrl(imageUrl) }}
              className='w-full h-full'
              resizeMode='contain'
            />
          </View>
        )}
        <View className='flex-1'>
          <FontedText
            variant={compact ? 'body-small' : 'body'}
            className='font-semibold'
          >
            {formattedName}
          </FontedText>

          {!compact && (
            <View className='mt-1'>
              {(sizeInCm || sizeInInches) && (
                <FontedText variant='caption' colorVariant='primary'>
                  {t('fetalSize.sizeLabel')}:{' '}
                  {isMetric && sizeInCm ? `${sizeInCm} cm` : ''}
                  {isMetric && sizeInCm && sizeInInches ? '' : ''}
                  {!isMetric && sizeInInches ? `${sizeInInches} in` : ''}
                </FontedText>
              )}

              {(weightInG || weightInOz) && (
                <FontedText variant='caption' colorVariant='primary'>
                  {t('fetalSize.weightLabel')}:{' '}
                  {isMetric && weightInG ? `${weightInG} g` : ''}
                  {isMetric && weightInG && weightInOz ? ' ' : ''}
                  {!isMetric && weightInOz ? `${weightInOz} oz` : ''}
                </FontedText>
              )}
            </View>
          )}
        </View>
      </View>
    </ThemedView>
  );
};

export default FetalSizeComparison;
