package com.r3sn.automation.di

import android.content.Context
import androidx.room.Room
import com.r3sn.automation.data.local.R3SNDatabase
import com.r3sn.automation.data.local.dao.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    
    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): R3SNDatabase {
        return Room.databaseBuilder(
            context,
            R3SNDatabase::class.java,
            R3SNDatabase.DATABASE_NAME
        )
            .fallbackToDestructiveMigration()
            .build()
    }
    
    @Provides
    @Singleton
    fun provideDashboardDao(database: R3SNDatabase): DashboardDao {
        return database.dashboardDao()
    }
    
    @Provides
    @Singleton
    fun provideExecutionDao(database: R3SNDatabase): ExecutionDao {
        return database.executionDao()
    }
    
    @Provides
    @Singleton
    fun provideWorkflowDao(database: R3SNDatabase): WorkflowDao {
        return database.workflowDao()
    }
    
    @Provides
    @Singleton
    fun provideAgentDao(database: R3SNDatabase): AgentDao {
        return database.agentDao()
    }
    
    @Provides
    @Singleton
    fun provideIntegrationDao(database: R3SNDatabase): IntegrationDao {
        return database.integrationDao()
    }
    
    @Provides
    @Singleton
    fun provideEvolutionDao(database: R3SNDatabase): EvolutionDao {
        return database.evolutionDao()
    }
    
    @Provides
    @Singleton
    fun provideBugDao(database: R3SNDatabase): BugDao {
        return database.bugDao()
    }
    
    @Provides
    @Singleton
    fun provideSettingsDao(database: R3SNDatabase): SettingsDao {
        return database.settingsDao()
    }
}
