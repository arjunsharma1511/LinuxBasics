const STORAGE_KEY = "linuxLaunchpadBasicsV1";
const TOTAL_ACTIVITIES = 53;

const defaultState = {
  completed: [],
  missionIndex: 0,
  cwd: "/home/student",
  commandHistory: [],
  studentName: ""
};

let state = loadState();

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function loadState() {
  try {
    return { ...defaultState, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  $("#saveStatus").textContent = "Progress saved locally";
}

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove("show"), 2300);
}

function complete(id) {
  if (!state.completed.includes(id)) {
    state.completed.push(id);
    saveState();
    updateProgress();
    toast("Activity complete. Progress saved.");
  }
}

const orientationQuestions = [
  { q: "What does an operating system help manage?", a: 0, options: ["Hardware, files, memory and programs", "Only the keyboard colour", "Only websites"] },
  { q: "What is the Linux kernel?", a: 1, options: ["A text document", "The core that manages resources and communicates with hardware", "A web browser"] },
  { q: "What is a Linux distribution?", a: 0, options: ["A complete Linux system built from the kernel and software", "A password", "A network cable"] },
  { q: "Which statement is correct?", a: 2, options: ["The terminal and shell are hardware", "Linux ignores capital letters", "The terminal is the window and the shell interprets commands"] }
];

function renderOrientationQuiz() {
  $("#orientationQuiz").innerHTML = orientationQuestions.map((question, index) => `
    <div class="quiz-row"><label>${index + 1}. ${question.q}
      <select data-orientation="${index}"><option value="">Choose an answer</option>${question.options.map((option, optionIndex) => `<option value="${optionIndex}">${option}</option>`).join("")}</select>
    </label></div>`).join("");
}

renderOrientationQuiz();

$("#checkOrientation").addEventListener("click", () => {
  const selects = $$('[data-orientation]');
  if (selects.some(select => select.value === "")) {
    setFeedback("#orientationFeedback", "Choose an answer for every question.", false);
    return;
  }
  const correct = orientationQuestions.every((question, index) => Number(selects[index].value) === question.a);
  if (!correct) {
    setFeedback("#orientationFeedback", "Not quite. Read the four concept cards and try again.", false);
    return;
  }
  setFeedback("#orientationFeedback", "Orientation complete. You are ready to use the training terminal.", true);
  complete("orientation");
  setTimeout(() => $("#commandLab").scrollIntoView({ behavior: "smooth" }), 350);
});

const stages = {
  A: "Meet the terminal",
  B: "Look around",
  C: "Move safely",
  D: "Create files",
  E: "Organise files",
  F: "Read and search",
  G: "Permissions",
  H: "System basics"
};

