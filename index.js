import { registerRootComponent } from 'expo';
import App from './App';
import { measureStartup } from './src/utils/performance';

// Log performance in development only
if (__DEV__) {
  measureStartup();
}

registerRootComponent(App);
