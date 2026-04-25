import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Car, Flame, MapPin, Sun, User, Users } from 'lucide-react';
import { type IntakeData, type RoofType, type Orientation } from '../lib/solar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { cn } from '../lib/utils';

interface IntakeProps {
  onComplete: (data: IntakeData) => void;
}

const DEFAULT_DATA: IntakeData = {
  address: '',
  postalCode: '',
  roofType: 'gable',
  roofArea: 80,
  orientation: 'S',
  monthlyBill: 150,
  hasEV: false,
  hasHeatPump: false,
};

const PERSONAS: Array<{ id: string; label: string; sub: string; icon: React.FC<{ className?: string }>; monthlyBill: number; hasEV: boolean; hasHeatPump: boolean; }> = [
  { id: 'single', label: 'Single / couple', sub: '~€60 / month', icon: User, monthlyBill: 60, hasEV: false, hasHeatPump: false },
  { id: 'family', label: 'Family of 4', sub: '~€150 / month', icon: Users, monthlyBill: 150, hasEV: false, hasHeatPump: false },
  { id: 'ev', label: 'Family + EV', sub: '~€220 + wallbox', icon: Car, monthlyBill: 220, hasEV: true, hasHeatPump: false },
  { id: 'all', label: 'All-electric home', sub: '~€320 + heat pump', icon: Flame, monthlyBill: 320, hasEV: true, hasHeatPump: true },
];

