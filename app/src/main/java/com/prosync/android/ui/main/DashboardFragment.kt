package com.prosync.android.ui.main

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.firebase.auth.FirebaseAuth
import com.prosync.android.data.models.Task
import com.prosync.android.data.repository.FirebaseRepository
import com.prosync.android.databinding.FragmentDashboardBinding
import com.prosync.android.ui.board.TaskCardAdapter
import com.prosync.android.utils.setupNotificationBell
import com.prosync.android.utils.setupToolbar
import com.prosync.android.utils.viewScope
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import java.util.Date

class DashboardViewModel : ViewModel() {
    private val repo = FirebaseRepository()
    val myTasksFlow  = repo.getAllMyTasksFlow()

    suspend fun getUserName(): String {
        return repo.getCurrentUser()?.fullName
            ?: FirebaseAuth.getInstance().currentUser?.displayName
            ?: "Usuario"
    }
}

class DashboardFragment : Fragment() {

    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!
    private val viewModel: DashboardViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupToolbar(binding.toolbar, showBack = false)
        setupNotificationBell(binding.toolbar)

        // Saludo y nombre del usuario
        viewScope.launch {
            val name = viewModel.getUserName()
            val firstName = name.split(" ").first()
            binding.tvUserName.text = firstName

            // Saludo según hora
            val hour = java.util.Calendar.getInstance()
                .get(java.util.Calendar.HOUR_OF_DAY)
            binding.tvGreeting.text = when {
                hour < 12 -> "☀️ Buenos días,"
                hour < 18 -> "🌤️ Buenas tardes,"
                else      -> "🌙 Buenas noches,"
            }
        }

        // Setup RecyclerView tareas urgentes
        val urgentAdapter = TaskCardAdapter(
            emptyList(),
            onStatusChange = { _, _ -> },
            onDelete       = { },
            onClick        = { }
        )
        binding.rvUrgentTasks.layoutManager = LinearLayoutManager(requireContext())
        binding.rvUrgentTasks.adapter = urgentAdapter

        // Observar tareas
        viewModel.myTasksFlow.onEach { tasks ->
            updateStats(tasks)
            val urgent = tasks.filter {
                it.priority == "high" && it.status != "done"
            }.take(5)
            urgentAdapter.update(urgent)
            binding.tvNoUrgent.visibility =
                if (urgent.isEmpty()) View.VISIBLE else View.GONE
        }.launchIn(viewScope)
    }

    private fun updateStats(tasks: List<Task>) {
        val now     = Date()
        val total   = tasks.size
        val done    = tasks.count { it.status == "done" }
        val pending = tasks.count { it.status == "pending" }
        val overdue = tasks.count {
            it.dueDate != null &&
            it.dueDate.toDate().before(now) &&
            it.status != "done"
        }
        val percent = if (total > 0) (done * 100) / total else 0

        binding.tvTotalTasks.text     = total.toString()
        binding.tvDoneTasks.text      = done.toString()
        binding.tvPendingTasks.text   = pending.toString()
        binding.tvOverdueTasks.text   = overdue.toString()
        binding.tvProgressPercent.text = "$percent%"
        binding.progressBarTasks.progress = percent
    }

    override fun onDestroyView() { super.onDestroyView(); _binding = null }
}
