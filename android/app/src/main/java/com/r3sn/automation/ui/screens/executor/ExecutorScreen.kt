package com.r3sn.automation.ui.screens.executor

import androidx.compose.animation.*
import androidx.compose.foundation.background
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
fun ExecutorScreen(
    navController: NavController,
    viewModel: ExecutorViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    var promptText by remember { mutableStateOf("") }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Universal Executor",
                        fontWeight = FontWeight.Bold
                    )
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
            // Prompt Input Section
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(16.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        "Execute ANY Prompt",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    
                    Text(
                        "No limits. No restrictions. Just tell R3SN what you want.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    OutlinedTextField(
                        value = promptText,
                        onValueChange = { promptText = it },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(150.dp),
                        placeholder = { 
                            Text("Example: Analyze sales data, generate report, email to team, and schedule follow-up meeting")
                        },
                        maxLines = 6
                    )
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { 
                                viewModel.executePrompt(promptText)
                                promptText = ""
                            },
                            modifier = Modifier.weight(1f),
                            enabled = promptText.isNotBlank() && !state.isExecuting
                        ) {
                            Icon(Icons.Default.PlayArrow, null)
                            Spacer(Modifier.width(8.dp))
                            Text(if (state.isExecuting) "Executing..." else "Execute")
                        }
                        
                        OutlinedButton(
                            onClick = { promptText = "" },
                            enabled = promptText.isNotBlank()
                        ) {
                            Icon(Icons.Default.Clear, null)
                            Spacer(Modifier.width(8.dp))
                            Text("Clear")
                        }
                    }
                }
            }
            
            // Execution Progress
            AnimatedVisibility(
                visible = state.isExecuting,
                enter = expandVertically() + fadeIn(),
                exit = shrinkVertically() + fadeOut()
            ) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                strokeWidth = 2.dp
                            )
                            Text(
                                "Executing...",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                        
                        Text(
                            state.currentStep,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        
                        LinearProgressIndicator(
                            progress = state.progress,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
            
            // Execution History
            Text(
                "Execution History",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(16.dp)
            )
            
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(state.executionHistory) { execution ->
                    ExecutionHistoryCard(execution)
                }
            }
        }
    }
}

@Composable
fun ExecutionHistoryCard(execution: ExecutionItem) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
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
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(
                                when (execution.status) {
                                    ExecutionStatus.SUCCESS -> Color(0xFF10B981).copy(alpha = 0.2f)
                                    ExecutionStatus.FAILED -> Color(0xFFEF4444).copy(alpha = 0.2f)
                                    ExecutionStatus.RUNNING -> Color(0xFF6366F1).copy(alpha = 0.2f)
                                }
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = when (execution.status) {
                                ExecutionStatus.SUCCESS -> Icons.Default.CheckCircle
                                ExecutionStatus.FAILED -> Icons.Default.Error
                                ExecutionStatus.RUNNING -> Icons.Default.HourglassEmpty
                            },
                            contentDescription = null,
                            tint = when (execution.status) {
                                ExecutionStatus.SUCCESS -> Color(0xFF10B981)
                                ExecutionStatus.FAILED -> Color(0xFFEF4444)
                                ExecutionStatus.RUNNING -> Color(0xFF6366F1)
                            },
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    
                    Column {
                        Text(
                            text = execution.prompt,
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.SemiBold,
                            maxLines = 2
                        )
                        Text(
                            text = execution.timestamp,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                
                Text(
                    text = execution.duration,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            if (execution.result.isNotBlank()) {
                Divider()
                Text(
                    text = execution.result,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

// Data classes
data class ExecutorState(
    val isExecuting: Boolean = false,
    val currentStep: String = "",
    val progress: Float = 0f,
    val executionHistory: List<ExecutionItem> = emptyList()
)

data class ExecutionItem(
    val id: String,
    val prompt: String,
    val status: ExecutionStatus,
    val result: String,
    val timestamp: String,
    val duration: String
)

enum class ExecutionStatus {
    SUCCESS, FAILED, RUNNING
}
