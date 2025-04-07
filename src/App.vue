<template>
    <div id="app" :class="{ 'dark-mode': isDarkMode }">
        <header class="topbar">
            <div class="logo">CloudScrapper</div>
            <button class="menu-toggle" @click="toggleMenu">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </button>
            <nav :class="{ 'mobile-open': menuOpen }">
                <ul>
                    <li><router-link to="/" @click="menuOpen = false">Home</router-link></li>
                    <li v-if="!isAuthenticated"><router-link to="/login" @click="menuOpen = false">Login /
                            Register</router-link></li>
                    <li v-if="isAuthenticated"><router-link to="/account" @click="menuOpen = false">Mon
                            Compte</router-link></li>
                    <li v-if="isAuthenticated"><router-link to="/dashboard"
                            @click="menuOpen = false">Dashboard</router-link></li>
                    <li v-if="isAuthenticated"><router-link to="/api-request" @click="menuOpen = false">API
                            Request</router-link></li>
                    <li>
                        <button @click="toggleDarkMode" class="theme-toggle">
                            {{ isDarkMode ? '☀️' : '🌙' }}
                        </button>
                    </li>
                    <li v-if="isAuthenticated" class="user-menu">
                        <span>{{ userName }}</span>
                        <button @click="handleLogout" class="logout-btn">Logout</button>
                    </li>
                </ul>
            </nav>
        </header>
        <div class="content-wrapper">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
import { logout } from './api';

export default {
    name: 'App',
    data() {
        return {
            isAuthenticated: false,
            userName: '',
            token: '',
            isDarkMode: false,
            menuOpen: false
        };
    },
    created() {
        this.checkAuth();
        this.loadThemePreference();
    },
    methods: {
        checkAuth() {
            const token = localStorage.getItem('token');
            if (token) {
                this.isAuthenticated = true;
                this.token = token;

                // Get user info if available
                try {
                    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
                    this.userName = userInfo.full_name || userInfo.email || 'User';
                } catch (e) {
                    this.userName = 'User';
                }
            }
        },
        async handleLogout() {
            try {
                if (this.token) {
                    await logout(this.token);
                }
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                this.isAuthenticated = false;
                this.userName = '';
                this.token = '';

                // Redirect to home after logout
                if (this.$router.currentRoute.value.path !== '/') {
                    this.$router.push('/');
                } else {
                    // Force a reload to update components
                    window.location.reload();
                }
            } catch (error) {
                console.error('Logout error:', error);
                // Even if logout API fails, clear local storage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
            }
        },
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode;
            localStorage.setItem('darkMode', this.isDarkMode ? 'true' : 'false');
            this.menuOpen = false;
        },
        toggleMenu() {
            this.menuOpen = !this.menuOpen;
        },
        loadThemePreference() {
            const savedTheme = localStorage.getItem('darkMode');
            this.isDarkMode = savedTheme === 'true';
        }
    }
};
</script>

<style>
:root {
    /* Color palette */
    --primary: #4f46e5;
    --primary-hover: #4338ca;
    --primary-light: #e0e7ff;
    --primary-dark: #3730a3;
    --secondary: #06b6d4;
    --secondary-hover: #0891b2;

    /* Background and text colors */
    --bg-color: #ffffff;
    --bg-color-offset: #f9fafb;
    --bg-color-secondary: #f3f4f6;
    --text-color: #111827;
    --text-color-secondary: #4b5563;
    --text-color-muted: #6b7280;

    /* Header specific colors */
    --header-bg-color: #4f46e5;
    --header-text-color: white;

    /* UI elements */
    --card-bg-color: #ffffff;
    --border-color: #e5e7eb;
    --table-header-bg: #f9fafb;
    --table-border: #e5e7eb;

    /* Button colors */
    --button-primary: #4f46e5;
    --button-primary-hover: #4338ca;
    --button-secondary: #06b6d4;
    --button-secondary-hover: #0891b2;
    --button-danger: #ef4444;
    --button-danger-hover: #dc2626;
    --button-success: #10b981;
    --button-success-hover: #059669;

    /* Modal and overlay */
    --modal-overlay-bg: rgba(17, 24, 39, 0.5);
    --modal-bg: #ffffff;

    /* Code elements */
    --code-bg-color: #f3f4f6;
    --code-text-color: #111827;

    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;

    /* Border radius */
    --radius-sm: 0.25rem;
    --radius: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    --radius-full: 9999px;

    /* Transitions */
    --transition: all 0.2s ease;
    --transition-slow: all 0.3s ease;
}

.dark-mode {
    --primary: #6366f1;
    --primary-hover: #4f46e5;
    --primary-light: #312e81;
    --primary-dark: #c7d2fe;

    /* Background and text colors */
    --bg-color: #0f172a;
    --bg-color-offset: #1e293b;
    --bg-color-secondary: #334155;
    --text-color: #f8fafc;
    --text-color-secondary: #cbd5e1;
    --text-color-muted: #94a3b8;

    /* Header specific colors */
    --header-bg-color: #1e293b;
    --header-text-color: #f8fafc;

    /* UI elements */
    --card-bg-color: #1e293b;
    --border-color: #334155;
    --table-header-bg: #334155;
    --table-border: #475569;

    /* Button colors stay largely the same for recognition */

    /* Modal and overlay */
    --modal-overlay-bg: rgba(0, 0, 0, 0.7);
    --modal-bg: #1e293b;

    /* Code elements */
    --code-bg-color: #334155;
    --code-text-color: #f8fafc;

    /* Shadows are slightly darker */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
    --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
}

