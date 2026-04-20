import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bell,
  BellOff,
  Check,
  Edit3,
  LogOut,
  Moon,
  Shield,
  Sun,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Layout, useTheme } from "../components/layout/Layout";
import { ProfileHero } from "../components/profile/ProfileHero";
import {
  SettingsRow,
  SettingsSection,
  SettingsSectionSkeleton,
} from "../components/profile/SettingsSection";
import { useAuth } from "../hooks/use-auth";
import { useProductivityStatsQuery } from "../hooks/use-productivity";
import {
  useUpdateSettingsMutation,
  useUserSettingsQuery,
} from "../hooks/use-settings";

// ─── Inline display-name editor ──────────────────────────────────────────────

interface DisplayNameEditorProps {
  current: string;
  onSave: (name: string) => void;
  isPending: boolean;
}

function DisplayNameEditor({
  current,
  onSave,
  isPending,
}: DisplayNameEditorProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(current);

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === current) {
      setEditing(false);
      return;
    }
    onSave(trimmed);
    setEditing(false);
  };

  const handleCancel = () => {
    setValue(current);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-3 px-4 py-3.5 w-full">
        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Edit3 className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground leading-none mb-1">
            Display Name
          </p>
          <p className="text-sm font-medium text-foreground truncate">
            {current}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setValue(current);
            setEditing(true);
          }}
          className="h-8 px-3 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-fast"
          data-ocid="profile.edit_name_button"
        >
          Edit
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 w-full animate-slide-down">
      <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
        <Edit3 className="w-4 h-4 text-primary" />
      </div>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 h-9 text-sm bg-input/60 border-border/60 rounded-xl focus-visible:ring-1 focus-visible:ring-ring"
        autoFocus
        maxLength={40}
        data-ocid="profile.display_name_input"
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") handleCancel();
        }}
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center transition-fast hover:bg-emerald-500/25 disabled:opacity-50"
        aria-label="Save name"
        data-ocid="profile.save_name_button"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={handleCancel}
        className="w-8 h-8 rounded-xl bg-muted/40 text-muted-foreground flex items-center justify-center transition-fast hover:bg-muted/70"
        aria-label="Cancel edit"
        data-ocid="profile.cancel_name_button"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { logout, principal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { data: settings, isLoading: settingsLoading } = useUserSettingsQuery();
  const { data: stats } = useProductivityStatsQuery();
  const { mutate: updateSettings, isPending: updatePending } =
    useUpdateSettingsMutation();

  const principalText = principal ? principal.toText() : "";
  const isLoading = settingsLoading;

  const handleSaveDisplayName = (name: string) => {
    updateSettings(
      { displayName: name, theme: null, notificationsEnabled: null },
      {
        onSuccess: () =>
          toast.success("Name updated!", {
            description: "Your display name has been saved.",
          }),
        onError: () =>
          toast.error("Failed to update name", {
            description: "Please try again.",
          }),
      },
    );
  };

  const handleToggleNotifications = (enabled: boolean) => {
    updateSettings(
      { displayName: null, theme: null, notificationsEnabled: enabled },
      {
        onSuccess: () =>
          toast.success(
            enabled ? "Notifications enabled" : "Notifications disabled",
          ),
      },
    );
  };

  return (
    <Layout title="Profile" showNav showHeader>
      <div className="pb-6 animate-fade-in" data-ocid="profile.page">
        {/* Hero */}
        <ProfileHero
          settings={settings}
          stats={stats}
          isLoading={isLoading}
          principalText={principalText}
        />

        <div className="mt-2">
          {/* Account section */}
          {isLoading ? (
            <SettingsSectionSkeleton rows={2} />
          ) : (
            <SettingsSection title="Account">
              <DisplayNameEditor
                current={settings?.displayName || "Taskflow User"}
                onSave={handleSaveDisplayName}
                isPending={updatePending}
              />
              <SettingsRow
                type="info"
                icon={<Shield className="w-4 h-4 text-blue-400" />}
                iconBg="bg-blue-500/15"
                label="Internet Identity"
                description="Secured with ICP authentication"
                value="Active"
                ocid="profile.identity_row"
              />
            </SettingsSection>
          )}

          {/* App settings */}
          {isLoading ? (
            <SettingsSectionSkeleton rows={2} />
          ) : (
            <SettingsSection title="Preferences">
              <SettingsRow
                type="toggle"
                icon={
                  theme === "dark" ? (
                    <Moon className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-400" />
                  )
                }
                iconBg={
                  theme === "dark" ? "bg-indigo-500/15" : "bg-amber-500/15"
                }
                label="Dark Mode"
                description={`Currently ${theme === "dark" ? "dark" : "light"} theme`}
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                ocid="profile.dark_mode_toggle"
              />
              <SettingsRow
                type="toggle"
                icon={
                  settings?.notificationsEnabled ? (
                    <Bell className="w-4 h-4 text-primary" />
                  ) : (
                    <BellOff className="w-4 h-4 text-muted-foreground" />
                  )
                }
                iconBg={
                  settings?.notificationsEnabled
                    ? "bg-primary/15"
                    : "bg-muted/50"
                }
                label="Push Notifications"
                description="Deadline reminders and task alerts"
                checked={settings?.notificationsEnabled ?? false}
                onCheckedChange={handleToggleNotifications}
                disabled={updatePending}
                ocid="profile.notifications_toggle"
              />
            </SettingsSection>
          )}

          {/* Danger zone */}
          <SettingsSection title="Danger Zone">
            <AlertDialog>
              <AlertDialogTrigger className="w-full text-left">
                <SettingsRow
                  type="action"
                  icon={<LogOut className="w-4 h-4 text-destructive" />}
                  iconBg="bg-destructive/10"
                  label="Sign Out"
                  description="You will be redirected to the login screen"
                  destructive
                  onClick={() => {}}
                  ocid="profile.logout_button"
                />
              </AlertDialogTrigger>
              <AlertDialogContent
                className="glass rounded-2xl border-border/30 max-w-[90vw] mx-auto"
                data-ocid="profile.logout_dialog"
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground font-display">
                    Sign out of TaskFlow Pro?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    You'll need to authenticate again with Internet Identity to
                    access your tasks and data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel
                    className="rounded-xl bg-muted/40 border-border/30 hover:bg-muted/70"
                    data-ocid="profile.logout_cancel_button"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={logout}
                    className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-ocid="profile.logout_confirm_button"
                  >
                    Sign Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SettingsSection>
        </div>

        {/* Footer branding */}
        <p className="text-center text-xs text-muted-foreground/50 px-4 mt-2">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.hostname : "",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-fast"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </div>
    </Layout>
  );
}
