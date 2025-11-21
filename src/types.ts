export interface User {
  iden: string;
  email: string;
  name: string;
  image_url: string;
}

export interface Device {
  iden: string;
  active: boolean;
  created: number;
  modified: number;
  icon: string;
  nickname: string;
  generated_nickname: boolean;
  manufacturer: string;
  model: string;
  app_version: number;
  push_token: string;
  pushable: boolean;
  has_sms: boolean;
  kind: string;
}

export interface Push {
  iden: string;
  active: boolean;
  created: number;
  modified: number;
  type: 'note' | 'link' | 'file' | 'mirror' | 'sms_changed' | 'messaging_extension_reply' | 'messaging_extension_list_threads' | 'messaging_extension_list_messages';
  dismissed: boolean;
  direction: 'self' | 'outgoing' | 'incoming';
  sender_iden: string;
  sender_email: string;
  receiver_iden: string;
  receiver_email: string;
  title?: string;
  body?: string;
  url?: string;
  file_name?: string;
  file_type?: string;
  file_url?: string;
  application_name?: string;
  notification_id?: string;
  package_name?: string;
  icon?: string;
  source_device_iden?: string;
  data?: {
    threads?: SmsThread[];
    messages?: SmsMessage[];
  };
}

export interface SmsThread {
  id: string;
  address: string;
  recipients: { name: string; address: string; number: string; thumbnail_id?: number }[];
  latest_message: string;
  timestamp: number;
}

export interface SmsMessage {
  id: string;
  direction: '1' | '2'; // 1 = Received, 2 = Sent
  body: string;
  timestamp: number;
  status: string;
}

export interface WebSocketMessage {
  type: 'tickle' | 'push' | 'nop';
  subtype?: 'push' | 'device';
  push?: Push;
}

export enum Tab {
  DEVICES = 'DEVICES',
  PUSHES = 'PUSHES',
  SMS = 'SMS',
  SETTINGS = 'SETTINGS'
}
