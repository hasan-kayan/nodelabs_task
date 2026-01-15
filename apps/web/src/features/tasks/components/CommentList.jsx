import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsAPI } from '../../../api/comments.api.js';
import { Button } from '../../../components/ui/button.jsx';
import { Input } from '../../../components/ui/input.jsx';

export default function CommentList({ taskId }) {
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();

  const { data: comments, error: commentsError } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => commentsAPI.getByTask(taskId).then((res) => res.data || []),
  });

  const addCommentMutation = useMutation({
    mutationFn: (content) => commentsAPI.create({ taskId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', taskId]);
      setNewComment('');
    },
    onError: (error) => {
      // Don't show error for 401 - interceptor will handle redirect
      if (error?.response?.status !== 401) {
        console.error('Failed to add comment:', error);
      }
    },
  });

  // Handle 401 errors silently - interceptor will redirect
  if (commentsError?.response?.status === 401) {
    return null; // Don't render anything, redirect will happen
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <Button type="submit">Add</Button>
      </form>

      <div className="space-y-2">
        {comments?.data?.map((comment) => (
          <div key={comment._id} className="border rounded p-3">
            <p className="text-sm">{comment.content}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {comment.userId?.name} • {new Date(comment.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
