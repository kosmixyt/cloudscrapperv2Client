<template>
    <div class="dashboard-container">
        <h1 class="page-title">Tableau de bord</h1>

        <!-- Navigation tabs -->
        <div class="tab-navigation">
            <button 
                :class="{ 'tab-button': true, 'active-tab': activeTab === 'hosts', 'inactive-tab': activeTab !== 'hosts' }"
                @click="activeTab = 'hosts'">
                Hôtes autorisés
            </button>
            <button 
                :class="{ 'tab-button': true, 'active-tab': activeTab === 'requests', 'inactive-tab': activeTab !== 'requests' }"
                @click="activeTab = 'requests'">
                Demandes
            </button>
            <button 
                :class="{ 'tab-button': true, 'active-tab': activeTab === 'sessions', 'inactive-tab': activeTab !== 'sessions' }"
                @click="activeTab = 'sessions'">
                Sessions Chrome
            </button>
        </div>

        <!-- Allowed Hosts Tab -->
        <div class="tab-content" v-if="activeTab === 'hosts'">
            <div class="tab-section">
                <h2 class="section-title">Hôtes autorisés</h2>

                <!-- Formulaire pour ajouter un nouveau host -->
                <div class="form-container">
                    <h3 class="form-title">Ajouter un nouvel hôte</h3>
                    <div class="form-group">
                        <input v-model="newHost" placeholder="Entrer l'URL d'origine (ex: https://example.com)" 
                               class="input-field" />
                        <button @click="createHost" :disabled="isLoading" 
                                class="add-button">Ajouter</button>
                    </div>
                </div>

                <!-- Tableau des hosts -->
                <div class="table-container" v-if="hosts.length > 0">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th class="table-header">ID</th>
                                <th class="table-header">Origine</th>
                                <th class="table-header">Créé le</th>
                                <th class="table-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="host in hosts" :key="host.id" class="table-row">
                                <td class="table-cell">{{ host.id }}</td>
                                <td class="table-cell">{{ host.origin }}</td>
                                <td class="table-cell">{{ new Date(host.created_at).toLocaleString() }}</td>
                                <td class="table-cell">
                                    <button @click="viewHost(host)" class="view-button">Voir</button>
                                    <button @click="deleteHost(host.id)" class="delete-button">Supprimer</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-else class="empty-message">
                    <p>Aucun hôte autorisé trouvé. Ajoutez votre premier hôte ci-dessus.</p>
                </div>
            </div>
        </div>

        <!-- Requests Tab -->
        <div class="tab-content" v-if="activeTab === 'requests'">
            <div class="tab-section">
                <h2 class="section-title">Demandes</h2>

                <!-- Tableau des requêtes -->
                <div class="table-container" v-if="requests.length > 0">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th class="table-header">ID</th>
                                <th class="table-header">Origine</th>
                                <th class="table-header">URL</th>
                                <th class="table-header">Créé le</th>
                                <th class="table-header">Mis à jour</th>
                                <th class="table-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="request in requests" :key="request.id" class="table-row">
                                <td class="table-cell">{{ request.id }}</td>
                                <td class="table-cell">{{ request.url }}</td>
                                <td class="table-cell">{{ request.chrome_session_id }}</td>
                                <td class="table-cell">{{ new Date(request.created_at).toLocaleString() }}</td>
                                <td class="table-cell">{{ request.updated_at ? new Date(request.updated_at).toLocaleString() : '-' }}</td>
                                <td class="table-cell">
                                    <button @click="viewRequestDetails(request)" class="view-button">Détails</button>
                                    <button @click="viewRequestScreenshot(request.id)" class="screenshot-button">Screenshot</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-else class="empty-message">
                    <p>Aucune demande trouvée.</p>
                </div>
            </div>
        </div>

        <!-- Chrome Sessions Tab -->
        <div class="tab-content" v-if="activeTab === 'sessions'">
            <div class="tab-section">
                <h2 class="section-title">Sessions Chrome</h2>

                <!-- Tableau des sessions -->
                <div class="table-container" v-if="sessions.length > 0">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th class="table-header">ID</th>
                                <th class="table-header">ID de Session</th>
                                <th class="table-header">Proxy</th>
                                <th class="table-header">Créé le</th>
                                <th class="table-header">Mis à jour</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="session in sessions" :key="session.id" class="table-row">
                                <td class="table-cell">{{ session.id }}</td>
                                <td class="table-cell">{{ session.session_id }}</td>
                                <td class="table-cell">{{ session.proxy || 'Aucun' }}</td>
                                <td class="table-cell">{{ new Date(session.created_at).toLocaleString() }}</td>
                                <td class="table-cell">{{ session.updated_at ? new Date(session.updated_at).toLocaleString() : '-' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-else class="empty-message">
                    <p>Aucune session Chrome trouvée.</p>
                </div>
            </div>
        </div>

        <!-- Modal pour les détails du host -->
        <div v-if="selectedHost" class="modal-overlay">
            <div class="modal-container">
                <span class="modal-close" @click="selectedHost = null">&times;</span>
                <h3 class="modal-title">Détails de l'hôte</h3>
                <p class="modal-text"><strong>ID:</strong> {{ selectedHost.id }}</p>
                <p class="modal-text"><strong>Origine:</strong> {{ selectedHost.origin }}</p>
                <p class="modal-text"><strong>Créé le:</strong> {{ new Date(selectedHost.created_at).toLocaleString() }}</p>
            </div>
        </div>

        <!-- Modal pour les détails de la requête -->
        <div v-if="selectedRequest" class="modal-overlay">
            <div class="modal-container">
                <span class="modal-close" @click="selectedRequest = null">&times;</span>
                <h3 class="modal-title">Détails de la demande</h3>
                <p class="modal-text"><strong>ID:</strong> {{ selectedRequest.id }}</p>
                <p class="modal-text"><strong>Origine ID:</strong> {{ selectedRequest.request_origin_id }}</p>
                <p class="modal-text"><strong>Session Chrome ID:</strong> {{ selectedRequest.chrome_session_id }}</p>
                <p class="modal-text"><strong>Créé le:</strong> {{ new Date(selectedRequest.created_at).toLocaleString() }}</p>
                <p v-if="selectedRequest.updated_at" class="modal-text"><strong>Mis à jour:</strong> {{ new Date(selectedRequest.updated_at).toLocaleString() }}</p>

                <div class="response-section">
                    <p class="modal-text"><strong>Réponse (décodée):</strong></p>
                    <pre class="response-content">{{ decodeBase64(selectedRequest.string_response) || 'Pas de réponse' }}</pre>
                </div>
            </div>
        </div>

        <!-- Modal pour le screenshot de la requête -->
        <div v-if="isScreenshotModalVisible" class="modal-overlay">
            <div class="modal-container screenshot-modal">
                <span class="modal-close" @click="isScreenshotModalVisible = false">&times;</span>
                <h3 class="modal-title">Screenshot de la requête</h3>
                <div class="screenshot-container">
                    <img v-if="!isScreenshotLoading && screenshotUrl" :src="screenshotUrl" alt="Screenshot" class="screenshot-image" />
                    <div v-else-if="isScreenshotLoading" class="loading-message">Chargement du screenshot...</div>
                    <div v-else class="error-message">Aucun screenshot disponible</div>
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

<style>
/* Common styles */
.dashboard-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 1.25rem;
}

.page-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1.25rem;
}

