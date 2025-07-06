import { PageHeader } from "@/components/page-header";
import { AIModelChat } from "@/components/ai-model-chat";
import { Alert } from "@heroui/react";

export default async function AIChatPage() {
  return (
    <>
      <PageHeader
        items={[
          {
            href: "/dashboard/ai-chat",
            label: "AI Chat"
          }
        ]}
      />
      <div className="container mx-auto px-5 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mt-4">AI Model Chat</h1>
          <p className="text-muted-foreground mt-2">
            Chat with your self-hosted AI models using the integrated API system
          </p>
        </div>

        <Alert
          color="primary"
          title="Self-Hosted AI Integration"
          description="This page demonstrates how to integrate self-hosted AI models with this Cloudflare Workers template. Configure your model APIs using environment variables and start chatting!"
          className="mb-6"
        />

        <AIModelChat />
      </div>
    </>
  );
} 