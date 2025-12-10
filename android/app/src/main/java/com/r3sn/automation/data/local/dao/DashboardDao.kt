package com.r3sn.automation.data.local.dao

import androidx.room.*
import com.r3sn.automation.data.local.entities.DashboardStatsEntity
import com.r3sn.automation.data.models.DashboardStats
import kotlinx.coroutines.flow.Flow

@Dao
interface DashboardDao {
    
    @Query("SELECT * FROM dashboard_stats WHERE id = 1")
    suspend fun getLatestStatsEntity(): DashboardStatsEntity?
    
    @Query("SELECT * FROM dashboard_stats WHERE id = 1")
    fun observeStats(): Flow<DashboardStatsEntity?>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStatsEntity(stats: DashboardStatsEntity)
    
    @Query("DELETE FROM dashboard_stats")
    suspend fun clearStats()
    
    // Extension functions for model conversion
    suspend fun getLatestStats(): DashboardStats? {
        return getLatestStatsEntity()?.toDashboardStats()
    }
    
    suspend fun insertStats(stats: DashboardStats) {
        insertStatsEntity(stats.toEntity())
    }
}

// Extension functions
fun DashboardStatsEntity.toDashboardStats() = DashboardStats(
    totalExecutions = totalExecutions,
    activeAgents = activeAgents,
    connectedIntegrations = connectedIntegrations,
    totalEvolutions = totalEvolutions,
    uptimeSeconds = uptimeSeconds,
    systemHealth = systemHealth
)

fun DashboardStats.toEntity() = DashboardStatsEntity(
    id = 1,
    totalExecutions = totalExecutions,
    activeAgents = activeAgents,
    connectedIntegrations = connectedIntegrations,
    totalEvolutions = totalEvolutions,
    uptimeSeconds = uptimeSeconds,
    systemHealth = systemHealth
)
