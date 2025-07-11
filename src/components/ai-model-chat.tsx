"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useServerAction } from 'zsa-react';
import { generateAIResponse, getAvailableModels } from '@/actions/ai-model.actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, CreditCard, Settings, User, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  creditsUsed?: number;
  tokensUsed?: number;
  timestamp: Date;
}

interface AvailableModel {
  name: string;
  creditCost: number;
  available: boolean;
}

interface AIModelChatProps {
  className?: string;
}

export function AIModelChat({ className }: AIModelChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [useCache, setUseCache] = useState(true);
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [userCredits, setUserCredits] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Server action for generating AI response
  const { execute: generateResponse, isPending: isGenerating } = useServerAction(generateAIResponse, {
    onError: (error) => {
      toast.dismiss();
      toast.error(error.err?.message || "Failed to generate response");
    },
    onStart: () => {
      toast.loading("Generating response...");
    },
    onSuccess: (result) => {
      toast.dismiss();
      toast.success(`Response generated! (${result.data.creditsUsed} credits used)`);

      // Add AI response to messages
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: result.data.text,
        model: result.data.model,
        creditsUsed: result.data.creditsUsed,
        tokensUsed: result.data.tokensUsed,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);

      // Update user credits
      setUserCredits(prev => prev - result.data.creditsUsed);
    },
  });

  // Server action for getting available models
  const { execute: loadModels } = useServerAction(getAvailableModels, {
    onError: (error) => {
      toast.error(error.err?.message || "Failed to load models");
    },
    onSuccess: (result) => {
      setAvailableModels(result.data.models);
      setUserCredits(result.data.userCredits);
      // Set default model if none selected
      if (!selectedModel && result.data.models.length > 0) {
        setSelectedModel(result.data.models[0].name);
      }
    },
  });

  // Memoized load models function to avoid useEffect dependency issues
  const loadModelsCallback = useCallback(() => {
    loadModels({});
  }, [loadModels]);

  // Load available models on component mount
  useEffect(() => {
    loadModelsCallback();
  }, [loadModelsCallback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() || !selectedModel) {
      toast.error("Please enter a prompt and select a model");
      return;
    }

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Generate AI response
    await generateResponse({
      prompt: prompt.trim(),
      model: selectedModel as 'qwen2.5:0.5b' | 'llama3.2:1b' | 'llama3.2:3b' | 'phi3:mini',
      temperature,
      maxTokens,
      useCache,
    });

    // Clear prompt
    setPrompt("");
  };

  const clearChat = () => {
    setMessages([]);
    toast.success("Chat cleared");
  };

  const selectedModelConfig = availableModels.find(m => m.name === selectedModel);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Model Chat
              </CardTitle>
              <CardDescription>
                Chat with your self-hosted AI models
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                {userCredits} credits
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Model Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.name} value={model.name}>
                        <div className="flex items-center justify-between w-full">
                          <span>{model.name}</span>
                          <Badge variant={model.available ? "default" : "secondary"}>
                            {model.creditCost} credits
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature: {temperature}</Label>
                <Input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens: {maxTokens}</Label>
                <Input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  max={4000}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="use-cache"
                    checked={useCache}
                    onChange={(e) => setUseCache(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="use-cache">Use Cache</Label>
                </div>
              </div>
            </div>

            {selectedModelConfig && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  <strong>{selectedModelConfig.name}</strong> - {selectedModelConfig.creditCost} credits per request
                  {selectedModelConfig.available ? (
                    <Badge variant="default" className="ml-2">Available</Badge>
                  ) : (
                    <Badge variant="destructive" className="ml-2">Not configured</Badge>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Chat History</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              disabled={messages.length === 0}
            >
              Clear Chat
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`rounded-lg px-3 py-2 text-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.role === 'assistant' && (
                        <div className="mt-2 text-xs opacity-70">
                          {message.model && <span>Model: {message.model}</span>}
                          {message.creditsUsed && <span className="ml-2">Credits: {message.creditsUsed}</span>}
                          {message.tokensUsed && <span className="ml-2">Tokens: {message.tokensUsed}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Your Message</Label>
              <Input
                id="prompt"
                placeholder="Enter your message or question..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedModelConfig && (
                  <span>
                    Using {selectedModelConfig.name} ({selectedModelConfig.creditCost} credits)
                  </span>
                )}
              </div>
              <Button
                type="submit"
                disabled={isGenerating || !prompt.trim() || !selectedModel || userCredits < (selectedModelConfig?.creditCost || 0)}
              >
                {isGenerating ? (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Generating...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </div>
            {userCredits < (selectedModelConfig?.creditCost || 0) && (
              <p className="text-sm text-destructive">
                Insufficient credits. You need {selectedModelConfig?.creditCost} credits to use this model.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}