package com.r3sn.automation.data.local.dao

import androidx.room.*
import com.r3sn.automation.data.local.entities.IntegrationEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface IntegrationDao {
    
    @Query("SELECT * FROM integrations ORDER BY name ASC")
    suspend fun getAllIntegrations(): List<IntegrationEntity>
    
    @Query("SELECT * FROM integrations ORDER BY name ASC")
    fun observeIntegrations(): Flow<List<IntegrationEntity>>
    
    @Query("SELECT * FROM integrations WHERE id = :id")
    suspend fun getIntegrationById(id: String): IntegrationEntity?
    
    @Query("SELECT * FROM integrations WHERE isConnected = 1 ORDER BY name ASC")
    suspend fun getConnectedIntegrations(): List<IntegrationEntity>
    
    @Query("SELECT * FROM integrations WHERE category = :category ORDER BY name ASC")
    suspend fun getIntegrationsByCategory(category: String): List<IntegrationEntity>
    
    @Query("SELECT * FROM integrations WHERE name LIKE '%' || :query || '%' ORDER BY name ASC")
    suspend fun searchIntegrations(query: String): List<IntegrationEntity>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertIntegration(integration: IntegrationEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertIntegrations(integrations: List<IntegrationEntity>)
    
    @Update
    suspend fun updateIntegration(integration: IntegrationEntity)
    
    @Delete
    suspend fun deleteIntegration(integration: IntegrationEntity)
    
    @Query("DELETE FROM integrations")
    suspend fun clearAll()
    
    @Query("SELECT COUNT(*) FROM integrations")
    suspend fun getIntegrationCount(): Int
    
    @Query("SELECT COUNT(*) FROM integrations WHERE isConnected = 1")
    suspend fun getConnectedCount(): Int
}
