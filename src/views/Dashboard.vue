<template>
    <div class="dashboard">
        <h1>Tableau de bord</h1>

        <!-- Navigation tabs -->
        <div class="tabs">
            <button :class="{ active: activeTab === 'hosts' }" @click="activeTab = 'hosts'">
                Hôtes autorisés
            </button>
            <button :class="{ active: activeTab === 'requests' }" @click="activeTab = 'requests'">
                Demandes
            </button>
            <button :class="{ active: activeTab === 'sessions' }" @click="activeTab = 'sessions'">
                Sessions Chrome
            </button>
        </div>

        <!-- Allowed Hosts Tab -->
        <div class="tab-content" v-if="activeTab === 'hosts'">
            <div class="allowed-hosts">
                <h2>Hôtes autorisés</h2>

                <!-- Formulaire pour ajouter un nouveau host -->
                <div class="add-host-form">
                    <h3>Ajouter un nouvel hôte</h3>
                    <div class="form-group">
                        <input v-model="newHost" placeholder="Entrer l'URL d'origine (ex: https://example.com)" />
                        <button @click="createHost" :disabled="isLoading">Ajouter</button>
                    </div>
                </div>

                <!-- Tableau des hosts -->
                <div class="hosts-table" v-if="hosts.length > 0">
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
                                <td>
                                    <button @click="viewHost(host)" class="view-btn">Voir</button>
                                    <button @click="deleteHost(host.id)" class="delete-btn">Supprimer</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-else>
                    <p>Aucun hôte autorisé trouvé. Ajoutez votre premier hôte ci-dessus.</p>
                </div>
            </div>
        </div>

        <!-- Requests Tab -->
        <div class="tab-content" v-if="activeTab === 'requests'">
            <div class="requests">
                <h2>Demandes</h2>

                <!-- Tableau des requêtes -->
                <div class="requests-table" v-if="requests.length > 0">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Origine</th>
                                <th>Session Chrome</th>
                                <th>Créé le</th>
                                <th>Mis à jour</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="request in requests" :key="request.id">
                                <td>{{ request.id }}</td>
                                <td>{{ request.request_origin_id }}</td>
                                <td>{{ request.chrome_session_id }}</td>
                                <td>{{ new Date(request.created_at).toLocaleString() }}</td>
                                <td>{{ request.updated_at ? new Date(request.updated_at).toLocaleString() : '-' }}</td>
                                <td>
                                    <button @click="viewRequestDetails(request)" class="view-btn">Détails</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-else>
                    <p>Aucune demande trouvée.</p>
                </div>
            </div>
        </div>

        <!-- Chrome Sessions Tab -->
        <div class="tab-content" v-if="activeTab === 'sessions'">
            <div class="chrome-sessions">
                <h2>Sessions Chrome</h2>

                <!-- Tableau des sessions -->
                <div class="sessions-table" v-if="sessions.length > 0">
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

                <div v-else>
                    <p>Aucune session Chrome trouvée.</p>
                </div>
            </div>
        </div>

        <!-- Modal pour les détails du host -->
        <div v-if="selectedHost" class="modal">
            <div class="modal-content">
                <span class="close" @click="selectedHost = null">&times;</span>
                <h3>Détails de l'hôte</h3>
                <p><strong>ID:</strong> {{ selectedHost.id }}</p>
                <p><strong>Origine:</strong> {{ selectedHost.origin }}</p>
                <p><strong>Créé le:</strong> {{ new Date(selectedHost.created_at).toLocaleString() }}</p>
            </div>
        </div>

        <!-- Modal pour les détails de la requête -->
        <div v-if="selectedRequest" class="modal">
            <div class="modal-content">
                <span class="close" @click="selectedRequest = null">&times;</span>
                <h3>Détails de la demande</h3>
                <p><strong>ID:</strong> {{ selectedRequest.id }}</p>
                <p><strong>Origine ID:</strong> {{ selectedRequest.request_origin_id }}</p>
                <p><strong>Session Chrome ID:</strong> {{ selectedRequest.chrome_session_id }}</p>
                <p><strong>Créé le:</strong> {{ new Date(selectedRequest.created_at).toLocaleString() }}</p>
                <p v-if="selectedRequest.updated_at"><strong>Mis à jour:</strong> {{ new
                    Date(selectedRequest.updated_at).toLocaleString() }}</p>

                <div class="response-container">
                    <p><strong>Réponse (décodée):</strong></p>
                    <pre
                        class="response-data">{{ decodeBase64(selectedRequest.string_response) || 'Pas de réponse' }}</pre>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllowedHosts, createAllowedHost, deleteAllowedHost, getUserRequests, getChromeSessionsForCurrentUser } from '../api';

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
            // Chrome Sessions
            sessions,
            isLoading,
            isBase64Decoded,
            decodeBase64
        };
    }
});
</script>

