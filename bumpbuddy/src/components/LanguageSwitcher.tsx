/**
 * Language Switcher Component
 * A component for switching between available languages
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../contexts/LanguageContext";

interface LanguageOption {
  code: string;
  nativeName: string;
  name: string;
}

export const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);

  // Create array of language options
  const languageOptions: LanguageOption[] = Object.entries(
    supportedLanguages
  ).map(([code, { nativeName, name }]) => ({
    code,
    nativeName,
    name,
  }));

  const handleLanguageSelect = async (langCode: string) => {
    setModalVisible(false);
    if (langCode !== language) {
      await setLanguage(langCode);
    }
  };

  const displayLanguage =
    supportedLanguages[language as keyof typeof supportedLanguages]
      ?.nativeName || language;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t("settings.languageLabel")}</Text>

      <Pressable
        style={styles.languageSelector}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectedLanguage}>{displayLanguage}</Text>
        <Text style={styles.chevron}>▼</Text>
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("settings.languageLabel")}</Text>

            <FlatList
              data={languageOptions}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    item.code === language && styles.selectedOption,
                  ]}
                  onPress={() => handleLanguageSelect(item.code)}
                >
                  <Text style={styles.nativeName}>{item.nativeName}</Text>
                  {item.nativeName !== item.name && (
                    <Text style={styles.englishName}>({item.name})</Text>
                  )}
                  {item.code === language && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>
                {t("common.buttons.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  languageSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedLanguage: {
    fontSize: 16,
  },
  chevron: {
    fontSize: 14,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
  selectedOption: {
    backgroundColor: "#f0f7ff",
  },
  nativeName: {
    fontSize: 16,
    flex: 1,
  },
  englishName: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
  },
  checkmark: {
    fontSize: 18,
    color: "#0066cc",
    marginLeft: 10,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#333",
  },
});

export default LanguageSwitcher;
