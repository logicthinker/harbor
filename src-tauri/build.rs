fn main() {
    let icon_dir = std::path::Path::new("icons");
    std::fs::create_dir_all(icon_dir).expect("create icon directory");
    let dib: &[u8] = &[
        40,0,0,0,1,0,0,0,2,0,0,0,1,0,32,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,220,216,99,255,0,0,0,
    ];
    let mut ico = vec![0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 32, 0];
    ico.extend_from_slice(&(dib.len() as u32).to_le_bytes());
    ico.extend_from_slice(&22u32.to_le_bytes());
    ico.extend_from_slice(dib);
    std::fs::write(icon_dir.join("icon.ico"), ico).expect("write icon");
    tauri_build::build()
}
