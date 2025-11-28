// contexts/TabunganContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../api/apiClient';

const TabunganContext = createContext();

export const useTabungan = () => {
  const context = useContext(TabunganContext);
  if (!context) {
    throw new Error('useTabungan must be used within TabunganProvider');
  }
  return context;
};

export const TabunganProvider = ({ children }) => {
  const [tabunganList, setTabunganList] = useState([]);
  const [sampahList, setSampahList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // Initialize user ID
  const initializeUser = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const id = user.idPengguna || user.id;
        setUserId(id);
        return id;
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
    return null;
  }, []);

  // Fetch tabungan aktif
  const fetchTabungan = useCallback(async (forceUserId = null) => {
    const currentUserId = forceUserId || userId;
    if (!currentUserId) {
      const id = await initializeUser();
      if (!id) return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/target-tabungan/pengguna/${currentUserId || userId}`
      );

      if (response.data) {
        setTabunganList(response.data);
      }
    } catch (error) {
      console.error('Error fetching tabungan:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [userId, initializeUser]);

  // Fetch sampah
  const fetchSampah = useCallback(async (forceUserId = null) => {
    const currentUserId = forceUserId || userId;
    if (!currentUserId) {
      const id = await initializeUser();
      if (!id) return;
    }

    try {
      const response = await axios.get(
        `${BASE_URL}/target-tabungan/pengguna/${currentUserId || userId}/sampah`
      );

      if (response.data) {
        setSampahList(response.data);
      }
    } catch (error) {
      console.error('Error fetching sampah:', error);
      throw error;
    }
  }, [userId, initializeUser]);

  // Update tabungan (real-time)
  const updateTabungan = useCallback((updatedTabungan) => {
    setTabunganList(prev => 
      prev.map(item => 
        item.idTarget === updatedTabungan.idTarget ? updatedTabungan : item
      )
    );
  }, []);

  // Add nominal (real-time)
  const addNominalToTabungan = useCallback((idTarget, nominal) => {
    setTabunganList(prev => 
      prev.map(item => {
        if (item.idTarget === idTarget) {
          const newNominal = item.nominalSekarang + nominal;
          const newStatus = newNominal >= item.targetNominal ? 'selesai' : item.status;
          return {
            ...item,
            nominalSekarang: newNominal,
            status: newStatus
          };
        }
        return item;
      })
    );
  }, []);

  // Soft delete (real-time)
  const softDeleteTabungan = useCallback((idTarget) => {
    const deletedItem = tabunganList.find(item => item.idTarget === idTarget);
    if (deletedItem) {
      // Remove from active list
      setTabunganList(prev => prev.filter(item => item.idTarget !== idTarget));
      
      // Add to sampah list with deleted timestamp
      setSampahList(prev => [{
        ...deletedItem,
        isDeleted: true,
        deletedAt: new Date().toISOString()
      }, ...prev]);
    }
  }, [tabunganList]);

  // Restore (real-time)
  const restoreTabungan = useCallback((idTarget) => {
    const restoredItem = sampahList.find(item => item.idTarget === idTarget);
    if (restoredItem) {
      // Remove from sampah
      setSampahList(prev => prev.filter(item => item.idTarget !== idTarget));
      
      // Add back to active list
      setTabunganList(prev => [{
        ...restoredItem,
        isDeleted: false,
        deletedAt: null
      }, ...prev].sort((a, b) => a.idTarget - b.idTarget));
    }
  }, [sampahList]);

  // Hard delete (real-time)
  const hardDeleteTabungan = useCallback((idTarget) => {
    setSampahList(prev => prev.filter(item => item.idTarget !== idTarget));
  }, []);

  // Calculate progress
  const calculateProgress = useCallback((nominalSekarang, targetNominal) => {
    if (targetNominal <= 0) return 0;
    const progress = (nominalSekarang / targetNominal) * 100;
    return Math.min(progress, 100);
  }, []);

  // Check if target completed (100%)
  const isTargetCompleted = useCallback((tabungan) => {
    return tabungan.status === 'selesai' || 
           calculateProgress(tabungan.nominalSekarang, tabungan.targetNominal) >= 100;
  }, [calculateProgress]);

  const value = {
    tabunganList,
    sampahList,
    loading,
    userId,
    initializeUser,
    fetchTabungan,
    fetchSampah,
    updateTabungan,
    addNominalToTabungan,
    softDeleteTabungan,
    restoreTabungan,
    hardDeleteTabungan,
    calculateProgress,
    isTargetCompleted,
    setUserId,
  };

  return (
    <TabunganContext.Provider value={value}>
      {children}
    </TabunganContext.Provider>
  );
};