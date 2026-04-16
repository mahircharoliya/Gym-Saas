/**
 * Wellhub (formerly Gympass) Access Control API integration.
 * Docs: https://developers.gympass.com/product/access-control-api
 *
 * Flow:
 * 1. Member presents their Wellhub credential (QR / NFC / card) at the gym door
 * 2. Your system calls POST /checkins with the member's Wellhub user ID
 * 3. Wellhub validates the user's plan and returns access granted/denied
 * 4. You record the check-in in your DB
 */

const WELLHUB_API_URL = process.env.WELLHUB_API_URL ?? "https://api.gympass.com";
const WELLHUB_CLIENT_ID = process.env.WELLHUB_CLIENT_ID ?? "";
const WELLHUB_CLIENT_SECRET = process.env.WELLHUB_CLIENT_SECRET ?? "";
const WELLHUB_GYM_ID = process.env.WELLHUB_GYM_ID ?? "";

interface WellhubTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface WellhubCheckinResponse {
    id: string;
    userId: string;
    gymId: string;
    status: "ALLOWED" | "DENIED";
    denialReason?: string;
    checkedInAt: string;
}

// ── Auth token (cached in memory for the process lifetime) ───────────────────
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
    if (cachedToken && Date.now() < cachedToken.expiresAt) {
        return cachedToken.token;
    }

    const res = await fetch(`${WELLHUB_API_URL}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: WELLHUB_CLIENT_ID,
            client_secret: WELLHUB_CLIENT_SECRET,
            scope: "access-control",
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Wellhub auth failed: ${err}`);
    }

    const data: WellhubTokenResponse = await res.json();
    cachedToken = {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in - 60) * 1000, // refresh 60s early
    };
    return cachedToken.token;
}

// ── Validate member access ────────────────────────────────────────────────────

export interface WellhubCheckinResult {
    success: boolean;
    allowed: boolean;
    checkinId?: string;
    denialReason?: string;
    error?: string;
}

export async function validateWellhubAccess(
    wellhubUserId: string
): Promise<WellhubCheckinResult> {
    if (!WELLHUB_CLIENT_ID || !WELLHUB_CLIENT_SECRET) {
        // Wellhub not configured — skip external validation
        return { success: true, allowed: true };
    }

    try {
        const token = await getAccessToken();

        const res = await fetch(`${WELLHUB_API_URL}/v1/gyms/${WELLHUB_GYM_ID}/checkins`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                userId: wellhubUserId,
                gymId: WELLHUB_GYM_ID,
                checkedInAt: new Date().toISOString(),
            }),
        });

        const data: WellhubCheckinResponse = await res.json();

        if (!res.ok) {
            return {
                success: false,
                allowed: false,
                error: `Wellhub API error: ${res.status}`,
            };
        }

        return {
            success: true,
            allowed: data.status === "ALLOWED",
            checkinId: data.id,
            denialReason: data.denialReason,
        };
    } catch (err) {
        return {
            success: false,
            allowed: false,
            error: err instanceof Error ? err.message : "Wellhub API unreachable",
        };
    }
}

// ── Get member's Wellhub profile ──────────────────────────────────────────────

export async function getWellhubMember(wellhubUserId: string) {
    if (!WELLHUB_CLIENT_ID) return null;
    try {
        const token = await getAccessToken();
        const res = await fetch(`${WELLHUB_API_URL}/v1/users/${wellhubUserId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}
