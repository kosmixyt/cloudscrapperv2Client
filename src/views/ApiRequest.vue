<template>
    <div class="api-container">
        <h1 class="page-title">API Request</h1>

        <div class="panels-container">
            <!-- Left Panel - Request Form -->
            <div class="panel panel-request">
                <h2 class="section-title">Paramètres de la requête</h2>

                <div class="form-group">
                    <label for="cmd" class="form-label">Commande:</label>
                    <select id="cmd" v-model="requestPayload.cmd" class="input-select">
                        <option value="request.get">request.get</option>
                        <option value="request.post">request.post</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="url" class="form-label">URL:</label>
                    <input id="url" v-model="requestPayload.url" placeholder="https://example.com" class="input-field" />
                </div>

                <div class="form-group">
                    <label for="session" class="form-label">ID de Session (optionnel):</label>
                    <input id="session" v-model="requestPayload.session" placeholder="ID de session" class="input-field" />
                </div>

                <div class="form-group">
                    <label for="session_ttl" class="form-label">Durée de session (minutes):</label>
                    <input type="number" id="session_ttl" v-model="requestPayload.session_ttl_minutes" min="1" class="input-field" />
                </div>

                <div class="form-group">
                    <label for="timeout" class="form-label">Timeout (secondes):</label>
                    <input type="number" id="timeout" v-model="requestPayload.maxTimeout" min="1" class="input-field" />
                </div>

                <div class="form-group">
                    <label for="proxy" class="form-label">Proxy (optionnel):</label>
                    <input id="proxy" v-model="requestPayload.proxy" placeholder="http://username:password@ip:port" class="input-field" />
                </div>

                <div class="form-group checkbox-group">
                    <input type="checkbox" id="returnCookies" v-model="returnOnlyCookies" class="checkbox-input">
                    <label for="returnCookies" class="checkbox-label">Retourner uniquement les cookies</label>
                </div>

                <div class="form-group">
                    <label class="form-label">Cookies personnalisés:</label>
                    <div class="cookies-container">
                        <div v-for="(cookie, index) in cookies" :key="index" class="cookie-entry">
                            <input v-model="cookie.name" placeholder="Nom" class="cookie-input" />
                            <input v-model="cookie.value" placeholder="Valeur" class="cookie-input" />
                            <button @click="removeCookie(index)" class="remove-button">×</button>
                        </div>
                        <button @click="addCookie" class="add-button-small">+ Ajouter un cookie</button>
                    </div>
                </div>

                <!-- Browser Actions Section -->
                <div class="form-group">
                    <label class="form-label">Actions du navigateur:</label>
                    <div class="actions-container">
                        <div v-for="(action, index) in browserActions" :key="index" class="action-entry">
                            <div class="action-header">
                                <select v-model="action.action" class="action-select">
                                    <option value="reload">Recharger la page</option>
                                    <option value="wait">Attendre (secondes)</option>
                                    <option value="script">Exécuter un script</option>
                                    <option value="type">Saisir du texte</option>
                                    <option value="waitForSelector">Attendre un élément</option>
                                </select>
                                <button @click="removeBrowserAction(index)" class="remove-button">×</button>
                            </div>
                            <div class="action-content">
                                <div v-if="['wait', 'script', 'type'].includes(action.action)" class="action-input-group">
                                    <label v-if="action.action === 'wait'" class="action-label">Durée (secondes):</label>
                                    <label v-else-if="action.action === 'script'" class="action-label">Code JavaScript:</label>
                                    <label v-else-if="action.action === 'type'" class="action-label">Texte à saisir:</label>
                                    
                                    <input v-if="action.action === 'wait'" type="number" v-model="action.value" min="1" max="60" class="action-input" />
                                    <textarea v-else-if="action.action === 'script'" v-model="action.value" rows="4" class="action-textarea"></textarea>
                                    <input v-else-if="action.action === 'type'" type="text" v-model="action.value" placeholder="Texte à saisir" class="action-input" />
                                </div>
                                
                                <div v-if="['type', 'waitForSelector'].includes(action.action)" class="action-input-group">
                                    <label class="action-label">Sélecteur CSS:</label>
                                    <input type="text" v-model="action.selector" placeholder="Ex: #login-form input[name=username]" class="action-input" />
                                </div>
                            </div>
                        </div>
                        <button @click="addBrowserAction" class="add-button-small">+ Ajouter une action</button>
                    </div>
                </div>

                <div class="form-group">
                    <h3 class="subsection-title">Payload JSON</h3>
                    <div class="json-container">
                        <textarea class="json-textarea" v-model="jsonPayload" rows="10"></textarea>
                    </div>
                </div>

                <div class="form-actions">
                    <button @click="sendRequest" :disabled="isLoading" class="submit-button">
                        {{ isLoading ? 'Envoi en cours...' : 'Envoyer la requête' }}
                    </button>
                </div>
            </div>

            <!-- Right Panel - Response -->
            <div class="panel panel-response">
                <h2 class="section-title">Réponse</h2>
                <div v-if="isLoading" class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Chargement en cours...</p>
                </div>
                <div v-else-if="response" class="response-container">
                    <div class="response-status">
                        <span>Status: {{ responseStatus }}</span>
                    </div>
                    <pre class="response-content">{{ formattedResponse }}</pre>
                </div>
                <div v-else class="empty-response">
                    <p>La réponse apparaîtra ici après l'envoi d'une requête.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { DoRequest } from '../api';
