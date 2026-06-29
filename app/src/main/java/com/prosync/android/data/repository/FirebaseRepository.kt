package com.prosync.android.data.repository

import com.google.firebase.Timestamp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.prosync.android.data.models.*
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import java.util.Date

class FirebaseRepository {

    private val auth = FirebaseAuth.getInstance()
    private val db   = FirebaseFirestore.getInstance()

    private val usersCol         = db.collection("users")
    private val workspacesCol    = db.collection("workspaces")
    private val tasksCol         = db.collection("tasks")
    private val commentsCol      = db.collection("task_comments")
    private val notificationsCol = db.collection("notifications")

    suspend fun getFcmToken(uid: String): String? {
        return try {
            val snap = usersCol.document(uid).get().await()
            snap.getString("fcmToken")
        } catch (e: Exception) {
            null
        }
    }

    val currentUid   get() = auth.currentUser?.uid ?: ""
    val currentEmail get() = auth.currentUser?.email ?: ""

    suspend fun register(
        email: String,
        password: String,
        fullName: String,
        role: String = "collaborator"
    ): Result<User> {
        return try {
            val result = auth.createUserWithEmailAndPassword(email, password).await()
            val uid    = result.user!!.uid
            val user   = User(uid = uid, email = email, fullName = fullName, role = role)
            usersCol.document(uid).set(user).await()
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun login(email: String, password: String): Result<User> {
        return try {
            val result = auth.signInWithEmailAndPassword(email, password).await()
            val uid = result.user!!.uid
            val snap = usersCol.document(uid).get().await()
            val user = snap.toObject(User::class.java) ?: User(uid = uid, email = email)
            if (user.blocked) {
                auth.signOut()
                return Result.failure(Exception("Tu cuenta ha sido bloqueada."))
            }
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun logout() = auth.signOut()

    fun isLoggedIn() = auth.currentUser != null

    suspend fun getCurrentUser(): User? {
        val uid = currentUid.ifEmpty { return null }
        return usersCol.document(uid).get().await().toObject(User::class.java)
    }

    suspend fun updateProfile(fullName: String, photoUrl: String): Result<Unit> {
        return try {
            usersCol.document(currentUid).update(mapOf(
                "fullName" to fullName,
                "photoUrl" to photoUrl
            )).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getWorkspacesFlow(): Flow<List<Workspace>> = callbackFlow {
        val uid = currentUid
        if (uid.isEmpty()) {
            trySend(emptyList())
            return@callbackFlow
        }
        
        val listener = workspacesCol
            .whereArrayContains("memberUids", uid)
            .orderBy("createdAt", Query.Direction.ASCENDING)
            .addSnapshotListener { snap, error ->
                if (error != null) { 
                    close(error)
                    return@addSnapshotListener 
                }
                val list = snap?.documents?.mapNotNull { it.toObject(Workspace::class.java) } ?: emptyList()
                trySend(list)
            }
        awaitClose { listener.remove() }
    }

    suspend fun createWorkspace(name: String, description: String, department: String): Result<Workspace> {
        return try {
            val uid   = currentUid
            val email = currentEmail
            val ws = Workspace(
                name        = name,
                description = description,
                department  = department,
                ownerUid    = uid,
                ownerEmail  = email,
                memberUids  = listOf(uid)
            )
            val ref = workspacesCol.document()
            ref.set(ws).await()

            // Registrar al dueño como manager en workspace_members
            val member = mapOf(
                "workspaceId" to ref.id,
                "uid"         to uid,
                "email"       to email,
                "fullName"    to (getCurrentUser()?.fullName ?: ""),
                "role"        to "manager"
            )
            db.collection("workspace_members").document("${ref.id}_${uid}")
                .set(member).await()

            Result.success(ws.copy(id = ref.id))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun addMemberToWorkspace(workspaceId: String, memberEmail: String): Result<Unit> {
        return addMemberWithRole(workspaceId, memberEmail, "collaborator")
    }

    suspend fun getMyRoleInWorkspace(workspaceId: String): String {
        return try {
            val snap = db.collection("workspace_members")
                .whereEqualTo("workspaceId", workspaceId)
                .whereEqualTo("uid", currentUid)
                .get().await()
            snap.documents.firstOrNull()?.getString("role") ?: "collaborator"
        } catch (e: Exception) {
            // Si no existe colección de miembros, el dueño es manager
            val ws = workspacesCol.document(workspaceId).get().await()
                .toObject(Workspace::class.java)
            if (ws?.ownerUid == currentUid) "manager" else "collaborator"
        }
    }

    suspend fun addMemberWithRole(
        workspaceId: String,
        memberEmail: String,
        role: String
    ): Result<Unit> {
        return try {
            // Verificar permisos: Solo un manager puede agregar miembros
            val myRole = getMyRoleInWorkspace(workspaceId)
            if (myRole != "manager") {
                return Result.failure(Exception("No tienes permiso para agregar miembros a este workspace"))
            }

            val managerUser = getCurrentUser()
            val wsSnap = workspacesCol.document(workspaceId).get().await()
            val wsName = wsSnap.getString("name") ?: "Proyecto"

            val snap = usersCol.whereEqualTo("email", memberEmail).get().await()
            if (snap.isEmpty) return Result.failure(Exception("Usuario no encontrado"))
            val memberDoc = snap.documents.first()
            val memberUid = memberDoc.id

            // Agregar a memberUids del workspace
            workspacesCol.document(workspaceId)
                .update("memberUids", FieldValue.arrayUnion(memberUid)).await()

            // Guardar rol en subcolección con datos extendidos para la Cloud Function
            val memberMap = mapOf(
                "workspaceId"   to workspaceId,
                "workspaceName" to wsName,
                "uid"           to memberUid,
                "email"         to memberEmail,
                "fullName"      to (memberDoc.getString("fullName") ?: ""),
                "role"          to role,
                "addedByName"   to (managerUser?.fullName ?: "Un Manager"),
                "createdAt"     to FieldValue.serverTimestamp()
            )
            db.collection("workspace_members").document("${workspaceId}_${memberUid}")
                .set(memberMap).await()

            createNotification(memberUid, "WORKSPACE_ADDED",
                "Te agregaron al workspace: $wsName como $role", "")

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getWorkspaceMembers(workspaceId: String): Result<List<User>> {
        return try {
            val ws = workspacesCol.document(workspaceId).get().await().toObject(Workspace::class.java)
                ?: return Result.success(emptyList())
            val members = ws.memberUids.mapNotNull { uid ->
                usersCol.document(uid).get().await().toObject(User::class.java)
            }
            Result.success(members)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getTasksFlow(workspaceId: String): Flow<List<Task>> = callbackFlow {
        val listener = tasksCol
            .whereEqualTo("workspaceId", workspaceId)
            .orderBy("createdAt", Query.Direction.ASCENDING)
            .addSnapshotListener { snap, error ->
                if (error != null) { close(error); return@addSnapshotListener }
                val list = snap?.documents?.mapNotNull { it.toObject(Task::class.java) } ?: emptyList()
                trySend(list)
            }
        awaitClose { listener.remove() }
    }

    fun getAllMyTasksFlow(): Flow<List<Task>> = callbackFlow {
        val uid = currentUid
        if (uid.isEmpty()) { trySend(emptyList()); return@callbackFlow }

        val listener = tasksCol
            .whereEqualTo("assigneeUid", uid)
            .orderBy("createdAt", Query.Direction.ASCENDING)
            .addSnapshotListener { snap, error ->
                if (error != null) { close(error); return@addSnapshotListener }
                val list = snap?.documents?.mapNotNull { it.toObject(Task::class.java) } ?: emptyList()
                trySend(list)
            }
        awaitClose { listener.remove() }
    }

    suspend fun createTask(
        workspaceId: String,
        title: String,
        description: String,
        status: String,
        priority: String,
        assigneeUid: String,
        assigneeEmail: String,
        dueDate: Date?,
        labels: List<String>
    ): Result<Task> {
        return try {
            // Verificar permisos: Solo un manager puede crear tareas
            val role = getMyRoleInWorkspace(workspaceId)
            if (role != "manager") {
                return Result.failure(Exception("No tienes permiso para crear tareas en este workspace"))
            }

            val task = Task(
                workspaceId    = workspaceId,
                title          = title,
                description    = description,
                status         = status,
                priority       = priority,
                assigneeUid    = assigneeUid,
                assigneeEmail  = assigneeEmail,
                createdByUid   = currentUid,
                createdByEmail = currentEmail,
                dueDate        = dueDate?.let { Timestamp(it) },
                labels         = labels
            )
            val ref = tasksCol.document()
            ref.set(task).await()

            addTaskHistory(ref.id, "CREATED", "", title)

            if (assigneeUid.isNotEmpty() && assigneeUid != currentUid) {
                createNotification(assigneeUid, "TASK_ASSIGNED",
                    "Te asignaron la tarea: $title", ref.id)
            }
            Result.success(task.copy(id = ref.id))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateTaskStatus(taskId: String, newStatus: String): Result<Unit> {
        return try {
            val task = tasksCol.document(taskId).get().await().toObject(Task::class.java)
            tasksCol.document(taskId).update(mapOf(
                "status"    to newStatus,
                "updatedAt" to FieldValue.serverTimestamp()
            )).await()

            addTaskHistory(taskId, "STATUS_CHANGED",
                TaskStatus.fromKey(task?.status ?: "").label,
                TaskStatus.fromKey(newStatus).label)

            val label = TaskStatus.fromKey(newStatus).label
            task?.let { t ->
                listOf(t.assigneeUid, t.createdByUid)
                    .filter { it.isNotEmpty() && it != currentUid }
                    .distinct()
                    .forEach { uid ->
                        createNotification(uid, "TASK_STATUS",
                            "La tarea \"${t.title}\" cambió a $label", taskId)
                    }
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteTask(taskId: String): Result<Unit> {
        return try {
            // Obtener la tarea para conocer su workspaceId
            val taskSnap = tasksCol.document(taskId).get().await()
            val workspaceId = taskSnap.getString("workspaceId") ?: return Result.failure(Exception("Tarea no encontrada"))

            // Verificar permisos
            val role = getMyRoleInWorkspace(workspaceId)
            if (role != "manager") {
                return Result.failure(Exception("No tienes permiso para eliminar esta tarea"))
            }

            tasksCol.document(taskId).delete().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getCommentsFlow(taskId: String): Flow<List<TaskComment>> = callbackFlow {
        val listener = commentsCol
            .whereEqualTo("taskId", taskId)
            .orderBy("createdAt", Query.Direction.ASCENDING)
            .addSnapshotListener { snap, error ->
                if (error != null) { close(error); return@addSnapshotListener }
                val list = snap?.documents?.mapNotNull { it.toObject(TaskComment::class.java) } ?: emptyList()
                trySend(list)
            }
        awaitClose { listener.remove() }
    }

    suspend fun addComment(taskId: String, body: String): Result<Unit> {
        return try {
            val user = getCurrentUser()
            val comment = TaskComment(
                taskId      = taskId,
                authorUid   = currentUid,
                authorEmail = currentEmail,
                authorName  = user?.fullName ?: currentEmail,
                body        = body
            )
            commentsCol.document().set(comment).await()
            addTaskHistory(taskId, "COMMENTED", "", body.take(50))

            val task = tasksCol.document(taskId).get().await().toObject(Task::class.java)
            task?.let { t ->
                listOf(t.assigneeUid, t.createdByUid)
                    .filter { it.isNotEmpty() && it != currentUid }
                    .distinct()
                    .forEach { uid ->
                        createNotification(uid, "TASK_COMMENT",
                            "Nuevo comentario en: ${t.title}", taskId)
                    }
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getNotificationsFlow(filterByArea: String? = null): Flow<List<Notification>> = callbackFlow {
        val listener = notificationsCol
            .whereEqualTo("userUid", currentUid)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .limit(50)
            .addSnapshotListener { snap, error ->
                if (error != null) { close(error); return@addSnapshotListener }
                var list = snap?.documents?.mapNotNull {
                    it.toObject(Notification::class.java)
                } ?: emptyList()

                // Filtrar por área si se especifica
                if (!filterByArea.isNullOrEmpty()) {
                    list = list.filter { it.type.contains(filterByArea, ignoreCase = true) }
                }
                trySend(list)
            }
        awaitClose { listener.remove() }
    }

    suspend fun markNotificationRead(notificationId: String): Result<Unit> {
        return try {
            notificationsCol.document(notificationId).update("isRead", true).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun markAllNotificationsRead(): Result<Unit> {
        return try {
            val uid = currentUid.ifEmpty { return Result.failure(Exception("Usuario no autenticado")) }
            val snap = notificationsCol
                .whereEqualTo("userUid", uid)
                .whereEqualTo("isRead", false)
                .get().await()
            if (!snap.isEmpty) {
                val batch = db.batch()
                snap.documents.forEach { batch.update(it.reference, "isRead", true) }
                batch.commit().await()
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun loginWithGoogle(idToken: String): Result<User> {
        return try {
            val credential = com.google.firebase.auth.GoogleAuthProvider.getCredential(idToken, null)
            val result = auth.signInWithCredential(credential).await()
            val firebaseUser = result.user!!
            val snap = usersCol.document(firebaseUser.uid).get().await()
            val user = if (snap.exists()) {
                snap.toObject(User::class.java)!!
            } else {
                val newUser = User(
                    uid = firebaseUser.uid,
                    email = firebaseUser.email ?: "",
                    fullName = firebaseUser.displayName ?: ""
                )
                usersCol.document(firebaseUser.uid).set(newUser).await()
                newUser
            }
            if (user.blocked) {
                auth.signOut()
                return Result.failure(Exception("Tu cuenta ha sido bloqueada."))
            }
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private suspend fun createNotification(
        userUid: String, type: String, message: String, taskId: String
    ) {
        val notif = Notification(
            userUid = userUid,
            type    = type,
            message = message,
            taskId  = taskId
        )
        notificationsCol.document().set(notif).await()
        
        // Intentar enviar notificación remota vía FCM
        val token = getFcmToken(userUid)
        if (!token.isNullOrEmpty()) {
            com.prosync.android.utils.FcmSender.sendNotification(token, "ProSync", message)
        }
    }

    private val historyCol = db.collection("task_history")

    suspend fun addTaskHistory(
        taskId: String, action: String, oldValue: String, newValue: String
    ) {
        val history = TaskHistory(
            taskId     = taskId,
            userUid    = currentUid,
            userEmail  = currentEmail,
            action     = action,
            oldValue   = oldValue,
            newValue   = newValue
        )
        historyCol.document().set(history).await()
    }

    // Obtener todos los colaboradores del manager
    fun getMyCollaboratorsFlow(): Flow<List<User>> = callbackFlow {
        val listener = usersCol
            .whereEqualTo("invitedBy", currentUid)
            .addSnapshotListener { snap, error ->
                if (error != null) { close(error); return@addSnapshotListener }
                val list = snap?.documents?.mapNotNull {
                    it.toObject(User::class.java)
                } ?: emptyList()
                trySend(list)
            }
        awaitClose { listener.remove() }
    }

    // Invitar colaborador a workspace
    suspend fun inviteCollaborator(
        workspaceId: String,
        workspaceName: String,
        collaboratorEmail: String
    ): Result<Unit> {
        return try {
            val managerUser = getCurrentUser()
            val snap = usersCol.whereEqualTo("email", collaboratorEmail).get().await()
            if (snap.isEmpty) return Result.failure(Exception("No existe usuario con ese correo"))

            val collaboratorDoc = snap.documents.first()
            val collaboratorUid = collaboratorDoc.id

            // Agregar al workspace
            workspacesCol.document(workspaceId)
                .update("memberUids", FieldValue.arrayUnion(collaboratorUid)).await()

            // Marcar como invitado por este manager
            usersCol.document(collaboratorUid)
                .update("invitedBy", currentUid).await()

            // Guardar rol con datos extendidos para la Cloud Function
            val memberMap = mapOf(
                "workspaceId"   to workspaceId,
                "workspaceName" to workspaceName,
                "uid"           to collaboratorUid,
                "email"         to collaboratorEmail,
                "fullName"      to (collaboratorDoc.getString("fullName") ?: ""),
                "role"          to "collaborator",
                "addedByName"   to (managerUser?.fullName ?: "Un Manager"),
                "createdAt"     to FieldValue.serverTimestamp()
            )
            db.collection("workspace_members")
                .document("${workspaceId}_${collaboratorUid}")
                .set(memberMap).await()

            // Notificación al colaborador
            createNotification(
                userUid  = collaboratorUid,
                type     = "WORKSPACE_INVITE",
                message  = "👑 $workspaceName: Te invitaron como colaborador",
                taskId   = workspaceId
            )

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getTaskHistoryFlow(taskId: String): Flow<List<TaskHistory>> = callbackFlow {
        val listener = historyCol
            .whereEqualTo("taskId", taskId)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snap, error ->
                if (error != null) { close(error); return@addSnapshotListener }
                val list = snap?.documents?.mapNotNull {
                    it.toObject(TaskHistory::class.java)
                } ?: emptyList()
                trySend(list)
            }
        awaitClose { listener.remove() }
    }
}
