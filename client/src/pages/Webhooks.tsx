import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Webhook, Plus, Trash2, Copy, Check } from 'lucide-react';

const GOLD = "#C9A84C";

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
  lastTriggered: Date | null;
  failCount: number;
}

const AVAILABLE_EVENTS = [
  'mission.created', 'mission.updated', 'mission.completed',
  'demand.created', 'demand.confirmed',
  'payment.received', 'payment.refunded',
  'quote.accepted', 'chauffeur.assigned', 'client.created',
];

export default function Webhooks() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ url: '', events: [] as string[] });
  const [copied, setCopied] = useState<string | null>(null);

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'whsec_';
    for (let i = 0; i < 32; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const handleAdd = () => {
    if (!newWebhook.url || newWebhook.events.length === 0) return;
    const wh: WebhookConfig = {
      id: Date.now().toString(), url: newWebhook.url, events: newWebhook.events,
      active: true, secret: generateSecret(), lastTriggered: null, failCount: 0,
    };
    setWebhooks([wh, ...webhooks]);
    setNewWebhook({ url: '', events: [] });
    setShowForm(false);
  };

  const handleDelete = (id: string) => setWebhooks(webhooks.filter(w => w.id !== id));
  const handleToggle = (id: string) => setWebhooks(webhooks.map(w => w.id === id ? { ...w, active: !w.active } : w));
  const handleCopy = (text: string) => { navigator.clipboard.writeText(text); setCopied(text); setTimeout(() => setCopied(null), 2000); };
  const toggleEvent = (event: string) => setNewWebhook(p => ({ ...p, events: p.events.includes(event) ? p.events.filter(e => e !== event) : [...p.events, event] }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Webhooks</h1>
            <p className="text-gray-400 mt-1">Configurez des webhooks pour recevoir des notifications en temps reel</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} style={{ backgroundColor: GOLD }} className="text-black">
            <Plus size={16} className="mr-2" /> Nouveau webhook
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{webhooks.length}</p>
              <p className="text-gray-400 text-sm">Total webhooks</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{webhooks.filter(w => w.active).length}</p>
              <p className="text-gray-400 text-sm">Actifs</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-400">{webhooks.filter(w => w.failCount > 0).length}</p>
              <p className="text-gray-400 text-sm">En erreur</p>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 space-y-4">
              <p className="text-white font-medium">Configurer un webhook</p>
              <div>
                <label className="text-sm text-gray-400 block mb-1">URL de destination</label>
                <Input value={newWebhook.url} onChange={e => setNewWebhook(p => ({ ...p, url: e.target.value }))} className="bg-gray-800 border-gray-700 text-white" placeholder="https://votre-serveur.com/webhook" />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Evenements</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_EVENTS.map(event => (
                    <button key={event} onClick={() => toggleEvent(event)} className={`px-3 py-1 rounded text-sm border transition-all ${newWebhook.events.includes(event) ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                      {event}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdd} style={{ backgroundColor: GOLD }} className="text-black">Creer</Button>
                <Button onClick={() => setShowForm(false)} variant="outline" className="border-gray-700 text-gray-300">Annuler</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {webhooks.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-12 text-center">
              <Webhook size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg">Aucun webhook configure</p>
              <p className="text-gray-500 text-sm mt-2">Les webhooks permettent d'integrer Majestic South avec vos outils externes</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {webhooks.map(wh => (
              <Card key={wh.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={wh.active ? 'border-green-600 text-green-400' : 'border-gray-700 text-gray-500'}>{wh.active ? 'Actif' : 'Inactif'}</Badge>
                        {wh.failCount > 0 && <Badge variant="outline" className="border-red-600 text-red-400">{wh.failCount} erreurs</Badge>}
                      </div>
                      <p className="text-white font-mono text-sm">{wh.url}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-gray-700 text-gray-300" onClick={() => handleToggle(wh.id)}>{wh.active ? 'Desactiver' : 'Activer'}</Button>
                      <Button size="sm" variant="ghost" className="text-red-400" onClick={() => handleDelete(wh.id)}><Trash2 size={16} /></Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {wh.events.map(e => (<span key={e} className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">{e}</span>))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <span>Secret:</span>
                      <code className="bg-gray-800 px-2 py-0.5 rounded">{wh.secret.substring(0, 12)}...</code>
                      <button onClick={() => handleCopy(wh.secret)} className="hover:text-white">
                        {copied === wh.secret ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                    <span>{wh.lastTriggered ? `Dernier appel: ${wh.lastTriggered.toLocaleString('fr-FR')}` : 'Jamais declenche'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
