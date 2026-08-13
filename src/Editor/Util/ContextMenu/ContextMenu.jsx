/*
 * Copyright 2020 WICKLETS LLC
 *
 * This file is part of Wick Editor.
 *
 * Wick Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Editor.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect, useRef, useState } from 'react';
import ToolIcon from 'Editor/Util/ToolIcon/ToolIcon';
import './_contextmenu.scss';

const MENU_MARGIN = 6;

export default function ContextMenu({ x, y, items, onClose }) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ x, y, visible: false });

  // Clamp the menu inside the viewport once we know its rendered size.
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const clampedX = Math.min(x, window.innerWidth - rect.width - MENU_MARGIN);
    const clampedY = Math.min(y, window.innerHeight - rect.height - MENU_MARGIN);
    setPosition({
      x: Math.max(MENU_MARGIN, clampedX),
      y: Math.max(MENU_MARGIN, clampedY),
      visible: true,
    });
  }, [x, y, items]);

  useEffect(() => {
    const handlePointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const handleScroll = () => onClose();

    document.addEventListener('mousedown', handlePointerDown, true);
    document.addEventListener('contextmenu', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown, true);
      document.removeEventListener('contextmenu', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [onClose]);

  const handleItemClick = (item) => {
    if (item.disabled) return;
    const fn = item.action || item.onClick;
    if (fn) fn();
    onClose();
  };

  return (
    <div
      id="context-menu"
      ref={menuRef}
      style={{
        left: position.x,
        top: position.y,
        visibility: position.visible ? 'visible' : 'hidden',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) => {
        if (item.divider) {
          return <div className="context-menu-divider" key={`divider-${i}`} />;
        }
        return (
          <div
            className={`context-menu-item${item.disabled ? ' context-menu-item-disabled' : ''}`}
            key={item.id || item.tooltip || item.text || i}
            onClick={() => handleItemClick(item)}
          >
            {item.icon && (
              <div className="context-menu-item-icon">
                <ToolIcon name={item.icon} />
              </div>
            )}
            <div className="context-menu-item-label">{item.tooltip || item.text}</div>
          </div>
        );
      })}
    </div>
  );
}
