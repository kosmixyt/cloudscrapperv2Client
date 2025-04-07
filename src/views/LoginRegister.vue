<template>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-tabs">
                <button :class="{ 'tab-button': true, 'active-tab': activeTab === 'login' }"
                    @click="activeTab = 'login'">
                    Connexion
                </button>
                <button :class="{ 'tab-button': true, 'active-tab': activeTab === 'register' }"
                    @click="activeTab = 'register'">
                    Inscription
                </button>
            </div>

            <div v-if="activeTab === 'login'" class="auth-form">
                <h2 class="form-title">Connectez-vous à votre compte</h2>
                <form @submit.prevent="handleLogin">
                    <div class="form-group">
                        <label for="login-email" class="form-label">Email</label>
                        <input id="login-email" type="email" v-model="loginForm.email" placeholder="votre@email.com"
                            class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="login-password" class="form-label">Mot de passe</label>
                        <div class="password-input-container">
                            <input id="login-password" :type="showLoginPassword ? 'text' : 'password'"
                                v-model="loginForm.password" placeholder="Votre mot de passe" class="form-input"
                                required>
                            <button type="button" class="password-toggle"
                                @click="showLoginPassword = !showLoginPassword">
                                {{ showLoginPassword ? '🙈' : '👁️' }}
                            </button>
                        </div>
                    </div>
                    <div class="extras-container">
                        <div class="remember-me">
                            <input type="checkbox" id="remember" v-model="rememberMe" class="form-checkbox">
                            <label for="remember" class="checkbox-label">Se souvenir de moi</label>
                        </div>
                        <a href="#" class="forgot-password">Mot de passe oublié?</a>
                    </div>
                    <button type="submit" class="submit-button" :disabled="isLoading">
                        <span v-if="isLoading" class="spinner"></span>
                        <span>{{ isLoading ? 'Connexion...' : 'Se connecter' }}</span>
                    </button>
                </form>
                <p v-if="loginError" class="error-message">{{ loginError }}</p>
            </div>

            <div v-if="activeTab === 'register'" class="auth-form">
                <h2 class="form-title">Créez votre compte</h2>
                <form @submit.prevent="handleRegister">
                    <div class="form-group">
                        <label for="register-email" class="form-label">Email</label>
                        <input id="register-email" type="email" v-model="registerForm.email"
                            placeholder="votre@email.com" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="register-fullname" class="form-label">Nom complet</label>
                        <input id="register-fullname" type="text" v-model="registerForm.fullName"
                            placeholder="Votre nom complet" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="register-password" class="form-label">Mot de passe</label>
                        <div class="password-input-container">
                            <input id="register-password" :type="showRegisterPassword ? 'text' : 'password'"
                                v-model="registerForm.password" placeholder="Choisissez un mot de passe fort"
                                class="form-input" required>
                            <button type="button" class="password-toggle"
                                @click="showRegisterPassword = !showRegisterPassword">
                                {{ showRegisterPassword ? '🙈' : '👁️' }}
                            </button>
                        </div>
                    </div>
                    <div class="form-group terms-container">
                        <div class="checkbox-wrapper">
                            <input type="checkbox" id="terms" v-model="acceptTerms" class="form-checkbox" required>
                            <label for="terms" class="checkbox-label">
                                J'accepte les <a href="#" class="terms-link">conditions d'utilisation</a> et la <a
                                    href="#" class="terms-link">politique de confidentialité</a>
                            </label>
                        </div>
                    </div>
                    <button type="submit" class="submit-button" :disabled="isLoading || !acceptTerms">
                        <span v-if="isLoading" class="spinner"></span>
                        <span>{{ isLoading ? 'Inscription...' : 'S\'inscrire' }}</span>
                    </button>
                </form>
                <p v-if="registerError" class="error-message">{{ registerError }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login, createUser } from '../api';

const router = useRouter();
const activeTab = ref('login');
const isLoading = ref(false);