/* Global styles */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
        Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    margin: 0;
    padding: 0;
    background-color: var(--bg-color);
    color: var(--text-color);
    line-height: 1.5;
    transition: background-color 0.3s, color 0.3s;
}

#app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: var(--bg-color);
    color: var(--text-color);
}

a {
    color: var(--primary);
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

/* Typography */
h1,
h2,
h3,
h4,
h5,
h6 {
    margin-bottom: var(--spacing-md);
    font-weight: 600;
    line-height: 1.25;
    color: var(--text-color);
}

h1 {
    font-size: 2rem;
}

h2 {
    font-size: 1.5rem;
}

h3 {
    font-size: 1.25rem;
}

p {
    margin-bottom: var(--spacing-md);
}

/* Layout Components */
.content-wrapper {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: var(--spacing-lg);
    flex: 1;
}

/* Header and Navigation */
.topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--header-bg-color);
    padding: var(--spacing-md) var(--spacing-xl);
    color: var(--header-text-color);
    box-shadow: var(--shadow-md);
    position: sticky;
    top: 0;
    z-index: 100;
    transition: var(--transition);
}

.topbar .logo {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.025em;
}

.topbar nav ul {
    list-style: none;
    display: flex;
    gap: var(--spacing-lg);
    margin: 0;
    padding: 0;
    align-items: center;
}

.topbar nav ul li {
    display: inline;
}

.topbar nav ul li a {
    color: var(--header-text-color);
    text-decoration: none;
    font-weight: 500;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius);
    transition: var(--transition);
}

.topbar nav ul li a:hover,
.topbar nav ul li a.router-link-active {
    background-color: rgba(255, 255, 255, 0.1);
}

.theme-toggle {
    background: transparent;
    border: none;
    color: var(--header-text-color);
    font-size: 1.2rem;
    cursor: pointer;
    padding: var(--spacing-sm);
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
}

.theme-toggle:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.user-menu {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    background-color: rgba(255, 255, 255, 0.1);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius);
}

.logout-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: var(--header-text-color);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: 0.875rem;
    white-space: nowrap;
    transition: var(--transition);
}

.logout-btn:hover {
    background: rgba(255, 255, 255, 0.3);
}

.menu-toggle {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 2rem;
    height: 1.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 10;
}

.menu-toggle .bar {
    height: 2px;
    width: 100%;
    background-color: var(--header-text-color);
    border-radius: var(--radius-full);
    transition: var(--transition);
}

/* Form Elements */
input,
select,
textarea,
button {
    font-family: inherit;
    font-size: 1rem;
}

input,
select,
textarea {
    padding: var(--spacing-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    background-color: var(--bg-color);
    color: var(--text-color);
    width: 100%;
    transition: var(--transition);
}

input:focus,
select:focus,
textarea:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light);
}

button {
    cursor: pointer;
    border: none;
    padding: var(--spacing-sm) var(--spacing-lg);
    font-weight: 500;
    border-radius: var(--radius);
    transition: var(--transition);
}

.btn-primary {
    background-color: var(--button-primary);
    color: white;
}

.btn-primary:hover {
    background-color: var(--button-primary-hover);
}

.btn-secondary {
    background-color: var(--button-secondary);
    color: white;
}

.btn-secondary:hover {
    background-color: var(--button-secondary-hover);
}

.btn-danger {
    background-color: var(--button-danger);
    color: white;
}

.btn-danger:hover {
    background-color: var(--button-danger-hover);
}

.btn-success {
    background-color: var(--button-success);
    color: white;
}

.btn-success:hover {
    background-color: var(--button-success-hover);
}

/* Card Components */
.card {
    background-color: var(--card-bg-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
    transition: var(--transition);
}

.card:hover {
    box-shadow: var(--shadow-md);
}

/* Table Styles */
table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin-bottom: var(--spacing-lg);
}

th {
    text-align: left;
    padding: var(--spacing-md);
    background-color: var(--table-header-bg);
    color: var(--text-color);
    font-weight: 600;
    border-bottom: 1px solid var(--table-border);
}

th:first-child {
    border-top-left-radius: var(--radius);
}

th:last-child {
    border-top-right-radius: var (--radius);
}

td {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--table-border);
}

tr:last-child td:first-child {
    border-bottom-left-radius: var(--radius);
}

tr:last-child td:last-child {
    border-bottom-right-radius: var(--radius);
}

tr:hover td {
    background-color: var(--bg-color-offset);
}

/* Responsive styles */
@media (max-width: 768px) {
    .topbar {
        padding: var(--spacing-md);
    }

    .menu-toggle {
        display: flex;
    }

    .topbar nav {
        position: fixed;
        top: 0;
        right: -100%;
        width: 70%;
        max-width: 300px;
        height: 100%;
        background-color: var(--header-bg-color);
        transition: all 0.3s ease-in-out;
        z-index: 9;
        padding-top: 60px;
        box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
    }

    .topbar nav.mobile-open {
        right: 0;
    }

    .topbar nav ul {
        flex-direction: column;
        align-items: flex-start;
        padding: 0 var(--spacing-md);
    }

    .topbar nav ul li {
        margin: var(--spacing-md) 0;
        width: 100%;
    }

    .user-menu {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);
        width: 100%;
    }

    .content-wrapper {
        padding: var(--spacing-md);
    }
}
</style>