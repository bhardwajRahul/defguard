import { pick } from 'lodash-es';
import { Subject } from 'rxjs';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createWithEqualityFn } from 'zustand/traditional';

import { LoginSubjectData, User } from '../../types';

export const useAuthStore = createWithEqualityFn<AuthStore>()(
  persist(
    (set, get) => ({
      user: undefined,
      openIdParams: undefined,
      loginSubject: new Subject<LoginSubjectData>(),
      setState: (newState) => set({ ...get(), ...newState }),
      resetState: () =>
        set({
          user: undefined,
          openIdParams: undefined,
        }),
    }),
    {
      name: 'auth-store',
      partialize: (store) => pick(store, ['user', 'authLocation']),
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
  Object.is,
);
export interface AuthStore {
  loginSubject: Subject<LoginSubjectData>;
  user?: User;
  // If this is set, redirect user to allow page and nowhere else
  openIdParams?: URLSearchParams;
  setState: (newState: Partial<AuthStore>) => void;
  resetState: () => void;
}
