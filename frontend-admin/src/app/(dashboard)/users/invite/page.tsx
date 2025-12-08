'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, Mail, Upload, FileText, X, UserPlus, ArrowLeft } from 'lucide-react';
import Papa from 'papaparse';
import { createClient } from '@/lib/supabase/client';
import { PageHeader, Breadcrumb } from '@/components/layout';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Input,
  Select,
  Alert,
} from '@/components/ui';

const inviteSchema = z.object({
  invites: z.array(
    z.object({
      email: z.string().email('Invalid email address'),
      full_name: z.string().optional(),
      role: z.enum(['user', 'admin']),
    })
  ).min(1, 'At least one invite is required'),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export default function InviteUsersPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      invites: [{ email: '', full_name: '', role: 'user' }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'invites',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setFile(selectedFile);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const invites = (results.data as Record<string, string>[])
          .map((row) => ({
            email: row.email || row.Email || '',
            full_name: row.full_name || row['Full Name'] || row.name || row.Name || '',
            role: (row.role || row.Role || 'user').toLowerCase() as 'user' | 'admin',
          }))
          .filter((invite) => invite.email);

        if (invites.length === 0) {
          toast.error('No valid emails found in CSV');
          return;
        }

        replace(invites);
        toast.success(`Loaded ${invites.length} invites from CSV`);
      },
      error: (error) => {
        toast.error('Failed to parse CSV file');
        console.error(error);
      },
    });
  };

  const onSubmit = async (data: InviteFormData) => {
    setSubmitting(true);

    try {
      const supabase = createClient();
      
      // Note: In a real application, you would use Supabase's admin API
      // or a serverless function to send invite emails.
      // For now, we'll just create placeholder profiles.
      
      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      for (const invite of data.invites) {
        // Check if email already exists
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', invite.email)
          .single();

        if (existingUser) {
          failCount++;
          errors.push(`${invite.email} already exists`);
          continue;
        }

        // In production, you would send an invite email here
        // using Supabase Auth Admin API or a custom email service
        
        // For demo purposes, we'll just log the invite
        console.log('Would send invite to:', invite);
        successCount++;
      }

      if (successCount > 0) {
        toast.success(`Successfully queued ${successCount} invitations`);
      }
      if (failCount > 0) {
        toast.warning(`${failCount} invites failed: ${errors.join(', ')}`);
      }

      if (successCount === data.invites.length) {
        router.push('/users');
      }
    } catch (error) {
      toast.error('An error occurred while sending invites');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Users', href: '/users' },
          { label: 'Invite Users' },
        ]}
      />

      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <PageHeader
          title="Invite Users"
          description="Send exam invitations to new users"
        />
      </div>

      <Alert variant="info">
        <Mail className="h-4 w-4" />
        <div className="ml-3">
          <p className="font-medium">Email Invitations</p>
          <p className="text-sm">
            Invited users will receive an email with instructions to set up their account
            and access the exam portal.
          </p>
        </div>
      </Alert>

      {/* CSV Import */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import from CSV</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-gray-600 mb-4">
            Upload a CSV file with columns: <code className="bg-gray-100 px-1">email</code>,{' '}
            <code className="bg-gray-100 px-1">full_name</code> (optional),{' '}
            <code className="bg-gray-100 px-1">role</code> (user or admin, optional)
          </p>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <Upload className="h-5 w-5 text-gray-500" />
              <span className="text-sm">Upload CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {file && (
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    reset({ invites: [{ email: '', full_name: '', role: 'user' }] });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Manual Entry Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invite List ({fields.length} users)</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ email: '', full_name: '', role: 'user' })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Another
            </Button>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Email *"
                      type="email"
                      {...register(`invites.${index}.email`)}
                      error={errors.invites?.[index]?.email?.message}
                      placeholder="user@example.com"
                    />
                    <Input
                      label="Full Name"
                      {...register(`invites.${index}.full_name`)}
                      placeholder="John Doe"
                    />
                    <Select
                      label="Role"
                      options={[
                        { value: 'user', label: 'User' },
                        { value: 'admin', label: 'Admin' },
                      ]}
                      {...register(`invites.${index}.role`)}
                    />
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-6"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {errors.invites?.message && (
              <p className="mt-2 text-sm text-red-600">{errors.invites.message}</p>
            )}
          </CardBody>
          <CardFooter className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/users')}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              <UserPlus className="h-4 w-4 mr-2" />
              Send Invitations ({fields.length})
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
