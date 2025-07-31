'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) {
      setIsLoading(true);
    } else {
      if (session) {
        setIsLoading(false);
      } else {
        router.push('/login');
      }
    }
  }, [session, router, isPending]);

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login'); // redirect to login page
        },
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">InvoiceNest</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {session?.user?.name} ({session?.user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to InvoiceNest Dashboard
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Your invoicing and financial management system is ready to use.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-2xl font-bold text-indigo-600">0</div>
                  <div className="text-sm text-gray-600">Total Customers</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Total Invoices</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-2xl font-bold text-yellow-600">$0</div>
                  <div className="text-sm text-gray-600">
                    Outstanding Amount
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Total Payments</div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600">
                  <strong>Coming Soon:</strong> Customer management, invoice
                  creation, payment tracking, and reporting features.
                </p>
                <div className="flex justify-center space-x-4">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium">
                    Manage Customers
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium">
                    Create Invoice
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium">
                    View Reports
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
