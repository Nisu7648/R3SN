package com.r3sn.automation.data.local.dao

import androidx.room.*
import com.r3sn.automation.data.local.entities.UserSettingsEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SettingsDao {
    
    @Query("SELECT * FROM user_settings WHERE userId = :userId")
    suspend fun getSettings(userId: String): UserSettingsEntity?
    
    @Query("SELECT * FROM user_settings WHERE userId = :userId")
    fun observeSettings(userId: String): Flow<UserSettingsEntity?>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSettings(settings: UserSettingsEntity)
    
    @Update
    suspend fun updateSettings(settings: UserSettingsEntity)
    
    @Delete
    suspend fun deleteSettings(settings: UserSettingsEntity)
    
    @Query("DELETE FROM user_settings")
    suspend fun clearAll()
}
