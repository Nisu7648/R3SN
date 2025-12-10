package com.r3sn.automation.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

// Dashboard
@Entity(tableName = "dashboard_stats")
data class DashboardStatsEntity(
    @PrimaryKey val id: Int = 1,
    val totalExecutions: Int,
    val activeAgents: Int,
    val connectedIntegrations: Int,
    val totalEvolutions: Int,
    val uptimeSeconds: Long,
    val systemHealth: String,
    val timestamp: Long = System.currentTimeMillis()
)

// Executions
@Entity(tableName = "executions")
data class ExecutionEntity(
    @PrimaryKey val id: String,
    val prompt: String,
    val status: String,
    val result: String?,
    val timestamp: Long,
    val duration: Long,
    val steps: String, // JSON
    val metadata: String // JSON
)

// Workflows
@Entity(tableName = "workflows")
data class WorkflowEntity(
    @PrimaryKey val id: String,
    val name: String,
    val description: String,
    val status: String,
    val tasks: String, // JSON
    val createdAt: Long,
    val updatedAt: Long,
    val executionCount: Int,
    val successRate: Double
)

// Agents
@Entity(tableName = "agents")
data class AgentEntity(
    @PrimaryKey val id: String,
    val name: String,
    val type: String,
    val status: String,
    val isActive: Boolean,
    val capabilities: String, // JSON
    val tasksCompleted: Int,
    val successRate: Double,
    val createdAt: Long
)

// Integrations
@Entity(tableName = "integrations")
data class IntegrationEntity(
    @PrimaryKey val id: String,
    val name: String,
    val category: String,
    val type: String,
    val features: String, // JSON
    val isConnected: Boolean,
    val icon: String?,
    val description: String?,
    val lastSync: Long?
)

// Evolution
@Entity(tableName = "evolution_events")
data class EvolutionEventEntity(
    @PrimaryKey val id: String,
    val type: String,
    val description: String,
    val timestamp: Long,
    val status: String,
    val impact: String,
    val details: String // JSON
)

// Bugs
@Entity(tableName = "bugs")
data class BugEntity(
    @PrimaryKey val id: String,
    val type: String,
    val severity: String,
    val message: String,
    val stackTrace: String?,
    val occurrences: Int,
    val firstSeen: Long,
    val lastSeen: Long,
    val status: String,
    val fixId: String?
)

// Settings
@Entity(tableName = "user_settings")
data class UserSettingsEntity(
    @PrimaryKey val userId: String,
    val theme: String,
    val notificationsEnabled: Boolean,
    val executionCompleteNotif: Boolean,
    val workflowFailedNotif: Boolean,
    val evolutionDeployedNotif: Boolean,
    val bugFixedNotif: Boolean,
    val autoEvolution: Boolean,
    val autoDebugging: Boolean,
    val apiEndpoint: String
)

// Type Converters
class Converters {
    private val gson = Gson()
    
    @TypeConverter
    fun fromStringList(value: String): List<String> {
        val listType = object : TypeToken<List<String>>() {}.type
        return gson.fromJson(value, listType)
    }
    
    @TypeConverter
    fun toStringList(list: List<String>): String {
        return gson.toJson(list)
    }
    
    @TypeConverter
    fun fromMap(value: String): Map<String, Any> {
        val mapType = object : TypeToken<Map<String, Any>>() {}.type
        return gson.fromJson(value, mapType)
    }
    
    @TypeConverter
    fun toMap(map: Map<String, Any>): String {
        return gson.toJson(map)
    }
}
