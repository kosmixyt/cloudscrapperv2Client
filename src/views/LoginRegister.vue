<template>
    <div class="auth-container">
        <div class="auth-tabs">
            <button :class="{ active: activeTab === 'login' }" @click="activeTab = 'login'">Login</button>
            <button :class="{ active: activeTab === 'register' }" @click="activeTab = 'register'">Register</button>
        </div>

        <div v-if="activeTab === 'login'" class="auth-form">
            <h2>Login</h2>
            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <label for="login-email">Email</label>
                    <input id="login-email" type="email" v-model="loginForm.email" required>
                </div>
                <div class="form-group">
                    <label for="login-password">Password</label>
                    <input id="login-password" type="password" v-model="loginForm.password" required>
                </div>
                <button type="submit" class="btn-primary">Login</button>
            </form>
            <p v-if="loginError" class="error-message">{{ loginError }}</p>
        </div>

        <div v-if="activeTab === 'register'" class="auth-form">
            <h2>Register</h2>
            <form @submit.prevent="handleRegister">
                <div class="form-group">
                    <label for="register-email">Email</label>
                    <input id="register-email" type="email" v-model="registerForm.email" required>
                </div>
                <div class="form-group">
                    <label for="register-fullname">Full Name</label>
                    <input id="register-fullname" type="text" v-model="registerForm.fullName" required>
                </div>
                <div class="form-group">
                    <label for="register-password">Password</label>
                    <input id="register-password" type="password" v-model="registerForm.password" required>
                </div>
                <button type="submit" class="btn-primary">Register</button>
            </form>
            <p v-if="registerError" class="error-message">{{ registerError }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login, createUser } from '../api';

const router = useRouter();
const activeTab = ref('login');

// Login form
const loginForm = ref({ email: '', password: '' });
const loginError = ref('');

// Register form
const registerForm = ref({ email: '', fullName: '', password: '' });
const registerError = ref('');

async function handleLogin() {
    try {
        const result = await login(loginForm.value.email, loginForm.value.password);
        if (result.access_token) {
            localStorage.setItem('token', result.access_token);
            if (result.user) {
                localStorage.setItem('user', JSON.stringify(result.user));
            }
            router.push('/');
            window.location.reload(); // Force reload to update auth state
        } else {
            loginError.value = 'Invalid credentials';
        }
    } catch (error) {
        loginError.value = 'Login failed. Please try again.';
        console.error('Login error:', error);
    }
}

async function handleRegister() {
    try {
        const result = await createUser(
            registerForm.value.email,
            registerForm.value.fullName,
            registerForm.value.password
        );
        if (result.id) {
            // Registration successful, switch to login tab
            activeTab.value = 'login';
            loginForm.value.email = registerForm.value.email;
            registerForm.value = { email: '', fullName: '', password: '' };
        } else {
            registerError.value = 'Registration failed';
        }
    } catch (error) {
        registerError.value = 'Registration failed. Please try again.';
        console.error('Registration error:', error);
    }
}
</script>

<style scoped>
.auth-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--card-bg-color);
}

.auth-tabs {
    display: flex;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
}

.auth-tabs button {
    flex: 1;
    padding: 0.75rem;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1rem;
    color: var(--text-color);
}

.auth-tabs button.active {
    font-weight: bold;
    border-bottom: 2px solid var(--header-bg-color);
    color: var(--header-bg-color);
}

.auth-form h2 {
    margin-bottom: 1.5rem;
    color: var(--header-bg-color);
}

.form-group {
    margin-bottom: 1rem;
    text-align: left;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: var(--text-color);
}

.form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 1rem;
    background-color: var(--bg-color);
    color: var(--text-color);
}

.btn-primary {
    width: 100%;
    padding: 0.75rem;
    background-color: var(--button-primary);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
}

.btn-primary:hover {
    background-color: var(--button-primary-hover);
}

.error-message {
    color: var(--button-delete);
    margin-top: 1rem;
}
</style>
