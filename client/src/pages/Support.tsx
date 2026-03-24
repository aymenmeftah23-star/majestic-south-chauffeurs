import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Headphones, Plus, MessageSquare, Clock, CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react';

const GOLD = "#C9A84C";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  priority: 'haute' | 'moyenne' | 'basse';
  status: 'ouvert' | 'en_cours' | 'resolu';
  createdAt: Date;
  responses: Array<{ from: string; message: string; date: Date }>;
}

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '', priority: 'moyenne' as 'haute' | 'moyenne' | 'basse' });
  const [replyText, setReplyText] = useState('');

  const handleCreate = () => {
    if (!newTicket.subject || !newTicket.message) return;
    const ticket: Ticket = {
      id: `T-${Date.now()}`,
      subject: newTicket.subject,
      message: newTicket.message,
      priority: newTicket.priority,
      status: 'ouvert',
      createdAt: new Date(),
      responses: [],
    };
    setTickets([ticket, ...tickets]);
    setNewTicket({ subject: '', message: '', priority: 'moyenne' });
    setShowForm(false);
  };

  const handleReply = () => {
    if (!replyText || !selectedTicket) return;
    const updated = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'en_cours' as const,
          responses: [...t.responses, { from: 'Admin', message: replyText, date: new Date() }],
        };
      }
      return t;
    });
    setTickets(updated);
    setSelectedTicket(updated.find(t => t.id === selectedTicket.id) || null);
    setReplyText('');
  };

  const handleResolve = (id: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: 'resolu' as const } : t));
    if (selectedTicket?.id === id) {
      setSelectedTicket({ ...selectedTicket, status: 'resolu' });
    }
  };

  const priorityColors: Record<string, string> = {
    haute: 'border-red-600 text-red-400',
    moyenne: 'border-yellow-600 text-yellow-400',
    basse: 'border-green-600 text-green-400',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Support</h1>
            <p className="text-gray-400 mt-1">Gestion des tickets de support et demandes d'assistance</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} style={{ backgroundColor: GOLD }} className="text-black">
            <Plus size={16} className="mr-2" /> Nouveau ticket
          </Button>
        </div>

        {/* Contact rapide */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail size={20} style={{ color: GOLD }} />
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white font-medium">contact@mschauffeur.fr</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} style={{ color: GOLD }} />
                <div>
                  <p className="text-gray-400 text-sm">Telephone</p>
                  <p className="text-white font-medium">+33 6 95 61 89 98</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{tickets.length}</p>
              <p className="text-gray-400 text-sm">Total tickets</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-400">{tickets.filter(t => t.status === 'ouvert').length}</p>
              <p className="text-gray-400 text-sm">Ouverts</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-yellow-400">{tickets.filter(t => t.status === 'en_cours').length}</p>
              <p className="text-gray-400 text-sm">En cours</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{tickets.filter(t => t.status === 'resolu').length}</p>
              <p className="text-gray-400 text-sm">Resolus</p>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 space-y-4">
              <p className="text-white font-medium">Creer un ticket</p>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Sujet</label>
                <Input
                  value={newTicket.subject}
                  onChange={e => setNewTicket(p => ({ ...p, subject: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Objet du ticket"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Message</label>
                <textarea
                  value={newTicket.message}
                  onChange={e => setNewTicket(p => ({ ...p, message: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded p-3 min-h-[100px]"
                  placeholder="Decrivez votre probleme..."
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Priorite</label>
                <select
                  value={newTicket.priority}
                  onChange={e => setNewTicket(p => ({ ...p, priority: e.target.value as any }))}
                  className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
                >
                  <option value="basse">Basse</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="haute">Haute</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} style={{ backgroundColor: GOLD }} className="text-black">Creer le ticket</Button>
                <Button onClick={() => setShowForm(false)} variant="outline" className="border-gray-700 text-gray-300">Annuler</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {tickets.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-12 text-center">
                  <Headphones size={48} className="mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 text-lg">Aucun ticket de support</p>
                  <p className="text-gray-500 text-sm mt-2">Creez un ticket pour commencer</p>
                </CardContent>
              </Card>
            ) : (
              tickets.map(ticket => (
                <Card
                  key={ticket.id}
                  className={`bg-gray-900 border-gray-800 cursor-pointer transition-all ${selectedTicket?.id === ticket.id ? 'ring-1' : ''}`}
                  style={selectedTicket?.id === ticket.id ? { borderColor: GOLD } : {}}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {ticket.status === 'ouvert' && <AlertCircle size={16} className="text-red-400" />}
                          {ticket.status === 'en_cours' && <Clock size={16} className="text-yellow-400" />}
                          {ticket.status === 'resolu' && <CheckCircle size={16} className="text-green-400" />}
                          <p className="text-white font-medium">{ticket.subject}</p>
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-1">{ticket.message}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="outline" className={priorityColors[ticket.priority]}>
                            {ticket.priority}
                          </Badge>
                          <span className="text-gray-600 text-xs">
                            {ticket.createdAt.toLocaleDateString('fr-FR')}
                          </span>
                          {ticket.responses.length > 0 && (
                            <span className="text-gray-500 text-xs flex items-center gap-1">
                              <MessageSquare size={12} /> {ticket.responses.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {selectedTicket && (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-lg">{selectedTicket.subject}</p>
                    <p className="text-gray-500 text-xs">{selectedTicket.id}</p>
                  </div>
                  {selectedTicket.status !== 'resolu' && (
                    <Button
                      size="sm"
                      onClick={() => handleResolve(selectedTicket.id)}
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      <CheckCircle size={14} className="mr-1" /> Marquer resolu
                    </Button>
                  )}
                </div>

                <div className="bg-gray-800 rounded p-3">
                  <p className="text-gray-400 text-xs mb-1">Message initial</p>
                  <p className="text-white text-sm">{selectedTicket.message}</p>
                </div>

                {selectedTicket.responses.map((r, i) => (
                  <div key={i} className="bg-gray-800/50 rounded p-3 border-l-2" style={{ borderColor: GOLD }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium" style={{ color: GOLD }}>{r.from}</p>
                      <p className="text-gray-600 text-xs">{r.date.toLocaleString('fr-FR')}</p>
                    </div>
                    <p className="text-white text-sm">{r.message}</p>
                  </div>
                ))}

                {selectedTicket.status !== 'resolu' && (
                  <div className="flex gap-2">
                    <Input
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Votre reponse..."
                      onKeyDown={e => e.key === 'Enter' && handleReply()}
                    />
                    <Button onClick={handleReply} style={{ backgroundColor: GOLD }} className="text-black">
                      Envoyer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
