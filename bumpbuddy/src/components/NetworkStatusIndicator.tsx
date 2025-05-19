import React, { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { formatDistance } from "date-fns";
import { useTranslation } from "react-i18next";
import { useNetwork } from "../contexts/NetworkContext";
import { useTheme } from "../contexts/ThemeContext";

interface NetworkStatusIndicatorProps {
  showOfflineOnly?: boolean;
  showSyncStatus?: boolean;
}

const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  showOfflineOnly = false,
  showSyncStatus = true,
}) => {
  const { t } = useTranslation();
  const { isConnected, isOffline, pendingSyncCount, lastOnlineTime } =
    useNetwork();
  const { isDarkMode } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Format the last online time
  const formattedLastOnline = lastOnlineTime
    ? formatDistance(new Date(lastOnlineTime), new Date(), { addSuffix: true })
    : t("network.unknown");

  // Show the indicator if offline or if pending sync operations
  useEffect(() => {
    if (showOfflineOnly) {
      setVisible(isOffline);
    } else {
      setVisible(isOffline || pendingSyncCount > 0);
    }
  }, [isOffline, pendingSyncCount, showOfflineOnly]);

  // Animate the indicator
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  // If nothing to show, return null
  if (!visible && (!showSyncStatus || pendingSyncCount === 0)) {
    return null;
  }

  // Define colors based on theme
  const backgroundColor = isDarkMode
    ? isOffline
      ? "#33272b"
      : "#263333"
    : isOffline
    ? "#ffe5e5"
    : "#e5f0f0";

  const textColor = isDarkMode
    ? isOffline
      ? "#ff8080"
      : "#80ffdd"
    : isOffline
    ? "#dd2020"
    : "#207560";

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, backgroundColor },
        expanded && styles.expanded,
      ]}
    >
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={styles.pressable}
      >
        <View style={styles.content}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOffline ? "#ff4040" : "#40c060" },
            ]}
          />

          <Text style={[styles.statusText, { color: textColor }]}>
            {isOffline
              ? t("network.offline")
              : pendingSyncCount > 0
              ? t("network.syncPending", { count: pendingSyncCount })
              : t("network.online")}
          </Text>
        </View>

        {expanded && (
          <View style={styles.expandedContent}>
            {/* Last online time */}
            {isOffline && lastOnlineTime && (
              <Text style={[styles.detailText, { color: textColor }]}>
                {t("network.lastOnline")}: {formattedLastOnline}
              </Text>
            )}

            {/* Sync queue details */}
            {showSyncStatus && pendingSyncCount > 0 && !isOffline && (
              <Text style={[styles.detailText, { color: textColor }]}>
                {t("network.pendingSync", { count: pendingSyncCount })}
              </Text>
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    zIndex: 1000,
  },
  expanded: {
    paddingVertical: 10,
  },
  pressable: {
    flex: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  expandedContent: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  detailText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default NetworkStatusIndicator;
