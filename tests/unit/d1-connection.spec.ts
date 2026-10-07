import { afterEach, describe, expect, it, vi } from "vitest"
vi.mock("next/headers", () => ({ cookies: () => ({ get: () => undefined }) }))
import { queryD1 } from "@/lib/d1/client"
import { hashPassword, verifyPassword, currentAdmin } from "@/lib/auth/server"
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})
describe("D1 server connection", () => {
  it("fails closed without server credentials", async () => {
    vi.stubEnv("D1_LOCAL", "0")
    vi.stubEnv("CLOUDFLARE_API_TOKEN", "")
    await expect(queryD1([{ sql: "SELECT 1" }])).rejects.toThrow("configuration")
  })
  it("uses parameterized batch requests and disables caching", async () => {
    vi.stubEnv("D1_LOCAL", "0")
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "account")
    vi.stubEnv("CLOUDFLARE_D1_DATABASE_ID", "database")
    vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-token")
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        result: [{ success: true, results: [{ id: "one" }] }],
      }),
    })
    vi.stubGlobal("fetch", fetch)
    expect(await queryD1([{ sql: "SELECT id WHERE key=?", params: ["'payload"] }])).toEqual([
      [{ id: "one" }],
    ])
    const options = fetch.mock.calls[0][1]
    expect(options.cache).toBe("no-store")
    expect(JSON.parse(options.body).params).toEqual(["'payload"])
  })
  it("wraps multiple parameterized statements in a batch object", async () => {
    vi.stubEnv("D1_LOCAL", "0")
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "account")
    vi.stubEnv("CLOUDFLARE_D1_DATABASE_ID", "database")
    vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-token")
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        result: [
          { success: true, results: [] },
          { success: true, results: [] },
        ],
      }),
    })
    vi.stubGlobal("fetch", fetch)
    const statements = [
      { sql: "SELECT ?", params: [1] },
      { sql: "SELECT ?", params: [2] },
    ]
    await queryD1(statements)
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ batch: statements })
  })
  it("rejects failed statements even on HTTP success", async () => {
    vi.stubEnv("D1_LOCAL", "0")
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "account")
    vi.stubEnv("CLOUDFLARE_D1_DATABASE_ID", "database")
    vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-token")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, result: [{ success: false }] }),
      })
    )
    await expect(queryD1([{ sql: "SELECT 1" }])).rejects.toThrow("query failed")
  })
  it("uses salted passwords and rejects anonymous admins", () => {
    const hash = hashPassword("test-password")
    expect(hash).not.toBe(hashPassword("test-password"))
    expect(verifyPassword("test-password", hash)).toBe(true)
    expect(verifyPassword("wrong", hash)).toBe(false)
    expect(currentAdmin()).toBeNull()
  })
})
