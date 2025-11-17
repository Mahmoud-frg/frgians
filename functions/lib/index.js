"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClerkUser = exports.sendNewsNotification = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const node_fetch_1 = __importDefault(require("node-fetch"));
admin.initializeApp();
exports.sendNewsNotification = functions.firestore
    .document('newsList/{newsId}')
    .onCreate(async (snap, context) => {
    const newNews = snap.data();
    const tokensSnapshot = await admin
        .firestore()
        .collection('pushTokens')
        .get();
    const messages = [];
    tokensSnapshot.forEach((doc) => {
        const token = doc.data().token;
        if (token) {
            messages.push({
                to: token,
                sound: 'default',
                title: newNews.title || 'New News!',
                body: newNews.body || '',
                data: { newsId: context.params.newsId },
            });
        }
    });
    const chunks = [];
    while (messages.length)
        chunks.push(messages.splice(0, 100));
    for (const chunk of chunks) {
        await (0, node_fetch_1.default)('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(chunk),
        });
    }
    return null;
});
// ----------------------
// Clerk User Deletion
// ----------------------
const EXPO_CLERK_SECRET_KEY = functions.config().clerk.secret_key;
/**
 * HTTPS callable function
 * Frontend calls this function when a user requests account deletion
 */
exports.deleteClerkUser = functions.https.onCall(async (data, context) => {
    const { userId } = data;
    if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'User ID is required.');
    }
    try {
        const response = await (0, node_fetch_1.default)(`https://api.clerk.dev/v1/users/${userId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${EXPO_CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new functions.https.HttpsError('internal', `Failed to delete Clerk user: ${response.statusText} - ${errorBody}`);
        }
        // Optional: also clean up Firestore user data
        await admin.firestore().collection('users').doc(userId).delete();
        return {
            success: true,
            message: 'User deleted successfully from Clerk and Firestore.',
        };
    }
    catch (error) {
        console.error('Error deleting Clerk user:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
