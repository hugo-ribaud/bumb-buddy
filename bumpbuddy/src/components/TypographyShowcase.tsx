import FontedText from '@/components/FontedText';
import ThemedView from '@/components/ThemedView';
import React from 'react';
import { ScrollView } from 'react-native';

interface TypographyShowcaseProps {
  className?: string;
}

// Component to showcase all typography styles
const TypographyShowcase: React.FC<TypographyShowcaseProps> = ({
  className = '',
}) => {
  return (
    <ScrollView className={`p-4 ${className}`}>
      <ThemedView backgroundColor='surface' className='p-4 mb-6 rounded-xl'>
        <FontedText variant='heading-3' className='mb-4'>
          Poppins Font Family
        </FontedText>

        <FontedText variant='heading-1' fontFamily='poppins' className='mb-3'>
          Heading 1 - 28px Bold
        </FontedText>

        <FontedText variant='heading-2' fontFamily='poppins' className='mb-3'>
          Heading 2 - 24px SemiBold
        </FontedText>

        <FontedText variant='heading-3' fontFamily='poppins' className='mb-3'>
          Heading 3 - 20px SemiBold
        </FontedText>

        <FontedText variant='heading-4' fontFamily='poppins' className='mb-3'>
          Heading 4 - 18px Medium
        </FontedText>

        <FontedText variant='body' fontFamily='poppins' className='mb-3'>
          Body - This is body text at 16px with normal weight. It's used for
          regular paragraph text throughout the app.
        </FontedText>

        <FontedText variant='body-small' fontFamily='poppins' className='mb-3'>
          Body Small - This is smaller body text at 14px with normal weight.
          It's used for secondary information.
        </FontedText>

        <FontedText variant='caption' fontFamily='poppins'>
          Caption - This is caption text at 12px. Used for labels and very small
          text elements.
        </FontedText>
      </ThemedView>

      <ThemedView backgroundColor='surface' className='p-4 mb-6 rounded-xl'>
        <FontedText variant='heading-3' className='mb-4'>
          Comfortaa Font Family
        </FontedText>

        <FontedText variant='heading-1' fontFamily='comfortaa' className='mb-3'>
          Heading 1 - 28px Bold
        </FontedText>

        <FontedText variant='heading-2' fontFamily='comfortaa' className='mb-3'>
          Heading 2 - 24px SemiBold
        </FontedText>

        <FontedText variant='heading-3' fontFamily='comfortaa' className='mb-3'>
          Heading 3 - 20px SemiBold
        </FontedText>

        <FontedText variant='heading-4' fontFamily='comfortaa' className='mb-3'>
          Heading 4 - 18px Medium
        </FontedText>

        <FontedText variant='body' fontFamily='comfortaa' className='mb-3'>
          Body - This is body text at 16px with normal weight. It's used for
          regular paragraph text throughout the app.
        </FontedText>

        <FontedText
          variant='body-small'
          fontFamily='comfortaa'
          className='mb-3'
        >
          Body Small - This is smaller body text at 14px with normal weight.
          It's used for secondary information.
        </FontedText>

        <FontedText variant='caption' fontFamily='comfortaa'>
          Caption - This is caption text at 12px. Used for labels and very small
          text elements.
        </FontedText>
      </ThemedView>

      <ThemedView backgroundColor='surface' className='p-4 rounded-xl'>
        <FontedText variant='heading-3' className='mb-4'>
          Theme Colors
        </FontedText>

        <FontedText variant='body' textType='primary' className='mb-2'>
          Primary Text - Default text color
        </FontedText>

        <FontedText variant='body' textType='secondary' className='mb-2'>
          Secondary Text - Subdued text color
        </FontedText>

        <FontedText variant='body' colorVariant='primary' className='mb-2'>
          Primary Brand Color
        </FontedText>

        <FontedText variant='body' colorVariant='secondary' className='mb-2'>
          Secondary Brand Color
        </FontedText>

        <FontedText variant='body' colorVariant='accent'>
          Accent Brand Color
        </FontedText>
      </ThemedView>
    </ScrollView>
  );
};

export default TypographyShowcase;
