const { firestore } = require("firebase-functions/v1");
const admin = require('firebase-admin');
admin.initializeApp();

/**
 * Trigger que se activa cuando se crea un nuevo documento en 'workspace_members'.
 * Envía una notificación push al usuario agregado.
 */
exports.notifyMemberAdded = firestore
    .document('workspace_members/{memberId}')
    .onCreate(async (snapshot, context) => {
        const data = snapshot.data();

        // Extraemos la información guardada por el repositorio de Android
        const uid = data.uid;
        const role = data.role === 'manager' ? 'Manager' : 'Colaborador';
        const workspaceName = data.workspaceName || 'un nuevo proyecto';
        const managerName = data.addedByName || 'Un Manager';

        try {
            // 1. Obtener el token FCM del usuario destinatario desde su perfil
            const userDoc = await admin.firestore().collection('users').doc(uid).get();
            const fcmToken = userDoc.data()?.fcmToken;

            if (!fcmToken) {
                console.log(`El usuario ${uid} no tiene un token FCM registrado.`);
                return null;
            }

            // 2. Construir el mensaje para FCM V1
            const message = {
                notification: {
                    title: '¡Bienvenido al equipo! 🚀',
                    body: `${managerName} te ha agregado a "${workspaceName}" como ${role}.`,
                },
                token: fcmToken,
                android: {
                    priority: 'high',
                    notification: {
                        channelId: 'prosync_notifications',
                        icon: 'ic_notification',
                        clickAction: 'OPEN_ACTIVITY_1'
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            badge: 1,
                            sound: 'default'
                        }
                    }
                }
            };

            // 3. Enviar la notificación
            const response = await admin.messaging().send(message);
            console.log('Notificación enviada con éxito:', response);
            return response;

        } catch (error) {
            console.error('Error al enviar la notificación:', error);
            return null;
        }
    });
