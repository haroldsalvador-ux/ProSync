package com.prosync.android.ui.board

import android.app.DatePickerDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.chip.Chip
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.textfield.MaterialAutoCompleteTextView
import com.google.android.material.textfield.TextInputEditText
import com.prosync.android.R
import com.prosync.android.data.models.*
import com.prosync.android.data.repository.FirebaseRepository
import com.prosync.android.databinding.FragmentBoardBinding
import com.prosync.android.databinding.ItemTaskCardBinding
import com.prosync.android.utils.setupNotificationBell
import com.prosync.android.utils.setupToolbar
import com.prosync.android.utils.viewScope
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class BoardViewModel(private val workspaceId: String) : ViewModel() {
    private val repo = FirebaseRepository()
    val tasksFlow    = repo.getTasksFlow(workspaceId)
    val currentUid   get() = repo.currentUid

    private var _myRole = "collaborator"
    val isManager get() = _myRole == "manager"

    fun loadMyRole(onLoaded: () -> Unit) = viewModelScope.launch {
        _myRole = repo.getMyRoleInWorkspace(workspaceId)
        onLoaded()
    }

    // Filtro activo
    var activeFilter = "all" // all | mine | pending | high | overdue

    fun filterTasks(tasks: List<Task>): Map<String, List<Task>> {
        val now = Date()
        val filtered = when (activeFilter) {
            "mine"    -> tasks.filter { it.assigneeUid == currentUid }
            "pending" -> tasks.filter { it.status == "pending" }
            "high"    -> tasks.filter { it.priority == "high" }
            "overdue" -> tasks.filter {
                it.dueDate != null &&
                it.dueDate.toDate().before(now) &&
                it.status != "done"
            }
            else -> tasks
        }
        return filtered.groupBy { it.status }
    }

    fun createTask(
        title: String, description: String, status: String, priority: String,
        assigneeUid: String, assigneeEmail: String, dueDate: Date?, labels: List<String>,
        onResult: (Boolean, String) -> Unit
    ) = viewModelScope.launch {
        val r = repo.createTask(workspaceId, title, description, status, priority,
            assigneeUid, assigneeEmail, dueDate, labels)
        onResult(r.isSuccess, if (r.isSuccess) "Tarea creada" else r.exceptionOrNull()?.message ?: "Error")
    }

    fun updateStatus(taskId: String, newStatus: String) = viewModelScope.launch {
        repo.updateTaskStatus(taskId, newStatus)
    }

    fun deleteTask(taskId: String, onResult: (Boolean) -> Unit) = viewModelScope.launch {
        val r = repo.deleteTask(taskId)
        onResult(r.isSuccess)
    }

    suspend fun getMembers() = repo.getWorkspaceMembers(workspaceId).getOrNull() ?: emptyList()

    class Factory(private val workspaceId: String) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>) = BoardViewModel(workspaceId) as T
    }
}

