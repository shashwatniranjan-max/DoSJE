import type { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const AUDIT_PROMPT =
  "Analyze this classroom image. Return a JSON object with { headcount: number, anomalies: string[] }";

type AuditResult = {
  headcount: number;
  anomalies: string[];
};

function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (typeof key !== "string" || key.length === 0) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return key;
}

function readImageBase64(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) {
    return undefined;
  }

  const record = body as Record<string, unknown>;
  const image = record.image ?? record.imageBase64 ?? record.base64;
  if (typeof image !== "string" || image.length === 0) {
    return undefined;
  }

  const commaIndex = image.indexOf(",");
  if (image.startsWith("data:") && commaIndex !== -1) {
    return image.slice(commaIndex + 1);
  }

  return image;
}

function readMimeType(body: unknown): string {
  if (typeof body === "object" && body !== null) {
    const mimeType = (body as Record<string, unknown>).mimeType;
    if (typeof mimeType === "string" && mimeType.startsWith("image/")) {
      return mimeType;
    }
  }
  return "image/jpeg";
}

function extractJsonObject(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain JSON");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as unknown;
}

function isAuditResult(value: unknown): value is AuditResult {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.headcount !== "number" || !Number.isFinite(record.headcount)) {
    return false;
  }
  if (!Array.isArray(record.anomalies)) {
    return false;
  }
  return record.anomalies.every((item) => typeof item === "string");
}

export async function auditImage(req: Request, res: Response): Promise<void> {
  const imageBase64 = readImageBase64(req.body);
  if (!imageBase64) {
    res.status(400).json({ error: "A base64 image is required" });
    return;
  }

  let apiKey: string;
  try {
    apiKey = getGeminiApiKey();
  } catch {
    res.status(500).json({ error: "Image audit is not configured" });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      { text: AUDIT_PROMPT },
      {
        inlineData: {
          mimeType: readMimeType(req.body),
          data: imageBase64,
        },
      },
    ]);

    const text = result.response.text();
    const parsed: unknown = extractJsonObject(text);
    if (!isAuditResult(parsed)) {
      res.status(502).json({ error: "Unexpected audit response shape", raw: text });
      return;
    }

    res.json(parsed);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown audit error";
    res.status(502).json({ error: "Failed to audit image", message });
  }
}
