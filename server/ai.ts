import { invokeLLM, type Message } from "./_core/llm";

/**
 * AI Analysis Service
 * Provides data analysis, insights, reporting, and anomaly detection using Google Gemini
 */

export interface DataSummary {
  summary: string;
  key_metrics: Record<string, unknown>;
  highlights: string[];
  data_quality_score: number;
}

export interface InsightResult {
  insights: Array<{
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: "critical" | "high" | "medium" | "low";
  }>;
  confidence: number;
}

export interface AnomalyResult {
  anomalies: Array<{
    record_id: string;
    field: string;
    value: unknown;
    reason: string;
    severity: "critical" | "high" | "medium" | "low";
  }>;
  total_anomalies: number;
  affected_records: number;
  analysis_timestamp: string;
}

export interface ReportResult {
  title: string;
  executive_summary: string;
  sections: Array<{
    title: string;
    content: string;
    key_findings: string[];
  }>;
  conclusion: string;
  generated_at: string;
}

/**
 * Summarize and analyze ERPNext data
 */
export async function analyzeData(
  doctype: string,
  data: unknown,
  customPrompt?: string
): Promise<DataSummary> {
  try {
    const prompt = customPrompt || `
Analyze the following ${doctype} data and provide a comprehensive summary.
Include key metrics, important highlights, and an overall data quality assessment (0-100).

Data to analyze:
${JSON.stringify(data, null, 2)}

Provide your response in the following JSON format:
{
  "summary": "Brief overall summary of the data",
  "key_metrics": {
    "metric_name": value,
    ...
  },
  "highlights": ["Important finding 1", "Important finding 2", ...],
  "data_quality_score": 85
}
`;

    const messages: Message[] = [
      {
        role: "system",
        content: "You are a data analysis expert. Analyze business data and provide structured insights.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await invokeLLM({
      messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "data_summary",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              key_metrics: { type: "object" },
              highlights: { type: "array", items: { type: "string" } },
              data_quality_score: { type: "number" },
            },
            required: ["summary", "key_metrics", "highlights", "data_quality_score"],
            additionalProperties: false,
          },
        },
      },
    });

    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error("No response from AI");
    }

    const content = typeof messageContent === "string" ? messageContent : JSON.stringify(messageContent);
    return JSON.parse(content);
  } catch (error) {
    console.error("Data analysis error:", error);
    throw new Error("Failed to analyze data");
  }
}

/**
 * Generate insights and recommendations from data
 */
export async function generateInsights(
  doctype: string,
  data: unknown,
  context?: string
): Promise<InsightResult> {
  try {
    const prompt = `
Analyze the following ${doctype} data and generate actionable insights and recommendations.
${context ? `Context: ${context}` : ""}

Data:
${JSON.stringify(data, null, 2)}

Provide insights and recommendations in the following JSON format:
{
  "insights": [
    {
      "title": "Insight title",
      "description": "Detailed description",
      "impact": "high|medium|low"
    }
  ],
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed description",
      "priority": "critical|high|medium|low"
    }
  ],
  "confidence": 0.95
}
`;

    const messages: Message[] = [
      {
        role: "system",
        content: "You are a business analyst. Generate actionable insights and recommendations from data analysis.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await invokeLLM({
      messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "insight_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              insights: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    impact: { type: "string", enum: ["high", "medium", "low"] },
                  },
                  required: ["title", "description", "impact"],
                  additionalProperties: false,
                },
              },
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                  },
                  required: ["title", "description", "priority"],
                  additionalProperties: false,
                },
              },
              confidence: { type: "number" },
            },
            required: ["insights", "recommendations", "confidence"],
            additionalProperties: false,
          },
        },
      },
    });

    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error("No response from AI");
    }

    const content = typeof messageContent === "string" ? messageContent : JSON.stringify(messageContent);
    return JSON.parse(content);
  } catch (error) {
    console.error("Insight generation error:", error);
    throw new Error("Failed to generate insights");
  }
}

/**
 * Detect anomalies in data
 */
export async function detectAnomalies(
  doctype: string,
  data: unknown,
  thresholds?: Record<string, unknown>
): Promise<AnomalyResult> {
  try {
    const prompt = `
Analyze the following ${doctype} data and identify anomalies, outliers, and unusual patterns.
${thresholds ? `Use these thresholds for detection: ${JSON.stringify(thresholds)}` : ""}

Data:
${JSON.stringify(data, null, 2)}

Identify anomalies and provide results in the following JSON format:
{
  "anomalies": [
    {
      "record_id": "ID of the anomalous record",
      "field": "Field name",
      "value": "The anomalous value",
      "reason": "Why this is anomalous",
      "severity": "critical|high|medium|low"
    }
  ],
  "total_anomalies": 5,
  "affected_records": 3,
  "analysis_timestamp": "2026-05-09T12:00:00Z"
}
`;

    const messages: Message[] = [
      {
        role: "system",
        content: "You are a data quality expert. Identify anomalies, outliers, and unusual patterns in data.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await invokeLLM({
      messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "anomaly_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              anomalies: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    record_id: { type: "string" },
                    field: { type: "string" },
                    value: {},
                    reason: { type: "string" },
                    severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                  },
                  required: ["record_id", "field", "value", "reason", "severity"],
                  additionalProperties: false,
                },
              },
              total_anomalies: { type: "number" },
              affected_records: { type: "number" },
              analysis_timestamp: { type: "string" },
            },
            required: ["anomalies", "total_anomalies", "affected_records", "analysis_timestamp"],
            additionalProperties: false,
          },
        },
      },
    });

    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error("No response from AI");
    }

    const content = typeof messageContent === "string" ? messageContent : JSON.stringify(messageContent);
    return JSON.parse(content);
  } catch (error) {
    console.error("Anomaly detection error:", error);
    throw new Error("Failed to detect anomalies");
  }
}

/**
 * Generate professional report from data
 */
export async function generateReport(
  doctype: string,
  data: unknown,
  reportType?: string
): Promise<ReportResult> {
  try {
    const prompt = `
Generate a professional ${reportType || "analysis"} report for the following ${doctype} data.

Data:
${JSON.stringify(data, null, 2)}

Create a comprehensive report in the following JSON format:
{
  "title": "Report title",
  "executive_summary": "Brief summary of key findings",
  "sections": [
    {
      "title": "Section title",
      "content": "Detailed content",
      "key_findings": ["Finding 1", "Finding 2"]
    }
  ],
  "conclusion": "Overall conclusion and next steps",
  "generated_at": "2026-05-09T12:00:00Z"
}
`;

    const messages: Message[] = [
      {
        role: "system",
        content: "You are a professional report writer. Generate well-structured, comprehensive reports from data analysis.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await invokeLLM({
      messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "report_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              executive_summary: { type: "string" },
              sections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                    key_findings: { type: "array", items: { type: "string" } },
                  },
                  required: ["title", "content", "key_findings"],
                  additionalProperties: false,
                },
              },
              conclusion: { type: "string" },
              generated_at: { type: "string" },
            },
            required: ["title", "executive_summary", "sections", "conclusion", "generated_at"],
            additionalProperties: false,
          },
        },
      },
    });

    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error("No response from AI");
    }

    const content = typeof messageContent === "string" ? messageContent : JSON.stringify(messageContent);
    return JSON.parse(content);
  } catch (error) {
    console.error("Report generation error:", error);
    throw new Error("Failed to generate report");
  }
}
