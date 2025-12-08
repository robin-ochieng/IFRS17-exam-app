import Link from 'next/link';
import { ShieldX } from 'lucide-react';
import { Button, Card, CardBody } from '@/components/ui';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 px-4">
      <Card className="max-w-md w-full">
        <CardBody className="p-8 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          
          <p className="text-gray-600 mb-6">
            You do not have permission to access the admin dashboard. 
            Only users with admin or super admin privileges can access this area.
          </p>

          <div className="space-y-3">
            <Link href="/login">
              <Button className="w-full">
                Sign In with Admin Account
              </Button>
            </Link>
            
            <Link href={process.env.NEXT_PUBLIC_USER_PORTAL_URL || '/'}>
              <Button variant="outline" className="w-full">
                Go to Student Portal
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
