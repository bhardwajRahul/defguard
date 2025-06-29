use thiserror::Error;

#[derive(Debug, Error)]
pub enum ActivityLogStreamError {
    #[error("Deserialization of {0} error: {1}")]
    ConfigDeserializeError(String, String),
    #[error("Sqlx error: {0}")]
    SqlxError(#[from] sqlx::Error),
    #[error("Parsing http header value failed")]
    HeaderValueParsing(),
}