const missions = [
  m("A", "Who am I?", "whoami", "The whoami command prints the username attached to the current shell session.", "Confirm which training user is signed in.", "Type whoami and run it.", "The command is one word with no spaces.", "student"),
  m("A", "Where am I?", "pwd", "pwd means print working directory. It prints the full path of your current location.", "Always confirm your location before creating, moving or removing files.", "Print the current working directory.", "Type the three lowercase letters pwd.", "/home/student"),
  m("A", "Name this computer", "hostname", "hostname displays the name assigned to the computer.", "Hostnames help identify which machine you are using.", "Display the fictional VM hostname.", "Type hostname as one lowercase word.", "linux-lab"),
  m("A", "Check the date", "date", "date displays the system date and time.", "Timestamps help place activity in order and are useful when checking logs.", "Display the simulated system date and time.", "Type date and press Enter.", "Fri Nov 21 10:30:00 IST 2026"),
  m("A", "Identify the system", "uname -a", "uname shows operating-system information. The -a option asks for all commonly available details.", "Confirm that the session represents a Linux system and view its training kernel information.", "Run uname with the -a option.", "There is one space between uname and -a.", "Linux linux-lab 6.8.0-training #1 SMP x86_64 GNU/Linux"),
  m("A", "Print a message", "echo \"Hello Linux\"", "echo prints text in the terminal. Quotation marks keep the words together as one text value.", "Learn a harmless way to display a message and understand quoted text.", "Print the exact words Hello Linux.", "Include the double quotation marks shown in the command.", "Hello Linux"),

  m("B", "List normal content", "ls", "ls lists visible files and directories in the current directory.", "See what is available before deciding where to go.", "List the visible content of your home directory.", "Type the lowercase letters ls.", "Desktop  Documents  Downloads  challenge  logs"),
  m("B", "List with details", "ls -l", "ls -l uses the long format. It includes permissions, owner, size, date and name.", "Detailed listings provide more context than names alone.", "Display a long listing of the home directory.", "Use a lowercase letter l after the hyphen.", "drwxr-xr-x 2 student student 4096 Nov 21 09:00 Desktop\ndrwxr-xr-x 3 student student 4096 Nov 21 09:00 Documents\ndrwxr-xr-x 2 student student 4096 Nov 21 09:00 Downloads\ndrwxr-xr-x 4 student student 4096 Nov 21 09:00 challenge\ndrwxr-xr-x 2 student student 4096 Nov 21 09:00 logs"),
  m("B", "Reveal hidden names", "ls -a", "The -a option includes hidden names. Linux hidden files normally begin with a dot.", "Configuration files are often hidden from an ordinary listing.", "List all names, including hidden ones.", "Use -a, where a means all.", ".  ..  .profile  .training-note  Desktop  Documents  Downloads  challenge  logs"),
  m("B", "Combine useful options", "ls -la", "Options can often be combined. -la requests a long listing that also includes hidden names.", "Learn to gather names and details with one command.", "Display a detailed listing including hidden names.", "Type ls, one space, then -la.", "drwxr-xr-x 8 student student 4096 Nov 21 09:00 .\ndrwxr-xr-x 3 root    root    4096 Nov 21 08:00 ..\n-rw-r--r-- 1 student student  220 Nov 21 09:00 .profile\n-rw-r--r-- 1 student student   46 Nov 21 09:00 .training-note\ndrwxr-xr-x 2 student student 4096 Nov 21 09:00 Desktop\ndrwxr-xr-x 3 student student 4096 Nov 21 09:00 Documents"),
  m("B", "Clear the display", "clear", "clear removes previous text from the visible terminal display. It does not delete files or command history.", "Keep a busy terminal readable without changing the filesystem.", "Clear the terminal display.", "Type clear. The mission will still be recorded.", ""),
  m("B", "Review command history", "history", "history lists commands entered in the current shell session.", "Review your work and avoid forgetting which commands were used.", "Display the command history so far.", "Type history as one word.", "__HISTORY__"),

  m("C", "Enter Documents", "cd Documents", "cd means change directory. A relative name such as Documents is found from the current location.", "Move from your home directory into the Documents directory.", "Change into Documents.", "Linux names are case-sensitive, so use capital D.", "", "/home/student/Documents"),
  m("C", "Confirm the new location", "pwd", "pwd prints the full path after a directory change.", "Never assume that a cd command took you where expected; verify it.", "Print your location inside Documents.", "The output should end with /Documents.", "/home/student/Documents"),
  m("C", "Inspect Documents", "ls", "ls shows the visible content of the current directory, which is now Documents.", "Discover the Projects directory and welcome file before using them.", "List the content of Documents.", "Type ls with no options.", "Projects  welcome.txt"),
  m("C", "Enter Projects", "cd Projects", "cd can move into a child directory listed in the current location.", "Practise moving one level deeper in the directory tree.", "Change from Documents into Projects.", "Use capital P because the directory is named Projects.", "", "/home/student/Documents/Projects"),
  m("C", "Move up one level", "cd ..", "Two dots mean the parent directory, which is one level above the current directory.", "Return from Projects to Documents without typing the full path.", "Move up to the parent directory.", "There is one space between cd and two dots.", "", "/home/student/Documents"),
  m("C", "Return home", "cd ~", "The tilde symbol is a shortcut for the current user's home directory.", "Return home quickly from another location.", "Use the tilde shortcut to return to /home/student.", "The tilde is the ~ character.", "", "/home/student"),

  m("D", "Create a practice directory", "mkdir linux-practice", "mkdir means make directory. It creates a new directory with the supplied name.", "Prepare a safe location for the file exercises.", "Create a directory named linux-practice.", "Use a hyphen between linux and practice.", ""),
  m("D", "Enter the practice directory", "cd linux-practice", "cd changes the shell's current directory to the named location.", "Keep all new practice files together.", "Move into linux-practice.", "Use the same lowercase name you created.", "", "/home/student/linux-practice"),
  m("D", "Create an empty file", "touch notes.txt", "touch creates an empty file when the name does not already exist. It can also update a file timestamp.", "Create a harmless text file that later commands can use.", "Create notes.txt.", "The filename is lowercase and ends with .txt.", ""),
  m("D", "Confirm the file exists", "ls", "ls lists the current directory so you can verify the result of touch.", "Check evidence instead of assuming that file creation worked.", "List the practice directory.", "The expected name is notes.txt.", "notes.txt"),
  m("D", "Write text into the file", "echo \"Linux practice complete\" > notes.txt", "The greater-than symbol redirects echo output into a file. It replaces that file's previous content.", "Learn basic output redirection using a disposable training file.", "Write the exact sentence into notes.txt.", "Include the quotes, spaces and single > symbol exactly as shown.", ""),
  m("D", "Read the file", "cat notes.txt", "cat displays text-file content in the terminal.", "Verify that the redirected sentence was written correctly.", "Display notes.txt.", "Type cat, a space, then the filename.", "Linux practice complete"),
  m("D", "Copy the file", "cp notes.txt notes-copy.txt", "cp copies a source file to a destination name.", "Keep the original while creating a second copy for organisation practice.", "Copy notes.txt to notes-copy.txt.", "Source comes first; destination comes second.", ""),
  m("D", "Inspect both files", "ls -l", "A long listing lets you compare the two filenames and basic metadata.", "Confirm that both the original and copy exist.", "Display a long listing of the practice directory.", "Use the lowercase letter l option.", "-rw-r--r-- 1 student student 24 Nov 21 10:44 notes-copy.txt\n-rw-r--r-- 1 student student 24 Nov 21 10:43 notes.txt"),

  m("E", "Rename the copy", "mv notes-copy.txt backup.txt", "mv moves files and also renames them when the destination is a new filename in the same directory.", "Give the copied file a clearer purpose-based name.", "Rename notes-copy.txt to backup.txt.", "Old name first, new name second.", ""),
  m("E", "Create an archive directory", "mkdir archive", "mkdir creates a new directory.", "Prepare a location for the backup file.", "Create a directory named archive.", "Use the singular lowercase word archive.", ""),
  m("E", "Move the backup", "mv backup.txt archive/", "mv can move a file into an existing directory. The trailing slash makes the destination clearly a directory.", "Organise the backup inside archive.", "Move backup.txt into archive.", "Include the slash after archive.", ""),
  m("E", "Check the archive", "ls archive", "ls can list another directory without changing into it.", "Confirm that backup.txt reached the intended directory.", "List the content of archive.", "Put the directory name after ls.", "backup.txt"),
  m("E", "Create a disposable file", "touch temporary.txt", "touch creates an empty file. This one is intentionally disposable.", "Prepare a safe file for removal practice.", "Create temporary.txt.", "Check the spelling of temporary.", ""),
  m("E", "Remove the disposable file", "rm temporary.txt", "rm removes a file. The basic command does not place it in a recycle bin, so targets must be checked carefully.", "Practise removal only on the specifically created disposable file.", "Remove temporary.txt and no other file.", "Never add wildcards. Type the exact disposable filename.", ""),

  m("F", "Open the logs directory", "cd ~/logs", "cd accepts a path beginning with ~, the home-directory shortcut.", "Move directly to logs from any current directory.", "Change into /home/student/logs.", "Use ~/logs exactly.", "", "/home/student/logs"),
  m("F", "Read the beginning", "head events.log", "head displays the first ten lines of a text file by default.", "Quickly inspect the beginning without printing an entire file.", "Show the beginning of events.log.", "Type head followed by the filename.", "2026-11-21 09:00 INFO system started\n2026-11-21 09:02 INFO network ready\n2026-11-21 09:05 INFO user student signed in\n2026-11-21 09:10 WARN update available\n2026-11-21 09:15 INFO terminal opened\n2026-11-21 09:20 INFO lesson loaded\n2026-11-21 09:25 ERROR printer unavailable\n2026-11-21 09:30 INFO retry scheduled\n2026-11-21 09:35 INFO file created\n2026-11-21 09:40 INFO backup complete"),
  m("F", "Read the ending", "tail events.log", "tail displays the last ten lines of a text file by default.", "Inspect the most recent entries in a chronological log.", "Show the ending of events.log.", "Type tail followed by the filename.", "2026-11-21 09:05 INFO user student signed in\n2026-11-21 09:10 WARN update available\n2026-11-21 09:15 INFO terminal opened\n2026-11-21 09:20 INFO lesson loaded\n2026-11-21 09:25 ERROR printer unavailable\n2026-11-21 09:30 INFO retry scheduled\n2026-11-21 09:35 INFO file created\n2026-11-21 09:40 INFO backup complete\n2026-11-21 09:45 ERROR sample service stopped\n2026-11-21 09:50 INFO lab ready"),
  m("F", "Count the lines", "wc -l events.log", "wc counts text. The -l option requests the number of lines.", "Measure how many entries are in the training log.", "Count lines in events.log.", "Use a lowercase letter l after the hyphen.", "12 events.log"),
  m("F", "Filter error lines", "grep \"ERROR\" events.log", "grep prints lines containing a supplied pattern. Quotation marks clearly enclose the pattern.", "Find relevant log entries without reading every line manually.", "Show only lines containing ERROR.", "ERROR is uppercase in this case-sensitive search.", "2026-11-21 09:25 ERROR printer unavailable\n2026-11-21 09:45 ERROR sample service stopped"),
  m("F", "Find a file by name", "find ~ -name \"welcome.txt\"", "find searches directory trees. ~ sets the starting point and -name supplies the filename pattern.", "Locate a file when you know its name but not its exact path.", "Search your home directory for welcome.txt.", "Keep the quotes around welcome.txt.", "/home/student/Documents/welcome.txt"),

  m("G", "Return to Documents", "cd ~/Documents", "This absolute-from-home path moves directly to Documents.", "Prepare to inspect the welcome file returned by find.", "Change into your Documents directory.", "Use capital D in Documents.", "", "/home/student/Documents"),
  m("G", "Read the permission string", "ls -l welcome.txt", "A long listing begins with a permission string. -rw-r--r-- describes a regular file with read/write for the owner and read for others.", "Observe current permissions before changing anything.", "Show the detailed listing for welcome.txt.", "Place the filename after ls -l.", "-rw-r--r-- 1 student student 42 Nov 21 09:00 welcome.txt"),
  m("G", "Add owner execute permission", "chmod u+x welcome.txt", "chmod changes permissions. u means the owning user, + means add, and x means execute.", "Practise one small, explicit permission change on a training file.", "Add execute permission for the owning user.", "The symbolic mode is u+x.", ""),
  m("G", "Verify the permission change", "ls -l welcome.txt", "Running the long listing again verifies the result. The owner section now contains x.", "Confirm that the requested permission changed and nothing else was assumed.", "Display welcome.txt permissions again.", "Look for -rwx at the start of the output.", "-rwxr--r-- 1 student student 42 Nov 21 09:00 welcome.txt"),

  m("H", "Return to home", "cd ~", "The tilde shortcut returns to the current user's home directory.", "Begin system-information checks from a familiar location.", "Return to /home/student.", "Type cd, one space and ~.", "", "/home/student"),
  m("H", "Inspect identity details", "id", "id displays the numeric user ID, primary group and additional groups.", "See more identity context than whoami provides.", "Display the fictional user's IDs and groups.", "Type the two lowercase letters id.", "uid=1000(student) gid=1000(student) groups=1000(student),27(sudo)"),
  m("H", "Locate the Bash program", "which bash", "which searches command locations and prints the executable path that would run.", "Understand that commands such as bash are programs stored in the filesystem.", "Find the path of bash.", "Type which, a space, then bash.", "/usr/bin/bash"),
  m("H", "View storage usage", "df -h", "df reports filesystem space. The -h option uses human-readable units such as G and M.", "Check overall storage capacity and available space.", "Display human-readable filesystem usage.", "There is one space before -h.", "Filesystem      Size  Used Avail Use% Mounted on\n/dev/vda1        40G   12G   26G  32% /\ntmpfs           1.0G     0  1.0G   0% /dev/shm"),
  m("H", "View memory usage", "free -h", "free reports memory and swap usage. -h uses readable units.", "Check total, used and available memory at a glance.", "Display human-readable memory usage.", "Do not confuse free with df: free is memory, df is disk space.", "               total        used        free      shared  buff/cache   available\nMem:           3.8Gi       1.1Gi       1.7Gi       120Mi       1.0Gi       2.4Gi\nSwap:          1.0Gi          0B       1.0Gi"),
  m("H", "View running processes", "ps", "ps displays processes associated with the current terminal session.", "See that the shell and ps command run as processes.", "Display the current terminal processes.", "Type ps with no options.", "    PID TTY          TIME CMD\n   1201 pts/0    00:00:00 bash\n   1842 pts/0    00:00:00 ps"),
  m("H", "Read a manual page", "man pwd", "man opens a command's manual page. In a real terminal, q normally exits the viewer.", "Learn where to look for authoritative local help about command syntax and meaning.", "Open the simulated manual page for pwd.", "Type man, a space, then pwd.", "PWD(1)                    User Commands                    PWD(1)\n\nNAME\n       pwd - print name of current/working directory\n\nSYNOPSIS\n       pwd [OPTION]...\n\nDESCRIPTION\n       Print the full filename of the current working directory.\n\nTraining viewer: the page ends automatically here."),
  m("H", "Review the complete history", "history", "history lists commands from the shell session in order.", "Review your command journey and prepare for the final questions.", "Display your accumulated command history.", "This is the fiftieth and final guided command.", "__HISTORY__")
];

