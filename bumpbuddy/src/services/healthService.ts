import AsyncStorage from "@react-native-async-storage/async-storage";
import supabase from "../config/supabaseConfig";

// Types
export interface Symptom {
  id: string;
  user_id: string;
  symptom_type: string;
  severity: number;
  date: string;
  time: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface KickCount {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  count: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  date: string;
  weight: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Contraction {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  intensity: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BloodPressureLog {
  id: string;
  user_id: string;
  date: string;
  time: string;
  systolic: number; // The top number, pressure when heart beats
  diastolic: number; // The bottom number, pressure when heart is resting
  pulse?: number; // Heart rate in beats per minute
  position?: string; // Position during measurement (sitting, lying, standing)
  arm?: string; // Which arm was used (left, right)
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Cache keys
const SYMPTOMS_CACHE_KEY = "health_symptoms_cache";
const KICK_COUNTS_CACHE_KEY = "health_kick_counts_cache";
const WEIGHT_LOGS_CACHE_KEY = "health_weight_logs_cache";
const CONTRACTIONS_CACHE_KEY = "health_contractions_cache";
const BLOOD_PRESSURE_LOGS_CACHE_KEY = "health_bp_logs_cache";

// Health tracking service
const healthService = {
  // Symptoms
  getSymptoms: async (userId: string): Promise<Symptom[]> => {
    try {
      // Try to get from cache first
      const cachedData = await AsyncStorage.getItem(SYMPTOMS_CACHE_KEY);
      let symptoms: Symptom[] = [];

      if (cachedData) {
        symptoms = JSON.parse(cachedData);
      }

      // Fetch from API
      const { data, error } = await supabase
        .from("symptoms")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching symptoms:", error);
        return symptoms; // Return cached data if available
      }

      // Update cache
      if (data) {
        await AsyncStorage.setItem(SYMPTOMS_CACHE_KEY, JSON.stringify(data));
        return data;
      }

      return symptoms;
    } catch (error) {
      console.error("Error in getSymptoms:", error);
      return [];
    }
  },

  addSymptom: async (
    symptom: Omit<Symptom, "id" | "created_at" | "updated_at">
  ): Promise<Symptom | null> => {
    try {
      const { data, error } = await supabase
        .from("symptoms")
        .insert(symptom)
        .select()
        .single();

      if (error) {
        console.error("Error adding symptom:", error);
        return null;
      }

      // Update cache
      const cachedData = await AsyncStorage.getItem(SYMPTOMS_CACHE_KEY);
      if (cachedData) {
        const symptoms: Symptom[] = JSON.parse(cachedData);
        symptoms.unshift(data);
        await AsyncStorage.setItem(
          SYMPTOMS_CACHE_KEY,
          JSON.stringify(symptoms)
        );
      }

      return data;
    } catch (error) {
      console.error("Error in addSymptom:", error);
      return null;
    }
  },

  updateSymptom: async (
    id: string,
    updates: Partial<Symptom>
  ): Promise<Symptom | null> => {
    try {
      const { data, error } = await supabase
        .from("symptoms")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating symptom:", error);
        return null;
      }

      // Update cache
      const cachedData = await AsyncStorage.getItem(SYMPTOMS_CACHE_KEY);
      if (cachedData) {
        const symptoms: Symptom[] = JSON.parse(cachedData);
        const index = symptoms.findIndex((s) => s.id === id);
        if (index !== -1) {
          symptoms[index] = { ...symptoms[index], ...updates };
          await AsyncStorage.setItem(
            SYMPTOMS_CACHE_KEY,
            JSON.stringify(symptoms)
          );
        }
      }

      return data;
    } catch (error) {
      console.error("Error in updateSymptom:", error);
      return null;
    }
  },

  deleteSymptom: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("symptoms").delete().eq("id", id);

      if (error) {
        console.error("Error deleting symptom:", error);
        return false;
      }

      // Update cache
      const cachedData = await AsyncStorage.getItem(SYMPTOMS_CACHE_KEY);
      if (cachedData) {
        const symptoms: Symptom[] = JSON.parse(cachedData);
        const updatedSymptoms = symptoms.filter((s) => s.id !== id);
        await AsyncStorage.setItem(
          SYMPTOMS_CACHE_KEY,
          JSON.stringify(updatedSymptoms)
        );
      }

      return true;
    } catch (error) {
      console.error("Error in deleteSymptom:", error);
      return false;
    }
  },

  // Kick counts
  getKickCounts: async (userId: string): Promise<KickCount[]> => {
    try {
      // Try to get from cache first
      const cachedData = await AsyncStorage.getItem(KICK_COUNTS_CACHE_KEY);
      let kickCounts: KickCount[] = [];

      if (cachedData) {
        kickCounts = JSON.parse(cachedData);
      }

      // Fetch from API
      const { data, error } = await supabase
        .from("kick_counts")
        .select("*")
        .eq("user_id", userId)
        .order("start_time", { ascending: false });

      if (error) {
        console.error("Error fetching kick counts:", error);
        return kickCounts; // Return cached data if available
      }

      // Update cache
      if (data) {
        await AsyncStorage.setItem(KICK_COUNTS_CACHE_KEY, JSON.stringify(data));
        return data;
      }

      return kickCounts;
    } catch (error) {
      console.error("Error in getKickCounts:", error);
      return [];
    }
  },

