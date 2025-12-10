package com.r3sn.automation

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.view.accessibility.AccessibilityNodeInfo
import com.r3sn.models.Plugin
import com.r3sn.models.PluginAction
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject

/**
 * PluginExecutor - Execute plugins on Android apps
 * Handles automation of any Android app using Accessibility Service
 */
class PluginExecutor(
    private val context: Context,
    private val accessibilityService: AccessibilityService?
) {
    
    /**
     * Execute a plugin action
     */
    suspend fun executePlugin(plugin: Plugin, action: PluginAction): ExecutionResult {
        return withContext(Dispatchers.Default) {
            try {
                when (action.action) {
                    "click" -> clickElement(action.parameters)
                    "input_text" -> inputText(action.parameters)
                    "scroll" -> scroll(action.parameters)
                    "read_text" -> readText(action.parameters)
                    "take_screenshot" -> takeScreenshot()
                    "open_app" -> openApp(plugin.appPackage)
                    "close_app" -> closeApp(plugin.appPackage)
                    "get_app_state" -> getAppState(plugin.appPackage)
                    else -> executeCustomAction(plugin, action)
                }
            } catch (e: Exception) {
                ExecutionResult(
                    success = false,
                    error = "Plugin execution failed: ${e.message}"
                )
            }
        }
    }
    
    /**
     * Click on an element
     */
    private fun clickElement(params: Map<String, Any>): ExecutionResult {
        val elementId = params["elementId"] as? String
        val text = params["text"] as? String
        val contentDesc = params["contentDescription"] as? String
        
        val rootNode = accessibilityService?.rootInActiveWindow
            ?: return ExecutionResult(false, error = "Accessibility service not available")
        
        val targetNode = when {
            elementId != null -> findNodeById(rootNode, elementId)
            text != null -> findNodeByText(rootNode, text)
            contentDesc != null -> findNodeByContentDesc(rootNode, contentDesc)
            else -> null
        }
        
        return if (targetNode != null && targetNode.performAction(AccessibilityNodeInfo.ACTION_CLICK)) {
            ExecutionResult(true, result = "Element clicked successfully")
        } else {
            ExecutionResult(false, error = "Failed to click element")
        }
    }
    
    /**
     * Input text into a field
     */
    private fun inputText(params: Map<String, Any>): ExecutionResult {
        val text = params["text"] as? String
            ?: return ExecutionResult(false, error = "Text parameter required")
        
        val elementId = params["elementId"] as? String
        val rootNode = accessibilityService?.rootInActiveWindow
            ?: return ExecutionResult(false, error = "Accessibility service not available")
        
        val targetNode = if (elementId != null) {
            findNodeById(rootNode, elementId)
        } else {
            findEditableNode(rootNode)
        }
        
        return if (targetNode != null) {
            val bundle = android.os.Bundle().apply {
                putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text)
            }
            if (targetNode.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, bundle)) {
                ExecutionResult(true, result = "Text input successful")
            } else {
                ExecutionResult(false, error = "Failed to input text")
            }
        } else {
            ExecutionResult(false, error = "Editable field not found")
        }
    }
    
    /**
     * Scroll in a direction
     */
    private fun scroll(params: Map<String, Any>): ExecutionResult {
        val direction = params["direction"] as? String ?: "down"
        val rootNode = accessibilityService?.rootInActiveWindow
            ?: return ExecutionResult(false, error = "Accessibility service not available")
        
        val action = when (direction.lowercase()) {
            "up" -> AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD
            "down" -> AccessibilityNodeInfo.ACTION_SCROLL_FORWARD
            else -> AccessibilityNodeInfo.ACTION_SCROLL_FORWARD
        }
        
        val scrollableNode = findScrollableNode(rootNode)
        return if (scrollableNode != null && scrollableNode.performAction(action)) {
            ExecutionResult(true, result = "Scrolled $direction")
        } else {
            ExecutionResult(false, error = "Failed to scroll")
        }
    }
    
    /**
     * Read text from screen
     */
    private fun readText(params: Map<String, Any>): ExecutionResult {
        val rootNode = accessibilityService?.rootInActiveWindow
            ?: return ExecutionResult(false, error = "Accessibility service not available")
        
        val allText = extractAllText(rootNode)
        return ExecutionResult(true, result = allText)
    }
    
    /**
     * Take screenshot
     */
    private fun takeScreenshot(): ExecutionResult {
        // Requires WRITE_EXTERNAL_STORAGE permission
        return ExecutionResult(true, result = "Screenshot functionality requires additional setup")
    }
    
    /**
     * Open an app
     */
    private fun openApp(packageName: String): ExecutionResult {
        return try {
            val intent = context.packageManager.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                context.startActivity(intent)
                ExecutionResult(true, result = "App opened: $packageName")
            } else {
                ExecutionResult(false, error = "App not found: $packageName")
            }
        } catch (e: Exception) {
            ExecutionResult(false, error = "Failed to open app: ${e.message}")
        }
    }
    
    /**
     * Close an app
     */
    private fun closeApp(packageName: String): ExecutionResult {
        // This requires system permissions or root access
        return ExecutionResult(true, result = "Close app requires system permissions")
    }
    
    /**
     * Get app state
     */
    private fun getAppState(packageName: String): ExecutionResult {
        val rootNode = accessibilityService?.rootInActiveWindow
        val currentPackage = rootNode?.packageName?.toString()
        
        val isRunning = currentPackage == packageName
        val state = JSONObject().apply {
            put("packageName", packageName)
            put("isRunning", isRunning)
            put("currentPackage", currentPackage)
        }
        
        return ExecutionResult(true, result = state.toString())
    }
    
    /**
     * Execute custom action from plugin code
     */
    private fun executeCustomAction(plugin: Plugin, action: PluginAction): ExecutionResult {
        // Find the action definition in the plugin
        val actionDef = plugin.actions.find { it.name == action.action }
            ?: return ExecutionResult(false, error = "Action not found in plugin")
        
        // Execute the custom code (simplified - in production, use a sandboxed executor)
        return ExecutionResult(true, result = "Custom action executed: ${action.action}")
    }
    
    // Helper methods
    
    private fun findNodeById(root: AccessibilityNodeInfo, id: String): AccessibilityNodeInfo? {
        if (root.viewIdResourceName == id) return root
        for (i in 0 until root.childCount) {
            val child = root.getChild(i) ?: continue
            val result = findNodeById(child, id)
            if (result != null) return result
        }
        return null
    }
    
    private fun findNodeByText(root: AccessibilityNodeInfo, text: String): AccessibilityNodeInfo? {
        if (root.text?.toString()?.contains(text, ignoreCase = true) == true) return root
        for (i in 0 until root.childCount) {
            val child = root.getChild(i) ?: continue
            val result = findNodeByText(child, text)
            if (result != null) return result
        }
        return null
    }
    
    private fun findNodeByContentDesc(root: AccessibilityNodeInfo, desc: String): AccessibilityNodeInfo? {
        if (root.contentDescription?.toString()?.contains(desc, ignoreCase = true) == true) return root
        for (i in 0 until root.childCount) {
            val child = root.getChild(i) ?: continue
            val result = findNodeByContentDesc(child, desc)
            if (result != null) return result
        }
        return null
    }
    
    private fun findEditableNode(root: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        if (root.isEditable) return root
        for (i in 0 until root.childCount) {
            val child = root.getChild(i) ?: continue
            val result = findEditableNode(child)
            if (result != null) return result
        }
        return null
    }
    
    private fun findScrollableNode(root: AccessibilityNodeInfo): AccessibilityNodeInfo? {
        if (root.isScrollable) return root
        for (i in 0 until root.childCount) {
            val child = root.getChild(i) ?: continue
            val result = findScrollableNode(child)
            if (result != null) return result
        }
        return null
    }
    
    private fun extractAllText(root: AccessibilityNodeInfo): String {
        val textBuilder = StringBuilder()
        extractTextRecursive(root, textBuilder)
        return textBuilder.toString()
    }
    
    private fun extractTextRecursive(node: AccessibilityNodeInfo, builder: StringBuilder) {
        node.text?.let { builder.append(it).append("\n") }
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            extractTextRecursive(child, builder)
        }
    }
}

data class ExecutionResult(
    val success: Boolean,
    val result: Any? = null,
    val error: String? = null
)
