import app from './app';
import { APP_CONFIG, COMMON_STRINGS } from './constants';

// Use port 5001 (Port 5000 is reserved by macOS AirPlay Receiver)
const PORT = process.env.PORT || APP_CONFIG.DEFAULT_PORT;

app.listen(PORT, () => {
  console.log(`${COMMON_STRINGS.LOGS.API_RUNNING}${PORT}`);
  console.log(`${COMMON_STRINGS.LOGS.SWAGGER_DOCS}${PORT}/api-docs`);
});
