import React from 'react';
import styled from 'styled-components';
import type { ScenarioField, ScenarioFieldValues } from './scenarios';

const FieldBlock = styled.div`
  margin-bottom: 18px;
`;

const FieldLabel = styled.div<{ $dark?: boolean }>`
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.85)' : '#1c1917')};
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.button<{ $active?: boolean; $accent?: string; $dark?: boolean }>`
  border: 1px solid
    ${(p) =>
      p.$active
        ? p.$accent || '#c45c26'
        : p.$dark
          ? 'rgba(255,255,255,0.12)'
          : 'rgba(0,0,0,0.12)'};
  background: ${(p) =>
    p.$active
      ? p.$dark
        ? 'rgba(196,92,38,0.25)'
        : 'rgba(196,92,38,0.12)'
      : p.$dark
        ? 'rgba(255,255,255,0.04)'
        : '#fff'};
  color: ${(p) =>
    p.$active
      ? p.$accent || '#c45c26'
      : p.$dark
        ? 'rgba(255,255,255,0.75)'
        : 'rgba(0,0,0,0.65)'};
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    border-color: ${(p) => p.$accent || '#c45c26'};
  }
`;

const TextInput = styled.input<{ $dark?: boolean }>`
  width: 100%;
  max-width: 420px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  font-size: 14px;
  background: ${(p) => (p.$dark ? 'rgba(255,255,255,0.06)' : '#fff')};
  color: inherit;

  &:focus {
    outline: none;
    border-color: #c45c26;
  }
`;

type Props = {
  fields: ScenarioField[];
  values: ScenarioFieldValues;
  accent?: string;
  isDark?: boolean;
  onChange: (next: ScenarioFieldValues) => void;
};

export function buildInitialFieldValues(fields: ScenarioField[]): ScenarioFieldValues {
  const out: ScenarioFieldValues = {};
  for (const f of fields) {
    if (f.kind === 'multiChoice') {
      out[f.id] = Array.isArray(f.defaultValue) ? [...f.defaultValue] : f.defaultValue ? [f.defaultValue] : [];
    } else {
      out[f.id] = (f.defaultValue as string) ?? (f.options?.[0]?.value ?? '');
    }
  }
  return out;
}

const FieldControls: React.FC<Props> = ({ fields, values, accent, isDark, onChange }) => {
  return (
    <>
      {fields.map((field) => (
        <FieldBlock key={field.id}>
          <FieldLabel $dark={isDark}>{field.label}</FieldLabel>
          {field.kind === 'text' && (
            <TextInput
              $dark={isDark}
              value={String(values[field.id] ?? '')}
              placeholder={field.placeholder}
              onChange={(e) => onChange({ ...values, [field.id]: e.target.value })}
            />
          )}
          {field.kind === 'choice' && (
            <ChipRow>
              {(field.options || []).map((opt) => (
                <Chip
                  key={opt.value}
                  type="button"
                  $active={values[field.id] === opt.value}
                  $accent={accent}
                  $dark={isDark}
                  onClick={() => onChange({ ...values, [field.id]: opt.value })}
                >
                  {opt.label}
                </Chip>
              ))}
            </ChipRow>
          )}
          {field.kind === 'multiChoice' && (
            <ChipRow>
              {(field.options || []).map((opt) => {
                const current = (values[field.id] as string[]) || [];
                const active = current.includes(opt.value);
                return (
                  <Chip
                    key={opt.value}
                    type="button"
                    $active={active}
                    $accent={accent}
                    $dark={isDark}
                    onClick={() => {
                      const next = active
                        ? current.filter((v) => v !== opt.value)
                        : [...current, opt.value];
                      onChange({ ...values, [field.id]: next });
                    }}
                  >
                    {opt.label}
                  </Chip>
                );
              })}
            </ChipRow>
          )}
        </FieldBlock>
      ))}
    </>
  );
};

export default FieldControls;
