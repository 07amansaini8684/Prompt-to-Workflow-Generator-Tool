import axiosInstance from '../axios';
import { ActivepiecesWorkflow, WorkflowTemplate } from '../types/workflow';

export async function generateWorkflow(prompt: string, userId?: string): Promise<ActivepiecesWorkflow> {
  try {
    const response = await axiosInstance.post(`/generate-workflow`, {
      prompt,
      userId
    });
    return response.data.workflow;
  } catch (error) {
    console.error('Error generating workflow:', error);
    throw new Error('Failed to generate workflow');
  }
}

export async function saveWorkflow(template: Omit<WorkflowTemplate, 'id' | 'createdAt'> & { userId: string }): Promise<WorkflowTemplate> {
  try {
    const response = await axiosInstance.post(`/workflows`, template);
    return response.data;
  } catch (error) {
    console.error('Error saving workflow:', error);
    throw new Error('Failed to save workflow');
  }
}

export async function getWorkflows(userId?: string): Promise<WorkflowTemplate[]> {
  try {
    const response = await axiosInstance.get(`/workflows`, { params: userId ? { userId } : undefined });
    return response.data;
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return [];
  }
}

export async function deleteWorkflow(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`/workflows/${id}`);
  } catch (error) {
    console.error('Error deleting workflow:', error);
    throw new Error('Failed to delete workflow');
  }
}

export function exportWorkflow(workflow: ActivepiecesWorkflow): string {
  return JSON.stringify(workflow, null, 2);
}

export function downloadWorkflow(workflow: ActivepiecesWorkflow, filename: string): void {
  const jsonString = exportWorkflow(workflow);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}