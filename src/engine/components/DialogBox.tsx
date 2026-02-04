// ============================================================
// 对话框组件 - 宝可梦风格
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';

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
}: DialogBoxProps) {
  const currentText = texts[currentIndex] ?? '';
  const isLastDialog = currentIndex >= texts.length - 1;

  const [displayedChars, setDisplayedChars] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 当前文本变化时重置打字机
  useEffect(() => {
    setDisplayedChars(0);
    setIsTyping(true);
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
    if (isTyping) {
      // 还在打字，直接显示全部
      setDisplayedChars(currentText.length);
      setIsTyping(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else if (isLastDialog) {
      // 最后一句，关闭对话
      onClose();
    } else {
      // 推进到下一句
      onAdvance();
    }
  }, [isTyping, isLastDialog, currentText.length, onAdvance, onClose]);

  // 监听键盘交互（Z / Enter / Space）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['z', 'Z', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        handleInteract();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInteract]);

  // 显示的文本（打字机效果截取）
  const visibleText = currentText.slice(0, displayedChars);

  // 底部提示
  const promptText = isTyping
    ? ''
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
