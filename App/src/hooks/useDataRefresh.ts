import { useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Hook que executa uma função de refresh quando o idioma muda
 * @param refreshFunction Função que será executada para recarregar os dados
 * @param dependencies Array de dependências adicionais que podem triggerar o refresh
 */
export const useDataRefresh = (
  refreshFunction: () => void | Promise<void>,
  dependencies: any[] = []
) => {
  const { currentLanguage } = useLanguage();
  const previousLanguage = useRef<string>(currentLanguage);
  const isFirstRun = useRef<boolean>(true);

  const refreshFunctionRef = useRef(refreshFunction);
  refreshFunctionRef.current = refreshFunction;

  const refresh = useCallback(async () => {
    try {
      console.log('🔄 Refreshing data due to language change or dependencies');
      await refreshFunctionRef.current();
    } catch (error) {
      console.warn('Error refreshing data:', error);
    }
  }, []);

  useEffect(() => {
    // Don't refresh on first mount
    if (isFirstRun.current) {
      isFirstRun.current = false;
      previousLanguage.current = currentLanguage;
      return;
    }

    // Only refresh if language actually changed
    if (previousLanguage.current !== currentLanguage) {
      console.log(`🌐 Language changed from ${previousLanguage.current} to ${currentLanguage}`);
      previousLanguage.current = currentLanguage;
      refresh();
    }
  }, [currentLanguage, refresh]);

  useEffect(() => {
    // Refresh when other dependencies change (but not on first mount)
    if (!isFirstRun.current) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { refresh };
};

/**
 * Hook simplificado que apenas executa o refresh quando idioma muda
 */
export const useLanguageRefresh = (refreshFunction: () => void | Promise<void>) => {
  const { currentLanguage } = useLanguage();
  const previousLanguage = useRef<string>(currentLanguage);
  const isFirstRun = useRef<boolean>(true);

  const refreshFunctionRef = useRef(refreshFunction);
  refreshFunctionRef.current = refreshFunction;

  useEffect(() => {
    // Don't refresh on first mount
    if (isFirstRun.current) {
      isFirstRun.current = false;
      previousLanguage.current = currentLanguage;
      return;
    }

    // Only refresh if language actually changed
    if (previousLanguage.current !== currentLanguage) {
      console.log(`🌐 Language changed from ${previousLanguage.current} to ${currentLanguage}`);
      previousLanguage.current = currentLanguage;
      
      const executeRefresh = async () => {
        try {
          await refreshFunctionRef.current();
        } catch (error) {
          console.warn('Error refreshing data on language change:', error);
        }
      };
      
      executeRefresh();
    }
  }, [currentLanguage]);
};
