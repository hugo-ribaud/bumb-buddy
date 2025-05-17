import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import healthService, {
  BloodPressureLog,
  Contraction,
  KickCount,
  Symptom,
  WeightLog,
} from "../../services/healthService";

// State interface
interface HealthState {
  symptoms: {
    items: Symptom[];
    loading: boolean;
    error: string | null;
  };
  kickCounts: {
    items: KickCount[];
    currentSession: KickCount | null;
    loading: boolean;
    error: string | null;
  };
  weightLogs: {
    items: WeightLog[];
    loading: boolean;
    error: string | null;
  };
  contractions: {
    items: Contraction[];
    currentContraction: Contraction | null;
    loading: boolean;
    error: string | null;
  };
  bloodPressureLogs: {
    items: BloodPressureLog[];
    loading: boolean;
    error: string | null;
  };
}

// Initial state
const initialState: HealthState = {
  symptoms: {
    items: [],
    loading: false,
    error: null,
  },
  kickCounts: {
    items: [],
    currentSession: null,
    loading: false,
    error: null,
  },
  weightLogs: {
    items: [],
    loading: false,
    error: null,
  },
  contractions: {
    items: [],
    currentContraction: null,
    loading: false,
    error: null,
  },
  bloodPressureLogs: {
    items: [],
    loading: false,
    error: null,
  },
};

// Async thunks
export const fetchSymptoms = createAsyncThunk(
  "health/fetchSymptoms",
  async (userId: string, { rejectWithValue }) => {
    try {
      return await healthService.getSymptoms(userId);
    } catch (error) {
      return rejectWithValue("Failed to fetch symptoms");
    }
  }
);

export const addSymptom = createAsyncThunk(
  "health/addSymptom",
  async (
    symptom: Omit<Symptom, "id" | "created_at" | "updated_at">,
    { rejectWithValue }
  ) => {
    try {
      const result = await healthService.addSymptom(symptom);
      if (!result) return rejectWithValue("Failed to add symptom");
      return result;
    } catch (error) {
      return rejectWithValue("Failed to add symptom");
    }
  }
);

export const updateSymptom = createAsyncThunk(
  "health/updateSymptom",
  async (
    { id, updates }: { id: string; updates: Partial<Symptom> },
    { rejectWithValue }
  ) => {
    try {
      const result = await healthService.updateSymptom(id, updates);
      if (!result) return rejectWithValue("Failed to update symptom");
      return result;
    } catch (error) {
      return rejectWithValue("Failed to update symptom");
    }
  }
);

export const deleteSymptom = createAsyncThunk(
  "health/deleteSymptom",
  async (id: string, { rejectWithValue }) => {
    try {
      const success = await healthService.deleteSymptom(id);
      if (!success) return rejectWithValue("Failed to delete symptom");
      return id;
    } catch (error) {
      return rejectWithValue("Failed to delete symptom");
    }
  }
);

export const fetchKickCounts = createAsyncThunk(
  "health/fetchKickCounts",
  async (userId: string, { rejectWithValue }) => {
    try {
      return await healthService.getKickCounts(userId);
    } catch (error) {
      return rejectWithValue("Failed to fetch kick counts");
    }
  }
);

export const startKickCount = createAsyncThunk(
  "health/startKickCount",
  async (userId: string, { rejectWithValue }) => {
    try {
      const result = await healthService.startKickCount(userId);
      if (!result) return rejectWithValue("Failed to start kick count");
      return result;
    } catch (error) {
      return rejectWithValue("Failed to start kick count");
    }
  }
);

export const updateKickCount = createAsyncThunk(
  "health/updateKickCount",
  async ({ id, count }: { id: string; count: number }, { rejectWithValue }) => {
    try {
      const result = await healthService.updateKickCount(id, count);
      if (!result) return rejectWithValue("Failed to update kick count");
      return result;
    } catch (error) {
      return rejectWithValue("Failed to update kick count");
    }
  }
);

