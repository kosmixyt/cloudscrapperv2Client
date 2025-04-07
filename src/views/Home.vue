<template>
    <div class="home-container">
        <!-- Hero Section -->
        <section class="hero-section">
            <div class="hero-content">
                <h1 class="hero-title">WebScraper Pro</h1>
                <p class="hero-description">Extrayez des données de n'importe quel site internet en quelques clics</p>

                <!-- Demo Box -->
                <div class="demo-box">
                    <!-- Browser Demo Animation -->
                    <div class="demo-animation-container">
                        <div class="demo-animation">
                            <div class="browser-mockup">
                                <div class="browser-header">
                                    <div class="browser-controls">
                                        <span class="browser-dot"></span>
                                        <span class="browser-dot"></span>
                                        <span class="browser-dot"></span>
                                    </div>
                                    <div class="browser-address-bar">https://{{ demoUrl || 'example.com' }}</div>
                                </div>
                                <div class="browser-content">
                                    <div v-for="i in 5" :key="i" class="data-element"
                                        :class="{ 'highlight': highlightIndex === i }"></div>
                                </div>
                            </div>
                            <div class="extraction-arrow">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </div>
                            <div class="data-container">
                                <div v-for="i in 5" :key="i" class="data-row"
                                    :class="{ 'highlight': highlightIndex === i }">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Try It Form -->
                    <div class="demo-form">
                        <h2 class="form-title">Essayez maintenant!</h2>
                        <div class="url-input-group">
                            <input type="text" v-model="demoUrl" placeholder="Entrez l'URL du site" class="url-input">
                            <button @click="runDemo" class="demo-button" :disabled="isLoading">
                                <span v-if="isLoading" class="btn-spinner"></span>
                                <span>{{ isLoading ? 'Extraction...' : 'Extraire' }}</span>
                            </button>
                        </div>

                        <div class="popular-sites">
                            <h3 class="sites-title">Sites populaires</h3>
                            <div class="site-chips">
                                <button class="site-chip" @click="selectSite('amazon.com')">Amazon</button>
                                <button class="site-chip" @click="selectSite('twitter.com')">Twitter</button>
                                <button class="site-chip" @click="selectSite('linkedin.com')">LinkedIn</button>
                                <button class="site-chip" @click="selectSite('reddit.com')">Reddit</button>
                                <button class="site-chip" @click="selectSite('instagram.com')">Instagram</button>
                            </div>
                        </div>

                        <div v-if="showResults" class="results-container">
                            <div v-if="isLoading" class="loading-state">
                                <div class="loading-spinner"></div>
                                <p>Extraction des données en cours...</p>
                            </div>
                            <div v-else class="data-results">
                                <h3 class="results-title">Données extraites (démo)</h3>
                                <div class="data-table">
                                    <div v-for="(item, index) in demoResults" :key="index" class="data-item">
                                        <div class="data-label">{{ item.label }}</div>
                                        <div class="data-value">{{ item.value }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section class="features-section">
            <h2 class="section-title">Fonctionnalités puissantes</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🔍</div>
                    <h3 class="feature-title">Reconnaissance de données</h3>
                    <p class="feature-description">Notre IA détecte automatiquement les données importantes sur
                        n'importe quelle page web.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h3 class="feature-title">Export de données</h3>
                    <p class="feature-description">Exportez facilement vos données extraites en CSV, JSON ou Excel en un
                        seul clic.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">⏱️</div>
                    <h3 class="feature-title">Scraping planifié</h3>
                    <p class="feature-description">Automatisez vos extractions avec notre système de planification
                        flexible.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🛡️</div>
                    <h3 class="feature-title">Proxy intelligent</h3>
                    <p class="feature-description">Évitez les blocages grâce à notre système avancé de rotation de
                        proxy.</p>
                </div>
            </div>
        </section>

        <!-- User or CTA Section -->
        <section v-if="isAuthenticated" class="user-section">
            <div class="welcome-panel">
                <h2 class="welcome-title">Bienvenue, {{ userName }}!</h2>
                <p class="welcome-message">Prêt à extraire des données? Accédez à tous vos projets et extractions
                    sauvegardées.</p>
                <router-link to="/dashboard" class="dashboard-link">Accéder au tableau de bord</router-link>
            </div>
        </section>
        <section v-else class="cta-section">
            <div class="cta-panel">
                <h2 class="cta-title">Débloquez tout le potentiel</h2>
                <p class="cta-description">Créez un compte pour sauvegarder vos extractions, programmer des tâches et
                    bien plus!</p>
                <div class="cta-buttons">
                    <router-link to="/login" class="auth-button login">Se connecter</router-link>
                    <router-link to="/register" class="auth-button register">S'inscrire</router-link>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isAuthenticated = ref(false);
const userName = ref('');
const demoUrl = ref('');
const isLoading = ref(false);
const showResults = ref(false);
const demoResults = ref([]);
const highlightIndex = ref(null);
let animationInterval = null;

// Check for authentication
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
});