import { defineComponent, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: 'ApiRequest',

    setup() {
        const router = useRouter();
        const isLoading = ref(false);
        const response = ref(null);
        const responseStatus = ref('');

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

        // Send the API request
        const sendRequest = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            // Reset response before sending new request
            response.value = null;
            responseStatus.value = '';

            isLoading.value = true;
            try {
                const [res, status] = await DoRequest(requestPayload.value, token);
                console.log('API response:', res, status);
                response.value = res;
                responseStatus.value = status;
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
            sendRequest
        };
    }
});
</script>

<style>
/* Container styles */
.api-container {
    max-width: 100%;
    margin: 0 auto;
    text-align: left;
    overflow: hidden;
    padding: 1rem;
}

.page-title {
    margin-bottom: 1.5rem;
    font-size: 1.75rem;
    font-weight: 700;
    color: #2563eb;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 0.75rem;
}

.panels-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 1.5rem;
    min-height: 600px;
    width: 100%;
    overflow: hidden;
}

.panel {
    flex: 1;
    padding: 1.5rem;
    background-color: white;
    border-radius: 0.75rem;
    overflow: auto;
    display: flex;
    flex-direction: column;
    min-width: 300px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease-in-out;
}

.panel:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.panel-request, .panel-response {
    max-width: 100%;
    max-height: calc(100vh - 100px);
}

.section-title {
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    display: flex;
    align-items: center;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.subsection-title {
    margin-bottom: 0.75rem;
    margin-top: 1.25rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #4b5563;
}

/* Form styles */
.form-group {
    margin-bottom: 1.25rem;
    background-color: #f9fafb;
    padding: 1rem;
    border-radius: 0.5rem;
    border-left: 3px solid #3b82f6;
    transition: all 0.2s ease;
}

.form-group:hover {
    background-color: #f3f4f6;
}

.form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #4b5563;
}

.input-field, .input-select {
    width: 100%;
    padding: 0.625rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    background-color: white;
    color: #111827;
    transition: all 0.2s ease;
    font-size: 0.95rem;
}

.input-field:focus, .input-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.checkbox-group {
    display: flex;
    align-items: center;
    background-color: #f9fafb;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
}

.checkbox-input {
    margin-right: 0.75rem;
    width: 1.25rem;
    height: 1.25rem;
    accent-color: #3b82f6;
}

