import { defineBoot } from '#q-app/wrappers';
import { PiniaColada } from '@pinia/colada';

export default defineBoot(({ app }) => {
  app.use(PiniaColada, {
    queryOptions: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  });
});
