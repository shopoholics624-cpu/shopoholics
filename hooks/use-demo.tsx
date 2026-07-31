"use client";

import { useState, createContext, useContext, ReactNode, useCallback } from "react";
import { DEMO_MODE } from "@/constants/demo";
import { PreviewModal } from "@/components/demo/preview-modal";

interface DemoContextType {
  isDemoMode: boolean;
  isModalOpen: boolean;
  openPreviewModal: () => void;
  closePreviewModal: () => void;
  handleDemoAction: (e?: React.MouseEvent | React.SyntheticEvent, onAllowed?: () => void) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openPreviewModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closePreviewModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleDemoAction = useCallback(
    (e?: React.MouseEvent | React.SyntheticEvent, onAllowed?: () => void) => {
      if (DEMO_MODE) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        setIsModalOpen(true);
      } else {
        if (onAllowed) {
          onAllowed();
        }
      }
    },
    []
  );

  return (
    <DemoContext.Provider
      value={{
        isDemoMode: DEMO_MODE,
        isModalOpen,
        openPreviewModal,
        closePreviewModal,
        handleDemoAction,
      }}
    >
      {children}
      <PreviewModal isOpen={isModalOpen} onClose={closePreviewModal} />
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}
