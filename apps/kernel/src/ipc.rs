use std::collections::HashMap;
use std::sync::{Arc, Mutex};

/// Inter-Process Communication (IPC) module
/// Simulates Mach ports / XPC for macOS-style IPC

#[derive(Clone, Debug)]
pub struct Message {
    pub sender_pid: u32,
    pub receiver_pid: u32,
    pub msg_type: String,
    pub payload: Vec<u8>,
}

pub struct IPCManager {
    channels: HashMap<String, Vec<Message>>,
}

impl IPCManager {
    pub fn new() -> Self {
        IPCManager {
            channels: HashMap::new(),
        }
    }

    pub fn create_channel(&mut self, name: &str) -> Result<(), String> {
        if self.channels.contains_key(name) {
            return Err(format!("Channel already exists: {}", name));
        }
        self.channels.insert(name.to_string(), Vec::new());
        Ok(())
    }

    pub fn send(&mut self, channel: &str, msg: Message) -> Result<(), String> {
        let queue = self.channels.get_mut(channel)
            .ok_or_else(|| format!("No such channel: {}", channel))?;
        queue.push(msg);
        Ok(())
    }

    pub fn receive(&mut self, channel: &str) -> Result<Option<Message>, String> {
        let queue = self.channels.get_mut(channel)
            .ok_or_else(|| format!("No such channel: {}", channel))?;
        Ok(if queue.is_empty() { None } else { Some(queue.remove(0)) })
    }
}