function m(stage, title, command, description, purpose, task, hint, output, cwdAfter = null) {
  return { stage, title, command, description, purpose, task, hint, output, cwdAfter };
}

function normalizeCommand(command) {
  return command.trim().replace(/\s+/g, " ");
}

function compactPath(path) {
  if (path === "/home/student") return "~";
  if (path.startsWith("/home/student/")) return `~/${path.slice(14)}`;
  return path;
}

function renderMissionList() {
  $("#missionList").innerHTML = missions.map((mission, index) => {
    const done = state.completed.includes(`command-${index + 1}`);
    return `<button class="mission-item ${index === state.missionIndex ? "current" : ""} ${done ? "done" : ""}" data-mission="${index}" type="button"><span>${String(index + 1).padStart(2, "0")}</span><div>${mission.title}<small>Stage ${mission.stage}</small></div><em>${done ? "✓" : "○"}</em></button>`;
  }).join("");
  $$(".mission-item").forEach(button => button.addEventListener("click", () => {
    const requested = Number(button.dataset.mission);
    const firstIncomplete = missions.findIndex((_, index) => !state.completed.includes(`command-${index + 1}`));
    const maxOpen = firstIncomplete === -1 ? missions.length - 1 : firstIncomplete;
    if (requested > maxOpen) {
      toast("Complete the earlier command missions first.");
      return;
    }
    state.missionIndex = requested;
    saveState();
    renderMission();
  }));
}

