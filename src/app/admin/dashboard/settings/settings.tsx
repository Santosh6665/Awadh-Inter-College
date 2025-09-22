
'use client';

import { GeneralSettings } from "./general-settings";
import { ResultSettings } from "../results/result-settings";

export function Settings({ settings }: { settings: any }) {
  return (
    <div className="space-y-6">
      <GeneralSettings settings={settings} />
      <ResultSettings settings={settings} />
    </div>
  );
}
