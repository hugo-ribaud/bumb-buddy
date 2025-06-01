import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';

import { useTranslation } from 'react-i18next';
import FetalSizeComparison from '../components/FetalSizeComparison';
import FontedText from '../components/FontedText';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import ThemedView from '../components/ThemedView';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { fetchFetalSizeByWeek } from '../redux/slices/fetalSizeSlice';
import { fetchWeekData } from '../redux/slices/timelineSlice';

type Props = {};

const WeekDetailScreen: React.FC<Props> = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const { isDark } = useTheme();

  const { selectedWeek, weekData, loading, error } = useSelector(
    (state: RootState) => state.timeline
  );
  const fetalSize = useSelector(
    (state: RootState) => state.fetalSize.currentComparison
  );

  // Fetch week data on component mount and when language changes
  useEffect(() => {
    if (selectedWeek) {
      dispatch(fetchWeekData({ weekNumber: selectedWeek, language }));
      dispatch(fetchFetalSizeByWeek({ week: selectedWeek, language }));
    }
  }, [dispatch, selectedWeek, language]);

  // Determine the trimester
  const getTrimester = () => {
    if (!selectedWeek) return '';

    if (selectedWeek <= 13) {
      return t('timeline.firstTrimester');
    } else if (selectedWeek <= 26) {
      return t('timeline.secondTrimester');
    } else {
      return t('timeline.thirdTrimester');
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaWrapper>
        <ThemedView className='items-center justify-center flex-1'>
          <ActivityIndicator
            size='large'
            color={isDark ? '#C2AADF' : '#9B85C4'}
          />
          <FontedText variant='body' className='mt-4' textType='secondary'>
            {t('timeline.loading')}
          </FontedText>
        </ThemedView>
      </SafeAreaWrapper>
    );
  }

  // Error state
  if (error || !weekData) {
    return (
      <SafeAreaWrapper>
        <ThemedView className='items-center justify-center flex-1 p-6'>
          <FontedText
            variant='heading-3'
            colorVariant='accent'
            className='mb-4 text-center'
          >
            {error || t('timeline.weekNotFound')}
          </FontedText>
          <FontedText
            variant='body'
            textType='secondary'
            className='text-center'
          >
            {t('common.errors.generic')}
          </FontedText>
        </ThemedView>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <ThemedView className='flex-1'>
        <ScrollView
          className='flex-1'
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Header Section */}
          <View className='px-6 pt-2 pb-6'>
            <FontedText variant='heading-1' textType='primary' className='mb-2'>
              {t('timeline.weekLabel', { week: weekData.week })}
            </FontedText>
            <View className='flex-row items-center'>
              <ThemedView
                backgroundColor='surface-subtle'
                className='px-3 py-1 mr-3 rounded-full'
              >
                <FontedText variant='body-small' textType='muted'>
                  {getTrimester()}
                </FontedText>
              </ThemedView>
              <View
                className='px-3 py-1 rounded-full'
                style={{
                  backgroundColor: isDark ? '#065f46' : '#d1fae5',
                }}
              >
                <FontedText
                  variant='body-small'
                  className={isDark ? 'text-emerald-200' : 'text-emerald-800'}
                >
                  {t('timeline.weekLabel', { week: weekData.week })} of 40
                </FontedText>
              </View>
            </View>
          </View>

          {/* Fetal Size Comparison - Featured Card */}
          {fetalSize && (
            <View className='px-6 mb-6'>
              <ThemedView
                backgroundColor='surface-elevated'
                className='p-6 shadow-lg rounded-2xl'
                style={{
                  borderWidth: 1,
                  borderColor: isDark ? '#374151' : '#E5E7EB',
                }}
              >
                <FontedText
                  variant='heading-3'
                  className='mb-4'
                  textType='primary'
                >
                  {t('fetalSize.comparisonTitle')}
                </FontedText>
                <FetalSizeComparison
                  weekNumber={selectedWeek || 0}
                  itemName={fetalSize.name}
                  imageUrl={fetalSize.image_url}
                  sizeInCm={fetalSize.size_cm}
                  sizeInInches={fetalSize.size_inches}
                  weightInG={fetalSize.weight_g}
                  weightInOz={fetalSize.weight_oz}
                />
                {fetalSize.description && (
                  <View
                    className='pt-4 mt-4'
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: isDark ? '#374151' : '#E5E7EB',
                    }}
                  >
                    <FontedText
                      variant='body'
                      className='leading-6'
                      textType='secondary'
                    >
                      {fetalSize.description}
                    </FontedText>
                  </View>
                )}
              </ThemedView>
            </View>
          )}

          {/* Content Sections */}
          <View className='px-6 space-y-4'>
            {/* Development information */}
            <ThemedView
              backgroundColor='surface-elevated'
              className='p-5 shadow-sm rounded-xl'
              style={{
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#E5E7EB',
              }}
            >
              <View className='flex-row items-center mb-3'>
                <View
                  className='w-1 h-6 mr-3 rounded-full'
                  style={{
                    backgroundColor: isDark ? '#C2AADF' : '#9B85C4',
                  }}
                />
                <FontedText variant='heading-4' textType='primary'>
                  {t('timeline.development')}
                </FontedText>
              </View>
              <FontedText
                variant='body'
                className='leading-6'
                textType='secondary'
              >
                {weekData.fetal_development}
              </FontedText>
            </ThemedView>

            {/* Maternal changes */}
            <ThemedView
              backgroundColor='surface-elevated'
              className='p-5 shadow-sm rounded-xl'
              style={{
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#E5E7EB',
              }}
            >
              <View className='flex-row items-center mb-3'>
                <View
                  className='w-1 h-6 mr-3 rounded-full'
                  style={{
                    backgroundColor: isDark ? '#f59e0b' : '#f59e0b',
                  }}
                />
                <FontedText variant='heading-4' textType='primary'>
                  {t('timeline.maternalChanges')}
                </FontedText>
              </View>
              <FontedText
                variant='body'
                className='leading-6'
                textType='secondary'
              >
                {weekData.maternal_changes}
              </FontedText>
            </ThemedView>

            {/* Common symptoms */}
            <ThemedView
              backgroundColor='surface-elevated'
              className='p-5 shadow-sm rounded-xl'
              style={{
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#E5E7EB',
              }}
            >
              <View className='flex-row items-center mb-3'>
                <View
                  className='w-1 h-6 mr-3 rounded-full'
                  style={{
                    backgroundColor: isDark ? '#ec4899' : '#ec4899',
                  }}
                />
                <FontedText variant='heading-4' textType='primary'>
                  {t('timeline.commonSymptoms')}
                </FontedText>
              </View>
              <FontedText
                variant='body'
                className='leading-6'
                textType='secondary'
              >
                {weekData.common_symptoms}
              </FontedText>
            </ThemedView>

            {/* Tips */}
            <ThemedView
              backgroundColor='surface-elevated'
              className='p-5 shadow-sm rounded-xl'
              style={{
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#E5E7EB',
              }}
            >
              <View className='flex-row items-center mb-3'>
                <View
                  className='w-1 h-6 mr-3 rounded-full'
                  style={{
                    backgroundColor: isDark ? '#10b981' : '#10b981',
                  }}
                />
                <FontedText variant='heading-4' textType='primary'>
                  {t('timeline.tips')}
                </FontedText>
              </View>
              <FontedText
                variant='body'
                className='leading-6'
                textType='secondary'
              >
                {weekData.tips}
              </FontedText>
            </ThemedView>

            {/* Nutrition advice */}
            <ThemedView
              backgroundColor='surface-elevated'
              className='p-5 shadow-sm rounded-xl'
              style={{
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#E5E7EB',
              }}
            >
              <View className='flex-row items-center mb-3'>
                <View
                  className='w-1 h-6 mr-3 rounded-full'
                  style={{
                    backgroundColor: isDark ? '#8b5cf6' : '#8b5cf6',
                  }}
                />
                <FontedText variant='heading-4' textType='primary'>
                  {t('timeline.nutritionAdvice')}
                </FontedText>
              </View>
              <FontedText
                variant='body'
                className='leading-6'
                textType='secondary'
              >
                {weekData.nutrition_advice}
              </FontedText>
            </ThemedView>

            {/* Medical checkups */}
            <ThemedView
              backgroundColor='surface-elevated'
              className='p-5 shadow-sm rounded-xl'
              style={{
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#E5E7EB',
              }}
            >
              <View className='flex-row items-center mb-3'>
                <View
                  className='w-1 h-6 mr-3 rounded-full'
                  style={{
                    backgroundColor: isDark ? '#ef4444' : '#ef4444',
                  }}
                />
                <FontedText variant='heading-4' textType='primary'>
                  {t('timeline.medicalCheckups')}
                </FontedText>
              </View>
              <FontedText
                variant='body'
                className='leading-6'
                textType='secondary'
              >
                {weekData.medical_checkups}
              </FontedText>
            </ThemedView>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaWrapper>
  );
};

export default WeekDetailScreen;
