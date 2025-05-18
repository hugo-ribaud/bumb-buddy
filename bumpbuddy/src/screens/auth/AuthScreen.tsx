import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import {
  authFailure,
  authRequest,
  authSuccess,
} from "../../redux/slices/authSlice";

import { useDispatch } from "react-redux";
import FontedText from "../../components/FontedText";
import SafeAreaWrapper from "../../components/SafeAreaWrapper";
import ThemedView from "../../components/ThemedView";
import authService from "../../services/authService";

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const handleAuth = async () => {
    // Validate inputs
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    dispatch(authRequest());

    try {
      const result = isLogin
        ? await authService.signIn({ email, password })
        : await authService.signUp({ email, password });

      if (result.error) {
        dispatch(authFailure(result.error));
        Alert.alert("Error", result.error);
      } else {
        if (result.data?.user && result.data?.session) {
          dispatch(
            authSuccess({
              user: {
                id: result.data.user.id,
                email: result.data.user.email || "",
                createdAt:
                  result.data.user.created_at || new Date().toISOString(),
              },
              session: result.data.session,
            })
          );
        } else if (!isLogin) {
          // If signing up, show confirmation message
          Alert.alert(
            "Success",
            "Registration successful! Please check your email for confirmation."
          );
        }
      }
    } catch (error: any) {
      dispatch(authFailure(error.message));
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <ThemedView className="items-center justify-center flex-1 p-5">
        <FontedText variant="heading-1" className="mb-2">
          BumpBuddy
        </FontedText>
        <FontedText variant="body" colorVariant="secondary" className="mb-10">
          Your Pregnancy Companion
        </FontedText>

        <ThemedView className="w-full max-w-[400px]">
          <FontedText variant="heading-2" className="mb-5 text-center">
            {isLogin ? "Sign In" : "Create Account"}
          </FontedText>

          <TextInput
            className="p-4 mb-4 bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <TextInput
            className="p-4 mb-4 bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            className={`bg-primary rounded-lg p-4 items-center mt-2.5 ${
              loading ? "opacity-70" : ""
            }`}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <FontedText className="text-base font-bold text-white">
                {isLogin ? "Sign In" : "Sign Up"}
              </FontedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsLogin(!isLogin)}
            disabled={loading}
            className="mt-5"
          >
            <FontedText className="text-center text-primary">
              {isLogin
                ? "New user? Create an account"
                : "Already have an account? Sign in"}
            </FontedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </SafeAreaWrapper>
  );
};

export default AuthScreen;
