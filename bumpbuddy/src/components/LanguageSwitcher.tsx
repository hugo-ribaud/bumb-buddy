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
    <View className="my-2.5">
      <Text className="text-base mb-2 font-medium">
        {t("settings.languageLabel")}
      </Text>

      <Pressable
        className="flex-row justify-between items-center p-3 bg-gray-100 rounded-lg border border-gray-200"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-base">{displayLanguage}</Text>
        <Text className="text-sm text-gray-600">▼</Text>
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-4/5 bg-white rounded-xl p-5 items-center shadow-md max-h-[70%]">
            <Text className="text-lg font-bold mb-4 text-center">
              {t("settings.languageLabel")}
            </Text>

            <FlatList
              data={languageOptions}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`flex-row items-center py-3 px-4 border-b border-gray-100 w-full ${
                    item.code === language ? "bg-blue-50" : ""
                  }`}
                  onPress={() => handleLanguageSelect(item.code)}
                >
                  <Text className="text-base flex-1">{item.nativeName}</Text>
                  {item.nativeName !== item.name && (
                    <Text className="text-sm text-gray-600 ml-2.5">
                      ({item.name})
                    </Text>
                  )}
                  {item.code === language && (
                    <Text className="text-lg text-blue-700 ml-2.5">✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              className="mt-5 py-2.5 px-5 bg-gray-100 rounded-lg"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-base text-gray-800">
                {t("common.buttons.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LanguageSwitcher;
