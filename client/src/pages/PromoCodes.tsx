import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tag, Plus, Trash2, Copy, Check } from 'lucide-react';

const GOLD = "#C9A84C";

interface PromoCode {
  id: string;
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  maxUses: number;
  usedCount: number;
  validUntil: string;
  active: boolean;
}

export default function PromoCodes() {
  const [codes, setCodes] = useState<PromoCode[]>([
    { id: '1', code: 'BIENVENUE10', discount: 10, type: 'percent', maxUses: 100, usedCount: 0, validUntil: '2026-12-31', active: true },
    { id: '2', code: 'VIP20', discount: 20, type: 'percent', maxUses: 50, usedCount: 0, validUntil: '2026-06-30', active: true },
    { id: '3', code: 'NOEL50', discount: 50, type: 'fixed', maxUses: 30, usedCount: 0, validUntil: '2026-12-25', active: false },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newCode, setNewCode] = useState({ code: '', discount: '', type: 'percent' as 'percent' | 'fixed', maxUses: '', validUntil: '' });
  const [copied, setCopied] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newCode.code || !newCode.discount) return;
    const promo: PromoCode = {
      id: Date.now().toString(),
      code: newCode.code.toUpperCase(),
      discount: parseInt(newCode.discount),
      type: newCode.type,
      maxUses: parseInt(newCode.maxUses) || 999,
      usedCount: 0,
      validUntil: newCode.validUntil || '2026-12-31',
      active: true,
    };
    setCodes([promo, ...codes]);
    setNewCode({ code: '', discount: '', type: 'percent', maxUses: '', validUntil: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setCodes(codes.filter(c => c.id !== id));
  };

  const handleToggle = (id: string) => {
    setCodes(codes.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Codes Promotionnels</h1>
            <p className="text-gray-400 mt-1">Gerez vos codes de reduction pour les clients</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            style={{ backgroundColor: GOLD }}
            className="text-black"
          >
            <Plus size={16} className="mr-2" /> Nouveau code
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{codes.length}</p>
              <p className="text-gray-400 text-sm">Total codes</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{codes.filter(c => c.active).length}</p>
              <p className="text-gray-400 text-sm">Codes actifs</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{codes.reduce((s, c) => s + c.usedCount, 0)}</p>
              <p className="text-gray-400 text-sm">Utilisations totales</p>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 space-y-4">
              <p className="text-white font-medium">Creer un nouveau code</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Code</label>
                  <Input
                    value={newCode.code}
                    onChange={e => setNewCode(p => ({ ...p, code: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white uppercase"
                    placeholder="Ex: PROMO20"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Reduction</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={newCode.discount}
                      onChange={e => setNewCode(p => ({ ...p, discount: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="10"
                    />
                    <select
                      value={newCode.type}
                      onChange={e => setNewCode(p => ({ ...p, type: e.target.value as 'percent' | 'fixed' }))}
                      className="bg-gray-800 border border-gray-700 text-white rounded px-3"
                    >
                      <option value="percent">%</option>
                      <option value="fixed">EUR</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Utilisations max</label>
                  <Input
                    type="number"
                    value={newCode.maxUses}
                    onChange={e => setNewCode(p => ({ ...p, maxUses: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Valide jusqu'au</label>
                  <Input
                    type="date"
                    value={newCode.validUntil}
                    onChange={e => setNewCode(p => ({ ...p, validUntil: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdd} style={{ backgroundColor: GOLD }} className="text-black">Creer</Button>
                <Button onClick={() => setShowForm(false)} variant="outline" className="border-gray-700 text-gray-300">Annuler</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {codes.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-12 text-center">
              <Tag size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg">Aucun code promotionnel</p>
              <p className="text-gray-500 text-sm mt-2">Creez votre premier code de reduction</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {codes.map(code => (
              <Card key={code.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-800 rounded px-3 py-2 font-mono text-lg text-white tracking-wider">
                        {code.code}
                      </div>
                      <button onClick={() => handleCopy(code.code)} className="text-gray-500 hover:text-white">
                        {copied === code.code ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                      </button>
                      <Badge
                        variant="outline"
                        className={code.active ? 'border-green-600 text-green-400' : 'border-gray-700 text-gray-500'}
                      >
                        {code.active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-white font-bold text-lg" style={{ color: GOLD }}>
                          -{code.discount}{code.type === 'percent' ? '%' : ' EUR'}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {code.usedCount}/{code.maxUses} utilisations
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">Expire le</p>
                        <p className="text-white text-sm">{new Date(code.validUntil).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-700 text-gray-300"
                          onClick={() => handleToggle(code.id)}
                        >
                          {code.active ? 'Desactiver' : 'Activer'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => handleDelete(code.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
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
