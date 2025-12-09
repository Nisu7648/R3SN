package com.r3sn.automation.ui.screens.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.r3sn.automation.navigation.Screen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    navController: NavController,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Column {
                        Text(
                            "R3SN Dashboard",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            "Revolutionary Automation Platform",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { navController.navigate(Screen.Settings.route) }) {
                        Icon(Icons.Default.Settings, "Settings")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Quick Stats
            item {
                QuickStatsSection(state)
            }
            
            // Quick Actions
            item {
                Text(
                    "Quick Actions",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }
            
            item {
                QuickActionsGrid(navController)
            }
            
            // System Status
            item {
                Text(
                    "System Status",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
            
            item {
                SystemStatusSection(state)
            }
            
            // Recent Activity
            item {
                Text(
                    "Recent Activity",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
            
            items(state.recentActivities) { activity ->
                ActivityCard(activity)
            }
        }
    }
}

@Composable
fun QuickStatsSection(state: DashboardState) {
    LazyRow(
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            StatCard(
                title = "Total Executions",
                value = state.totalExecutions.toString(),
                icon = Icons.Default.PlayArrow,
                gradient = Brush.linearGradient(
                    colors = listOf(Color(0xFF6366F1), Color(0xFF8B5CF6))
                )
            )
        }
        
        item {
            StatCard(
                title = "Active Agents",
                value = state.activeAgents.toString(),
                icon = Icons.Default.SmartToy,
                gradient = Brush.linearGradient(
                    colors = listOf(Color(0xFF10B981), Color(0xFF059669))
                )
            )
        }
        
        item {
            StatCard(
                title = "Integrations",
                value = "800+",
                icon = Icons.Default.Extension,
                gradient = Brush.linearGradient(
                    colors = listOf(Color(0xFFF59E0B), Color(0xFFD97706))
                )
            )
        }
        
        item {
            StatCard(
                title = "Evolutions",
                value = state.totalEvolutions.toString(),
                icon = Icons.Default.AutoAwesome,
                gradient = Brush.linearGradient(
                    colors = listOf(Color(0xFFEC4899), Color(0xFFDB2777))
                )
            )
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: ImageVector,
    gradient: Brush
) {
    Card(
        modifier = Modifier
            .width(160.dp)
            .height(120.dp),
        shape = RoundedCornerShape(16.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(gradient)
                .padding(16.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = Color.White,
                    modifier = Modifier.size(32.dp)
                )
                
                Column {
                    Text(
                        text = value,
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = title,
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.White.copy(alpha = 0.9f)
                    )
                }
            }
        }
    }
}

@Composable
fun QuickActionsGrid(navController: NavController) {
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            QuickActionCard(
                title = "Execute Prompt",
                icon = Icons.Default.Terminal,
                color = Color(0xFF6366F1),
                modifier = Modifier.weight(1f),
                onClick = { navController.navigate(Screen.Executor.route) }
            )
            
            QuickActionCard(
                title = "Workflows",
                icon = Icons.Default.AccountTree,
                color = Color(0xFF10B981),
                modifier = Modifier.weight(1f),
                onClick = { navController.navigate(Screen.Workflows.route) }
            )
        }
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            QuickActionCard(
                title = "Integrations",
                icon = Icons.Default.Extension,
                color = Color(0xFFF59E0B),
                modifier = Modifier.weight(1f),
                onClick = { navController.navigate(Screen.Integrations.route) }
            )
            
            QuickActionCard(
                title = "AI Agents",
                icon = Icons.Default.SmartToy,
                color = Color(0xFFEC4899),
                modifier = Modifier.weight(1f),
                onClick = { navController.navigate(Screen.Agents.route) }
            )
        }
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            QuickActionCard(
                title = "Evolution",
                icon = Icons.Default.AutoAwesome,
                color = Color(0xFF8B5CF6),
                modifier = Modifier.weight(1f),
                onClick = { navController.navigate(Screen.Evolution.route) }
            )
            
            QuickActionCard(
                title = "Analytics",
                icon = Icons.Default.Analytics,
                color = Color(0xFF06B6D4),
                modifier = Modifier.weight(1f),
                onClick = { navController.navigate(Screen.Analytics.route) }
            )
        }
    }
}

@Composable
fun QuickActionCard(
    title: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier
            .height(100.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = color.copy(alpha = 0.1f)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = color,
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.SemiBold,
                color = color
            )
        }
    }
}

@Composable
fun SystemStatusSection(state: DashboardState) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatusItem(
                label = "System Health",
                value = "Healthy",
                color = Color(0xFF10B981),
                icon = Icons.Default.CheckCircle
            )
            
            StatusItem(
                label = "Self-Evolution",
                value = "Active",
                color = Color(0xFF6366F1),
                icon = Icons.Default.AutoAwesome
            )
            
            StatusItem(
                label = "Self-Debugging",
                value = "Monitoring",
                color = Color(0xFFF59E0B),
                icon = Icons.Default.BugReport
            )
            
            StatusItem(
                label = "Uptime",
                value = state.uptime,
                color = Color(0xFF06B6D4),
                icon = Icons.Default.Timer
            )
        }
    }
}

@Composable
fun StatusItem(
    label: String,
    value: String,
    color: Color,
    icon: ImageVector
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = color,
                modifier = Modifier.size(20.dp)
            )
            Text(
                text = label,
                style = MaterialTheme.typography.bodyMedium
            )
        }
        
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.SemiBold,
            color = color
        )
    }
}

@Composable
fun ActivityCard(activity: Activity) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(activity.color.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = activity.icon,
                        contentDescription = null,
                        tint = activity.color,
                        modifier = Modifier.size(24.dp)
                    )
                }
                
                Column {
                    Text(
                        text = activity.title,
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = activity.description,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            
            Text(
                text = activity.time,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

// Data classes
data class DashboardState(
    val totalExecutions: Int = 0,
    val activeAgents: Int = 0,
    val totalEvolutions: Int = 0,
    val uptime: String = "0h 0m",
    val recentActivities: List<Activity> = emptyList()
)

data class Activity(
    val title: String,
    val description: String,
    val time: String,
    val icon: ImageVector,
    val color: Color
)
