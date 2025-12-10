package com.r3sn.automation.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "r3sn_preferences")

@Singleton
class PreferencesManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    
    private val dataStore = context.dataStore
    
    // Keys
    private object Keys {
        val AUTH_TOKEN = stringPreferencesKey("auth_token")
        val USER_ID = stringPreferencesKey("user_id")
        val USER_EMAIL = stringPreferencesKey("user_email")
        val USER_NAME = stringPreferencesKey("user_name")
        val API_ENDPOINT = stringPreferencesKey("api_endpoint")
        val THEME = stringPreferencesKey("theme")
        val NOTIFICATIONS_ENABLED = booleanPreferencesKey("notifications_enabled")
        val EXECUTION_COMPLETE_NOTIF = booleanPreferencesKey("execution_complete_notif")
        val WORKFLOW_FAILED_NOTIF = booleanPreferencesKey("workflow_failed_notif")
        val EVOLUTION_DEPLOYED_NOTIF = booleanPreferencesKey("evolution_deployed_notif")
        val BUG_FIXED_NOTIF = booleanPreferencesKey("bug_fixed_notif")
        val AUTO_EVOLUTION = booleanPreferencesKey("auto_evolution")
        val AUTO_DEBUGGING = booleanPreferencesKey("auto_debugging")
        val FIRST_LAUNCH = booleanPreferencesKey("first_launch")
    }
    
    // Auth
    suspend fun saveAuthToken(token: String) {
        dataStore.edit { preferences ->
            preferences[Keys.AUTH_TOKEN] = token
        }
    }
    
    fun getAuthToken(): String? {
        return runBlocking {
            dataStore.data.first()[Keys.AUTH_TOKEN]
        }
    }
    
    suspend fun clearAuthToken() {
        dataStore.edit { preferences ->
            preferences.remove(Keys.AUTH_TOKEN)
        }
    }
    
    // User Info
    suspend fun saveUserInfo(userId: String, email: String, name: String) {
        dataStore.edit { preferences ->
            preferences[Keys.USER_ID] = userId
            preferences[Keys.USER_EMAIL] = email
            preferences[Keys.USER_NAME] = name
        }
    }
    
    fun getUserId(): String? {
        return runBlocking {
            dataStore.data.first()[Keys.USER_ID]
        }
    }
    
    fun getUserEmail(): String? {
        return runBlocking {
            dataStore.data.first()[Keys.USER_EMAIL]
        }
    }
    
    fun getUserName(): String? {
        return runBlocking {
            dataStore.data.first()[Keys.USER_NAME]
        }
    }
    
    // API Endpoint
    suspend fun saveApiEndpoint(endpoint: String) {
        dataStore.edit { preferences ->
            preferences[Keys.API_ENDPOINT] = endpoint
        }
    }
    
    fun getApiEndpoint(): String? {
        return runBlocking {
            dataStore.data.first()[Keys.API_ENDPOINT]
        }
    }
    
    // Theme
    suspend fun saveTheme(theme: String) {
        dataStore.edit { preferences ->
            preferences[Keys.THEME] = theme
        }
    }
    
    fun getThemeFlow(): Flow<String> {
        return dataStore.data.map { preferences ->
            preferences[Keys.THEME] ?: "system"
        }
    }
    
    // Notifications
    suspend fun setNotificationsEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[Keys.NOTIFICATIONS_ENABLED] = enabled
        }
    }
    
    fun getNotificationsEnabled(): Flow<Boolean> {
        return dataStore.data.map { preferences ->
            preferences[Keys.NOTIFICATIONS_ENABLED] ?: true
        }
    }
    
    suspend fun setExecutionCompleteNotif(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[Keys.EXECUTION_COMPLETE_NOTIF] = enabled
        }
    }
    
    fun getExecutionCompleteNotif(): Flow<Boolean> {
        return dataStore.data.map { preferences ->
            preferences[Keys.EXECUTION_COMPLETE_NOTIF] ?: true
        }
    }
    
    suspend fun setWorkflowFailedNotif(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[Keys.WORKFLOW_FAILED_NOTIF] = enabled
        }
    }
    
    fun getWorkflowFailedNotif(): Flow<Boolean> {
        return dataStore.data.map { preferences ->
            preferences[Keys.WORKFLOW_FAILED_NOTIF] ?: true
        }
    }
    
    suspend fun setEvolutionDeployedNotif(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[Keys.EVOLUTION_DEPLOYED_NOTIF] = enabled
        }
    }
    
    fun getEvolutionDeployedNotif(): Flow<Boolean> {
        return dataStore.data.map { preferences ->
            preferences[Keys.EVOLUTION_DEPLOYED_NOTIF] ?: true
        }
    }
    
    suspend fun setBugFixedNotif(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[Keys.BUG_FIXED_NOTIF] = enabled
        }
    }
    
    fun getBugFixedNotif(): Flow<Boolean> {
        return dataStore.data.map { preferences ->
            preferences[Keys.BUG_FIXED_NOTIF] ?: true
        }
    }
    
    // Features
    suspend fun setAutoEvolution(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[Keys.AUTO_EVOLUTION] = enabled
        }
    }
    
    fun getAutoEvolution(): Flow<Boolean> {
        return dataStore.data.map { preferences ->
            preferences[Keys.AUTO_EVOLUTION] ?: true
        }
    }
    
    suspend fun setAutoDebugging(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[Keys.AUTO_DEBUGGING] = enabled
        }
    }
    
    fun getAutoDebugging(): Flow<Boolean> {
        return dataStore.data.map { preferences ->
            preferences[Keys.AUTO_DEBUGGING] ?: true
        }
    }
    
    // First Launch
    suspend fun setFirstLaunch(isFirst: Boolean) {
        dataStore.edit { preferences ->
            preferences[Keys.FIRST_LAUNCH] = isFirst
        }
    }
    
    fun isFirstLaunch(): Flow<Boolean> {
        return dataStore.data.map { preferences ->
            preferences[Keys.FIRST_LAUNCH] ?: true
        }
    }
    
    // Clear all
    suspend fun clearAll() {
        dataStore.edit { preferences ->
            preferences.clear()
        }
    }
}
