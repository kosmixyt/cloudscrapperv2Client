<template>
    <div class="home-container" :class="{ 'dark-mode': isDarkMode }">
        <!-- Hero Section -->
        <div class="hero-section">
            <h1 class="app-title">WebScraper Pro</h1>
            <p class="app-description">Extrayez des données de n'importe quel site internet en quelques clics</p>

            <div class="theme-switch">
                <button @click="toggleDarkMode" class="theme-button">
                    <span v-if="isDarkMode">☀️</span>
                    <span v-else>🌙</span>
                </button>
            </div>

            <!-- Demo Section -->
            <div class="demo-box">
                <!-- Browser Demo Animation -->
                <div class="demo-animation-container">
                    <div class="demo-animation">
                        <div class="website-mockup">
                            <div class="browser-header">
                                <span class="browser-dot"></span>
                                <span class="browser-dot"></span>
                                <span class="browser-dot"></span>
                                <div class="browser-address-bar">https://{{ demoUrl || 'example.com' }}</div>
                            </div>
                            <div class="browser-content">
                                <div v-for="i in 5" :key="i" class="data-element"
                                    :class="{ 'highlight': highlightIndex === i }"></div>
                            </div>
                        </div>
                        <div class="extraction-animation">
                            <div class="extraction-arrow">→</div>
                        </div>
                        <div class="data-container">
                            <div v-for="i in 5" :key="i" class="data-row"
                                :class="{ 'highlight': highlightIndex === i }">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="demo-form">
                    <h3>Essayez maintenant!</h3>
                    <div class="input-group">
                        <input type="text" v-model="demoUrl" placeholder="Entrez l'URL du site" class="url-input">
                        <button @click="runDemo" class="demo-button" :disabled="isLoading">
                            {{ isLoading ? 'Extraction...' : 'Extraire' }}
                        </button>
                    </div>

                    <div v-if="showResults" class="results-container">
                        <div v-if="isLoading" class="loading-spinner"></div>
                        <div v-else class="data-results">
                            <h4>Données extraites (démo)</h4>
                            <div class="data-table">
                                <div v-for="(item, index) in demoResults" :key="index" class="data-item">
                                    <strong>{{ item.label }}:</strong> {{ item.value }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="example-sites">
                <h3>Sites populaires</h3>
                <div class="site-chips">
                    <div class="site-chip" @click="selectSite('amazon.com')">Amazon</div>
                    <div class="site-chip" @click="selectSite('twitter.com')">Twitter</div>
                    <div class="site-chip" @click="selectSite('linkedin.com')">LinkedIn</div>
                    <div class="site-chip" @click="selectSite('reddit.com')">Reddit</div>
                    <div class="site-chip" @click="selectSite('instagram.com')">Instagram</div>
                </div>
            </div>
        </div>

        <!-- Features Section -->
        <div class="features-section">
            <h2>Fonctionnalités puissantes</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🔍</div>
                    <h3>Reconnaissance de données</h3>
                    <p>Notre IA détecte automatiquement les données importantes</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h3>Export de données</h3>
                    <p>Exportez en CSV, JSON ou Excel en un clic</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">⏱️</div>
                    <h3>Scraping planifié</h3>
                    <p>Automatisez vos extractions à intervalles réguliers</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🛡️</div>
                    <h3>Proxy intelligent</h3>
                    <p>Évitez les blocages avec notre système de rotation de proxy</p>
                </div>
            </div>
        </div>

        <!-- User Section -->
        <div v-if="isAuthenticated" class="user-section">
            <div class="welcome-panel">
                <h2>Bienvenue, {{ userName }}!</h2>
                <p>Prêt à extraire des données? Accédez à tous vos projets et extractions sauvegardées.</p>
                <router-link to="/dashboard" class="action-button">Accéder au tableau de bord</router-link>
            </div>
        </div>
        <div v-else class="cta-section">
            <div class="cta-panel">
                <h2>Débloquez tout le potentiel</h2>
                <p>Créez un compte pour sauvegarder vos extractions, programmer des tâches et bien plus!</p>
                <div class="cta-buttons">
                    <router-link to="/login" class="auth-button login">Se connecter</router-link>
                    <router-link to="/register" class="auth-button register">S'inscrire</router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const isAuthenticated = ref(false);
const userName = ref('');
const demoUrl = ref('');
const isLoading = ref(false);
const showResults = ref(false);
const demoResults = ref([]);
const highlightIndex = ref(null);
let animationInterval = null;

// Dark mode implementation
const isDarkMode = ref(false);

// Check system preference for dark mode
const checkSystemDarkMode = () => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Toggle dark mode
const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem('darkMode', isDarkMode.value ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light');
};

// Watch for system changes
let darkModeMediaQuery;

onMounted(() => {
    const token = localStorage.getItem('token');
    if (token) {
        isAuthenticated.value = true;
        try {
            const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
            userName.value = userInfo.full_name || userInfo.email || 'User';
        } catch (e) {
            userName.value = 'User';
        }
    }

    // Start animation
    startAnimation();

    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
        isDarkMode.value = savedTheme === 'dark';
    } else {
        isDarkMode.value = checkSystemDarkMode();
    }

    // Set the initial theme
    document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light');

    // Listen for system theme changes
    darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem('darkMode')) {
            isDarkMode.value = e.matches;
            document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light');
        }
    });
});

