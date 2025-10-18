import { describe, it, expect, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useAuthStore } from "@/store/auth"

describe("Auth Store", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useAuthStore())
    act(() => {
      result.current.logout()
    })
  })

  it("initializes with null user and token", () => {
    const { result } = renderHook(() => useAuthStore())
    expect(result.current.user).toBeNull()
    expect(result.current.accessToken).toBeNull()
  })

  it("sets access token", () => {
    const { result } = renderHook(() => useAuthStore())
    act(() => {
      result.current.setAccessToken("test-token")
    })
    expect(result.current.accessToken).toBe("test-token")
  })

  it("sets user", () => {
    const { result } = renderHook(() => useAuthStore())
    const mockUser = {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      roles: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    act(() => {
      result.current.setUser(mockUser)
    })
    expect(result.current.user).toEqual(mockUser)
  })

  it("logs out user", () => {
    const { result } = renderHook(() => useAuthStore())
    act(() => {
      result.current.setAccessToken("test-token")
      result.current.logout()
    })
    expect(result.current.user).toBeNull()
    expect(result.current.accessToken).toBeNull()
  })
})