  startKickCount: async (userId: string): Promise<KickCount | null> => {
    try {
      const newKickCount = {
        user_id: userId,
        start_time: new Date().toISOString(),
        count: 0,
      };

      const { data, error } = await supabase
        .from("kick_counts")
        .insert(newKickCount)
        .select()
        .single();

      if (error) {
        console.error("Error starting kick count:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in startKickCount:", error);
      return null;
    }
  },

  updateKickCount: async (
    id: string,
    count: number
  ): Promise<KickCount | null> => {
    try {
      const { data, error } = await supabase
        .from("kick_counts")
        .update({ count })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating kick count:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in updateKickCount:", error);
      return null;
    }
  },

  endKickCount: async (
    id: string,
    notes?: string
  ): Promise<KickCount | null> => {
    try {
      const { data, error } = await supabase
        .from("kick_counts")
        .update({
          end_time: new Date().toISOString(),
          notes,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error ending kick count:", error);
        return null;
      }

      // Update cache
      const cachedData = await AsyncStorage.getItem(KICK_COUNTS_CACHE_KEY);
      if (cachedData) {
        const kickCounts: KickCount[] = JSON.parse(cachedData);
        const index = kickCounts.findIndex((k) => k.id === id);
        if (index !== -1) {
          kickCounts[index] = data;
          await AsyncStorage.setItem(
            KICK_COUNTS_CACHE_KEY,
            JSON.stringify(kickCounts)
          );
        }
      }

      return data;
    } catch (error) {
      console.error("Error in endKickCount:", error);
      return null;
    }
  },

  // Weight logs
  getWeightLogs: async (userId: string): Promise<WeightLog[]> => {
    try {
      // Try to get from cache first
      const cachedData = await AsyncStorage.getItem(WEIGHT_LOGS_CACHE_KEY);
      let weightLogs: WeightLog[] = [];

      if (cachedData) {
        weightLogs = JSON.parse(cachedData);
      }

      // Fetch from API
      const { data, error } = await supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching weight logs:", error);
        return weightLogs; // Return cached data if available
      }

      // Update cache
      if (data) {
        await AsyncStorage.setItem(WEIGHT_LOGS_CACHE_KEY, JSON.stringify(data));
        return data;
      }

      return weightLogs;
    } catch (error) {
      console.error("Error in getWeightLogs:", error);
      return [];
    }
  },

  addWeightLog: async (
    weightLog: Omit<WeightLog, "id" | "created_at" | "updated_at">
  ): Promise<WeightLog | null> => {
    try {
      const { data, error } = await supabase
        .from("weight_logs")
        .insert(weightLog)
        .select()
        .single();

      if (error) {
        console.error("Error adding weight log:", error);
        return null;
      }

      // Update cache
      const cachedData = await AsyncStorage.getItem(WEIGHT_LOGS_CACHE_KEY);
      if (cachedData) {
        const weightLogs: WeightLog[] = JSON.parse(cachedData);
        weightLogs.unshift(data);
        await AsyncStorage.setItem(
          WEIGHT_LOGS_CACHE_KEY,
          JSON.stringify(weightLogs)
        );
      }

      return data;
    } catch (error) {
      console.error("Error in addWeightLog:", error);
      return null;
    }
  },

  // Contractions
  getContractions: async (userId: string): Promise<Contraction[]> => {
    try {
      // Try to get from cache first
      const cachedData = await AsyncStorage.getItem(CONTRACTIONS_CACHE_KEY);
      let contractions: Contraction[] = [];

      if (cachedData) {
        contractions = JSON.parse(cachedData);
      }

      // Fetch from API
      const { data, error } = await supabase
        .from("contractions")
        .select("*")
        .eq("user_id", userId)
        .order("start_time", { ascending: false });

      if (error) {
        console.error("Error fetching contractions:", error);
        return contractions; // Return cached data if available
      }

      // Update cache
      if (data) {
        await AsyncStorage.setItem(
          CONTRACTIONS_CACHE_KEY,
          JSON.stringify(data)
        );
        return data;
      }

      return contractions;
    } catch (error) {
      console.error("Error in getContractions:", error);
      return [];
    }
  },

  startContraction: async (userId: string): Promise<Contraction | null> => {
    try {
      const newContraction = {
        user_id: userId,
        start_time: new Date().toISOString(),
        intensity: 3, // Default medium intensity
      };

      const { data, error } = await supabase
        .from("contractions")
        .insert(newContraction)
        .select()
        .single();

      if (error) {
        console.error("Error starting contraction:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in startContraction:", error);
      return null;
    }
  },

  endContraction: async (
    id: string,
    intensity: number,
    notes?: string
  ): Promise<Contraction | null> => {
    try {
      const { data, error } = await supabase
        .from("contractions")
        .update({
          end_time: new Date().toISOString(),
          intensity,
          notes,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error ending contraction:", error);
        return null;
      }

      // Update cache
      const cachedData = await AsyncStorage.getItem(CONTRACTIONS_CACHE_KEY);
      if (cachedData) {
        const contractions: Contraction[] = JSON.parse(cachedData);
        const index = contractions.findIndex((c) => c.id === id);
        if (index !== -1) {
          contractions[index] = data;
          await AsyncStorage.setItem(
            CONTRACTIONS_CACHE_KEY,
            JSON.stringify(contractions)
          );
        }
      }

      return data;
    } catch (error) {
      console.error("Error in endContraction:", error);
      return null;
    }
  },

  deleteContraction: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("contractions")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting contraction:", error);
        return false;
      }

      // Update cache
      const cachedData = await AsyncStorage.getItem(CONTRACTIONS_CACHE_KEY);
      if (cachedData) {
        const contractions: Contraction[] = JSON.parse(cachedData);
        const updatedContractions = contractions.filter((c) => c.id !== id);
        await AsyncStorage.setItem(
          CONTRACTIONS_CACHE_KEY,
          JSON.stringify(updatedContractions)
        );
      }

      return true;
    } catch (error) {
      console.error("Error in deleteContraction:", error);
      return false;
    }
  },