onUnmounted(() => {
    clearInterval(animationInterval);
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
.home-container {
    width: 100%;
}

/* Hero Section */
.hero-section {
    position: relative;
    padding: var(--spacing-xl) 0 var(--spacing-2xl);
    text-align: center;
    background: linear-gradient(-10deg, var(--bg-color) 0%, var(--bg-color-offset) 100%);
    overflow: hidden;
}

.hero-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: radial-gradient(circle at top right, var(--primary-light), transparent 70%);
    opacity: 0.5;
    z-index: 0;
}

.hero-content {
    position: relative;
    z-index: 2;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
}

.hero-title {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: var(--spacing-md);
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    letter-spacing: -0.025em;
}

.hero-description {
    font-size: 1.25rem;
    color: var(--text-color-secondary);
    max-width: 600px;
    margin: 0 auto var(--spacing-xl);
}

/* Demo Box */
.demo-box {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    margin: var(--spacing-lg) auto;
    max-width: 1000px;
    background-color: var(--card-bg-color);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    padding: var(--spacing-lg);
    overflow: hidden;
}

@media (min-width: 900px) {
    .demo-box {
        flex-direction: row;
        align-items: flex-start;
    }
}

/* Demo Animation */
.demo-animation-container {
    width: 100%;
    padding: var(--spacing-md);
    flex-shrink: 0;
    display: flex;
    justify-content: center;
}

@media (min-width: 900px) {
    .demo-animation-container {
        width: 50%;
    }
}

.demo-animation {
    width: 100%;
    max-width: 450px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
}

@media (min-width: 480px) {
    .demo-animation {
        flex-direction: row;
        align-items: flex-start;
    }
}

.browser-mockup {
    width: 200px;
    min-width: 180px;
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    flex-shrink: 0;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
}

.browser-header {
    background-color: var(--bg-color-offset);
    padding: var(--spacing-sm);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    border-bottom: 1px solid var(--border-color);
}

.browser-controls {
    display: flex;
    gap: 4px;
}

.browser-dot {
    height: 10px;
    width: 10px;
    border-radius: 50%;
    display: inline-block;
}

.browser-dot:nth-child(1) {
    background-color: #ff5f56;
}

.browser-dot:nth-child(2) {
    background-color: #ffbd2e;
}

.browser-dot:nth-child(3) {
    background-color: #27c93f;
}

.browser-address-bar {
    flex-grow: 1;
    background-color: var(--bg-color);
    padding: 4px 8px;
    border-radius: var(--radius);
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border: 1px solid var(--border-color);
}

.browser-content {
    padding: var(--spacing-md);
    height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.data-element {
    height: 12px;
    background-color: var(--bg-color-offset);
    border-radius: var(--radius-sm);
    transition: all 0.3s ease;
}

.data-element.highlight {
    background-color: var(--primary);
    transform: translateX(8px);
}

.extraction-arrow {
    display: none;
    color: var(--primary);
    animation: pulse 2s infinite;
    width: 40px;
    height: 40px;
}

.extraction-arrow svg {
    width: 100%;
    height: 100%;
}

@media (min-width: 480px) {
    .extraction-arrow {
        display: block;
    }
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
    background-color: var(--card-bg-color);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    box-shadow: var(--shadow);
    border: 1px solid var(--border-color);
}

.data-row {
    height: 12px;
    background-color: var (--bg-color-offset);
    margin-bottom: var(--spacing-sm);
    border-radius: var(--radius-sm);
    transition: all 0.3s ease;
}

.data-row.highlight {
    background-color: var(--primary);
    transform: translateX(-8px);
}

/* Demo Form */
.demo-form {
    flex: 1;
    padding: var(--spacing-md);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.form-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: var(--spacing-md);
    display: inline-block;
    border-bottom: 2px solid var(--primary);
    padding-bottom: var(--spacing-xs);
}

.url-input-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

@media (min-width: 640px) {
    .url-input-group {
        flex-direction: row;
    }
}

.url-input {
    flex: 1;
    padding: var(--spacing-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: var(--transition);
}

.url-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-light);
}

.demo-button {
    padding: var(--spacing-md) var(--spacing-lg);
    background-color: var(--button-primary);
    color: white;
    border: none;
    border-radius: var(--radius);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
}

.demo-button:hover:not(:disabled) {
    background-color: var(--button-primary-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.demo-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.btn-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
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

/* Popular Sites */
.popular-sites {
    margin-top: var(--spacing-md);
}

.sites-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    margin-bottom: var(--spacing-sm);
}

.site-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
}

.site-chip {
    background-color: var(--bg-color-offset);
    color: var(--text-color-secondary);
    border: none;
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--radius-full);
    font-size: 0.875rem;
    cursor: pointer;
    transition: var(--transition);
}

