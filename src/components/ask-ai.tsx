'use client';

import * as React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Bot, Loader2, Send, User, Sparkles, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { processQuery } from '@/app/actions';
import type { Receipt } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AskAiProps {
  receipts: Receipt[];
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type FormValues = {
  prompt: string;
};

const examplePrompts = [
  "How much did I spend on groceries last week?",
  "What was my most expensive purchase?",
  "List all my dining expenses.",
  "Which vendor did I shop at most frequently?"
];

// Reference for the SpeechRecognition API
let recognition: any = null;
if (typeof window !== 'undefined') {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  }
}


export function AskAi({ receipts }: AskAiProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const { register, handleSubmit, reset, setValue, formState: { isValid } } = useForm<FormValues>();
  const { toast } = useToast();

  React.useEffect(() => {
    // Scroll to the bottom when new messages are added
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);
  
  const handleQuery = async (prompt: string) => {
    if (!prompt) return;
    setIsProcessing(true);
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    reset({ prompt: ''});

    try {
      const answer = await processQuery(prompt, receipts);
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch (error: any) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsProcessing(false);
    }
  }

  const handleVoiceInput = () => {
    if (!recognition) {
        toast({
            variant: 'destructive',
            title: 'Voice recognition not supported',
            description: 'Your browser does not support the Web Speech API.'
        });
        return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }
    
    recognition.start();
    setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setValue('prompt', transcript, { shouldValidate: true });
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
        toast({
            variant: 'destructive',
            title: 'Voice recognition error',
            description: event.error === 'not-allowed' ? 'Microphone access was denied.' : 'An error occurred during voice recognition.',
        });
        setIsListening(false);
    };
    
    recognition.onend = () => {
        setIsListening(false);
    };
  };

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    handleQuery(data.prompt);
  };
  
  return (
    <Card className="h-full flex flex-col">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-primary"/>
                Ask AI
            </CardTitle>
            <CardDescription>
                Ask questions about your spending in plain English.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
            <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
                <div className="space-y-6">
                 {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground p-8">
                        <Bot className="mx-auto h-12 w-12 mb-4" />
                        <h3 className="text-lg font-medium">I'm ready to help!</h3>
                        <p className="text-sm">Try one of these examples or ask your own question below.</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                        key={index}
                        className={cn(
                            'flex items-start gap-3',
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                        >
                        {msg.role === 'assistant' && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5"/></AvatarFallback>
                            </Avatar>
                        )}
                        <div
                            className={cn(
                            'max-w-xs md:max-w-md rounded-lg px-4 py-3 text-sm',
                            msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                        >
                            {msg.content}
                        </div>
                        {msg.role === 'user' && (
                             <Avatar className="h-8 w-8">
                                <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                            </Avatar>
                        )}
                        </div>
                    ))
                )}
                {isProcessing && messages[messages.length-1]?.role === 'user' && (
                    <div className="flex items-start gap-3 justify-start">
                         <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5"/></AvatarFallback>
                        </Avatar>
                        <div className="max-w-xs md:max-w-md rounded-lg px-4 py-3 text-sm bg-muted flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
                </div>
            </ScrollArea>
             <div className="space-y-2">
                 <div className="flex gap-2 overflow-x-auto pb-2">
                    {examplePrompts.map((prompt, i) => (
                         <Button key={i} variant="outline" size="sm" onClick={() => handleQuery(prompt)} disabled={isProcessing} className="shrink-0">
                            {prompt}
                        </Button>
                    ))}
                 </div>
                <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
                    <Input
                    {...register('prompt')}
                    placeholder="Ask a question or click the mic to speak..."
                    autoComplete="off"
                    disabled={isProcessing}
                    />
                    <Button type="button" size="icon" variant={isListening ? 'destructive' : 'outline'} onClick={handleVoiceInput} disabled={isProcessing}>
                       <Mic />
                       <span className="sr-only">{isListening ? 'Stop listening' : 'Start listening'}</span>
                    </Button>
                    <Button type="submit" size="icon" disabled={isProcessing || !isValid}>
                        {isProcessing ? <Loader2 className="animate-spin" /> : <Send />}
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </CardContent>
    </Card>
  );
}
