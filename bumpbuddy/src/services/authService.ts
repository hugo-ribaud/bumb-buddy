import supabase from "../config/supabaseConfig";

// Define types
interface SignUpParams {
  email: string;
  password: string;
}

interface SignInParams {
  email: string;
  password: string;
}

// Authentication service
const authService = {
  // Sign up a new user
  signUp: async ({ email, password }: SignUpParams) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || "Failed to sign up" };
    }
  },

  // Sign in an existing user
  signIn: async ({ email, password }: SignInParams) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || "Failed to sign in" };
    }
  },

  // Sign out the current user
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message || "Failed to sign out" };
    }
  },

  // Get the current session
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || "Failed to get session" };
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "bumpbuddy://reset-password",
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || "Failed to reset password" };
    }
  },
};

export default authService;
