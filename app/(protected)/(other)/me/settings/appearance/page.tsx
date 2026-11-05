import { ThemeToggle } from "./_components/ThemeToggle";
import { SettingsHeader, SettingsPanel, SettingsTile } from "../_components/SettingsUi";
import { Palette } from "lucide-react";

export default function AppearancePage() {
  return (
    <div className="flex flex-col gap-5">
      <SettingsHeader title="Appearance" subtitle="Choose how the interface looks for you" />
      <SettingsPanel icon={Palette} title="Theme">
        <SettingsTile>
          <ThemeToggle />
        </SettingsTile>
      </SettingsPanel>
    </div>
  );
}
