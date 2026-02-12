import { vi } from "vitest";

export const mockOrganization = {
  id: "org-1",
  name: "Test Org",
  slug: "test-org",
};

export const mockUser = {
  id: "user-1",
  email: "test@example.com",
  role: "owner" as const,
};

export const requireOrganization = vi.fn().mockResolvedValue({
  user: mockUser,
  organization: mockOrganization,
});

export const requireUser = vi.fn().mockResolvedValue(mockUser);
