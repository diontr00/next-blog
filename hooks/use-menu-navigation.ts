"use client";

import type { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";

type Orientation = "horizontal" | "vertical" | "both";

interface MenuNavigationOptions<T> {
  /**
   * The Tiptap editor instance, if using with a Tiptap editor.
   */
  editor?: Editor | null;
  /**
   * Reference to the container element for handling keyboard events.
   */
  containerRef?: React.RefObject<HTMLElement | null>;
  /**
   * Search query that affects the selected item.
   */
  query?: string;
  /**
   * Array of items to navigate through.
   */
  items: T[];
  /**
   * Callback fired when an item is selected.
   */
  onSelect?: (item: T) => void;
  /**
   * Callback fired when the menu should close.
   */
  onClose?: () => void;
  /**
   * The navigation orientation of the menu.
   * @default "vertical"
   */
  orientation?: Orientation;
  /**
   * Whether to automatically select the first item when the menu opens.
   * @default true
   */
  autoSelectFirstItem?: boolean;
}

/**
 * Hook that implements keyboard navigation for dropdown menus and command palettes.
 *
 * Handles arrow keys, tab, home/end, enter for selection, and escape to close.
 * Works with both Tiptap editors and regular DOM elements.
 *
 * @param options - Configuration options for the menu navigation
 * @returns Object containing the selected index and a setter function
 */
export function useMenuNavigation<T>({
  editor,
  containerRef,
  query,
  items,
  onSelect,
  onClose,
  orientation = "vertical",
  autoSelectFirstItem = true,
}: MenuNavigationOptions<T>) {
  // Only store navigation state
  const [navIndex, setNavIndex] = useState<number>(
    autoSelectFirstItem ? 0 : -1,
  );

  // Derived selected index (NO effect needed)
  const selectedIndex =
    query != null && query !== ""
      ? autoSelectFirstItem
        ? 0
        : -1
      : items.length
        ? navIndex
        : undefined;

  useEffect(() => {
    const handleKeyboardNavigation = (event: KeyboardEvent) => {
      if (!items.length) return false;

      const moveNext = () =>
        setNavIndex((currentIndex) => {
          if (currentIndex === -1) return 0;
          return (currentIndex + 1) % items.length;
        });

      const movePrev = () =>
        setNavIndex((currentIndex) => {
          if (currentIndex === -1) return items.length - 1;
          return (currentIndex - 1 + items.length) % items.length;
        });

      switch (event.key) {
        case "ArrowUp":
          if (orientation === "horizontal") return false;
          event.preventDefault();
          movePrev();
          return true;

        case "ArrowDown":
          if (orientation === "horizontal") return false;
          event.preventDefault();
          moveNext();
          return true;

        case "ArrowLeft":
          if (orientation === "vertical") return false;
          event.preventDefault();
          movePrev();
          return true;

        case "ArrowRight":
          if (orientation === "vertical") return false;
          event.preventDefault();
          moveNext();
          return true;

        case "Tab":
          event.preventDefault();
          event.shiftKey ? movePrev() : moveNext();
          return true;

        case "Home":
          event.preventDefault();
          setNavIndex(0);
          return true;

        case "End":
          event.preventDefault();
          setNavIndex(items.length - 1);
          return true;

        case "Enter":
          if (event.isComposing) return false;
          event.preventDefault();
          if (selectedIndex !== -1 && selectedIndex !== undefined) {
            onSelect?.(items[selectedIndex]);
          }
          return true;

        case "Escape":
          event.preventDefault();
          onClose?.();
          return true;

        default:
          return false;
      }
    };

    let targetElement: HTMLElement | null = null;

    if (editor) targetElement = editor.view.dom;
    else if (containerRef?.current) targetElement = containerRef.current;

    if (!targetElement) return;

    targetElement.addEventListener("keydown", handleKeyboardNavigation, true);

    return () => {
      targetElement?.removeEventListener(
        "keydown",
        handleKeyboardNavigation,
        true,
      );
    };
  }, [
    editor,
    containerRef,
    items,
    selectedIndex,
    onSelect,
    onClose,
    orientation,
  ]);

  return {
    selectedIndex,
    setSelectedIndex: setNavIndex,
  };
}
