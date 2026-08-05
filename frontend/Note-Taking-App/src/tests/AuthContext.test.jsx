import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import api from "../api/axios";

jest.mock("../api/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const TestComponent = () => {
  const { user, loading, login, logout, register } = useAuth();

  return (
    <div>
      <p data-testid="loading">{loading ? "loading" : "not-loading"}</p>
      <p data-testid="user">{user ? user.email : "no-user"}</p>
      <button onClick={() => login("test@example.com", "password123")}>
        Login
      </button>
      <button onClick={() => logout().catch(() => {})}>Logout</button>
      <button onClick={() => register("Test", "test@example.com", "password123")}>
        Register
      </button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should start with loading true, then resolve to no user if /auth/me fails", async () => {
    try {
      api.get.mockRejectedValueOnce(new Error("Not authenticated"));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("loading").textContent).toBe("loading");

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("not-loading");
      });

      expect(screen.getByTestId("user").textContent).toBe("no-user");
    } catch (error) {
      throw error;
    }
  });

  it("should set user after successful /auth/me on mount", async () => {
    try {
      api.get.mockResolvedValueOnce({
        data: { _id: "1", name: "Test", email: "test@example.com" },
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("user").textContent).toBe("test@example.com");
      });
    } catch (error) {
      throw error;
    }
  });

  it("should set user after login", async () => {
    try {
      api.get.mockRejectedValueOnce(new Error("Not authenticated"));
      api.post.mockResolvedValueOnce({
        data: { _id: "1", name: "Test", email: "test@example.com" },
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("not-loading");
      });

      await act(async () => {
        screen.getByText("Login").click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("user").textContent).toBe("test@example.com");
      });

      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@example.com",
        password: "password123",
      });
    } catch (error) {
      throw error;
    }
  });

  it("should clear user after successful logout", async () => {
    try {
      api.get.mockResolvedValueOnce({
        data: { _id: "1", name: "Test", email: "test@example.com" },
      });
      api.post.mockResolvedValueOnce({});

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("user").textContent).toBe("test@example.com");
      });

      await act(async () => {
        screen.getByText("Logout").click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("user").textContent).toBe("no-user");
      });
    } catch (error) {
      throw error;
    }
  });

  it("should NOT clear user if logout request fails", async () => {
    try {
      api.get.mockResolvedValueOnce({
        data: { _id: "1", name: "Test", email: "test@example.com" },
      });
      api.post.mockRejectedValueOnce(new Error("Network error"));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("user").textContent).toBe("test@example.com");
      });

      await act(async () => {
        screen.getByText("Logout").click();
      });

      expect(screen.getByTestId("user").textContent).toBe("test@example.com");
    } catch (error) {
      throw error;
    }
  });

  it("should NOT set user after register (backend does not log in on register)", async () => {
    try {
      api.get.mockRejectedValueOnce(new Error("Not authenticated"));
      api.post.mockResolvedValueOnce({
        data: { _id: "1", name: "Test", email: "test@example.com" },
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("not-loading");
      });

      await act(async () => {
        screen.getByText("Register").click();
      });

      expect(screen.getByTestId("user").textContent).toBe("no-user");
    } catch (error) {
      throw error;
    }
  });
});