import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

export default function CreateChauffeur() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    languages: [] as string[], zones: [] as string[],
    type: 'interne' as 'interne' | 'partenaire', notes: '',
  });

  const createMutation = trpc.chauffeurs.create.useMutation({
    onSuccess: () => navigate('/chauffeurs'),
    onError: (err) => alert('Erreur : ' + err.message),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckbox = (field: 'languages' | 'zones', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter(i => i !== value) : [...prev[field], value],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email || undefined,
      phone: formData.phone,
      languages: formData.languages.join(', ') || undefined,
      zones: formData.zones.join(', ') || undefined,
      type: formData.type,
      notes: formData.notes || undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/chauffeurs')}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('chauffeurs.create')}</h1>
            <p className="text-muted-foreground mt-1">{t('chauffeurs.createDesc')}</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('common.firstName')}</label>
                  <Input name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('common.lastName')}</label>
                  <Input name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('common.email')}</label>
                  <Input type="email" name="email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('common.phone')}</label>
                  <Input name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interne">{t('chauffeurs.internal')}</SelectItem>
                    <SelectItem value="partenaire">{t('chauffeurs.external')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium">{t('chauffeurs.languages')}</label>
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
                <label className="text-sm font-medium">{t('chauffeurs.zones')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Paris', 'Île-de-France', 'CDG', 'Orly', 'Banlieue', 'Province'].map(zone => (
                    <div key={zone} className="flex items-center gap-2">
                      <Checkbox checked={formData.zones.includes(zone)} onCheckedChange={() => handleCheckbox('zones', zone)} />
                      <label className="text-sm">{zone}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('common.notes')}</label>
                <Textarea name="notes" placeholder={t('chauffeurs.notesPlaceholder')} value={formData.notes} onChange={handleChange} rows={4} />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {t('chauffeurs.create')}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/chauffeurs')}>{t('common.cancel')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
