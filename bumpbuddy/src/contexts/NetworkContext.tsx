import React, { createContext, useContext, useEffect } from 'react';
import { setConnectionStatus, setPendingSyncCount } from '../redux/store';

import { useDispatch } from 'react-redux';
import { useNetworkStatus } from '../services/networkService';
import syncQueueService from '../services/syncQueueService';

// Define the context type
interface NetworkContextType {
  isConnected: boolean | null;
  isOnline: boolean;
  isOffline: boolean;
  pendingSyncCount: number;
  lastOnlineTime: string | null;
  isLoadingNetworkStatus: boolean;
}

// Create the context with a default value
const NetworkContext = createContext<NetworkContextType>({
  isConnected: null,
  isOnline: false,
  isOffline: true,
  pendingSyncCount: 0,
  lastOnlineTime: null,
  isLoadingNetworkStatus: true,
});

// Custom hook to use the network context
export const useNetwork = () => useContext(NetworkContext);

interface NetworkProviderProps {
  children: React.ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({
  children,
}) => {
  const { isConnected, isLoading, getLastOnlineTime } = useNetworkStatus();
  const dispatch = useDispatch();

  // Update Redux store with connection status
  useEffect(() => {
    if (isConnected !== null) {
      dispatch(setConnectionStatus(isConnected));
    }
  }, [isConnected, dispatch]);

  // Set up sync queue listener
  useEffect(() => {
    const unsubscribe = syncQueueService.addListener(queue => {
      dispatch(setPendingSyncCount(queue.length));
    });

    return unsubscribe;
  }, [dispatch]);

  // Get the queue length initially
  useEffect(() => {
    const queueLength = syncQueueService.getQueue().length;
    dispatch(setPendingSyncCount(queueLength));
  }, [dispatch]);

  // Get last online time
  const [lastOnlineTime, setLastOnlineTime] = React.useState<string | null>(
    null
  );
  useEffect(() => {
    const fetchLastOnlineTime = async () => {
      const time = await getLastOnlineTime();
      setLastOnlineTime(time);
    };

    fetchLastOnlineTime();
  }, [getLastOnlineTime]);

  // Create the context value
  const value: NetworkContextType = {
    isConnected,
    isOnline: isConnected === true,
    isOffline: isConnected === false,
    pendingSyncCount: syncQueueService.getQueue().length,
    lastOnlineTime,
    isLoadingNetworkStatus: isLoading,
  };

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
};

export default NetworkContext;
