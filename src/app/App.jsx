// FILE: src/app/App.jsx

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

import Navbar from "../components/layout/Navbar";
import AppRoutes from "../routes/AppRoutes";

import QuestionModal from "../components/modals/QuestionModal";
import ProfileModal from "../components/modals/ProfileModal";
import ProfileNudge from "../components/modals/ProfileNudge";
import SpaceModal from "../components/modals/SpaceModal";
import LoginModal from "../components/modals/LoginModal";
import AuthRequiredPopup from "../components/modals/AuthRequiredPopup";

import {
  isProfileComplete,
  shouldShowProfileNudge,
  snoozeProfileNudge,
} from "../components/util/isProfileCompleted";

import { useFeed } from "../hooks/useFeed";
import { useAuth } from "../hooks/useAuth";
import ErrorBoundary from "../components/util/ErrorBoundry";

/**
 * App.jsx
 * ------------------------------------------------------------------
 * Root orchestration layer of the application.
 *
 * Responsibilities:
 * 1. Global modal state management
 * 2. Auth & profile gating
 * 3. Global event listeners (legacy compatibility)
 * 4. Mobile sidebar drawer state
 * 5. Route + Layout composition
 *
 * Note:
 * Layout rendering is delegated to AppRoutes.
 * This file controls behavior — not page UI structure.
 */

