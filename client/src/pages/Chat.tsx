import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Search, MessageSquare, User, Loader2, RefreshCw } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { trpc } from '@/lib/trpc';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR');
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMsg {
  id: number;
  conversationId: string;
  senderId: number;
  senderName: string;
  senderRole: string;
  content: string;
  missionId?: number | null;
  isRead: boolean;
  createdAt: Date | string;
}

interface ConvMeta {
  conversationId: string;
  chauffeurId: number;
  chauffeurName: string;
  lastMessage: string;
  lastTime: Date | string | null;
  unread: number;
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function Chat() {
  const { t } = useLanguage();

  // Identité de l'admin (récupérée depuis localStorage si disponible)
  const adminId   = parseInt(localStorage.getItem('userId') || '1');
  const adminName = localStorage.getItem('userName') || 'Admin';

  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messageText, setMessageText]       = useState('');
  const [search, setSearch]                 = useState('');
  const [conversations, setConversations]   = useState<ConvMeta[]>([]);
  const [messages, setMessages]             = useState<ChatMsg[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Charger la liste des chauffeurs pour construire les conversations ──────
  const { data: chauffeurs = [] } = trpc.chauffeurs.list.useQuery();

  useEffect(() => {
    if (!chauffeurs || (chauffeurs as any[]).length === 0) return;
    const convs: ConvMeta[] = (chauffeurs as any[]).map((c: any) => ({
      conversationId: `admin-chauffeur-${c.id}`,
      chauffeurId: c.id,
      chauffeurName: c.name,
      lastMessage: '',
      lastTime: null,
      unread: 0,
    }));
    setConversations(convs);
    if (!selectedConvId && convs.length > 0) setSelectedConvId(convs[0].conversationId);
  }, [chauffeurs]);

  // ── Charger les messages de la conversation sélectionnée ─────────────────
  const { data: rawMessages, isLoading: loadingMessages, refetch: refetchMessages } =
    trpc.chat.getMessages.useQuery(
      { conversationId: selectedConvId ?? '', limit: 100 },
      { enabled: !!selectedConvId, refetchInterval: 3000 }
    );

  useEffect(() => {
    if (rawMessages) {
      setMessages(rawMessages as ChatMsg[]);
      // Mettre à jour le dernier message dans la liste des conversations
      if ((rawMessages as ChatMsg[]).length > 0) {
        const last = (rawMessages as ChatMsg[])[(rawMessages as ChatMsg[]).length - 1];
        setConversations(prev => prev.map(c =>
          c.conversationId === selectedConvId
            ? { ...c, lastMessage: last.content, lastTime: last.createdAt, unread: 0 }
            : c
        ));
      }
    }
  }, [rawMessages, selectedConvId]);

  // ── Scroll automatique vers le bas ───────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── SSE : écouter les nouveaux messages en temps réel ────────────────────
  useEffect(() => {
    if (!selectedConvId) return;
    const url = `/api/notifications/stream?userId=${adminId}`;
    const es = new EventSource(url);
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_message' && data.data?.conversationId === selectedConvId) {
          refetchMessages();
        }
        if (data.type === 'chat_message') {
          const convId = data.data?.conversationId;
          if (convId) {
            setConversations(prev => prev.map(c =>
              c.conversationId === convId
                ? { ...c, lastMessage: data.message, lastTime: new Date(), unread: convId === selectedConvId ? 0 : c.unread + 1 }
                : c
            ));
          }
        }
      } catch {}
    };
    return () => es.close();
  }, [selectedConvId, adminId]);

  // ── Marquer les messages comme lus ───────────────────────────────────────
  const markReadMutation = trpc.chat.markRead.useMutation();
  useEffect(() => {
    if (selectedConvId) {
      markReadMutation.mutate({ conversationId: selectedConvId, userId: adminId });
      setConversations(prev => prev.map(c =>
        c.conversationId === selectedConvId ? { ...c, unread: 0 } : c
      ));
    }
  }, [selectedConvId]);

  // ── Envoyer un message ───────────────────────────────────────────────────
  const sendMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (newMsg) => {
      setMessages(prev => [...prev, newMsg as ChatMsg]);
      setMessageText('');
    },
  });

  const handleSend = useCallback(() => {
    if (!messageText.trim() || !selectedConvId) return;
    sendMutation.mutate({
      conversationId: selectedConvId,
      senderId: adminId,
      senderName: adminName,
      senderRole: 'admin',
      content: messageText.trim(),
    });
  }, [messageText, selectedConvId, adminId, adminName]);

  // ── Conversation courante ────────────────────────────────────────────────
  const currentConv = conversations.find(c => c.conversationId === selectedConvId);
  const filteredConvs = conversations.filter(c =>
    c.chauffeurName.toLowerCase().includes(search.toLowerCase())
  );

  // ── Grouper les messages par date ────────────────────────────────────────
  const groupedMessages: { date: string; msgs: ChatMsg[] }[] = [];
  messages.forEach(msg => {
    const dateLabel = formatDate(msg.createdAt);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === dateLabel) {
      last.msgs.push(msg);
    } else {
      groupedMessages.push({ date: dateLabel, msgs: [msg] });
    }
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('chat.title')}</h1>
          <p className="text-muted-foreground mt-2">Messagerie en temps réel avec les chauffeurs</p>
        </div>

        {/* Chat Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[640px]">

          {/* ── Liste des conversations ── */}
          <Card className="lg:col-span-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-3 shrink-0">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Conversations
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un chauffeur..."
                  className="pl-8 h-9"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredConvs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Aucun chauffeur disponible
                </div>
              ) : filteredConvs.map(conv => (
                <button
                  key={conv.conversationId}
                  onClick={() => setSelectedConvId(conv.conversationId)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    selectedConvId === conv.conversationId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{conv.chauffeurName}</p>
                        <p className="text-xs text-muted-foreground">Chauffeur</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {conv.lastTime && (
                        <span className="text-xs text-muted-foreground">{formatTime(conv.lastTime)}</span>
                      )}
                      {conv.unread > 0 && (
                        <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {conv.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {conv.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate mt-1">{conv.lastMessage}</p>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* ── Zone de chat ── */}
          <Card className="lg:col-span-2 flex flex-col overflow-hidden">
            {currentConv ? (
              <>
                {/* Header de la conversation */}
                <CardHeader className="border-b pb-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{currentConv.chauffeurName}</p>
                        <p className="text-xs text-muted-foreground">Chauffeur</p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => refetchMessages()}
                      title="Actualiser"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : groupedMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 opacity-20" />
                      <p className="text-sm">Aucun message. Commencez la conversation.</p>
                    </div>
                  ) : (
                    groupedMessages.map(group => (
                      <div key={group.date}>
                        {/* Séparateur de date */}
                        <div className="flex items-center gap-3 my-4">
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-xs text-muted-foreground bg-background px-2">{group.date}</span>
                          <div className="flex-1 h-px bg-border" />
                        </div>
                        {/* Bulles de messages */}
                        {group.msgs.map(msg => {
                          const isAdmin = msg.senderRole === 'admin';
                          return (
                            <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-2`}>
                              {!isAdmin && (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mr-2 mt-1 shrink-0">
                                  <User className="h-3.5 w-3.5 text-white" />
                                </div>
                              )}
                              <div className={`max-w-sm ${isAdmin ? 'items-end' : 'items-start'} flex flex-col`}>
                                {!isAdmin && (
                                  <span className="text-xs text-muted-foreground mb-1">{msg.senderName}</span>
                                )}
                                <div className={`px-4 py-2.5 rounded-2xl ${
                                  isAdmin
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                                }`}>
                                  <p className="text-sm leading-relaxed">{msg.content}</p>
                                </div>
                                <span className={`text-xs mt-1 ${isAdmin ? 'text-right' : 'text-left'} text-muted-foreground`}>
                                  {formatTime(msg.createdAt)}
                                  {isAdmin && msg.isRead && <span className="ml-1 text-blue-400">Lu</span>}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Saisie du message */}
                <div className="border-t p-4 shrink-0">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Écrire un message..."
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      disabled={sendMutation.isPending}
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      onClick={handleSend}
                      disabled={!messageText.trim() || sendMutation.isPending}
                    >
                      {sendMutation.isPending
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Send className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Appuyez sur Entrée pour envoyer — les messages sont actualisés toutes les 3 secondes
                  </p>
                </div>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                <MessageSquare className="h-12 w-12 opacity-20" />
                <p>Sélectionnez une conversation</p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
