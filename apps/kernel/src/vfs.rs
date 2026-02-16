use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Serialize, Deserialize};

#[derive(Clone, Debug)]
pub struct Inode {
    pub id: u64,
    pub name: String,
    pub is_dir: bool,
    pub size: u64,
    pub created: u64,
    pub modified: u64,
    pub content: Option<Vec<u8>>,
    pub permissions: u16,
    pub owner: u32,
    pub group: u32,
    pub xattr: HashMap<String, Vec<u8>>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DirEntry {
    pub name: String,
    pub path: String,
    #[serde(rename = "isDir")]
    pub is_dir: bool,
    pub size: u64,
    pub modified: u64,
}

pub struct VirtualFileSystem {
    inodes: HashMap<u64, Inode>,
    next_id: u64,
    root_id: u64,
    path_cache: HashMap<String, u64>,
}

impl VirtualFileSystem {
    pub fn new() -> Self {
        let mut fs = VirtualFileSystem {
            inodes: HashMap::new(),
            next_id: 1,
            root_id: 0,
            path_cache: HashMap::new(),
        };

        let root = Inode {
            id: 1,
            name: "/".to_string(),
            is_dir: true,
            size: 0,
            created: Self::now(),
            modified: Self::now(),
            content: None,
            permissions: 0o755,
            owner: 0,
            group: 0,
            xattr: HashMap::new(),
        };
        fs.inodes.insert(1, root);
        fs.root_id = 1;
        fs.next_id = 2;
        fs.path_cache.insert("/".to_string(), 1);

        fs
    }

    fn now() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs()
    }

    pub fn mkdir(&mut self, path: &str) -> Result<u64, String> {
        if self.path_cache.contains_key(path) {
            return Err(format!("File exists: {}", path));
        }

        let parent_path = Self::parent_of(path);
        let name = Self::basename(path);

        let _parent_id = *self.path_cache.get(parent_path.as_str())
            .ok_or_else(|| format!("No such file or directory: {}", parent_path))?;

        let id = self.next_id;
        self.next_id += 1;

        let inode = Inode {
            id,
            name: name.to_string(),
            is_dir: true,
            size: 0,
            created: Self::now(),
            modified: Self::now(),
            content: None,
            permissions: 0o755,
            owner: 501,
            group: 20,
            xattr: HashMap::new(),
        };

        self.inodes.insert(id, inode);
        self.path_cache.insert(path.to_string(), id);

        Ok(id)
    }

    pub fn write_file(&mut self, path: &str, content: &str) -> Result<u64, String> {
        let id = if let Some(&existing_id) = self.path_cache.get(path) {
            existing_id
        } else {
            self.next_id
        };

        let name = Self::basename(path);

        let inode = Inode {
            id,
            name: name.to_string(),
            is_dir: false,
            size: content.len() as u64,
            created: Self::now(),
            modified: Self::now(),
            content: Some(content.as_bytes().to_vec()),
            permissions: 0o644,
            owner: 501,
            group: 20,
            xattr: HashMap::new(),
        };

        if !self.path_cache.contains_key(path) {
            self.next_id += 1;
            self.path_cache.insert(path.to_string(), id);
        }

        self.inodes.insert(id, inode);
        Ok(id)
    }

    pub fn read_file(&self, path: &str) -> Result<String, String> {
        let id = self.path_cache.get(path)
            .ok_or_else(|| format!("No such file or directory: {}", path))?;

        let inode = self.inodes.get(id)
            .ok_or_else(|| format!("Corrupted inode: {}", id))?;

        if inode.is_dir {
            return Err(format!("Is a directory: {}", path));
        }

        inode.content.as_ref()
            .map(|bytes| String::from_utf8_lossy(bytes).to_string())
            .ok_or_else(|| format!("Empty file: {}", path))
    }

    pub fn readdir(&self, path: &str) -> Result<Vec<DirEntry>, String> {
        let _parent_id = self.path_cache.get(path)
            .ok_or_else(|| format!("No such file or directory: {}", path))?;

        let clean_path = if path == "/" { "" } else { path };

        let entries: Vec<DirEntry> = self.path_cache.iter()
            .filter(|(p, _id)| {
                if *p == path { return false; }
                let parent = Self::parent_of(p);
                parent == clean_path
            })
            .filter_map(|(p, id)| {
                let inode = self.inodes.get(id)?;
                Some(DirEntry {
                    name: inode.name.clone(),
                    path: p.clone(),
                    is_dir: inode.is_dir,
                    size: inode.size,
                    modified: inode.modified,
                })
            })
            .collect();

        Ok(entries)
    }

    // Helper: get parent path
    fn parent_of(path: &str) -> String {
        if path == "/" { return "/".to_string(); }
        match path.rfind('/') {
            Some(0) => "/".to_string(),
            Some(i) => path[..i].to_string(),
            None => "/".to_string(),
        }
    }

    // Helper: get basename
    fn basename(path: &str) -> String {
        path.rsplit('/').next().unwrap_or(path).to_string()
    }
}
