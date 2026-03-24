import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Circle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const STATUS_COLORS: Record<string, string> = {
  disponible: 'text-green-500',
  en_mission: 'text-blue-500',
  indisponible: 'text-red-500',
};

export default function Chat() {
  const { data: conversations = [], isLoading } = trpc.chat.list.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: serverMessages = [] } = trpc.chat.messages.useQuery(
    { chauffeurId: selectedId! },
    { enabled: selectedId !== null }
  );
  const sendMutation = trpc.chat.send.useMutation({
    onSuccess: (newMsg) => {
      setLocalMessages(prev => [...prev, newMsg]);
    },
  });

  useEffect(() => {
    if (serverMessages.length > 0) {
      setLocalMessages(serverMessages as any[]);
    }
  }, [serverMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const selectedConv = (conversations as any[]).find((c: any) => c.id === selectedId);

  const handleSend = () => {
    if (!message.trim() || selectedId === null) return;
    sendMutation.mutate({ chauffeurId: selectedId, text: message.trim() });
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: any) => {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Chat interne
          </h1>
          <p className="text-muted-foreground mt-1">Communication avec les chauffeurs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
          {/* Liste des conversations */}
          <Card className="md:col-span-1 overflow-hidden flex flex-col">
            <CardHeader className="pb-3 shrink-0">
              <CardTitle className="text-sm">Chauffeurs ({(conversations as any[]).length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              )}
              {(conversations as any[]).map((conv: any) => (
                <button
                  key={conv.id}
                  onClick={() => { setSelectedId(conv.id); setLocalMessages([]); }}
                  className={`w-full text-left px-4 py-3 border-b hover:bg-accent/50 transition-colors ${selectedId === conv.id ? 'bg-accent' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {(conv.chauffeurName || 'C').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {conv.unread > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm truncate">{conv.chauffeurName}</span>
                        <Circle className={`h-2 w-2 fill-current shrink-0 ${STATUS_COLORS[conv.status] || 'text-gray-400'}`} />
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatTime(conv.lastMessageAt)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Zone de messages */}
          <Card className="md:col-span-2 overflow-hidden flex flex-col">
            {!selectedId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">Selectionnez un chauffeur</p>
                <p className="text-sm text-muted-foreground mt-1">pour commencer la conversation</p>
              </div>
            ) : (
              <>
                <CardHeader className="pb-3 shrink-0 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {(selectedConv?.chauffeurName || 'C').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-sm">{selectedConv?.chauffeurName}</CardTitle>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Circle className={`h-2 w-2 fill-current ${STATUS_COLORS[selectedConv?.status] || 'text-gray-400'}`} />
                        <span className="text-xs text-muted-foreground capitalize">{selectedConv?.status?.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                  {localMessages.map((msg: any) => (
                    <div key={msg.id} className={`flex ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        msg.from === 'admin'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted rounded-bl-sm'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.from === 'admin' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {formatTime(msg.time)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>

                <div className="p-4 border-t shrink-0">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ecrire un message..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1"
                    />
                    <Button onClick={handleSend} disabled={!message.trim() || sendMutation.isPending} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
