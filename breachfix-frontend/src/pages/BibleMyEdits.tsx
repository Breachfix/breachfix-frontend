import React, { useState } from 'react';
import { useAllBibleEditsApi } from '../hooks/useApi';
import { useAuthStore } from '../context/AuthContext';
import { motion } from 'framer-motion';

// Interfaces for the AllBibles edit API
interface AllBibleEdit {
  id: string;
  languageCode: string;
  sourceCode: string;
  bookNumber: number;
  bookName: string;
  chapter: number;
  verse: number;
  originalText: string;
  suggestedText: string;
  reason?: string;
  editType: 'text_correction' | 'translation_improvement' | 'grammar_fix' | 'typo_correction' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  state: 'draft' | 'submitted' | 'review1' | 'review2' | 'approved' | 'rejected';
  reviewerName?: string;
  reviewNote?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const BibleMyEdits: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [filterState, setFilterState] = useState<'all' | 'draft' | 'submitted' | 'review1' | 'review2' | 'approved' | 'rejected'>('all');
  const [selectedEdit, setSelectedEdit] = useState<AllBibleEdit | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Fetch user's edits using the new AllBibles API
  const { data: myEditsResponse, isLoading: myEditsLoading, refetch: refetchMyEdits } = useAllBibleEditsApi.useGetMine({
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2
  });

  const myEdits = myEditsResponse?.edits || [];

  // Filter edits based on selected state
  const filteredEdits = filterState === 'all' 
    ? myEdits 
    : myEdits.filter((edit: AllBibleEdit) => edit.state === filterState);

  // Withdraw edit mutation
  const withdrawEdit = useAllBibleEditsApi.useWithdraw();