export default function App() {

  // ================= GLOBAL MODAL STATE =================

  const [questionOpen, setQuestionOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileEditIntent, setProfileEditIntent] = useState(false);
  const [spaceOpen, setSpaceOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const [spaceInitialName, setSpaceInitialName] = useState("");
  const [questionDraft, setQuestionDraft] = useState(null);

  // ================= AUTH FLOW STATE =================

  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showNudge, setShowNudge] = useState(false);

  // ================= MOBILE DRAWER STATE =================
  // Lives at root so Navbar + HomePage can share control

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ================= HOOKS =================

  const navigate = useNavigate();
  const { addQuestion, addSpace, addNotification } = useFeed();
  const { isAuthenticated, user, updateProfile, logout } = useAuth();

  // ======================================================
  // AUTH & PROFILE GATING
  // ======================================================

  /**
   * Ensures user is authenticated before executing action.
   * If not authenticated → show auth popup.
   */
  const requireAuth = useCallback(
    (fn) => {
      if (!isAuthenticated) {
        setPendingAction(() => fn);
        setShowAuthPopup(true);
        toast("Please login to continue");
        return false;
      }
      fn?.();
      return true;
    },
    [isAuthenticated]
  );

  /**
   * Extends auth gating by also validating profile completion.
   * Prevents content creation from incomplete profiles.
   */
  const gateWithProfile = useCallback(
    (action) => {
      if (!isAuthenticated) return requireAuth(action);

      if (!isProfileComplete(user) && shouldShowProfileNudge()) {
        setPendingAction(() => action);
        setShowNudge(true);
        return false;
      }

      action?.();
      return true;
    },
    [isAuthenticated, user, requireAuth]
  );

  // ======================================================
  // ACTION HANDLERS
  // ======================================================

  const openQuestion = useCallback(
    () => gateWithProfile(() => setQuestionOpen(true)),
    [gateWithProfile]
  );

  const handleProfileClick = useCallback(
    (edit = false) => {
      requireAuth(() => {
        setProfileEditIntent(Boolean(edit));
        setProfileOpen(true);
      });
    },
    [requireAuth]
  );

  const handleOpenCreateSpace = useCallback(
    (prefill = "") =>
      gateWithProfile(() => {
        setSpaceInitialName(prefill || "");
        setSpaceOpen(true);
      }),
    [gateWithProfile]
  );

  const handleTryPost = useCallback(
    (draft) => {
      setQuestionDraft(draft || null);
      return gateWithProfile(() => setQuestionOpen(true));
    },
    [gateWithProfile]
  );

  const handleQuestionSubmit = useCallback(
    (payload) => {
      try {
        const created = addQuestion(payload);
        addNotification({
          text: `Your ${created.title ? "question" : "post"} was published`,
          type: "question",
        });
        toast.success("Published successfully");
        setQuestionDraft(null);
        setQuestionOpen(false);
      } catch {
        toast.error("Failed to publish");
      }
    },
    [addQuestion, addNotification]
  );

  const handleCreateSpace = useCallback(
    (space) => {
      try {
        const created = addSpace(space);

        if (created?.name) {
          addNotification({
            text: `New space "${created.name}" created`,
            type: "space",
          });
          toast.success(`Space "${created.name}" created`);
          navigate(`/spaces?topic=${encodeURIComponent(created.name)}`);
        } else {
          navigate("/spaces");
        }

        setSpaceOpen(false);
      } catch {
        toast.error("Failed to create space");
      }
    },
    [addSpace, addNotification, navigate]
  );

  /**
   * Executes any pending action after successful login.
   */
  const handleLoginSuccess = useCallback(() => {
    setLoginOpen(false);

    setTimeout(() => {
      setPendingAction((fn) => {
        if (typeof fn === "function") fn();
        return null;
      });
    }, 0);

    setShowAuthPopup(false);
    toast.success("Welcome back!");

    if (!isProfileComplete(user) && shouldShowProfileNudge()) {
      setShowNudge(true);
    }
  }, [user]);

  // ======================================================
  // GLOBAL EVENT BRIDGE (Legacy Compatibility Layer)
  // ======================================================

  /**
   * Keeps older components functional that still dispatch
   * window-based CustomEvents.
   *
   * This allows gradual migration to prop-driven architecture.
   */
  useEffect(() => {
    const onOpenQuestion = () =>
      gateWithProfile(() => setQuestionOpen(true));

    const onOpenSpace = (e) =>
      gateWithProfile(() => {
        const prefill = e?.detail?.prefill || "";
        setSpaceInitialName(prefill);
        setSpaceOpen(true);
      });

    const onOpenLogin = () => setLoginOpen(true);

    const onOpenProfile = (e) => {
      const wantsEdit = !!(e && e.detail && e.detail.edit);
      handleProfileClick(wantsEdit);
    };

    const onLogout = () => {
      try {
        logout();
        toast.success("Logged out");
      } catch {
        toast.error("Failed to logout");
      }
    };

    window.addEventListener("qc:openQuestion", onOpenQuestion);
    window.addEventListener("qc:openSpaceModal", onOpenSpace);
    window.addEventListener("qc:openLogin", onOpenLogin);
    window.addEventListener("qc:openProfile", onOpenProfile);
    window.addEventListener("qc:logout", onLogout);

    return () => {
      window.removeEventListener("qc:openQuestion", onOpenQuestion);
      window.removeEventListener("qc:openSpaceModal", onOpenSpace);
      window.removeEventListener("qc:openLogin", onOpenLogin);
      window.removeEventListener("qc:openProfile", onOpenProfile);
      window.removeEventListener("qc:logout", onLogout);
    };
  }, [gateWithProfile, handleProfileClick, logout]);

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <>
      <Navbar
        onAddQuestionClick={openQuestion}
        onProfileClick={(opts) => {
          const edit =
            opts === true || (opts && opts.edit === true);
          handleProfileClick(edit);
        }}
        onCreateSpace={handleOpenCreateSpace}
        onLoginClick={() => setLoginOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(true)}
      />

      <Toaster position="top-right" toastOptions={{ duration: 1200 }} />

      <main
        className="container my-4 app-main"
        style={{ minHeight: "70vh", paddingTop: "90px" }}
      >
        <ErrorBoundary>
          <Suspense fallback={<div className="text-center my-5">Loading...</div>}>
            <AppRoutes
              onAskClick={openQuestion}
              onTryPost={handleTryPost}
              onCreateSpace={handleOpenCreateSpace}
              onProfileClick={handleProfileClick}
              isSidebarOpen={isSidebarOpen}
              onCloseSidebar={() => setIsSidebarOpen(false)}
            />
          </Suspense>
        </ErrorBoundary>
      </main>

      <QuestionModal
        isOpen={questionOpen}
        onClose={() => {
          setQuestionOpen(false);
          setQuestionDraft(null);
        }}
        onSubmit={handleQuestionSubmit}
        initialDraft={questionDraft}
      />

      <SpaceModal
        isOpen={spaceOpen}
        initialName={spaceInitialName}
        onClose={() => setSpaceOpen(false)}
        onCreate={handleCreateSpace}
      />

      <ProfileModal
        isOpen={profileOpen}
        editMode={profileEditIntent}
        onClose={() => {
          setProfileOpen(false);
          setProfileEditIntent(false);
        }}
        onSave={(profile) => {
          updateProfile(profile);
          toast.success("Profile updated successfully 🎉");
          setProfileOpen(false);
        }}
        initialProfile={{
          name: user?.name || "",
          email: user?.email || "",
          bio: user?.bio || "",
          location: user?.location || "",
          avatar: user?.avatar || "",
        }}
      />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => {
          setLoginOpen(false);
          setPendingAction(null);
        }}
        onSuccess={handleLoginSuccess}
      />

      <AuthRequiredPopup
        show={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onOpenLogin={() => {
          setShowAuthPopup(false);
          setLoginOpen(true);
        }}
      />

      <ProfileNudge
        show={showNudge}
        onClose={() => snoozeProfileNudge(7)}
        onSkip={() => snoozeProfileNudge(7)}
        onUpdateNow={() => {
          setShowNudge(false);
          setProfileEditIntent(true);
          setProfileOpen(true);
        }}
      />
    </>
  );
}