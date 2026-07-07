import axios from "axios";

export const httpClient = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ApiError {
  message: string;
  status?: number;
}

export function extractApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;

    return {
      message: data?.message ?? error.message,
      status: error.response?.status,
    };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "Erro inesperado. Tente novamente." };
}
