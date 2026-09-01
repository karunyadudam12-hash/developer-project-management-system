import { db } from '../prisma/db';

export async function getComments() {
  const comments =
    await db.orm.public.Comment.all();

  return comments.sort(
    (a, b) =>
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime()
  );
}

export async function getCommentsByTaskId(
  taskId: number
) {
  const comments =
    await db.orm.public.Comment.all();

  return comments
    .filter(
      (comment) =>
        comment.taskId === taskId
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );
}

export async function getCommentById(
  commentId: number
) {
  const comments =
    await db.orm.public.Comment.all();

  return (
    comments.find(
      (comment) =>
        comment.id === commentId
    ) ?? null
  );
}

export async function createComment(data: {
  content: string;
  taskId: number;
  authorId: number;
}) {
  return db.orm.public.Comment.create({
    content: data.content,
    taskId: data.taskId,
    authorId: data.authorId,
  });
}

export async function updateComment(
  commentId: number,
  data: {
    content: string;
  }
) {
  const comment =
    await getCommentById(commentId);

  if (!comment) {
    return null;
  }

  return db.orm.public.Comment
    .where({ id: commentId })
    .update({
      content: data.content,
    });
}

export async function deleteComment(
  commentId: number
) {
  const comment =
    await getCommentById(commentId);

  if (!comment) {
    return null;
  }

  return db.orm.public.Comment
    .where({ id: commentId })
    .delete();
}