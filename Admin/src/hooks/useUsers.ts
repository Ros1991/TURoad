import { useState, useCallback } from 'react';
import { usePaginatedApi, useApi } from './useApi';
import usersService, { User, CreateUserDto, UpdateUserDto, PushSettings } from '../services/users.service';
import { useToast } from './useToast';

export const useUsers = (initialParams?: any) => {
  const toast = useToast();
  const paginatedApi = usePaginatedApi<User>(
    usersService.getUsers.bind(usersService),
    initialParams
  );

  const createUser = useApi(usersService.createUser.bind(usersService), {
    onSuccess: () => {
      toast.success('User created successfully');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create user');
    }
  });

  const updateUser = useApi(usersService.updateUser.bind(usersService), {
    onSuccess: () => {
      toast.success('User updated successfully');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user');
    }
  });

  const deleteUser = useApi(usersService.deleteUser.bind(usersService), {
    onSuccess: () => {
      toast.success('User deleted successfully');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete user');
    }
  });

  const toggleStatus = useApi(usersService.toggleUserStatus.bind(usersService), {
    onSuccess: () => {
      toast.success('User status updated');
      paginatedApi.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user status');
    }
  });

  return {
    ...paginatedApi,
    createUser: createUser.execute,
    updateUser: updateUser.execute,
    deleteUser: deleteUser.execute,
    toggleStatus: toggleStatus.execute,
    creating: createUser.loading,
    updating: updateUser.loading,
    deleting: deleteUser.loading,
  };
};

export const useUser = (userId: number) => {
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);

  const { data, loading, error, execute: fetchUser } = useApi(
    () => usersService.getUserById(userId),
    {
      immediate: true,
      onSuccess: (data) => setUser(data),
      onError: (error) => toast.error(error.message || 'Failed to load user')
    }
  );

  const updateUser = useCallback(async (data: UpdateUserDto) => {
    try {
      const updated = await usersService.updateUser(userId, data);
      setUser(updated);
      toast.success('User updated successfully');
      return updated;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
      throw error;
    }
  }, [userId, toast]);

  const updatePushSettings = useCallback(async (settings: Partial<PushSettings>) => {
    try {
      const updated = await usersService.updatePushSettings(userId, settings);
      toast.success('Push settings updated');
      return updated;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update push settings');
      throw error;
    }
  }, [userId, toast]);

  const sendTestPush = useCallback(async (message: string) => {
    try {
      await usersService.sendTestPush(userId, message);
      toast.success('Test push notification sent');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send test push');
      throw error;
    }
  }, [userId, toast]);

  const revokeTokens = useCallback(async () => {
    try {
      await usersService.revokeTokens(userId);
      toast.success('All user tokens revoked');
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke tokens');
      throw error;
    }
  }, [userId, toast]);

  return {
    user: user || data,
    loading,
    error,
    refresh: fetchUser,
    updateUser,
    updatePushSettings,
    sendTestPush,
    revokeTokens,
  };
};

export default useUsers;
