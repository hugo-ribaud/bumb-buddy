/**
 * DirectionalView Component
 * A View component that adapts to RTL direction changes
 */

import React, { useMemo } from "react";
import { StyleProp, TextStyle, View, ViewProps, ViewStyle } from "react-native";

import { useRTL } from "../contexts/RTLContext";

// RTL-aware style properties that need to be flipped
const RTL_FLIPPABLE_PROPERTIES = [
  "marginStart",
  "marginEnd",
  "paddingStart",
  "paddingEnd",
  "borderStartWidth",
  "borderEndWidth",
  "borderStartColor",
  "borderEndColor",
  "borderTopStartRadius",
  "borderTopEndRadius",
  "borderBottomStartRadius",
  "borderBottomEndRadius",
  "start",
  "end",
];

// Convert style values between LTR and RTL
const convertStyleForRTL = (
  style: ViewStyle | TextStyle
): ViewStyle | TextStyle => {
  // Clone the style object to avoid mutating the original
  const result = { ...style };

  // Flip left/right properties
  if (style.left !== undefined) {
    result.right = style.left;
    delete result.left;
  } else if (style.right !== undefined) {
    result.left = style.right;
    delete result.right;
  }

  // Handle flexDirection
  if (style.flexDirection === "row") {
    result.flexDirection = "row-reverse";
  } else if (style.flexDirection === "row-reverse") {
    result.flexDirection = "row";
  }

  // Handle text alignment (only if TextStyle)
  const textStyle = style as TextStyle;
  if (textStyle.textAlign === "left") {
    (result as TextStyle).textAlign = "right";
  } else if (textStyle.textAlign === "right") {
    (result as TextStyle).textAlign = "left";
  }

  // Handle RTL logical properties
  for (const prop of RTL_FLIPPABLE_PROPERTIES) {
    if (style[prop as keyof typeof style] !== undefined) {
      const value = style[prop as keyof typeof style];
      const oppositeKey = prop
        .replace("Start", "TEMP")
        .replace("End", "Start")
        .replace("TEMP", "End");

      // Apply to opposite side
      (result as any)[oppositeKey] = value;
      delete result[prop as keyof typeof result];
    }
  }

  return result;
};

interface DirectionalViewProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const DirectionalView: React.FC<DirectionalViewProps> = ({
  style,
  children,
  ...props
}) => {
  const { isRTL } = useRTL();

  // Process the style to handle RTL
  const directionalStyle = useMemo(() => {
    if (!style || !isRTL) return style;

    // Handle arrays of styles
    if (Array.isArray(style)) {
      return style.map((s) =>
        typeof s === "object" && s !== null
          ? convertStyleForRTL(s as ViewStyle)
          : s
      );
    }

    // Handle single style object
    return convertStyleForRTL(style as ViewStyle);
  }, [style, isRTL]);

  return (
    <View style={directionalStyle} {...props}>
      {children}
    </View>
  );
};

export default DirectionalView;
