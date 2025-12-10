package com.r3sn.automation.data.local.dao

import androidx.room.*
import com.r3sn.automation.data.local.entities.BugEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface BugDao {
    
    @Query("SELECT * FROM bugs ORDER BY lastSeen DESC")
    suspend fun getAllBugs(): List<BugEntity>
    
    @Query("SELECT * FROM bugs ORDER BY lastSeen DESC")
    fun observeBugs(): Flow<List<BugEntity>>
    
    @Query("SELECT * FROM bugs WHERE id = :id")
    suspend fun getBugById(id: String): BugEntity?
    
    @Query("SELECT * FROM bugs WHERE status = :status ORDER BY lastSeen DESC")
    suspend fun getBugsByStatus(status: String): List<BugEntity>
    
    @Query("SELECT * FROM bugs WHERE severity = :severity ORDER BY lastSeen DESC")
    suspend fun getBugsBySeverity(severity: String): List<BugEntity>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBug(bug: BugEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBugs(bugs: List<BugEntity>)
    
    @Update
    suspend fun updateBug(bug: BugEntity)
    
    @Delete
    suspend fun deleteBug(bug: BugEntity)
    
    @Query("DELETE FROM bugs WHERE status = 'fixed' AND lastSeen < :timestamp")
    suspend fun deleteOldFixedBugs(timestamp: Long)
    
    @Query("DELETE FROM bugs")
    suspend fun clearAll()
    
    @Query("SELECT COUNT(*) FROM bugs")
    suspend fun getBugCount(): Int
    
    @Query("SELECT COUNT(*) FROM bugs WHERE status = 'active'")
    suspend fun getActiveBugCount(): Int
    
    @Query("SELECT COUNT(*) FROM bugs WHERE status = 'fixed'")
    suspend fun getFixedBugCount(): Int
}
