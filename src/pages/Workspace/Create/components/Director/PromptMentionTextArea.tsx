import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Input } from 'antd';
import { PictureOutlined, UserOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import styled from 'styled-components';
import { DirectorCharacter } from 'api/director';
import { normalizeUrl } from '../ImageToVideo/utils';
import {
  ShotVideoReferenceAsset,
  applyPromptMention,
  detectPromptMention,
} from './shotVideoUtils';

const { TextArea } = Input;

type TextAreaRef = React.ComponentRef<typeof TextArea>;

const Wrapper = styled.div`
  position: relative;
`;

const MentionDropdown = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  z-index: 1050;
  max-height: 220px;
  overflow-y: auto;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);

  .dark & {
    border-color: rgba(255, 255, 255, 0.12);
    background: #1f1f1f;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
  }
`;

const MentionItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  background: ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.12)' : 'transparent')};
  cursor: pointer;
  text-align: left;

  &:hover {
    background: rgba(59, 130, 246, 0.08);
  }
`;

const MentionMeta = styled.div`
  flex: 1;
  min-width: 0;
`;

const MentionEmpty = styled.div`
  padding: 12px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);

  .dark & {
    color: rgba(255, 255, 255, 0.45);
  }
`;

export interface PromptMentionOption {
  id: string;
  label: string;
  thumbnailUrl?: string;
  subtitle?: string;
  kind: 'reference' | 'character';
  character?: DirectorCharacter;
}

export interface PromptMentionTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  references: ShotVideoReferenceAsset[];
  availableCharacters?: DirectorCharacter[];
  onAddCharacter?: (character: DirectorCharacter) => void;
  mentionEnabled?: boolean;
  rows?: number;
  placeholder?: string;
}

const getNativeTextArea = (target: unknown): HTMLTextAreaElement | null => {
  if (!target || typeof target !== 'object') return null;
  const maybeRef = target as { resizableTextArea?: { textArea?: HTMLTextAreaElement } };
  return maybeRef.resizableTextArea?.textArea ?? null;
};