export const endKickCount = createAsyncThunk(
  "health/endKickCount",
  async (
    { id, notes }: { id: string; notes?: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await healthService.endKickCount(id, notes);
      if (!result) return rejectWithValue("Failed to end kick count");
      return result;
    } catch (error) {
      return rejectWithValue("Failed to end kick count");
    }
  }
);

export const fetchWeightLogs = createAsyncThunk(
  "health/fetchWeightLogs",
  async (userId: string, { rejectWithValue }) => {
    try {
      return await healthService.getWeightLogs(userId);
    } catch (error) {
      return rejectWithValue("Failed to fetch weight logs");
    }
  }
);

export const addWeightLog = createAsyncThunk(
  "health/addWeightLog",
  async (
    weightLog: Omit<WeightLog, "id" | "created_at" | "updated_at">,
    { rejectWithValue }
  ) => {
    try {
      const result = await healthService.addWeightLog(weightLog);
      if (!result) return rejectWithValue("Failed to add weight log");
      return result;
    } catch (error) {
      return rejectWithValue("Failed to add weight log");
    }
  }
);

// Contraction thunks
export const fetchContractions = createAsyncThunk(
  "health/fetchContractions",
  async (userId: string, { rejectWithValue }) => {
    try {
      return await healthService.getContractions(userId);
    } catch (error) {
      return rejectWithValue("Failed to fetch contractions");
    }
  }
);

export const startContraction = createAsyncThunk(
  "health/startContraction",
  async (userId: string, { rejectWithValue }) => {
    try {
      const result = await healthService.startContraction(userId);
      if (!result) return rejectWithValue("Failed to start contraction");
      return result;
    } catch (error) {
      return rejectWithValue("Failed to start contraction");
    }
  }
);

export const endContraction = createAsyncThunk(
  "health/endContraction",
  async (
    { id, intensity, notes }: { id: string; intensity: number; notes?: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await healthService.endContraction(id, intensity, notes);
      if (!result) return rejectWithValue("Failed to end contraction");
      return result;
    } catch (error) {
      return rejectWithValue("Failed to end contraction");
    }
  }
);

export const deleteContraction = createAsyncThunk(
  "health/deleteContraction",
  async (id: string, { rejectWithValue }) => {
    try {
      const success = await healthService.deleteContraction(id);
      if (!success) return rejectWithValue("Failed to delete contraction");
      return id;
    } catch (error) {
      return rejectWithValue("Failed to delete contraction");
    }
  }
);

// Blood Pressure thunks
export const fetchBloodPressureLogs = createAsyncThunk(
  "health/fetchBloodPressureLogs",
  async (userId: string, { rejectWithValue }) => {
    try {
      return await healthService.getBloodPressureLogs(userId);
    } catch (error) {
      return rejectWithValue("Failed to fetch blood pressure logs");
    }
  }
);

export const addBloodPressureLog = createAsyncThunk(
  "health/addBloodPressureLog",
  async (
    bpLog: Omit<BloodPressureLog, "id" | "created_at" | "updated_at">,
    { rejectWithValue }
  ) => {
    try {
      const result = await healthService.addBloodPressureLog(bpLog);
      if (!result) return rejectWithValue("Failed to add blood pressure log");
      return result;
    } catch (error) {
      return rejectWithValue("Failed to add blood pressure log");
    }
  }
);

export const updateBloodPressureLog = createAsyncThunk(
  "health/updateBloodPressureLog",
  async (
    { id, updates }: { id: string; updates: Partial<BloodPressureLog> },
    { rejectWithValue }
  ) => {
    try {
      const result = await healthService.updateBloodPressureLog(id, updates);
      if (!result)
        return rejectWithValue("Failed to update blood pressure log");
      return result;
    } catch (error) {
      return rejectWithValue("Failed to update blood pressure log");
    }
  }
);

