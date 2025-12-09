package com.r3sn.automation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.r3sn.automation.ui.screens.dashboard.DashboardScreen
import com.r3sn.automation.ui.screens.executor.ExecutorScreen
import com.r3sn.automation.ui.screens.integrations.IntegrationsScreen
import com.r3sn.automation.ui.screens.workflows.WorkflowsScreen
import com.r3sn.automation.ui.screens.agents.AgentsScreen
import com.r3sn.automation.ui.screens.analytics.AnalyticsScreen
import com.r3sn.automation.ui.screens.settings.SettingsScreen
import com.r3sn.automation.ui.screens.evolution.EvolutionScreen
import com.r3sn.automation.ui.screens.debugging.DebuggingScreen

sealed class Screen(val route: String) {
    object Dashboard : Screen("dashboard")
    object Executor : Screen("executor")
    object Integrations : Screen("integrations")
    object Workflows : Screen("workflows")
    object Agents : Screen("agents")
    object Analytics : Screen("analytics")
    object Evolution : Screen("evolution")
    object Debugging : Screen("debugging")
    object Settings : Screen("settings")
}

@Composable
fun R3SNNavigation(
    navController: NavHostController = rememberNavController()
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Dashboard.route
    ) {
        composable(Screen.Dashboard.route) {
            DashboardScreen(navController = navController)
        }
        
        composable(Screen.Executor.route) {
            ExecutorScreen(navController = navController)
        }
        
        composable(Screen.Integrations.route) {
            IntegrationsScreen(navController = navController)
        }
        
        composable(Screen.Workflows.route) {
            WorkflowsScreen(navController = navController)
        }
        
        composable(Screen.Agents.route) {
            AgentsScreen(navController = navController)
        }
        
        composable(Screen.Analytics.route) {
            AnalyticsScreen(navController = navController)
        }
        
        composable(Screen.Evolution.route) {
            EvolutionScreen(navController = navController)
        }
        
        composable(Screen.Debugging.route) {
            DebuggingScreen(navController = navController)
        }
        
        composable(Screen.Settings.route) {
            SettingsScreen(navController = navController)
        }
    }
}
