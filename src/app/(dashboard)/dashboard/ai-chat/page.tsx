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
            Chat with DeepSeek AI models using their powerful API
          </p>
        </div>

        <Alert
          color="primary"
          title="DeepSeek AI Integration"
          description="This page demonstrates how to integrate DeepSeek AI models with this Cloudflare Workers template. Configure your DeepSeek API key as a secret and start chatting with advanced AI models!"
          className="mb-6"
        />

        <AIModelChat />
      </div>
    </>
  );
}