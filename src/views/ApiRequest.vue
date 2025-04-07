<template>
    <div class="api-request-page">
        <h1>API Request</h1>

        <div class="panels-container">
            <!-- Left Panel - Request Form -->
            <div class="panel request-panel">
                <h2>Paramètres de la requête</h2>

                <div class="form-group">
                    <label for="cmd">Commande:</label>
                    <select id="cmd" v-model="requestPayload.cmd">
                        <option value="request.get">request.get</option>
                        <option value="request.post">request.post</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="url">URL:</label>
                    <input id="url" v-model="requestPayload.url" placeholder="https://example.com" />
                </div>

                <div class="form-group">
                    <label for="session">ID de Session (optionnel):</label>
                    <input id="session" v-model="requestPayload.session" placeholder="ID de session" />
                </div>

                <div class="form-group">
                    <label for="session_ttl">Durée de session (minutes):</label>
                    <input type="number" id="session_ttl" v-model="requestPayload.session_ttl_minutes" min="1" />
                </div>

                <div class="form-group">
                    <label for="timeout">Timeout (secondes):</label>
                    <input type="number" id="timeout" v-model="requestPayload.maxTimeout" min="1" />
                </div>

                <div class="form-group">
                    <label for="proxy">Proxy (optionnel):</label>
                    <input id="proxy" v-model="requestPayload.proxy" placeholder="http://username:password@ip:port" />
                </div>

                <div class="form-group checkbox">
                    <input type="checkbox" id="returnCookies" v-model="returnOnlyCookies">
                    <label for="returnCookies">Retourner uniquement les cookies</label>
                </div>

                <div class="form-group">
                    <label>Cookies personnalisés:</label>
                    <div class="cookies-container">
                        <div v-for="(cookie, index) in cookies" :key="index" class="cookie-item">
                            <input v-model="cookie.name" placeholder="Nom" />
                            <input v-model="cookie.value" placeholder="Valeur" />
                            <button @click="removeCookie(index)" class="delete-btn">×</button>
                        </div>
                        <button @click="addCookie" class="add-btn">+ Ajouter un cookie</button>
                    </div>
                </div>

                <div class="form-group">
                    <h3>Payload JSON</h3>
                    <div class="json-editor-container">
                        <textarea class="json-editor" v-model="jsonPayload" rows="10"></textarea>
                    </div>
                </div>

                <div class="button-container">
                    <button @click="sendRequest" :disabled="isLoading" class="send-btn">
                        {{ isLoading ? 'Envoi en cours...' : 'Envoyer la requête' }}
                    </button>
                </div>
            </div>

            <!-- Right Panel - Response -->
            <div class="panel response-panel">
                <h2>Réponse</h2>
                <div v-if="isLoading" class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Chargement en cours...</p>
                </div>
                <div v-else-if="response" class="response-content">
                    <div class="response-status">
                        <span>Status: {{ responseStatus }}</span>
                    </div>
                    <pre class="json-response">{{ formattedResponse }}</pre>
                </div>
                <div v-else class="no-response-message">
                    <p>La réponse apparaîtra ici après l'envoi d'une requête.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { DoRequest } from '@/api';
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
        };

        // Add a cookie to the list
        const addCookie = () => {
            cookies.value.push({ name: "", value: "" });
        };

        // Remove a cookie from the list
        const removeCookie = (index) => {
            cookies.value.splice(index, 1);
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
            jsonPayload,
            isLoading,
            response,
            responseStatus,
            formattedResponse,
            loadExample,
            addCookie,
            removeCookie,
            sendRequest
        };
    }
});
</script>

<style scoped>
.api-request-page {
    max-width: 100%;
    margin: 0 auto;
    text-align: left;
    overflow: hidden;
}

h1,
h2,
h3 {
    margin-bottom: 20px;
}

.panels-container {
    display: flex;
    gap: 20px;
    min-height: 500px;
    width: 100%;
    flex-wrap: wrap;
    overflow: hidden;
}

.panel {
    flex: 1;
    padding: 20px;
    background-color: var(--card-bg-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    max-width: calc(50% - 10px);
    min-width: 300px;
    max-height: calc(100vh - 150px);
}

.request-panel {
    display: flex;
    flex-direction: column;
}

.response-panel {
    display: flex;
    flex-direction: column;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--bg-color);
    color: var(--text-color);
}

.checkbox {
    display: flex;
    align-items: center;

}

.checkbox {
    display: flex;
    align-items: center;
}

.checkbox input {
    width: auto;
    margin-right: 8px;
}

.checkbox label {
    margin-bottom: 0;
}

.cookies-container {
    margin-top: 10px;
}

.cookie-item {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.cookie-item input {
    flex: 1;
}

.delete-btn {
    background-color: var(--button-delete);
    color: white;
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-btn {
    background-color: var(--button-primary);
    color: white;
    padding: 8px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 5px;
}

.json-editor-container {
    border: 1px solid var(--border-color);
    border-radius: 4px;
    overflow: hidden;
}

.json-editor {
    width: 100%;
    padding: 10px;
    font-family: monospace;
    resize: vertical;
    background-color: var(--code-bg-color);
    color: var(--code-text-color);
    border: none;
    max-height: 400px;
    overflow: auto;
}

.button-container {
    margin-top: 20px;
}

.send-btn {
    background-color: var(--button-primary);
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.send-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.response-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 200px;
    /* Ensure minimum height for content */
}

.response-status {
    margin-bottom: 10px;
    padding: 5px 10px;
    background-color: var(--table-header-bg);
    border-radius: 4px;
    font-weight: bold;
}

.json-response {
    flex: 1;
    padding: 15px;
    background-color: var(--code-bg-color);
    color: var(--code-text-color);
    border-radius: 4px;
    overflow: auto;
    /* Allow scrolling in both directions for code blocks */
    font-family: monospace;
    white-space: pre-wrap;
    max-height: calc(100vh - 250px);
}

.no-response-message {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888;
    font-style: italic;
}

/* Loading state styling */
.loading-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;
    padding: 2rem;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid var(--button-primary, #42b983);
    border-radius: 50%;
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

/* Responsive design for smaller screens */
@media (max-width: 768px) {
    .panels-container {
        flex-direction: column;
        height: auto;
    }

    .panel {
        max-width: 100%;
        margin-bottom: 20px;
        min-height: 300px;
        /* Ensure panels have minimum height */
        height: auto;
        /* Allow height to grow as needed */
        max-height: calc(100vh - 100px);
    }

    .json-editor,
    .json-response {
        max-height: 300px;
    }
}

@media (max-width: 480px) {
    .api-request-page {
        padding: 10px;
    }

    .panel {
        padding: 15px;
        min-width: 100%;
    }

    .form-group {
        margin-bottom: 12px;
    }

    .cookie-item {
        flex-direction: column;
        gap: 5px;
    }

    .cookie-item input {
        width: 100%;
    }

    .cookie-item .delete-btn {
        align-self: flex-end;
    }

    .send-btn {
        width: 100%;
    }
}
</style>