function renderMission() {
  const index = Math.max(0, Math.min(missions.length - 1, state.missionIndex));
  state.missionIndex = index;
  const mission = missions[index];
  $("#missionStage").textContent = `STAGE ${mission.stage}`;
  $("#missionCounter").textContent = `${index + 1}/50`;
  $("#missionBar").style.width = `${((index + 1) / missions.length) * 100}%`;
  $("#commandNumber").textContent = `COMMAND ${String(index + 1).padStart(2, "0")}`;
  $("#commandStage").textContent = stages[mission.stage].toUpperCase();
  $("#commandTitle").textContent = mission.title;
  $("#commandDescription").textContent = mission.description;
  $("#commandPurpose").textContent = mission.purpose;
  $("#commandTask").textContent = mission.task;
  $("#expectedCommand").textContent = mission.command;
  $("#commandHint").textContent = mission.hint;
  $("#previousMission").disabled = index === 0;
  $("#nextMission").disabled = !state.completed.includes(`command-${index + 1}`) || index === missions.length - 1;
  $("#terminalStatus").className = "terminal-status";
  $("#terminalStatus").textContent = state.completed.includes(`command-${index + 1}`)
    ? "This mission is complete. Review it or select Next mission."
    : "Mission ready. Type the exact command shown in the instruction card.";
  renderMissionList();
  updatePrompt();
}

