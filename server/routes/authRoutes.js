
const express = require("express");
const router = express.Router();

const supabase = require("../../config/supabase");
const { addToken } = require("../utils/tokenBlacklist");

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
 *         description: Signup failed
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
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
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
                message: error.message
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
// LOGOUT API
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
 *       200:
 *         description: Logout successful and token revoked
 *       401:
 *         description: Missing or invalid token
 */
router.post("/logout", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication token required"
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify token with Supabase
        const { data, error } =
            await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        // Revoke token in our application
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

        // Revoke Supabase session
        const { error: logoutError } =
            await userSupabase.auth.signOut();

        if (logoutError) {
            console.error("Supabase logout error:", logoutError);
        }

        return res.status(200).json({
            message: "Logout successful. Token revoked."
        });

    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            message: "Server error during logout"
        });
    }
});

module.exports = router;
