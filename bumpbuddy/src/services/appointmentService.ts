import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { Appointment, DoctolibAppointment } from "../types/appointment";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "i18next";
import { Platform } from "react-native";
import supabase from "../config/supabaseConfig";

interface DoctoAppointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialtyId: string;
  specialtyName: string;
  dateTime: string;
  location: string;
  notes?: string;
}

class AppointmentService {
  /**
   * Get all appointments for a user
   */
  async getAppointments(userId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", userId)
      .order("date_time", { ascending: true });

    if (error) {
      console.error("Error fetching appointments:", error);
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Save an appointment to the database
   */
  async saveAppointment(
    appointment: Omit<Appointment, "id" | "created_at" | "updated_at">
  ): Promise<Appointment> {
    const { data, error } = await supabase
      .from("appointments")
      .insert(appointment)
      .select()
      .single();

    if (error) {
      console.error("Error saving appointment:", error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Update an appointment
   */
  async updateAppointment(
    id: string,
    appointment: Partial<Appointment>
  ): Promise<Appointment> {
    const { data, error } = await supabase
      .from("appointments")
      .update(appointment)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating appointment:", error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Delete an appointment
   */
  async deleteAppointment(id: string): Promise<void> {
    const { error } = await supabase.from("appointments").delete().eq("id", id);

    if (error) {
      console.error("Error deleting appointment:", error);
      throw new Error(error.message);
    }
  }

  /**
   * Open Doctolib appointment booking (for French users)
   */
  async openDoctolibBooking(
    specialtySearch?: string,
    location?: string
  ): Promise<void> {
    try {
      let url = "https://www.doctolib.fr/";

      // Map common pregnancy terms to appropriate French specialties
      const specialtyMappings: { [key: string]: string } = {
        obstetrician: "obstetricien",
        gynecologist: "gynecologue",
        midwife: "sage-femme",
        ultrasound: "echographie",
        prenatal: "gynecologie-obstetrique",
        pregnancy: "obstetrique",
        childbirth: "sage-femme",
        maternity: "maternite",
      };

      let formattedSpecialty = specialtySearch;

      // If we have a direct mapping, use it
      if (specialtySearch && specialtyMappings[specialtySearch.toLowerCase()]) {
        formattedSpecialty = specialtyMappings[specialtySearch.toLowerCase()];
      }

      // If we have specialty and location, build a more specific URL
      if (formattedSpecialty && location) {
        // Make the specialty search URL-friendly
        const urlSpecialty = formattedSpecialty
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-");

        // Make the location URL-friendly
        const formattedLocation = location
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-");

        url = `https://www.doctolib.fr/${urlSpecialty}/${formattedLocation}`;
      }

      // Save search parameters for later use
      await AsyncStorage.setItem(
        "doctolib_last_specialty",
        specialtySearch || ""
      );
      await AsyncStorage.setItem("doctolib_last_location", location || "");

      // Store timestamp of when user initiated Doctolib booking
      await AsyncStorage.setItem(
        "doctolib_last_visit",
        new Date().toISOString()
      );

      // Open the URL in an in-app browser
      if (Platform.OS === "ios" || Platform.OS === "android") {
        const result = await WebBrowser.openBrowserAsync(url);

        // For future use: Check if there's a custom URL scheme or deep link handling
        if (result.type === "cancel") {
          // User closed the browser without booking
          console.log("User cancelled Doctolib booking");
        }
      } else {
        // For web platform
        window.open(url, "_blank");
      }

      return;
    } catch (error) {
      console.error("Error opening Doctolib:", error);
      throw error;
    }
  }

  /**
   * Handle manually adding a Doctolib appointment after booking
   */
  async addDoctolibAppointment(
    userId: string,
    doctolibAppointment: DoctolibAppointment
  ): Promise<Appointment> {
    try {
      // Format the appointment from Doctolib format to our app format
      const appointment: Omit<Appointment, "id" | "created_at" | "updated_at"> =
        {
          user_id: userId,
          title: `${t("appointments.appointmentWith")} ${
            doctolibAppointment.doctorName
          }`,
          description: `${doctolibAppointment.specialty}`,
          date_time: doctolibAppointment.dateTime,
          location: doctolibAppointment.location,
          notes: doctolibAppointment.notes || "",
          reminder: true,
          reminder_time: 60, // Default 1 hour reminder
          external_id: doctolibAppointment.id,
          external_service: "doctolib",
          external_url: `https://www.doctolib.fr/appointments/${doctolibAppointment.id}`,
          doctor_name: doctolibAppointment.doctorName,
          specialty: doctolibAppointment.specialty,
        };

      return await this.saveAppointment(appointment);
    } catch (error) {
      console.error("Error adding Doctolib appointment:", error);
      throw error;
    }
  }

  /**
   * Check if there are any external appointments to sync
   * For demonstration purposes, this would check recent Doctolib activity and prompt
   * the user to add appointments they might have created
   */
  async checkExternalAppointments(userId: string): Promise<Appointment[]> {
    // In a real implementation with API access, this would check for new appointments

    try {
      // Check if we've recently visited Doctolib
      const lastVisit = await AsyncStorage.getItem("doctolib_last_visit");

      if (lastVisit) {
        const visitDate = new Date(lastVisit);
        const now = new Date();

        // If we visited Doctolib in the last hour, we might have booked something
        if (now.getTime() - visitDate.getTime() < 60 * 60 * 1000) {
          // Get any cached Doctolib appointments we haven't prompted about
          const cachedData = await AsyncStorage.getItem(
            `doctolib_pending_appointments_${userId}`
          );

          if (cachedData) {
            // Clear the pending appointments since we're returning them now
            await AsyncStorage.removeItem(
              `doctolib_pending_appointments_${userId}`
            );
            return JSON.parse(cachedData);
          }
        }
      }

      return [];
    } catch (error) {
      console.error("Error checking external appointments:", error);
      return [];
    }
  }

  /**
   * Save the URL from a deep link that might contain appointment information
   * This would be used if Doctolib implemented deep linking
   */
  async handleDeepLink(url: string, userId: string): Promise<boolean> {
    // Check if the URL is from Doctolib
    if (url.includes("doctolib.fr")) {
      console.log("Received Doctolib deep link:", url);

      // In a real implementation with proper API access, we would:
      // 1. Extract appointment data from the URL or query an API
      // 2. Format the data properly
      // 3. Save to our database

      // For now, we'll just note that we received a potential appointment URL
      await AsyncStorage.setItem("doctolib_last_deep_link", url);
      await AsyncStorage.setItem(
        "doctolib_last_deep_link_time",
        new Date().toISOString()
      );

      return true;
    }

    return false;
  }

  /**
   * Configure the deep link handler
   */
  setupDeepLinkHandler(userId: string): () => void {
    // Set up event listener for deep links
    const subscription = Linking.addEventListener("url", ({ url }) => {
      this.handleDeepLink(url, userId);
    });

    // Return the cleanup function
    return () => subscription.remove();
  }

  /**
   * Get deep linking URL for the app
   */
  async getDeepLinkUrl(): Promise<string> {
    return Linking.createURL("/appointments");
  }

  /**
   * Mock method to simulate what would happen if we had Doctolib API access.
   * In a real implementation, this would be replaced with actual API calls.
   */
  async mockDoctolibAPICheck(userId: string): Promise<DoctolibAppointment[]> {
    try {
      // Check if we have pending mock appointments
      const mockData = await AsyncStorage.getItem("doctolib_mock_appointments");
      if (mockData) {
        return JSON.parse(mockData);
      }

      // Get last used search parameters
      const specialty =
        (await AsyncStorage.getItem("doctolib_last_specialty")) || "";
      const location =
        (await AsyncStorage.getItem("doctolib_last_location")) || "";

      // If we have recently searched for appointments, create a mock appointment
      if (specialty && location) {
        const lastVisit = await AsyncStorage.getItem("doctolib_last_visit");

        if (lastVisit) {
          const visitDate = new Date(lastVisit);
          const now = new Date();

          // If visited within the last hour, create a mock appointment
          if (now.getTime() - visitDate.getTime() < 60 * 60 * 1000) {
            // Get appropriate mock data based on specialty searched
            let mockDoctorName = "Dr. Unknown";
            let mockSpecialty = specialty;
            let mockLocation = `Cabinet médical de ${location}`;

            // Map common pregnancy specialties to more specific French doctor types
            if (
              specialty.toLowerCase().includes("obstet") ||
              specialty.toLowerCase().includes("gyneco")
            ) {
              mockDoctorName = `Dr. Martin Lambert`;
              mockSpecialty = "Gynécologie-Obstétrique";
              mockLocation = `Centre médical Saint-Louis, ${location}`;
            } else if (
              specialty.toLowerCase().includes("sage") ||
              specialty.toLowerCase().includes("midwife")
            ) {
              mockDoctorName = `Marie Durand`;
              mockSpecialty = "Sage-femme";
              mockLocation = `Maternité de ${location}`;
            } else if (
              specialty.toLowerCase().includes("echo") ||
              specialty.toLowerCase().includes("ultrasound")
            ) {
              mockDoctorName = `Dr. Sophie Blanc`;
              mockSpecialty = "Échographie obstétricale";
              mockLocation = `Centre d'imagerie médicale, ${location}`;
            } else {
              // Default to creating a generic doctor name from the specialty
              mockDoctorName = `Dr. ${
                specialty.charAt(0).toUpperCase() + specialty.slice(1)
              }`;
            }

            // Create future appointment date (1-2 weeks from now)
            const futureDate = new Date();
            futureDate.setDate(
              futureDate.getDate() + 7 + Math.floor(Math.random() * 7)
            );

            // Random hour between 9am and 5pm
            futureDate.setHours(
              9 + Math.floor(Math.random() * 8),
              0 + Math.floor(Math.random() * 4) * 15, // Set to 0, 15, 30, or 45 mins
              0
            );

            const mockAppointment: DoctolibAppointment = {
              id: `docto-${Date.now()}`,
              doctorName: mockDoctorName,
              specialty: mockSpecialty,
              dateTime: futureDate.toISOString(),
              location: mockLocation,
              notes: `Rendez-vous pris via Doctolib le ${new Date().toLocaleDateString(
                "fr-FR"
              )}`,
            };

            return [mockAppointment];
          }
        }
      }

      return [];
    } catch (error) {
      console.error("Error in mock Doctolib API:", error);
      return [];
    }
  }
}

export default new AppointmentService();
