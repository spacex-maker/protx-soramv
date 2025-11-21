import { createRoot } from 'react-dom/client';
import Toast from 'components/misc/Toast';

export const handleApiError = (message) => {
  // response 就是后端返回的数据对象
  const toastContainer = document.createElement('div');
  document.body.appendChild(toastContainer);
  
  // 渲染 Toast
  const root = createRoot(toastContainer);
  root.render(
    <Toast 
      message={message} 
      type="error" 
      isVisible={true}
      onClose={() => {
        root.unmount();
        toastContainer.remove();
      }} 
    />
  );
}; 