import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllWeeks,
  fetchCurrentWeekData,
  selectWeek,
} from '../redux/slices/timelineSlice';
import { AppDispatch, RootState } from '../redux/store';

import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import FontedText from '../components/FontedText';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import ThemedView from '../components/ThemedView';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { fetchAllFetalSizes } from '../redux/slices/fetalSizeSlice';
import timelineService from '../services/timelineService';

type Props = {};

const TimelineScreen: React.FC<Props> = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);
  const [refreshing, setRefreshing] = useState(false);
  const { isDark } = useTheme();

  const { currentWeek, allWeeks, loading, error } = useSelector(
    (state: RootState) => state.timeline
  );
  const fetalSizeData = useSelector(
    (state: RootState) => state.fetalSize.allComparisons
  );
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch weeks data on component mount and when language changes
  useEffect(() => {
    dispatch(fetchAllWeeks(language));
    dispatch(fetchAllFetalSizes(language));
    if (user?.dueDate) {
      dispatch(fetchCurrentWeekData({ dueDate: user.dueDate, language }));
    }
  }, [dispatch, user?.dueDate, language]);

  // Handle cache clearing and data refresh
  const handleClearCache = async () => {
    try {
      setRefreshing(true);
      await timelineService.clearCache();
      // Refresh data after clearing cache
      await dispatch(fetchAllWeeks(language)).unwrap();
      if (user?.dueDate) {
        await dispatch(
          fetchCurrentWeekData({ dueDate: user.dueDate, language })
        ).unwrap();
      }
      Alert.alert(t('common.labels.success'), t('timeline.refreshSuccess'));
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert(t('common.errors.generic'), t('timeline.refreshError'));
    } finally {
      setRefreshing(false);
    }
  };

  // Filter weeks by trimester
  const filteredWeeks = allWeeks.filter(week => {
    if (activeTab === 1) return week.week >= 1 && week.week <= 13;
    if (activeTab === 2) return week.week >= 14 && week.week <= 26;
    return week.week >= 27 && week.week <= 40;
  });

  // Handle week selection
  const handleWeekSelect = (weekNumber: number) => {
    dispatch(selectWeek(weekNumber));
    navigation.navigate('WeekDetail' as never);
  };

  // Get trimester info
  const getTrimesterInfo = (tabNumber: 1 | 2 | 3) => {
    const ranges = {
      1: { start: 1, end: 13, weeks: 13 },
      2: { start: 14, end: 26, weeks: 13 },
      3: { start: 27, end: 40, weeks: 14 },
    };

    const range = ranges[tabNumber];
    const completedWeeks =
      Math.min(currentWeek || 0, range.end) - range.start + 1;
    const progress = Math.max(
      0,
      Math.min(100, (completedWeeks / range.weeks) * 100)
    );

    return { progress, completedWeeks, totalWeeks: range.weeks };
  };

  // Render each week item
  const renderWeekItem = ({ item }: { item: any }) => {
    const isCurrentWeek = item.week === currentWeek;
    const isPastWeek = (currentWeek || 0) > item.week;
    const weekFetalSize = fetalSizeData.find(size => size.week === item.week);

    return (
      <Pressable
        className={`mx-5 mb-4 rounded-2xl shadow-sm overflow-hidden ${
          isCurrentWeek ? 'shadow-lg' : ''
        }`}
        style={{
          backgroundColor: isDark ? '#1f2937' : '#FFFFFF',
          elevation: isCurrentWeek ? 4 : 2,
          borderWidth: isCurrentWeek ? 2 : 1,
          borderColor: isCurrentWeek
            ? isDark
              ? '#C2AADF'
              : '#9B85C4'
            : isDark
              ? '#374151'
              : '#E5E7EB',
        }}
        onPress={() => handleWeekSelect(item.week)}
      >
        {/* Current week indicator */}
        {isCurrentWeek && (
          <ThemedView backgroundColor='surface-subtle' className='px-4 py-2'>
            <FontedText
              variant='body-small'
              textType='primary'
              className='font-semibold text-center'
              style={{
                color: isDark ? '#C2AADF' : '#9B85C4',
              }}
            >
              {t('timeline.currentWeek')}
            </FontedText>
          </ThemedView>
        )}

        <View className='p-5'>
          {/* Week header */}
          <View className='flex-row items-center justify-between mb-4'>
            <View className='flex-row items-center'>
              <View
                className='items-center justify-center w-12 h-12 mr-3 overflow-hidden rounded-full'
                style={{
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  borderWidth: isCurrentWeek ? 2 : isPastWeek ? 1 : 0,
                  borderColor: isCurrentWeek
                    ? isDark
                      ? '#C2AADF'
                      : '#9B85C4'
                    : isPastWeek
                      ? isDark
                        ? '#059669'
                        : '#10b981'
                      : 'transparent',
                }}
              >
                {weekFetalSize?.image_url ? (
                  <Image
                    source={{ uri: weekFetalSize.image_url }}
                    className='w-full h-full'
                    resizeMode='cover'
                  />
                ) : (
                  <FontedText
                    variant='body-small'
                    className={
                      isCurrentWeek || isPastWeek
                        ? isDark
                          ? 'text-purple-300'
                          : 'text-purple-600'
                        : isDark
                          ? 'text-gray-300'
                          : 'text-gray-600'
                    }
                  >
                    {item.week}
                  </FontedText>
                )}
              </View>
              <View>
                <FontedText variant='heading-4' textType='primary'>
                  {t('timeline.weekLabel', { week: item.week })}
                </FontedText>
                {isPastWeek && (
                  <FontedText
                    variant='caption'
                    className={isDark ? 'text-emerald-400' : 'text-emerald-600'}
                  >
                    ✓ {t('timeline.completed')}
                  </FontedText>
                )}
              </View>
            </View>

            {/* Progress indicator */}
            <View className='items-end'>
              <FontedText variant='caption' textType='muted'>
                {item.week}/40
              </FontedText>
              <View
                className='w-16 h-1 mt-1 rounded-full'
                style={{
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                }}
              >
                <View
                  className='h-1 rounded-full'
                  style={{
                    width: `${(item.week / 40) * 100}%`,
                    backgroundColor: isCurrentWeek
                      ? isDark
                        ? '#C2AADF'
                        : '#9B85C4'
                      : isPastWeek
                        ? isDark
                          ? '#059669'
                          : '#10b981'
                        : isDark
                          ? '#6b7280'
                          : '#9ca3af',
                  }}
                />
              </View>
            </View>
          </View>

          {/* Development preview */}
          <ThemedView
            backgroundColor='surface-subtle'
            className='p-3 rounded-xl'
          >
            <FontedText
              variant='body-small'
              textType='secondary'
              numberOfLines={3}
              className='leading-5'
            >
              {item.fetal_development}
            </FontedText>
          </ThemedView>

          {/* View details button */}
          <View
            className='pt-4 mt-4'
            style={{
              borderTopWidth: 1,
              borderTopColor: isDark ? '#374151' : '#E5E7EB',
            }}
          >
            <FontedText
              variant='body-small'
              className={`text-center font-medium ${
                isDark ? 'text-purple-300' : 'text-purple-600'
              }`}
            >
              {t('timeline.viewWeekDetails')} →
            </FontedText>
          </View>
        </View>
      </Pressable>
    );
  };

  // Handle tab change
  const handleTabChange = (tab: 1 | 2 | 3) => {
    setActiveTab(tab);
  };

  return (
    <SafeAreaWrapper>
      <ThemedView className='flex-1'>
        {/* Header */}
        <View className='px-6 pt-4 pb-6'>
          <View className='flex-row items-center justify-between mb-2'>
            <FontedText variant='heading-1' textType='primary'>
              {t('timeline.title')}
            </FontedText>
            <TouchableOpacity
              className='px-4 py-2 rounded-xl'
              style={{
                backgroundColor: isDark ? '#374151' : '#f3f4f6',
              }}
              onPress={handleClearCache}
              disabled={refreshing}
            >
              <FontedText
                variant='body-small'
                textType='primary'
                className='font-medium'
              >
                {refreshing ? t('timeline.refreshing') : t('timeline.refresh')}
              </FontedText>
            </TouchableOpacity>
          </View>

          {/* Statistics */}
          <View className='flex-row items-center space-x-2'>
            <FontedText variant='body-small' textType='muted'>
              {t('timeline.weeksLoaded', {
                total: allWeeks.length,
                filtered: filteredWeeks.length,
              })}
            </FontedText>
            {currentWeek && (
              <>
                <FontedText variant='body-small' textType='muted'>
                  •
                </FontedText>
                <FontedText variant='body-small' textType='muted'>
                  {t('timeline.currentWeekStatus', { week: currentWeek })}
                </FontedText>
              </>
            )}
          </View>
        </View>

        {/* Trimester tabs */}
        <View className='px-6 mb-6'>
          <View
            className='flex-row overflow-hidden rounded-2xl'
            style={{
              backgroundColor: isDark ? '#374151' : '#f3f4f6',
            }}
          >
            {[1, 2, 3].map(tab => {
              const trimesterInfo = getTrimesterInfo(tab as 1 | 2 | 3);
              const isActive = activeTab === tab;

              return (
                <Pressable
                  key={tab}
                  className='flex-1 px-3 py-4'
                  style={{
                    backgroundColor: isActive
                      ? isDark
                        ? '#9B85C4'
                        : '#C2AADF'
                      : 'transparent',
                  }}
                  onPress={() => handleTabChange(tab as 1 | 2 | 3)}
                >
                  <FontedText
                    variant='body-small'
                    className={`text-center font-semibold mb-1 ${
                      isActive
                        ? 'text-white'
                        : isDark
                          ? 'text-gray-300'
                          : 'text-gray-600'
                    }`}
                  >
                    {tab === 1 && t('timeline.firstTrimester')}
                    {tab === 2 && t('timeline.secondTrimester')}
                    {tab === 3 && t('timeline.thirdTrimester')}
                  </FontedText>

                  {/* Progress bar */}
                  <View
                    className='h-1 mx-2 rounded-full'
                    style={{
                      backgroundColor: isActive
                        ? 'rgba(255,255,255,0.3)'
                        : isDark
                          ? '#4b5563'
                          : '#d1d5db',
                    }}
                  >
                    <View
                      className='h-1 rounded-full'
                      style={{
                        width: `${trimesterInfo.progress}%`,
                        backgroundColor: isActive
                          ? 'white'
                          : isDark
                            ? '#6b7280'
                            : '#9ca3af',
                      }}
                    />
                  </View>

                  <FontedText
                    variant='caption'
                    className={`text-center mt-1 ${
                      isActive
                        ? 'text-white opacity-90'
                        : isDark
                          ? 'text-gray-400'
                          : 'text-gray-500'
                    }`}
                  >
                    {trimesterInfo.completedWeeks}/{trimesterInfo.totalWeeks}
                  </FontedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {loading || refreshing ? (
          <View className='items-center justify-center flex-1'>
            <ActivityIndicator
              size='large'
              color={isDark ? '#C2AADF' : '#9B85C4'}
            />
            <FontedText
              variant='body'
              className='mt-4'
              colorVariant='secondary'
            >
              {t('timeline.loading')}
            </FontedText>
          </View>
        ) : error ? (
          <View className='items-center justify-center flex-1 px-6'>
            <FontedText
              variant='heading-3'
              colorVariant='accent'
              className='mb-4 text-center'
            >
              {t('common.errors.generic')}
            </FontedText>
            <FontedText
              variant='body'
              colorVariant='secondary'
              className='text-center'
            >
              {error}
            </FontedText>
          </View>
        ) : (
          <FlatList
            data={filteredWeeks}
            renderItem={renderWeekItem}
            keyExtractor={item => item.week.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </ThemedView>
    </SafeAreaWrapper>
  );
};

export default TimelineScreen;
