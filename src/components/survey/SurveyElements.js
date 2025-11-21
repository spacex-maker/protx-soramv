import styled from "styled-components";

export const InputGroup = styled.div`
  margin-bottom: 0.75rem;
`;

export const FormLabel = styled.label`
  display: block;
  font-size: 0.813rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  font-size: 0.813rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  font-size: 0.813rem;
  transition: border-color 0.2s;
  height: 32px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

export const ErrorText = styled.p`
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

export const StepTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

export const CheckboxGroup = styled.div`
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
`;

export const RadioGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  background-color: white;
  font-size: 0.813rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

export const MBTIGroup = styled.div`
  margin-bottom: 2rem;
`;

export const MBTIGroupTitle = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const MBTIGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

export const MBTICard = styled.button`
  width: 100%;
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  border: 2px solid transparent;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  text-align: left;
  cursor: pointer;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  &:focus {
    outline: none;
  }

  ${({ isSelected, color = 'blue' }) => isSelected && `
    border-color: var(--color-${color}-500);
    background: linear-gradient(135deg, 
      var(--color-${color}-50) 0%, 
      var(--color-${color}-100) 100%
    );
  `}
`;

export const MBTIHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

export const MBTIType = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
`;

export const MBTIName = styled.span`
  font-size: 1.125rem;
  font-weight: 500;
  color: ${({ color = 'blue' }) => `var(--color-${color}-600)`};
`;

export const MBTIDescription = styled.p`
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
`;

export const MBTIDecoration = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 6rem;
  height: 6rem;
  border-radius: 9999px;
  opacity: 0.25;
  transform: translate(25%, 25%);
  background-color: ${({ color = 'blue' }) => `var(--color-${color}-200)`};
`; 