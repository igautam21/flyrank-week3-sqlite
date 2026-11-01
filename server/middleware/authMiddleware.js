
const supabase = require("../../config/supabase");

const { isTokenBlacklisted } = require("../utils/tokenBlacklist");

const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access denied. Authentication token required."
            });
        }

        const token = authHeader.split(" ")[1];

        // Check whether token was revoked by our application
        if (isTokenBlacklisted(token)) {
            return res.status(401).json({
                message: "Token has been revoked. Please log in again."
            });
        }

        // Verify token with Supabase
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                message: "Invalid or expired authentication token."
            });
        }

        req.user = data.user;

        next();

    } catch (error) {
        console.error("Authentication error:", error);

        return res.status(500).json({
            message: "Internal server error during authentication."
        });
    }
};

module.exports = authenticateUser;
