if ('Notification' in window) {
  Notification.requestPermission();
}

function scheduleAllNotifications() {
  tasks.forEach(task => {
    if (task.dueDate && !task.completed) {
      const time = new Date(task.dueDate).getTime();
      const now = Date.now();
      const delay = time - now - 5 * 60 * 1000; // 5 mins before

      if (delay > 0) {
        setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification('⏰ Reminder', { body: task.text });
          }
        }, delay);
      }
    }
  });
}

// Run on load
document.addEventListener('DOMContentLoaded', scheduleAllNotifications);