import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Search, Phone, Video, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface Message {
  id: number;
  sender: string;
  senderType: 'client' | 'chauffeur' | 'admin';
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: number;
  participantName: string;
  participantType: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatar?: string;
  online: boolean;
}

export default function Chat() {
  const { t } = useLanguage();
  const [selectedConversation, setSelectedConversation] = useState<number>(1);
  const [messageText, setMessageText] = useState('');

  // Mock conversations
  const conversations: Conversation[] = [
    {
      id: 1,
      participantName: 'Jean Dupont',
      participantType: 'Chauffeur',
      lastMessage: 'Je suis arrivé à destination',
      lastMessageTime: '14:35',
      unreadCount: 0,
      online: true,
    },
    {
      id: 2,
      participantName: 'Marie Martin',
      participantType: 'Client',
      lastMessage: 'Merci pour le service!',
      lastMessageTime: '13:20',
      unreadCount: 2,
      online: false,
    },
    {
      id: 3,
      participantName: 'Pierre Durand',
      participantType: 'Chauffeur',
      lastMessage: 'Quelle est mon prochaine mission?',
      lastMessageTime: '12:15',
      unreadCount: 1,
      online: true,
    },
  ];

  // Mock messages for selected conversation
  const messages: Message[] = [
    {
      id: 1,
      sender: 'Jean Dupont',
      senderType: 'chauffeur',
      content: 'Bonjour, je suis en route pour vous chercher',
      timestamp: '14:20',
      read: true,
    },
    {
      id: 2,
      sender: 'Vous',
      senderType: 'client',
      content: 'Merci! À quelle heure arrivez-vous?',
      timestamp: '14:22',
      read: true,
    },
    {
      id: 3,
      sender: 'Jean Dupont',
      senderType: 'chauffeur',
      content: 'J\'arrive dans 5 minutes',
      timestamp: '14:30',
      read: true,
    },
    {
      id: 4,
      sender: 'Jean Dupont',
      senderType: 'chauffeur',
      content: 'Je suis arrivé à destination',
      timestamp: '14:35',
      read: true,
    },
  ];

  const currentConversation = conversations.find((c) => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('chat.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('chat.description')}</p>
        </div>

        {/* Chat Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('chat.conversations')}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3 overflow-y-auto">
              <div className="mb-3">
                <Input
                  placeholder={t('common.search')}
                  className="h-9"
                />
              </div>

              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedConversation === conversation.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full" />
                        {conversation.online && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{conversation.participantName}</p>
                        <p className="text-xs text-muted-foreground">{conversation.participantType}</p>
                      </div>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="default" className="text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col">
            {currentConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full" />
                        {currentConversation.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{currentConversation.participantName}</p>
                        <p className="text-xs text-muted-foreground">
                          {currentConversation.online ? t('chat.online') : t('chat.offline')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderType === 'client' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.senderType === 'client'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderType === 'client'
                              ? 'text-blue-100'
                              : 'text-gray-600'
                          }`}
                        >
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('chat.messagePlaceholder')}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                      }}
                    />
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">{t('chat.selectConversation')}</p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
