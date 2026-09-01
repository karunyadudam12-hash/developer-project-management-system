'use client';

import { useEffect, useState } from 'react';

type Comment = {
  id: number;
  content: string;
  taskId: number;
  authorId: number;
  createdAt: string;
  updatedAt: string;
};

type Mention = {
  id: number;
  commentId: number;
  userId: number;
  createdAt: string;
};

type TaskCommentsProps = {
  taskId: number;
};

export default function TaskComments({
  taskId,
}: TaskCommentsProps) {
  const [comments, setComments] =
    useState<Comment[]>([]);

  const [mentions, setMentions] =
    useState<Record<number, Mention[]>>(
      {}
    );

  const [loading, setLoading] =
    useState(true);

  const [content, setContent] =
    useState('');

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [editingContent, setEditingContent] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [mentionUserIds, setMentionUserIds] =
    useState<Record<number, string>>({});

  const [mentioningId, setMentioningId] =
    useState<number | null>(null);

  const [error, setError] =
    useState('');

  const [message, setMessage] =
    useState('');

  async function loadComments() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `/api/tasks/${taskId}/comments`
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to load comments'
        );
      }

      setComments(
        result.data || []
      );

      const commentList =
        result.data || [];

      const mentionEntries =
        await Promise.all(
          commentList.map(
            async (comment: Comment) => {
              try {
                const mentionResponse =
                  await fetch(
                    `/api/comments/${comment.id}/mentions`
                  );

                const mentionResult =
                  await mentionResponse.json();

                if (
                  !mentionResponse.ok
                ) {
                  return [
                    comment.id,
                    [],
                  ] as const;
                }

                return [
                  comment.id,
                  mentionResult.data || [],
                ] as const;
              } catch {
                return [
                  comment.id,
                  [],
                ] as const;
              }
            }
          )
        );

      setMentions(
        Object.fromEntries(
          mentionEntries
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load comments'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `/api/tasks/${taskId}/comments`
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              'Failed to load comments'
          );
        }

        const commentList =
          result.data || [];

        const mentionEntries =
          await Promise.all(
            commentList.map(
              async (comment: Comment) => {
                try {
                  const mentionResponse =
                    await fetch(
                      `/api/comments/${comment.id}/mentions`
                    );

                  const mentionResult =
                    await mentionResponse.json();

                  if (
                    !mentionResponse.ok
                  ) {
                    return [
                      comment.id,
                      [],
                    ] as const;
                  }

                  return [
                    comment.id,
                    mentionResult.data || [],
                  ] as const;
                } catch {
                  return [
                    comment.id,
                    [],
                  ] as const;
                }
              }
            )
          );

        if (!cancelled) {
          setComments(commentList);

          setMentions(
            Object.fromEntries(
              mentionEntries
            )
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load comments'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  async function addComment() {
    const trimmed =
      content.trim();

    if (!trimmed) {
      setError(
        'Comment cannot be empty'
      );
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/tasks/${taskId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            content: trimmed,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to add comment'
        );
      }

      setComments((current) => [
        ...current,
        result.data,
      ]);

      setMentions((current) => ({
        ...current,
        [result.data.id]: [],
      }));

      setContent('');

      setMessage(
        'Comment added successfully'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to add comment'
      );
    } finally {
      setSaving(false);
    }
  }

  function startEditing(
    comment: Comment
  ) {
    setEditingId(comment.id);
    setEditingContent(
      comment.content
    );
    setError('');
    setMessage('');
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingContent('');
  }

  async function saveEdit(
    commentId: number
  ) {
    const trimmed =
      editingContent.trim();

    if (!trimmed) {
      setError(
        'Comment cannot be empty'
      );
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/comments/${commentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            content: trimmed,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to update comment'
        );
      }

      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId
            ? result.data
            : comment
        )
      );

      cancelEditing();

      setMessage(
        'Comment updated successfully'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update comment'
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteComment(
    commentId: number
  ) {
    const confirmed =
      window.confirm(
        'Delete this comment?'
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(commentId);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/comments/${commentId}`,
        {
          method: 'DELETE',
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to delete comment'
        );
      }

      setComments((current) =>
        current.filter(
          (comment) =>
            comment.id !== commentId
        )
      );

      setMentions((current) => {
        const next = {
          ...current,
        };

        delete next[commentId];

        return next;
      });

      setMessage(
        'Comment deleted successfully'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete comment'
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function addMention(
    comment: Comment
  ) {
    const rawUserId =
      mentionUserIds[comment.id] || '';

    const userId =
      Number(rawUserId);

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      setError(
        'Enter a valid user ID'
      );
      return;
    }

    setMentioningId(comment.id);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/comments/${comment.id}/mentions`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            userId,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to add mention'
        );
      }

      setMentions((current) => ({
        ...current,
        [comment.id]: [
          ...(current[comment.id] || []),
          result.data,
        ],
      }));

      setMentionUserIds((current) => ({
        ...current,
        [comment.id]: '',
      }));

      setMessage(
        `User ${userId} mentioned successfully`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to add mention'
      );
    } finally {
      setMentioningId(null);
    }
  }

  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">
          Comments
        </h3>

        <button
          onClick={() => {
            void loadComments();
          }}
          disabled={loading}
          className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p className="mb-4 rounded-md bg-green-100 p-3 text-sm text-green-700">
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">
          Loading comments...
        </p>
      ) : comments.length === 0 ? (
        <p className="rounded-md border p-4 text-sm text-gray-500">
          No comments yet.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isEditing =
              editingId === comment.id;

            const commentMentions =
              mentions[comment.id] || [];

            return (
              <div
                key={comment.id}
                className="rounded-lg border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      User {comment.authorId}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {comment.createdAt}
                    </p>
                  </div>

                  {!isEditing && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          startEditing(
                            comment
                          )
                        }
                        className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteComment(
                            comment.id
                          )
                        }
                        disabled={
                          deletingId ===
                          comment.id
                        }
                        className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId ===
                        comment.id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-3">
                    <textarea
                      value={
                        editingContent
                      }
                      onChange={(event) =>
                        setEditingContent(
                          event.target.value
                        )
                      }
                      rows={4}
                      className="w-full rounded-md border p-3 text-gray-900"
                    />

                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() =>
                          saveEdit(
                            comment.id
                          )
                        }
                        disabled={saving}
                        className="rounded-md bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
                      >
                        {saving
                          ? 'Saving...'
                          : 'Save'}
                      </button>

                      <button
                        onClick={
                          cancelEditing
                        }
                        disabled={saving}
                        className="rounded-md border px-3 py-2 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 whitespace-pre-wrap text-gray-900">
                    {comment.content}
                  </p>
                )}

                {!isEditing && (
                  <div className="mt-4 border-t pt-3">
                    <p className="text-sm font-medium text-gray-700">
                      Mentions
                    </p>

                    {commentMentions.length >
                    0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {commentMentions.map(
                          (mention) => (
                            <span
                              key={mention.id}
                              className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                            >
                              User{' '}
                              {mention.userId}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">
                        No mentions.
                      </p>
                    )}

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        type="number"
                        min="1"
                        value={
                          mentionUserIds[
                            comment.id
                          ] || ''
                        }
                        onChange={(event) =>
                          setMentionUserIds(
                            (current) => ({
                              ...current,
                              [comment.id]:
                                event.target
                                  .value,
                            })
                          )
                        }
                        placeholder="User ID"
                        className="w-full rounded-md border p-2 text-gray-900 sm:w-32"
                      />

                      <button
                        onClick={() =>
                          addMention(
                            comment
                          )
                        }
                        disabled={
                          mentioningId ===
                          comment.id
                        }
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                      >
                        {mentioningId ===
                        comment.id
                          ? 'Mentioning...'
                          : 'Mention User'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5">
        <textarea
          value={content}
          onChange={(event) =>
            setContent(
              event.target.value
            )
          }
          rows={4}
          placeholder="Write a comment..."
          className="w-full rounded-md border p-3 text-gray-900"
        />

        <button
          onClick={addComment}
          disabled={saving}
          className="mt-3 rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {saving
            ? 'Adding...'
            : 'Add Comment'}
        </button>
      </div>
    </section>
  );
}