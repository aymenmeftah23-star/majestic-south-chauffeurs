import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Bell, Lock, Palette, FileText, Building2 } from 'lucide-react';

export default function Settings() {
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('settings.description')}</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              {t('settings.general')}
            </TabsTrigger>
            <TabsTrigger value="legal" className="gap-2">
              <Building2 className="h-4 w-4" />
              Informations légales
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              {t('settings.notifications')}
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              {t('settings.security')}
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              {t('settings.appearance')}
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.companyInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('settings.companyName')}</Label>
                  <Input defaultValue="Majestic South Chauffeurs" />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.email')}</Label>
                  <Input defaultValue="contact@mschauffeur.fr" />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.phone')}</Label>
                  <Input defaultValue="+33 6 95 61 89 98" />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.address')}</Label>
                  <Input defaultValue="Bât D, 131 Boulevard de Saint-Loup, 13010 Marseille" />
                </div>
                <Button>{t('common.save')}</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('settings.businessHours')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('settings.openingTime')}</Label>
                    <Input type="time" defaultValue="06:00" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('settings.closingTime')}</Label>
                    <Input type="time" defaultValue="23:00" />
                  </div>
                </div>
                <Button>{t('common.save')}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Informations légales */}
          <TabsContent value="legal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Identité de l'entreprise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Raison sociale</p>
                    <p className="font-semibold">Majestic South Chauffeurs</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Forme juridique</p>
                    <p className="font-semibold">SAS — Société par actions simplifiée</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Dirigeant</p>
                    <p className="font-semibold">Aymen MEFTAH — Président</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date de création</p>
                    <p className="font-semibold">15 avril 2025</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Capital social</p>
                    <p className="font-semibold">1 500,00 € (fixe)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Clôture exercice</p>
                    <p className="font-semibold">31 décembre</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Adresse du siège social</p>
                  <p className="font-semibold">Bât D, 131 Boulevard de Saint-Loup, 13010 Marseille</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Activité principale (NAF/APE)</p>
                  <p className="font-semibold">Autre transport de personnes sur demande par véhicule avec chauffeur</p>
                  <Badge variant="outline" className="text-xs mt-1">Code 49.33H</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Identifiants fiscaux et légaux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">SIREN</p>
                    <p className="font-mono font-semibold text-lg">943 399 311</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">SIRET (siège)</p>
                    <p className="font-mono font-semibold text-lg">943 399 311 00019</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">N° TVA Intracommunautaire</p>
                    <p className="font-mono font-semibold text-lg">FR39 943 399 311</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Immatriculation RNE</p>
                    <p className="font-semibold">21 mai 2025 (INPI)</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Taux de TVA applicables</p>
                  <div className="flex gap-3">
                    <div className="flex-1 p-3 rounded-lg border bg-accent/30">
                      <p className="text-sm font-semibold">10%</p>
                      <p className="text-xs text-muted-foreground">Transferts (aéroport, gare)</p>
                    </div>
                    <div className="flex-1 p-3 rounded-lg border bg-accent/30">
                      <p className="text-sm font-semibold">20%</p>
                      <p className="text-xs text-muted-foreground">Mise à disposition, événements</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.emailNotifications')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('settings.newDemands')}</p>
                    <p className="text-sm text-muted-foreground">{t('settings.notifyNewDemands')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('settings.missionUpdates')}</p>
                    <p className="text-sm text-muted-foreground">{t('settings.notifyMissionUpdates')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('settings.alerts')}</p>
                    <p className="text-sm text-muted-foreground">{t('settings.notifyAlerts')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button>{t('common.save')}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.password')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('settings.currentPassword')}</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.newPassword')}</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.confirmPassword')}</Label>
                  <Input type="password" />
                </div>
                <Button>{t('common.save')}</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('settings.twoFactor')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t('settings.twoFactorDesc')}</p>
                <Button variant="outline">{t('settings.enable')}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.theme')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('settings.darkMode')}</p>
                    <p className="text-sm text-muted-foreground">{t('settings.darkModeDesc')}</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('settings.language')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t('settings.languageDesc')}</p>
                <div className="flex gap-2">
                  <Button variant="outline">Français</Button>
                  <Button variant="outline">English</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="text-red-600">{t('settings.dangerZone')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">{t('settings.deleteAccountWarning')}</p>
              <Button variant="destructive">{t('settings.deleteAccount')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
