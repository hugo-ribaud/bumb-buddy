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

interface UpdateProfileParams {
  id: string;
  name?: string;
  dueDate?: string;
  pregnancyWeek?: number;
  appSettings?: {
    theme?: string;
    units?: string;
    language?: string;
  };
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

  // Update user profile
  updateProfile: async ({
    id,
    name,
    dueDate,
    pregnancyWeek,
    appSettings,
  }: UpdateProfileParams) => {
    try {
      // Get current user data to merge with updates
      const { data: currentUser, error: fetchError } = await supabase
        .from("users")
        .select("app_settings")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Build update object
      const updates: any = {};
      if (name !== undefined) updates.first_name = name;
      if (dueDate !== undefined) updates.due_date = dueDate;
      if (pregnancyWeek !== undefined) updates.pregnancy_week = pregnancyWeek;

      // Handle app settings update
      if (appSettings) {
        // Merge with existing settings instead of overwriting
        const currentSettings = currentUser.app_settings || {};
        const updatedSettings = { ...currentSettings };

        if (appSettings.theme !== undefined)
          updatedSettings.theme = appSettings.theme;
        if (appSettings.units !== undefined)
          updatedSettings.units = appSettings.units;
        if (appSettings.language !== undefined)
          updatedSettings.language = appSettings.language;

        updates.app_settings = updatedSettings;
      }

      // Make update if there's anything to update
      if (Object.keys(updates).length > 0) {
        const { data, error } = await supabase
          .from("users")
          .update(updates)
          .eq("id", id)
          .select();

        if (error) throw error;
        return { data, error: null };
      }

      return { data: currentUser, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || "Failed to update profile" };
    }
  },
};

export default authService;
