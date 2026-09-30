import { describe, expect, it } from 'vitest';

import { createInitialRemoteSessionState, EConnectionStatus, type RemoteSessionState } from './remote-session.reducer';
import { selectIsConnected, selectPendingTargets } from './selectors';

describe('remote session selectors', () => {
  describe('selectIsConnected', () => {
    it('returns true when connected', () => {
      const state: RemoteSessionState = {
        ...createInitialRemoteSessionState(),
        connectionStatus: EConnectionStatus.Connected,
      };
      expect(selectIsConnected(state)).toBe(true);
    });

    it.each([
      EConnectionStatus.Idle,
      EConnectionStatus.Connecting,
      EConnectionStatus.Reconnecting,
      EConnectionStatus.Error,
    ])('returns false when %s', (status) => {
      const state: RemoteSessionState = {
        ...createInitialRemoteSessionState(),
        connectionStatus: status,
      };
      expect(selectIsConnected(state)).toBe(false);
    });
  });

  describe('selectPendingTargets', () => {
    it('returns an empty record when there are no pending writes', () => {
      const state: RemoteSessionState = createInitialRemoteSessionState();
      expect(selectPendingTargets(state)).toEqual({});
    });

    it('returns a record mapping pending targets to true', () => {
      const state: RemoteSessionState = {
        ...createInitialRemoteSessionState(),
        pendingWrites: {
          speed: { requestId: '1', value: 2, previousConfirmedValue: 1 },
          health: { requestId: '2', value: 100, previousConfirmedValue: 50 },
        },
      };
      expect(selectPendingTargets(state)).toEqual({
        speed: true,
        health: true,
      });
    });
  });
});
