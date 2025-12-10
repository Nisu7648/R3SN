package com.r3sn.automation.ui.screens.agents

import androidx.compose.ui.graphics.Color
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.r3sn.automation.data.repository.AgentsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AgentsViewModel @Inject constructor(
    private val repository: AgentsRepository
) : ViewModel() {

    private val _state = MutableStateFlow(AgentsState())
    val state: StateFlow<AgentsState> = _state.asStateFlow()

    init {
        loadAgents()
    }

    private fun loadAgents() {
        viewModelScope.launch {
            try {
                val agents = repository.getAllAgents()
                val active = agents.count { it.isActive }
                val totalTasks = agents.sumOf { it.tasksCompleted }
                
                _state.update { 
                    it.copy(
                        agents = agents,
                        activeAgents = active,
                        totalTasks = totalTasks
                    )
                }
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun createAgent(name: String, type: String) {
        viewModelScope.launch {
            try {
                repository.createAgent(name, type)
                loadAgents()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun activateAgent(id: String) {
        viewModelScope.launch {
            try {
                repository.activateAgent(id)
                loadAgents()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun deactivateAgent(id: String) {
        viewModelScope.launch {
            try {
                repository.deactivateAgent(id)
                loadAgents()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun deleteAgent(id: String) {
        viewModelScope.launch {
            try {
                repository.deleteAgent(id)
                loadAgents()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}
