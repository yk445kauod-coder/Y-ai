import React from 'react';

export const Icon = ({ name, size = 24, className = "" }: { name: string, size?: number, className?: string }) => {
  const iconMap: Record<string, string> = {
    'menu': 'menu',
    'edit_note': 'edit_note',
    'add': 'add',
    'calendar_today': 'calendar_today',
    'chat_bubble_outline': 'chat_bubble_outline',
    'link': 'link',
    'psychology': 'psychology',
    'arrow_upward': 'arrow_upward',
    'search': 'search',
    'image': 'image',
    'check_circle': 'check_circle',
    'check': 'check',
    'schedule': 'schedule',
    'delete': 'delete',
    'timer': 'timer',
    'notifications': 'notifications',
    'logout': 'logout',
    'code': 'code',
    'bolt': 'bolt',
    'mail': 'mail',
    'lock': 'lock',
    'close': 'close',
    'headphones': 'headphones',
    'expand_more': 'expand_more',
    'content_copy': 'content_copy',
    'palette': 'palette',
    'download': 'download',
    'download_for_offline': 'download_for_offline',
    'install_mobile': 'install_mobile',
    'light_mode': 'light_mode',
    'dark_mode': 'dark_mode',
    'description': 'description',
    'add_circle': 'add_circle',
    'thumb_up': 'thumb_up',
    'thumb_down': 'thumb_down',
    'refresh': 'refresh',
    'arrow_forward': 'arrow_forward',
    'developer_mode': 'developer_mode',
    'play_arrow': 'play_arrow',
    'fullscreen': 'fullscreen',
    'fullscreen_exit': 'fullscreen_exit',
    'monitoring': 'monitoring',
    'history_edu': 'history_edu',
    'language': 'language',
    'account_tree': 'account_tree',
    'auto_fix': 'auto_fix',
    'translate': 'translate',
    'explore': 'explore',
    'send': 'send',
    'api': 'api',
    'storage': 'storage',
    'settings': 'settings'
  };

  const materialName = iconMap[name] || name;

  return (
    <span 
      className={`material-symbols-outlined select-none ${className}`} 
      style={{ fontSize: size }}
    >
      {materialName}
    </span>
  );
};