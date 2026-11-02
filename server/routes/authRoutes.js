
const express = require("express");
const router = express.Router();

const supabase = require("../../config/supabase");
const { addToken } = require("../utils/tokenBlacklist");
const authenticateUser = require("../middleware/authMiddleware");

// ==========================================
// SIGNUP API
// ==========================================

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: StrongPass@123
 *     responses:
 *       201:
 *         description: Signup successful
 *       400:
 *         description: Missing input or signup failed
 */
router.post("/signup", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(201).json({
            message: data.session
                ? "Signup successful"
                : "Signup successful. Please verify your email before logging in.",
            user: data.user,
            session: data.session
        });

    } catch (error) {
        console.error("Signup error:", error);

        return res.status(500).json({
            message: "Server error during signup"
        });
    }
});

// ==========================================
// LOGIN API
// ==========================================

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login an existing user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: StrongPass@123
 *     responses:
 *       200:
 *         description: Login successful. Returns access and refresh tokens.
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid login credentials
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const { data, error } =
            await supabase.auth.signInWithPassword({
                email,
                password
            });

        if (error) {
            return res.status(401).json({
                message: "Invalid login credentials"
            });
        }

        return res.status(200).json({
            message: "Login successful",
            user: data.user,
            session: data.session
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Server error during login"
        });
    }
});

// ==========================================
// LOGOUT API (PROTECTED)
// ==========================================

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout the current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Logout successful. No response body.
 *       401:
 *         description: Missing, invalid or expired token
 */
router.post("/logout", authenticateUser, async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];

        // Add token to application blacklist
        addToken(token);

        // Create a user-specific Supabase client
        const { createClient } = require("@supabase/supabase-js");

        const userSupabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_KEY,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                },
                auth: {
                    persistSession: false,
                    autoRefreshToken: false
                }
            }
        );

        // Revoke the Supabase session
        const { error: logoutError } =
            await userSupabase.auth.signOut();

        if (logoutError) {
            console.error("Supabase logout error:", logoutError);

            return res.status(500).json({
                message: "Supabase logout failed"
            });
        }

        // HTTP 204 means successful response with no body
        return res.status(204).send();

    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            message: "Server error during logout"
        });
    }
});

module.exports = router;