/* Tab Navigation */
.tab-navigation {
    display: flex;
    margin-bottom: 1.25rem;
    border-bottom: 1px solid #d1d5db;
    overflow-x: auto;
}

.tab-button {
    padding: 0.625rem 1.25rem;
    margin-right: 0.25rem;
    color: #111827;
    background-color: white;
    border: 1px solid #d1d5db;
    border-top-left-radius: 0.375rem;
    border-top-right-radius: 0.375rem;
    white-space: nowrap;
}

.active-tab {
    border-bottom: 1px solid white;
}

.inactive-tab {
    border-bottom: 1px solid #d1d5db;
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
    .tab-button {
        background-color: #1f2937;
        color: #f9fafb;
        border-color: #374151;
    }

    .active-tab {
        border-bottom: 1px solid #1f2937;
    }

    .inactive-tab {
        border-bottom: 1px solid #374151;
    }
}

/* Tab Content */
.tab-content {
    padding: 1.25rem 0;
}

.tab-section {
    margin-top: 1.25rem;
}

.section-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.25rem;
}

/* Form styles */
.form-container {
    margin-bottom: 1.25rem;
    padding: 1rem;
    background-color: white;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
}

.form-title {
    font-size: 1.125rem;
    font-weight: 500;
    margin-bottom: 0.75rem;
}

