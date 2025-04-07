export const baseUrl = "http://localhost:8000";

export async function createUser(email: string, fullName: string, password: string) {
    const response = await fetch(`${baseUrl}/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, full_name: fullName, password }),
    });
    return response.json();
}
export async function DoRequest(data: any) {
    const response = await fetch(`${baseUrl}/v1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return [await response.json(), response.status];
}

export async function login(email: string, password: string) {
    const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    return response.json();
}

export async function logout(accessToken: string) {
    const response = await fetch(`${baseUrl}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.ok;
}

export async function accessProtectedRoute(accessToken: string) {
    const response = await fetch(`${baseUrl}/protected`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.json();
}

export async function getAllUsers(accessToken: string) {
    const response = await fetch(`${baseUrl}/users/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.json();
}

export async function createAllowedHost(accessToken: string, origin: string) {
    const response = await fetch(`${baseUrl}/allowed-hosts/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ origin }),
    });
    return response.json();
}

export async function getAllowedHosts(accessToken: string) {
    const response = await fetch(`${baseUrl}/allowed-hosts/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.json();
}

export async function deleteAllowedHost(accessToken: string, id: number) {
    const response = await fetch(`${baseUrl}/allowed-hosts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.ok;
}

export async function flaresolverApi(payload: object) {
    const response = await fetch(`${baseUrl}/v1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return response.json();
}

export async function getUserRequests(accessToken: string) {
    const response = await fetch(`${baseUrl}/requests/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.json();
}

export async function getChromeSessionsForCurrentUser(accessToken: string) {
    const response = await fetch(`${baseUrl}/chrome-sessions/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.json();
}
