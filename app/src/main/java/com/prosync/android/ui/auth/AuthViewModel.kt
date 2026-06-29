package com.prosync.android.ui.auth

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.firestore.FirebaseFirestore
import com.prosync.android.data.models.User
import com.prosync.android.data.repository.FirebaseRepository
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

sealed class AuthState {
    object Idle    : AuthState()
    object Loading : AuthState()
    data class Success(val user: User) : AuthState()
    data class Error(val message: String) : AuthState()
}

class AuthViewModel : ViewModel() {

    private val repo = FirebaseRepository()

    private val _authState = MutableLiveData<AuthState>(AuthState.Idle)
    val authState: LiveData<AuthState> = _authState

    fun login(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) {
            _authState.value = AuthState.Error("Completa todos los campos")
            return
        }
        _authState.value = AuthState.Loading
        viewModelScope.launch {
            val result = repo.login(email.trim(), password)
            _authState.value = if (result.isSuccess)
                AuthState.Success(result.getOrThrow())
            else
                AuthState.Error(result.exceptionOrNull()?.message ?: "Error al iniciar sesión")
        }
    }

    fun register(email: String, password: String, fullName: String, confirmPassword: String, role: String = "collaborator") {
        when {
            email.isBlank() || password.isBlank() || fullName.isBlank() ->
                _authState.value = AuthState.Error("Completa todos los campos")
            password != confirmPassword ->
                _authState.value = AuthState.Error("Las contraseñas no coinciden")
            password.length < 6 ->
                _authState.value = AuthState.Error("La contraseña debe tener al menos 6 caracteres")
            else -> {
                _authState.value = AuthState.Loading
                viewModelScope.launch {
                    val result = repo.register(email.trim(), password, fullName.trim(), role)
                    _authState.value = if (result.isSuccess)
                        AuthState.Success(result.getOrThrow())
                    else
                        AuthState.Error(result.exceptionOrNull()?.message ?: "Error al registrarse")
                }
            }
        }
    }

    fun loginWithGoogle(idToken: String, onResult: (Boolean, String) -> Unit) {
        _authState.value = AuthState.Loading
        viewModelScope.launch {
            try {
                val credential = GoogleAuthProvider.getCredential(idToken, null)
                val result = FirebaseAuth.getInstance()
                    .signInWithCredential(credential).await()
                val uid   = result.user!!.uid
                val email = result.user!!.email ?: ""
                val name  = result.user!!.displayName ?: ""
                val db    = FirebaseFirestore.getInstance()
                val snap  = db.collection("users").document(uid).get().await()
                if (!snap.exists()) {
                    db.collection("users").document(uid).set(
                        User(uid = uid, email = email, fullName = name)
                    ).await()
                }
                val user = snap.toObject(User::class.java)
                    ?: User(uid = uid, email = email, fullName = name)
                _authState.value = AuthState.Success(user)
                onResult(true, "")
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.message ?: "Error con Google")
                onResult(false, e.message ?: "Error")
            }
        }
    }

    fun resetState() { _authState.value = AuthState.Idle }
}
