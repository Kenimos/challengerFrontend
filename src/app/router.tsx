import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ChallengesPage from "../features/challenges/pages/ChallengesPage";
import ChallengePage from "../features/challenge/pages/ChallengePage";
import ProfilePage from "../features/challenge/pages/ProfilePage";
import ProtectedRoute from "./ProtectedRoute";
import JoinChallengePage from "../features/challenge/pages/JoinChallengePage"; // ← přidej ten import

export const router = createBrowserRouter([
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },

    // 👇 přidáš sem — join link je veřejný
    { path: "/join/:challengeId", element: <JoinChallengePage /> },

    {
        path: "/",
        element: <ProtectedRoute />,
        children: [
            { index: true, element: <Navigate to="/challenges" replace /> },
            { path: "challenges", element: <ChallengesPage /> },
            { path: "challenges/:id", element: <ChallengePage /> },
            { path: "users/:userId", element: <ProfilePage /> },
        ],
    },

    { path: "*", element: <Navigate to="/" replace /> },
]);
