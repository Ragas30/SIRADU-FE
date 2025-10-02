// Simple mock untuk auth
export async function loginApi(username: string, password: string) {
  // delay biar terasa "API call"
  await new Promise((r) => setTimeout(r, 500));

  if (username === "admin" && password === "admin123") {
    return {
      token: "mock-jwt-token",
      user: { id: 1, name: "Admin User", role: "admin" },
    };
  }
  throw new Error("Invalid username or password");
}

export async function logoutApi() {
  await new Promise((r) => setTimeout(r, 200));
  return { success: true };
}
