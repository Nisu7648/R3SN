package com.r3sn.automation.data.repository

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.Color
import com.r3sn.automation.data.api.R3SNApi
import com.r3sn.automation.data.local.dao.IntegrationDao
import com.r3sn.automation.data.local.entities.IntegrationEntity
import com.r3sn.automation.data.models.IntegrationConfig
import com.r3sn.automation.ui.screens.integrations.Integration
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class IntegrationsRepository @Inject constructor(
    private val api: R3SNApi,
    private val integrationDao: IntegrationDao
) {
    
    suspend fun getAllIntegrations(): List<Integration> {
        return try {
            // Try to fetch from API
            val response = api.getIntegrationsManifest()
            if (response.isSuccessful && response.body() != null) {
                val manifest = response.body()!!
                val integrations = mutableListOf<Integration>()
                
                manifest.categories.forEach { (category, items) ->
                    items.forEach { item ->
                        integrations.add(
                            Integration(
                                id = item.id,
                                name = item.name,
                                category = category,
                                icon = getIconForCategory(category),
                                color = getColorForCategory(category),
                                features = item.features,
                                isConnected = item.isConnected
                            )
                        )
                    }
                }
                
                // Cache in database
                val entities = integrations.map { it.toEntity() }
                integrationDao.insertIntegrations(entities)
                
                integrations
            } else {
                // Fallback to cached data
                getCachedIntegrations()
            }
        } catch (e: Exception) {
            // Return cached data on error
            getCachedIntegrations()
        }
    }
    
    private suspend fun getCachedIntegrations(): List<Integration> {
        val entities = integrationDao.getAllIntegrations()
        return entities.map { it.toIntegration() }
    }
    
    suspend fun searchIntegrations(query: String): List<Integration> {
        val entities = integrationDao.searchIntegrations(query)
        return entities.map { it.toIntegration() }
    }
    
    suspend fun getIntegrationsByCategory(category: String): List<Integration> {
        val entities = integrationDao.getIntegrationsByCategory(category)
        return entities.map { it.toIntegration() }
    }
    
    suspend fun connectIntegration(id: String) {
        try {
            val response = api.connectIntegration(id, IntegrationConfig())
            if (response.isSuccessful) {
                // Update local database
                val entity = integrationDao.getIntegrationById(id)
                entity?.let {
                    integrationDao.updateIntegration(it.copy(isConnected = true))
                }
            }
        } catch (e: Exception) {
            // Handle error
        }
    }
    
    suspend fun disconnectIntegration(id: String) {
        try {
            val response = api.disconnectIntegration(id)
            if (response.isSuccessful) {
                // Update local database
                val entity = integrationDao.getIntegrationById(id)
                entity?.let {
                    integrationDao.updateIntegration(it.copy(isConnected = false))
                }
            }
        } catch (e: Exception) {
            // Handle error
        }
    }
    
    private fun getIconForCategory(category: String) = when (category) {
        "Productivity" -> Icons.Default.Work
        "Communication" -> Icons.Default.Chat
        "Finance" -> Icons.Default.AttachMoney
        "Social Media" -> Icons.Default.Share
        "Development" -> Icons.Default.Code
        "Marketing" -> Icons.Default.Campaign
        "E-commerce" -> Icons.Default.ShoppingCart
        "Analytics" -> Icons.Default.Analytics
        else -> Icons.Default.Extension
    }
    
    private fun getColorForCategory(category: String) = when (category) {
        "Productivity" -> Color(0xFF6366F1)
        "Communication" -> Color(0xFF10B981)
        "Finance" -> Color(0xFFF59E0B)
        "Social Media" -> Color(0xFFEC4899)
        "Development" -> Color(0xFF8B5CF6)
        "Marketing" -> Color(0xFF06B6D4)
        "E-commerce" -> Color(0xFFEF4444)
        "Analytics" -> Color(0xFF14B8A6)
        else -> Color(0xFF6B7280)
    }
}

// Extension functions
fun Integration.toEntity() = IntegrationEntity(
    id = id,
    name = name,
    category = category,
    type = "api",
    features = features.joinToString(","),
    isConnected = isConnected,
    icon = null,
    description = null,
    lastSync = if (isConnected) System.currentTimeMillis() else null
)

fun IntegrationEntity.toIntegration() = Integration(
    id = id,
    name = name,
    category = category,
    icon = Icons.Default.Extension,
    color = Color(0xFF6366F1),
    features = features.split(","),
    isConnected = isConnected
)
