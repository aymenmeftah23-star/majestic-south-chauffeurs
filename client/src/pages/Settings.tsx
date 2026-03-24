import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { Settings as SettingsIcon, User, Lock, Save, Check } from 'lucide-react';

const GOLD = "#C9A84C";

export default function Settings() {
  const { data: currentUser } = trpc.auth.me.useQuery();
  const updateMutation = trpc.members.update.useMutation();

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [saved, setSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        phone: (currentUser as any).phone || '',
      });
    }
  }, [currentUser]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    try {
      await updateMutation.mutateAsync({
        id: currentUser.id,
        name: profileForm.name,
        phone: profileForm.phone,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Erreur sauvegarde profil:', err);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Le mot de passe doit faire au moins 8 caracteres');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }
    if (!currentUser) return;
    try {
      await updateMutation.mutateAsync({
        id: currentUser.id,
        password: passwordForm.newPassword,
      });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err) {
      setPasswordError('Erreur lors du changement de mot de passe');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Parametres</h1>
          <p className="text-gray-400 mt-1">Gerez votre profil et vos preferences</p>
        </div>

        {/* Profil */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User size={20} style={{ color: GOLD }} />
              Informations du profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Email</label>
              <Input
                value={currentUser?.email || ''}
                disabled
                className="bg-gray-800 border-gray-700 text-gray-500"
              />
              <p className="text-xs text-gray-600 mt-1">L'email ne peut pas etre modifie</p>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Nom complet</label>
              <Input
                value={profileForm.name}
                onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Telephone</label>
              <Input
                value={profileForm.phone}
                onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="+33 6 00 00 00 00"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Role</label>
              <Input
                value={(currentUser as any)?.role || 'admin'}
                disabled
                className="bg-gray-800 border-gray-700 text-gray-500"
              />
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={updateMutation.isPending}
              style={{ backgroundColor: GOLD }}
              className="text-black"
            >
              {saved ? <><Check size={16} className="mr-2" /> Sauvegarde</> : <><Save size={16} className="mr-2" /> Enregistrer</>}
            </Button>
          </CardContent>
        </Card>

        {/* Mot de passe */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock size={20} style={{ color: GOLD }} />
              Changer le mot de passe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Nouveau mot de passe</label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Minimum 8 caracteres"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Confirmer le mot de passe</label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            {passwordError && (
              <p className="text-red-400 text-sm">{passwordError}</p>
            )}
            <Button
              onClick={handleChangePassword}
              disabled={updateMutation.isPending}
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              {passwordSaved ? <><Check size={16} className="mr-2" /> Mot de passe modifie</> : 'Changer le mot de passe'}
            </Button>
          </CardContent>
        </Card>

        {/* Informations systeme */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <SettingsIcon size={20} style={{ color: GOLD }} />
              Informations systeme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Version</span>
                <span className="text-white">4.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Environnement</span>
                <span className="text-white">Production</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Base de donnees</span>
                <span className="text-green-400">MySQL connectee</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">SMTP</span>
                <span className="text-green-400">mail.mschauffeur.fr</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
