import axios from 'axios';

export const useAxios = () => {
	const instance = axios.create({
		baseURL: 'http://localhost:8000/api/v1',
		timeout: 1000,
	});

	return instance;
};
