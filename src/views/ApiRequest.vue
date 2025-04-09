<template>
    <div class="api-container">
        <h1 class="page-title">API Request</h1>

        <div class="panels-container">
            <!-- Left Panel - Request Form -->
            <div class="panel-request">
                <div class="card">
                    <h2 class="section-title">Paramètres de la requête</h2>

                    <div class="form-group">
                        <label for="cmd" class="form-label">Commande:</label>
                        <select id="cmd" v-model="requestPayload.cmd" class="form-control">
                            <option value="request.get">request.get</option>
                            <option value="request.post">request.post</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="url" class="form-label">URL:</label>
                        <input id="url" v-model="requestPayload.url" placeholder="https://example.com"
                            class="form-control" />
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="session" class="form-label">ID de Session (optionnel):</label>
                            <input id="session" v-model="requestPayload.session" placeholder="ID de session"
                                class="form-control" />
                        </div>

                        <div class="form-group">
                            <label for="session_ttl" class="form-label">Durée de session (minutes):</label>
                            <input type="number" id="session_ttl" v-model="requestPayload.session_ttl_minutes" min="1"
                                class="form-control" />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="timeout" class="form-label">Timeout (secondes):</label>
                            <input type="number" id="timeout" v-model="requestPayload.maxTimeout" min="1"
                                class="form-control" />
                        </div>

                        <div class="form-group">
                            <label for="proxy" class="form-label">Proxy (optionnel):</label>
                            <input id="proxy" v-model="requestPayload.proxy"
                                placeholder="http://username:password@ip:port" class="form-control" />
                        </div>
                    </div>

                    <div class="form-group checkbox-group">
                        <label class="toggle-container">
                            <input type="checkbox" id="returnCookies" v-model="returnOnlyCookies" class="toggle-input">
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Retourner uniquement les cookies</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Cookies personnalisés:</label>
                        <div class="cookies-container card-nested">
                            <div v-for="(cookie, index) in cookies" :key="index" class="cookie-entry">
                                <input v-model="cookie.name" placeholder="Nom" class="form-control cookie-input" />
                                <input v-model="cookie.value" placeholder="Valeur" class="form-control cookie-input" />
                                <button @click="removeCookie(index)" class="btn-icon" aria-label="Supprimer ce cookie">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                            <button @click="addCookie" class="btn-text">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Ajouter un cookie
                            </button>
                        </div>
                    </div>

                    <!-- Browser Actions Section -->
                    <div class="form-group">
                        <label class="form-label">Actions du navigateur:</label>
                        <div class="actions-container card-nested">
                            <div v-for="(action, index) in browserActions" :key="index" class="action-entry">
                                <div class="action-header">
                                    <select v-model="action.action" class="form-control action-select">
                                        <option value="reload">Recharger la page</option>
                                        <option value="wait">Attendre (secondes)</option>
                                        <option value="script">Exécuter un script</option>
                                        <option value="type">Saisir du texte</option>
                                        <option value="waitForSelector">Attendre un élément</option>
                                    </select>
                                    <button @click="removeBrowserAction(index)" class="btn-icon"
                                        aria-label="Supprimer cette action">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24"
                                            height="24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                                <div class="action-content">
                                    <div v-if="['wait', 'script', 'type'].includes(action.action)"
                                        class="action-input-group">
                                        <label v-if="action.action === 'wait'" class="action-label">Durée
                                            (secondes):</label>
                                        <label v-else-if="action.action === 'script'" class="action-label">Code
                                            JavaScript:</label>
                                        <label v-else-if="action.action === 'type'" class="action-label">Texte à
                                            saisir:</label>

                                        <input v-if="action.action === 'wait'" type="number" v-model="action.value"
                                            min="1" max="60" class="form-control" />
                                        <textarea v-else-if="action.action === 'script'" v-model="action.value" rows="4"
                                            class="form-control action-textarea"></textarea>
                                        <input v-else-if="action.action === 'type'" type="text" v-model="action.value"
                                            placeholder="Texte à saisir" class="form-control" />
                                    </div>

                                    <div v-if="['type', 'waitForSelector'].includes(action.action)"
                                        class="action-input-group">
                                        <label class="action-label">Sélecteur CSS:</label>
                                        <input type="text" v-model="action.selector"
                                            placeholder="Ex: #login-form input[name=username]" class="form-control" />
                                    </div>
                                </div>
                            </div>
                            <button @click="addBrowserAction" class="btn-text">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Ajouter une action
                            </button>
                        </div>
                    </div>

                    <div class="form-group">
                        <h3 class="subsection-title">Payload JSON</h3>
                        <div class="json-container">
                            <textarea class="form-control code-textarea" v-model="jsonPayload" rows="10"></textarea>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button @click="sendRequest"
                            :disabled="isLoading || (isTaskTracking && !isTaskCompleted && !isTaskFailed)"
                            class="btn-primary">
                            <span v-if="isLoading" class="btn-spinner"></span>
                            {{ isLoading ? 'Envoi en cours...' : 'Envoyer la requête' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Right Panel - Response -->
            <div class="panel-response">
                <div class="card">
                    <h2 class="section-title">Réponse</h2>

                    <!-- Task Tracking Section -->
                    <div v-if="isTaskTracking" class="task-tracking-container">
                        <div class="task-status-header">
                            <h3 class="subsection-title">Suivi de tâche</h3>
                            <span class="task-id">ID: {{ taskId }}</span>
                            <span :class="'task-status-badge status-' + taskStatus">{{ taskStatus }}</span>
                        </div>

                        <div class="task-progress">
                            <div class="progress-bar">
                                <div class="progress-value" :style="{ width: taskProgressWidth }"></div>
                            </div>
                            <div class="progress-info">
                                <span>{{ taskStatusMessage }}</span>
                                <span v-if="taskStartTime">{{ elapsedTimeFormatted }}</span>
                            </div>
                        </div>

                        <div v-if="isTaskFailed" class="task-error">
                            <div class="task-error-icon">⚠</div>
                            <p>Échec de la tâche: {{ taskError }}</p>
                        </div>
                    </div>

                    <!-- Response Display -->
                    <div class="response-container">
                        <div v-if="isLoading && !isTaskCompleted" class="loading-state">
                            <div class="loading-spinner"></div>
                            <p class="loading-text">Chargement en cours...</p>
                        </div>
                        <div v-else-if="response !== null" class="response-content-wrapper">e-content-wrapper">
                            <div class="response-status">
                                <span :class="{
                                    'status-success': responseStatus === 'success' || responseStatus === '200' || isTaskCompleted,
                                    'status-error': responseStatus === 'error' || responseStatus === '400' || responseStatus === '500' || isTaskFailed
                                }">
                                    Status: {{ isTaskCompleted ? 'success' : responseStatus }}
                                </span>
                                <span v-if="isTaskCompleted" class="task-completed-indicator">
                                    (Résultat de tâche)
                                </span>
                            </div>
                            <pre class="response-content">{{ formattedResponse }}</pre>
                        </div>
                        <div v-else class="empty-response">
                            <div class="empty-icon">📡</div>
                            <p>La réponse apparaîtra ici après l'envoi d'une requête.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { baseUrl, DoRequest } from '../api';
import { defineComponent, ref, computed, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: 'ApiRequest',

    setup() {
        const router = useRouter();
        const isLoading = ref(false);
        const response = ref(null);
        const responseStatus = ref('');

        // Task tracking variables
        const isTaskTracking = ref(false);
        const taskId = ref('');
        const taskStatus = ref('queued');
        const taskStartTime = ref(null);
        const taskError = ref('');
        const taskStatusMessage = ref('Tâche en attente de traitement...');
        const taskCheckInterval = ref(null);

        // Computed properties for task tracking
        const isTaskCompleted = computed(() => taskStatus.value === 'completed');
        const isTaskFailed = computed(() => taskStatus.value === 'failed');
        const taskProgressWidth = computed(() => {
            switch (taskStatus.value) {
                case 'queued': return '10%';
                case 'processing': return '50%';
                case 'completed': return '100%';
                case 'failed': return '100%';
                default: return '0%';
            }
        });

        const elapsedTimeFormatted = computed(() => {
            if (!taskStartTime.value) return '';
            const elapsedMs = Date.now() - taskStartTime.value;
            const seconds = Math.floor(elapsedMs / 1000) % 60;
            const minutes = Math.floor(elapsedMs / (1000 * 60));
            return `${minutes}m ${seconds}s`;
        });

        const requestPayload = ref({
            cmd: 'request.get',
            url: 'https://example.com',
            maxTimeout: 60
        });

        const cookies = ref([]);
        const returnOnlyCookies = ref(false);
        // Add browserActions ref for the new feature
        const browserActions = ref([]);

        // Watch returnOnlyCookies and update the payload
        watch(returnOnlyCookies, (newVal) => {
            if (newVal) {
                requestPayload.value.returnOnlyCookies = "true";
            } else {
                delete requestPayload.value.returnOnlyCookies;
            }
        });

        // Watch cookies array and update the payload
        watch(cookies, (newVal) => {
            if (newVal.length > 0) {
                requestPayload.value.cookies = [...newVal];
            } else {
                delete requestPayload.value.cookies;
            }
        }, { deep: true });

        // Watch browserActions array and update the payload
        watch(browserActions, (newVal) => {
            if (newVal.length > 0) {
                // Filter out empty values to prevent API errors
                const validActions = newVal.map(action => {
                    const cleanedAction = { action: action.action };

                    if (['wait', 'script', 'type'].includes(action.action) && action.value) {
                        cleanedAction.value = action.value;
                    }

                    if (['type', 'waitForSelector'].includes(action.action) && action.selector) {
                        cleanedAction.selector = action.selector;
                    }

                    return cleanedAction;
                });

                requestPayload.value.actions = validActions;
            } else {
                delete requestPayload.value.actions;
            }
        }, { deep: true });

        // JSON representation of the payload
        const jsonPayload = computed({
            get: () => {
                return JSON.stringify(requestPayload.value, null, 2);
            },
            set: (val) => {
                try {
                    const parsed = JSON.parse(val);
                    requestPayload.value = parsed;

                    // Update related form fields
                    if (parsed.cookies) {
                        cookies.value = [...parsed.cookies];
                    } else {
                        cookies.value = [];
                    }

                    returnOnlyCookies.value = parsed.returnOnlyCookies === "true";

                    // Update browserActions from the parsed payload
                    if (parsed.actions && Array.isArray(parsed.actions)) {
                        browserActions.value = parsed.actions.map(action => ({
                            action: action.action,
                            value: action.value || '',
                            selector: action.selector || ''
                        }));
                    } else {
                        browserActions.value = [];
                    }
                } catch (e) {
                    console.error("Invalid JSON:", e);
                    // Do not update if JSON is invalid
                }
            }
        });

        // Beautified response
        const formattedResponse = computed(() => {
            if (!response.value) return '';

            try {
                return typeof response.value === 'object'
                    ? JSON.stringify(response.value, null, 2)
                    : response.value;
            } catch (e) {
                return response.value;
            }
        });

        // Load an example
        const loadExample = (payload) => {
            requestPayload.value = { ...payload };

            // Update related form fields
            if (payload.cookies) {
                cookies.value = [...payload.cookies];
            } else {
                cookies.value = [];
            }

            returnOnlyCookies.value = payload.returnOnlyCookies === "true";

            // Update browserActions
            if (payload.actions && Array.isArray(payload.actions)) {
                browserActions.value = payload.actions.map(action => ({
                    action: action.action,
                    value: action.value || '',
                    selector: action.selector || ''
                }));
            } else {
                browserActions.value = [];
            }
        };

        // Add a cookie to the list
        const addCookie = () => {
            cookies.value.push({ name: "", value: "" });
        };

        // Remove a cookie from the list
        const removeCookie = (index) => {
            cookies.value.splice(index, 1);
        };

        // Add a browser action to the list
        const addBrowserAction = () => {
            browserActions.value.push({
                action: "wait",
                value: "5",
                selector: ""
            });
        };

        // Remove a browser action from the list
        const removeBrowserAction = (index) => {
            browserActions.value.splice(index, 1);
        };

        // Function to check task status
        const checkTaskStatus = async () => {
            if (!taskId.value) return;

            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const resp = await fetch(`${baseUrl}/v1/tasks/${taskId.value}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!resp.ok) {
                    throw new Error('Failed to check task status');
                }

                const data = await resp.json();
                taskStatus.value = data.status;

                // Update task status message based on status
                switch (data.status) {
                    case 'queued':
                        taskStatusMessage.value = 'Tâche en attente de traitement...';
                        break;
                    case 'processing':
                        taskStatusMessage.value = 'Traitement en cours...';
                        break;
                    case 'completed':
                        taskStatusMessage.value = 'Tâche terminée avec succès';
                        isLoading.value = false; // Make sure loading is off

                        // Process completed task result
                        if (data.result) {
                            responseStatus.value = 'success';

                            // Handle different result formats
                            if (typeof data.result === 'string') {
                                try {
                                    // Try to parse if it's a JSON string
                                    response.value = JSON.parse(data.result);
                                } catch (e) {
                                    // If not parseable, display as is
                                    response.value = data.result;
                                }
                            } else {
                                response.value = data.result;
                            }

                            console.log('Task result set:', response.value);
                        } else {
                            responseStatus.value = 'success';
                            response.value = { info: "Tâche terminée sans données" };
                        }
                        clearInterval(taskCheckInterval.value);
                        break;
                    case 'failed':
                        taskStatusMessage.value = 'Échec de la tâche';
                        taskError.value = data.error || 'Une erreur inconnue est survenue';
                        responseStatus.value = 'error';
                        response.value = { error: taskError.value };
                        isLoading.value = false; // Make sure loading is off
                        clearInterval(taskCheckInterval.value);
                        break;
                }
            } catch (error) {
                console.error('Error checking task status:', error);
            }
        };

        // Function to start task tracking
        const startTaskTracking = (id) => {
            taskId.value = id;
            taskStartTime.value = Date.now();
            isTaskTracking.value = true;
            taskStatus.value = 'queued';
            taskStatusMessage.value = 'Tâche en attente de traitement...';

            // Clear any existing interval
            if (taskCheckInterval.value) {
                clearInterval(taskCheckInterval.value);
            }

            // Start polling for task status every 2 seconds
            taskCheckInterval.value = setInterval(checkTaskStatus, 2000);
        };

        // Clean up interval on component unmount
        onUnmounted(() => {
            if (taskCheckInterval.value) {
                clearInterval(taskCheckInterval.value);
            }
        });

        // Send the API request
        const sendRequest = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            // Reset response and task tracking before sending new request
            response.value = null;
            responseStatus.value = '';
            isTaskTracking.value = false;

            isLoading.value = true;
            try {
                const [res, status] = await DoRequest(requestPayload.value, token);
                console.log('API response:', res, status);

                // Check if the response contains a task_id
                if (res && res.task_id) {
                    startTaskTracking(res.task_id);
                    responseStatus.value = 'queued';
                } else {
                    // Regular response
                    response.value = res;
                    responseStatus.value = status;
                }
            } catch (error) {
                responseStatus.value = 'Error';
                response.value = { error: error.message };
                console.error('API request failed:', error);
            } finally {
                isLoading.value = false;
            }
        };

        return {
            requestPayload,
            cookies,
            returnOnlyCookies,
            browserActions,
            jsonPayload,
            isLoading,
            response,
            responseStatus,
            formattedResponse,
            loadExample,
            addCookie,
            removeCookie,
            addBrowserAction,
            removeBrowserAction,
            sendRequest,
            // Task tracking properties
            isTaskTracking,
            taskId,
            taskStatus,
            taskStatusMessage,
            isTaskCompleted,
            isTaskFailed,
            taskError,
            taskProgressWidth,
            elapsedTimeFormatted
        };
    }
});
</script>

<style scoped>
.api-container {
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    padding: var(--spacing-md);
}

.page-title {
    margin-bottom: var(--spacing-lg);
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color);
    border-bottom: 2px solid var(--border-color);
    padding-bottom: var(--spacing-sm);
}

.panels-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
}

@media (min-width: 1024px) {
    .panels-container {
        grid-template-columns: 3fr 2fr;
    }
}

.panel-request,
.panel-response {
    display: flex;
    flex-direction: column;
    min-height: 400px;
}

.card {
    background-color: var(--card-bg-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
    padding: var(--spacing-lg);
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: var(--transition);
}

.card:hover {
    box-shadow: var(--shadow-md);
}

/* Nested card style for container sections */
.card-nested {
    background-color: var(--bg-color-offset);
    border-radius: var(--radius);
    padding: var(--spacing-md);
    border: 1px solid var(--border-color);
}

.section-title {
    margin-bottom: var(--spacing-lg);
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color);
    display: flex;
    align-items: center;
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--border-color);
}

.subsection-title {
    margin-bottom: var(--spacing-sm);
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-color-secondary);
}

/* Form elements */
.form-group {
    margin-bottom: var(--spacing-md);
}

.form-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
}

@media (min-width: 768px) {
    .form-row {
        grid-template-columns: 1fr 1fr;
    }
}

.form-label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-weight: 600;
    color: var(--text-color);
    font-size: 0.95rem;
}

.form-control {
    width: 100%;
    padding: var(--spacing-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    background-color: var(--bg-color);
    color: var(--text-color);
    font-size: 0.95rem;
    transition: var(--transition);
}

.form-control:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-light);
}

.toggle-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
}

.toggle-input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
}

.toggle-slider {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 22px;
    background-color: var(--text-color-muted);
    border-radius: 34px;
    transition: var(--transition);
    margin-right: var(--spacing-sm);
}

.toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    border-radius: 50%;
    transition: var(--transition);
}

.toggle-input:checked+.toggle-slider {
    background-color: var(--primary);
}

.toggle-input:checked+.toggle-slider:before {
    transform: translateX(22px);
}

.toggle-label {
    font-weight: 500;
    color: var(--text-color);
}

.code-textarea {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    background-color: var(--code-bg-color);
    color: var(--code-text-color);
    min-height: 200px;
}

/* Cookie styles */
.cookies-container {
    margin-bottom: var(--spacing-sm);
}

.cookie-entry {
    display: flex;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px dashed var(--border-color);
}

.cookie-input {
    flex: 1;
}

/* Browser actions styles */
.actions-container {
    margin-bottom: var(--spacing-sm);
}

.action-entry {
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    background-color: var(--bg-color);
}

.action-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
}

.action-select {
    flex-grow: 1;
    margin-right: var (--spacing-sm);
}

.action-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.action-input-group {
    margin-bottom: var(--spacing-sm);
}

.action-label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-weight: 500;
    color: var (--text-color-secondary);
    font-size: 0.9rem;
}

.action-textarea {
    min-height: 100px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

/* Buttons */
.btn-primary {
    background-color: var(--button-primary);
    color: white;
    padding: var(--spacing-md) var(--spacing-lg);
    border: none;
    border-radius: var(--radius);
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    transition: var(--transition);
}

.btn-primary:hover:not(:disabled) {
    background-color: var(--button-primary-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.btn-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    border-radius: var(--radius);
    cursor: pointer;
    color: var(--text-color-muted);
    transition: var(--transition);
}

.btn-icon:hover {
    background-color: rgba(239, 68, 68, 0.1);
    color: var(--button-danger);
}

.btn-icon svg {
    width: 18px;
    height: 18px;
}

.btn-text {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    background-color: transparent;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-color-secondary);
    cursor: pointer;
    transition: var(--transition);
}

.btn-text:hover {
    background-color: var(--bg-color-offset);
    color: var(--primary);
    border-color: var(--primary);
}

.btn-text svg {
    color: var(--primary);
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

.form-actions {
    margin-top: var(--spacing-lg);
}

/* Response styles */
.response-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-color-offset);
    border-radius: var(--radius);
    overflow: hidden;
    height: 100%;
    min-height: 300px;
    max-height: calc(100vh - 400px);
    /* Prevent overflow by using viewport height */
}

.loading-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md);
}

.response-content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.response-status {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: var(--bg-color-secondary);
    font-weight: 600;
    border-bottom: 1px solid var(--border-color);
}

.status-success {
    color: var(--button-success);
}

.status-error {
    color: var(--button-danger);
}

.response-content {
    flex: 1;
    padding: var(--spacing-md);
    margin: 0;
    overflow: auto;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--code-text-color);
    background-color: var(--code-bg-color);
    white-space: pre-wrap;
    word-break: break-word;
    height: 100%;
    /* Use height instead of min-height */
    max-height: calc(100vh - 450px);
    /* Responsive max height based on viewport */
    overflow-y: auto;
    overflow-x: auto;
}

.panel-response {
    display: flex;
    flex-direction: column;
    height: auto;
    /* Use auto height */
    max-height: calc(100vh - 150px);
    /* Limit maximum height based on viewport */
    overflow: hidden;
}

.empty-response {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-color-muted);
    padding: var(--spacing-xl);
    text-align: center;
}

.empty-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
}

/* Task tracking styles */
.task-tracking-container {
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-md);
    background-color: var(--bg-color);
    border-radius: var (--radius);
    border: 1px solid var(--border-color);
    max-height: 300px;
    /* Limit maximum height */
    overflow-y: auto;
    /* Add scroll if content overflows */
}

.task-status-header {
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-md);
}

.task-status-header h3 {
    margin: 0;
    margin-right: auto;
}

.task-id {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.85rem;
    background-color: var(--bg-color-offset);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius);
    margin-right: var(--spacing-sm);
}

.task-status-badge {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var (--radius-lg);
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
}

.status-queued {
    background-color: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
}

.status-processing {
    background-color: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
}

.status-completed {
    background-color: rgba(16, 185, 129, 0.1);
    color: #10b981;
}

.status-failed {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.task-progress {
    margin-bottom: var(--spacing-md);
}

.progress-bar {
    width: 100%;
    height: 8px;
    background-color: var(--bg-color-offset);
    border-radius: var (--radius);
    overflow: hidden;
    margin-bottom: var(--spacing-xs);
}

.progress-value {
    height: 100%;
    background-color: var(--primary);
    border-radius: var (--radius);
    transition: width 0.5s ease;
}

.progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: var(--text-color-secondary);
}

.task-success {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm);
    background-color: rgba(16, 185, 129, 0.1);
    border-radius: var (--radius);
    color: #10b981;
}

.task-success-icon {
    font-weight: bold;
    font-size: 1.25rem;
    margin-right: var(--spacing-sm);
}

.task-error {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm);
    background-color: rgba(239, 68, 68, 0.1);
    border-radius: var (--radius);
    color: #ef4444;
}

.task-error-icon {
    font-weight: bold;
    font-size: 1.25rem;
    margin-right: var(--spacing-sm);
}

/* Add style for task completed indicator */
.task-completed-indicator {
    margin-left: var(--spacing-sm);
    font-size: 0.85rem;
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: rgba(16, 185, 129, 0.1);
    color: #10b981;
    border-radius: var(--radius);
}
</style>
