package com.prosync.android.ui.main

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.textfield.MaterialAutoCompleteTextView
import com.google.android.material.textfield.TextInputEditText
import com.prosync.android.R
import com.prosync.android.data.models.User
import com.prosync.android.data.models.Workspace
import com.prosync.android.data.repository.FirebaseRepository
import com.prosync.android.databinding.FragmentManagerHomeBinding
import com.prosync.android.databinding.ItemMemberBinding
import com.prosync.android.utils.setupNotificationBell
import com.prosync.android.utils.setupToolbar
import com.prosync.android.utils.viewScope
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch

// ─── ViewModel ────────────────────────────────────────────────────────────────
class ManagerHomeViewModel : ViewModel() {
    private val repo = FirebaseRepository()

    val collaboratorsFlow = repo.getMyCollaboratorsFlow()
    val workspacesFlow    = repo.getWorkspacesFlow()

    fun inviteCollaborator(
        workspaceId: String,
        workspaceName: String,
        email: String,
        onResult: (Boolean, String) -> Unit
    ) = viewModelScope.launch {
        val r = repo.inviteCollaborator(workspaceId, workspaceName, email)
        onResult(r.isSuccess,
            if (r.isSuccess) "Invitación enviada ✅"
            else r.exceptionOrNull()?.message ?: "Error")
    }
}

// ─── Adapter miembros ─────────────────────────────────────────────────────────
class MembersAdapter(private var list: List<User>) :
    RecyclerView.Adapter<MembersAdapter.VH>() {

    inner class VH(val binding: ItemMemberBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        VH(ItemMemberBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun getItemCount() = list.size

    override fun onBindViewHolder(holder: VH, position: Int) {
        val user = list[position]
        val initial = user.fullName.firstOrNull()?.uppercase() ?: "?"
        holder.binding.tvInitial.text     = initial
        holder.binding.tvMemberName.text  = user.fullName.ifEmpty { "Sin nombre" }
        holder.binding.tvMemberEmail.text = user.email
        holder.binding.tvMemberRole.text  = "🤝 Colaborador"
    }

    fun update(newList: List<User>) { list = newList; notifyDataSetChanged() }
}

// ─── Fragment ─────────────────────────────────────────────────────────────────
class ManagerHomeFragment : Fragment() {

    private var _binding: FragmentManagerHomeBinding? = null
    private val binding get() = _binding!!
    private val viewModel: ManagerHomeViewModel by viewModels()
    private lateinit var membersAdapter: MembersAdapter
    private var myWorkspaces: List<Workspace> = emptyList()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentManagerHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupToolbar(binding.toolbar, showBack = false)
        setupNotificationBell(binding.toolbar)

        membersAdapter = MembersAdapter(emptyList())
        binding.rvMembers.layoutManager = LinearLayoutManager(requireContext())
        binding.rvMembers.adapter = membersAdapter

        // Observar colaboradores
        viewModel.collaboratorsFlow.onEach { members ->
            if (members.isEmpty()) {
                binding.tvNoMembers.visibility = View.VISIBLE
                binding.rvMembers.visibility   = View.GONE
            } else {
                binding.tvNoMembers.visibility = View.GONE
                binding.rvMembers.visibility   = View.VISIBLE
                membersAdapter.update(members)
            }
        }.launchIn(viewScope)

        // Guardar workspaces para el diálogo
        viewModel.workspacesFlow.onEach { workspaces ->
            myWorkspaces = workspaces
        }.launchIn(viewScope)

        // Botón invitar
        binding.cardInvite.setOnClickListener {
            showInviteDialog()
        }

        // Botón ver miembros — scroll a la lista
        binding.cardMembers.setOnClickListener {
            binding.rvMembers.smoothScrollToPosition(0)
        }

        // Botón nuevo workspace
        binding.cardNewWorkspace.setOnClickListener {
            findNavController().navigate(R.id.workspacesFragment)
        }
    }

    private fun showInviteDialog() {
        if (myWorkspaces.isEmpty()) {
            Toast.makeText(requireContext(),
                "Primero crea un workspace", Toast.LENGTH_SHORT).show()
            return
        }

        val dialogView      = layoutInflater.inflate(R.layout.dialog_invite_member, null)
        val etEmail         = dialogView.findViewById<TextInputEditText>(R.id.etInviteEmail)
        val spinnerWorkspace = dialogView.findViewById<MaterialAutoCompleteTextView>(R.id.spinnerWorkspace)

        val wsNames = myWorkspaces.map { it.name }
        spinnerWorkspace.setAdapter(ArrayAdapter(requireContext(),
            android.R.layout.simple_dropdown_item_1line, wsNames))
        spinnerWorkspace.setText(wsNames.first(), false)

        MaterialAlertDialogBuilder(requireContext(), R.style.ProSyncDialog)
            .setTitle("📨 Invitar colaborador")
            .setView(dialogView)
            .setPositiveButton("Enviar invitación") { _, _ ->
                val email = etEmail.text.toString().trim()
                if (email.isEmpty()) {
                    Toast.makeText(requireContext(),
                        "Ingresa un correo", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                val wsIndex = wsNames.indexOf(spinnerWorkspace.text.toString())
                val ws      = myWorkspaces[wsIndex.coerceAtLeast(0)]

                viewModel.inviteCollaborator(ws.id, ws.name, email) { ok, msg ->
                    Toast.makeText(requireContext(), msg, Toast.LENGTH_LONG).show()
                }
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    override fun onDestroyView() { super.onDestroyView(); _binding = null }
}