class TaskCardAdapter(
    private var tasks: List<Task>,
    private var isManager: Boolean = false,
    private val onStatusChange: (Task, String) -> Unit,
    private val onDelete: (Task) -> Unit,
    private val onClick: (Task) -> Unit
) : RecyclerView.Adapter<TaskCardAdapter.VH>() {

    inner class VH(val binding: ItemTaskCardBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        VH(ItemTaskCardBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun getItemCount() = tasks.size

    override fun onBindViewHolder(holder: VH, position: Int) {
        val task = tasks[position]
        val b    = holder.binding

        b.tvTaskTitle.text = task.title
        b.tvAssignee.text  = task.assigneeEmail.ifEmpty { "Sin asignado" }
        b.tvPriority.text  = TaskPriority.fromKey(task.priority).label
        b.tvDueDate.text   = task.dueDate?.toDate()?.let {
            SimpleDateFormat("dd/MM/yyyy", Locale.getDefault()).format(it)
        } ?: "Sin fecha"

        b.chipGroupLabels.removeAllViews()
        task.labels.take(3).forEach { label ->
            val chip = Chip(holder.itemView.context).apply {
                text        = label
                isClickable = false
                textSize    = 10f
            }
            b.chipGroupLabels.addView(chip)
        }

        val nextStatus = when (task.status) {
            "pending"     -> "in_progress"
            "in_progress" -> "done"
            else          -> null
        }
        if (nextStatus != null) {
            b.btnMoveNext.visibility = View.VISIBLE
            b.btnMoveNext.text = if (nextStatus == "in_progress") "→ En Proceso" else "→ Completado"
            b.btnMoveNext.setOnClickListener { onStatusChange(task, nextStatus) }
        } else {
            b.btnMoveNext.visibility = View.GONE
        }

        // Solo managers pueden eliminar
        b.btnDelete.visibility = if (isManager) View.VISIBLE else View.GONE
        b.btnDelete.setOnClickListener { onDelete(task) }

        holder.itemView.setOnClickListener { onClick(task) }
    }

    fun update(newTasks: List<Task>) { tasks = newTasks; notifyDataSetChanged() }

    fun updateIsManager(isManager: Boolean) {
        this.isManager = isManager
        notifyDataSetChanged()
    }
}

class BoardFragment : Fragment() {

    private var _binding: FragmentBoardBinding? = null
    private val binding get() = _binding!!
    private val args: BoardFragmentArgs by navArgs()
    private lateinit var viewModel: BoardViewModel

    private val dateFormat = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
    private var selectedDueDate: Date? = null
    private var workspaceMembers: List<User> = emptyList()
    private val selectedLabels = mutableSetOf<String>()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentBoardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel = ViewModelProvider(this, BoardViewModel.Factory(args.workspaceId))
            .get(BoardViewModel::class.java)

        setupToolbar(binding.toolbar, showBack = true)
        setupNotificationBell(binding.toolbar)
        binding.toolbar.title = args.workspaceName

        val pendingAdapter    = TaskCardAdapter(emptyList(), viewModel.isManager, ::moveTask, ::confirmDelete, ::openDetail)
        val inProgressAdapter = TaskCardAdapter(emptyList(), viewModel.isManager, ::moveTask, ::confirmDelete, ::openDetail)
        val doneAdapter       = TaskCardAdapter(emptyList(), viewModel.isManager, ::moveTask, ::confirmDelete, ::openDetail)

        // Cargar rol y ajustar permisos
        viewModel.loadMyRole {
            val isMgr = viewModel.isManager
            binding.fabAddTask.visibility = if (isMgr) View.VISIBLE else View.GONE
            
            // Re-instanciar o actualizar adapters con el permiso correcto
            pendingAdapter.updateIsManager(isMgr)
            inProgressAdapter.updateIsManager(isMgr)
            doneAdapter.updateIsManager(isMgr)
        }

        binding.rvPending.layoutManager    = LinearLayoutManager(requireContext())
        binding.rvInProgress.layoutManager = LinearLayoutManager(requireContext())
        binding.rvDone.layoutManager       = LinearLayoutManager(requireContext())
        binding.rvPending.adapter          = pendingAdapter
        binding.rvInProgress.adapter       = inProgressAdapter
        binding.rvDone.adapter             = doneAdapter

        // Guardar las tasks actuales para re-filtrar
        var currentTasks: List<Task> = emptyList()

        fun applyFilter() {
            val grouped = viewModel.filterTasks(currentTasks)
            pendingAdapter.update(grouped["pending"] ?: emptyList())
            inProgressAdapter.update(grouped["in_progress"] ?: emptyList())
            doneAdapter.update(grouped["done"] ?: emptyList())
            binding.tvPendingCount.text    = "${grouped["pending"]?.size ?: 0}"
            binding.tvInProgressCount.text = "${grouped["in_progress"]?.size ?: 0}"
            binding.tvDoneCount.text       = "${grouped["done"]?.size ?: 0}"
        }

        // Chips de filtro
        binding.chipAll.setOnClickListener {
            viewModel.activeFilter = "all"
            applyFilter()
        }
        binding.chipMyTasks.setOnClickListener {
            viewModel.activeFilter = "mine"
            applyFilter()
        }
        binding.chipPending.setOnClickListener {
            viewModel.activeFilter = "pending"
            applyFilter()
        }
        binding.chipHighPriority.setOnClickListener {
            viewModel.activeFilter = "high"
            applyFilter()
        }
        binding.chipOverdue.setOnClickListener {
            viewModel.activeFilter = "overdue"
            applyFilter()
        }

        // Observar tareas en tiempo real
        viewModel.tasksFlow.onEach { tasks ->
            currentTasks = tasks
            applyFilter()
        }.launchIn(viewScope)

        binding.fabAddTask.setOnClickListener {
            viewScope.launch {
                workspaceMembers = viewModel.getMembers()
                showCreateTaskDialog()
            }
        }
    }

    private fun moveTask(task: Task, newStatus: String) =
        viewModel.updateStatus(task.id, newStatus)

    private fun confirmDelete(task: Task) {
        MaterialAlertDialogBuilder(requireContext(), R.style.ProSyncDialog)
            .setTitle("Eliminar tarea")
            .setMessage("¿Eliminar \"${task.title}\"?")
            .setPositiveButton("Eliminar") { _, _ ->
                viewModel.deleteTask(task.id) { ok ->
                    if (!ok) Toast.makeText(requireContext(), "Error al eliminar", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun openDetail(task: Task) {
        val action = BoardFragmentDirections.actionBoardToTaskDetail(task.id, task.workspaceId)
        findNavController().navigate(action)
    }

    private fun showCreateTaskDialog() {
        val dialogView      = layoutInflater.inflate(R.layout.dialog_create_task, null)
        val etTitle         = dialogView.findViewById<TextInputEditText>(R.id.etTaskTitle)
        val etDesc          = dialogView.findViewById<TextInputEditText>(R.id.etTaskDesc)
        val spinnerPriority = dialogView.findViewById<MaterialAutoCompleteTextView>(R.id.spinnerPriority)
        val spinnerStatus   = dialogView.findViewById<MaterialAutoCompleteTextView>(R.id.spinnerStatus)
        val spinnerAssignee = dialogView.findViewById<MaterialAutoCompleteTextView>(R.id.spinnerAssignee)
        val btnPickDate     = dialogView.findViewById<View>(R.id.btnPickDate)
        val tvSelectedDate  = dialogView.findViewById<android.widget.TextView>(R.id.tvSelectedDate)
        val chipGroupLabels = dialogView.findViewById<com.google.android.material.chip.ChipGroup>(R.id.chipGroupLabels)

        val priorityLabels = listOf("Baja", "Media", "Alta")
        val priorityKeys   = listOf("low", "medium", "high")
        spinnerPriority.setAdapter(ArrayAdapter(requireContext(),
            android.R.layout.simple_dropdown_item_1line, priorityLabels))
        spinnerPriority.setText("Media", false)

        val statusLabels = listOf("Por Hacer", "En Proceso", "Completado")
        val statusKeys   = listOf("pending", "in_progress", "done")
        spinnerStatus.setAdapter(ArrayAdapter(requireContext(),
            android.R.layout.simple_dropdown_item_1line, statusLabels))
        spinnerStatus.setText("Por Hacer", false)

        val memberNames = listOf("Sin asignar") + workspaceMembers.map {
            it.fullName.ifEmpty { it.email }
        }
        spinnerAssignee.setAdapter(ArrayAdapter(requireContext(),
            android.R.layout.simple_dropdown_item_1line, memberNames))
        spinnerAssignee.setText("Sin asignar", false)

        selectedDueDate = null
        btnPickDate.setOnClickListener {
            val cal = Calendar.getInstance()
            DatePickerDialog(requireContext(), { _, y, m, d ->
                cal.set(y, m, d)
                selectedDueDate = cal.time
                tvSelectedDate.text = dateFormat.format(cal.time)
            }, cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH)).show()
        }

        selectedLabels.clear()
        LABEL_COLORS.keys.forEach { label ->
            val chip = Chip(requireContext()).apply {
                text        = label
                isCheckable = true
                setOnCheckedChangeListener { _, checked ->
                    if (checked) selectedLabels.add(label) else selectedLabels.remove(label)
                }
            }
            chipGroupLabels.addView(chip)
        }

        MaterialAlertDialogBuilder(requireContext(), R.style.ProSyncDialog)
            .setTitle("Nueva Tarea")
            .setView(dialogView)
            .setPositiveButton("Crear") { _, _ ->
                val title = etTitle.text.toString().trim()
                if (title.isEmpty()) {
                    Toast.makeText(requireContext(), "El título es obligatorio", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                val priorityIdx   = priorityLabels.indexOf(spinnerPriority.text.toString()).coerceAtLeast(0)
                val statusIdx     = statusLabels.indexOf(spinnerStatus.text.toString()).coerceAtLeast(0)
                val assigneeIdx   = memberNames.indexOf(spinnerAssignee.text.toString()) - 1
                val assigneeUid   = if (assigneeIdx >= 0) workspaceMembers[assigneeIdx].uid   else ""
                val assigneeEmail = if (assigneeIdx >= 0) workspaceMembers[assigneeIdx].email else ""

                viewModel.createTask(
                    title         = title,
                    description   = etDesc.text.toString().trim(),
                    status        = statusKeys[statusIdx],
                    priority      = priorityKeys[priorityIdx],
                    assigneeUid   = assigneeUid,
                    assigneeEmail = assigneeEmail,
                    dueDate       = selectedDueDate,
                    labels        = selectedLabels.toList()
                ) { _, msg ->
                    Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    override fun onDestroyView() { super.onDestroyView(); _binding = null }
}