function addTerminalLine(command, output, type = "normal", promptCwd = state.cwd) {
  const line = document.createElement("div");
  line.className = "command-line";
  line.innerHTML = `<span class="user">student@linux-lab</span>:<span class="path">${escapeHtml(compactPath(promptCwd))}</span>$ ${escapeHtml(command)}`;
  $("#terminalOutput").appendChild(line);
  if (output !== "") {
    const result = document.createElement("div");
    result.className = type === "error" ? "command-error" : type === "success" ? "command-success" : "command-output";
    result.textContent = output;
    $("#terminalOutput").appendChild(result);
  }
  $("#terminalOutput").scrollTop = $("#terminalOutput").scrollHeight;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
}

function historyOutput() {
  return state.commandHistory.map((command, index) => `${String(index + 1).padStart(4, " ")}  ${command}`).join("\n");
}

function missionOutput(mission) {
  return mission.output === "__HISTORY__" ? historyOutput() : mission.output;
}

function updatePrompt() {
  $("#terminalPrompt").innerHTML = `<span>student@linux-lab</span>:<b>${escapeHtml(compactPath(state.cwd))}</b>$`;
}

function applyDirectoryChange(command) {
  const map = {
    "cd Documents": "/home/student/Documents",
    "cd Projects": "/home/student/Documents/Projects",
    "cd ..": state.cwd.split("/").slice(0, -1).join("/") || "/",
    "cd ~": "/home/student",
    "cd linux-practice": "/home/student/linux-practice",
    "cd ~/logs": "/home/student/logs",
    "cd ~/Documents": "/home/student/Documents",
    "cd ~/challenge": "/home/student/challenge"
  };
  if (map[command]) state.cwd = map[command];
}

