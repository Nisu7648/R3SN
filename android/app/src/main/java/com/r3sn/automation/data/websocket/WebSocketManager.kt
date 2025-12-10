package com.r3sn.automation.data.websocket

import com.google.gson.Gson
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.receiveAsFlow
import okhttp3.*
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WebSocketManager @Inject constructor(
    private val okHttpClient: OkHttpClient,
    private val gson: Gson
) {
    
    private var webSocket: WebSocket? = null
    private val _messages = Channel<WebSocketMessage>(Channel.UNLIMITED)
    val messages: Flow<WebSocketMessage> = _messages.receiveAsFlow()
    
    private val _connectionState = Channel<ConnectionState>(Channel.CONFLATED)
    val connectionState: Flow<ConnectionState> = _connectionState.receiveAsFlow()
    
    private var reconnectAttempts = 0
    private val maxReconnectAttempts = 5
    private var shouldReconnect = true
    
    fun connect(url: String, token: String) {
        if (webSocket != null) {
            Timber.d("WebSocket already connected")
            return
        }
        
        val request = Request.Builder()
            .url(url)
            .addHeader("Authorization", "Bearer $token")
            .build()
        
        webSocket = okHttpClient.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Timber.d("WebSocket connected")
                reconnectAttempts = 0
                _connectionState.trySend(ConnectionState.Connected)
                
                // Subscribe to events
                subscribeToEvents()
            }
            
            override fun onMessage(webSocket: WebSocket, text: String) {
                Timber.d("WebSocket message received: $text")
                try {
                    val message = gson.fromJson(text, WebSocketMessage::class.java)
                    _messages.trySend(message)
                } catch (e: Exception) {
                    Timber.e(e, "Failed to parse WebSocket message")
                }
            }
            
            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                Timber.d("WebSocket closing: $code - $reason")
                _connectionState.trySend(ConnectionState.Disconnecting)
            }
            
            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                Timber.d("WebSocket closed: $code - $reason")
                _connectionState.trySend(ConnectionState.Disconnected)
                this@WebSocketManager.webSocket = null
                
                if (shouldReconnect && reconnectAttempts < maxReconnectAttempts) {
                    reconnect(url, token)
                }
            }
            
            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Timber.e(t, "WebSocket failure")
                _connectionState.trySend(ConnectionState.Error(t.message ?: "Unknown error"))
                this@WebSocketManager.webSocket = null
                
                if (shouldReconnect && reconnectAttempts < maxReconnectAttempts) {
                    reconnect(url, token)
                }
            }
        })
    }
    
    private fun subscribeToEvents() {
        sendMessage(
            WebSocketMessage(
                type = "subscribe",
                data = mapOf(
                    "events" to listOf(
                        "execution:started",
                        "execution:completed",
                        "execution:failed",
                        "workflow:started",
                        "workflow:completed",
                        "workflow:failed",
                        "agent:activated",
                        "agent:deactivated",
                        "evolution:started",
                        "evolution:completed",
                        "debug:bug_detected",
                        "debug:bug_fixed",
                        "metrics:update",
                        "alert"
                    )
                )
            )
        )
    }
    
    private fun reconnect(url: String, token: String) {
        reconnectAttempts++
        Timber.d("Reconnecting... Attempt $reconnectAttempts/$maxReconnectAttempts")
        
        // Exponential backoff
        val delay = (1000 * Math.pow(2.0, reconnectAttempts.toDouble())).toLong()
        
        Thread.sleep(delay)
        connect(url, token)
    }
    
    fun sendMessage(message: WebSocketMessage) {
        val json = gson.toJson(message)
        webSocket?.send(json)
    }
    
    fun disconnect() {
        shouldReconnect = false
        webSocket?.close(1000, "Client disconnect")
        webSocket = null
    }
    
    fun isConnected(): Boolean {
        return webSocket != null
    }
}

data class WebSocketMessage(
    val type: String,
    val data: Map<String, Any>? = null,
    val timestamp: Long = System.currentTimeMillis()
)

sealed class ConnectionState {
    object Connecting : ConnectionState()
    object Connected : ConnectionState()
    object Disconnecting : ConnectionState()
    object Disconnected : ConnectionState()
    data class Error(val message: String) : ConnectionState()
}
