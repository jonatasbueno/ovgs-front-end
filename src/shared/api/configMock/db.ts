import { criarSeed, type MockDb } from "./seed";

const STORAGE_KEY = "ovgs-mock-db";

let memoryDb: MockDb | null = null;

function temSessionStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.sessionStorage);
}

export function getDb(): MockDb {
  if (memoryDb) return memoryDb;

  if (temSessionStorage()) {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);

    if (raw) {
      try {
        memoryDb = JSON.parse(raw) as MockDb;

        return memoryDb;
      } catch {
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  memoryDb = criarSeed();
  persistir();

  return memoryDb;
}

export function persistir(): void {
  if (memoryDb && temSessionStorage()) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(memoryDb));
  }
}

/** Restaura o seed inicial. Usado principalmente nos testes. */
export function resetDb(): MockDb {
  memoryDb = criarSeed();
  persistir();

  return memoryDb;
}
