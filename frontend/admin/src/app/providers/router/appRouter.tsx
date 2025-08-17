import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/app/Layout";
import { Analytics } from "@/pages/analytics";
import { Characters } from "@/pages/characters";
import { Quests } from "@/pages/quests";
import { Settings } from "@/pages/settings";

import { Login } from "@/pages/login";
import { ChangePassword } from "@/pages/changePassword";
import { UpdatePassword } from "@/pages/updatePassword";
import { CreateQuest } from "@/pages/createQuest";
import { ProtectedRoute } from "./ProtectedRoute";
import Redirect from "./Redirect";
import { Profile } from "@/pages/settings/ui/components/Profile/Profile";
import { Managers } from "@/pages/settings/ui/components/Managers/Managers";

export const appRouter = createBrowserRouter(
  [
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/login/change-password",
      element: <ChangePassword />,
    },
    {
      path: "/login/reset-password",
      element: <ChangePassword />,
    },
    {
      element: <Layout />,
      errorElement: <div>error</div>,
      children: [
        {
          path: "/",
          index: true,
          element: (
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          ),
        },
        {
          path: "/analytics/:id",
          element: (
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          ),
        },
        {
          path: "/characters",
          element: (
            <ProtectedRoute>
              <Characters />
            </ProtectedRoute>
          ),
        },
        {
          path: "/quests",
          element: (
            <ProtectedRoute>
              <Quests />
            </ProtectedRoute>
          ),
        },
        {
          path: "/quests/create",
          element: (
            <ProtectedRoute>
              <CreateQuest />
            </ProtectedRoute>
          ),
        },
        {
          path: "/quests/edit/:id",
          element: (
            <ProtectedRoute>
              <CreateQuest />
            </ProtectedRoute>
          ),
        },
        {
          path: "/settings",
          element: (
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          ),
          children: [
            {
              path: "/settings",
              index: true,
              element: (
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              ),
            },
            {
              path: "/settings/managers",
              element: (
                <ProtectedRoute>
                  <Managers />
                </ProtectedRoute>
              ),
            },
            {
              path: "/settings/update-password",
              element: (
                <ProtectedRoute>
                  <UpdatePassword />
                </ProtectedRoute>
              ),
            },
          ],
        },
        {
          path: "*",
          element: <Redirect url="https://lyceum.yandex.ru" />,
        },
      ],
    },
  ],
  { basename: "/admin" }
);
