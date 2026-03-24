import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { trpc } from '@/lib/trpc';

export default function EditChauffeur() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || '0');

  const { data: chauffeur, isLoading } = trpc.chauffeurs.getById.useQuery({ id }, { enabled: !!id });

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    licenseNumber: '', vtcCard: '',
    languages: [] as string[], zones: [] as string[],
    status: 'disponible' as 'disponible' | 'en_mission' | 'indisponible' | 'conge' | 'suspendu',
    type: 'interne' as 'interne' | 'partenaire',
    notes: '',
  });

  useEffect(() => {
    if (chauffeur) {
      const nameParts = (chauffeur.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      setFormData({
        firstName,
        lastName,
        email: chauffeur.email || '',
        phone: chauffeur.phone || '',
        licenseNumber: (chauffeur as any).licenseNumber || '',
        vtcCard: (chauffeur as any).vtcCard || '',
        languages: chauffeur.languages ? chauffeur.languages.split(', ').filter(Boolean) : [],
        zones: chauffeur.zones ? chauffeur.zones.split(', ').filter(Boolean) : [],
        status: (chauffeur.status as any) || 'disponible',
        type: (chauffeur.type as any) || 'interne',
        notes: chauffeur.notes || '',
      });
    }
  }, [chauffeur]);

  const updateMutation = trpc.chauffeurs.update.useMutation({
    onSuccess: () => navigate(`/chauffeurs/${id}`),
    onError: (err) => alert('Erreur : ' + err.message),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckbox = (field: 'languages' | 'zones', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email || undefined,
      phone: formData.phone,
      licenseNumber: formData.licenseNumber || undefined,
      vtcCard: formData.vtcCard || undefined,
      languages: formData.languages.join(', ') || undefined,
      zones: formData.zones.join(', ') || undefined,
      status: formData.status,
      type: formData.type,
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
          <Button variant="ghost" size="icon" onClick={() => navigate(`/chauffeurs/${id}`)}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modifier le chauffeur</h1>
            <p className="text-muted-foreground mt-1">{chauffeur?.name}</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prénom *</label>
                  <Input name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom *</label>
                  <Input name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
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
                  <label className="text-sm font-medium">N° Permis</label>
                  <Input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="123456789012" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Carte VTC</label>
                  <Input name="vtcCard" value={formData.vtcCard} onChange={handleChange} placeholder="EVTC0132..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Statut</label>
                  <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponible">Disponible</SelectItem>
                      <SelectItem value="en_mission">En mission</SelectItem>
                      <SelectItem value="indisponible">Indisponible</SelectItem>
                      <SelectItem value="conge">En congé</SelectItem>
                      <SelectItem value="suspendu">Suspendu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interne">Interne</SelectItem>
                      <SelectItem value="partenaire">Partenaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium">Langues parlées</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Français', 'Anglais', 'Espagnol', 'Allemand', 'Arabe', 'Mandarin'].map(lang => (
                    <div key={lang} className="flex items-center gap-2">
                      <Checkbox checked={formData.languages.includes(lang)} onCheckedChange={() => handleCheckbox('languages', lang)} />
                      <label className="text-sm">{lang}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium">Zones de travail</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Marseille', 'Aix-en-Provence', 'Toulon', 'Nice', 'Lyon', 'Paris', 'Côte d\'Azur', 'Provence', 'PACA'].map(zone => (
                    <div key={zone} className="flex items-center gap-2">
                      <Checkbox checked={formData.zones.includes(zone)} onCheckedChange={() => handleCheckbox('zones', zone)} />
                      <label className="text-sm">{zone}</label>
                    </div>
                  ))}
                </div>
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
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(`/chauffeurs/${id}`)}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
