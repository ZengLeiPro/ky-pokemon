// ============================================================
// 对话框组件 - 宝可梦风格
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DialogChoice } from '../types';

interface DialogBoxProps {
  /** 对话文本数组 */
  texts: string[];
  /** 当前显示的对话索引 */
  currentIndex: number;
  /** 说话者名字（可选） */
  speakerName?: string;
  /** 推进到下一句对话 */
  onAdvance: () => void;
  /** 关闭对话框 */
  onClose: () => void;
  /** 对话选项（在最后一句对话显示完后出现） */
  choices?: DialogChoice[];
  /** 选择了某个选项 */
  onChoiceSelect?: (choice: DialogChoice) => void;
}

/** 打字机效果每字延迟（毫秒） */
const CHAR_DELAY = 30;

/**
 * 宝可梦风格对话框组件。
 *
 * 特性：
 * - 显示在屏幕底部
 * - 圆角边框，半透明深色背景
 * - 打字机效果（逐字显示）
 * - 点击或按键推进对话
 * - 未打完字时点击可直接显示全部文本
 */
export function DialogBox({
  texts,
  currentIndex,
  speakerName,
  onAdvance,
  onClose,
  choices,
  onChoiceSelect,
}: DialogBoxProps) {
  const currentText = texts[currentIndex] ?? '';
  const isLastDialog = currentIndex >= texts.length - 1;
  const hasChoices = !!choices && choices.length > 0;
  /** 是否正在显示选项菜单 */
  const [showChoices, setShowChoices] = useState(false);
  /** 当前高亮的选项索引（键盘导航用） */
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(0);

  const [displayedChars, setDisplayedChars] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 当前文本变化时重置打字机和选项状态
  useEffect(() => {
    setDisplayedChars(0);
    setIsTyping(true);
    setShowChoices(false);
    setSelectedChoiceIndex(0);
  }, [currentIndex, currentText]);

  // 打字机效果
  useEffect(() => {
    if (!isTyping) return;

    if (displayedChars >= currentText.length) {
      setIsTyping(false);
      return;
    }

    timerRef.current = setInterval(() => {
      setDisplayedChars((prev) => {
        const next = prev + 1;
        if (next >= currentText.length) {
          setIsTyping(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
        return next;
      });
    }, CHAR_DELAY);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTyping, displayedChars, currentText]);

  /** 点击/按键处理 */
  const handleInteract = useCallback(() => {
    // 选项菜单已展示时，点击对话框不做任何事（由选项按钮处理）
    if (showChoices) return;

    if (isTyping) {
      // 还在打字，直接显示全部
      setDisplayedChars(currentText.length);
      setIsTyping(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else if (isLastDialog && hasChoices) {
      // 最后一句且有选项，显示选项菜单
      setShowChoices(true);
      setSelectedChoiceIndex(0);
    } else if (isLastDialog) {
      // 最后一句，关闭对话
      onClose();
    } else {
      // 推进到下一句
      onAdvance();
    }
  }, [isTyping, isLastDialog, currentText.length, onAdvance, onClose, showChoices, hasChoices]);

  // 监听键盘交互
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showChoices && choices) {
        // 选项菜单模式：上下键切换，确认键选择
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          setSelectedChoiceIndex((prev) => (prev > 0 ? prev - 1 : choices.length - 1));
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          e.preventDefault();
          setSelectedChoiceIndex((prev) => (prev < choices.length - 1 ? prev + 1 : 0));
        } else if (['z', 'Z', 'Enter', ' '].includes(e.key)) {
          e.preventDefault();
          onChoiceSelect?.(choices[selectedChoiceIndex]);
        }
      } else {
        if (['z', 'Z', 'Enter', ' '].includes(e.key)) {
          e.preventDefault();
          handleInteract();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInteract, showChoices, choices, selectedChoiceIndex, onChoiceSelect]);

  // 显示的文本（打字机效果截取）
  const visibleText = currentText.slice(0, displayedChars);

  // 底部提示
  const promptText = isTyping
    ? ''
    : showChoices
      ? ''
      : isLastDialog && hasChoices
        ? '[ 继续 >> ]'
        : isLastDialog
          ? '[ 关闭 ]'
          : '[ 继续 >> ]';

  return (
    <div
      className="fixed left-0 right-0 z-40 flex justify-center"
      style={{ bottom: 100, padding: '0 12px', pointerEvents: 'auto' }}
      onClick={handleInteract}
      onTouchEnd={(e) => {
        e.preventDefault();
        handleInteract();
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: '100%',
          backgroundColor: 'rgba(16, 24, 40, 0.92)',
          border: '3px solid rgba(255, 255, 255, 0.3)',
          borderRadius: 12,
          padding: '12px 16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          position: 'relative',
        }}
      >
        {/* 说话者名字 */}
        {speakerName && (
          <div
            style={{
              position: 'absolute',
              top: -14,
              left: 12,
              backgroundColor: 'rgba(16, 24, 40, 0.92)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 8,
              padding: '2px 10px',
              fontSize: 12,
              color: '#FFD700',
              fontWeight: 'bold',
              fontFamily: 'monospace',
            }}
          >
            {speakerName}
          </div>
        )}

        {/* 对话文本 */}
        <div
          style={{
            color: '#F0F0F0',
            fontSize: 15,
            lineHeight: 1.6,
            fontFamily: 'monospace',
            minHeight: 48,
            marginTop: speakerName ? 4 : 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {visibleText}
          {/* 打字光标 */}
          {isTyping && (
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 2,
                backgroundColor: '#F0F0F0',
                marginLeft: 1,
                verticalAlign: 'middle',
                animation: 'blink 0.5s step-end infinite',
              }}
            />
          )}
        </div>

        {/* 底部提示 */}
        {promptText && (
          <div
            style={{
              textAlign: 'right',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: 11,
              fontFamily: 'monospace',
              marginTop: 4,
              animation: 'fadeIn 0.3s ease-out',
            }}
          >
            {promptText}
          </div>
        )}

        {/* 选项菜单 */}
        {showChoices && choices && (
          <div
            style={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {choices.map((choice, idx) => (
              <div
                key={choice.action}
                onClick={(e) => {
                  e.stopPropagation();
                  onChoiceSelect?.(choice);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChoiceSelect?.(choice);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontFamily: 'monospace',
                  fontSize: 14,
                  cursor: 'pointer',
                  backgroundColor: idx === selectedChoiceIndex
                    ? 'rgba(255, 215, 0, 0.25)'
                    : 'rgba(255, 255, 255, 0.08)',
                  color: idx === selectedChoiceIndex ? '#FFD700' : '#F0F0F0',
                  border: idx === selectedChoiceIndex
                    ? '1px solid rgba(255, 215, 0, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={() => setSelectedChoiceIndex(idx)}
              >
                {idx === selectedChoiceIndex ? '▶ ' : '  '}{choice.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 内联打字光标动画 */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