onUnmounted(() => {
    clearInterval(animationInterval);

    // Clean up event listener
    if (darkModeMediaQuery) {
        darkModeMediaQuery.removeEventListener('change', () => { });
    }
});

function startAnimation() {
    let index = 0;
    animationInterval = setInterval(() => {
        highlightIndex.value = index + 1;
        setTimeout(() => {
            highlightIndex.value = null;
        }, 600);

        index = (index + 1) % 5;
    }, 1500);
}

function selectSite(site) {
    demoUrl.value = site;
}

function runDemo() {
    if (!demoUrl.value) return;

    isLoading.value = true;
    showResults.value = true;

    // Simulate API call delay
    setTimeout(() => {
        isLoading.value = false;
        generateDemoResults();
    }, 1800);
}

function generateDemoResults() {
    const url = demoUrl.value.toLowerCase();

    if (url.includes('amazon')) {
        demoResults.value = [
            { label: 'Titre du produit', value: 'Écouteurs Bluetooth sans fil' },
            { label: 'Prix', value: '49,99€' },
            { label: 'Évaluation', value: '4.5/5 (2 450 avis)' },
            { label: 'Disponibilité', value: 'En stock' },
            { label: 'Livraison', value: 'Gratuite avec Prime' }
        ];
    } else if (url.includes('twitter')) {
        demoResults.value = [
            { label: 'Nom d\'utilisateur', value: '@techguru' },
            { label: 'Tweet', value: 'Notre nouvelle fonctionnalité IA est lancée!' },
            { label: 'J\'aime', value: '1 245' },
            { label: 'Retweets', value: '328' },
            { label: 'Posté', value: 'Il y a 3h' }
        ];
    } else if (url.includes('linkedin')) {
        demoResults.value = [
            { label: 'Profil', value: 'Sophie Martin' },
            { label: 'Titre', value: 'Ingénieur logiciel senior' },
            { label: 'Entreprise', value: 'Tech Innovations Inc.' },
            { label: 'Lieu', value: 'Paris, France' },
            { label: 'Connexions', value: '500+' }
        ];
    } else if (url.includes('reddit')) {
        demoResults.value = [
            { label: 'Titre du post', value: 'Ce web scraper est incroyable!' },
            { label: 'Subreddit', value: 'r/programming' },
            { label: 'Votes positifs', value: '3,2k' },
            { label: 'Commentaires', value: '147' },
            { label: 'Posté par', value: 'u/devmaster' }
        ];
    } else if (url.includes('instagram')) {
        demoResults.value = [
            { label: 'Nom d\'utilisateur', value: '@travelphotographer' },
            { label: 'Description', value: 'Sunset views in Bali #travel #photography' },
            { label: 'J\'aime', value: '2 873' },
            { label: 'Commentaires', value: '124' },
            { label: 'Posté', value: '12 Juin 2023' }
        ];
    } else {
        demoResults.value = [
            { label: 'Titre', value: 'Bienvenue sur ' + demoUrl.value },
            { label: 'Description', value: 'Site web avec contenu démonstratif' },
            { label: 'Liens trouvés', value: '24' },
            { label: 'Images', value: '12' },
            { label: 'Dernière mise à jour', value: 'Aujourd\'hui à 14:32' }
        ];
    }
}
</script>