// Login form
const loginForm = ref({ email: '', password: '' });
const loginError = ref('');
const showLoginPassword = ref(false);
const rememberMe = ref(false);

// Register form
const registerForm = ref({ email: '', fullName: '', password: '' });
const registerError = ref('');
const showRegisterPassword = ref(false);
const acceptTerms = ref(false);

async function handleLogin() {
    if (isLoading.value) return;

    loginError.value = '';
    isLoading.value = true;

    try {
        const result = await login(loginForm.value.email, loginForm.value.password);
        if (result.access_token) {
            localStorage.setItem('token', result.access_token);
            if (result.user) {
                localStorage.setItem('user', JSON.stringify(result.user));
            }
            router.push('/');
        } else {
            loginError.value = 'Identifiants invalides';
        }
    } catch (error) {
        loginError.value = 'La connexion a échoué. Veuillez réessayer.';
        console.error('Login error:', error);
    } finally {
        isLoading.value = false;
    }
}

async function handleRegister() {
    if (isLoading.value || !acceptTerms.value) return;

    registerError.value = '';
    isLoading.value = true;

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
            acceptTerms.value = false;
        } else {
            registerError.value = 'L\'inscription a échoué';
        }
    } catch (error) {
        registerError.value = 'L\'inscription a échoué. Veuillez réessayer.';
        console.error('Registration error:', error);
    } finally {
        isLoading.value = false;
    }
}
</script>

<style scoped>
.auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 200px);
    padding: var(--spacing-md);
}

.auth-card {
    width: 100%;
    max-width: 480px;
    background-color: var(--card-bg-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    position: relative;
}

.auth-tabs {
    display: flex;
    width: 100%;
    margin-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
}

.tab-button {
    flex: 1;
    padding: var(--spacing-md);
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-color-secondary);
    transition: var(--transition);
}

.tab-button:hover {
    color: var(--primary);
}

.tab-button.active-tab {
    color: var(--primary);
    font-weight: 600;
    border-bottom: 2px solid var(--primary);
}

.auth-form {
    padding: 0 var(--spacing-lg) var(--spacing-lg);
}

.form-title {
    margin-bottom: var(--spacing-lg);
    color: var(--text-color);
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
}

.form-group {
    margin-bottom: var(--spacing-md);
    text-align: left;
}

.form-label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-weight: 600;
    color: var(--text-color);
    font-size: 0.95rem;
}

.form-input {
    width: 100%;
    padding: var(--spacing-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    font-size: 1rem;
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: var(--transition);
}

.form-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light);
}

.password-input-container {
    position: relative;
}

.password-toggle {
    position: absolute;
    right: var(--spacing-md);
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-color-muted);
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0;
}

.extras-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
    flex-wrap: wrap;
    gap: var(--spacing-sm);
}

.remember-me {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.form-checkbox {
    width: 18px;
    height: 18px;
    accent-color: var(--primary);
}

.checkbox-label {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
}

.forgot-password {
    color: var(--primary);
    font-size: 0.9rem;
    text-decoration: none;
    transition: var(--transition);
}

.forgot-password:hover {
    text-decoration: underline;
}

.terms-container {
    margin-top: var(--spacing-sm);
}

.checkbox-wrapper {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-xs);
}

.terms-link {
    color: var(--primary);
    text-decoration: none;
    transition: var(--transition);
}

.terms-link:hover {
    text-decoration: underline;
}

.submit-button {
    width: 100%;
    padding: var(--spacing-md);
    background-color: var(--button-primary);
    color: white;
    border: none;
    border-radius: var(--radius);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
}

.submit-button:hover:not(:disabled) {
    background-color: var(--button-primary-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.submit-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.spinner {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.error-message {
    color: var(--button-danger);
    margin-top: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: rgba(239, 68, 68, 0.1);
    border-radius: var(--radius);
    text-align: center;
    font-size: 0.9rem;
}
</style>
