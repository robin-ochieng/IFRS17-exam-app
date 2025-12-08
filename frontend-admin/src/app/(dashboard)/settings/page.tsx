'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Settings, Save, Globe, Bell, Shield, Database } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader, Breadcrumb } from '@/components/layout';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Input,
  Switch,
  LoadingSpinner,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

const settingsSchema = z.object({
  site_name: z.string().min(1, 'Site name is required'),
  support_email: z.string().email('Invalid email'),
  allow_registration: z.boolean(),
  require_email_verification: z.boolean(),
  default_exam_duration: z.number().min(1).max(480),
  max_exam_attempts: z.number().min(1).max(100),
  pass_mark_percent: z.number().min(1).max(100),
  enable_notifications: z.boolean(),
  maintenance_mode: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const defaultSettings: SettingsFormData = {
  site_name: 'IRA IFRS 17 Exam Portal',
  support_email: 'support@example.com',
  allow_registration: true,
  require_email_verification: true,
  default_exam_duration: 120,
  max_exam_attempts: 3,
  pass_mark_percent: 70,
  enable_notifications: true,
  maintenance_mode: false,
};

export default function SettingsPage() {
  const { isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettings,
  });

  // Watch all switch values
  const watchAllowRegistration = watch('allow_registration');
  const watchEmailVerification = watch('require_email_verification');
  const watchNotifications = watch('enable_notifications');
  const watchMaintenanceMode = watch('maintenance_mode');

  useEffect(() => {
    // In a real application, you would fetch settings from a database
    // For now, we'll use localStorage to persist settings
    const loadSettings = () => {
      try {
        const stored = localStorage.getItem('admin_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          reset({ ...defaultSettings, ...parsed });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
      setLoading(false);
    };

    loadSettings();
  }, [reset]);

  const onSubmit = async (data: SettingsFormData) => {
    if (!isSuperAdmin) {
      toast.error('Only super admins can modify settings');
      return;
    }

    setSaving(true);

    try {
      // In a real application, you would save to a database table
      localStorage.setItem('admin_settings', JSON.stringify(data));
      
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Settings' }]} />

      <PageHeader
        title="System Settings"
        description="Configure application settings and preferences"
      />

      {!isSuperAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800">
            <strong>Note:</strong> Only super administrators can modify system settings.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Site Name"
              {...register('site_name')}
              error={errors.site_name?.message}
              disabled={!isSuperAdmin}
            />
            <Input
              label="Support Email"
              type="email"
              {...register('support_email')}
              error={errors.support_email?.message}
              disabled={!isSuperAdmin}
            />
          </CardBody>
        </Card>

        {/* Authentication Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Allow Public Registration</p>
                <p className="text-sm text-gray-500">
                  Allow new users to create accounts
                </p>
              </div>
              <Switch
                checked={watchAllowRegistration}
                onChange={(e) => setValue('allow_registration', e.target.checked)}
                disabled={!isSuperAdmin}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Require Email Verification</p>
                <p className="text-sm text-gray-500">
                  Users must verify email before accessing exams
                </p>
              </div>
              <Switch
                checked={watchEmailVerification}
                onChange={(e) =>
                  setValue('require_email_verification', e.target.checked)
                }
                disabled={!isSuperAdmin}
              />
            </div>
          </CardBody>
        </Card>

        {/* Exam Defaults */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Exam Defaults
            </CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Default Duration (minutes)"
              type="number"
              {...register('default_exam_duration', { valueAsNumber: true })}
              error={errors.default_exam_duration?.message}
              disabled={!isSuperAdmin}
            />
            <Input
              label="Max Attempts"
              type="number"
              {...register('max_exam_attempts', { valueAsNumber: true })}
              error={errors.max_exam_attempts?.message}
              disabled={!isSuperAdmin}
            />
            <Input
              label="Default Pass Mark (%)"
              type="number"
              {...register('pass_mark_percent', { valueAsNumber: true })}
              error={errors.pass_mark_percent?.message}
              disabled={!isSuperAdmin}
            />
          </CardBody>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Enable Email Notifications</p>
                <p className="text-sm text-gray-500">
                  Send email notifications for exam results and updates
                </p>
              </div>
              <Switch
                checked={watchNotifications}
                onChange={(e) => setValue('enable_notifications', e.target.checked)}
                disabled={!isSuperAdmin}
              />
            </div>
          </CardBody>
        </Card>

        {/* Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Maintenance
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-sm text-gray-500">
                  Temporarily disable access to the user portal
                </p>
              </div>
              <Switch
                checked={watchMaintenanceMode}
                onChange={(e) => setValue('maintenance_mode', e.target.checked)}
                disabled={!isSuperAdmin}
              />
            </div>
            {watchMaintenanceMode && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <strong>Warning:</strong> Enabling maintenance mode will prevent all users
                from accessing exams.
              </div>
            )}
          </CardBody>
        </Card>

        {/* Save Button */}
        {isSuperAdmin && (
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
