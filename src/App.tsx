import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { getCurrentUser } from './services/pushbulletService';
import { User } from './types';
import { getStorage, setStorage, removeStorage } from './utils/storage';

function App() {
	const [apiKey, setApiKey] = useState<string | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | undefined>();

	useEffect(() => {
		const init = async () => {
			const storedKey = await getStorage('pb_api_key');
			if (storedKey) {
				verifyAndLogin(storedKey);
			} else {
				setLoading(false);
			}
		};
		init();
	}, []);

	const verifyAndLogin = async (key: string) => {
		setLoading(true);
		setError(undefined);
		try {
			const userData = await getCurrentUser(key);
			setUser(userData);
			setApiKey(key);
			await setStorage('pb_api_key', key);
			await setStorage('pb_user_iden', userData.iden);
		} catch (err) {
			console.error('Login failed:', err);
			setError('Invalid API Key. Please check your Access Token in Pushbullet Settings.');
			await removeStorage('pb_api_key');
			await removeStorage('pb_user_iden');
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		setApiKey(null);
		setUser(null);
		await removeStorage('pb_api_key');
		await removeStorage('pb_user_iden');
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
			</div>
		);
	}

	if (!apiKey || !user) {
		return <Login onLogin={verifyAndLogin} error={error} />;
	}

	return <Dashboard apiKey={apiKey} user={user} onLogout={handleLogout} />;
}

export default App;
