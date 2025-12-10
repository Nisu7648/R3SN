package com.r3sn.automation

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import androidx.work.Configuration
import androidx.work.WorkManager
import dagger.hilt.android.HiltAndroidApp
import timber.log.Timber

@HiltAndroidApp
class R3SNApplication : Application(), Configuration.Provider {
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize Timber for logging
        if (BuildConfig.DEBUG) {
            Timber.plant(Timber.DebugTree())
        }
        
        // Create notification channels
        createNotificationChannels()
        
        Timber.d("R3SN Application initialized")
    }
    
    override fun getWorkManagerConfiguration(): Configuration {
        return Configuration.Builder()
            .setMinimumLoggingLevel(if (BuildConfig.DEBUG) android.util.Log.DEBUG else android.util.Log.ERROR)
            .build()
    }
    
    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channels = listOf(
                NotificationChannel(
                    CHANNEL_EXECUTIONS,
                    "Executions",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "Notifications for prompt executions"
                },
                NotificationChannel(
                    CHANNEL_WORKFLOWS,
                    "Workflows",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "Notifications for workflow executions"
                },
                NotificationChannel(
                    CHANNEL_EVOLUTION,
                    "Evolution",
                    NotificationManager.IMPORTANCE_LOW
                ).apply {
                    description = "Notifications for system evolution events"
                },
                NotificationChannel(
                    CHANNEL_DEBUGGING,
                    "Debugging",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Notifications for bug fixes and system health"
                },
                NotificationChannel(
                    CHANNEL_GENERAL,
                    "General",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "General notifications"
                }
            )
            
            val notificationManager = getSystemService(NotificationManager::class.java)
            channels.forEach { channel ->
                notificationManager.createNotificationChannel(channel)
            }
        }
    }
    
    companion object {
        const val CHANNEL_EXECUTIONS = "executions"
        const val CHANNEL_WORKFLOWS = "workflows"
        const val CHANNEL_EVOLUTION = "evolution"
        const val CHANNEL_DEBUGGING = "debugging"
        const val CHANNEL_GENERAL = "general"
    }
}
