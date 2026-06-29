package com.prosync.android.ui.workspaces

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
import com.prosync.android.data.models.DEPARTMENTS
import com.prosync.android.data.models.Workspace
import com.prosync.android.data.repository.FirebaseRepository
import com.prosync.android.databinding.FragmentWorkspacesBinding
import com.prosync.android.databinding.ItemWorkspaceBinding
import com.prosync.android.utils.setupNotificationBell
import com.prosync.android.utils.setupToolbar
import com.prosync.android.utils.viewScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch

class WorkspacesViewModel : ViewModel() {
    private val repo = FirebaseRepository()
    val workspaces = repo.getWorkspacesFlow()

    private val _userRole = MutableStateFlow("collaborator")
    val userRole: StateFlow<String> = _userRole

    init {
        viewModelScope.launch {
            _userRole.value = repo.getCurrentUser()?.role ?: "collaborator"
        }
    }

    fun createWorkspace(name: String, description: String, department: String,
                        onResult: (Boolean, String) -> Unit) {
        viewModelScope.launch {
            val result = repo.createWorkspace(name, description, department)
            if (result.isSuccess) {
                onResult(true, "Workspace creado")
            }
            else onResult(false, result.exceptionOrNull()?.message ?: "Error")
        }
    }

    fun inviteMember(workspaceId: String, workspaceName: String, email: String, onResult: (Boolean, String) -> Unit) {
        viewModelScope.launch {
            val result = repo.inviteCollaborator(workspaceId, workspaceName, email)
            if (result.isSuccess) onResult(true, "Invitación enviada ✅")
            else onResult(false, result.exceptionOrNull()?.message ?: "Error")
        }
    }
}