.site-chip:hover {
    background-color: var(--primary-light);
    color: var(--primary-dark);
    transform: translateY(-2px);
}

/* Results */
.results-container {
    margin-top: var(--spacing-md);
    background-color: var(--bg-color-offset);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow);
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    color: var(--text-color-secondary);
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-color);
    border-top: 3px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.results-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-xs);
    border-bottom: 1px solid var(--border-color);
}

.data-table {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.data-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    border-bottom: 1px dashed var(--border-color);
}

@media (min-width: 640px) {
    .data-item {
        flex-direction: row;
        align-items: center;
    }
}

.data-label {
    font-weight: 600;
    color: var(--text-color);
    min-width: 140px;
}

.data-value {
    color: var(--text-color-secondary);
    flex: 1;
}

/* Features Section */
.features-section {
    padding: var(--spacing-2xl) var(--spacing-lg);
    background-color: var(--bg-color);
    text-align: center;
}

.section-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: var(--spacing-xl);
    position: relative;
    display: inline-block;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background-color: var(--primary);
    border-radius: var(--radius-full);
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--spacing-lg);
    max-width: 1200px;
    margin: 0 auto;
}

.feature-card {
    background-color: var(--card-bg-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow);
    transition: var(--transition);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    height: 100%;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
}

.feature-icon {
    font-size: 2.5rem;
    margin-bottom: var(--spacing-md);
}

.feature-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: var(--spacing-sm);
}

.feature-description {
    color: var(--text-color-secondary);
    line-height: 1.5;
}

/* User/CTA Sections */
.user-section,
.cta-section {
    padding: var(--spacing-2xl) var(--spacing-lg);
}

.welcome-panel,
.cta-panel {
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: white;
    border-radius: var(--radius-xl);
    padding: var(--spacing-xl);
    text-align: center;
    max-width: 900px;
    margin: 0 auto;
    box-shadow: var(--shadow-lg);
}

.welcome-title,
.cta-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: var(--spacing-md);
    color: white;
}

.welcome-message,
.cta-description {
    font-size: 1.1rem;
    margin-bottom: var(--spacing-lg);
    color: rgba(255, 255, 255, 0.9);
}

.dashboard-link {
    display: inline-block;
    background-color: white;
    color: var(--primary);
    padding: var(--spacing-md) var(--spacing-xl);
    border-radius: var(--radius-full);
    font-weight: 600;
    text-decoration: none;
    transition: var(--transition);
}

.dashboard-link:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    text-decoration: none;
}

.cta-buttons {
    display: flex;
    justify-content: center;
    gap: var(--spacing-md);
    flex-wrap: wrap;
}

.auth-button {
    padding: var(--spacing-md) var(--spacing-xl);
    border-radius: var(--radius-full);
    font-weight: 600;
    text-decoration: none;
    transition: var(--transition);
    display: inline-block;
}

.auth-button.login {
    background-color: white;
    color: var(--primary);
}

.auth-button.register {
    background-color: transparent;
    color: white;
    border: 2px solid white;
}

.auth-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    text-decoration: none;
}
</style>