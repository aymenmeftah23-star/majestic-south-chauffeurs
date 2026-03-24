import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { trpc } from '@/lib/trpc';

export default function EditClient() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || '0');

  const { data: client, isLoading } = trpc.clients.getById.useQuery({ id }, { enabled: !!id });

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '',
    type: 'particulier' as 'particulier' | 'business' | 'hotel' | 'agence' | 'partenaire' | 'vip',
    address: '', preferences: '', notes: '',
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        type: (client.type as any) || 'particulier',
        address: client.address || '',
        preferences: client.preferences || '',
        notes: client.notes || '',
      });
    }
  }, [client]);

  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => navigate(`/clients/${id}`),
    onError: (err) => toast.error('Erreur : ' + err.message),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id,
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone,
      company: formData.company || undefined,
      type: formData.type,
      address: formData.address || undefined,
      preferences: formData.preferences || undefined,
      notes: formData.notes || undefined,
    });
  };

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/clients/${id}`)}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modifier le client</h1>
            <p className="text-muted-foreground mt-1">{client?.name}</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom complet *</label>
                <Input name="name" value={formData.name} onChange={handleChange} required placeholder="Jean Dupont" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" name="email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Téléphone *</label>
                  <Input name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Société</label>
                  <Input name="company" value={formData.company} onChange={handleChange} placeholder="Entreprise SA" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type de client</label>
                  <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="particulier">Particulier</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="hotel">Hôtel</SelectItem>
                      <SelectItem value="agence">Agence</SelectItem>
                      <SelectItem value="partenaire">Partenaire</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Adresse</label>
                <Input name="address" value={formData.address} onChange={handleChange} placeholder="123 rue de la Paix, Marseille" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Préférences</label>
                <Textarea name="preferences" value={formData.preferences} onChange={handleChange} rows={3} placeholder="Préférences du client..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes internes</label>
                <Textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} placeholder="Notes internes..." />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Enregistrer les modifications
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(`/clients/${id}`)}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
