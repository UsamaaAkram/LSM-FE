import { configureStore, combineReducers } from "@reduxjs/toolkit";
import sidebarReducer from "./sidebarSlice";
import themeSettingReducer from "./themeSettingSlice";
import authReducer from "./authSlice";
import coursesReducer from "./courses";
import instructorReducer from "./instructor";
import assignmentReducer from "./assignmentSlice";
import quizReducer from "./quizSlice";
import ticketReducer from "./ticketSlice";
import studentReducer from "./studentSlice";
import chatReducer from "./chatSlice";
import userReducer from "./chatUserSlice";
import studentCoursesReducer from "./studentCoursesSlice";
import studentWishlistReducer from "./studentWishlistSlice";
import studentSubmissionReducer from './studentSubmissionSlice';
import studentLessonWatchedReducer from './studentLessonWatchedSlice';
import studentDashboardSlice from "./studentDashboardSlice";
import studentCertificatesSlice from "./studentCertificatesSlice";
import invoiceSlice from "./invoiceSlice";

import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // uses localStorage for web

const rootReducer = combineReducers({
  sidebar: sidebarReducer,
  themeSetting: themeSettingReducer,
  auth: authReducer,
  courses: coursesReducer,
  instructor: instructorReducer,
  assignment: assignmentReducer,
  quiz: quizReducer,
  ticket: ticketReducer,
  student: studentReducer,
  chat: chatReducer,
  chatUser: userReducer,
  studentCourses: studentCoursesReducer,
  studentWishlist: studentWishlistReducer,
  studentSubmission: studentSubmissionReducer,
  lessonWatched: studentLessonWatchedReducer,
  studentDashboard: studentDashboardSlice, // Add the studentDashboard slice here
  studentCertificates: studentCertificatesSlice, // Add the studentCertificates slice here
  invoice: invoiceSlice, // ← NEW
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only persist auth; you can add others
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
