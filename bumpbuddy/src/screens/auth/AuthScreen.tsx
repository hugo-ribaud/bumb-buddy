import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import {
  authFailure,
  authRequest,
  authSuccess,
} from "../../redux/slices/authSlice";
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
    <View style={styles.container}>
      <Text style={styles.title}>BumpBuddy</Text>
      <Text style={styles.subtitle}>Your Pregnancy Companion</Text>

      <View style={styles.form}>
        <Text style={styles.formTitle}>
          {isLogin ? "Sign In" : "Create Account"}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {isLogin ? "Sign In" : "Sign Up"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsLogin(!isLogin)}
          disabled={loading}
        >
          <Text style={styles.switchText}>
            {isLogin
              ? "New user? Create an account"
              : "Already have an account? Sign in"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#6c757d",
    marginBottom: 40,
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ced4da",
  },
  button: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#7fb7f5",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchText: {
    color: "#007bff",
    textAlign: "center",
    marginTop: 20,
  },
});

export default AuthScreen;
