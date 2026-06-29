package com.prosync.android.ui.profile

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bumptech.glide.Glide
import com.prosync.android.R
import com.prosync.android.data.models.User
import com.prosync.android.data.repository.FirebaseRepository
import com.prosync.android.databinding.FragmentProfileBinding
import com.prosync.android.ui.auth.AuthActivity
import com.prosync.android.utils.setupNotificationBell
import com.prosync.android.utils.setupToolbar
import com.prosync.android.utils.viewScope
import kotlinx.coroutines.launch

class ProfileViewModel : ViewModel() {
    private val repo = FirebaseRepository()
    suspend fun getUser(): User? = repo.getCurrentUser()
    fun updateProfile(fullName: String, photoUrl: String, onResult: (Boolean, String) -> Unit) =
        viewModelScope.launch {
            val r = repo.updateProfile(fullName, photoUrl)
            onResult(r.isSuccess,
                if (r.isSuccess) "Perfil actualizado ✅"
                else r.exceptionOrNull()?.message ?: "Error")
        }
    fun logout() = repo.logout()
}

class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!
    private val viewModel: ProfileViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupToolbar(binding.toolbar, showBack = false)
        setupNotificationBell(binding.toolbar)

        viewScope.launch {
            val user = viewModel.getUser()
            user?.let {
                binding.etFullName.setText(it.fullName)
                binding.tvUserName.text = it.fullName
                binding.tvEmail.text    = it.email
                binding.tvRole.text     = if (it.role == "manager") "👑 Manager" else "🤝 Colaborador"

                if (it.photoUrl.isNotEmpty()) loadPhoto(it.photoUrl)
            }

            // Cargar stats de tareas
            val repo  = FirebaseRepository()
            repo.getAllMyTasksFlow().collect { list ->
                binding.tvStatTasks.text   = list.size.toString()
                binding.tvStatDone.text    = list.count { it.status == "done" }.toString()
                binding.tvStatPending.text = list.count { it.status == "pending" }.toString()
            }
        }

        binding.btnSave.setOnClickListener {
            val name     = binding.etFullName.text.toString().trim()
            if (name.isEmpty()) {
                Toast.makeText(requireContext(),
                    "El nombre no puede estar vacío", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            // En el nuevo layout no hay etPhotoUrl, así que pasamos vacío o mantenemos la actual
            viewModel.updateProfile(name, "") { _, msg ->
                Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show()
            }
        }

        binding.btnLogout.setOnClickListener {
            viewModel.logout()
            startActivity(Intent(requireContext(), AuthActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            })
        }
    }

    private fun loadPhoto(url: String) {
        Glide.with(this)
            .load(url)
            .placeholder(R.drawable.ic_prosync_logo)
            .circleCrop()
            .into(binding.ivAvatar)
    }

    override fun onDestroyView() { super.onDestroyView(); _binding = null }
}
