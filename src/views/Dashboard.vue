<template>
    <div class="dashboard-container">
        <h1 class="page-title">Tableau de bord</h1>

        <!-- Navigation tabs -->
        <div class="tab-navigation">
            <button :class="{ 'tab-button': true, 'active-tab': activeTab === 'hosts' }" @click="activeTab = 'hosts'">
                Hôtes autorisés
            </button>
            <button :class="{ 'tab-button': true, 'active-tab': activeTab === 'requests' }"
                @click="activeTab = 'requests'">
                Demandes
            </button>
            <button :class="{ 'tab-button': true, 'active-tab': activeTab === 'sessions' }"
                @click="activeTab = 'sessions'">
                Sessions Chrome
            </button>
        </div>

        <!-- Allowed Hosts Tab -->
        <div class="tab-content" v-if="activeTab === 'hosts'">
            <div class="card">
                <h2 class="section-title">Hôtes autorisés</h2>

                <!-- Formulaire pour ajouter un nouveau host -->
                <div class="form-container">
                    <h3 class="form-title">Ajouter un nouvel hôte</h3>
                    <div class="form-group">
                        <input v-model="newHost" placeholder="Entrer l'URL d'origine (ex: https://example.com)"
                            class="input-field" />
                        <button @click="createHost" :disabled="isLoading" class="btn-primary">Ajouter</button>
                    </div>
                </div>

                <!-- Tableau des hosts -->
                <div class="table-container" v-if="hosts.length > 0">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Origine</th>
                                <th>Créé le</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="host in hosts" :key="host.id">
                                <td>{{ host.id }}</td>
                                <td>{{ host.origin }}</td>
                                <td>{{ new Date(host.created_at).toLocaleString() }}</td>
                                <td class="actions-cell">
                                    <button @click="viewHost(host)" class="btn-secondary">Voir</button>
                                    <button @click="deleteHost(host.id)" class="btn-danger">Supprimer</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-else class="empty-state">
                    <div class="empty-icon">📝</div>
                    <p>Aucun hôte autorisé trouvé. Ajoutez votre premier hôte ci-dessus.</p>
                </div>
            </div>
        </div>

        <!-- Requests Tab -->
        <div class="tab-content" v-if="activeTab === 'requests'">
            <div class="card">
                <h2 class="section-title">Demandes</h2>

                <!-- Tableau des requêtes -->
                <div class="table-container" v-if="requests.length > 0">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Origine</th>
                                <th>URL</th>
                                <th>Créé le</th>
                                <th>Mis à jour</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="request in requests" :key="request.id">
                                <td>{{ request.id }}</td>
                                <td>{{ request.url }}</td>
                                <td>{{ request.chrome_session_id }}</td>
                                <td>{{ new Date(request.created_at).toLocaleString() }}</td>
                                <td>{{ request.updated_at ? new Date(request.updated_at).toLocaleString() : '-' }}</td>
                                <td class="actions-cell">
                                    <button @click="viewRequestDetails(request)" class="btn-secondary">Détails</button>
                                    <button @click="viewRequestScreenshot(request.id)"
                                        class="btn-primary">Screenshot</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-else class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <p>Aucune demande trouvée.</p>
                </div>
            </div>
        </div>

        <!-- Chrome Sessions Tab -->
        <div class="tab-content" v-if="activeTab === 'sessions'">
            <div class="card">
                <h2 class="section-title">Sessions Chrome</h2>

                <!-- Tableau des sessions -->
                <div class="table-container" v-if="sessions.length > 0">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>ID de Session</th>
                                <th>Proxy</th>
                                <th>Créé le</th>
                                <th>Mis à jour</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="session in sessions" :key="session.id">
                                <td>{{ session.id }}</td>
                                <td>{{ session.session_id }}</td>
                                <td>{{ session.proxy || 'Aucun' }}</td>
                                <td>{{ new Date(session.created_at).toLocaleString() }}</td>
                                <td>{{ session.updated_at ? new Date(session.updated_at).toLocaleString() : '-' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-else class="empty-state">
                    <div class="empty-icon">💻</div>
                    <p>Aucune session Chrome trouvée.</p>
                </div>
            </div>
        </div>

        <!-- Modal pour les détails du host -->
        <div v-if="selectedHost" class="modal-overlay" @click.self="selectedHost = null">
            <div class="modal-container">
                <div class="modal-header">
                    <h3 class="modal-title">Détails de l'hôte</h3>
                    <button class="modal-close" @click="selectedHost = null">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="info-group">
                        <span class="info-label">ID:</span>
                        <span class="info-value">{{ selectedHost.id }}</span>
                    </div>
                    <div class="info-group">
                        <span class="info-label">Origine:</span>
                        <span class="info-value">{{ selectedHost.origin }}</span>
                    </div>
                    <div class="info-group">
                        <span class="info-label">Créé le:</span>
                        <span class="info-value">{{ new Date(selectedHost.created_at).toLocaleString() }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal pour les détails de la requête -->
        <div v-if="selectedRequest" class="modal-overlay" @click.self="selectedRequest = null">
            <div class="modal-container">
                <div class="modal-header">
                    <h3 class="modal-title">Détails de la demande</h3>
                    <button class="modal-close" @click="selectedRequest = null">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="info-group">
                        <span class="info-label">ID:</span>
                        <span class="info-value">{{ selectedRequest.id }}</span>
                    </div>
                    <div class="info-group">
                        <span class="info-label">Origine ID:</span>
                        <span class="info-value">{{ selectedRequest.request_origin_id }}</span>
                    </div>
                    <div class="info-group">
                        <span class="info-label">Session Chrome ID:</span>
                        <span class="info-value">{{ selectedRequest.chrome_session_id }}</span>
                    </div>
                    <div class="info-group">
                        <span class="info-label">Créé le:</span>
                        <span class="info-value">{{ new Date(selectedRequest.created_at).toLocaleString() }}</span>
                    </div>
                    <div class="info-group" v-if="selectedRequest.updated_at">
                        <span class="info-label">Mis à jour:</span>
                        <span class="info-value">{{ new Date(selectedRequest.updated_at).toLocaleString() }}</span>
                    </div>

                    <div class="response-section">
                        <h4>Réponse (décodée):</h4>
                        <pre
                            class="response-content">{{ decodeBase64(selectedRequest.string_response) || 'Pas de réponse' }}</pre>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal pour le screenshot de la requête -->
        <div v-if="isScreenshotModalVisible" class="modal-overlay" @click.self="isScreenshotModalVisible = false">
            <div class="modal-container screenshot-modal">
                <div class="modal-header">
                    <h3 class="modal-title">Screenshot de la requête</h3>
                    <button class="modal-close" @click="isScreenshotModalVisible = false">&times;</button>
                </div>
                <div class="modal-body screenshot-body">
                    <img v-if="!isScreenshotLoading && screenshotUrl" :src="screenshotUrl" alt="Screenshot"
                        class="screenshot-image" />
                    <div v-else-if="isScreenshotLoading" class="loading-spinner"></div>
                    <div v-else class="empty-state">
                        <div class="empty-icon">🖼️</div>
                        <p>Aucun screenshot disponible</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllowedHosts, createAllowedHost, deleteAllowedHost, getUserRequests, getChromeSessionsForCurrentUser, baseUrl } from '../api';

export default defineComponent({
    name: 'Dashboard',
    setup() {
        const router = useRouter();
        const activeTab = ref('hosts');

        // Allowed Hosts
        const hosts = ref([]);
        const newHost = ref('');
        const selectedHost = ref(null);

        // Requests
        const requests = ref([]);
        const selectedRequest = ref(null);

        // Chrome Sessions
        const sessions = ref([]);

        const isLoading = ref(false);

        // Pour le décodage des réponses base64
        const isBase64Decoded = ref(false);

        const decodeBase64 = (content: string) => {
            if (!content) return '';
            try {
                // Tenter de décoder le contenu base64
                const decoded = atob(content);
                return decoded;
            } catch (e) {
                console.error('Erreur de décodage base64:', e);
                return content; // Si pas en base64, retourner le contenu original
            }
        };

        // Screenshot handling
        const isScreenshotModalVisible = ref(false);
        const isScreenshotLoading = ref(false);
        const screenshotUrl = ref('');

        // Charger les données au montage du composant
        onMounted(async () => {
            const accessToken = localStorage.getItem('token');
            if (!accessToken) {
                router.push('/login');
                return;
            }

            await loadHosts();
            await loadRequests();
            await loadSessions();
        });

        // Fonctions pour les Allowed Hosts
        const loadHosts = async () => {
            isLoading.value = true;
            try {
                const accessToken = localStorage.getItem('token');
                if (!accessToken) return;

                const response = await getAllowedHosts(accessToken);
                hosts.value = response;
            } catch (error) {
                console.error('Échec du chargement des hôtes:', error);
            } finally {
                isLoading.value = false;
            }
        };

        const createHost = async () => {
            if (!newHost.value.trim()) return;

            isLoading.value = true;
            try {
                const accessToken = localStorage.getItem('token');
                if (!accessToken) return;

                await createAllowedHost(accessToken, newHost.value.trim());
                newHost.value = '';
                await loadHosts();
            } catch (error) {
                console.error('Échec de la création:', error);
            } finally {
                isLoading.value = false;
            }
        };

        const deleteHost = async (id) => {
            if (!confirm('Êtes-vous sûr de vouloir supprimer cet hôte?')) return;

            isLoading.value = true;
            try {
                const accessToken = localStorage.getItem('token');
                if (!accessToken) return;

                await deleteAllowedHost(accessToken, id);
                await loadHosts();
            } catch (error) {
                console.error('Échec de la suppression:', error);
            } finally {
                isLoading.value = false;
            }
        };

        const viewHost = (host) => {
            selectedHost.value = host;
        };

        // Fonctions pour les Requests
        const loadRequests = async () => {
            isLoading.value = true;
            try {
                const accessToken = localStorage.getItem('token');
                if (!accessToken) return;

                const response = await getUserRequests(accessToken);
                requests.value = response;
            } catch (error) {
                console.error('Échec du chargement des demandes:', error);
            } finally {
                isLoading.value = false;
            }
        };

        const viewRequestDetails = (request) => {
            selectedRequest.value = request;
        };

        // Fonction pour voir le screenshot d'une requête
        const viewRequestScreenshot = async (id) => {
            isScreenshotModalVisible.value = true;
            isScreenshotLoading.value = true;
            screenshotUrl.value = '';

            try {
                const accessToken = localStorage.getItem('token');
                if (!accessToken) return;

                // Utilise l'URL de base déjà configurée dans l'application
                const response = await fetch(`${baseUrl}/screenshots/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Échec du chargement du screenshot');
                }

                // Récupérer le screenshot en tant que blob et créer une URL
                const blob = await response.blob();
                screenshotUrl.value = URL.createObjectURL(blob);
            } catch (error) {
                console.error('Erreur lors du chargement du screenshot:', error);
            } finally {
                isScreenshotLoading.value = false;
            }
        };

        // Fonctions pour les Chrome Sessions
        const loadSessions = async () => {
            isLoading.value = true;
            try {
                const accessToken = localStorage.getItem('token');
                if (!accessToken) return;

                const response = await getChromeSessionsForCurrentUser(accessToken);
                sessions.value = response;
            } catch (error) {
                console.error('Échec du chargement des sessions Chrome:', error);
            } finally {
                isLoading.value = false;
            }
        };

        return {
            activeTab,
            // Allowed Hosts
            hosts,
            newHost,
            selectedHost,
            createHost,
            deleteHost,
            viewHost,
            // Requests
            requests,
            selectedRequest,
            viewRequestDetails,
            viewRequestScreenshot,
            // Chrome Sessions
            sessions,
            isLoading,
            isBase64Decoded,
            decodeBase64,
            // Screenshot
            isScreenshotModalVisible,
            isScreenshotLoading,
            screenshotUrl
        };
    }
});
</script>

<style scoped>
.dashboard-container {
    width: 100%;
}

.page-title {
    margin-bottom: var(--spacing-lg);
    color: var(--text-color);
    font-size: 1.75rem;
    font-weight: 700;
}

/* Tab Navigation */
.tab-navigation {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
}

.tab-button {
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: transparent;
    color: var(--text-color-secondary);
    border: none;
    border-bottom: 2px solid transparent;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
}

.tab-button:hover {
    color: var(--primary);
}

.tab-button.active-tab {
    color: var(--primary);
    border-bottom: 2px solid var(--primary);
}

/* Tab Content */
.tab-content {
    margin-top: var(--spacing-md);
}

.section-title {
    margin-bottom: var(--spacing-lg);
    color: var(--text-color);
    font-size: 1.25rem;
    font-weight: 600;
}

/* Form Container */
.form-container {
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-lg);
    background-color: var(--bg-color-offset);
    border-radius: var(--radius-lg);
}

.form-title {
    margin-bottom: var(--spacing-md);
    color: var(--text-color);
    font-size: 1.1rem;
    font-weight: 600;
}

.form-group {
    display: flex;
    gap: var(--spacing-md);
}

@media (max-width: 640px) {
    .form-group {
        flex-direction: column;
    }
}

.input-field {
    flex: 1;
    padding: var(--spacing-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: var(--transition);
}

.input-field:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-light);
}

/* Table styling */
.table-container {
    overflow-x: auto;
    margin-bottom: var(--spacing-lg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
}

table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}

th {
    text-align: left;
    padding: var(--spacing-md);
    background-color: var(--bg-color-offset);
    color: var(--text-color);
    font-weight: 600;
    border-bottom: 1px solid var(--border-color);
}

th:first-child {
    border-top-left-radius: var(--radius);
}

th:last-child {
    border-top-right-radius: var(--radius);
}

td {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border-color);
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

.actions-cell {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
}

.actions-cell button {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 0.875rem;
}

/* Empty state */
.empty-state {
    text-align: center;
    padding: var(--spacing-xl) var(--spacing-md);
    background-color: var(--bg-color-offset);
    border-radius: var(--radius-lg);
    color: var(--text-color-muted);
}

.empty-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--modal-overlay-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
}

.modal-container {
    background-color: var(--card-bg-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    animation: modal-appear 0.3s ease-out forwards;
}

.screenshot-modal {
    max-width: 800px;
}

@keyframes modal-appear {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
}

.modal-title {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-color);
}

.modal-close {
    background: transparent;
    border: none;
    color: var(--text-color-muted);
    font-size: 1.5rem;
    cursor: pointer;
    transition: var(--transition);
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-full);
}

.modal-close:hover {
    color: var(--text-color);
    background-color: var(--bg-color-offset);
}

.modal-body {
    padding: var(--spacing-lg);
}

.screenshot-body {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md);
    min-height: 300px;
}

.info-group {
    margin-bottom: var(--spacing-md);
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
}

.info-label {
    font-weight: 600;
    color: var(--text-color-secondary);
    min-width: 120px;
}

.info-value {
    flex: 1;
    color: var(--text-color);
}

.response-section {
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--border-color);
}

.response-section h4 {
    margin-bottom: var(--spacing-md);
    color: var(--text-color);
    font-weight: 600;
}

.response-content {
    background-color: var(--code-bg-color);
    color: var(--code-text-color);
    padding: var(--spacing-md);
    border-radius: var(--radius);
    overflow-x: auto;
    font-family: monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    white-space: pre-wrap;
    max-height: 300px;
}

.screenshot-image {
    max-width: 100%;
    max-height: 70vh;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
}

/* Loading spinner */
.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: var(--spacing-lg) auto;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
