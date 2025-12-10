package com.r3sn.automation.ui.screens.executor

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.r3sn.automation.data.repository.ExecutorRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ExecutorViewModel @Inject constructor(
    private val repository: ExecutorRepository
) : ViewModel() {

    private val _state = MutableStateFlow(ExecutorState())
    val state: StateFlow<ExecutorState> = _state.asStateFlow()

    init {
        loadExecutionHistory()
    }

    fun executePrompt(prompt: String) {
        if (prompt.isBlank()) return
        
        viewModelScope.launch {
            try {
                _state.update { it.copy(isExecuting = true, currentStep = "Initializing...", progress = 0f) }
                
                // Execute prompt
                repository.executePrompt(prompt).collect { result ->
                    when {
                        result.isLoading -> {
                            _state.update { 
                                it.copy(
                                    currentStep = result.step ?: "Processing...",
                                    progress = result.progress ?: 0f
                                )
                            }
                        }
                        result.isSuccess -> {
                            _state.update { it.copy(isExecuting = false) }
                            loadExecutionHistory()
                        }
                        result.isError -> {
                            _state.update { 
                                it.copy(
                                    isExecuting = false,
                                    error = result.error
                                )
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                _state.update { 
                    it.copy(
                        isExecuting = false,
                        error = e.message
                    )
                }
            }
        }
    }

    private fun loadExecutionHistory() {
        viewModelScope.launch {
            try {
                val history = repository.getExecutionHistory()
                _state.update { it.copy(executionHistory = history) }
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun clearError() {
        _state.update { it.copy(error = null) }
    }
}
