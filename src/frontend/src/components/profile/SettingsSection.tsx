import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

// ─── Section Container ────────────────────────────────────────────────────

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  children,
  className = "",
}: SettingsSectionProps) {
  return (
    <fieldset className={`mb-4 ${className}`}>
      <legend className="sr-only">{title}</legend>
      <p
        className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest"
        aria-hidden="true"
      >
        {title}
      </p>
      <div className="mx-4 glass rounded-2xl overflow-hidden divide-y divide-border/30">
        {children}
      </div>
    </fieldset>
  );
}

// ─── Row variants ─────────────────────────────────────────────────────────

interface SettingsRowBaseProps {
  icon: ReactNode;
  iconBg?: string;
  label: string;
  description?: string;
  ocid: string;
}

interface SettingsToggleRowProps extends SettingsRowBaseProps {
  type: "toggle";
  checked: boolean;
  onCheckedChange: (val: boolean) => void;
  disabled?: boolean;
}

interface SettingsActionRowProps extends SettingsRowBaseProps {
  type: "action";
  onClick: () => void;
  destructive?: boolean;
  rightLabel?: string;
}

interface SettingsInfoRowProps extends SettingsRowBaseProps {
  type: "info";
  value?: string;
}

type SettingsRowProps =
  | SettingsToggleRowProps
  | SettingsActionRowProps
  | SettingsInfoRowProps;

export function SettingsRow(props: SettingsRowProps) {
  const { icon, iconBg = "bg-muted", label, description, ocid } = props;

  const content = (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 w-full transition-fast ${
        props.type === "action"
          ? `cursor-pointer active:bg-muted/40 hover:bg-muted/20 ${props.destructive ? "hover:bg-destructive/5" : ""}`
          : ""
      }`}
      data-ocid={ocid}
      onClick={props.type === "action" ? props.onClick : undefined}
      role={props.type === "action" ? "button" : undefined}
      tabIndex={props.type === "action" ? 0 : undefined}
      onKeyDown={
        props.type === "action"
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                props.onClick();
              }
            }
          : undefined
      }
    >
      {/* Icon */}
      <div
        className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>

      {/* Label + description */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-tight ${
            props.type === "action" && props.destructive
              ? "text-destructive"
              : "text-foreground"
          }`}
        >
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            {description}
          </p>
        )}
      </div>

      {/* Right control */}
      {props.type === "toggle" && (
        <Switch
          checked={props.checked}
          onCheckedChange={props.onCheckedChange}
          disabled={props.disabled}
          aria-label={label}
          data-ocid={`${ocid}.switch`}
          onClick={(e) => e.stopPropagation()}
        />
      )}
      {props.type === "action" && !props.destructive && (
        <div className="flex items-center gap-1.5">
          {props.rightLabel && (
            <span className="text-xs text-muted-foreground">
              {props.rightLabel}
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
        </div>
      )}
      {props.type === "info" && props.value && (
        <span className="text-xs text-muted-foreground font-mono max-w-[100px] truncate text-right">
          {props.value}
        </span>
      )}
    </div>
  );

  return content;
}

// ─── Row Separator ─────────────────────────────────────────────────────────

export function SettingsRowSeparator() {
  return <Separator className="opacity-30" />;
}

// ─── Skeleton loader ──────────────────────────────────────────────────────

export function SettingsSectionSkeleton({ rows = 2 }: { rows?: number }) {
  const keys = ["a", "b", "c", "d", "e"].slice(0, rows);
  return (
    <div className="mb-4">
      <Skeleton className="mx-4 h-3 w-24 rounded mb-2" />
      <div className="mx-4 glass rounded-2xl overflow-hidden">
        {keys.map((k) => (
          <div key={k} className="flex items-center gap-3 px-4 py-3.5">
            <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-4 w-28 rounded mb-1.5" />
              <Skeleton className="h-3 w-40 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
