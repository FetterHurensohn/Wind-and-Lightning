/**
 * useModal.js - Modal State Management Hook
 */

import { useState } from 'react';

export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);

  const open = (type, data = null) => {
    setModalType(type);
    setModalData(data);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setModalType(null);
    setModalData(null);
  };

  return {
    isOpen,
    modalType,
    modalData,
    open,
    close
  };
}