function genericOutput(command) {
  const outputs = {
    "whoami": "student",
    "hostname": "linux-lab",
    "date": "Fri Nov 21 10:30:00 IST 2026",
    "uname -a": "Linux linux-lab 6.8.0-training #1 SMP x86_64 GNU/Linux",
    "echo \"Hello Linux\"": "Hello Linux",
    "id": "uid=1000(student) gid=1000(student) groups=1000(student),27(sudo)",
    "which bash": "/usr/bin/bash",
    "df -h": "Filesystem      Size  Used Avail Use% Mounted on\n/dev/vda1        40G   12G   26G  32% /",
    "free -h": "               total        used        free      available\nMem:           3.8Gi       1.1Gi       1.7Gi       2.4Gi",
    "ps": "    PID TTY          TIME CMD\n   1201 pts/0    00:00:00 bash\n   1842 pts/0    00:00:00 ps",
    "cat .flag-part1": "LINUX{",
    "grep \"FLAG_PART\" logs/system.log": "FLAG_PART=BASICS_",
    "find . -name \"part3.txt\"": "./archive/part3.txt",
    "cat archive/part3.txt": "COMPLETE}",
    "cat README.txt": "FLAG RECOVERY PLAN\n1. Read the hidden file .flag-part1\n2. Filter logs/system.log for FLAG_PART\n3. Find part3.txt below this directory\n4. Join the three values with no spaces"
  };
  if (command === "pwd") return state.cwd;
  if (command === "history") return historyOutput();
  if (command === "ls -la" && state.cwd === "/home/student/challenge") return "drwxr-xr-x 4 student student 4096 Nov 21 11:00 .\ndrwxr-xr-x 8 student student 4096 Nov 21 09:00 ..\n-rw-r--r-- 1 student student    6 Nov 21 11:00 .flag-part1\n-rw-r--r-- 1 student student  198 Nov 21 11:00 README.txt\ndrwxr-xr-x 2 student student 4096 Nov 21 11:00 archive\ndrwxr-xr-x 2 student student 4096 Nov 21 11:00 logs";
  if (command in outputs) return outputs[command];
  if (command.startsWith("cd ")) return "";
  return null;
}

function runCommand(rawCommand) {
  const command = normalizeCommand(rawCommand);
  if (!command) return;
  const mission = missions[state.missionIndex];
  const promptCwd = state.cwd;
  state.commandHistory.push(command);
  if (state.commandHistory.length > 120) state.commandHistory.shift();

  if (command === "clear") {
    $("#terminalOutput").innerHTML = "";
  }

  const isExpected = command === normalizeCommand(mission.command);
  if (isExpected) {
    applyDirectoryChange(command);
    if (mission.cwdAfter) state.cwd = mission.cwdAfter;
    if (command !== "clear") addTerminalLine(command, missionOutput(mission), "success", promptCwd);
    complete(`command-${state.missionIndex + 1}`);
    $("#terminalStatus").className = "terminal-status good";
    $("#terminalStatus").textContent = `Correct. ${mission.title} complete. Read the output, then select Next mission.`;
    $("#nextMission").disabled = state.missionIndex === missions.length - 1;
    saveState();
    renderMissionList();
    if (state.missionIndex === missions.length - 1) {
      $("#terminalStatus").textContent = "All 50 command missions are complete. Open Final Knowledge Check from the dock.";
      updateUnlocks();
      toast("All 50 command missions complete.");
    }
  } else {
    applyDirectoryChange(command);
    const output = genericOutput(command);
    if (output === null) {
      addTerminalLine(command, `bash: ${command.split(" ")[0]}: command not found in this training simulator`, "error", promptCwd);
    } else if (command !== "clear") {
      addTerminalLine(command, output, "normal", promptCwd);
    }
    $("#terminalStatus").className = "terminal-status bad";
    $("#terminalStatus").textContent = `That was not the current mission command. Type exactly: ${mission.command}`;
    saveState();
  }
  updatePrompt();
}

$("#terminalForm").addEventListener("submit", event => {
  event.preventDefault();
  const input = $("#terminalInput");
  runCommand(input.value);
  input.value = "";
  input.focus();
});