  // Blood Pressure Logs
  getBloodPressureLogs: async (userId: string): Promise<BloodPressureLog[]> => {
    try {
      // Try to get from cache first
      const cachedData = await AsyncStorage.getItem(
        BLOOD_PRESSURE_LOGS_CACHE_KEY
      );
      let bloodPressureLogs: BloodPressureLog[] = [];

      if (cachedData) {
        bloodPressureLogs = JSON.parse(cachedData);
      }

      // Fetch from API
      const { data, error } = await supabase
        .from("blood_pressure_logs")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .order("time", { ascending: false });

      if (error) {
        console.error("Error fetching blood pressure logs:", error);
        return bloodPressureLogs; // Return cached data if available
      }

      // Update cache
      if (data) {
        await AsyncStorage.setItem(
          BLOOD_PRESSURE_LOGS_CACHE_KEY,
          JSON.stringify(data)
        );
        return data;
      }

      return bloodPressureLogs;
    } catch (error) {
      console.error("Error in getBloodPressureLogs:", error);
      return [];
    }
  },

  addBloodPressureLog: async (
    bpLog: Omit<BloodPressureLog, "id" | "created_at" | "updated_at">
  ): Promise<BloodPressureLog | null> => {
    try {
      const { data, error } = await supabase
        .from("blood_pressure_logs")
        .insert(bpLog)
        .select()
        .single();

      if (error) {
        console.error("Error adding blood pressure log:", error);
        return null;
      }

      // Update cache
      const cachedData = await AsyncStorage.getItem(
        BLOOD_PRESSURE_LOGS_CACHE_KEY
      );
      if (cachedData) {
        const bpLogs: BloodPressureLog[] = JSON.parse(cachedData);
        bpLogs.unshift(data);
        await AsyncStorage.setItem(
          BLOOD_PRESSURE_LOGS_CACHE_KEY,
          JSON.stringify(bpLogs)
        );
      }

      return data;
    } catch (error) {
      console.error("Error in addBloodPressureLog:", error);
      return null;
    }
  },

  updateBloodPressureLog: async (
    id: string,
    updates: Partial<BloodPressureLog>
  ): Promise<BloodPressureLog | null> => {
    try {
      const { data, error } = await supabase
        .from("blood_pressure_logs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating blood pressure log:", error);
        return null;
      }

      // Update cache
      const cachedData = await AsyncStorage.getItem(
        BLOOD_PRESSURE_LOGS_CACHE_KEY
      );
      if (cachedData) {
        const bpLogs: BloodPressureLog[] = JSON.parse(cachedData);
        const index = bpLogs.findIndex((log) => log.id === id);
        if (index !== -1) {
          bpLogs[index] = { ...bpLogs[index], ...updates };
          await AsyncStorage.setItem(
            BLOOD_PRESSURE_LOGS_CACHE_KEY,
            JSON.stringify(bpLogs)
          );
        }
      }

      return data;
    } catch (error) {
      console.error("Error in updateBloodPressureLog:", error);
      return null;
    }
  },

  deleteBloodPressureLog: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("blood_pressure_logs")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting blood pressure log:", error);
        return false;
      }

      // Update cache
      const cachedData = await AsyncStorage.getItem(
        BLOOD_PRESSURE_LOGS_CACHE_KEY
      );
      if (cachedData) {
        const bpLogs: BloodPressureLog[] = JSON.parse(cachedData);
        const updatedLogs = bpLogs.filter((log) => log.id !== id);
        await AsyncStorage.setItem(
          BLOOD_PRESSURE_LOGS_CACHE_KEY,
          JSON.stringify(updatedLogs)
        );
      }

      return true;
    } catch (error) {
      console.error("Error in deleteBloodPressureLog:", error);
      return false;
    }
  },
};

export default healthService;
