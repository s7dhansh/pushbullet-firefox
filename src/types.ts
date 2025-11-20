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
  type: 'note' | 'link' | 'file' | 'mirror' | 'sms_changed';
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
}

export enum Tab {
  DEVICES = 'DEVICES',
  PUSHES = 'PUSHES',
  SMS = 'SMS',
  SETTINGS = 'SETTINGS'
}