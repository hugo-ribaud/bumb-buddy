/// <reference types="nativewind/types" />

import 'react-native';

declare module 'react-native' {
  interface TextProps {
    className?: string;
  }

  interface ViewProps {
    className?: string;
  }
}
