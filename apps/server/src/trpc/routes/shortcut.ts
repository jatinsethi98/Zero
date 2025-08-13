import { shortcutSchema } from '../../lib/shortcuts';
import { getZeroDB } from '../../lib/server-utils';
import { privateProcedure, router } from '../trpc';
import { z } from 'zod';

export const shortcutRouter = router({
  update: privateProcedure
    .input(
      z.object({
        shortcuts: z.array(shortcutSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { sessionUser } = ctx;
      const { shortcuts } = input;
      const db = await getZeroDB(sessionUser.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.insertUserHotkeys(shortcuts as any);
    }),
});
