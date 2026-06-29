package com.prosync.android.ui.board

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.tabs.TabLayout
import com.prosync.android.data.models.TaskComment
import com.prosync.android.data.models.TaskHistory
import com.prosync.android.data.repository.FirebaseRepository
import com.prosync.android.databinding.FragmentTaskDetailBinding
import com.prosync.android.databinding.ItemCommentBinding
import com.prosync.android.databinding.ItemHistoryBinding
import com.prosync.android.utils.setupNotificationBell
import com.prosync.android.utils.setupToolbar
import com.prosync.android.utils.viewScope
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

// ─── ViewModel ────────────────────────────────────────────────────────────────
class TaskDetailViewModel(private val taskId: String) : ViewModel() {
    private val repo = FirebaseRepository()
    val commentsFlow = repo.getCommentsFlow(taskId)
    val historyFlow  = repo.getTaskHistoryFlow(taskId)

    fun addComment(body: String, onResult: (Boolean, String) -> Unit) = viewModelScope.launch {
        val r = repo.addComment(taskId, body)
        onResult(r.isSuccess, if (r.isSuccess) "" else r.exceptionOrNull()?.message ?: "Error")
    }

    class Factory(private val taskId: String) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>) = TaskDetailViewModel(taskId) as T
    }
}

// ─── Comments Adapter ─────────────────────────────────────────────────────────
class CommentsAdapter(private var list: List<TaskComment>) :
    RecyclerView.Adapter<CommentsAdapter.VH>() {

    inner class VH(val binding: ItemCommentBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        VH(ItemCommentBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun getItemCount() = list.size

    override fun onBindViewHolder(holder: VH, position: Int) {
        val c = list[position]
        holder.binding.tvType.text   = "💬"
        holder.binding.tvAuthor.text = c.authorName.ifEmpty { c.authorEmail }
        holder.binding.tvBody.text   = c.body
        holder.binding.tvDate.text   = c.createdAt?.toDate()?.let {
            SimpleDateFormat("dd/MM HH:mm", Locale.getDefault()).format(it)
        } ?: ""
    }

    fun update(newList: List<TaskComment>) { list = newList; notifyDataSetChanged() }
}

// ─── History Adapter ──────────────────────────────────────────────────────────
class HistoryAdapter(private var list: List<TaskHistory>) :
    RecyclerView.Adapter<HistoryAdapter.VH>() {

    inner class VH(val binding: ItemHistoryBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        VH(ItemHistoryBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun getItemCount() = list.size

    override fun onBindViewHolder(holder: VH, position: Int) {
        val h = list[position]
        holder.binding.tvHistoryIcon.text = when (h.action) {
            "CREATED"         -> "🆕"
            "STATUS_CHANGED" -> "🔄"
            "ASSIGNED"       -> "👤"
            "EDITED"         -> "✏️"
            "COMMENTED"      -> "💬"
            else             -> "📋"
        }
        holder.binding.tvHistoryAction.text = when (h.action) {
            "CREATED"        -> "Tarea creada"
            "STATUS_CHANGED" -> "Estado cambiado"
            "ASSIGNED"       -> "Tarea asignada"
            "EDITED"         -> "Tarea editada"
            "COMMENTED"      -> "Comentario agregado"
            else             -> h.action
        }
        holder.binding.tvHistoryOld.text  = h.oldValue.ifEmpty { "—" }
        holder.binding.tvHistoryNew.text  = h.newValue.ifEmpty { "—" }
        holder.binding.tvHistoryUser.text = h.userEmail
        holder.binding.tvHistoryDate.text = h.createdAt?.toDate()?.let {
            SimpleDateFormat("dd/MM HH:mm", Locale.getDefault()).format(it)
        } ?: ""
    }

    fun update(newList: List<TaskHistory>) { list = newList; notifyDataSetChanged() }
}

// ─── Fragment ─────────────────────────────────────────────────────────────────
class TaskDetailFragment : Fragment() {

    private var _binding: FragmentTaskDetailBinding? = null
    private val binding get() = _binding!!
    private val args: TaskDetailFragmentArgs by navArgs()
    private lateinit var viewModel: TaskDetailViewModel
    private lateinit var commentsAdapter: CommentsAdapter
    private lateinit var historyAdapter: HistoryAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentTaskDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel = ViewModelProvider(this, TaskDetailViewModel.Factory(args.taskId))
            .get(TaskDetailViewModel::class.java)

        setupToolbar(binding.toolbar, showBack = true)
        setupNotificationBell(binding.toolbar)

        // Setup comentarios
        commentsAdapter = CommentsAdapter(emptyList())
        binding.rvComments.layoutManager = LinearLayoutManager(requireContext())
        binding.rvComments.adapter = commentsAdapter

        // Setup historial
        historyAdapter = HistoryAdapter(emptyList())
        binding.rvHistory.layoutManager = LinearLayoutManager(requireContext())
        binding.rvHistory.adapter = historyAdapter

        // Tabs
        binding.tabLayout.addTab(binding.tabLayout.newTab().setText("💬 Comentarios"))
        binding.tabLayout.addTab(binding.tabLayout.newTab().setText("📋 Historial"))

        binding.tabLayout.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab?) {
                when (tab?.position) {
                    0 -> {
                        binding.layoutComments.visibility = View.VISIBLE
                        binding.rvHistory.visibility      = View.GONE
                    }
                    1 -> {
                        binding.layoutComments.visibility = View.GONE
                        binding.rvHistory.visibility      = View.VISIBLE
                    }
                }
            }
            override fun onTabUnselected(tab: TabLayout.Tab?) {}
            override fun onTabReselected(tab: TabLayout.Tab?) {}
        })

        // Observar comentarios
        viewModel.commentsFlow.onEach { comments ->
            commentsAdapter.update(comments)
            if (comments.isNotEmpty()) {
                binding.rvComments.scrollToPosition(comments.size - 1)
            }
        }.launchIn(viewScope)

        // Observar historial
        viewModel.historyFlow.onEach { history ->
            historyAdapter.update(history)
        }.launchIn(viewScope)

        // Enviar comentario
        binding.btnSendComment.setOnClickListener {
            val body = binding.etComment.text.toString().trim()
            if (body.isEmpty()) return@setOnClickListener
            viewModel.addComment(body) { ok, msg ->
                if (ok) binding.etComment.text?.clear()
                else Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onDestroyView() { super.onDestroyView(); _binding = null }
}
