import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import logoSrc from "../assets/logo2.jpg";
import { useCart } from "../../contexts/CartContext"; // ✅ use the hook

type User = {
  username: string;
  role: "Admin" | "Vendor" | "Customer";
  // optional avatar fields if your API provides any of these:
  avatar?: string;
  photo?: string;
  image?: string;
  profile_picture?: string;
};

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // ===== Auth (localStorage + sync) =====
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const sync = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user") || "null"));
      } catch {
        setUser(null);
      }
    };
    window.addEventListener("storage", sync);
    window.addEventListener("auth-changed", sync as any);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-changed", sync as any);
    };
  }, []);

  // ===== Nav state =====
  const [open, setOpen] = useState(false);

  // Services dropdown lock (prevents “stuck open” after click)
  const [svcLocked, setSvcLocked] = useState(false);
  useEffect(() => {
    setSvcLocked(false);
  }, [pathname]);

  // ===== Search =====
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState<number>(-1);
  const searchWrapRef = useRef<HTMLDivElement | null>(null);
  const allSuggestions = ["house cleaning", "deep cleaning", "window cleaning"];
  const suggestions = q.trim()
    ? allSuggestions
        .filter((s) => s.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 5)
    : allSuggestions.slice(0, 2);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        searchOpen &&
        searchWrapRef.current &&
        !searchWrapRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
        setActive(-1);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setActive(-1);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchOpen]);

  const link = ({ isActive }: { isActive: boolean }) => ({
    className: isActive ? "active" : undefined,
  });

  function go(value?: string) {
    const query = (value ?? q).trim();
    if (!query) return;
    setSearchOpen(false);
    setActive(-1);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      active >= 0 ? go(suggestions[active]) : go();
    }
  }

  // ===== Cart (badge only; click -> /cart) =====
  const { count } = useCart(); // total quantity (services + products)

  // ===== Services dropdown helpers =====
  function handleSvcClick() {
    setSvcLocked(true);
  }

  // ===== Auth menu =====
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showUserMenu) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setShowUserMenu(false);
    };
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setShowUserMenu(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [showUserMenu]);

  function dashboardPath(u: User) {
    if (u.role === "Admin") return "/admin";
    if (u.role === "Vendor") return "/vendor-dashboard";
    return "/customerdashboard";
  }
  function logout() {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/");
    }
  }

  const logo = (logoSrc as string) || "/logo2.jpg";

  // pick an avatar url if present
  const avatarUrl =
    (user as any)?.avatar ||
    (user as any)?.photo ||
    (user as any)?.image ||
    (user as any)?.profile_picture ||
    "";

  // small inline styles for the avatar-only button
  const avatarStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    objectFit: "cover",
    boxShadow: "0 0 0 2px #e2e8f0 inset",
  };
  const initialStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#e2e8f0",
    color: "#1f2937",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 13,
  };

  return (
    <header>
      <div className="container row">
        <div className="brand">
          <img src={logo} alt="logo" style={{ height: 70 }} />
        </div>

        <nav
          className="hide-mobile"
          style={{ display: "flex", alignItems: "center", gap: 24, color: "#334155" }}
        >
          <NavLink to="/" {...link}>
            HOME
          </NavLink>
          <NavLink to="/about" {...link}>
            ABOUT
          </NavLink>

          {/* ===== SERVICES ===== */}
          <div
            className={`nav-item has-dropdown${svcLocked ? " locked" : ""}`}
            onMouseLeave={() => setSvcLocked(false)}
          >
            <NavLink to="/services" {...link} onClick={handleSvcClick}>
              SERVICES
            </NavLink>
            <ul className="nav-dropdown" onClick={handleSvcClick}>
              <li>
                <Link to="/services#apartment">Apartment Cleaning</Link>
              </li>
              <li>
                <Link to="/services#house">House Cleaning</Link>
              </li>
              <li>
                <Link to="/services#move">Move In / Move Out</Link>
              </li>
              <li>
                <Link to="/services#carpet">Carpet Cleaning</Link>
              </li>
              <li>
                <Link to="/services#renovation">After Renovation</Link>
              </li>
              <li>
                <Link to="/services#curtain">Curtain Cleaning</Link>
              </li>
              <li>
                <Link to="/services#window">Window Cleaning</Link>
              </li>
              <li>
                <Link to="/services#commercial">Commercial Cleaning</Link>
              </li>
              <li>
                <Link to="/services#residential">Residential Cleaning</Link>
              </li>
            </ul>
          </div>

          <NavLink to="/products" {...link}>
            SHOP
          </NavLink>
          <NavLink to="/faqs" {...link}>
            FAQS
          </NavLink>
          <NavLink to="/blog" {...link}>
            BLOG
          </NavLink>
          <NavLink to="/testimonial" {...link}>
            TESTIMONIAL
          </NavLink>
          <NavLink to="/contacts" {...link}>
            CONTACTS
          </NavLink>

          {/* ===== Right side ===== */}
          <div
            ref={searchWrapRef}
            className="nav-actions"
            style={{ display: "flex", alignItems: "center", gap: 18 }}
          >
            {/* search toggle */}
            {!searchOpen ? (
              <button
                className="icon-btn"
                aria-label="Search"
                onClick={() => {
                  setSearchOpen(true);
                  setTimeout(
                    () => document.getElementById("search-input")?.focus(),
                    0
                  );
                }}
              >
                <svg className="icon" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
            ) : (
              <button
                className="icon-btn"
                aria-label="Close search"
                onClick={() => {
                  setSearchOpen(false);
                  setActive(-1);
                }}
              >
                ✕
              </button>
            )}

            {/* cart with badge — click navigates to /cart */}
            <div className="cart-anchor" style={{ position: "relative" }}>
              <button
                className="icon-btn cart-btn"
                onClick={() => navigate("/cart")}
                aria-label="Open cart"
                title="Cart"
              >
                <svg className="cart-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6c0-1.66 1.34-3 3-3h4" />
                  <rect x="5.5" y="6" width="14" height="8.5" rx="1.8" ry="1.8" />
                  <path d="M5.5 9h14" />
                  <circle cx="9" cy="19.5" r="1.8" />
                  <circle cx="17.5" cy="19.5" r="1.8" />
                </svg>
              </button>
              {count > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    minWidth: 18,
                    height: 18,
                    fontSize: 11,
                    background: "#e11d48",
                    color: "#fff",
                    borderRadius: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                  }}
                >
                  {count}
                </span>
              )}
            </div>

            {/* inline search */}
            {searchOpen && (
              <div className="search-wrap">
                <form
                  className="search-inline"
                  onSubmit={(e) => {
                    e.preventDefault();
                    go();
                  }}
                >
                  <input
                    id="search-input"
                    className="search-input"
                    placeholder="Search"
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setActive(-1);
                    }}
                    onKeyDown={onKeyDown}
                  />
                  <button className="search-go" aria-label="Go search" type="submit">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                </form>

                {suggestions.length > 0 && (
                  <div className="search-suggestions">
                    <div className="arrow-up" />
                    {suggestions.map((s, i) => (
                      <button
                        key={s + i}
                        className={"suggestion-item" + (i === active ? " active" : "")}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== Auth area (avatar-only) ===== */}
            {!user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginLeft: 8 }}>
                <NavLink to="/login" className="auth-link login">
                  LOGIN
                </NavLink>
                <NavLink to="/register" className="auth-link register">
                  REGISTER
                </NavLink>
              </div>
            ) : (
              <div style={{ position: "relative", marginLeft: 6 }}>
                {/* avatar-only button */}
                <button
                  className="icon-btn"
                  onClick={() => setShowUserMenu((v) => !v)}
                  aria-label="Profile menu"
                  title={`${user.username} (${user.role})`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: 4,
                    borderRadius: 999,
                  }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={user.username} style={avatarStyle} />
                  ) : (
                    <span style={initialStyle}>
                      {user.username?.[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div
                    ref={menuRef}
                    className="user-menu"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      width: 220,
                      background: "#0b1f35",
                      color: "#e2f0ff",
                      borderRadius: 12,
                      boxShadow:
                        "0 18px 42px rgba(2,6,23,.24), 0 6px 14px rgba(2,6,23,.18)",
                      overflow: "hidden",
                      zIndex: 50,
                    }}
                  >
                    <Link
                      to={dashboardPath(user)}
                      className="user-menu__item"
                      onClick={() => setShowUserMenu(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" style={{ opacity: 0.9 }}>
                        <path
                          d="M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z"
                          fill="currentColor"
                        />
                      </svg>
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/profile"
                      className="user-menu__item"
                      onClick={() => setShowUserMenu(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" style={{ opacity: 0.9 }}>
                        <path
                          d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
                          fill="currentColor"
                        />
                      </svg>
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={logout}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        width: "100%",
                        background: "transparent",
                        border: 0,
                        color: "#ffb4b4",
                        cursor: "pointer",
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" style={{ opacity: 0.95 }}>
                        <path
                          d="M10 17l1.41-1.41L8.83 13H21v-2H8.83l2.58-2.59L10 7l-5 5 5 5ZM3 5h8V3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8v-2H3Z"
                          fill="currentColor"
                        />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* mobile hamburger */}
        <button
          className="hamburger hide-desktop"
          onClick={() => setOpen((o) => !o)}
          aria-label="menu"
        >
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </button>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="mobile-menu hide-desktop">
          <div className="container" style={{ padding: "10px 16px" }}>
            <NavLink to="/" onClick={() => setOpen(false)}>
              HOME
            </NavLink>
            <NavLink to="/about" onClick={() => setOpen(false)}>
              ABOUT US
            </NavLink>
            <NavLink to="/services" onClick={() => setOpen(false)}>
              SERVICES
            </NavLink>
            <NavLink to="/products" onClick={() => setOpen(false)}>
              SHOP
            </NavLink>
            <NavLink to="/faqs" onClick={() => setOpen(false)}>
              FAQS
            </NavLink>
            <NavLink to="/blog" onClick={() => setOpen(false)}>
              BLOG
            </NavLink>
            <NavLink to="/testimonial" onClick={() => setOpen(false)}>
              TESTIMONIAL
            </NavLink>
            <NavLink to="/contacts" onClick={() => setOpen(false)}>
              CONTACTS
            </NavLink>
            <NavLink to="/cart" onClick={() => setOpen(false)}>
              CART
            </NavLink>

            {!user ? (
              <>
                <NavLink to="/login" onClick={() => setOpen(false)}>
                  LOGIN
                </NavLink>
                <NavLink to="/register" onClick={() => setOpen(false)}>
                  REGISTER
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to={dashboardPath(user)} onClick={() => setOpen(false)}>
                  DASHBOARD
                </NavLink>
                <NavLink to="/profile" onClick={() => setOpen(false)}>
                  PROFILE
                </NavLink>
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="menu-link danger"
                >
                  LOGOUT
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
