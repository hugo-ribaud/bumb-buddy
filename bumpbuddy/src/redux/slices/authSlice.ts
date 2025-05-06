import { PayloadAction, createSlice } from "@reduxjs/toolkit";

// Define types for our state
interface User {
  id: string;
  email: string;
  dueDate?: string;
  pregnancyWeek?: number;
  createdAt: string;
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
      action: PayloadAction<{ user: User; session: any }>
    ) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
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
  },
});

// Export actions and reducer
export const { authRequest, authSuccess, authFailure, logout, updateUser } =
  authSlice.actions;
export default authSlice.reducer;
