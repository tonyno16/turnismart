import { vi } from "vitest";

/** Chainable mock that mimics Drizzle ORM's query builder pattern */
function createChainableMock(resolvedValue: unknown = []) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};

  const methods = [
    "select",
    "selectDistinct",
    "from",
    "where",
    "limit",
    "orderBy",
    "innerJoin",
    "leftJoin",
    "insert",
    "values",
    "returning",
    "update",
    "set",
    "delete",
  ];

  for (const method of methods) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }

  // The chain is also thenable (await resolves to the value)
  (chain as any).then = (resolve: (v: unknown) => void) =>
    resolve(resolvedValue);

  return chain;
}

export function createMockDb() {
  const mockDb = {
    select: vi.fn(),
    selectDistinct: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  function makeChain(resolvedValue: unknown = []) {
    const chain = createChainableMock(resolvedValue);
    return chain;
  }

  // Each top-level method returns a fresh chain
  mockDb.select.mockImplementation(() => makeChain([]));
  mockDb.selectDistinct.mockImplementation(() => makeChain([]));
  mockDb.insert.mockImplementation(() => makeChain([]));
  mockDb.update.mockImplementation(() => makeChain([]));
  mockDb.delete.mockImplementation(() => makeChain([]));

  return mockDb;
}

/** Helper to set the resolved value for a specific db.select() call */
export function mockSelectReturning(mockDb: ReturnType<typeof createMockDb>, value: unknown) {
  const chain = createChainableMock(value);
  mockDb.select.mockReturnValueOnce(chain);
  return chain;
}