const PromptMentionTextArea = forwardRef<TextAreaRef, PromptMentionTextAreaProps>(
  (
    {
      value,
      onChange,
      references,
      availableCharacters = [],
      onAddCharacter,
      mentionEnabled = true,
      rows = 3,
      placeholder,
    },
    ref
  ) => {
    const intl = useIntl();
    const innerRef = useRef<TextAreaRef>(null);
    const [mentionOpen, setMentionOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [mentionQuery, setMentionQuery] = useState('');
    const mentionRangeRef = useRef<{ start: number; end: number } | null>(null);

    const setRefs = useCallback(
      (node: TextAreaRef | null) => {
        innerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    const mentionOptions = useMemo((): PromptMentionOption[] => {
      const query = mentionQuery.trim().toLowerCase();
      const matchLabel = (label: string) => !query || label.toLowerCase().includes(query);

      const refOptions: PromptMentionOption[] = references
        .filter((refItem) => matchLabel(refItem.label))
        .map((refItem) => {
          const index = references.findIndex((item) => item.id === refItem.id);
          return {
            id: refItem.id,
            label: refItem.label,
            thumbnailUrl: refItem.url,
            subtitle: intl.formatMessage(
              { id: 'director.shot.videoMentionRef', defaultMessage: '图片{index} · 已添加' },
              { index: index + 1 }
            ),
            kind: 'reference' as const,
          };
        });

      const characterOptions: PromptMentionOption[] = availableCharacters
        .filter((character) => matchLabel(character.name))
        .map((character) => ({
          id: `character-${character.id}`,
          label: character.name,
          thumbnailUrl: character.referenceImageUrl || undefined,
          subtitle: intl.formatMessage({
            id: 'director.shot.videoMentionAddCharacter',
            defaultMessage: '角色库 · 选择后自动添加',
          }),
          kind: 'character',
          character,
        }));

      return [...refOptions, ...characterOptions];
    }, [availableCharacters, intl, mentionQuery, references]);

    const syncMentionState = useCallback(
      (nextValue: string, cursorPos: number) => {
        if (!mentionEnabled) {
          setMentionOpen(false);
          mentionRangeRef.current = null;
          return;
        }
        const mention = detectPromptMention(nextValue, cursorPos);
        if (!mention) {
          setMentionOpen(false);
          mentionRangeRef.current = null;
          return;
        }
        mentionRangeRef.current = { start: mention.start, end: mention.end };
        setMentionQuery(mention.query);
        setMentionOpen(true);
        setActiveIndex(0);
      },
      [mentionEnabled]
    );

    const focusTextArea = useCallback((cursor?: number) => {
      const textarea = getNativeTextArea(innerRef.current);
      if (!textarea) return;
      textarea.focus();
      if (typeof cursor === 'number') {
        textarea.setSelectionRange(cursor, cursor);
      }
    }, []);

    const selectMention = useCallback(
      (option: PromptMentionOption) => {
        if (option.kind === 'character' && option.character) {
          onAddCharacter?.(option.character);
        }

        const range = mentionRangeRef.current;
        if (range) {
          const { value: nextValue, cursor } = applyPromptMention(
            value,
            { ...range, query: mentionQuery },
            option.label
          );
          onChange(nextValue);
          requestAnimationFrame(() => focusTextArea(cursor));
        } else {
          const trimmed = value.trim();
          onChange(trimmed ? `${trimmed} @${option.label} ` : `@${option.label} `);
          requestAnimationFrame(() => focusTextArea());
        }

        setMentionOpen(false);
        mentionRangeRef.current = null;
      },
      [focusTextArea, onAddCharacter, onChange, value]
    );

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = event.target.value;
      onChange(nextValue);
      syncMentionState(nextValue, event.target.selectionStart ?? nextValue.length);
    };

    const handleKeyUp = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      syncMentionState(event.currentTarget.value, event.currentTarget.selectionStart ?? event.currentTarget.value.length);
    };

    const handleClick = (event: React.MouseEvent<HTMLTextAreaElement>) => {
      syncMentionState(event.currentTarget.value, event.currentTarget.selectionStart ?? event.currentTarget.value.length);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!mentionOpen || mentionOptions.length === 0) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % mentionOptions.length);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((prev) => (prev - 1 + mentionOptions.length) % mentionOptions.length);
        return;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        selectMention(mentionOptions[activeIndex]);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        setMentionOpen(false);
        mentionRangeRef.current = null;
      }
    };

    useEffect(() => {
      if (activeIndex >= mentionOptions.length) {
        setActiveIndex(0);
      }
    }, [activeIndex, mentionOptions.length]);

    useEffect(() => {
      if (!mentionEnabled) {
        setMentionOpen(false);
      }
    }, [mentionEnabled]);

    return (
      <Wrapper>
        <TextArea
          ref={setRefs}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyUp={handleKeyUp}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            window.setTimeout(() => setMentionOpen(false), 120);
          }}
        />
        {mentionOpen ? (
          <MentionDropdown onMouseDown={(event) => event.preventDefault()}>
            {mentionOptions.length === 0 ? (
              <MentionEmpty>
                {intl.formatMessage({
                  id: 'director.shot.videoMentionEmpty',
                  defaultMessage: '暂无匹配资产，请先在上方添加参考图或角色',
                })}
              </MentionEmpty>
            ) : (
              mentionOptions.map((option, index) => (
                <MentionItem
                  key={option.id}
                  type="button"
                  $active={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectMention(option)}
                >
                  <Avatar
                    shape="square"
                    size={36}
                    src={option.thumbnailUrl ? normalizeUrl(option.thumbnailUrl) : undefined}
                    icon={option.kind === 'character' ? <UserOutlined /> : <PictureOutlined />}
                  />
                  <MentionMeta>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>@{option.label}</div>
                    {option.subtitle ? (
                      <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>{option.subtitle}</div>
                    ) : null}
                  </MentionMeta>
                </MentionItem>
              ))
            )}
          </MentionDropdown>
        ) : null}
      </Wrapper>
    );
  }
);

PromptMentionTextArea.displayName = 'PromptMentionTextArea';

export default PromptMentionTextArea;
