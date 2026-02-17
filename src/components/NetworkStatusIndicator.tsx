/**
 * Network Status Component
 * Add this to your login screen temporarily to diagnose network issues
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Simple fallback network check without NetInfo dependency
export const NetworkStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<string>('Checking...');
  const [color, setColor] = useState<string>('#FFA500');

  const checkConnection = async () => {
    setStatus('Checking...');
    setColor('#FFA500');
    
    try {
      // Test Firebase connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://www.googleapis.com/', {
        method: 'HEAD',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok || response.status === 404) {
        setStatus('✅ Connected to Internet');
        setColor('#4CAF50');
      } else {
        setStatus('⚠️ Limited Connectivity');
        setColor('#FF9800');
      }
    } catch (error: any) {
      console.error('Network check failed:', error);
      setStatus('❌ No Internet Connection');
      setColor('#F44336');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Text style={styles.text}>{status}</Text>
      <TouchableOpacity onPress={checkConnection} style={styles.button}>
        <Text style={styles.buttonText}>🔄 Test Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
