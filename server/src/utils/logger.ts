type LogMeta = Record<string, unknown>;

function print(level: "INFO" | "WARN" | "ERROR", message: string, meta?: LogMeta) {
  const payload = {
    level,
    message,
    ...(meta ? { meta } : {}),
    timestamp: new Date().toISOString(),
  };

  if (level === "ERROR") {
    console.error(JSON.stringify(payload));
    return;
  }

  console.log(JSON.stringify(payload));
}

export const logger = {
  info: (message: string, meta?: LogMeta) => print("INFO", message, meta),
  warn: (message: string, meta?: LogMeta) => print("WARN", message, meta),
  error: (message: string, meta?: LogMeta) => print("ERROR", message, meta),
};
