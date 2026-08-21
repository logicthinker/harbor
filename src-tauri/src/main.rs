#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use reqwest::{Client, Method};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{AppHandle, Manager, State};
use tokio::sync::Mutex;

#[derive(Debug, Clone, Deserialize)]
struct HttpRequestInput {
    method: String,
    url: String,
    headers: Option<Vec<HeaderInput>>,
    body: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct HeaderInput { key: String, value: String }

#[derive(Debug, Clone, Serialize)]
struct HttpResponseOutput {
    status: u16,
    status_text: String,
    headers: Vec<HeaderInput>,
    body: String,
    duration_ms: u128,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct HarborProject {
    version: u32,
    name: String,
    environments: Vec<Environment>,
    #[serde(default)]
    requests: serde_json::Value,
    #[serde(default)]
    history: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Environment { name: String, variables: Vec<Variable> }

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Variable { key: String, value: String, secret: bool }

struct AppState { client: Client, project: Mutex<HarborProject> }

fn secret_entry(scope: &str) -> Result<keyring::Entry, String> {
    keyring::Entry::new("harbor", scope).map_err(|e| format!("Could not access OS credential store: {e}"))
}

#[tauri::command]
fn set_secret(scope: String, value: String) -> Result<(), String> { secret_entry(&scope)?.set_password(&value).map_err(|e| format!("Could not save secret: {e}")) }

#[tauri::command]
fn get_secret(scope: String) -> Result<Option<String>, String> {
    match secret_entry(&scope)?.get_password() { Ok(value) => Ok(Some(value)), Err(keyring::Error::NoEntry) => Ok(None), Err(e) => Err(format!("Could not read secret: {e}")) }
}

#[tauri::command]
fn delete_secret(scope: String) -> Result<(), String> { secret_entry(&scope)?.delete_credential().map_err(|e| format!("Could not delete secret: {e}")) }

#[tauri::command]
async fn execute_request(input: HttpRequestInput, state: State<'_, AppState>) -> Result<HttpResponseOutput, String> {
    let method = Method::from_bytes(input.method.as_bytes()).map_err(|e| format!("Invalid HTTP method: {e}"))?;
    let started = std::time::Instant::now();
    let mut request = state.client.request(method, &input.url);
    if let Some(headers) = input.headers {
        for header in headers {
            request = request.header(&header.key, &header.value);
        }
    }
    if let Some(body) = input.body { request = request.body(body); }
    let response = request.send().await.map_err(|e| format!("Request failed: {e}"))?;
    let status = response.status();
    let status_text = status.canonical_reason().unwrap_or("Unknown").to_owned();
    let headers = response.headers().iter().map(|(key, value)| HeaderInput { key: key.to_string(), value: value.to_str().unwrap_or("<binary>").to_owned() }).collect();
    let body = response.text().await.map_err(|e| format!("Could not read response body: {e}"))?;
    Ok(HttpResponseOutput { status: status.as_u16(), status_text, headers, body, duration_ms: started.elapsed().as_millis() })
}

#[tauri::command]
async fn load_project(app: AppHandle, state: State<'_, AppState>) -> Result<HarborProject, String> {
    let path = project_path(&app)?;
    if path.exists() {
        let bytes = std::fs::read(path).map_err(|e| format!("Could not read project: {e}"))?;
        let project: HarborProject = serde_json::from_slice(&bytes).map_err(|e| format!("Could not parse project: {e}"))?;
        *state.project.lock().await = project.clone();
        return Ok(project);
    }
    Ok(state.project.lock().await.clone())
}

#[tauri::command]
async fn save_project(app: AppHandle, project: HarborProject, state: State<'_, AppState>) -> Result<(), String> {
    let path = project_path(&app)?;
    let mut disk_project = project.clone();
    for environment in &mut disk_project.environments { for variable in &mut environment.variables { if variable.secret { variable.value.clear(); } } }
    let serialized = serde_json::to_vec_pretty(&disk_project).map_err(|e| format!("Could not serialize project: {e}"))?;
    std::fs::create_dir_all(path.parent().unwrap()).map_err(|e| format!("Could not create project directory: {e}"))?;
    std::fs::write(path, serialized).map_err(|e| format!("Could not save project: {e}"))?;
    *state.project.lock().await = project;
    Ok(())
}

fn project_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app.path().app_data_dir().map_err(|e| format!("Could not resolve app data directory: {e}"))?.join("project.json"))
}

fn default_project() -> HarborProject {
    HarborProject { version: 2, name: "Acme API".into(), environments: vec![Environment { name: "development".into(), variables: vec![Variable { key: "base_url".into(), value: "https://api.acme.dev".into(), secret: false }] }], requests: serde_json::json!([]), history: serde_json::json!([]) }
}

fn main() {
    tauri::Builder::default()
        .manage(AppState { client: Client::builder().user_agent("Harbor/0.1").build().expect("HTTP client"), project: Mutex::new(default_project()) })
        .invoke_handler(tauri::generate_handler![execute_request, load_project, save_project, set_secret, get_secret, delete_secret])
        .run(tauri::generate_context!())
        .expect("error while running Harbor");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_project_is_safe_and_versioned() {
        let project = default_project();
        assert_eq!(project.version, 2);
        assert_eq!(project.name, "Acme API");
        assert_eq!(project.environments[0].name, "development");
        assert!(!project.environments[0].variables[0].secret);
    }

    #[test]
    fn method_parsing_accepts_standard_methods() {
        assert!(Method::from_bytes(b"GET").is_ok());
        assert!(Method::from_bytes(b"PATCH").is_ok());
        assert!(Method::from_bytes(b"not valid").is_err());
    }
}
