// FILE: src/components/layout/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import {
  FaHome,
  FaUserFriends,
  FaPen,
  FaLayerGroup,
  FaBell,
  FaPlus,
  FaSearch,
  FaMoon,
  FaSun,
} from "react-icons/fa";

import "../../styles/Navbar.css";
import { trendingTopics } from "../../data/trendingTopics";

import { useFeed } from "../../hooks/useFeed";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

export default function Navbar({
  onAddQuestionClick,
  onProfileClick,
  onLoginClick,
  onToggleSidebar,
}) {
  const navigate = useNavigate();
  const navbarRef = useRef(null);

  const { isAuthenticated, user, logout } = useAuth();
  const { notifications } = useFeed();
  const { theme, toggleTheme } = useTheme();

  // ================= STATE =================

  const [activeMenu, setActiveMenu] = useState(null); 
  // null | "search" | "profile"

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // ================= AVATAR =================

  const placeholderSvg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none'>
       <rect rx='12' width='24' height='24' fill='%23e9ecef'/>
       <path d='M12 12a3 3 0 100-6 3 3 0 000 6zm0 2c-3 0-6 1.5-6 3v1h12v-1c0-1.5-3-3-6-3z' fill='%23999'/>
     </svg>`
  );

  const avatarSrc = user?.avatar || `data:image/svg+xml;charset=UTF-8,${placeholderSvg}`;

  const unreadCount = (notifications || []).filter(
    (n) => n.unread === true
  ).length;

  // ================= SEARCH =================

  const filteredSuggestions =
    searchQuery.trim() !== ""
      ? trendingTopics.filter((topic) =>
          topic.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/answers?q=${encodeURIComponent(q)}`);
    setSearchQuery("");
    setActiveMenu(null);
    searchInputRef.current?.blur();
  };

  const handleSuggestionClick = (topic) => {
    navigate(`/answers?q=${encodeURIComponent(topic)}`);
    setSearchQuery("");
    setActiveMenu(null);
  };

  // ================= LOGIN / PROFILE =================

  const openLogin = () => {
    if (typeof onLoginClick === "function") onLoginClick();
    else window.dispatchEvent(new CustomEvent("qc:openLogin"));
  };

  const openProfile = (opts) => {
    if (typeof onProfileClick === "function") onProfileClick(opts);
    else window.dispatchEvent(
      new CustomEvent("qc:openProfile", { detail: opts || {} })
    );
  };

  // ================= GLOBAL CLOSE HANDLER =================

  useEffect(() => {
  const handleClick = (e) => {
    if (!navbarRef.current?.contains(e.target)) {
      setActiveMenu(null);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Escape") {
      setActiveMenu(null);
    }
  };

  document.addEventListener("mousedown", handleClick);
  document.addEventListener("keydown", handleKey);

  return () => {
    document.removeEventListener("mousedown", handleClick);
    document.removeEventListener("keydown", handleKey);
  };
}, []);

  // ================= SEARCH BOX =================

  const SearchBox = () => (
    <div ref={searchRef} className="qc-search-wrapper position-relative">
      <FaSearch className="qc-search-icon" />
      <input
        ref={searchInputRef}
        type="text"
        className="qc-search"
        placeholder="Search topics..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setActiveMenu("search")}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />

      {activeMenu === "search" && filteredSuggestions.length > 0 && (
        <div className="qc-suggestions">
          {filteredSuggestions.map((topic, i) => (
            <div
              key={i}
              className="qc-suggestion-item"
              onMouseDown={() => handleSuggestionClick(topic)}
            >
              {topic}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ================= PROFILE =================

  const ProfileMenu = () => (
    <div className="qc-profile-wrapper position-relative" ref={profileRef}>
      <div
         className="qc-profile-trigger"
         onClick={() => {
           if (!isAuthenticated) return openLogin();
           setActiveMenu((prev) =>
           prev === "profile" ? null : "profile"
          );
        }}
      >
         {isAuthenticated ? (
             <img src={avatarSrc} alt="Profile" className="qc-profile" />
           ) : (
             <FaUserCircle size={28} className="qc-profile-placeholder-icon" />
          )}
        </div>


      {activeMenu === "profile" && (
        <div className="qc-profile-dropdown">
          <div onClick={() => openProfile()}>My Profile</div>
          <div onClick={() => openProfile({ edit: true })}>
            Edit Profile
          </div>
          <div onClick={logout}>Logout</div>
          <div onClick={toggleTheme}>
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </div>
        </div>
      )}
    </div>
  );

  // ================= RENDER =================

  return (
    < div ref={navbarRef}>
      {/* ================= DESKTOP ================= */}
      <div className="d-none d-lg-block">
        <nav className="qc-navbar fixed-top shadow-sm">
          <div className="container-fluid d-flex align-items-center justify-content-between px-3">

            <NavLink to="/" className="qc-logo">
               Quora
            </NavLink>

            <div className="d-flex align-items-center gap-3">

              <NavLink to="/" className="qc-link">
                <FaHome />
              </NavLink>

              <NavLink to="/following" className="qc-link">
                <FaUserFriends />
              </NavLink>

              <NavLink to="/answers" className="qc-link">
                <FaPen />
              </NavLink>

              <NavLink to="/spaces" className="qc-link">
                <FaLayerGroup />
              </NavLink>

              <NavLink
                to="/notifications"
                className="qc-link position-relative"
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span className="qc-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </NavLink>

              <SearchBox />

              <button
                className="qc-add-btn btn btn-outline-danger"
                onClick={() => {
                  if (!isAuthenticated) return openLogin();
                  onAddQuestionClick();
                }}
              >
                <FaPlus className="me-1" /> Add Question
              </button>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-secondary px-2 py-1"
                onClick={toggleTheme}
              >
                {theme === "light" ? <FaMoon /> : <FaSun />}
              </button>

              <ProfileMenu />
            </div>
          </div>
        </nav>
      </div>
            {/* ================= MOBILE ================= */}
      <div className="d-lg-none">

        {/* ---- Row 1 ---- */}
        <div className="qc-mobile-top fixed-top d-flex align-items-center justify-content-between px-3">

          {!isMobileSearchOpen && (
            <>
              {/* Left Side: Hamburger + Logo */}
<div className="d-flex align-items-center gap-2">

  {/* Hamburger */}
  <button
    className="btn-reset"
    onClick={() => {
      if (typeof onToggleSidebar === "function") {
        onToggleSidebar();
      }
    }}
    aria-label="Open sidebar"
  >
    ☰
  </button>

  {/* Logo */}
  <NavLink to="/" className="qc-logo">
    Quora
  </NavLink>

</div>

              <div className="d-flex align-items-center gap-3">

                {/* Search Icon */}
                <button
                  className="btn-reset"
                  onClick={() => {
                    setIsMobileSearchOpen(true);
                    setActiveMenu("search");
                  }}
                >
                  <FaSearch size={18} />
                </button>

                {/* Add */}
                <button
                  className="btn-reset qc-mobile-add"
                  onClick={() => {
                    if (!isAuthenticated) return openLogin();
                    onAddQuestionClick();
                  }}
                >
                  <FaPlus size={18} />
                </button>

                {/* Profile */}
                <button
                   className="btn-reset"
                   onClick={() => {
                     if (!isAuthenticated) return openLogin();
                     setActiveMenu((prev) =>
                        prev === "profile" ? null : "profile"
                      );
                    }}
                  >
                    {isAuthenticated ? (
                       <img src={avatarSrc} alt="Profile" className="qc-profile" />
                    ) : (
                      <FaUserCircle size={28} className="qc-profile-placeholder-icon" />
                    )}
                  </button>
              </div>
            </>
          )}

          {/* ---- Mobile Search Mode ---- */}
          {isMobileSearchOpen && (
            <div className="qc-mobile-search w-100 d-flex align-items-center">
              <div className="flex-grow-1">
                <SearchBox />
              </div>

              <button
                className="btn-reset ms-2"
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setActiveMenu(null);
                  setSearchQuery("");
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* ---- Mobile Profile Panel ---- */}
        {activeMenu === "profile" && (
          <div 
           ref={profileRef}
           className="qc-mobile-profile-panel"
          >
            <div onClick={() => openProfile()}>My Profile</div>
            <div onClick={() => openProfile({ edit: true })}>
              Edit Profile
            </div>
            <div onClick={logout}>Logout</div>
            <div onClick={toggleTheme}>
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </div>
          </div>
        )}

        {/* ---- Row 2 Tabs ---- */}
        <div className={`qc-mobile-tabs d-flex align-items-center justify-content-around
        ${ activeMenu === "profile" ? "qc-tabs-disabled" : ""
        }`}>

          <NavLink to="/" className="qc-tab">
            <FaHome />
          </NavLink>

          <NavLink to="/following" className="qc-tab">
            <FaUserFriends />
          </NavLink>

          <NavLink to="/answers" className="qc-tab">
            <FaPen />
          </NavLink>

          <NavLink to="/spaces" className="qc-tab">
            <FaLayerGroup />
          </NavLink>

          <NavLink to="/notifications" className="qc-tab position-relative">
            <FaBell />
            {unreadCount > 0 && (
              <span className="qc-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </NavLink>

        </div>
      </div>

    </div>
  );
}
