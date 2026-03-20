use tauri::Manager;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

pub fn register_global_shortcut(app: &tauri::AppHandle, shortcut: &str) -> Result<(), String> {
    let shortcut_parsed: Shortcut = shortcut
        .parse()
        .map_err(|e| format!("Failed to parse shortcut '{}': {:?}", shortcut, e))?;

    let app_handle = app.clone();

    app.global_shortcut()
        .on_shortcut(shortcut_parsed, move |_app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                if let Some(window) = app_handle.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .map_err(|e| format!("Failed to register global shortcut: {:?}", e))?;

    Ok(())
}

pub fn unregister_global_shortcut(app: &tauri::AppHandle, shortcut: &str) -> Result<(), String> {
    let shortcut_parsed: Shortcut = shortcut
        .parse()
        .map_err(|e| format!("Failed to parse shortcut '{}': {:?}", shortcut, e))?;

    app.global_shortcut()
        .unregister(shortcut_parsed)
        .map_err(|e| format!("Failed to unregister global shortcut: {:?}", e))?;

    Ok(())
}

#[tauri::command]
pub fn update_global_shortcut(
    app: tauri::AppHandle,
    old_shortcut: Option<String>,
    new_shortcut: String,
) -> Result<(), String> {
    if let Some(old) = old_shortcut {
        if !old.is_empty() && old != new_shortcut {
            unregister_global_shortcut(&app, &old)?;
        }
    }

    register_global_shortcut(&app, &new_shortcut)?;

    println!("[Shortcut] Global shortcut updated to: {}", new_shortcut);

    Ok(())
}
