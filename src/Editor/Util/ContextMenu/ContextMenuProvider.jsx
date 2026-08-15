/*
 * Copyright 2026 Candlestickers
 *
 * This file is part of Candlestick.
 *
 * Candlestick is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Candlestick is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Candlestick.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import ContextMenu from './ContextMenu';

// Exported so class components can consume it via `static contextType = ContextMenuContext`.
export const ContextMenuContext = createContext(null);

/**
 * ContextMenuProvider
 * Renders a single shared right-click context menu for the whole editor.
 * Any component can call useContextMenu() to open it with its own set of items.
 */
export default function ContextMenuProvider(props) {
  const [menuState, setMenuState] = useState(null);
  // Tracks a call token so a stale async open can't clobber a newer one.
  const openTokenRef = useRef(0);
  // Browsers only ever show their native context menu in response to a
  // trusted (real, user-initiated) contextmenu event - once we've called
  // preventDefault() on that event, there's no way to summon it back via
  // script. So instead of trying to replay the event (which does nothing,
  // since a JS-dispatched event is never trusted), we arm this flag and skip
  // opening our menu - and skip preventDefault - on the very next real
  // right-click, letting the browser handle that one natively.
  const armNativeMenuRef = useRef(false);

  const closeContextMenu = useCallback(() => {
    setMenuState(null);
  }, []);

  /**
   * Opens the context menu.
   * @param {MouseEvent} event - the originating contextmenu/click event (used for position).
   * @param {Array} items - array of menu item descriptors:
   *   { tooltip/text, action/onClick, icon, id, disabled, divider }
   *   Items are compatible with the {icon, tooltip, action, id} shape used by actionMap.js.
   */
  const openContextMenu = useCallback((event, items) => {
    if (armNativeMenuRef.current) {
      // Let this real right-click through untouched so the browser shows its own menu.
      armNativeMenuRef.current = false;
      return;
    }

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const showDefaultContextMenu = () => {
      closeContextMenu();
      armNativeMenuRef.current = true;
    };

    const token = ++openTokenRef.current;
    setMenuState({
      token,
      x: event ? event.clientX : 0,
      y: event ? event.clientY : 0,
      items: [
        ...(items || []),
        { divider: true },
        {
          icon: 'moreactions',
          tooltip: 'Click this and then right-click again to show default context menu',
          action: showDefaultContextMenu,
        },
      ],
    });
  }, [closeContextMenu]);

  return (
    <ContextMenuContext.Provider value={{ openContextMenu, closeContextMenu }}>
      {props.children}
      {menuState && (
        <ContextMenu
          x={menuState.x}
          y={menuState.y}
          items={menuState.items}
          onClose={closeContextMenu}
        />
      )}
    </ContextMenuContext.Provider>
  );
}

/**
 * useContextMenu
 * @returns {{openContextMenu: function, closeContextMenu: function}}
 */
export function useContextMenu() {
  const ctx = useContext(ContextMenuContext);
  if (!ctx) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return ctx;
}
