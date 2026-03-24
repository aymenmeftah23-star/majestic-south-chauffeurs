import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

export default function CreateClient() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '',
    type: 'particulier' as 'particulier' | 'business' | 'hotel' | 'agence' | 'partenaire' | 'vip',
    address: '', preferences: '', notes: '',
  });

  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => navigate('/clients'),
    onError: (err) => alert('Erreur : ' + err.message),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
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

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('clients.create')}</h1>
            <p className="text-muted-foreground mt-1">{t('clients.createDesc')}</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('clients.name')}</label>
                <Input name="name" value={formData.name} onChange={handleChange} required placeholder="Jean Dupont" />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('clients.company')}</label>
                  <Input name="company" value={formData.company} onChange={handleChange} placeholder="Entreprise SA" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('clients.type')}</label>
                  <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="particulier">{t('clients.individual')}</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="hotel">{t('clients.hotel')}</SelectItem>
                      <SelectItem value="agence">{t('clients.agency')}</SelectItem>
                      <SelectItem value="partenaire">Partenaire</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('clients.address')}</label>
                <Input name="address" value={formData.address} onChange={handleChange} placeholder="123 rue de la Paix, Paris" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('clients.preferences')}</label>
                <Textarea name="preferences" value={formData.preferences} onChange={handleChange} rows={3} placeholder="Préférences du client..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('common.notes')}</label>
                <Textarea name="notes" placeholder={t('clients.notesPlaceholder')} value={formData.notes} onChange={handleChange} rows={4} />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {t('clients.create')}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/clients')}>{t('common.cancel')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