export const deleteBloodPressureLog = createAsyncThunk(
  "health/deleteBloodPressureLog",
  async (id: string, { rejectWithValue }) => {
    try {
      const success = await healthService.deleteBloodPressureLog(id);
      if (!success)
        return rejectWithValue("Failed to delete blood pressure log");
      return id;
    } catch (error) {
      return rejectWithValue("Failed to delete blood pressure log");
    }
  }
);

// Create slice
const healthSlice = createSlice({
  name: "health",
  initialState,
  reducers: {
    clearHealthErrors: (state) => {
      state.symptoms.error = null;
      state.kickCounts.error = null;
      state.weightLogs.error = null;
      state.contractions.error = null;
      state.bloodPressureLogs.error = null;
    },
    resetCurrentKickCount: (state) => {
      state.kickCounts.currentSession = null;
    },
    resetCurrentContraction: (state) => {
      state.contractions.currentContraction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Symptoms
      .addCase(fetchSymptoms.pending, (state) => {
        state.symptoms.loading = true;
        state.symptoms.error = null;
      })
      .addCase(
        fetchSymptoms.fulfilled,
        (state, action: PayloadAction<Symptom[]>) => {
          state.symptoms.loading = false;
          state.symptoms.items = action.payload;
        }
      )
      .addCase(fetchSymptoms.rejected, (state, action) => {
        state.symptoms.loading = false;
        state.symptoms.error = action.payload as string;
      })
      .addCase(
        addSymptom.fulfilled,
        (state, action: PayloadAction<Symptom>) => {
          state.symptoms.items.unshift(action.payload);
        }
      )
      .addCase(
        updateSymptom.fulfilled,
        (state, action: PayloadAction<Symptom>) => {
          const index = state.symptoms.items.findIndex(
            (s) => s.id === action.payload.id
          );
          if (index !== -1) {
            state.symptoms.items[index] = action.payload;
          }
        }
      )
      .addCase(
        deleteSymptom.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.symptoms.items = state.symptoms.items.filter(
            (s) => s.id !== action.payload
          );
        }
      )

      // Kick counts
      .addCase(fetchKickCounts.pending, (state) => {
        state.kickCounts.loading = true;
        state.kickCounts.error = null;
      })
      .addCase(
        fetchKickCounts.fulfilled,
        (state, action: PayloadAction<KickCount[]>) => {
          state.kickCounts.loading = false;
          state.kickCounts.items = action.payload;

          // Find any active session (no end_time)
          const activeSession = action.payload.find((k) => !k.end_time);
          if (activeSession) {
            state.kickCounts.currentSession = activeSession;
          }
        }
      )
      .addCase(fetchKickCounts.rejected, (state, action) => {
        state.kickCounts.loading = false;
        state.kickCounts.error = action.payload as string;
      })
      .addCase(
        startKickCount.fulfilled,
        (state, action: PayloadAction<KickCount>) => {
          state.kickCounts.items.unshift(action.payload);
          state.kickCounts.currentSession = action.payload;
        }
      )
      .addCase(
        updateKickCount.fulfilled,
        (state, action: PayloadAction<KickCount>) => {
          const index = state.kickCounts.items.findIndex(
            (k) => k.id === action.payload.id
          );
          if (index !== -1) {
            state.kickCounts.items[index] = action.payload;
          }

          if (state.kickCounts.currentSession?.id === action.payload.id) {
            state.kickCounts.currentSession = action.payload;
          }
        }
      )
      .addCase(
        endKickCount.fulfilled,
        (state, action: PayloadAction<KickCount>) => {
          const index = state.kickCounts.items.findIndex(
            (k) => k.id === action.payload.id
          );
          if (index !== -1) {
            state.kickCounts.items[index] = action.payload;
          }

          if (state.kickCounts.currentSession?.id === action.payload.id) {
            state.kickCounts.currentSession = null;
          }
        }
      )

      // Weight logs
      .addCase(fetchWeightLogs.pending, (state) => {
        state.weightLogs.loading = true;
        state.weightLogs.error = null;
      })
      .addCase(
        fetchWeightLogs.fulfilled,
        (state, action: PayloadAction<WeightLog[]>) => {
          state.weightLogs.loading = false;
          state.weightLogs.items = action.payload;
        }
      )
      .addCase(fetchWeightLogs.rejected, (state, action) => {
        state.weightLogs.loading = false;
        state.weightLogs.error = action.payload as string;
      })
      .addCase(
        addWeightLog.fulfilled,
        (state, action: PayloadAction<WeightLog>) => {
          state.weightLogs.items.unshift(action.payload);
        }
      )

      // Contractions
      .addCase(fetchContractions.pending, (state) => {
        state.contractions.loading = true;
        state.contractions.error = null;
      })
      .addCase(
        fetchContractions.fulfilled,
        (state, action: PayloadAction<Contraction[]>) => {
          state.contractions.loading = false;
          state.contractions.items = action.payload;

          // Find any active contraction (no end_time)
          const activeContraction = action.payload.find((c) => !c.end_time);
          if (activeContraction) {
            state.contractions.currentContraction = activeContraction;
          }
        }
      )
      .addCase(fetchContractions.rejected, (state, action) => {
        state.contractions.loading = false;
        state.contractions.error = action.payload as string;
      })
      .addCase(
        startContraction.fulfilled,
        (state, action: PayloadAction<Contraction>) => {
          state.contractions.items.unshift(action.payload);
          state.contractions.currentContraction = action.payload;
        }
      )
      .addCase(
        endContraction.fulfilled,
        (state, action: PayloadAction<Contraction>) => {
          const index = state.contractions.items.findIndex(
            (c) => c.id === action.payload.id
          );
          if (index !== -1) {
            state.contractions.items[index] = action.payload;
          }

          if (state.contractions.currentContraction?.id === action.payload.id) {
            state.contractions.currentContraction = null;
          }
        }
      )
      .addCase(
        deleteContraction.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.contractions.items = state.contractions.items.filter(
            (c) => c.id !== action.payload
          );

          if (state.contractions.currentContraction?.id === action.payload) {
            state.contractions.currentContraction = null;
          }
        }
      )

      // Blood Pressure logs
      .addCase(fetchBloodPressureLogs.pending, (state) => {
        state.bloodPressureLogs.loading = true;
        state.bloodPressureLogs.error = null;
      })
      .addCase(
        fetchBloodPressureLogs.fulfilled,
        (state, action: PayloadAction<BloodPressureLog[]>) => {
          state.bloodPressureLogs.loading = false;
          state.bloodPressureLogs.items = action.payload;
        }
      )
      .addCase(fetchBloodPressureLogs.rejected, (state, action) => {
        state.bloodPressureLogs.loading = false;
        state.bloodPressureLogs.error = action.payload as string;
      })
      .addCase(
        addBloodPressureLog.fulfilled,
        (state, action: PayloadAction<BloodPressureLog>) => {
          state.bloodPressureLogs.items.unshift(action.payload);
        }
      )
      .addCase(
        updateBloodPressureLog.fulfilled,
        (state, action: PayloadAction<BloodPressureLog>) => {
          const index = state.bloodPressureLogs.items.findIndex(
            (bp) => bp.id === action.payload.id
          );
          if (index !== -1) {
            state.bloodPressureLogs.items[index] = action.payload;
          }
        }
      )
      .addCase(
        deleteBloodPressureLog.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.bloodPressureLogs.items = state.bloodPressureLogs.items.filter(
            (bp) => bp.id !== action.payload
          );
        }
      );
  },
});

export const {
  clearHealthErrors,
  resetCurrentKickCount,
  resetCurrentContraction,
} = healthSlice.actions;
export default healthSlice.reducer;
