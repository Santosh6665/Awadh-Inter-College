
'use client';

import { GeneralSettings } from "./general-settings";
import { ResultSettings } from "../results/result-settings";
import { FeeSettings } from "./fee-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Settings({ settings }: { settings: any }) {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="results">Results</TabsTrigger>
        <TabsTrigger value="fees">Fees</TabsTrigger>
      </TabsList>
      <TabsContent value="general" className="mt-4">
        <GeneralSettings settings={settings} />
      </TabsContent>
      <TabsContent value="results" className="mt-4">
        <ResultSettings settings={settings} />
      </TabsContent>
      <TabsContent value="fees" className="mt-4">
        <FeeSettings settings={settings} />
      </TabsContent>
    </Tabs>
  );
}
