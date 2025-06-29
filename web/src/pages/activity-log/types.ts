export type ActivityLogModule = 'defguard' | 'client' | 'vpn' | 'enrollment';

export const activityLogModuleValues: ActivityLogModule[] = [
  'defguard',
  'client',
  'enrollment',
  'vpn',
];

export type ActivityLogEventType =
  | 'user_login'
  | 'user_login_failed'
  | 'user_mfa_login'
  | 'user_mfa_login_failed'
  | 'recovery_code_used'
  | 'user_logout'
  | 'user_added'
  | 'user_modified'
  | 'user_removed'
  | 'mfa_disabled'
  | 'mfa_totp_enabled'
  | 'mfa_totp_disabled'
  | 'mfa_email_enabled'
  | 'mfa_email_disabled'
  | 'mfa_security_key_added'
  | 'mfa_security_key_removed'
  | 'device_added'
  | 'device_modified'
  | 'device_removed'
  | 'network_device_added'
  | 'network_device_modified'
  | 'network_device_removed'
  | 'activity_log_stream_created'
  | 'activity_log_stream_modified'
  | 'activity_log_stream_removed'
  | 'vpn_client_connected'
  | 'vpn_client_disconnected'
  | 'vpn_client_connected_mfa'
  | 'vpn_client_disconnected_mfa'
  | 'vpn_client_mfa_failed'
  | 'enrollment_started'
  | 'enrollment_device_added'
  | 'enrollment_completed'
  | 'password_reset_requested'
  | 'password_reset_started'
  | 'password_reset_completed';

export const activityLogEventTypeValues: ActivityLogEventType[] = [
  'user_login',
  'user_login_failed',
  'user_mfa_login',
  'user_mfa_login_failed',
  'recovery_code_used',
  'user_logout',
  'user_added',
  'user_modified',
  'user_removed',
  'mfa_disabled',
  'mfa_totp_enabled',
  'mfa_totp_disabled',
  'mfa_email_enabled',
  'mfa_email_disabled',
  'mfa_security_key_added',
  'mfa_security_key_removed',
  'device_added',
  'device_modified',
  'device_removed',
  'network_device_added',
  'network_device_modified',
  'network_device_removed',
  'activity_log_stream_created',
  'activity_log_stream_modified',
  'activity_log_stream_removed',
  'vpn_client_connected',
  'vpn_client_disconnected',
  'vpn_client_connected_mfa',
  'vpn_client_disconnected_mfa',
  'vpn_client_mfa_failed',
  'enrollment_started',
  'enrollment_device_added',
  'enrollment_completed',
  'password_reset_requested',
  'password_reset_started',
  'password_reset_completed',
];