.checkbox-label {
    font-weight: 500;
    color: #4b5563;
}

/* Cookie styles */
.cookies-container {
    margin-top: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    background-color: white;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.cookie-entry {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px dashed #e5e7eb;
}

.cookie-entry:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.cookie-input {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    background-color: white;
    color: #111827;
    transition: border-color 0.2s ease;
}

.cookie-input:focus {
    outline: none;
    border-color: #3b82f6;
}

.remove-button {
    width: 2rem;
    height: 2rem;
    background-color: #ef4444;
    color: white;
    border-radius: 0.5rem;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.remove-button:hover {
    background-color: #dc2626;
    transform: scale(1.05);
}

.add-button-small {
    margin-top: 0.5rem;
    background-color: #3b82f6;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: none;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
}

.add-button-small:hover {
    background-color: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Browser actions styles */
.actions-container {
    margin-top: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    background-color: white;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.action-entry {
    margin-bottom: 1rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background-color: #f9fafb;
    transition: all 0.2s ease;
}

.action-entry:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.action-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.action-select {
    flex-grow: 1;
    padding: 0.5rem 0.75rem;
    margin-right: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    background-color: white;
    color: #111827;
}

.action-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.action-input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: white;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
}

.action-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;
}

.action-input {
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    background-color: white;
    color: #111827;
    transition: all 0.2s ease;
}

.action-input:focus {
    outline: none;
    border-color: #3b82f6;
}

.action-textarea {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    background-color: #f3f4f6;
    color: #111827;
    font-family: monospace;
    resize: vertical;
    transition: all 0.2s ease;
    min-height: 100px;
}

.action-textarea:focus {
    outline: none;
    border-color: #3b82f6;
}

/* JSON textarea */
.json-container {
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.json-textarea {
    width: 100%;
    padding: 0.75rem;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 0.9rem;
    resize: vertical;
    background-color: #f3f4f6;
    color: #111827;
    border: none;
    min-height: 200px;
    transition: all 0.2s ease;
}

.json-textarea:focus {
    outline: none;
    background-color: #e5e7eb;
}

/* Submit button */
.form-actions {
    margin-top: 1.5rem;
}

.submit-button {
    width: 100%;
    padding: 0.75rem 1.5rem;
    background-color: #2563eb;
    color: white;
    border-radius: 0.5rem;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.submit-button:hover {
    background-color: #1d4ed8;
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.submit-button:active {
    transform: translateY(0);
}

.submit-button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

/* Response styles */
.loading-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
}

.loading-spinner {
    width: 3rem;
    height: 3rem;
    border: 4px solid #3b82f6;
    border-top: 4px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-text {
    color: #6b7280;
}

.response-container {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.response-status {
    margin-bottom: 0.625rem;
    padding: 0.375rem;
    background-color: #f3f4f6;
    border-radius: 0.375rem;
    font-weight: 700;
}

.response-content {
    flex: 1;
    padding: 1rem;
    background-color: #f3f4f6;
    color: #111827;
    border-radius: 0.375rem;
    overflow: auto;
    font-family: monospace;
    white-space: pre-wrap;
    max-height: calc(100vh - 250px);
}

.empty-response {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    font-style: italic;
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
    .panel {
        background-color: #1f2937;
        border-color: #374151;
    }
    
    .input-field, .input-select, .action-select, .action-input {
        background-color: #1f2937;
        border-color: #374151;
        color: #f9fafb;
    }
    
    .cookies-container, .actions-container {
        background-color: #111827;
        border-color: #374151;
    }
    
    .action-entry {
        background-color: #1f2937;
        border-color: #374151;
    }
    
    .action-textarea, .json-textarea {
        background-color: #111827;
        color: #f9fafb;
    }
    
    .response-status {
        background-color: #374151;
    }
    
    .response-content {
        background-color: #111827;
        color: #f9fafb;
    }
    
    .loading-text, .empty-response {
        color: #9ca3af;
    }
}
</style>
