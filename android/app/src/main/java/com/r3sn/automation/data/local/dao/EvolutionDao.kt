package com.r3sn.automation.data.local.dao

import androidx.room.*
import com.r3sn.automation.data.local.entities.EvolutionEventEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface EvolutionDao {
    
    @Query("SELECT * FROM evolution_events ORDER BY timestamp DESC LIMIT :limit")
    suspend fun getRecentEvents(limit: Int = 20): List<EvolutionEventEntity>
    
    @Query("SELECT * FROM evolution_events ORDER BY timestamp DESC")
    fun observeEvents(): Flow<List<EvolutionEventEntity>>
    
    @Query("SELECT * FROM evolution_events WHERE id = :id")
    suspend fun getEventById(id: String): EvolutionEventEntity?
    
    @Query("SELECT * FROM evolution_events WHERE type = :type ORDER BY timestamp DESC")
    suspend fun getEventsByType(type: String): List<EvolutionEventEntity>
    
    @Query("SELECT * FROM evolution_events WHERE status = :status ORDER BY timestamp DESC")
    suspend fun getEventsByStatus(status: String): List<EvolutionEventEntity>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEvent(event: EvolutionEventEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEvents(events: List<EvolutionEventEntity>)
    
    @Update
    suspend fun updateEvent(event: EvolutionEventEntity)
    
    @Delete
    suspend fun deleteEvent(event: EvolutionEventEntity)
    
    @Query("DELETE FROM evolution_events WHERE timestamp < :timestamp")
    suspend fun deleteOldEvents(timestamp: Long)
    
    @Query("DELETE FROM evolution_events")
    suspend fun clearAll()
    
    @Query("SELECT COUNT(*) FROM evolution_events")
    suspend fun getEventCount(): Int
    
    @Query("SELECT COUNT(*) FROM evolution_events WHERE status = 'completed'")
    suspend fun getCompletedCount(): Int
}
