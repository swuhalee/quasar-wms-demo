import { defineBoot } from '#q-app/wrappers';

export default defineBoot(async () => {
  if (process.env.DEV) {
    const { worker } = await import('src/mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }
});
