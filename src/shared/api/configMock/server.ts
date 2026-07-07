import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/** Servidor MSW para ambiente Node (Vitest). */
export const server = setupServer(...handlers);
