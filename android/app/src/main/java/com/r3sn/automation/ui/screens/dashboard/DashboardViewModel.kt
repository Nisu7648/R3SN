package com.r3sn.automation.ui.screens.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.r3sn.automation.data.repository.DashboardRepository
import com.r3sn.automation.data.websocket.WebSocketManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val repository: DashboardRepository,
    private val webSocketManager: WebSocketManager
) : ViewModel() {

    private val _state = MutableStateFlow(DashboardState())
    val state: StateFlow<DashboardState> = _state.asStateFlow()

    init {
        loadDashboardData()
        observeWebSocketUpdates()
        startRealtimeUpdates()
    }

    private fun loadDashboardData() {
        viewModelScope.launch {
            try {
                val stats = repository.getDashboardStats()
                val activities = repository.getRecentActivities()
                
                _state.update { currentState ->
                    currentState.copy(
                        totalExecutions = stats.totalExecutions,
                        activeAgents = stats.activeAgents,
                        totalEvolutions = stats.totalEvolutions,
                        uptime = formatUptime(stats.uptimeSeconds),
                        recentActivities = activities,
                        isLoading = false
                    )
                }
            } catch (e: Exception) {
                _state.update { it.copy(error = e.message, isLoading = false) }
            }
        }
    }

    private fun observeWebSocketUpdates() {
        viewModelScope.launch {
            webSocketManager.messages.collect { message ->
                when (message.type) {
                    "execution_completed" -> {
                        _state.update { 
                            it.copy(totalExecutions = it.totalExecutions + 1)
                        }
                        loadDashboardData()
                    }
                    "agent_activated" -> {
                        _state.update { 
                            it.copy(activeAgents = it.activeAgents + 1)
                        }
                    }
                    "evolution_completed" -> {
                        _state.update { 
                            it.copy(totalEvolutions = it.totalEvolutions + 1)
                        }
                    }
                }
            }
        }
    }

    private fun startRealtimeUpdates() {
        viewModelScope.launch {
            while (true) {
                kotlinx.coroutines.delay(30000) // Update every 30 seconds
                loadDashboardData()
            }
        }
    }

    private fun formatUptime(seconds: Long): String {
        val hours = seconds / 3600
        val minutes = (seconds % 3600) / 60
        return "${hours}h ${minutes}m"
    }

    fun refresh() {
        _state.update { it.copy(isLoading = true) }
        loadDashboardData()
    }

    override fun onCleared() {
        super.onCleared()
        webSocketManager.disconnect()
    }
}

data class DashboardState(
    val totalExecutions: Int = 0,
    val activeAgents: Int = 0,
    val totalEvolutions: Int = 0,
    val uptime: String = "0h 0m",
    val recentActivities: List<Activity> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null
)
