/**
 * TypeScript interface definitions for translations
 * This provides type safety when accessing translation keys
 */

export interface Translations {
  common: {
    buttons: {
      save: string;
      cancel: string;
      delete: string;
      edit: string;
      add: string;
      confirm: string;
      back: string;
    };
    validation: {
      required: string;
      email: string;
      minLength: string;
      maxLength: string;
      passwordMatch: string;
      invalidDate: string;
    };
    placeholders: {
      search: string;
      email: string;
      password: string;
      date: string;
    };
    errors: {
      generic: string;
      network: string;
      unauthorized: string;
      notFound: string;
    };
    labels: {
      loading: string;
      today: string;
      yesterday: string;
      tomorrow: string;
    };
  };
  auth: {
    login: {
      title: string;
      emailLabel: string;
      passwordLabel: string;
      forgotPassword: string;
      submitButton: string;
      noAccount: string;
      signupLink: string;
    };
    signup: {
      title: string;
      emailLabel: string;
      passwordLabel: string;
      confirmPasswordLabel: string;
      dueDateLabel: string;
      submitButton: string;
      hasAccount: string;
      loginLink: string;
    };
    forgotPassword: {
      title: string;
      emailLabel: string;
      submitButton: string;
      instructions: string;
      backToLogin: string;
    };
  };
  profile: {
    title: string;
    personalInfo: string;
    dueDate: string;
    pregnancyWeek: string;
    editProfile: string;
    changePassword: string;
    logOut: string;
    settings: string;
  };
  home: {
    welcome: string;
    journeyTitle: string;
    weekTitle: string;
    trimesterLabel: string;
    progressLabel: string;
    developmentTitle: string;
    bodyChangesTitle: string;
    nutritionTipsTitle: string;
    sizeLabel: string;
    lengthLabel: string;
    weightLabel: string;
    trackSymptomsButton: string;
    foodGuideButton: string;
  };
  foodGuide: {
    title: string;
    searchPlaceholder: string;
    categories: string;
    safeToEat: string;
    cautionNeeded: string;
    avoid: string;
    alternativesLabel: string;
    nutritionalInfoLabel: string;
  };
  healthTracker: {
    title: string;
    symptomsTitle: string;
    kickCountTitle: string;
    contractionsTitle: string;
    weightTitle: string;
    addEntryButton: string;
    dateLabel: string;
    timeLabel: string;
    notesLabel: string;
    severityLabel: string;
    durationLabel: string;
    frequencyLabel: string;
    startTrackingButton: string;
    stopTrackingButton: string;
  };
  appointments: {
    title: string;
    upcomingTitle: string;
    pastTitle: string;
    addButton: string;
    dateTimeLabel: string;
    locationLabel: string;
    typeLabel: string;
    descriptionLabel: string;
    reminderLabel: string;
    noAppointments: string;
  };
  settings: {
    title: string;
    languageSection: string;
    languageLabel: string;
    unitsSection: string;
    unitsLabel: string;
    themeSection: string;
    themeLabel: string;
    notificationsSection: string;
    notificationsLabel: string;
    aboutSection: string;
    versionLabel: string;
    privacyPolicyLabel: string;
    termsOfServiceLabel: string;
    feedbackLabel: string;
  };
}

// Helper type to get nested translation keys with dot notation
export type TranslationKey = string;

// Function to check if a language is RTL
export const isRTL = (language: string): boolean => {
  return ["ar", "he", "fa", "ur"].includes(language);
};
