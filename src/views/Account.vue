<template>
    <div class="account-container">
        <div class="account-card">
            <h1 class="page-title">Mon Compte</h1>

            <div v-if="isLoading" class="loading-container">
                <div class="spinner large-spinner"></div>
                <p>Chargement des informations...</p>
            </div>

            <div v-else-if="error" class="error-container">
                <p class="error-message">{{ error }}</p>
                <button @click="fetchUserData" class="retry-button">Réessayer</button>
            </div>

            <div v-else-if="userData" class="user-data-container">
                <div class="data-section">
                    <h2 class="section-title">Informations Personnelles</h2>
                    <div class="data-grid">
                        <div class="data-item">
                            <span class="data-label">Email:</span>
                            <span class="data-value">{{ userData.email }}</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">Nom complet:</span>
                            <span class="data-value">{{ userData.full_name }}</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">ID:</span>
                            <span class="data-value">{{ userData.id }}</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">Rôle:</span>
                            <span class="data-value">{{ userData.role || 'Utilisateur' }}</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">Date d'inscription:</span>
                            <span class="data-value">{{ formatDate(userData.created_at) }}</span>
                        </div>
                    </div>
                </div>

                <div class="data-section" v-if="userData.quota">
                    <h2 class="section-title">Quotas d'utilisation</h2>
                    <div class="data-grid">
                        <div class="data-item">
                            <span class="data-label">Requêtes disponibles:</span>
                            <span class="data-value">{{ userData.quota.remaining || 0 }}</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">Limite totale:</span>
                            <span class="data-value">{{ userData.quota.total || 0 }}</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">Renouvellement:</span>
                            <span class="data-value">{{ formatDate(userData.quota.reset_at) }}</span>
                        </div>
                    </div>
                </div>

                <div class="data-section">
                    <h2 class="section-title">Actions</h2>
                    <div class="actions-container">
                        <button class="action-button">Modifier mon profil</button>
                        <button class="action-button danger">Supprimer mon compte</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { accessProtectedRoute } from '../api';

const router = useRouter();
const userData = ref(null);
const isLoading = ref(true);
const error = ref(null);

onMounted(() => {
    fetchUserData();
});

async function fetchUserData() {
    isLoading.value = true;
    error.value = null;

    const token = localStorage.getItem('token');

    if (!token) {
        router.push('/login');
        return;
    }

    try {
        // The accessProtectedRoute function will now use the updated baseUrl
        const data = await accessProtectedRoute(token);
        userData.value = data;
    } catch (err) {
        error.value = "Impossible de récupérer vos informations. Veuillez vous reconnecter.";
        console.error("Error fetching user data:", err);
    } finally {
        isLoading.value = false;
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}
</script>

<style scoped>
.account-container {
    display: flex;
    justify-content: center;
    padding: var(--spacing-lg);
}

.account-card {
    width: 100%;
    max-width: 800px;
    background-color: var(--card-bg-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: var(--spacing-xl);
}

.page-title {
    margin-bottom: var(--spacing-xl);
    font-size: 1.8rem;
    color: var(--text-color);
    border-bottom: 2px solid var(--primary);
    padding-bottom: var(--spacing-sm);
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl);
}

.large-spinner {
    width: 40px;
    height: 40px;
    border-width: 4px;
    margin-bottom: var(--spacing-md);
}

.spinner {
    display: inline-block;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: var(--primary);
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.error-container {
    text-align: center;
    padding: var(--spacing-lg);
}

.retry-button {
    background-color: var(--button-primary);
    color: white;
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius);
    margin-top: var(--spacing-md);
    transition: var(--transition);
}

.retry-button:hover {
    background-color: var(--button-primary-hover);
}

.user-data-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
}

.data-section {
    border-bottom: 1px solid var(--border-color);
    padding-bottom: var(--spacing-lg);
}

.data-section:last-child {
    border-bottom: none;
}

.section-title {
    font-size: 1.3rem;
    margin-bottom: var(--spacing-md);
    color: var(--text-color);
}

.data-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-md);
}

.data-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.data-label {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
}

.data-value {
    font-size: 1.1rem;
    font-weight: 500;
}

.actions-container {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
}

.action-button {
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--radius);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    background-color: var(--button-primary);
    color: white;
}

.action-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.action-button.danger {
    background-color: var(--button-danger);
}

.action-button.danger:hover {
    background-color: var(--button-danger-hover);
}
</style>
