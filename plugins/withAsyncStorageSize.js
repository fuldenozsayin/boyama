/**
 * Expo config plugin: raise the Android AsyncStorage database cap
 * (default 6 MB) so stroke-heavy drawings never hit "database full".
 * Applied on every `expo prebuild`, so it also works in CI and EAS Build.
 */
const { withGradleProperties } = require('expo/config-plugins');

module.exports = function withAsyncStorageSize(config, { sizeMB = 64 } = {}) {
  return withGradleProperties(config, (c) => {
    c.modResults = c.modResults.filter((p) => !(p.type === 'property' && p.key === 'AsyncStorage_db_size_in_MB'));
    c.modResults.push({ type: 'property', key: 'AsyncStorage_db_size_in_MB', value: String(sizeMB) });
    return c;
  });
};
