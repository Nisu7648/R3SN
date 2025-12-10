package com.r3sn.automation.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.r3sn.automation.data.local.dao.*
import com.r3sn.automation.data.local.entities.*

@Database(
    entities = [
        DashboardStatsEntity::class,
        ExecutionEntity::class,
        WorkflowEntity::class,
        AgentEntity::class,
        IntegrationEntity::class,
        EvolutionEventEntity::class,
        BugEntity::class,
        UserSettingsEntity::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class R3SNDatabase : RoomDatabase() {
    
    abstract fun dashboardDao(): DashboardDao
    abstract fun executionDao(): ExecutionDao
    abstract fun workflowDao(): WorkflowDao
    abstract fun agentDao(): AgentDao
    abstract fun integrationDao(): IntegrationDao
    abstract fun evolutionDao(): EvolutionDao
    abstract fun bugDao(): BugDao
    abstract fun settingsDao(): SettingsDao
    
    companion object {
        const val DATABASE_NAME = "r3sn_database"
    }
}