<style scoped>
:root {
    --background-color: #ffffff;
    --text-color: #333333;
    --secondary-text-color: #666666;
    --card-background: #ffffff;
    --card-shadow: rgba(0, 0, 0, 0.08);
    --primary-color: #42b983;
    --primary-color-hover: #3aa876;
    --primary-color-disabled: #a8d5c2;
    --secondary-background: #f8f9fa;
    --border-color: #e0e0e0;
    --highlight-color: #f0f0f0;
    --gradient-start: #3a7bd5;
    --gradient-end: #42b983;
    --browser-header: #f1f1f1;
    --element-bg: #eeeeee;
}

[data-theme="dark"] {
    --background-color: #1a1a1a;
    --text-color: #f0f0f0;
    --secondary-text-color: #cccccc;
    --card-background: #2a2a2a;
    --card-shadow: rgba(0, 0, 0, 0.2);
    --primary-color: #42b983;
    --primary-color-hover: #4ece95;
    --primary-color-disabled: #2d7a58;
    --secondary-background: #2c2c2c;
    --border-color: #444444;
    --highlight-color: #3c3c3c;
    --gradient-start: #2a5a9c;
    --gradient-end: #328462;
    --browser-header: #383838;
    --element-bg: #444444;
}

.home-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
    font-family: 'Inter', 'Segoe UI', sans-serif;
    color: var(--text-color);
    background-color: var(--background-color);
    transition: all 0.3s ease;
}

/* Theme switch button */
.theme-switch {
    position: absolute;
    top: 20px;
    right: 20px;
}

.theme-button {
    background: var(--secondary-background);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 20px;
    box-shadow: 0 2px 8px var(--card-shadow);
    transition: all 0.3s;
}

.theme-button:hover {
    transform: scale(1.1);
}

/* Hero Section */
.hero-section {
    text-align: center;
    padding: 1rem 0 3rem;
    position: relative;
}

