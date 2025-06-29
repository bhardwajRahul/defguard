use axum::{
    extract::{Path, State},
    Json,
};
use reqwest::StatusCode;
use serde_json::json;

use super::LicenseInfo;
use crate::{
    appstate::AppState,
    auth::{AdminRole, SessionInfo},
    db::{Id, NoId},
    enterprise::db::models::activity_log_stream::{
        ActivityLogStream, ActivityLogStreamConfig, ActivityLogStreamType,
    },
    events::{ApiEvent, ApiEventType, ApiRequestContext},
    handlers::{ApiResponse, ApiResult},
};

pub async fn get_activity_log_stream(
    _admin: AdminRole,
    State(appstate): State<AppState>,
    session: SessionInfo,
) -> ApiResult {
    debug!(
        "User {} retrieving activity log streams",
        session.user.username
    );
    let mut conn = appstate.pool.acquire().await?;
    let streams = ActivityLogStream::all(&mut *conn).await?;
    info!(
        "User {} retrieved activity log streams",
        session.user.username
    );
    Ok(ApiResponse {
        json: json!(streams),
        status: StatusCode::OK,
    })
}

#[derive(Debug, Deserialize)]
pub struct ActivityLogStreamModificationRequest {
    pub name: String,
    pub stream_type: ActivityLogStreamType,
    pub stream_config: serde_json::Value,
}

pub async fn create_activity_log_stream(
    _license: LicenseInfo,
    _admin: AdminRole,
    State(appstate): State<AppState>,
    session: SessionInfo,
    context: ApiRequestContext,
    Json(data): Json<ActivityLogStreamModificationRequest>,
) -> ApiResult {
    let session_username = &session.user.username;
    debug!("User {session_username} creates activity log stream");
    // validate config
    let _ = ActivityLogStreamConfig::from_serde_value(&data.stream_type, &data.stream_config)?;
    let stream_model: ActivityLogStream<NoId> = ActivityLogStream {
        id: NoId,
        name: data.name,
        stream_type: data.stream_type,
        config: data.stream_config,
    };
    let stream = stream_model.save(&appstate.pool).await?;
    info!("User {session_username} created activity log stream");
    appstate.emit_event(ApiEvent {
        context,
        event: ApiEventType::ActivityLogStreamCreated {
            stream_id: stream.id,
            stream_name: stream.name,
        },
    })?;
    debug!("ActivityLogStreamCreated api event sent");
    Ok(ApiResponse {
        json: json!({}),
        status: StatusCode::CREATED,
    })
}

pub async fn modify_activity_log_stream(
    _license: LicenseInfo,
    _admin: AdminRole,
    State(appstate): State<AppState>,
    session: SessionInfo,
    context: ApiRequestContext,
    Path(id): Path<Id>,
    Json(data): Json<ActivityLogStreamModificationRequest>,
) -> ApiResult {
    let session_username = &session.user.username;
    debug!("User {session_username} modifies activity log stream ");
    if let Some(mut stream) = ActivityLogStream::find_by_id(&appstate.pool, id).await? {
        //validate config
        let _ = ActivityLogStreamConfig::from_serde_value(&data.stream_type, &data.stream_config)?;
        stream.name = data.name;
        stream.config = data.stream_config;
        stream.save(&appstate.pool).await?;
        info!("User {session_username} modified activity log stream");
        appstate.emit_event(ApiEvent {
            context,
            event: ApiEventType::ActivityLogStreamModified {
                stream_id: stream.id,
                stream_name: stream.name,
            },
        })?;
        debug!("ActivityLogStreamModified api event sent");
        return Ok(ApiResponse::default());
    }
    Err(crate::error::WebError::ObjectNotFound(format!(
        "Activity Log Stream of id {id} not found."
    )))
}

pub async fn delete_activity_log_stream(
    _license: LicenseInfo,
    _admin: AdminRole,
    State(appstate): State<AppState>,
    session: SessionInfo,
    context: ApiRequestContext,
    Path(id): Path<Id>,
) -> ApiResult {
    let session_username = &session.user.username;
    debug!("User {session_username} deleting Activity Log Stream ({id})");
    if let Some(stream) = ActivityLogStream::find_by_id(&appstate.pool, id).await? {
        let stream_id = stream.id;
        let stream_name = stream.name.clone();
        stream.delete(&appstate.pool).await?;
        appstate.emit_event(ApiEvent {
            context,
            event: ApiEventType::ActivityLogStreamRemoved {
                stream_id,
                stream_name,
            },
        })?;
    } else {
        return Err(crate::error::WebError::ObjectNotFound(format!(
            "Activity Log Stream of id {id} not found."
        )));
    }
    info!("User {session_username} deleted Activity Log Stream");
    debug!("ActivityLogStreamRemoved api event sent");
    Ok(ApiResponse::default())
}
