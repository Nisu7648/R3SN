package com.r3sn.automation.ui.screens.integrations

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IntegrationsScreen(
    navController: NavController,
    viewModel: IntegrationsViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("All") }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Column {
                        Text(
                            "Integrations",
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            "800+ Apps Connected",
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { 
                    searchQuery = it
                    viewModel.searchIntegrations(it)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                placeholder = { Text("Search 800+ integrations...") },
                leadingIcon = { Icon(Icons.Default.Search, null) },
                trailingIcon = {
                    if (searchQuery.isNotBlank()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Clear, null)
                        }
                    }
                },
                singleLine = true
            )
            
            // Category Filters
            ScrollableTabRow(
                selectedTabIndex = state.categories.indexOf(selectedCategory),
                modifier = Modifier.fillMaxWidth(),
                edgePadding = 16.dp
            ) {
                state.categories.forEach { category ->
                    Tab(
                        selected = selectedCategory == category,
                        onClick = { 
                            selectedCategory = category
                            viewModel.filterByCategory(category)
                        },
                        text = { Text(category) }
                    )
                }
            }
            
            // Stats Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                IntegrationStat(
                    label = "Total",
                    value = state.totalIntegrations.toString(),
                    color = Color(0xFF6366F1)
                )
                IntegrationStat(
                    label = "Connected",
                    value = state.connectedIntegrations.toString(),
                    color = Color(0xFF10B981)
                )
                IntegrationStat(
                    label = "Available",
                    value = state.availableIntegrations.toString(),
                    color = Color(0xFFF59E0B)
                )
            }
            
            // Integrations List
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(state.integrations) { integration ->
                    IntegrationCard(
                        integration = integration,
                        onConnect = { viewModel.connectIntegration(integration.id) },
                        onDisconnect = { viewModel.disconnectIntegration(integration.id) }
                    )
                }
            }
        }
    }
}

@Composable
fun IntegrationStat(
    label: String,
    value: String,
    color: Color
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = value,
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
fun IntegrationCard(
    integration: Integration,
    onConnect: () -> Unit,
    onDisconnect: () -> Unit
) {
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
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(integration.color.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = integration.icon,
                        contentDescription = null,
                        tint = integration.color,
                        modifier = Modifier.size(28.dp)
                    )
                }
                
                Column(
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = integration.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = integration.category,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "${integration.features.size} features",
                        style = MaterialTheme.typography.bodySmall,
                        color = integration.color
                    )
                }
            }
            
            if (integration.isConnected) {
                FilledTonalButton(
                    onClick = onDisconnect,
                    colors = ButtonDefaults.filledTonalButtonColors(
                        containerColor = Color(0xFFEF4444).copy(alpha = 0.2f),
                        contentColor = Color(0xFFEF4444)
                    )
                ) {
                    Icon(Icons.Default.LinkOff, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Disconnect")
                }
            } else {
                Button(onClick = onConnect) {
                    Icon(Icons.Default.Link, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Connect")
                }
            }
        }
    }
}

// Data classes
data class IntegrationsState(
    val totalIntegrations: Int = 800,
    val connectedIntegrations: Int = 0,
    val availableIntegrations: Int = 800,
    val categories: List<String> = listOf(
        "All", "Productivity", "Communication", "Finance", 
        "Social Media", "Development", "Marketing", "E-commerce"
    ),
    val integrations: List<Integration> = emptyList()
)

data class Integration(
    val id: String,
    val name: String,
    val category: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val color: Color,
    val features: List<String>,
    val isConnected: Boolean = false
)
