import React, { useState } from 'react';
import { ListChecks, Plus, Trash2, CheckCircle, Clock, AlertTriangle, Calendar, User } from 'lucide-react';
import { ActionItem } from '../types';

interface ActionItemsTableProps {
  actionItems: ActionItem[];
  onUpdateActionItems: (items: ActionItem[]) => void;
}

export const ActionItemsTable: React.FC<ActionItemsTableProps> = ({
  actionItems,
  onUpdateActionItems
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  const toggleStatus = (id: string) => {
    const updated = actionItems.map(item => {
      if (item.id === id) {
        const nextStatus: Record<string, ActionItem['status']> = {
          'Pending': 'In Progress',
          'In Progress': 'Completed',
          'Completed': 'Pending'
        };
        return { ...item, status: nextStatus[item.status] || 'Pending' };
      }
      return item;
    });
    onUpdateActionItems(updated);
  };

  const deleteItem = (id: string) => {
    onUpdateActionItems(actionItems.filter(item => item.id !== id));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const newItem: ActionItem = {
      id: `task-${Date.now()}`,
      task: newTask.trim(),
      owner: newOwner.trim() || 'Unassigned',
      dueDate: newDueDate.trim() || 'TBD',
      priority: newPriority,
      status: 'Pending'
    };

    onUpdateActionItems([...actionItems, newItem]);
    setNewTask('');
    setNewOwner('');
    setNewDueDate('');
    setShowAddModal(false);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">High</span>;
      case 'Medium':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Medium</span>;
      case 'Low':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Low</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">Normal</span>;
    }
  };

  const getStatusBadge = (status: ActionItem['status']) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3 h-3 text-indigo-600" /> In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <AlertTriangle className="w-3 h-3 text-slate-500" /> Pending
          </span>
        );
    }
  };

  const completedCount = actionItems.filter(i => i.status === 'Completed').length;
  const progressPercent = actionItems.length > 0 ? Math.round((completedCount / actionItems.length) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4" id="action-items-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-indigo-600" />
            Action Items & Deliverables ({actionItems.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click status to toggle: Pending → In Progress → Completed
          </p>
        </div>

        <div className="flex items-center gap-3">
          {actionItems.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span>{completedCount}/{actionItems.length} Done</span>
              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            id="btn-add-action-item"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {actionItems.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <ListChecks className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm">No action items extracted yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="action-items-table">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Task Description</th>
                <th className="py-3 px-3">Owner</th>
                <th className="py-3 px-3">Timeline</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {actionItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="py-3 px-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => toggleStatus(item.id)}
                      className="cursor-pointer"
                      title="Click to cycle status"
                    >
                      {getStatusBadge(item.status)}
                    </button>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`font-medium ${item.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {item.task}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-600 text-xs flex items-center gap-1.5 pt-4">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.owner}</span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-600 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.dueDate}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getPriorityBadge(item.priority)}
                  </td>
                  <td className="py-3 px-2 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete action item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h4 className="text-base font-bold text-slate-900 mb-3">Add New Action Item</h4>
            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule staging test deployment"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Owner</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Next Friday"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
