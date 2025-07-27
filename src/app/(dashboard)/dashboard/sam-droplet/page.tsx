import "server-only";
import { PageHeader } from "@/components/page-header";
import { SamDropletClient } from "./sam-droplet-client";

export const metadata = {
  title: "SAM Droplet Segmentation",
  description: "AI-powered droplet segmentation using Segment Anything Model",
};

export default function SamDropletPage() {
  return (
    <>
      <PageHeader
        items={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/sam-droplet", label: "SAM Droplet" }
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">SAM Droplet Segmentation</h1>
          <p className="text-muted-foreground">
            AI-powered droplet segmentation using the Segment Anything Model (SAM)
          </p>
        </div>
        <SamDropletClient />
      </div>
    </>
  );
} 