.app-title {
    font-size: 3.5rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(45deg, var(--gradient-start), var(--gradient-end));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.app-description {
    font-size: 1.2rem;
    color: var(--secondary-text-color);
    margin-bottom: 3rem;
}

/* Demo Box */
.demo-box {
    background: var(--secondary-background);
    border-radius: 16px;
    box-shadow: 0 10px 30px var(--card-shadow);
    padding: 2rem;
    margin-bottom: 3rem;
    display: flex;
    flex-direction: column;
}

@media (min-width: 768px) {
    .demo-box {
        flex-direction: row;
        align-items: flex-start;
    }
}

/* Improved Animation Container */
.demo-animation-container {
    width: 100%;
    max-width: 480px;
    margin: 0 auto 2rem;
    padding: 1rem;
    background: var(--card-background);
    border-radius: 12px;
    box-shadow: 0 4px 16px var(--card-shadow);
}

@media (min-width: 768px) {
    .demo-animation-container {
        width: 45%;
        margin: 0;
    }
}

/* Animation */
.demo-animation {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1rem 0;
    flex-wrap: wrap;
}

@media (min-width: 480px) {
    .demo-animation {
        flex-wrap: nowrap;
    }
}

.website-mockup {
    width: 220px;
    min-width: 180px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 6px 16px var(--card-shadow);
    background: var(--card-background);
    border: 1px solid var(--border-color);
}

.browser-header {
    background: var(--browser-header);
    padding: 10px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
}

.browser-dot {
    height: 12px;
    width: 12px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 6px;
}

.browser-dot:nth-child(1) {
    background: #ff5f56;
}

.browser-dot:nth-child(2) {
    background: #ffbd2e;
}

.browser-dot:nth-child(3) {
    background: #27c93f;
}

.browser-address-bar {
    flex-grow: 1;
    background: var(--background-color);
    margin-left: 10px;
    padding: 6px 10px;
    border-radius: 12px;
    font-size: 12px;
    color: var(--text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    border: 1px solid var(--border-color);
}

.browser-content {
    padding: 16px;
    height: 160px;
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
}

[data-theme="dark"] .browser-content {
    background: #333;
}

.data-element {
    height: 14px;
    background: var(--element-bg);
    margin-bottom: 16px;
    border-radius: 4px;
    transition: background 0.3s ease, transform 0.2s ease;
}

.data-element.highlight {
    background: var(--primary-color);
    transform: translateX(6px);
}

.extraction-animation {
    padding: 0 15px;
    margin: 10px 0;
}

@media (min-width: 480px) {
    .extraction-animation {
        margin: 0;
    }
}

.extraction-arrow {
    font-size: 28px;
    color: var(--primary-color);
    font-weight: bold;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        opacity: 0.6;
        transform: scale(0.9) translateX(0);
    }

    50% {
        opacity: 1;
        transform: scale(1.1) translateX(5px);
    }

    100% {
        opacity: 0.6;
        transform: scale(0.9) translateX(0);
    }
}

.data-container {
    width: 140px;
    min-width: 120px;
    background: var(--card-background);
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 6px 16px var(--card-shadow);
    border: 1px solid var(--border-color);
}

.data-row {
    height: 14px;
    background: var(--element-bg);
    margin-bottom: 16px;
    border-radius: 4px;
    transition: background 0.3s ease, transform 0.2s ease;
}

.data-row.highlight {
    background: var(--primary-color);
    transform: translateX(-6px);
}

/* Demo Form */
.demo-form {
    flex: 1;
    text-align: left;
    margin-left: 0;
    padding-top: 1rem;
    background: var(--card-background);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 16px var(--card-shadow);
}

@media (min-width: 768px) {
    .demo-form {
        margin-left: 2rem;
        padding-top: 1.5rem;
        width: 55%;
    }
}

/* Results */
.results-container {
    background: var(--card-background);
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px var(--card-shadow);
    min-height: 200px;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    margin: 60px auto;
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

.data-results h4 {
    margin-top: 0;
    color: var(--text-color);
    border-bottom: 2px solid var(--highlight-color);
    padding-bottom: 0.8rem;
}

.data-table {
    margin-top: 1rem;
}

.data-item {
    padding: 10px 0;
    border-bottom: 1px solid var(--highlight-color);
}

.data-item:last-child {
    border: none;
}

/* Example Sites */
.example-sites {
    margin-top: 3rem;
}

.site-chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    margin-top: 1rem;
}

.site-chip {
    background: var(--element-bg);
    color: var(--text-color);
    padding: 8px 20px;
    border-radius: 30px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
}

.site-chip:hover {
    background: var(--primary-color);
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(66, 185, 131, 0.2);
}

/* Features Section */
.features-section {
    margin: 4rem 0;
    text-align: center;
    padding: 2rem 0;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 24px;
    margin-top: 2.5rem;
}

.feature-card {
    background: var(--card-background);
    border-radius: 12px;
    box-shadow: 0 8px 24px var(--card-shadow);
    padding: 2rem;
    transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
}

.feature-icon {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
}

/* User & CTA Sections */
.user-section,
.cta-section {
    margin: 4rem 0;
}

.welcome-panel,
.cta-panel {
    background: linear-gradient(135deg, #42b983, #3a7bd5);
    color: white;
    border-radius: 16px;
    padding: 3rem 2rem;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
    box-shadow: 0 10px 30px rgba(58, 123, 213, 0.2);
}

.action-button {
    display: inline-block;
    background: white;
    color: #42b983;
    padding: 12px 24px;
    border-radius: 30px;
    font-weight: bold;
    text-decoration: none;
    margin-top: 1.5rem;
    transition: transform 0.3s, box-shadow 0.3s;
}

.action-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(255, 255, 255, 0.2);
}

.cta-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 1.5rem;
}

.auth-button {
    padding: 12px 28px;
    border-radius: 30px;
    font-weight: bold;
    text-decoration: none;
    transition: transform 0.3s, box-shadow 0.3s;
}

.auth-button.login {
    background: white;
    color: #42b983;
}

.auth-button.register {
    background: transparent;
    color: white;
    border: 2px solid white;
}

.auth-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

/* Dark mode specific styles */
.dark-mode .auth-button.login {
    color: var(--primary-color);
}

/* Keep other styles as they are */
</style>