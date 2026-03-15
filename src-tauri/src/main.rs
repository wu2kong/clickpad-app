// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use tauri_plugin_shell::ShellExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct ExecuteResult {
    success: bool,
    message: String,
    output: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScriptParams {
    args: Option<Vec<String>>,
    env: Option<Vec<(String, String)>>,
    working_dir: Option<String>,
    timeout_ms: Option<u64>,
}

#[tauri::command]
async fn execute_action(
    action_type: String,
    action_value: String,
    params: Option<ScriptParams>,
    app: tauri::AppHandle,
) -> Result<ExecuteResult, String> {
    match action_type.as_str() {
        "open_app" => execute_open_app(&action_value, &app).await,
        "execute_script" => execute_script(&action_value, params, &app).await,
        _ => Err(format!("未知操作类型: {}", action_type)),
    }
}

async fn execute_open_app(path: &str, app: &tauri::AppHandle) -> Result<ExecuteResult, String> {
    #[cfg(target_os = "macos")]
    {
        let output = app
            .shell()
            .command("open")
            .args([path])
            .output()
            .await
            .map_err(|e| format!("打开应用失败: {}", e))?;

        if output.status.success() {
            Ok(ExecuteResult {
                success: true,
                message: "应用已打开".to_string(),
                output: None,
            })
        } else {
            Err(String::from_utf8_lossy(&output.stderr).to_string())
        }
    }

    #[cfg(target_os = "windows")]
    {
        let output = app
            .shell()
            .command("cmd")
            .args(["/C", "start", "", path])
            .output()
            .await
            .map_err(|e| format!("打开应用失败: {}", e))?;

        if output.status.success() {
            Ok(ExecuteResult {
                success: true,
                message: "应用已打开".to_string(),
                output: None,
            })
        } else {
            Err(String::from_utf8_lossy(&output.stderr).to_string())
        }
    }

    #[cfg(target_os = "linux")]
    {
        let output = app
            .shell()
            .command("xdg-open")
            .args([path])
            .output()
            .await
            .map_err(|e| format!("打开应用失败: {}", e))?;

        if output.status.success() {
            Ok(ExecuteResult {
                success: true,
                message: "应用已打开".to_string(),
                output: None,
            })
        } else {
            Err(String::from_utf8_lossy(&output.stderr).to_string())
        }
    }
}

async fn execute_script(
    script: &str,
    params: Option<ScriptParams>,
    app: &tauri::AppHandle,
) -> Result<ExecuteResult, String> {
    let params = params.unwrap_or(ScriptParams {
        args: None,
        env: None,
        working_dir: None,
        timeout_ms: None,
    });

    #[cfg(target_os = "windows")]
    let (shell, flag) = ("cmd", "/C");

    #[cfg(not(target_os = "windows"))]
    let (shell, flag) = ("sh", "-c");

    let mut cmd = app.shell().command(shell).args([flag, script]);

    if let Some(args) = &params.args {
        cmd = cmd.args(args);
    }

    if let Some(env_vars) = &params.env {
        for (key, value) in env_vars {
            cmd = cmd.env(key, value);
        }
    }

    if let Some(dir) = &params.working_dir {
        cmd = cmd.current_dir(dir);
    }

    let output = cmd
        .output()
        .await
        .map_err(|e| format!("执行脚本失败: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if output.status.success() {
        Ok(ExecuteResult {
            success: true,
            message: "脚本执行成功".to_string(),
            output: Some(stdout),
        })
    } else {
        Ok(ExecuteResult {
            success: false,
            message: "脚本执行失败".to_string(),
            output: Some(stderr),
        })
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![execute_action])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
