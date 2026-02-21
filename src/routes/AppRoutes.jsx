// FILE: src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// === Core feature pages ===
import HomePage from "../features/Home/HomePage";
import AnswersPage from "../features/answers/AnswersPage";
import FollowingPage from "../features/following/FollowingPage";
import SpacesPage from "../features/spaces/SpacesPage";
import NotificationsPage from "../features/notifications/NotificationsPage";
import ProfilePage from "../features/profiles/ProfilePage";

/**
 * AppRoutes
 * ---------------------------------------------------------
 * Central routing component for the entire app.
 *
 * Props injected by <App />:
 *  - onAskClick
 *  - onTryPost
 *  - onCreateSpace
 *  - onProfileClick
 *  - isSidebarOpen       
 *  - onCloseSidebar      
 */

export default function AppRoutes({
  onAskClick,
  onTryPost,
  onCreateSpace,
  onProfileClick,
  isSidebarOpen,      
  onCloseSidebar,     
}) {
  return (
    <Routes>
      {/* === Home === */}
      <Route
        path="/"
        element={
          <HomePage
            onAskClick={onAskClick}
            onTryPost={onTryPost}
            onCreateSpace={onCreateSpace}
            onProfileClick={onProfileClick}
            isSidebarOpen={isSidebarOpen}
            onCloseSidebar={onCloseSidebar}
          />
        }
      />

      {/* === Answers === */}
      <Route path="/answers" element={<AnswersPage />} />

      {/* === Following === */}
      <Route path="/following" element={<FollowingPage />} />

      {/* === Spaces === */}
      <Route path="/spaces" element={<SpacesPage />} />
      <Route path="/spaces/:spaceId" element={<SpacesPage />} />

      {/* === Notifications === */}
      <Route path="/notifications" element={<NotificationsPage />} />

      {/* === Profile === */}
      <Route path="/profile" element={<ProfilePage />} />

      {/* === Catch-all redirect === */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}