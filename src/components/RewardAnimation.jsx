// components/RewardAnimation.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import LottieView from 'lottie-react-native';

export const RewardAnimation = ({ 
  type, // 'poin' | 'medal'
  isVisible, 
  onComplete,
  message 
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      startAnimation();
    }
  }, [isVisible]);

  const startAnimation = () => {
    // Reset values
    scaleAnim.setValue(0);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after 3 seconds
    setTimeout(() => {
      hideAnimation();
    }, 3000);
  };

  const hideAnimation = () => {
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      onComplete?.();
    });
  };

  if (!isVisible) return null;

  return (
    <Animated.View 
      style={[
        styles.overlay,
        { opacity: opacityAnim }
      ]}
    >
      <Animated.View 
        style={[
          styles.animationContainer,
          {
            transform: [
              { scale: scaleAnim },
              { 
                translateY: scaleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0]
                })
              }
            ]
          }
        ]}
      >
        {/* Confetti Background Effect */}
        <View style={styles.confettiContainer}>
          {[...Array(20)].map((_, i) => (
            <Text 
              key={i}
              style={[
                styles.confetti,
                {
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 1}s`,
                  fontSize: 20 + Math.random() * 15,
                }
              ]}
            >
              {['🎉', '✨', '🌟', '💫', '⭐️'][Math.floor(Math.random() * 5)]}
            </Text>
          ))}
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {type === 'poin' ? (
            <>
              <Text style={styles.emoji}>💰</Text>
              <Text style={styles.title}>Yeay! Berhasil Menabung!</Text>
              <Text style={styles.message}>{message}</Text>
              <View style={styles.poinContainer}>
                <Text style={styles.poinText}>+30 Poin!</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.emoji}>🏆</Text>
              <Text style={styles.title}>Level Up! 🎊</Text>
              <Text style={styles.message}>{message}</Text>
              <View style={styles.medalContainer}>
                <Text style={styles.medalText}>Medali Baru!</Text>
              </View>
            </>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  animationContainer: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 30,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  confettiContainer: {
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  confetti: {
    position: 'absolute',
    opacity: 0.7,
  },
  content: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  poinContainer: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFC400',
  },
  poinText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
  },
  medalContainer: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#2691B5',
  },
  medalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2691B5',
  },
});