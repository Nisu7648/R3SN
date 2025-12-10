package com.r3sn.automation.data.repository

import com.r3sn.automation.data.api.R3SNApi
import com.r3sn.automation.data.local.dao.DashboardDao
import com.r3sn.automation.data.models.DashboardStats
import com.r3sn.automation.ui.screens.dashboard.Activity
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.Color
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DashboardRepository @Inject constructor(
    private val api: R3SNApi,
    private val dashboardDao: DashboardDao
) {
    
    suspend fun getDashboardStats(): DashboardStats {
        return try {
            val response = api.getDashboardStats()
            if (response.isSuccessful && response.body() != null) {
                val stats = response.body()!!
                // Cache locally
                dashboardDao.insertStats(stats)
                stats
            } else {
                // Fallback to cached data
                dashboardDao.getLatestStats() ?: DashboardStats(
                    totalExecutions = 0,
                    activeAgents = 0,
                    connectedIntegrations = 0,
                    totalEvolutions = 0,
                    uptimeSeconds = 0,
                    systemHealth = "Unknown"
                )
            }
        } catch (e: Exception) {
            // Return cached data on error
            dashboardDao.getLatestStats() ?: DashboardStats(
                totalExecutions = 0,
                activeAgents = 0,
                connectedIntegrations = 0,
                totalEvolutions = 0,
                uptimeSeconds = 0,
                systemHealth = "Error"
            )
        }
    }
    
    suspend fun getRecentActivities(): List<Activity> {
        return try {
            val response = api.getRecentActivities()
            if (response.isSuccessful && response.body() != null) {
                response.body()!!.map { item ->
                    Activity(
                        title = item.title,
                        description = item.description,
                        time = formatTimestamp(item.timestamp),
                        icon = getIconForType(item.type),
                        color = getColorForType(item.type)
                    )
                }
            } else {
                emptyList()
            }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    fun observeDashboardStats(): Flow<DashboardStats> = flow {
        while (true) {
            emit(getDashboardStats())
            kotlinx.coroutines.delay(30000) // Update every 30 seconds
        }
    }
    
    private fun formatTimestamp(timestamp: Long): String {
        val now = System.currentTimeMillis()
        val diff = now - timestamp
        
        return when {
            diff < 60000 -> "Just now"
            diff < 3600000 -> "${diff / 60000}m ago"
            diff < 86400000 -> "${diff / 3600000}h ago"
            else -> "${diff / 86400000}d ago"
        }
    }
    
    private fun getIconForType(type: String) = when (type) {
        "execution" -> Icons.Default.PlayArrow
        "workflow" -> Icons.Default.AccountTree
        "agent" -> Icons.Default.SmartToy
        "integration" -> Icons.Default.Extension
        "evolution" -> Icons.Default.AutoAwesome
        "debug" -> Icons.Default.BugReport
        else -> Icons.Default.Info
    }
    
    private fun getColorForType(type: String) = when (type) {
        "execution" -> Color(0xFF6366F1)
        "workflow" -> Color(0xFF10B981)
        "agent" -> Color(0xFFEC4899)
        "integration" -> Color(0xFFF59E0B)
        "evolution" -> Color(0xFF8B5CF6)
        "debug" -> Color(0xFFEF4444)
        else -> Color(0xFF6B7280)
    }
}