$("#copyCommand").addEventListener("click", async () => {
  const command = missions[state.missionIndex].command;
  try {
    await navigator.clipboard.writeText(command);
    toast("Command copied. Paste it into the terminal.");
  } catch {
    $("#terminalInput").value = command;
    $("#terminalInput").focus();
    toast("Command placed in the terminal input.");
  }
});

$("#previousMission").addEventListener("click", () => {
  if (state.missionIndex > 0) {
    state.missionIndex--;
    saveState();
    renderMission();
  }
});

$("#nextMission").addEventListener("click", () => {
  if (!state.completed.includes(`command-${state.missionIndex + 1}`)) {
    toast("Run the current command first.");
    return;
  }
  if (state.missionIndex < missions.length - 1) {
    state.missionIndex++;
    saveState();
    renderMission();
    $("#terminalInput").focus();
  }
});

$("#clearTerminal").addEventListener("click", () => {
  $("#terminalOutput").innerHTML = '<div class="boot-line">Display cleared. Your files and progress were not changed.</div>';
  $("#terminalInput").focus();
});

const finalQuestions = [
  { q: "Which command prints the current username?", options: ["pwd", "whoami", "ls"], a: 1 },
  { q: "Which command prints the current directory path?", options: ["pwd", "date", "ps"], a: 0 },
  { q: "What does cd .. do?", options: ["Deletes a directory", "Moves to the parent directory", "Lists hidden files"], a: 1 },
  { q: "Which command creates an empty file named notes.txt?", options: ["touch notes.txt", "rm notes.txt", "pwd notes.txt"], a: 0 },
  { q: "Which command reads a text file?", options: ["mkdir file.txt", "cat file.txt", "cd file.txt"], a: 1 },
  { q: "Which command shows lines containing ERROR?", options: ["grep \"ERROR\" events.log", "rm events.log", "hostname ERROR"], a: 0 },
  { q: "Why should rm be used carefully?", options: ["It changes the clock", "It removes files without a normal recycle-bin step", "It only prints text"], a: 1 },
  { q: "What does Linux case-sensitive mean?", options: ["Names such as Documents and documents can be different", "All commands must be uppercase", "Spaces never matter"], a: 0 }
];

function renderFinalQuiz() {
  $("#finalQuiz").innerHTML = finalQuestions.map((question, index) => `<div class="quiz-row"><label>${index + 1}. ${question.q}<select data-final="${index}"><option value="">Choose an answer</option>${question.options.map((option, optionIndex) => `<option value="${optionIndex}">${option}</option>`).join("")}</select></label></div>`).join("");
}

renderFinalQuiz();

$("#checkFinalQuiz").addEventListener("click", () => {
  const selects = $$('[data-final]');
  if (selects.some(select => select.value === "")) {
    setFeedback("#finalQuizFeedback", "Answer all eight questions.", false);
    return;
  }
  const correctCount = finalQuestions.filter((question, index) => Number(selects[index].value) === question.a).length;
  if (correctCount !== finalQuestions.length) {
    setFeedback("#finalQuizFeedback", `${correctCount}/8 correct. Review the command reference and try again.`, false);
    return;
  }
  setFeedback("#finalQuizFeedback", "8/8 correct. The practical flag hunt is now unlocked.", true);
  complete("final-quiz");
  updateUnlocks();
});

$("#submitFlag").addEventListener("click", () => {
  const supplied = $("#flagInput").value.trim();
  if (supplied !== "LINUX{BASICS_COMPLETE}") {
    setFeedback("#flagFeedback", "Flag not accepted. Recover all three fragments and join them with no spaces.", false);
    return;
  }
  setFeedback("#flagFeedback", "Correct flag. Linux Basics Lab complete.", true);
  complete("flag");
  updateUnlocks();
  toast("Flag accepted. Certificate unlocked.");
});

function setFeedback(selector, message, good) {
  const element = $(selector);
  element.textContent = message;
  element.className = `feedback ${good ? "good" : "bad"}`;
}

function commandsComplete() {
  return missions.every((_, index) => state.completed.includes(`command-${index + 1}`));
}

function updateUnlocks() {
  const quizReady = commandsComplete() && state.completed.includes("orientation");
  $("#quizContent").classList.toggle("locked-content", !quizReady);
  $("#quizUnlock").style.display = quizReady ? "none" : "block";
  const flagReady = state.completed.includes("final-quiz");
  $("#flagContent").classList.toggle("locked-content", !flagReady);
  $("#flagUnlock").style.display = flagReady ? "none" : "block";
  const certificateReady = state.completed.includes("flag") && state.completed.length >= TOTAL_ACTIVITIES;
  $("#certificateContent").classList.toggle("locked-content", !certificateReady);
  $("#certificateUnlock").style.display = certificateReady ? "none" : "block";
}

