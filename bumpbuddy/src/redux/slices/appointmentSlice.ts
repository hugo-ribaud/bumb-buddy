import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Appointment, AppointmentInput } from "../../types/appointment";

import appointmentService from "../../services/appointmentService";
import { RootState } from "../store";

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  selectedAppointment: Appointment | null;
  lastSync: string | null;
}

const initialState: AppointmentState = {
  appointments: [],
  loading: false,
  error: null,
  selectedAppointment: null,
  lastSync: null,
};

// Async thunks for fetching appointments
export const fetchAppointments = createAsyncThunk(
  "appointments/fetchAppointments",
  async (userId: string, { rejectWithValue }) => {
    try {
      const appointments = await appointmentService.getAppointments(userId);
      return appointments;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for creating an appointment
export const createAppointment = createAsyncThunk(
  "appointments/createAppointment",
  async (appointment: AppointmentInput, { rejectWithValue }) => {
    try {
      const newAppointment = await appointmentService.saveAppointment(
        appointment
      );
      return newAppointment;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating an appointment
export const updateAppointment = createAsyncThunk(
  "appointments/updateAppointment",
  async (
    { id, appointment }: { id: string; appointment: Partial<Appointment> },
    { rejectWithValue }
  ) => {
    try {
      const updatedAppointment = await appointmentService.updateAppointment(
        id,
        appointment
      );
      return updatedAppointment;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting an appointment
export const deleteAppointment = createAsyncThunk(
  "appointments/deleteAppointment",
  async (id: string, { rejectWithValue }) => {
    try {
      await appointmentService.deleteAppointment(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for checking external appointments (like Doctolib)
export const checkExternalAppointments = createAsyncThunk(
  "appointments/checkExternalAppointments",
  async (userId: string, { rejectWithValue }) => {
    try {
      const externalAppointments =
        await appointmentService.checkExternalAppointments(userId);
      return externalAppointments;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const appointmentSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {
    selectAppointment: (state, action: PayloadAction<Appointment | null>) => {
      state.selectedAppointment = action.payload;
    },
    clearAppointmentError: (state) => {
      state.error = null;
    },
    updateLastSync: (state) => {
      state.lastSync = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
        state.lastSync = new Date().toISOString();
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create appointment
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments.push(action.payload);
        // Sort appointments by date
        state.appointments.sort(
          (a, b) =>
            new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
        );
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update appointment
      .addCase(updateAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.appointments.findIndex(
          (appointment) => appointment.id === action.payload.id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        // Sort appointments by date
        state.appointments.sort(
          (a, b) =>
            new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
        );
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete appointment
      .addCase(deleteAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = state.appointments.filter(
          (appointment) => appointment.id !== action.payload
        );
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Check external appointments
      .addCase(checkExternalAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkExternalAppointments.fulfilled, (state, action) => {
        state.loading = false;
        // Merge external appointments with local ones
        // Only add appointments that don't exist locally
        const externalIds = action.payload.map((appt) => appt.external_id);
        const filteredAppointments = state.appointments.filter(
          (appt) => !appt.external_id || !externalIds.includes(appt.external_id)
        );
        state.appointments = [...filteredAppointments, ...action.payload];
        // Sort appointments by date
        state.appointments.sort(
          (a, b) =>
            new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
        );
        state.lastSync = new Date().toISOString();
      })
      .addCase(checkExternalAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and selectors
export const { selectAppointment, clearAppointmentError, updateLastSync } =
  appointmentSlice.actions;

// Selectors
export const selectAllAppointments = (state: RootState) =>
  state.appointment.appointments;
export const selectAppointmentLoading = (state: RootState) =>
  state.appointment.loading;
export const selectAppointmentError = (state: RootState) =>
  state.appointment.error;
export const selectSelectedAppointment = (state: RootState) =>
  state.appointment.selectedAppointment;
export const selectUpcomingAppointments = (state: RootState) => {
  const now = new Date();
  return state.appointment.appointments
    .filter((appointment) => new Date(appointment.date_time) >= now)
    .sort(
      (a, b) =>
        new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    );
};
export const selectPastAppointments = (state: RootState) => {
  const now = new Date();
  return state.appointment.appointments
    .filter((appointment) => new Date(appointment.date_time) < now)
    .sort(
      (a, b) =>
        new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
    );
};
export const selectLastSync = (state: RootState) => state.appointment.lastSync;

export default appointmentSlice.reducer;
