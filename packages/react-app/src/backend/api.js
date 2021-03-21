const API_PREFIX = (process.env.NODE_ENV == 'production') ? 'https://api.gft.art/api/v1/' : 'http://localhost:4000/api/v1/'

async function send(method, endpoint, data, params) {
    const settings = {
        method: method,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
    };

    if (data) {
        settings.body = JSON.stringify(data)
    }

    try {
        const fetchResponse = await fetch(`${API_PREFIX}${endpoint}`, settings);
        try {
            const data = await fetchResponse.clone().json();
            return { data };
        } catch (error) {
            const text = await fetchResponse.text()

            return (fetchResponse.status === 200) ?
                { data: text } : { error: text }
        }
    } catch (error) {
        return { error };
    }
}


async function get(endpoint) {
    return await send("GET", endpoint)
}

async function post(endpoint, data) {
    return await send("POST", endpoint, data)
}


export { get, post }