import { vi } from "vitest";

export const revalidatePath = vi.fn();
export const revalidateTag = vi.fn();

export const cookies = vi.fn().mockReturnValue({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
});

export const headers = vi.fn().mockReturnValue(new Map());
