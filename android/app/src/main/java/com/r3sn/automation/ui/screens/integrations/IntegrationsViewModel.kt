package com.r3sn.automation.ui.screens.integrations

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.Color
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.r3sn.automation.data.repository.IntegrationsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class IntegrationsViewModel @Inject constructor(
    private val repository: IntegrationsRepository
) : ViewModel() {

    private val _state = MutableStateFlow(IntegrationsState())
    val state: StateFlow<IntegrationsState> = _state.asStateFlow()

    init {
        loadIntegrations()
    }

    private fun loadIntegrations() {
        viewModelScope.launch {
            try {
                val integrations = repository.getAllIntegrations()
                val connected = integrations.count { it.isConnected }
                
                _state.update { 
                    it.copy(
                        integrations = integrations,
                        connectedIntegrations = connected,
                        availableIntegrations = integrations.size - connected
                    )
                }
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun searchIntegrations(query: String) {
        viewModelScope.launch {
            try {
                val integrations = if (query.isBlank()) {
                    repository.getAllIntegrations()
                } else {
                    repository.searchIntegrations(query)
                }
                _state.update { it.copy(integrations = integrations) }
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun filterByCategory(category: String) {
        viewModelScope.launch {
            try {
                val integrations = if (category == "All") {
                    repository.getAllIntegrations()
                } else {
                    repository.getIntegrationsByCategory(category)
                }
                _state.update { it.copy(integrations = integrations) }
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun connectIntegration(id: String) {
        viewModelScope.launch {
            try {
                repository.connectIntegration(id)
                loadIntegrations()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun disconnectIntegration(id: String) {
        viewModelScope.launch {
            try {
                repository.disconnectIntegration(id)
                loadIntegrations()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}
