"use client"

import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Button } from "@/components/ui/button"

describe("Button Component", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText("Click me")).toBeInTheDocument()
  })

  it("renders button with different variants", () => {
    const { rerender } = render(<Button variant="default">Default</Button>)
    expect(screen.getByText("Default")).toBeInTheDocument()

    rerender(<Button variant="destructive">Destructive</Button>)
    expect(screen.getByText("Destructive")).toBeInTheDocument()
  })

  it("handles click events", () => {
    let clicked = false
    render(<Button onClick={() => (clicked = true)}>Click</Button>)
    screen.getByText("Click").click()
    expect(clicked).toBe(true)
  })

  it("disables button when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText("Disabled")).toBeDisabled()
  })
})
