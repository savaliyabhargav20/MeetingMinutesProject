import { useEffect, useRef, useState, useCallback } from 'react';
import { ConnectedUser, MeetingMinutes, ActionItem } from '../types';

interface WebSocketHookProps {
  onMinutesSync?: (minutes: MeetingMinutes, updatedBy: ConnectedUser) => void;
  onActionItemSynced?: (itemId: string, status: 'Pending' | 'In Progress' | 'Completed', updatedBy: ConnectedUser) => void;
  onActionItemAdded?: (item: ActionItem, updatedBy: ConnectedUser) => void;
}

export function useWebSocket({ onMinutesSync, onActionItemSynced, onActionItemAdded }: WebSocketHookProps = {}) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<ConnectedUser | null>(null);
  const [activeUsers, setActiveUsers] = useState<ConnectedUser[]>([]);
  const [recentNotification, setRecentNotification] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);

  const clearNotificationTimer = useRef<any>(null);

  const showToast = useCallback((msg: string) => {
    setRecentNotification(msg);
    if (clearNotificationTimer.current) clearTimeout(clearNotificationTimer.current);
    clearNotificationTimer.current = setTimeout(() => {
      setRecentNotification(null);
    }, 4000);
  }, []);

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) return;
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { type, payload } = data;

          switch (type) {
            case 'init': {
              setCurrentUser(payload.currentUser);
              if (payload.activeUsers) setActiveUsers(payload.activeUsers);
              break;
            }

            case 'presence:update': {
              if (payload.activeUsers) {
                setActiveUsers(payload.activeUsers);
              }
              break;
            }

            case 'minutes:sync': {
              if (payload.minutes && onMinutesSync) {
                onMinutesSync(payload.minutes, payload.updatedBy);
                if (payload.updatedBy?.name) {
                  showToast(`${payload.updatedBy.name} updated the meeting minutes.`);
                }
              }
              break;
            }

            case 'action_item:synced': {
              if (onActionItemSynced && payload.itemId) {
                onActionItemSynced(payload.itemId, payload.status, payload.updatedBy);
                if (payload.updatedBy?.name) {
                  showToast(`${payload.updatedBy.name} marked task as ${payload.status}`);
                }
              }
              break;
            }

            case 'action_item:added': {
              if (onActionItemAdded && payload.item) {
                onActionItemAdded(payload.item, payload.updatedBy);
                if (payload.updatedBy?.name) {
                  showToast(`${payload.updatedBy.name} added a new action item.`);
                }
              }
              break;
            }

            case 'pong':
              break;

            default:
              break;
          }
        } catch (err) {
          console.warn('WS onmessage parse error:', err);
        }
      };

      ws.onclose = () => {
        if (!isMountedRef.current) return;
        setIsConnected(false);
        // Automatic reconnection attempt after 3 seconds
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (e) {
      console.warn('WebSocket init exception:', e);
    }
  }, [onMinutesSync, onActionItemSynced, onActionItemAdded, showToast]);

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    // Ping interval to keep connection alive
    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);

    return () => {
      isMountedRef.current = false;
      if (clearNotificationTimer.current) clearTimeout(clearNotificationTimer.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      clearInterval(pingInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Methods to broadcast changes
  const broadcastMinutes = useCallback((minutes: MeetingMinutes) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'minutes:update',
        payload: minutes
      }));
    }
  }, []);

  const broadcastActionItemToggle = useCallback((itemId: string, status: 'Pending' | 'In Progress' | 'Completed') => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'action_item:toggle',
        payload: { itemId, status }
      }));
    }
  }, []);

  const broadcastActionItemAdd = useCallback((item: ActionItem) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'action_item:add',
        payload: item
      }));
    }
  }, []);

  const updateUserName = useCallback((name: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'user:set_name',
        payload: { name }
      }));
    }
  }, []);

  return {
    isConnected,
    currentUser,
    activeUsers,
    recentNotification,
    broadcastMinutes,
    broadcastActionItemToggle,
    broadcastActionItemAdd,
    updateUserName
  };
}
