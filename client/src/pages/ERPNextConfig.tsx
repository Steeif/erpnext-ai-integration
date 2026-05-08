import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const configSchema = z.object({
  erpnextUrl: z.string().url("Please enter a valid ERPNext URL"),
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().min(1, "API Secret is required"),
});

type ConfigFormData = z.infer<typeof configSchema>;

export default function ERPNextConfig() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      erpnextUrl: "",
      apiKey: "",
      apiSecret: "",
    },
  });

  const { data: connection, isLoading: isCheckingConnection } = trpc.erpnext.getConnection.useQuery();
  const configMutation = trpc.erpnext.configureConnection.useMutation();

  // Update UI when connection status changes (using useEffect to avoid render-phase updates)
  useEffect(() => {
    if (connection?.configured && !isConfigured) {
      setIsConfigured(true);
    }
  }, [connection?.configured, isConfigured])

  const onSubmit = async (data: ConfigFormData) => {
    try {
      await configMutation.mutateAsync({
        erpnextUrl: data.erpnextUrl,
        apiKey: data.apiKey,
        apiSecret: data.apiSecret,
      });

      toast.success("ERPNext connection configured successfully!");
      setIsConfigured(true);
      setShowForm(false);
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to configure connection";
      toast.error(message);
    }
  };

  if (isCheckingConnection) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">ERPNext Integration</h1>
          <p className="text-lg text-slate-600">Connect securely to your self-hosted ERPNext instance</p>
        </div>

        {/* Status Card */}
        {isConfigured && !showForm && (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-900">Connection Active</p>
                  <p className="text-sm text-emerald-700">
                    {connection?.erpnextUrl}
                  </p>
                  {connection?.lastTestedAt && (
                    <p className="text-xs text-emerald-600 mt-1">
                      Last tested: {new Date(connection.lastTestedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowForm(true)}
                className="mt-4 w-full"
              >
                Update Connection
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Configuration Form */}
        {!isConfigured || showForm ? (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Configure ERPNext Connection
              </CardTitle>
              <CardDescription>
                Enter your ERPNext instance details. Your credentials are encrypted and stored securely.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* ERPNext URL Field */}
                  <FormField
                    control={form.control}
                    name="erpnextUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ERPNext URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://your-erpnext-instance.com"
                            {...field}
                            disabled={configMutation.isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          The base URL of your self-hosted ERPNext instance
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* API Key Field */}
                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your API Key"
                            type="password"
                            {...field}
                            disabled={configMutation.isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Generate from User settings → API Access → Generate Keys
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* API Secret Field */}
                  <FormField
                    control={form.control}
                    name="apiSecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Secret</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your API Secret"
                            type="password"
                            {...field}
                            disabled={configMutation.isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Keep this secret safe. It will be encrypted in our database.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Error Alert */}
                  {configMutation.isError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {configMutation.error?.message || "Failed to configure connection"}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={configMutation.isPending}
                      className="flex-1"
                    >
                      {configMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Testing Connection...
                        </>
                      ) : (
                        "Configure Connection"
                      )}
                    </Button>
                    {showForm && isConfigured && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : null}

        {/* Info Box */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>How to get your API credentials:</strong>
            <ol className="mt-2 ml-4 space-y-1 list-decimal text-sm">
              <li>Log in to your ERPNext instance</li>
              <li>Go to User list and open your user</li>
              <li>Click Settings tab and expand API Access section</li>
              <li>Click "Generate Keys" and copy both API Key and API Secret</li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
