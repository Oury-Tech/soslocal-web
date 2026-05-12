import { create } from 'zustand'
import type { ServiceRequest } from '@/types'

interface RequestState {
  activeRequest: ServiceRequest | null
  draftRequest: Partial<ServiceRequest> | null

  setActiveRequest: (req: ServiceRequest | null) => void
  setDraftRequest: (draft: Partial<ServiceRequest> | null) => void
  clearDraft: () => void
}

export const useRequestStore = create<RequestState>((set) => ({
  activeRequest: null,
  draftRequest: null,
  setActiveRequest: (activeRequest) => set({ activeRequest }),
  setDraftRequest: (draftRequest) => set({ draftRequest }),
  clearDraft: () => set({ draftRequest: null }),
}))
