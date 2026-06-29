package com.prosync.android.ui.calendar

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.ViewModel
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.kizitonwose.calendar.core.CalendarDay
import com.kizitonwose.calendar.core.DayPosition
import com.kizitonwose.calendar.view.MonthDayBinder
import com.kizitonwose.calendar.view.ViewContainer
import com.prosync.android.data.models.Task
import com.prosync.android.data.repository.FirebaseRepository
import com.prosync.android.databinding.FragmentCalendarBinding
import com.prosync.android.databinding.ItemCalendarDayBinding
import com.prosync.android.databinding.ItemTaskCardBinding
import com.prosync.android.utils.setupNotificationBell
import com.prosync.android.utils.setupToolbar
import com.prosync.android.utils.viewScope
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import java.text.SimpleDateFormat
import java.time.LocalDate
import java.time.YearMonth
import java.time.ZoneId
import java.util.*

class CalendarViewModel : ViewModel() {
    private val repo = FirebaseRepository()
    val allTasks = repo.getAllMyTasksFlow()
}

class DayViewContainer(view: View) : ViewContainer(view) {
    val binding = ItemCalendarDayBinding.bind(view)
}

class CalendarTaskAdapter(private var tasks: List<Task>) :
    RecyclerView.Adapter<CalendarTaskAdapter.VH>() {

    inner class VH(val binding: ItemTaskCardBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        VH(ItemTaskCardBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun getItemCount() = tasks.size

    override fun onBindViewHolder(holder: VH, position: Int) {
        val t = tasks[position]
        holder.binding.tvTaskTitle.text = t.title
        holder.binding.tvAssignee.text  = t.assigneeEmail.ifEmpty { "Sin asignado" }
        holder.binding.tvPriority.text  = t.priority
        holder.binding.tvDueDate.text   = ""
        holder.binding.btnMoveNext.visibility = View.GONE
        holder.binding.btnDelete.visibility   = View.GONE
    }

    fun update(newTasks: List<Task>) { tasks = newTasks; notifyDataSetChanged() }
}

class CalendarFragment : Fragment() {

    private var _binding: FragmentCalendarBinding? = null
    private val binding get() = _binding!!
    private val viewModel: CalendarViewModel by viewModels()

    private var allTasks: List<Task> = emptyList()
    private var selectedDate: LocalDate = LocalDate.now()
    private lateinit var taskAdapter: CalendarTaskAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCalendarBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupToolbar(binding.toolbar, showBack = false)
        setupNotificationBell(binding.toolbar)

        taskAdapter = CalendarTaskAdapter(emptyList())
        binding.rvTasksForDay.layoutManager = LinearLayoutManager(requireContext())
        binding.rvTasksForDay.adapter = taskAdapter

        val currentMonth = YearMonth.now()
        binding.calendarView.setup(
            currentMonth.minusMonths(3),
            currentMonth.plusMonths(6),
            java.time.DayOfWeek.MONDAY
        )
        binding.calendarView.scrollToMonth(currentMonth)

        binding.calendarView.dayBinder = object : MonthDayBinder<DayViewContainer> {
            override fun create(view: View) = DayViewContainer(view)

            override fun bind(container: DayViewContainer, data: CalendarDay) {
                container.binding.tvDay.text = data.date.dayOfMonth.toString()
                val isCurrentMonth = data.position == DayPosition.MonthDate
                val hasTasks = allTasks.any { it.dueDate?.toDate()?.toLocalDate() == data.date }

                container.binding.tvDay.alpha = if (isCurrentMonth) 1f else 0.3f
                container.binding.dotIndicator.visibility =
                    if (hasTasks && isCurrentMonth) View.VISIBLE else View.GONE
                container.binding.root.isSelected = (data.date == selectedDate)

                if (isCurrentMonth) {
                    container.binding.root.setOnClickListener {
                        selectedDate = data.date
                        binding.calendarView.notifyCalendarChanged()
                        updateTasksForSelectedDate()
                    }
                }
            }
        }

        viewModel.allTasks
            .onEach { tasks ->
                allTasks = tasks
                binding.calendarView.notifyCalendarChanged()
                updateTasksForSelectedDate()
            }
            .catch { e ->
                Toast.makeText(requireContext(), "Error al cargar calendario: ${e.message}", Toast.LENGTH_LONG).show()
            }
            .launchIn(viewScope)
    }

    private fun updateTasksForSelectedDate() {
        val tasksForDay = allTasks.filter {
            it.dueDate?.toDate()?.toLocalDate() == selectedDate
        }
        taskAdapter.update(tasksForDay)
        val dateStr = SimpleDateFormat("dd MMMM yyyy", Locale("es", "PE"))
            .format(Date.from(selectedDate.atStartOfDay(ZoneId.systemDefault()).toInstant()))
        binding.tvSelectedDate.text = dateStr
        binding.tvNoTasksForDay.visibility = if (tasksForDay.isEmpty()) View.VISIBLE else View.GONE
    }

    private fun Date.toLocalDate(): LocalDate =
        toInstant().atZone(ZoneId.systemDefault()).toLocalDate()

    override fun onDestroyView() { super.onDestroyView(); _binding = null }
}
