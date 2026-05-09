import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, CheckCircle, Table, ArrowLeft, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AIAnalysis from "@/components/AIAnalysis";

const verifySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

type VerifyFormData = z.infer<typeof verifySchema>;

interface VerifiedUser {
  name: string;
  email: string;
  full_name: string;
  user_type: string;
  enabled: number;
}

interface DataRecord {
  name: string;
  [key: string]: unknown;
}

export default function DataRetrieval({ onBack }: { onBack: () => void }) {
  const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(null);
  const [selectedDoctype, setSelectedDoctype] = useState<string>("");
  const [displayData, setDisplayData] = useState<DataRecord[]>([]);

  const form = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      userId: "",
    },
  });

  const { data: doctypes = [] } = trpc.erpnext.getAvailableDoctypes.useQuery();
  const verifyMutation = trpc.erpnext.verifyUserId.useMutation();
  const { data: userData, isLoading: isLoadingData } = trpc.erpnext.getUserData.useQuery(
    {
      userId: verifiedUser?.name || "",
      doctype: selectedDoctype,
    },
    {
      enabled: !!verifiedUser && !!selectedDoctype,
    }
  );

  const onVerify = async (data: VerifyFormData) => {
    try {
      const result = await verifyMutation.mutateAsync({ userId: data.userId });
      if (result.user) {
        setVerifiedUser(result.user);
        setSelectedDoctype("");
        setDisplayData([]);
        toast.success(`User "${result.user.full_name}" verified successfully!`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to verify user";
      toast.error(message);
    }
  };

  // Update display data when userData changes (using useEffect to avoid render-phase updates)
  useEffect(() => {
    if (userData?.data && selectedDoctype) {
      const dataArray = Array.isArray(userData.data) ? userData.data : [userData.data];
      setDisplayData(dataArray);
    }
  }, [userData?.data, selectedDoctype]);

  const getTableColumns = (): string[] => {
    if (displayData.length === 0) return [];
    const firstRecord = displayData[0];
    return Object.keys(firstRecord).slice(0, 10); // Show first 10 columns
  };

  const columns = getTableColumns();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="rounded-full flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 truncate">Retrieve User Data</h1>
            <p className="text-base md:text-lg text-slate-600 truncate">Verify user ID and fetch data from ERPNext</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Verification Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Verify User</CardTitle>
                <CardDescription>Enter the ERPNext user ID to verify and retrieve data</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onVerify)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="userId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User ID</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., user@example.com"
                              {...field}
                              disabled={verifyMutation.isPending}
                            />
                          </FormControl>
                          <FormDescription>
                            The email or username in ERPNext
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {verifyMutation.isError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <AlertDescription>
                          {verifyMutation.error?.message || "Verification failed"}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      disabled={verifyMutation.isPending}
                      className="w-full"
                    >
                      {verifyMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin flex-shrink-0" />
                          Verifying...
                        </>
                      ) : (
                        "Verify User"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* User Info Card */}
            {verifiedUser && (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    User Verified
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-emerald-600 font-semibold">Name</p>
                    <p className="text-emerald-900 break-words">{verifiedUser.full_name}</p>
                  </div>
                  <div>
                    <p className="text-emerald-600 font-semibold">Email</p>
                    <p className="text-emerald-900 break-words">{verifiedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-emerald-600 font-semibold">Type</p>
                    <p className="text-emerald-900">{verifiedUser.user_type}</p>
                  </div>
                  <div>
                    <p className="text-emerald-600 font-semibold">Status</p>
                    <p className="text-emerald-900">
                      {verifiedUser.enabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* DocType Selector */}
            {verifiedUser && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Table className="w-5 h-5 flex-shrink-0" />
                    Select Data Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedDoctype} onValueChange={setSelectedDoctype}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a document type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {doctypes.map((doctype) => (
                        <SelectItem key={doctype} value={doctype}>
                          {doctype}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-2">
                    {isLoadingData && "Loading data..."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Data Display */}
          <div className="lg:col-span-2">
            {selectedDoctype && isLoadingData ? (
              <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-slate-600">Retrieving {selectedDoctype} data...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : selectedDoctype && displayData.length > 0 ? (
              <div className="space-y-6">
                <Card className="shadow-lg overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {selectedDoctype} Data ({displayData.length} record{displayData.length !== 1 ? "s" : ""})
                    </CardTitle>
                    <CardDescription>
                      {userData?.cached && "Cached data - retrieved from cache"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto -mx-6 px-6">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            {columns.map((col) => (
                              <th
                                key={col}
                                className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap"
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {displayData.map((record, idx) => (
                            <tr
                              key={idx}
                              className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                            >
                              {columns.map((col) => (
                                <td
                                  key={`${idx}-${col}`}
                                  className="px-4 py-3 text-slate-600 truncate max-w-xs"
                                  title={String(record[col])}
                                >
                                  {record[col] !== null && record[col] !== undefined
                                    ? String(record[col]).substring(0, 50)
                                    : "—"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Analysis Section */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      AI-Powered Analysis
                    </CardTitle>
                    <CardDescription>
                      Analyze, get insights, detect anomalies, and generate reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AIAnalysis doctype={selectedDoctype} data={displayData} />
                  </CardContent>
                </Card>
              </div>
            ) : selectedDoctype ? (
              <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <AlertDescription>
                      No data found for {selectedDoctype} related to this user.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ) : verifiedUser ? (
              <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center text-slate-500 py-12">
                    <Table className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Select a document type to view data</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center text-slate-500 py-12">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Verify a user first to retrieve data</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
