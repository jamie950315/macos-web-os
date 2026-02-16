use wasm_bindgen::prelude::*;
use std::sync::{Arc, Mutex};
use serde::{Serialize, Deserialize};

mod vfs;
mod process;
mod ipc;

pub use vfs::VirtualFileSystem;
pub use process::ProcessManager;

#[wasm_bindgen]
pub struct DarwinKernel {
    vfs: Arc<Mutex<VirtualFileSystem>>,
    pm: Arc<Mutex<ProcessManager>>,
    boot_time: f64,
}

#[derive(Serialize, Deserialize)]
pub struct SystemInfo {
    pub name: String,
    pub version: String,
    pub build: String,
    pub memory_total: u64,
    pub uptime: f64,
}

#[wasm_bindgen]
impl DarwinKernel {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        console_error_panic_hook::set_once();

        DarwinKernel {
            vfs: Arc::new(Mutex::new(VirtualFileSystem::new())),
            pm: Arc::new(Mutex::new(ProcessManager::new())),
            boot_time: js_sys::Date::now(),
        }
    }

    #[wasm_bindgen]
    pub fn init(&self) -> Result<JsValue, JsValue> {
        let mut vfs = self.vfs.lock().unwrap();

        // 建立 macOS 標準目錄結構 (忽略已存在的錯誤)
        let _ = vfs.mkdir("/");
        let _ = vfs.mkdir("/Applications");
        let _ = vfs.mkdir("/System");
        let _ = vfs.mkdir("/Users");
        let _ = vfs.mkdir("/Users/guest");
        let _ = vfs.mkdir("/Users/guest/Desktop");
        let _ = vfs.mkdir("/Users/guest/Documents");
        let _ = vfs.mkdir("/Users/guest/Downloads");
        let _ = vfs.mkdir("/private");
        let _ = vfs.mkdir("/private/var");
        let _ = vfs.mkdir("/private/tmp");

        // 建立系統檔案 (如果存在則覆蓋)
        let _ = vfs.write_file("/etc/hosts", "127.0.0.1 localhost\n::1 localhost");
        let _ = vfs.write_file("/System/Library/CoreServices/SystemVersion.plist",
r#"<?xml version="1.0"?>
<plist version="1.0">
<dict>
    <key>ProductName</key><string>macOS</string>
    <key>ProductVersion</key><string>14.3</string>
    <key>ProductBuildVersion</key><string>23D56</string>
</dict>
</plist>"#);

        Ok(JsValue::from_str("Kernel initialized successfully"))
    }

    #[wasm_bindgen]
    pub fn get_system_info(&self) -> Result<JsValue, JsValue> {
        let info = SystemInfo {
            name: "macOS".to_string(),
            version: "14.3".to_string(),
            build: "23D56".to_string(),
            memory_total: 17179869184, // 16GB
            uptime: (js_sys::Date::now() - self.boot_time) / 1000.0,
        };
        serde_wasm_bindgen::to_value(&info)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// 讀取目錄 (JS-facing)
    #[wasm_bindgen]
    pub fn readdir(&self, path: &str) -> Result<JsValue, JsValue> {
        let vfs = self.vfs.lock().unwrap();
        let entries = vfs.readdir(path).map_err(|e| JsValue::from_str(&e))?;
        Ok(serde_wasm_bindgen::to_value(&entries)
            .map_err(|e| JsValue::from_str(&e.to_string()))?)
    }

    /// 讀取檔案 (JS-facing)
    #[wasm_bindgen]
    pub fn read_file(&self, path: &str) -> Result<String, JsValue> {
        let vfs = self.vfs.lock().unwrap();
        vfs.read_file(path).map_err(|e| JsValue::from_str(&e))
    }

    /// 寫入檔案 (JS-facing)
    #[wasm_bindgen]
    pub fn write_file(&self, path: &str, content: &str) -> Result<(), JsValue> {
        let mut vfs = self.vfs.lock().unwrap();
        vfs.write_file(path, content).map_err(|e| JsValue::from_str(&e))?;
        Ok(())
    }

    /// 建立目錄 (JS-facing)
    #[wasm_bindgen]
    pub fn mkdir(&self, path: &str) -> Result<(), JsValue> {
        let mut vfs = self.vfs.lock().unwrap();
        vfs.mkdir(path).map_err(|e| JsValue::from_str(&e))?;
        Ok(())
    }

    /// 取得開機時間
    #[wasm_bindgen]
    pub fn uptime(&self) -> f64 {
        (js_sys::Date::now() - self.boot_time) / 1000.0
    }
}
