import { db } from '../prisma/db';

export async function getMentionsByCommentId(
  commentId: number
) {
  const mentions =
    await db.orm.public.Mention.all();

  return mentions.filter(
    (mention) =>
      mention.commentId === commentId
  );
}

export async function getMentionsByUserId(
  userId: number
) {
  const mentions =
    await db.orm.public.Mention.all();

  return mentions.filter(
    (mention) =>
      mention.userId === userId
  );
}

export async function createMention(data: {
  commentId: number;
  userId: number;
}) {
  return db.orm.public.Mention.create({
    commentId: data.commentId,
    userId: data.userId,
  });
}

export async function getMentionById(
  mentionId: number
) {
  const mentions =
    await db.orm.public.Mention.all();

  return (
    mentions.find(
      (mention) =>
        mention.id === mentionId
    ) ?? null
  );
}