class WorkspacesAdapter(
    private var list: List<Workspace>,
    private var userRole: String = "collaborator",
    private val onInvite: (Workspace) -> Unit,
    private val onClick: (Workspace) -> Unit
) : RecyclerView.Adapter<WorkspacesAdapter.VH>() {

    class VH(val binding: ItemWorkspaceBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        VH(ItemWorkspaceBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun getItemCount() = list.size

    override fun onBindViewHolder(holder: VH, position: Int) {
        val ws = list[position]
        holder.binding.tvWorkspaceName.text = ws.name
        holder.binding.tvWorkspaceDept.text = ws.department
        holder.binding.tvWorkspaceDesc.text = ws.description.ifEmpty { "Sin descripción" }
        holder.binding.tvMembersCount.text  = holder.itemView.context.getString(R.string.members_count, ws.memberUids.size)

        // Solo Managers pueden invitar directamente desde la lista
        holder.binding.btnInviteMember.visibility = if (userRole == "manager") View.VISIBLE else View.GONE

        holder.itemView.setOnClickListener { onClick(ws) }

        holder.binding.btnInviteMember.setOnClickListener { onInvite(ws) }

        holder.binding.btnShareWorkspace.setOnClickListener {
            val shareIntent = android.content.Intent(android.content.Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(android.content.Intent.EXTRA_SUBJECT, "Únete al workspace: ${ws.name}")
                putExtra(android.content.Intent.EXTRA_TEXT,
                    "Te invito al workspace '${ws.name}' en ProSync.\n\nID: ${ws.id}\n\nDescarga ProSync y usa este código para unirte.")
            }
            holder.itemView.context.startActivity(
                android.content.Intent.createChooser(shareIntent, "Compartir workspace")
            )
        }
    }

    fun update(newList: List<Workspace>, newRole: String = userRole) {
        list = newList
        userRole = newRole
        notifyDataSetChanged()
    }
}

class WorkspacesFragment : Fragment() {

    private var _binding: FragmentWorkspacesBinding? = null
    private val binding get() = _binding!!
    private val viewModel: WorkspacesViewModel by viewModels()
    private lateinit var adapter: WorkspacesAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentWorkspacesBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupToolbar(binding.toolbar, showBack = false)
        setupNotificationBell(binding.toolbar)

        adapter = WorkspacesAdapter(
            list     = emptyList(),
            onInvite = { ws -> showAddMemberDialog(ws) },
            onClick  = { ws ->
                val action = WorkspacesFragmentDirections.actionWorkspacesToBoard(ws.id, ws.name)
                findNavController().navigate(action)
            }
        )
        binding.rvWorkspaces.layoutManager = LinearLayoutManager(requireContext())
        binding.rvWorkspaces.adapter = adapter

        // Observar rol para UI (FAB y botones de invitación)
        viewModel.userRole.onEach { role ->
            binding.fabNewWorkspace.visibility = if (role == "manager") View.VISIBLE else View.GONE
            adapter.update(emptyList(), role)
        }.launchIn(viewScope)

        viewModel.workspaces
            .onEach { list ->
                binding.progressBar.visibility = View.GONE
                if (list.isEmpty()) {
                    binding.tvEmpty.visibility      = View.VISIBLE
                    binding.rvWorkspaces.visibility = View.GONE
                } else {
                    binding.tvEmpty.visibility      = View.GONE
                    binding.rvWorkspaces.visibility = View.VISIBLE
                    adapter.update(list, viewModel.userRole.value)
                }
            }
            .catch { e ->
                binding.progressBar.visibility = View.GONE
                Toast.makeText(requireContext(), "Error: ${e.message}", Toast.LENGTH_LONG).show()
            }
            .launchIn(viewScope)

        binding.fabNewWorkspace.setOnClickListener { showCreateDialog() }
    }

    private fun showCreateDialog() {
        val dialogView  = layoutInflater.inflate(R.layout.dialog_create_workspace, null)
        val etName      = dialogView.findViewById<TextInputEditText>(R.id.etWorkspaceName)
        val etDesc      = dialogView.findViewById<TextInputEditText>(R.id.etWorkspaceDesc)
        val spinnerDept = dialogView.findViewById<MaterialAutoCompleteTextView>(R.id.spinnerDept)

        spinnerDept.setAdapter(ArrayAdapter(requireContext(),
            android.R.layout.simple_dropdown_item_1line, DEPARTMENTS))
        spinnerDept.setText(DEPARTMENTS[0], false)

        MaterialAlertDialogBuilder(requireContext(), R.style.ProSyncDialog)
            .setTitle("Nuevo Workspace")
            .setView(dialogView)
            .setPositiveButton("Crear") { _, _ ->
                val name = etName.text.toString().trim()
                val desc = etDesc.text.toString().trim()
                val dept = spinnerDept.text.toString()
                if (name.isEmpty()) {
                    Toast.makeText(requireContext(), "El nombre es obligatorio", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                viewModel.createWorkspace(name, desc, dept) { ok, msg ->
                    if (ok) {
                        com.prosync.android.utils.LocalNotificationHelper.showSimpleNotification(
                            requireContext(),
                            "¡Nuevo Proyecto Creado!",
                            "Has creado el workspace '$name' exitosamente."
                        )
                    }
                    Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun showAddMemberDialog(workspace: Workspace) {
        val dialogView   = layoutInflater.inflate(R.layout.dialog_add_member, null)
        val etEmail      = dialogView.findViewById<TextInputEditText>(R.id.etMemberEmail)
        val tlRole       = dialogView.findViewById<View>(R.id.tlRole)

        // Ocultamos el campo de rol ya que en este flujo directo siempre es Colaborador
        tlRole?.visibility = View.GONE

        MaterialAlertDialogBuilder(requireContext(), R.style.ProSyncDialog)
            .setTitle("Invitar a ${workspace.name}")
            .setMessage("Se enviará una invitación por correo para unirse como colaborador.")
            .setView(dialogView)
            .setPositiveButton("Invitar") { _, _ ->
                val email = etEmail.text.toString().trim()
                if (email.isEmpty()) {
                    Toast.makeText(requireContext(), "Ingresa un correo válido", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                
                viewModel.inviteMember(workspace.id, workspace.name, email) { ok, msg ->
                    Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    override fun onDestroyView() { super.onDestroyView(); _binding = null }
}
