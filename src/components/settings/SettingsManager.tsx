import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, Shield, Palette, Zap, Database, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { toast } from "sonner";

interface SettingItem {
  key: string;
  label: string;
  description: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'color';
  value: any;
  options?: { label: string; value: string }[];
  module: string;
  required?: boolean;
}

const SETTING_MODULES = {
  core: { label: "Core Settings", icon: Settings },
  appearance: { label: "Appearance", icon: Palette },
  security: { label: "Security", icon: Shield },
  integrations: { label: "Integrations", icon: Globe },
  automation: { label: "Automation", icon: Zap },
  database: { label: "Database", icon: Database }
};

export function SettingsManager() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState('core');
  const { profile } = useAuthContext();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load global settings with company overrides
      const { data: globalSettings } = await supabase
        .from('settings')
        .select('*')
        .order('module', { ascending: true });

      const { data: companySettings } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', profile?.company_id);

      // Merge global settings with company overrides
      const mergedSettings = globalSettings?.map(setting => {
        const companyOverride = companySettings?.find(cs => cs.key === setting.key);
        return {
          key: setting.key,
          label: setting.key.split('.').pop()?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || setting.key,
          description: setting.description || '',
          type: getSettingType(setting.key),
          value: companyOverride ? companyOverride.value : setting.default_value,
          module: setting.module || 'core',
          options: getSettingOptions(setting.key)
        };
      }) || [];

      setSettings(mergedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const getSettingType = (key: string): SettingItem['type'] => {
    if (key.includes('color') || key.includes('theme')) return 'color';
    if (key.includes('enabled') || key.includes('active')) return 'boolean';
    if (key.includes('count') || key.includes('limit') || key.includes('timeout')) return 'number';
    if (key.includes('description') || key.includes('template')) return 'textarea';
    if (key.includes('currency') || key.includes('timezone') || key.includes('locale')) return 'select';
    return 'text';
  };

  const getSettingOptions = (key: string) => {
    switch (key) {
      case 'system.default_currency':
        return [
          { label: 'US Dollar (USD)', value: 'USD' },
          { label: 'Euro (EUR)', value: 'EUR' },
          { label: 'British Pound (GBP)', value: 'GBP' },
          { label: 'Indian Rupee (INR)', value: 'INR' }
        ];
      case 'system.default_timezone':
        return [
          { label: 'UTC', value: 'UTC' },
          { label: 'America/New_York', value: 'America/New_York' },
          { label: 'Europe/London', value: 'Europe/London' },
          { label: 'Asia/Kolkata', value: 'Asia/Kolkata' }
        ];
      case 'system.default_locale':
        return [
          { label: 'English (en)', value: 'en' },
          { label: 'Spanish (es)', value: 'es' },
          { label: 'French (fr)', value: 'fr' },
          { label: 'German (de)', value: 'de' }
        ];
      default:
        return undefined;
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('company_settings')
        .upsert({
          company_id: profile?.company_id,
          key,
          value,
          updated_by: profile?.id
        });

      if (error) throw error;

      setSettings(prev => prev.map(setting => 
        setting.key === key ? { ...setting, value } : setting
      ));

      toast.success('Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    }
  };

  const renderSettingInput = (setting: SettingItem) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            checked={setting.value === true || setting.value === 'true'}
            onCheckedChange={(checked) => updateSetting(setting.key, checked)}
          />
        );
      
      case 'select':
        return (
          <Select
            value={setting.value?.toString() || ''}
            onValueChange={(value) => updateSetting(setting.key, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'textarea':
        return (
          <Textarea
            value={setting.value?.toString() || ''}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            placeholder={setting.description}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={setting.value?.toString() || ''}
            onChange={(e) => updateSetting(setting.key, parseInt(e.target.value))}
          />
        );
      
      case 'color':
        return (
          <div className="flex space-x-2">
            <Input
              type="color"
              value={setting.value?.toString() || '#000000'}
              onChange={(e) => updateSetting(setting.key, e.target.value)}
              className="w-16 h-10"
            />
            <Input
              value={setting.value?.toString() || ''}
              onChange={(e) => updateSetting(setting.key, e.target.value)}
              placeholder="#000000"
            />
          </div>
        );
      
      default:
        return (
          <Input
            value={setting.value?.toString() || ''}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            placeholder={setting.description}
          />
        );
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.module]) {
      acc[setting.module] = [];
    }
    acc[setting.module].push(setting);
    return acc;
  }, {} as Record<string, SettingItem[]>);

  if (loading) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings Manager</h1>
        <p className="text-muted-foreground">Configure your organization's settings and preferences</p>
      </div>

      <Tabs value={activeModule} onValueChange={setActiveModule}>
        <TabsList className="grid grid-cols-6 w-full">
          {Object.entries(SETTING_MODULES).map(([key, module]) => {
            const Icon = module.icon;
            const count = groupedSettings[key]?.length || 0;
            return (
              <TabsTrigger key={key} value={key} className="flex items-center space-x-2">
                <Icon className="w-4 h-4" />
                <span>{module.label}</span>
                <Badge variant="secondary" className="text-xs">
                  {count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(SETTING_MODULES).map(([moduleKey, module]) => (
          <TabsContent key={moduleKey} value={moduleKey}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <module.icon className="w-5 h-5" />
                  <span>{module.label}</span>
                </CardTitle>
                <CardDescription>
                  Configure {module.label.toLowerCase()} for your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {groupedSettings[moduleKey]?.map(setting => (
                    <div key={setting.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div>
                        <Label className="text-sm font-medium">
                          {setting.label}
                          {setting.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        {setting.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {setting.description}
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        {renderSettingInput(setting)}
                      </div>
                    </div>
                  ))}
                  
                  {!groupedSettings[moduleKey]?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      No settings available for this module
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}