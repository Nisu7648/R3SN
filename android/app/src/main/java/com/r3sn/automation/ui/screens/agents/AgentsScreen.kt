package com.r3sn.automation.ui.screens.agents

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
fun AgentsScreen(
    navController: NavController,
    viewModel: AgentsViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    var showCreateDialog by remember { mutableStateOf(false) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Column {
                        Text("AI Agents", fontWeight = FontWeight.Bold)
                        Text(
                            "Unlimited Agents • ${state.agents.size} Active",
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { showCreateDialog = true }) {
                        Icon(Icons.Default.Add, "Create Agent")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { showCreateDialog = true },
                icon = { Icon(Icons.Default.SmartToy, null) },
                text = { Text("Create Agent") }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Agent Stats
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    AgentStat(
                        label = "Total Agents",
                        value = state.agents.size.toString(),
                        icon = Icons.Default.SmartToy
                    )
                    AgentStat(
                        label = "Active Now",
                        value = state.activeAgents.toString(),
                        icon = Icons.Default.PlayCircle
                    )
                    AgentStat(
                        label = "Tasks Done",
                        value = state.totalTasks.toString(),
                        icon = Icons.Default.CheckCircle
                    )
                }
            }
            
            // Agents Grid
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(state.agents) { agent ->
                    AgentCard(
                        agent = agent,
                        onActivate = { viewModel.activateAgent(agent.id) },
                        onDeactivate = { viewModel.deactivateAgent(agent.id) },
                        onDelete = { viewModel.deleteAgent(agent.id) }
                    )
                }
            }
        }
    }
    
    if (showCreateDialog) {
        CreateAgentDialog(
            onDismiss = { showCreateDialog = false },
            onCreate = { name, type ->
                viewModel.createAgent(name, type)
                showCreateDialog = false
            }
        )
    }
}

@Composable
fun AgentStat(
    label: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(32.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        Text(
            text = value,
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
fun AgentCard(
    agent: Agent,
    onActivate: () -> Unit,
    onDeactivate: () -> Unit,
    onDelete: () -> Unit
) {
    var showMenu by remember { mutableStateOf(false) }
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(180.dp),
        shape = RoundedCornerShape(16.dp)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(agent.color.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.SmartToy,
                            contentDescription = null,
                            tint = agent.color,
                            modifier = Modifier.size(28.dp)
                        )
                    }
                    
                    Box {
                        IconButton(
                            onClick = { showMenu = true },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(Icons.Default.MoreVert, null)
                        }
                        
                        DropdownMenu(
                            expanded = showMenu,
                            onDismissRequest = { showMenu = false }
                        ) {
                            if (agent.isActive) {
                                DropdownMenuItem(
                                    text = { Text("Deactivate") },
                                    onClick = {
                                        onDeactivate()
                                        showMenu = false
                                    },
                                    leadingIcon = { Icon(Icons.Default.Pause, null) }
                                )
                            } else {
                                DropdownMenuItem(
                                    text = { Text("Activate") },
                                    onClick = {
                                        onActivate()
                                        showMenu = false
                                    },
                                    leadingIcon = { Icon(Icons.Default.PlayArrow, null) }
                                )
                            }
                            DropdownMenuItem(
                                text = { Text("Delete") },
                                onClick = {
                                    onDelete()
                                    showMenu = false
                                },
                                leadingIcon = { Icon(Icons.Default.Delete, null) }
                            )
                        }
                    }
                }
                
                Column {
                    Text(
                        text = agent.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 1
                    )
                    Text(
                        text = agent.type,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "${agent.tasksCompleted} tasks",
                            style = MaterialTheme.typography.bodySmall,
                            color = agent.color
                        )
                        
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = if (agent.isActive) 
                                Color(0xFF10B981).copy(alpha = 0.2f) 
                            else 
                                Color(0xFF6B7280).copy(alpha = 0.2f)
                        ) {
                            Text(
                                text = if (agent.isActive) "Active" else "Inactive",
                                style = MaterialTheme.typography.labelSmall,
                                color = if (agent.isActive) Color(0xFF10B981) else Color(0xFF6B7280),
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CreateAgentDialog(
    onDismiss: () -> Unit,
    onCreate: (String, String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var selectedType by remember { mutableStateOf("General") }
    val agentTypes = listOf("General", "Data Processor", "API Handler", "Automation", "Analytics")
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Create AI Agent") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Agent Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                
                Text("Agent Type", style = MaterialTheme.typography.labelMedium)
                
                agentTypes.forEach { type ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        RadioButton(
                            selected = selectedType == type,
                            onClick = { selectedType = type }
                        )
                        Text(type)
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onCreate(name, selectedType) },
                enabled = name.isNotBlank()
            ) {
                Text("Create")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

// Data classes
data class AgentsState(
    val agents: List<Agent> = emptyList(),
    val activeAgents: Int = 0,
    val totalTasks: Int = 0
)

data class Agent(
    val id: String,
    val name: String,
    val type: String,
    val color: Color,
    val isActive: Boolean,
    val tasksCompleted: Int
)