<style scoped>
.dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* Tabs styling */
.tabs {
    display: flex;
    margin-bottom: 20px;
    border-bottom: 1px solid #ddd;
    overflow-x: auto;
    /* Allow tabs to scroll horizontally on small screens */
    -webkit-overflow-scrolling: touch;
}

.tabs button {
    padding: 10px 20px;
    margin-right: 5px;
    background-color: var(--card-bg-color);
    border: 1px solid var(--border-color);
    border-bottom: none;
    border-radius: 4px 4px 0 0;
    cursor: pointer;
    color: var(--text-color);
    white-space: nowrap;
    /* Prevent tab text from wrapping */
}

.tab-content {
    padding: 20px 0;
}

.allowed-hosts,
.requests,
.chrome-sessions {
    margin-top: 20px;
}

.add-host-form {
    margin-bottom: 20px;
    padding: 15px;
    background-color: var(--card-bg-color);
    border-radius: 5px;
}

.form-group {
    display: flex;
    gap: 10px;
}

input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

button {
    padding: 8px 15px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #45a049;
}

button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.view-btn {
    background-color: #2196F3;
}

.view-btn:hover {
    background-color: #0b7dda;
}

.delete-btn {
    background-color: #f44336;
}

.delete-btn:hover {
    background-color: #d32f2f;
}

/* Responsive table container */
.hosts-table,
.requests-table,
.sessions-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    border: 1px solid var(--border-color);
    min-width: 600px;
    /* Ensure minimum width for better readability */
}

th,
td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
}

th {
    background-color: var(--table-header-bg);
    color: var(--text-color);
}

/* Modal styling with dark mode support */
.modal {
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: var(--modal-overlay-bg);
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Modal styling with improved responsiveness */
.modal-content {
    background-color: var(--modal-bg);
    color: var(--text-color);
    padding: 20px;
    border-radius: 5px;
    width: 90%;
    max-width: 500px;
    position: relative;
    border: 1px solid var(--border-color);
}

.close {
    position: absolute;
    right: 15px;
    top: 10px;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    color: var(--text-color);
}

.response-data {
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    max-height: 200px;
    white-space: pre-wrap;
}

.response-container {
    margin-top: 15px;
    border-top: 1px solid var(--border-color);
    padding-top: 15px;
}

.response-controls {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
}

.toggle-btn {
    background-color: #607d8b;
    padding: 5px 10px;
    font-size: 0.8rem;
}

.toggle-btn:hover {
    background-color: #455a64;
}

.response-data {
    background-color: var(--code-bg-color);
    color: var(--code-text-color);
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    max-height: 300px;
    white-space: pre-wrap;
    font-family: monospace;
    font-size: 0.9rem;
    border: 1px solid var(--border-color);
}

/* Add responsive adjustments */
@media (max-width: 768px) {
    .add-host-form {
        padding: 10px;
    }

    .form-group {
        flex-direction: column;
    }

    .form-group input,
    .form-group button {
        width: 100%;
        margin-bottom: 10px;
    }

    .modal-content {
        width: 95%;
        padding: 15px;
    }
}

@media (max-width: 480px) {
    .dashboard {
        padding: 10px;
    }

    .tabs {
        padding-bottom: 1px;
    }

    .tabs button {
        padding: 8px 12px;
        font-size: 0.9rem;
    }

    .response-data {
        font-size: 0.8rem;
    }
}
</style>
