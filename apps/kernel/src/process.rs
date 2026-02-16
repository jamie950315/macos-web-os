use std::collections::HashMap;
use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum ProcessState {
    Running,
    Sleeping,
    Stopped,
    Zombie,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Process {
    pub pid: u32,
    pub ppid: u32,
    pub name: String,
    pub state: ProcessState,
    pub priority: i8,
}

pub struct ProcessManager {
    processes: HashMap<u32, Process>,
    next_pid: u32,
}

impl ProcessManager {
    pub fn new() -> Self {
        let mut pm = ProcessManager {
            processes: HashMap::new(),
            next_pid: 1,
        };

        // PID 1: launchd
        pm.spawn("launchd", 0, 0);
        pm
    }

    pub fn spawn(&mut self, name: &str, ppid: u32, priority: i8) -> u32 {
        let pid = self.next_pid;
        self.next_pid += 1;

        let process = Process {
            pid,
            ppid,
            name: name.to_string(),
            state: ProcessState::Running,
            priority,
        };

        self.processes.insert(pid, process);
        pid
    }

    pub fn kill(&mut self, pid: u32) -> Result<(), String> {
        if pid == 1 {
            return Err("Cannot kill launchd (PID 1)".to_string());
        }
        self.processes.remove(&pid)
            .map(|_| ())
            .ok_or_else(|| format!("No such process: {}", pid))
    }

    pub fn list(&self) -> Vec<&Process> {
        self.processes.values().collect()
    }
}
