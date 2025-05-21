export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  WeekDetail: { week?: number };
};

export type MainTabParamList = {
  Home: undefined;
  Timeline: undefined;
  FoodGuide: undefined;
  HealthTracker: undefined;
  Appointments: undefined;
  Profile: undefined;
};

export type TimelineStackParamList = {
  TimelineMain: undefined;
  WeekDetail: { week?: number };
};

export type MainStackParamList = {
  MainTabs: undefined;
};
