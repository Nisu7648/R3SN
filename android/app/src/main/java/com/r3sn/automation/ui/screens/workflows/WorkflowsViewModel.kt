package com.r3sn.automation.ui.screens.workflows

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.r3sn.automation.data.repository.WorkflowsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class WorkflowsViewModel @Inject constructor(
    private val repository: WorkflowsRepository
) : ViewModel() {

    private val _state = MutableStateFlow(WorkflowsState())
    val state: StateFlow<WorkflowsState> = _state.asStateFlow()

    init {
        loadWorkflows()
    }

    private fun loadWorkflows() {
        viewModelScope.launch {
            try {
                val workflows = repository.getAllWorkflows()
                val active = workflows.count { it.status == WorkflowStatus.ACTIVE }
                val completed = workflows.count { it.status == WorkflowStatus.ACTIVE && it.executionCount > 0 }
                val failed = workflows.count { it.status == WorkflowStatus.FAILED }
                
                _state.update { 
                    it.copy(
                        workflows = workflows,
                        activeWorkflows = active,
                        completedWorkflows = completed,
                        failedWorkflows = failed
                    )
                }
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun createWorkflow(name: String, description: String) {
        viewModelScope.launch {
            try {
                repository.createWorkflow(name, description)
                loadWorkflows()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun executeWorkflow(id: String) {
        viewModelScope.launch {
            try {
                repository.executeWorkflow(id)
                loadWorkflows()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun deleteWorkflow(id: String) {
        viewModelScope.launch {
            try {
                repository.deleteWorkflow(id)
                loadWorkflows()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}
