use std::net::IpAddr;

use chrono::{NaiveDateTime, Utc};

use crate::db::{Device, Id, MFAMethod, WireguardNetwork};

/// Shared context that needs to be added to every API event
///
/// Mainly meant to be stored in the activity log.
/// By design this is a duplicate of a similar struct in the `event_logger` module.
/// This is done in order to avoid circular imports once we split the project into multiple crates.
#[derive(Debug)]
pub struct ApiRequestContext {
    pub timestamp: NaiveDateTime,
    pub user_id: Id,
    pub username: String,
    pub ip: IpAddr,
    pub device: String,
}

impl ApiRequestContext {
    pub fn new(user_id: Id, username: String, ip: IpAddr, device: String) -> Self {
        let timestamp = Utc::now().naive_utc();
        Self {
            timestamp,
            user_id,
            username,
            ip,
            device,
        }
    }
}

/// Shared context for every event generated by a user in the gRPC server.
///
/// Similarly to `ApiRequestContexts` at the moment it's mostly meant to populate the activity log.
#[derive(Debug)]
pub struct GrpcRequestContext {
    pub timestamp: NaiveDateTime,
    pub user_id: Id,
    pub username: String,
    pub ip: IpAddr,
    pub device_id: Id,
    pub device_name: String,
}

impl GrpcRequestContext {
    pub fn new(
        user_id: Id,
        username: String,
        ip: IpAddr,
        device_id: Id,
        device_name: String,
    ) -> Self {
        let timestamp = Utc::now().naive_utc();
        Self {
            timestamp,
            user_id,
            username,
            ip,
            device_id,
            device_name,
        }
    }
}

#[derive(Debug)]
pub enum ApiEventType {
    UserLogin,
    UserLoginFailed,
    UserMfaLogin {
        mfa_method: MFAMethod,
    },
    UserMfaLoginFailed {
        mfa_method: MFAMethod,
    },
    RecoveryCodeUsed,
    UserLogout,
    MfaDisabled,
    MfaTotpDisabled,
    MfaTotpEnabled,
    MfaEmailDisabled,
    MfaEmailEnabled,
    MfaSecurityKeyAdded {
        key_id: Id,
        key_name: String,
    },
    MfaSecurityKeyRemoved {
        key_id: Id,
        key_name: String,
    },
    UserAdded {
        username: String,
    },
    UserRemoved {
        username: String,
    },
    UserModified {
        username: String,
    },
    UserDeviceAdded {
        device_id: Id,
        owner: String,
        device_name: String,
    },
    UserDeviceRemoved {
        device_id: Id,
        owner: String,
        device_name: String,
    },
    UserDeviceModified {
        device_id: Id,
        owner: String,
        device_name: String,
    },
    NetworkDeviceAdded {
        device_id: Id,
        device_name: String,
        location_id: Id,
        location: String,
    },
    NetworkDeviceRemoved {
        device_id: Id,
        device_name: String,
        location_id: Id,
        location: String,
    },
    NetworkDeviceModified {
        device_id: Id,
        device_name: String,
        location_id: Id,
        location: String,
    },
    ActivityLogStreamCreated {
        stream_id: Id,
        stream_name: String,
    },
    ActivityLogStreamModified {
        stream_id: Id,
        stream_name: String,
    },
    ActivityLogStreamRemoved {
        stream_id: Id,
        stream_name: String,
    },
}

/// Events from Web API
#[derive(Debug)]
pub struct ApiEvent {
    pub context: ApiRequestContext,
    pub event: ApiEventType,
}

/// Events from gRPC server
#[derive(Debug)]
pub enum GrpcEvent {
    GatewayConnected,
    GatewayDisconnected,
    ClientConnected {
        context: GrpcRequestContext,
        location: WireguardNetwork<Id>,
        device: Device<Id>,
    },
    ClientDisconnected {
        context: GrpcRequestContext,
        location: WireguardNetwork<Id>,
        device: Device<Id>,
    },
}

/// Shared context for every event generated from a user request in the bi-directional gRPC stream.
///
/// Similarly to `ApiRequestContexts` at the moment it's mostly meant to populate the activity log.
#[derive(Debug)]
pub struct BidiRequestContext {
    pub timestamp: NaiveDateTime,
    pub user_id: Id,
    pub username: String,
    pub ip: IpAddr,
    pub user_agent: String,
}

impl BidiRequestContext {
    pub fn new(user_id: Id, username: String, ip: IpAddr, user_agent: String) -> Self {
        let timestamp = Utc::now().naive_utc();
        Self {
            timestamp,
            user_id,
            username,
            ip,
            user_agent,
        }
    }
}

/// Events emmited from gRPC bi-directional communication stream
#[derive(Debug)]
pub struct BidiStreamEvent {
    pub context: BidiRequestContext,
    pub event: BidiStreamEventType,
}

/// Wrapper enum for different types of events emitted by the bidi stream.
///
/// Each variant represents a separate gRPC service that's part of the bi-directional communications server.
#[allow(clippy::large_enum_variant)]
#[derive(Debug)]
pub enum BidiStreamEventType {
    Enrollment(EnrollmentEvent),
    PasswordReset(PasswordResetEvent),
    DesktopClientMfa(DesktopClientMfaEvent),
}

#[derive(Debug)]
pub enum EnrollmentEvent {
    EnrollmentStarted,
    EnrollmentDeviceAdded { device: Device<Id> },
    EnrollmentCompleted,
}

#[derive(Debug)]
pub enum PasswordResetEvent {
    PasswordResetRequested,
    PasswordResetStarted,
    PasswordResetCompleted,
}

#[derive(Debug)]
pub enum DesktopClientMfaEvent {
    Connected {
        device: Device<Id>,
        location: WireguardNetwork<Id>,
        method: MFAMethod,
    },
    Failed {
        device: Device<Id>,
        location: WireguardNetwork<Id>,
        method: MFAMethod,
    },
}

/// Shared context for every internally-triggered event.
///
/// Similarly to `ApiRequestContexts` at the moment it's mostly meant to populate the audit log.
#[derive(Debug)]
pub struct InternalEventContext {
    pub timestamp: NaiveDateTime,
    pub user_id: Id,
    pub username: String,
    pub ip: IpAddr,
    pub device: Device<Id>,
}

impl InternalEventContext {
    pub fn new(user_id: Id, username: String, ip: IpAddr, device: Device<Id>) -> Self {
        let timestamp = Utc::now().naive_utc();
        Self {
            timestamp,
            user_id,
            username,
            ip,
            device,
        }
    }
}

/// Events emmited by background threads, not triggered directly by users
#[derive(Debug)]
pub enum InternalEvent {
    DesktopClientMfaDisconnected {
        context: InternalEventContext,
        location: WireguardNetwork<Id>,
    },
}
