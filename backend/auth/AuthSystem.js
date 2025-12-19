/**
 * Authentication System
 * Handle user registration, login, and session management
 */

const crypto = require('crypto');

class AuthSystem {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
        this.initializeDefaultUser();
    }

    /**
     * Initialize default user for testing
     */
    initializeDefaultUser() {
        this.users.set('admin@r3sn.com', {
            id: 'user_1',
            name: 'Admin User',
            email: 'admin@r3sn.com',
            password: this.hashPassword('admin123'),
            createdAt: new Date()
        });
    }

    /**
     * Hash password
     */
    hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    /**
     * Generate token
     */
    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Register new user
     */
    async signup(name, email, password) {
        // Check if user exists
        if (this.users.has(email)) {
            return {
                success: false,
                error: 'User already exists'
            };
        }

        // Validate inputs
        if (!name || !email || !password) {
            return {
                success: false,
                error: 'All fields are required'
            };
        }

        if (password.length < 6) {
            return {
                success: false,
                error: 'Password must be at least 6 characters'
            };
        }

        // Create user
        const userId = `user_${Date.now()}`;
        const user = {
            id: userId,
            name,
            email,
            password: this.hashPassword(password),
            createdAt: new Date()
        };

        this.users.set(email, user);

        return {
            success: true,
            message: 'User created successfully'
        };
    }

    /**
     * Login user
     */
    async login(email, password) {
        // Get user
        const user = this.users.get(email);

        if (!user) {
            return {
                success: false,
                error: 'Invalid email or password'
            };
        }

        // Check password
        const hashedPassword = this.hashPassword(password);
        if (user.password !== hashedPassword) {
            return {
                success: false,
                error: 'Invalid email or password'
            };
        }

        // Generate token
        const token = this.generateToken();

        // Create session
        this.sessions.set(token, {
            userId: user.id,
            email: user.email,
            createdAt: new Date()
        });

        return {
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        };
    }

    /**
     * Verify token
     */
    verifyToken(token) {
        const session = this.sessions.get(token);

        if (!session) {
            return null;
        }

        // Check if session is expired (24 hours)
        const now = new Date();
        const sessionAge = now - session.createdAt;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (sessionAge > maxAge) {
            this.sessions.delete(token);
            return null;
        }

        return session;
    }

    /**
     * Logout user
     */
    logout(token) {
        this.sessions.delete(token);
        return {
            success: true,
            message: 'Logged out successfully'
        };
    }

    /**
     * Get user by ID
     */
    getUserById(userId) {
        for (const [email, user] of this.users) {
            if (user.id === userId) {
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email
                };
            }
        }
        return null;
    }

    /**
     * Update user
     */
    updateUser(userId, updates) {
        for (const [email, user] of this.users) {
            if (user.id === userId) {
                if (updates.name) user.name = updates.name;
                if (updates.password) user.password = this.hashPassword(updates.password);

                return {
                    success: true,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    }
                };
            }
        }

        return {
            success: false,
            error: 'User not found'
        };
    }

    /**
     * Delete user
     */
    deleteUser(userId) {
        for (const [email, user] of this.users) {
            if (user.id === userId) {
                this.users.delete(email);

                // Delete all sessions for this user
                for (const [token, session] of this.sessions) {
                    if (session.userId === userId) {
                        this.sessions.delete(token);
                    }
                }

                return {
                    success: true,
                    message: 'User deleted successfully'
                };
            }
        }

        return {
            success: false,
            error: 'User not found'
        };
    }

    /**
     * List all users (admin only)
     */
    listUsers() {
        const users = [];

        for (const [email, user] of this.users) {
            users.push({
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            });
        }

        return users;
    }
}

module.exports = AuthSystem;
