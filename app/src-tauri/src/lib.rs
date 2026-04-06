use std::process::{Command, Child};
use std::sync::Mutex;

static BACKEND: Mutex<Option<Child>> = Mutex::new(None);

fn find_server_script() -> Option<String> {
    let home = std::env::var("HOME").unwrap_or_default();
    let candidates = [
        "src/backend/server.ts".to_string(),
        format!("{}/Documents/projects/voiceforge/app/src/backend/server.ts", home),
        "/opt/voiceforge/server.ts".to_string(),
    ];
    for path in &candidates {
        if std::path::Path::new(path).exists() {
            return Some(path.clone());
        }
    }
    None
}

fn find_bun() -> String {
    let home = std::env::var("HOME").unwrap_or_default();
    let candidates = [
        format!("{}/.bun/bin/bun", home),
        "/usr/local/bin/bun".to_string(),
        "/usr/bin/bun".to_string(),
        "bun".to_string(),
    ];
    for path in &candidates {
        if path == "bun" || std::path::Path::new(path).exists() {
            return path.clone();
        }
    }
    "bun".to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            if let Some(script_path) = find_server_script() {
                let bun_path = find_bun();
                log::info!("Starting backend: {} run {}", bun_path, script_path);
                match Command::new(&bun_path)
                    .arg("run")
                    .arg(&script_path)
                    .stdout(std::process::Stdio::piped())
                    .stderr(std::process::Stdio::piped())
                    .spawn()
                {
                    Ok(c) => {
                        log::info!("Backend started (PID: {})", c.id());
                        *BACKEND.lock().unwrap() = Some(c);
                    }
                    Err(e) => log::error!("Failed to start backend: {}", e),
                }
            } else {
                log::warn!("Backend server.ts not found");
            }

            Ok(())
        })
        .on_window_event(|_window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                if let Ok(mut guard) = BACKEND.lock() {
                    if let Some(ref mut child) = *guard {
                        let _ = child.kill();
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
