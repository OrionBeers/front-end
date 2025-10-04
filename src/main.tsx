import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { ThemeProvider } from "./components/themeProvider/theme-provider.tsx";
import "./index.css";
import { AuthProvider } from "./lib/auth.provider.tsx";
import AboutUs from "./pages/aboutUs.tsx";
import HomePage from "./pages/home.tsx";
import Layout from "./pages/layout.tsx";
import ProtectedRoute from "./pages/protected-route.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthProvider />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "/dashboard",
            element: <div>Dashboard</div>,
          },
          {
            path: "/about-us",
            element: <AboutUs />,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
