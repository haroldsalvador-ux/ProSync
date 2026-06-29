package com.prosync.android.ui.notifications

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.prosync.android.data.models.Notification
import com.prosync.android.data.repository.FirebaseRepository
import com.prosync.android.databinding.FragmentNotificationsBinding
import com.prosync.android.databinding.ItemNotificationBinding
import com.prosync.android.utils.setupToolbar
import com.prosync.android.utils.viewScope
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class NotificationsViewModel : ViewModel() {
    private val repo = FirebaseRepository()
    val notifications = repo.getNotificationsFlow()
    fun markAllRead() = viewModelScope.launch { repo.markAllNotificationsRead() }
    fun markRead(id: String) = viewModelScope.launch { repo.markNotificationRead(id) }
}

class NotificationsAdapter(
    private var list: List<Notification>,
    private val onRead: (Notification) -> Unit
) : RecyclerView.Adapter<NotificationsAdapter.VH>() {

    inner class VH(val binding: ItemNotificationBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        VH(ItemNotificationBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun getItemCount() = list.size

    override fun onBindViewHolder(holder: VH, position: Int) {
        val n = list[position]
        holder.binding.tvMessage.text = n.message
        holder.binding.tvType.text = when (n.type) {
            "TASK_ASSIGNED"   -> "📋"
            "TASK_STATUS"     -> "🔄"
            "WORKSPACE_ADDED" -> "👥"
            "TASK_COMMENT"    -> "💬"
            "WORKSPACE_INVITE" -> "🎉"
            else              -> "🔔"
        }
        holder.binding.tvDate.text = n.createdAt?.toDate()?.let {
            SimpleDateFormat("dd/MM HH:mm", Locale.getDefault()).format(it)
        } ?: ""

        // Opacidad si ya fue leída
        holder.itemView.alpha = if (n.isRead) 0.5f else 1.0f

        // Punto indicador
        holder.binding.viewUnread.visibility =
            if (n.isRead) View.GONE else View.VISIBLE

        holder.itemView.setOnClickListener {
            if (!n.isRead) onRead(n)
        }
    }

    fun update(newList: List<Notification>) { list = newList; notifyDataSetChanged() }
}

class NotificationsFragment : Fragment() {

    private var _binding: FragmentNotificationsBinding? = null
    private val binding get() = _binding!!
    private val viewModel: NotificationsViewModel by viewModels()
    private lateinit var adapter: NotificationsAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentNotificationsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupToolbar(binding.toolbar, showBack = true)

        adapter = NotificationsAdapter(emptyList()) { notif -> viewModel.markRead(notif.id) }
        binding.rvNotifications.layoutManager = LinearLayoutManager(requireContext())
        binding.rvNotifications.adapter = adapter

        binding.btnMarkAllRead.setOnClickListener { viewModel.markAllRead() }

        viewModel.notifications
            .onEach { list ->
                binding.progressBar.visibility = View.GONE
                if (list.isEmpty()) {
                    binding.tvEmpty.visibility         = View.VISIBLE
                    binding.rvNotifications.visibility = View.GONE
                } else {
                    binding.tvEmpty.visibility         = View.GONE
                    binding.rvNotifications.visibility = View.VISIBLE
                    adapter.update(list)
                    val unread = list.count { !it.isRead }
                    binding.tvUnreadCount.text = if (unread > 0) "$unread sin leer" else "Todo leído ✓"
                }
            }
            .catch { e ->
                binding.progressBar.visibility = View.GONE
                Toast.makeText(requireContext(), "Error al cargar notificaciones: ${e.message}", Toast.LENGTH_LONG).show()
            }
            .launchIn(viewScope)
    }

    override fun onDestroyView() { super.onDestroyView(); _binding = null }
}
