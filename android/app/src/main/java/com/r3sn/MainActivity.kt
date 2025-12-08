package com.r3sn

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.r3sn.ui.theme.R3SNTheme
import com.r3sn.ui.screens.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        setContent {
            R3SNTheme {
                R3SNApp()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun R3SNApp() {
    val navController = rememberNavController()
    var selectedTab by remember { mutableStateOf(0) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("R3SN Workflow Engine") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    icon = { Text("🏠") },
                    label = { Text("Home") },
                    selected = selectedTab == 0,
                    onClick = {
                        selectedTab = 0
                        navController.navigate("home")
                    }
                )
                NavigationBarItem(
                    icon = { Text("⚙️") },
                    label = { Text("Workflows") },
                    selected = selectedTab == 1,
                    onClick = {
                        selectedTab = 1
                        navController.navigate("workflows")
                    }
                )
                NavigationBarItem(
                    icon = { Text("📦") },
                    label = { Text("Nodes") },
                    selected = selectedTab == 2,
                    onClick = {
                        selectedTab = 2
                        navController.navigate("nodes")
                    }
                )
                NavigationBarItem(
                    icon = { Text("🔌") },
                    label = { Text("Plugins") },
                    selected = selectedTab == 3,
                    onClick = {
                        selectedTab = 3
                        navController.navigate("plugins")
                    }
                )
                NavigationBarItem(
                    icon = { Text("🤖") },
                    label = { Text("ML") },
                    selected = selectedTab == 4,
                    onClick = {
                        selectedTab = 4
                        navController.navigate("ml")
                    }
                )
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = "home",
            modifier = Modifier.padding(paddingValues)
        ) {
            composable("home") { HomeScreen() }
            composable("workflows") { WorkflowsScreen() }
            composable("nodes") { NodesScreen() }
            composable("plugins") { PluginsScreen() }
            composable("ml") { MLInsightsScreen() }
        }
    }
}

@Composable
fun HomeScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Welcome to R3SN",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))
        
        Card(
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Dashboard", style = MaterialTheme.typography.titleLarge)
                Spacer(modifier = Modifier.height(8.dp))
                Text("Active Workflows: 0")
                Text("Total Executions: 0")
                Text("Success Rate: 100%")
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Button(
            onClick = { /* Navigate to workflow builder */ },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Create New Workflow")
        }
    }
}

@Composable
fun WorkflowsScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Workflows",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text("Your workflows will appear here")
    }
}

@Composable
fun NodesScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Node Library",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text("Available nodes will appear here")
    }
}

@Composable
fun PluginsScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Plugin Store",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text("Available plugins will appear here")
    }
}

@Composable
fun MLInsightsScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "ML Insights",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text("AI-powered insights will appear here")
    }
}
