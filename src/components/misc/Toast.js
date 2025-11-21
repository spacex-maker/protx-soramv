import React from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { motion, AnimatePresence } from "framer-motion";

const ToastContainer = styled(motion.div)`
  ${tw`fixed z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg`}
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(220, 38, 38, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Icon = tw.i`text-white text-lg`;
const Message = tw.span`text-white text-sm font-medium`;

const Toast = ({ message, type = 'error', isVisible, onClose }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <ToastContainer
          type={type}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          onAnimationComplete={() => {
            setTimeout(onClose, 3000);
          }}
        >
          <Icon className="bi bi-x-circle" />
          <Message>{message}</Message>
        </ToastContainer>
      )}
    </AnimatePresence>
  );
};


export default Toast; 