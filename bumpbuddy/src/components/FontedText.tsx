import ThemedText, { ThemedTextProps } from "./ThemedText";

import React from "react";

interface FontedTextProps extends Omit<ThemedTextProps, "variant"> {
  fontFamily?: "poppins" | "comfortaa";
  variant?:
    | "heading-1"
    | "heading-2"
    | "heading-3"
    | "heading-4"
    | "body"
    | "body-small"
    | "caption";
  colorVariant?: "primary" | "secondary" | "accent";
  textType?: "primary" | "secondary" | "muted";
}

// Component that renders text with theme colors and typography
const FontedText: React.FC<FontedTextProps> = ({
  fontFamily = "poppins",
  variant,
  colorVariant,
  textType,
  className = "",
  children,
  ...rest
}) => {
  // Build the typography class based on variant
  const getTypographyClass = () => {
    if (variant) {
      return `text-${variant}`;
    }
    return "";
  };

  // Build the font family class
  const getFontFamilyClass = () => {
    return `font-${fontFamily}`;
  };

  return (
    <ThemedText
      variant={colorVariant}
      textType={textType}
      className={`${getFontFamilyClass()} ${getTypographyClass()} ${className}`}
      {...rest}
    >
      {children}
    </ThemedText>
  );
};

export default FontedText;
