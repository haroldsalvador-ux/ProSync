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

/**
 * Trigger que se activa cuando se crea una nueva tarea.
 * Notifica al usuario asignado.
 */
exports.notifyTaskAssigned = firestore
    .document('tasks/{taskId}')
    .onCreate(async (snapshot, context) => {
        const data = snapshot.data();
        const assigneeUid = data.assigneeUid;
        const taskTitle = data.title;
        const creatorEmail = data.createdByEmail || 'Un compañero';

        if (!assigneeUid) return null;

        try {
            const userDoc = await admin.firestore().collection('users').doc(assigneeUid).get();
            const fcmToken = userDoc.data()?.fcmToken;

            if (!fcmToken) return null;

            const message = {
                notification: {
                    title: 'Nueva tarea asignada 📋',
                    body: `${creatorEmail} te asignó: ${taskTitle}`,
                },
                token: fcmToken,
                android: {
                    priority: 'high',
                    notification: {
                        channelId: 'prosync_notifications',
                        icon: 'ic_notification'
                    }
                }
            };

            return await admin.messaging().send(message);
        } catch (error) {
            console.error('Error enviando notificación de tarea:', error);
            return null;
        }
    });

/**
 * Trigger que se activa cuando se agrega un comentario a una tarea.
 * Notifica al autor de la tarea o al asignado (lógica simplificada: notifica al asignado).
 */
exports.notifyNewComment = firestore
    .document('task_comments/{commentId}')
    .onCreate(async (snapshot, context) => {
        const data = snapshot.data();
        const taskId = data.taskId;
        const authorName = data.authorName || 'Alguien';
        const commentBody = data.body;

        try {
            // Obtener la tarea para saber a quién notificar (al asignado)
            const taskDoc = await admin.firestore().collection('tasks').doc(taskId).get();
            const taskData = taskDoc.data();
            const assigneeUid = taskData?.assigneeUid;

            if (!assigneeUid || assigneeUid === data.authorUid) return null;

            const userDoc = await admin.firestore().collection('users').doc(assigneeUid).get();
            const fcmToken = userDoc.data()?.fcmToken;

            if (!fcmToken) return null;

            const message = {
                notification: {
                    title: `Nuevo comentario en ${taskData.title}`,
                    body: `${authorName}: ${commentBody.substring(0, 50)}${commentBody.length > 50 ? '...' : ''}`,
                },
                token: fcmToken,
                android: {
                    notification: {
                        channelId: 'prosync_notifications',
                        icon: 'ic_notification'
                    }
                }
            };

            return await admin.messaging().send(message);
        } catch (error) {
            console.error('Error enviando notificación de comentario:', error);
            return null;
        }
    });
