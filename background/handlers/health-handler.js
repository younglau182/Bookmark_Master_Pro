import { TASK_TYPES } from '../../lib/constants.js';
import { taskManager } from '../task-manager.js';

export async function handleTaskMessage(message) {
  if (message?.type === 'tasks.list') return taskManager.listTasks();
  if (message?.type === 'tasks.get') return taskManager.getTask(message.payload?.taskId);
  if (message?.type === 'tasks.createHealthCheck') return taskManager.createTask(TASK_TYPES.HEALTH_CHECK, message.payload || {});
  if (message?.type === 'tasks.start') return taskManager.startTask(message.payload?.taskId);
  if (message?.type === 'tasks.pause') return taskManager.pauseTask(message.payload?.taskId);
  if (message?.type === 'tasks.resume') return taskManager.resumeTask(message.payload?.taskId);
  if (message?.type === 'tasks.stop') return taskManager.stopTask(message.payload?.taskId);
}
