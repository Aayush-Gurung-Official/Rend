import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { updateProfile } from "../services/authService.js";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("home"); // home | profile | settings | chat
  const [profileForm, setProfileForm] = useState({ username: "", profileImage: "" });
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // const stored = window.localStorage.getItem("rendUser");
    // if (!stored) {
    //   navigate("/auth", { replace: true });
    //   return;
    // }
    // const parsed = JSON.parse(stored);
    // setUser(parsed);
    // setProfileForm({
    //   username: parsed.username || "",
    //   profileImage: parsed.profileImage || "",
    // });
    // Dummy user for now
    const dummyUser = { id: "dummy", username: "Guest", profileImage: null };
    setUser(dummyUser);
    setProfileForm({
      username: dummyUser.username,
      profileImage: dummyUser.profileImage || "",
    });
  }, [navigate]);

  const handleLogout = () => {
    window.localStorage.removeItem("rendUser");
    navigate("/");
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSaving(true);
      const updated = await updateProfile({
        id: user.id,
        username: profileForm.username,
        profileImage: profileForm.profileImage || null,
      });
      setUser(updated);
      window.localStorage.setItem("rendUser", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  const avatarLetter = user.username?.charAt(0)?.toUpperCase() || "U";

  return (
    <section className="flex min-h-[70vh] flex-col gap-4 md:flex-row">
      <aside className="w-full rounded-2xl bg-white p-4 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200 md:w-60">
        <div className="mb-4 flex items-center gap-3">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.username}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {avatarLetter}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {user.username || "Your profile"}
            </p>
            <p className="text-xs text-slate-500">{user.phone}</p>
          </div>
        </div>

        <nav className="space-y-1 text-sm">
          {["home", "profile", "settings", "chat"].map((key) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left capitalize ${
                active === key
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{key === "home" ? "Dashboard home" : key}</span>
            </button>
          ))}
        </nav>

        <Link
          to="/"
          className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-500 text-center"
        >
          Back to Website
        </Link>
      </aside>

      <div className="flex-1 rounded-2xl bg-white p-5 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200">
        {active === "home" && (
          <div className="space-y-3">
            <h1 className="text-xl font-semibold text-slate-900">
              Welcome back, {user.username || "user"} 👋
            </h1>
            <p className="text-sm text-slate-600">
              From here you can manage your saved homes, profile and future
              listings. This area can grow as your app gets more features.
            </p>
          </div>
        )}

        {active === "profile" && (
          <form onSubmit={handleProfileSave} className="space-y-4 text-sm">
            <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Username
              </label>
              <input
                type="text"
                value={profileForm.username}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, username: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Profile image URL
              </label>
              <input
                type="url"
                value={profileForm.profileImage}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, profileImage: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://..."
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Paste a link to an image (from your CDN or uploads feature later).
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving…" : "Save profile"}
            </button>
          </form>
        )}

        {active === "settings" && (
          <div className="space-y-3 text-sm">
            <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
            <p className="text-slate-600">
              This is a placeholder for notification, language and account
              settings similar to a WordPress-style dashboard.
            </p>
          </div>
        )}

        {active === "chat" && (
          <div className="space-y-3 text-sm">
            <h2 className="text-lg font-semibold text-slate-900">Chat</h2>
            <p className="text-slate-600">
              In the future, this can host conversations between renters and
              owners. For now it is a simple placeholder panel.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;

