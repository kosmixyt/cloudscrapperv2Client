<template>
    <div id="app" :class="{ 'dark-mode': isDarkMode }">
        <header class="topbar">
            <div class="logo">MyApp</div>
            <button class="menu-toggle" @click="toggleMenu">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </button>
            <nav :class="{ 'mobile-open': menuOpen }">
                <ul>
                    <li><router-link to="/" @click="menuOpen = false">Home</router-link></li>
                    <li><router-link to="/about" @click="menuOpen = false">About</router-link></li>
                    <li v-if="!isAuthenticated"><router-link to="/login" @click="menuOpen = false">Login /
                            Register</router-link></li>
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
        <div style="width: 95vw; margin-left: 2.5vw;">
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
/* Add global box-sizing to fix overflow issues */
* {
    box-sizing: border-box;
}

:root {
    --bg-color: #ffffff;
    --text-color: #2c3e50;
    --header-bg-color: #42b983;
    --header-text-color: white;
    --card-bg-color: #f5f5f5;
    --border-color: #ddd;
    --table-header-bg: #f2f2f2;
    --table-border: #ddd;
    --button-primary: #4CAF50;
    --button-primary-hover: #45a049;
    --button-view: #2196F3;
    --button-view-hover: #0b7dda;
    --button-delete: #f44336;
    --button-delete-hover: #d32f2f;
    --modal-overlay-bg: rgba(0, 0, 0, 0.4);
    --modal-bg: #ffffff;
    --code-bg-color: #f5f5f5;
    --code-text-color: #333333;
}

.dark-mode {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg-color: #2c3e50;
    --header-text-color: #e0e0e0;
    --card-bg-color: #2d2d2d;
    --border-color: #444;
    --table-header-bg: #333333;
    --table-border: #444;
    --button-primary: #388e3c;
    --button-primary-hover: #2e7d32;
    --button-view: #1976d2;
    --button-view-hover: #1565c0;
    --button-delete: #d32f2f;
    --button-delete-hover: #c62828;
    --modal-overlay-bg: rgba(0, 0, 0, 0.7);
    --modal-bg: #2d2d2d;
    --code-bg-color: #333333;
    --code-text-color: #e0e0e0;
}

body {
    margin: 0;
    padding: 0;
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
    overflow-x: hidden;
    /* Prevent horizontal scrolling */
}

#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    margin-top: 0;
    min-height: 100vh;
    background-color: var(--bg-color);
    color: var(--text-color);
    width: 100%;
    overflow-x: hidden;
    /* Prevent horizontal overflow */
    display: flex;
    flex-direction: column;
}

.topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--header-bg-color);
    padding: 1rem 2rem;
    color: var(--header-text-color);
    transition: background-color 0.3s;
    position: relative;
}

.menu-toggle {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 30px;
    height: 21px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 10;
}

.menu-toggle .bar {
    height: 3px;
    width: 100%;
    background-color: white;
    border-radius: 10px;
}

.topbar .logo {
    font-size: 1.5rem;
    font-weight: bold;
}

.topbar nav ul {
    list-style: none;
    display: flex;
    gap: 1rem;
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
    font-weight: bold;
}

.topbar nav ul li a:hover {
    text-decoration: underline;
}

.theme-toggle {
    background: transparent;
    border: none;
    color: var(--header-text-color);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-menu {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.logout-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid white;
    color: var(--header-text-color);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    white-space: nowrap;
    transition: background-color 0.2s;
}

.logout-btn:hover {
    background: rgba(255, 255, 255, 0.3);
}

main {
    padding: 2rem;
    flex-grow: 1;
    width: 100%;
    overflow-x: hidden;
}

/* Responsive styles */
@media (max-width: 768px) {
    .topbar {
        padding: 1rem;
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
        padding: 0 1rem;
    }

    .topbar nav ul li {
        margin: 1rem 0;
        width: 100%;
    }

    .user-menu {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}

@media (max-width: 600px) {
    main {
        padding: 1rem;
    }
}

/* Global dark mode styles for common elements */
table {
    border-color: var(--table-border);
}

th {
    background-color: var(--table-header-bg);
    color: var(--text-color);
}

td {
    border-color: var(--table-border);
}

input,
select,
textarea {
    background-color: var(--bg-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
}

button {
    background-color: var(--button-primary);
}

button:hover {
    background-color: var(--button-primary-hover);
}

.view-btn {
    background-color: var(--button-view);
}

.view-btn:hover {
    background-color: var(--button-view-hover);
}

.delete-btn {
    background-color: var(--button-delete);
}

.delete-btn:hover {
    background-color: var(--button-delete-hover);
}

.modal-content {
    background-color: var(--modal-bg);
    color: var(--text-color);
}
</style>