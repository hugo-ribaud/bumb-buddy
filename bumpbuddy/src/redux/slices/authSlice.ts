import { PayloadAction, createSlice } from "@reduxjs/toolkit";

// Define types for our state
interface User {
  id: string;
  email: string;
  name?: string;
  dueDate?: string;
  pregnancyWeek?: number;
  createdAt: string;
}

// These are the database field names used for consistency
interface DatabaseUser {
  id: string;
  email: string;
  first_name?: string;
  due_date?: string;
  pregnancy_week?: number;
  created_at: string;
}

interface AuthState {
  user: User | null;
  session: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Create the slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Auth request started
    authRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    // Auth success (login/signup)
    authSuccess: (
      state,
      action: PayloadAction<{
        user: DatabaseUser;
        session: any;
      }>
    ) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      // Map DB fields to our User interface
      state.user = {
        id: action.payload.user.id,
        email: action.payload.user.email,
        name: action.payload.user.first_name,
        dueDate: action.payload.user.due_date,
        pregnancyWeek: action.payload.user.pregnancy_week,
        createdAt: action.payload.user.created_at,
      };
      state.session = action.payload.session;
      state.error = null;
    },
    // Auth failure
    authFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    // Logout
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.session = null;
    },
    // Update user profile
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    // Update user profile with database fields
    updateUserFromDB: (state, action: PayloadAction<Partial<DatabaseUser>>) => {
      if (state.user) {
        // Map DB fields to our User interface
        const updates: Partial<User> = {};

        if (action.payload.id !== undefined) updates.id = action.payload.id;
        if (action.payload.email !== undefined)
          updates.email = action.payload.email;
        if (action.payload.first_name !== undefined)
          updates.name = action.payload.first_name;
        if (action.payload.due_date !== undefined)
          updates.dueDate = action.payload.due_date;
        if (action.payload.pregnancy_week !== undefined)
          updates.pregnancyWeek = action.payload.pregnancy_week;
        if (action.payload.created_at !== undefined)
          updates.createdAt = action.payload.created_at;

        state.user = { ...state.user, ...updates };
      }
    },
  },
});

// Export actions and reducer
export const {
  authRequest,
  authSuccess,
  authFailure,
  logout,
  updateUser,
  updateUserFromDB,
} = authSlice.actions;
export default authSlice.reducer;
