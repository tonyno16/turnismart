import { describe, it, expect, vi, beforeEach } from "vitest";

function chainableMock(resolvedValue: unknown = []) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "from", "where", "limit", "insert", "update", "set", "values", "returning"];
  for (const method of methods) {
    (chain as Record<string, unknown>)[method] = vi.fn().mockReturnValue(chain);
  }
  (chain as { then: (resolve: (v: unknown) => void) => void }).then = (
    resolve: (v: unknown) => void
  ) => resolve(resolvedValue);
  return chain;
}

const mockDb = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@trigger.dev/sdk/v3", () => ({
  task: (config: { id: string; run: (p: unknown, ctx?: unknown) => Promise<unknown> }) => ({
    id: config.id,
    run: config.run,
    trigger: vi.fn(),
    triggerAndWait: vi.fn((payload: unknown) => config.run(payload)),
  }),
  logger: { error: vi.fn(), info: vi.fn() },
}));
vi.mock("@/trigger/db", () => ({
  getDb: () => mockDb,
}));
vi.mock("papaparse", () => ({
  default: {
    parse: vi.fn(),
  },
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        download: vi.fn().mockResolvedValue({
          data: {
            text: () => Promise.resolve("nome,cognome,email\nMario,Rossi,mario@test.com"),
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
          },
        }),
        remove: vi.fn().mockResolvedValue(undefined),
      })),
    },
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createEmployeeRecords task", () => {
  it("inserts employees and returns imported count", async () => {
    const { createEmployeeRecords } = await import("@/trigger/csv-import");

    mockDb.insert.mockReturnValue(
      chainableMock([{ id: "emp-1" }])
    );

    const result = await createEmployeeRecords.triggerAndWait({
      jobId: "job1",
      organizationId: "org1",
      validRows: [
        { first_name: "Mario", last_name: "Rossi", email: "mario@test.com", role: "Commesso", _row: 2 } as unknown as Record<string, string>,
      ],
      roleNameToId: { commesso: "role-1" },
    });

    expect(result).toEqual(
      expect.objectContaining({ imported: 1, errors: [] })
    );
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it("returns errors for failed inserts", async () => {
    const { createEmployeeRecords } = await import("@/trigger/csv-import");

    mockDb.insert
      .mockReturnValueOnce(chainableMock(Promise.reject(new Error("Duplicate key"))))
      .mockReturnValue(chainableMock());

    const result = await createEmployeeRecords.triggerAndWait({
      jobId: "job1",
      organizationId: "org1",
      validRows: [
        { first_name: "Mario", last_name: "Rossi", _row: 2 } as unknown as Record<string, string>,
      ],
      roleNameToId: {},
    });

    expect(result).toEqual(
      expect.objectContaining({
        imported: 0,
        errors: expect.arrayContaining([
          expect.objectContaining({ row: 2, reason: expect.any(String) }),
        ]),
      })
    );
  });
});

describe("finalizeImport task", () => {
  it("updates import job with completed status", async () => {
    const { finalizeImport } = await import("@/trigger/csv-import");

    const updateChain = chainableMock();
    mockDb.update.mockReturnValue(updateChain);

    await finalizeImport.triggerAndWait({
      jobId: "job1",
      imported: 5,
      skipped: 1,
      errors: [],
    });

    expect(mockDb.update).toHaveBeenCalled();
    expect((updateChain as { set: ReturnType<typeof vi.fn> }).set).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "completed",
        progress_percentage: 100,
      })
    );
  });
});
