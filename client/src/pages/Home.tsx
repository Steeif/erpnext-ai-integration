import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Settings, Database, LogOut } from "lucide-react";
import { getLoginUrl } from "@/const";
import ERPNextConfig from "./ERPNextConfig";
import DataRetrieval from "./DataRetrieval";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<"home" | "config" | "data">("home");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Logo/Title */}
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-bold text-slate-900">ERPNext</h1>
            <p className="text-xl text-slate-600">Data Retriever</p>
            <p className="text-sm text-slate-500">Secure integration with your ERPNext instance</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border-0">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-center text-slate-600">
                  Sign in with your Manus account to get started
                </p>
                <Button
                  onClick={() => (window.location.href = getLoginUrl())}
                  size="lg"
                  className="w-full"
                >
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 text-center">Features</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <Settings className="w-5 h-5 text-blue-600 mb-2" />
                <p className="text-xs font-semibold text-slate-900">Secure Config</p>
                <p className="text-xs text-slate-600">Encrypted credentials</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <Database className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="text-xs font-semibold text-slate-900">Data Retrieval</p>
                <p className="text-xs text-slate-600">User-specific data</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render different pages based on state
  if (currentPage === "config") {
    return <ERPNextConfig />;
  }

  if (currentPage === "data") {
    return <DataRetrieval onBack={() => setCurrentPage("home")} />;
  }

  // Home page for authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ERPNext Data Retriever</h1>
            <p className="text-sm text-slate-600">Welcome, {user?.name}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Get Started</h2>
            <p className="text-lg text-slate-600">
              Connect to your ERPNext instance and retrieve user-specific data securely
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Configure Connection Card */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-0" onClick={() => setCurrentPage("config")}>
              <CardHeader className="space-y-2">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Configure Connection</CardTitle>
                <CardDescription>
                  Set up your ERPNext instance credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">
                  Enter your ERPNext URL and API credentials to establish a secure connection. Your credentials are encrypted and stored safely.
                </p>
                <Button variant="outline" className="w-full">
                  Configure Now
                </Button>
              </CardContent>
            </Card>

            {/* Retrieve Data Card */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-0" onClick={() => setCurrentPage("data")}>
              <CardHeader className="space-y-2">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Database className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle>Retrieve Data</CardTitle>
                <CardDescription>
                  Fetch user-specific data from ERPNext
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">
                  Verify a user ID and retrieve their associated data from various ERPNext document types like Users, Employees, Customers, and more.
                </p>
                <Button variant="outline" className="w-full">
                  Retrieve Data
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <Card className="bg-blue-50 border-blue-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Configure Connection</p>
                  <p className="text-slate-600">Enter your self-hosted ERPNext instance URL and API credentials</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Verify User</p>
                  <p className="text-slate-600">Enter a user ID to verify their existence in ERPNext</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Retrieve & Display</p>
                  <p className="text-slate-600">Select a document type and view the user's associated data in a structured table</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="bg-emerald-50 border-emerald-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-base text-emerald-900">Security</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-emerald-800">
              <p>
                Your ERPNext credentials are encrypted and stored securely. All API calls use token-based authentication with HTTPS. Your data is never shared or logged.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