function showVmPage(name) {
  $$(".vm-page").forEach(page => page.classList.toggle("active", page.id === `vm-${name}`));
  $("#applicationsMenu").classList.remove("show");
  if (name === "quiz" && !commandsComplete()) toast("Complete all 50 command missions first.");
  if (name === "flag" && !state.completed.includes("final-quiz")) toast("Pass the final knowledge check first.");
  if (name === "certificate" && !state.completed.includes("flag")) toast("Recover and submit the flag first.");
}

$$('[data-open]').forEach(button => button.addEventListener("click", () => showVmPage(button.dataset.open)));
$("#applicationsButton").addEventListener("click", () => $("#applicationsMenu").classList.toggle("show"));

function updateProgress() {
  const count = Math.min(TOTAL_ACTIVITIES, state.completed.length);
  $("#progressText").textContent = `${count}/${TOTAL_ACTIVITIES} activities`;
  $("#progressBar").style.width = `${(count / TOTAL_ACTIVITIES) * 100}%`;
  updateUnlocks();
}

$("#resumeLab").addEventListener("click", () => {
  if (!state.completed.includes("orientation")) {
    $("#orientation").scrollIntoView({ behavior: "smooth" });
  } else {
    $("#commandLab").scrollIntoView({ behavior: "smooth" });
    if (state.completed.includes("flag")) showVmPage("certificate");
    else if (state.completed.includes("final-quiz")) showVmPage("flag");
    else if (commandsComplete()) showVmPage("quiz");
    else showVmPage("commands");
  }
});

$("#resetLab").addEventListener("click", () => {
  if (!confirm("Reset all Linux Launchpad progress? This cannot be undone.")) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
});

function drawCertificate(name) {
  const canvas = $("#certificateCanvas");
  const context = canvas.getContext("2d");
  const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  background.addColorStop(0, "#eef6ff");
  background.addColorStop(1, "#e7faf4");
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#14365d";
  context.lineWidth = 20;
  context.strokeRect(35, 35, 1330, 920);
  context.strokeStyle = "#1aa7c0";
  context.lineWidth = 4;
  context.strokeRect(60, 60, 1280, 870);
  context.textAlign = "center";
  context.fillStyle = "#1f69d5";
  context.font = "bold 34px Segoe UI, Arial";
  context.fillText("LINUX LAUNCHPAD", 700, 150);
  context.fillStyle = "#1d2a3a";
  context.font = "bold 72px Georgia, serif";
  context.fillText("Certificate of Completion", 700, 285);
  context.fillStyle = "#617184";
  context.font = "30px Segoe UI, Arial";
  context.fillText("This certifies that", 700, 375);
  context.fillStyle = "#1d2a3a";
  context.font = "bold 62px Georgia, serif";
  context.fillText(name, 700, 475);
  context.strokeStyle = "#8198ac";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(280, 510);
  context.lineTo(1120, 510);
  context.stroke();
  context.fillStyle = "#3f566d";
  context.font = "28px Segoe UI, Arial";
  context.fillText("completed the Beginner Linux Command Lab", 700, 590);
  context.fillText("50 commands · final knowledge check · practical flag hunt", 700, 642);
  context.fillStyle = "#27a774";
  context.beginPath();
  context.arc(700, 760, 66, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#fff";
  context.font = "bold 26px Consolas, monospace";
  context.fillText("$ _", 700, 770);
  context.fillStyle = "#617184";
  context.font = "22px Segoe UI, Arial";
  context.fillText(`Completed ${new Date().toLocaleDateString()}`, 700, 890);
  return canvas;
}

$("#studentName").value = state.studentName || "";
$("#studentName").addEventListener("input", event => {
  state.studentName = event.target.value;
  saveState();
});

$("#downloadCertificate").addEventListener("click", () => {
  if (!state.completed.includes("flag")) {
    toast("Submit the correct flag first.");
    return;
  }
  const name = $("#studentName").value.trim();
  if (name.length < 2) {
    toast("Enter your full name first.");
    $("#studentName").focus();
    return;
  }
  const link = document.createElement("a");
  link.download = `Linux-Basics-Certificate-${name.replace(/[^a-z0-9]+/gi, "-")}.png`;
  link.href = drawCertificate(name).toDataURL("image/png");
  link.click();
});

function updateClock() {
  $("#vmClock").textContent = new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

setInterval(updateClock, 30000);
updateClock();
renderMission();
updateProgress();
updatePrompt();
