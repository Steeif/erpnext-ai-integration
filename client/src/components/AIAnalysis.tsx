import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Zap, TrendingUp, AlertTriangle, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AIAnalysisProps {
  doctype: string;
  data: unknown;
}

export default function AIAnalysis({ doctype, data }: AIAnalysisProps) {
  const [activeTab, setActiveTab] = useState("summary");

  const analyzeMutation = trpc.ai.analyzeData.useMutation();
  const insightsMutation = trpc.ai.generateInsights.useMutation();
  const anomalyMutation = trpc.ai.detectAnomalies.useMutation();
  const reportMutation = trpc.ai.generateReport.useMutation();

  const handleAnalyze = async () => {
    try {
      await analyzeMutation.mutateAsync({
        doctype,
        data,
      });
      toast.success("Data analysis complete!");
    } catch (error) {
      toast.error("Failed to analyze data");
    }
  };

  const handleGenerateInsights = async () => {
    try {
      await insightsMutation.mutateAsync({
        doctype,
        data,
      });
      toast.success("Insights generated successfully!");
    } catch (error) {
      toast.error("Failed to generate insights");
    }
  };

  const handleDetectAnomalies = async () => {
    try {
      await anomalyMutation.mutateAsync({
        doctype,
        data,
      });
      toast.success("Anomaly detection complete!");
    } catch (error) {
      toast.error("Failed to detect anomalies");
    }
  };

  const handleGenerateReport = async () => {
    try {
      await reportMutation.mutateAsync({
        doctype,
        data,
        reportType: "Analysis Report",
      });
      toast.success("Report generated successfully!");
    } catch (error) {
      toast.error("Failed to generate report");
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Data Analysis Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Data Analysis
            </CardTitle>
            <CardDescription>Summarize and analyze your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Get AI-powered insights including key metrics, highlights, and data quality assessment.
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending}
              className="w-full"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Data"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Insights Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Insights & Recommendations
            </CardTitle>
            <CardDescription>Generate actionable insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Discover patterns, trends, and get AI-generated recommendations for improvement.
            </p>
            <Button
              onClick={handleGenerateInsights}
              disabled={insightsMutation.isPending}
              className="w-full"
            >
              {insightsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Insights"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Anomaly Detection Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Anomaly Detection
            </CardTitle>
            <CardDescription>Find unusual patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Identify outliers, anomalies, and data quality issues automatically.
            </p>
            <Button
              onClick={handleDetectAnomalies}
              disabled={anomalyMutation.isPending}
              className="w-full"
            >
              {anomalyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Detecting...
                </>
              ) : (
                "Detect Anomalies"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Report Generation Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Generate Report
            </CardTitle>
            <CardDescription>Create professional reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Generate comprehensive, professional reports from your data.
            </p>
            <Button
              onClick={handleGenerateReport}
              disabled={reportMutation.isPending}
              className="w-full"
            >
              {reportMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          {analyzeMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle>Data Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <p className="text-slate-700">{analyzeMutation.data.summary}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Data Quality Score</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${analyzeMutation.data.data_quality_score}%`,
                        }}
                      />
                    </div>
                    <span className="font-semibold">
                      {analyzeMutation.data.data_quality_score}%
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Key Metrics</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(analyzeMutation.data.key_metrics).map(
                      ([key, value]) => (
                        <div key={key} className="bg-slate-50 p-3 rounded">
                          <p className="text-xs text-slate-600">{key}</p>
                          <p className="font-semibold">{String(value)}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Highlights</h4>
                  <ul className="space-y-2">
                    {analyzeMutation.data.highlights.map((highlight: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-sm">
                        <span className="text-green-600">✓</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
          {analyzeMutation.isPending && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Analyzing data...</AlertDescription>
            </Alert>
          )}
          {!analyzeMutation.data && !analyzeMutation.isPending && (
            <Alert>
              <AlertDescription>Click "Analyze Data" to get started</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {insightsMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle>Insights & Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Key Insights</h4>
                  <div className="space-y-3">
                    {insightsMutation.data.insights.map((insight, idx) => (
                      <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                        <p className="font-semibold text-sm">{insight.title}</p>
                        <p className="text-sm text-slate-600">{insight.description}</p>
                        <span
                          className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${
                            insight.impact === "high"
                              ? "bg-red-100 text-red-800"
                              : insight.impact === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {insight.impact.toUpperCase()} IMPACT
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Recommendations</h4>
                  <div className="space-y-3">
                    {insightsMutation.data.recommendations.map((rec, idx) => (
                      <div key={idx} className="border-l-4 border-green-500 pl-4 py-2">
                        <p className="font-semibold text-sm">{rec.title}</p>
                        <p className="text-sm text-slate-600">{rec.description}</p>
                        <span
                          className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${
                            rec.priority === "critical"
                              ? "bg-red-100 text-red-800"
                              : rec.priority === "high"
                                ? "bg-orange-100 text-orange-800"
                                : rec.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-slate-600">
                  Confidence: <span className="font-semibold">{Math.round(insightsMutation.data.confidence * 100)}%</span>
                </div>
              </CardContent>
            </Card>
          )}
          {insightsMutation.isPending && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Generating insights...</AlertDescription>
            </Alert>
          )}
          {!insightsMutation.data && !insightsMutation.isPending && (
            <Alert>
              <AlertDescription>Click "Generate Insights" to get started</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies" className="space-y-4">
          {anomalyMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle>Anomaly Detection Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded">
                    <p className="text-sm text-slate-600">Total Anomalies</p>
                    <p className="text-2xl font-bold">{anomalyMutation.data.total_anomalies}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded">
                    <p className="text-sm text-slate-600">Affected Records</p>
                    <p className="text-2xl font-bold">{anomalyMutation.data.affected_records}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded">
                    <p className="text-sm text-slate-600">Analyzed At</p>
                    <p className="text-sm font-semibold">
                      {new Date(anomalyMutation.data.analysis_timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                {anomalyMutation.data.anomalies.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Detected Anomalies</h4>
                    {anomalyMutation.data.anomalies.map((anomaly, idx) => (
                      <div key={idx} className="border rounded p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-sm">{anomaly.field}</p>
                            <p className="text-xs text-slate-600">Record: {anomaly.record_id}</p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              anomaly.severity === "critical"
                                ? "bg-red-100 text-red-800"
                                : anomaly.severity === "high"
                                  ? "bg-orange-100 text-orange-800"
                                  : anomaly.severity === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {anomaly.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{anomaly.reason}</p>
                        <p className="text-xs text-slate-600">Value: {String(anomaly.value)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>No anomalies detected in the data</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
          {anomalyMutation.isPending && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Detecting anomalies...</AlertDescription>
            </Alert>
          )}
          {!anomalyMutation.data && !anomalyMutation.isPending && (
            <Alert>
              <AlertDescription>Click "Detect Anomalies" to get started</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Report Tab */}
        <TabsContent value="report" className="space-y-4">
          {reportMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle>{reportMutation.data.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Executive Summary</h4>
                  <p className="text-slate-700">{reportMutation.data.executive_summary}</p>
                </div>

                {reportMutation.data.sections.map((section, idx) => (
                  <div key={idx}>
                    <h4 className="font-semibold mb-2">{section.title}</h4>
                    <p className="text-slate-700 mb-3">{section.content}</p>
                    {section.key_findings.length > 0 && (
                      <div className="bg-slate-50 p-3 rounded">
                        <p className="text-sm font-semibold mb-2">Key Findings:</p>
                        <ul className="space-y-1">
                          {section.key_findings.map((finding, fidx) => (
                            <li key={fidx} className="text-sm text-slate-700 flex gap-2">
                              <span>•</span>
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Conclusion</h4>
                  <p className="text-slate-700">{reportMutation.data.conclusion}</p>
                </div>

                <p className="text-xs text-slate-600">
                  Generated: {new Date(reportMutation.data.generated_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}
          {reportMutation.isPending && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Generating report...</AlertDescription>
            </Alert>
          )}
          {!reportMutation.data && !reportMutation.isPending && (
            <Alert>
              <AlertDescription>Click "Generate Report" to get started</AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