.form-group {
    display: flex;
    gap: 0.5rem;
}

.input-field {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background-color: white;
    color: #111827;
    margin-bottom: 0.5rem;
}

.add-button {
    padding: 0.5rem 1rem;
    background-color: #16a34a;
    color: white;
    border-radius: 0.375rem;
    border: none;
}

.add-button:hover {
    background-color: #15803d;
}

.add-button:disabled {
    background-color: #9ca3af;
}

/* Table styles */
.table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #d1d5db;
    min-width: 600px;
}

.table-header {
    padding: 0.75rem;
    text-align: left;
    background-color: #f3f4f6;
    border-bottom: 1px solid #d1d5db;
}

.table-row {
    border-bottom: 1px solid #d1d5db;
}

.table-cell {
    padding: 0.75rem;
}

.view-button {
    padding: 0.25rem 0.75rem;
    background-color: #3b82f6;
    color: white;
    border-radius: 0.375rem;
    border: none;
    margin-right: 0.5rem;
}

.view-button:hover {
    background-color: #2563eb;
}

.delete-button {
    padding: 0.25rem 0.75rem;
    background-color: #ef4444;
    color: white;
    border-radius: 0.375rem;
    border: none;
}

.delete-button:hover {
    background-color: #dc2626;
}

/* Screenshot styles */
.screenshot-button {
    padding: 0.25rem 0.75rem;
    background-color: #6366f1;
    color: white;
    border-radius: 0.375rem;
    border: none;
    margin-right: 0.5rem;
}

.screenshot-button:hover {
    background-color: #4f46e5;
}

.screenshot-modal {
    max-width: 90%;
    width: auto;
}

.screenshot-container {
    margin-top: 1rem;
    overflow: auto;
    max-height: 80vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.screenshot-image {
    max-width: 100%;
    height: auto;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
}

.loading-message, .error-message {
    padding: 2rem;
    text-align: center;
    color: #6b7280;
}

/* Empty message */
.empty-message {
    margin-top: 1.25rem;
    color: #6b7280;
}

/* Modal styles */
.modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
}

.modal-container {
    background-color: white;
    color: #111827;
    padding: 1.25rem;
    border-radius: 0.375rem;
    width: 90%;
    max-width: 500px;
    border: 1px solid #d1d5db;
    position: relative;
}

.modal-close {
    position: absolute;
    right: 1rem;
    top: 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    cursor: pointer;
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.modal-text {
    margin-bottom: 0.5rem;
}

.response-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #d1d5db;
}

.response-content {
    padding: 0.625rem;
    background-color: #f3f4f6;
    color: #111827;
    border-radius: 0.375rem;
    overflow-x: auto;
    max-height: 300px;
    white-space: pre-wrap;
    font-family: monospace;
    font-size: 0.875rem;
    border: 1px solid #d1d5db;
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
    .form-container, .modal-container {
        background-color: #1f2937;
        border-color: #374151;
        color: #f9fafb;
    }

    .input-field {
        background-color: #1f2937;
        border-color: #374151;
        color: #f9fafb;
    }

    .table-header {
        background-color: #374151;
        border-color: #374151;
    }

    .table-row, .data-table {
        border-color: #374151;
    }

    .empty-message {
        color: #9ca3af;
    }

    .response-content {
        background-color: #111827;
        color: #f9fafb;
        border-color: #374151;
    }

    .response-section {
        border-color: #374151;
    }

    .screenshot-button {
        background-color: #6d28d9;
    }
    
    .screenshot-button:hover {
        background-color: #5b21b6;
    }
    
    .screenshot-image {
        border-color: #374151;
    }
    
    .loading-message, .error-message {
        color: #9ca3af;
    }
}

@media (max-width: 768px) {
    .form-group {
        flex-direction: column;
    }
}
</style>