  const handleWithdrawEdit = async (editId: string) => {
    if (!confirm('Are you sure you want to withdraw this edit?')) return;

    setIsWithdrawing(true);
    try {
      await withdrawEdit.mutateAsync(editId);
      refetchMyEdits();
      alert('Edit withdrawn successfully!');
    } catch (error) {
      alert('Failed to withdraw edit. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleViewDetail = (edit: AllBibleEdit) => {
    setSelectedEdit(edit);
    setShowDetailModal(true);
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'approved':
        return 'bg-green-600 text-white';
      case 'rejected':
        return 'bg-red-600 text-white';
      case 'submitted':
      case 'review1':
      case 'review2':
        return 'bg-yellow-600 text-white';
      case 'draft':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStateLabel = (state: string) => {
    switch (state) {
      case 'draft':
        return 'Draft';
      case 'submitted':
        return 'Submitted';
      case 'review1':
        return 'Review 1';
      case 'review2':
        return 'Review 2';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return state;
    }
  };

  const getEditTypeLabel = (editType: string) => {
    switch (editType) {
      case 'text_correction':
        return 'Text Correction';
      case 'translation_improvement':
        return 'Translation Improvement';
      case 'grammar_fix':
        return 'Grammar Fix';
      case 'typo_correction':
        return 'Typo Correction';
      case 'other':
        return 'Other';
      default:
        return editType;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-600 text-white';
      case 'medium':
        return 'bg-yellow-600 text-white';
      case 'low':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-netflix-white mb-4">Authentication Required</h1>
          <p className="text-gray-400 text-lg mb-6">
            You need to be logged in to view your Bible edits.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-netflix-red hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-netflix-white">My Bible Edits</h1>
            <div className="flex items-center gap-4">
              {/* State Filter */}
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value as any)}
                className="bg-netflix-gray text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red"
              >
                <option value="all">All States</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="review1">Review 1</option>
                <option value="review2">Review 2</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        {myEdits.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-netflix-dark-gray rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-netflix-white">{myEdits.length}</div>
              <div className="text-gray-400 text-sm">Total Edits</div>
            </div>
            <div className="bg-netflix-dark-gray rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {myEdits.filter((edit: AllBibleEdit) => ['submitted', 'review1', 'review2'].includes(edit.state)).length}
              </div>
              <div className="text-gray-400 text-sm">Pending</div>
            </div>
            <div className="bg-netflix-dark-gray rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {myEdits.filter((edit: AllBibleEdit) => edit.state === 'approved').length}
              </div>
              <div className="text-gray-400 text-sm">Approved</div>
            </div>
            <div className="bg-netflix-dark-gray rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-400">
                {myEdits.filter((edit: AllBibleEdit) => edit.state === 'rejected').length}
              </div>
              <div className="text-gray-400 text-sm">Rejected</div>
            </div>
          </div>
        )}

        {/* Edits List */}
        {myEditsLoading ? (
          <div className="flex justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full"
            />
          </div>
        ) : filteredEdits.length > 0 ? (
          <div className="space-y-4">
            {filteredEdits.map((edit: AllBibleEdit, index: number) => (
              <motion.div
                key={edit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-netflix-dark-gray rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-netflix-white">
                        {edit.bookName} {edit.chapter}:{edit.verse}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStateColor(edit.state)}`}>
                        {getStateLabel(edit.state)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(edit.priority)}`}>
                        {edit.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      {edit.languageCode.toUpperCase()} - {edit.sourceCode.toUpperCase()} • {getEditTypeLabel(edit.editType)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Submitted: {new Date(edit.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetail(edit)}
                      className="text-netflix-red hover:text-red-400 text-sm bg-netflix-gray hover:bg-gray-600 px-3 py-1 rounded transition-colors duration-200"
                    >
                      View Details
                    </button>
                    {edit.state === 'draft' && (
                      <button
                        onClick={() => handleWithdrawEdit(edit.id)}
                        disabled={isWithdrawing}
                        className="text-red-400 hover:text-red-300 text-sm bg-red-900 hover:bg-red-800 px-3 py-1 rounded transition-colors duration-200 disabled:opacity-50"
                      >
                        {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-300 mb-1">Original Text:</div>
                    <div className="text-gray-400 text-sm bg-netflix-gray p-2 rounded">
                      {edit.originalText}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-300 mb-1">Suggested Text:</div>
                    <div className="text-gray-400 text-sm bg-netflix-gray p-2 rounded">
                      {edit.suggestedText}
                    </div>
                  </div>
                </div>

                {edit.reason && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-300 mb-1">Reason:</div>
                    <div className="text-gray-400 text-sm bg-netflix-gray p-2 rounded">
                      {edit.reason}
                    </div>
                  </div>
                )}

                {edit.reviewNote && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-300 mb-1">Review Note:</div>
                    <div className="text-gray-400 text-sm bg-netflix-gray p-2 rounded">
                      {edit.reviewNote}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-4">No edits found</div>
            <p className="text-gray-500">
              {filterState === 'all' 
                ? "You haven't submitted any Bible edits yet."
                : `No edits found with state: ${getStateLabel(filterState)}`
              }
            </p>
            <button
              onClick={() => window.location.href = '/bible/edit'}
              className="mt-4 bg-netflix-red hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Submit Your First Edit
            </button>
          </div>
        )}

        {/* Edit Detail Modal */}
        {showDetailModal && selectedEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-netflix-dark-gray rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-netflix-white">
                  Edit Details - {selectedEdit.bookName} {selectedEdit.chapter}:{selectedEdit.verse}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-300 mb-4">Edit Information</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-400">Language & Source</div>
                      <div className="text-white">{selectedEdit.languageCode.toUpperCase()} - {selectedEdit.sourceCode.toUpperCase()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-400">Edit Type</div>
                      <div className="text-white">{getEditTypeLabel(selectedEdit.editType)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-400">Priority</div>
                      <div className="text-white">{selectedEdit.priority.toUpperCase()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-400">State</div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStateColor(selectedEdit.state)}`}>
                        {getStateLabel(selectedEdit.state)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-400">Submitted</div>
                      <div className="text-white">{new Date(selectedEdit.createdAt).toLocaleString()}</div>
                    </div>
                    {selectedEdit.reviewedAt && (
                      <div>
                        <div className="text-sm font-medium text-gray-400">Reviewed</div>
                        <div className="text-white">{new Date(selectedEdit.reviewedAt).toLocaleString()}</div>
                      </div>
                    )}
                    {selectedEdit.reviewerName && (
                      <div>
                        <div className="text-sm font-medium text-gray-400">Reviewer</div>
                        <div className="text-white">{selectedEdit.reviewerName}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-300 mb-4">Text Comparison</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-400 mb-2">Original Text</div>
                      <div className="bg-netflix-gray p-3 rounded text-white">
                        {selectedEdit.originalText}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-400 mb-2">Suggested Text</div>
                      <div className="bg-netflix-gray p-3 rounded text-white">
                        {selectedEdit.suggestedText}
                      </div>
                    </div>
                    {selectedEdit.reason && (
                      <div>
                        <div className="text-sm font-medium text-gray-400 mb-2">Reason</div>
                        <div className="bg-netflix-gray p-3 rounded text-white">
                          {selectedEdit.reason}
                        </div>
                      </div>
                    )}
                    {selectedEdit.reviewNote && (
                      <div>
                        <div className="text-sm font-medium text-gray-400 mb-2">Review Note</div>
                        <div className="bg-netflix-gray p-3 rounded text-white">
                          {selectedEdit.reviewNote}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Close
                </button>
                {selectedEdit.state === 'draft' && (
                  <button
                    onClick={() => handleWithdrawEdit(selectedEdit.id)}
                    disabled={isWithdrawing}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded transition-colors duration-200"
                  >
                    {isWithdrawing ? 'Withdrawing...' : 'Withdraw Edit'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BibleMyEdits;