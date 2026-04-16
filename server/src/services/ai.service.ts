import { z } from "zod";
import { env } from "../config/env";

const parsedTaskSchema = z.object({
  amount: z.number().positive(),
  token: z.string().trim().min(1).transform((v) => v.toUpperCase()),
  receiverAddress: z.string().trim().min(32).max(44),
  frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly", "every_6_months"]),
});

export type ParsedTask = z.infer<typeof parsedTaskSchema>;

function normalizeFrequency(value: string): ParsedTask["frequency"] {
  const normalized = value.trim().toLowerCase();
  if (normalized === "daily" || normalized === "weekly" || normalized === "monthly" || normalized === "quarterly" || normalized === "yearly" || normalized === "every_6_months") {
    return normalized;
  }

  if (normalized === "annual" || normalized === "annually") {
    return "yearly";
  }

  if (
    normalized === "semiannual" ||
    normalized === "semi-annual" ||
    normalized === "semi annually" ||
    normalized === "half yearly" ||
    normalized === "half-yearly" ||
    normalized === "biannual"
  ) {
    return "every_6_months";
  }

  const normalizedNoSpace = normalized.replace(/\s+/g, "_");
  if (normalizedNoSpace === "every_6_months" || normalizedNoSpace === "after_6_months") {
    return "every_6_months";
  }

  throw new Error("Unsupported frequency. Use daily, weekly, monthly, quarterly, yearly, or every 6 months.");
}

function tryRegexParser(prompt: string): ParsedTask | null {
  // Style-flexible parser that accepts different ordering, e.g.:
  // - "pay 0.1 sol yearly to <address>"
  // - "pay 0.1 sol to <address> yearly"
  // - "send 0.1 sol to <address> every 6 months"
  const amountTokenMatch = prompt.match(/(?:pay|send|transfer)\s+([0-9]*\.?[0-9]+)\s+([a-zA-Z]+)/i);
  if (!amountTokenMatch || !amountTokenMatch[1] || !amountTokenMatch[2]) {
    return null;
  }

  const receiverMatch = prompt.match(/\bto\s+([1-9A-HJ-NP-Za-km-z]{32,44})\b/i);
  if (!receiverMatch || !receiverMatch[1]) {
    return null;
  }

  const sixMonthMatch = prompt.match(/(?:every|after)\s+6\s+months?/i);
  const explicitFrequencyMatch = prompt.match(/\b(daily|weekly|monthly|quarterly|yearly|annually|annual|semiannual|semi-annual|semi annually|half yearly|half-yearly|biannual)\b/i);
  const everyUnitMatch = prompt.match(/\bevery\s+(day|week|month|quarter|year)\b/i);

  let frequencyValue: string | undefined;
  if (sixMonthMatch) {
    frequencyValue = "every_6_months";
  } else if (explicitFrequencyMatch && explicitFrequencyMatch[1]) {
    frequencyValue = explicitFrequencyMatch[1];
  } else if (everyUnitMatch && everyUnitMatch[1]) {
    const unit = everyUnitMatch[1].toLowerCase();
    if (unit === "day") frequencyValue = "daily";
    if (unit === "week") frequencyValue = "weekly";
    if (unit === "month") frequencyValue = "monthly";
    if (unit === "quarter") frequencyValue = "quarterly";
    if (unit === "year") frequencyValue = "yearly";
  }

  if (!frequencyValue) {
    return null;
  }

  const parsed = {
    amount: Number(amountTokenMatch[1]),
    token: amountTokenMatch[2],
    frequency: normalizeFrequency(frequencyValue),
    receiverAddress: receiverMatch[1],
  };

  const result = parsedTaskSchema.safeParse(parsed);
  return result.success ? result.data : null;
}

function extractFirstJsonObject(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not contain JSON");
  }

  return text.slice(start, end + 1);
}

async function tryOpenAIParser(prompt: string): Promise<ParsedTask | null> {
  if (!env.OPENAI_API_KEY) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "Extract autopay task details from text. Return strict JSON only with keys: amount(number), token(string), receiverAddress(string), frequency('daily'|'weekly'|'monthly'|'quarterly'|'yearly'|'every_6_months').",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    return null;
  }

  const parsedRaw = JSON.parse(extractFirstJsonObject(text));
  const parsed = parsedTaskSchema.safeParse({
    ...parsedRaw,
    frequency: typeof parsedRaw.frequency === "string" ? normalizeFrequency(parsedRaw.frequency) : parsedRaw.frequency,
  });

  return parsed.success ? parsed.data : null;
}

export async function parseNaturalLanguageTask(prompt: string): Promise<ParsedTask | null> {
  const fromAi = await tryOpenAIParser(prompt);
  if (fromAi) {
    return fromAi;
  }

  const fromRegex = tryRegexParser(prompt);
  if (fromRegex) {
    return fromRegex;
  }

  return null;
}
