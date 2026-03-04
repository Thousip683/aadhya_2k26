import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Moon,
  Sun,
  LogOut,
  Save,
  Check,
  ChevronRight,
} from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Toggle states
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [shareData, setShareData] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        credentials: "include",
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      <header className="flex items-center gap-4 border-b border-border/50 pb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
          <SettingsIcon size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-display font-extrabold text-foreground">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and preferences
          </p>
        </div>
      </header>

      {/* Profile Section */}
      <section className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
        <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
          <User size={20} className="text-primary" />
          Profile
        </h2>

        <div className="space-y-5">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-foreground font-semibold text-lg">
                {user?.name}
              </p>
              <p className="text-muted-foreground text-sm">
                @{user?.username}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving || name === user?.name}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
              saved
                ? "bg-green-500 text-white"
                : name !== user?.name && !saving
                ? "bg-primary text-primary-foreground hover:bg-[#b8e855] shadow-md shadow-primary/20"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {saved ? (
              <>
                <Check size={16} /> Saved
              </>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
        <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
          <Bell size={20} className="text-primary" />
          Notifications
        </h2>
        <div className="space-y-1">
          <ToggleRow
            label="Push Notifications"
            description="Get notified about health alerts"
            checked={pushNotifs}
            onChange={setPushNotifs}
          />
          <ToggleRow
            label="Email Alerts"
            description="Receive critical alerts via email"
            checked={emailAlerts}
            onChange={setEmailAlerts}
          />
        </div>
      </section>

      {/* Appearance */}
      <section className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
        <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
          {darkMode ? (
            <Moon size={20} className="text-primary" />
          ) : (
            <Sun size={20} className="text-primary" />
          )}
          Appearance
        </h2>
        <ToggleRow
          label="Dark Mode"
          description="Switch between light and dark theme"
          checked={darkMode}
          onChange={setDarkMode}
        />
      </section>

      {/* Privacy */}
      <section className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
        <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
          <Shield size={20} className="text-primary" />
          Privacy & Data
        </h2>
        <div className="space-y-1">
          <ToggleRow
            label="Share Anonymous Data"
            description="Help improve AI accuracy with anonymous symptom data"
            checked={shareData}
            onChange={setShareData}
          />
          <div className="flex items-center justify-between py-4 border-b border-border/30 last:border-0">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Delete All Data
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently remove all your symptom checks and history
              </p>
            </div>
            <button className="px-4 py-2 rounded-xl text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors">
              Delete Data
            </button>
          </div>
        </div>
      </section>

      {/* Account Actions */}
      <section className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
        <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
          <LogOut size={20} className="text-primary" />
          Account
        </h2>
        <div className="space-y-3">
          <button
            onClick={logout}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-secondary/50 hover:bg-secondary text-foreground font-medium text-sm transition-colors group"
          >
            <span className="flex items-center gap-3">
              <LogOut size={18} className="text-muted-foreground group-hover:text-destructive transition-colors" />
              Sign Out
            </span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        </div>
      </section>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border/30 last:border-0">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
