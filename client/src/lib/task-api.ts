import { api } from "@/lib/api";

export async function pauseTask(taskId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await api.post(`/api/task/pause/${taskId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to pause task",
    };
  }
}

export async function resumeTask(taskId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await api.post(`/api/task/resume/${taskId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to resume task",
    };
  }
}

export async function deleteTask(taskId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await api.delete(`/api/task/${taskId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete task",
    };
  }
}

export async function executeTask(taskId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await api.post(`/api/task/execute/${taskId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to execute task",
    };
  }
}

export async function linkPrivateKey(privateKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    await api.post("/api/wallet/private-key", { privateKey });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to link private key",
    };
  }
}

export async function createTask(taskData: {
  amount: number;
  token: string;
  receiverAddress: string;
  frequency: string;
  maxAmountLimit: number;
  expiryAt?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await api.post("/api/task/create", taskData);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
  }
}