export function Intake({ onComplete }: IntakeProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<IntakeData>(DEFAULT_DATA);

  // Load from local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('solaric.intake.v1');
        if (saved) {
          setData(prev => ({ ...prev, ...JSON.parse(saved) }));
        }
      } catch (e) {
        console.error('Failed to parse intake data', e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('solaric.intake.v1', JSON.stringify(data));
      } catch (e) {
        console.error('Failed to save intake data', e);
      }
    }
  }, [data]);

  const updateData = (updates: Partial<IntakeData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (step < 2) setStep(s => s + 1);
    else onComplete(data);
  };

  const getActivePersona = () => {
    return PERSONAS.find(
      p => p.monthlyBill === data.monthlyBill && p.hasEV === data.hasEV && p.hasHeatPump === data.hasHeatPump
    )?.id;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-8 sm:pt-16 items-center px-4">
      <div className="w-full max-w-xl">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-solar flex items-center justify-center text-primary-foreground shadow-sm">
              <Sun className="w-6 h-6" />
            </div>
            <span className="font-display text-3xl tracking-tight">Tectum</span>
          </div>
          <div className="text-sm font-medium text-muted-foreground">Step {step + 1} of 3</div>
        </header>

        <div className="flex gap-2 mb-8">
          {[0, 1, 2].map(s => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full bg-border transition-colors duration-300",
                s <= step && "bg-primary"
              )}
            />
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-[20px] p-6 sm:p-8 border border-border shadow-[0_2px_12px_rgba(0,0,0,0.06)] mb-12"
        >
          {step === 0 && (
            <div className="space-y-6">
              <h1 className="font-display text-4xl mb-6">Where is the project?</h1>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="address"
                    value={data.address}
                    onChange={e => updateData({ address: e.target.value })}
                    className="pl-10 h-12 text-base"
                    placeholder="Enter street and house number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal code</Label>
                <Input
                  id="postalCode"
                  value={data.postalCode}
                  onChange={e => updateData({ postalCode: e.target.value })}
                  className="max-w-[160px] h-12 text-base"
                  placeholder="e.g. 10115"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <h1 className="font-display text-4xl mb-6">What is the roof like?</h1>
              
              <div className="space-y-3">
                <Label>Roof type</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['gable', 'hip', 'flat', 'shed'] as RoofType[]).map(rt => (
                    <button
                      key={rt}
                      onClick={() => updateData({ roofType: rt })}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-colors",
                        data.roofType === rt 
                          ? "border-primary bg-primary/5 text-primary" 
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      {/* Simple SVG silhouttes for each roof type */}
                      {rt === 'gable' && <svg width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 22L16 2L30 22H2Z"/></svg>}
                      {rt === 'hip' && <svg width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22L10 4H22L28 22H4Z"/></svg>}
                      {rt === 'flat' && <svg width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="16" width="28" height="6"/></svg>}
                      {rt === 'shed' && <svg width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 22V10L30 2V22L2 22Z"/></svg>}
                      <span className="mt-2 text-sm font-medium capitalize">{rt}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Roof area</Label>
                  <span className="font-medium text-primary">{data.roofArea} m²</span>
                </div>
                <Slider
                  min={30}
                  max={300}
                  step={5}
                  value={[data.roofArea]}
                  onValueChange={v => updateData({ roofArea: v[0] })}
                  className="py-2"
                />
              </div>

              <div className="space-y-3">
                <Label>Orientation</Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['N', 'E', 'SE', 'S', 'SW', 'W'] as Orientation[]).map(ori => (
                    <button
                      key={ori}
                      onClick={() => updateData({ orientation: ori })}
                      className={cn(
                        "py-3 rounded-lg border font-medium text-sm transition-colors",
                        data.orientation === ori
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      {ori}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <div className="text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-4">Usage</div>
                <h1 className="font-display text-5xl mb-6">How do you use energy?</h1>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 bg-card p-6 rounded-[20px] border border-border shadow-sm">
                <div className="col-span-full">
                  <div className="text-sm font-bold text-foreground mb-2">Pick a profile to start (optional)</div>
                </div>
                {PERSONAS.map(p => {
                  const isActive = getActivePersona() === p.id;
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => updateData({ monthlyBill: p.monthlyBill, hasEV: p.hasEV, hasHeatPump: p.hasHeatPump })}
                      className={cn(
                        "flex flex-col items-start p-4 rounded-xl border transition-colors text-left bg-background shadow-xs",
                        isActive ? "border-primary shadow-[0_0_0_1px_rgba(35,45,110,1)]" : "border-border hover:border-primary/30"
                      )}
                    >
                      <Icon className={cn("w-5 h-5 mb-2", isActive ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-[14px] font-semibold">{p.label}</span>
                      <span className="text-[13px] text-muted-foreground mt-0.5">{p.sub}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-6 pt-4 bg-card p-6 rounded-[20px] border border-border shadow-sm">
                <div className="flex justify-between items-center text-sm font-medium">
                  <Label className="text-[16px] font-semibold">Monthly electricity bill</Label>
                  <span className="text-muted-foreground">≈ €{(data.monthlyBill * 12).toLocaleString('de-DE')} / year</span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-14 shrink-0 rounded-xl bg-background border-border"
                    onClick={() => updateData({ monthlyBill: Math.max(20, data.monthlyBill - 25) })}
                  >
                    <span className="text-xl font-medium">−</span>
                  </Button>
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-[14px] text-muted-foreground">€</span>
                    <Input
                      type="number"
                      value={data.monthlyBill}
                      onChange={e => updateData({ monthlyBill: Math.max(20, parseInt(e.target.value) || 20) })}
                      className={cn(
                        "h-12 pl-8 pr-16 text-left text-[16px] bg-background border-border rounded-xl",
                        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0"
                      )}
                    />
                    <span className="absolute right-4 top-[14px] text-muted-foreground text-[14px]">/ month</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-14 shrink-0 rounded-xl bg-background border-border"
                    onClick={() => updateData({ monthlyBill: data.monthlyBill + 25 })}
                  >
                    <span className="text-xl font-medium">+</span>
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-1 pb-4 border-b">
                  {[60, 100, 150, 220, 320].map(amt => (
                    <button
                      key={amt}
                      onClick={() => updateData({ monthlyBill: amt })}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[14px] font-medium transition-colors border",
                        data.monthlyBill === amt
                          ? "bg-card text-foreground border-border shadow-sm"
                          : "bg-background border-border text-foreground hover:border-gray-400"
                      )}
                    >
                      €{amt}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <Label className="text-[16px] font-semibold block mb-0.5">Electric vehicle</Label>
                    <span className="text-[14px] text-muted-foreground">Add a wallbox to the design</span>
                  </div>
                  <Switch 
                    checked={data.hasEV} 
                    onCheckedChange={c => updateData({ hasEV: c })}
                  />
                </div>
                
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <Label className="text-[16px] font-semibold block mb-0.5">Heat pump</Label>
                    <span className="text-[14px] text-muted-foreground">Replace gas/oil heating</span>
                  </div>
                  <Switch 
                    checked={data.hasHeatPump} 
                    onCheckedChange={c => updateData({ hasHeatPump: c })}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <div className="flex justify-between items-center pb-12">
          {step > 0 ? (
            <Button 
              variant="ghost" 
              onClick={() => setStep(s => Math.max(0, s - 1))}
              className="text-muted-foreground"
            >
              Back
            </Button>
          ) : (
            <div />
          )}
          <Button onClick={handleNext} className="gap-2 h-11 px-8 rounded-xl text-[15px] font-semibold">
            {step === 2 ? 'Generate design' : 'Continue'}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
