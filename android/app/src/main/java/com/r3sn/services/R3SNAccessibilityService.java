package com.r3sn.services;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.Intent;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;

/**
 * R3SNAccessibilityService - Core automation service
 * Provides full access to UI elements for automation
 */
public class R3SNAccessibilityService extends AccessibilityService {
    private static final String TAG = "R3SNAccessibility";
    private static R3SNAccessibilityService instance;
    
    public static R3SNAccessibilityService getInstance() {
        return instance;
    }
    
    @Override
    public void onServiceConnected() {
        super.onServiceConnected();
        instance = this;
        
        AccessibilityServiceInfo info = new AccessibilityServiceInfo();
        
        // Monitor all events
        info.eventTypes = AccessibilityEvent.TYPES_ALL_MASK;
        
        // Monitor all apps
        info.packageNames = null;
        
        // Get full window content
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
        
        // Retrieve window content
        info.flags = AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS |
                     AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS |
                     AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS;
        
        // No notification timeout
        info.notificationTimeout = 0;
        
        setServiceInfo(info);
        
        Log.d(TAG, "R3SN Accessibility Service Connected - Full Automation Enabled");
    }
    
    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        // Log events for debugging
        if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            CharSequence packageName = event.getPackageName();
            CharSequence className = event.getClassName();
            Log.d(TAG, "Window changed: " + packageName + " - " + className);
        }
        
        // Handle specific events for automation
        handleAutomationEvent(event);
    }
    
    @Override
    public void onInterrupt() {
        Log.d(TAG, "R3SN Accessibility Service Interrupted");
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        instance = null;
        Log.d(TAG, "R3SN Accessibility Service Destroyed");
    }
    
    /**
     * Handle automation events
     */
    private void handleAutomationEvent(AccessibilityEvent event) {
        // Broadcast event to automation engine
        Intent intent = new Intent("com.r3sn.AUTOMATION_EVENT");
        intent.putExtra("eventType", event.getEventType());
        intent.putExtra("packageName", event.getPackageName());
        intent.putExtra("className", event.getClassName());
        sendBroadcast(intent);
    }
    
    /**
     * Get root node of active window
     */
    public AccessibilityNodeInfo getRootNode() {
        return getRootInActiveWindow();
    }
    
    /**
     * Perform global action
     */
    public boolean performGlobalAction(int action) {
        return performGlobalAction(action);
    }
    
    /**
     * Find node by text
     */
    public AccessibilityNodeInfo findNodeByText(String text) {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null) return null;
        return findNodeByTextRecursive(root, text);
    }
    
    private AccessibilityNodeInfo findNodeByTextRecursive(AccessibilityNodeInfo node, String text) {
        if (node.getText() != null && node.getText().toString().contains(text)) {
            return node;
        }
        
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                AccessibilityNodeInfo result = findNodeByTextRecursive(child, text);
                if (result != null) return result;
            }
        }
        
        return null;
    }
    
    /**
     * Find node by ID
     */
    public AccessibilityNodeInfo findNodeById(String id) {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null) return null;
        return findNodeByIdRecursive(root, id);
    }
    
    private AccessibilityNodeInfo findNodeByIdRecursive(AccessibilityNodeInfo node, String id) {
        if (node.getViewIdResourceName() != null && node.getViewIdResourceName().equals(id)) {
            return node;
        }
        
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                AccessibilityNodeInfo result = findNodeByIdRecursive(child, id);
                if (result != null) return result;
            }
        }
        
        return null;
    }
    
    /**
     * Click on node
     */
    public boolean clickNode(AccessibilityNodeInfo node) {
        if (node == null) return false;
        return node.performAction(AccessibilityNodeInfo.ACTION_CLICK);
    }
    
    /**
     * Input text to node
     */
    public boolean inputText(AccessibilityNodeInfo node, String text) {
        if (node == null) return false;
        
        android.os.Bundle arguments = new android.os.Bundle();
        arguments.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text);
        return node.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments);
    }
    
    /**
     * Scroll node
     */
    public boolean scrollNode(AccessibilityNodeInfo node, boolean forward) {
        if (node == null) return false;
        
        int action = forward ? 
            AccessibilityNodeInfo.ACTION_SCROLL_FORWARD : 
            AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD;
        
        return node.performAction(action);
    }
    
    /**
     * Get all text from screen
     */
    public String getAllText() {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null) return "";
        
        StringBuilder text = new StringBuilder();
        extractTextRecursive(root, text);
        return text.toString();
    }
    
    private void extractTextRecursive(AccessibilityNodeInfo node, StringBuilder builder) {
        if (node.getText() != null) {
            builder.append(node.getText()).append("\n");
        }
        
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                extractTextRecursive(child, builder);
            }
        }
    }
}
