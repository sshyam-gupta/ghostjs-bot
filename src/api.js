const axios = require("axios").default;

const REPO_NAME = `github-ghost-n8n`;
const OWNER_NAME = `sshyam-gupta`;
const BASE_URL = `https://api.github.com/repos/${OWNER_NAME}/${REPO_NAME}/`;

/*
 * Parses the JSON returned by a network request
 * @param  {object} response A response from a network request
 * @return {object}          The parsed JSON, status from the response
 */

function parseJSON(response) {
  return new Promise((resolve) =>
    response.json().then((json) =>
      resolve({
        status: response.status,
        ok: response.ok,
        json,
      })
    )
  );
}

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {Promise}           The request promise
 */
function request(endpoint, options) {
  return new Promise((resolve, reject) => {
    fetch(`${BASE_URL}/${endpoint}`, options)
      .then(parseJSON)
      .then((response) => {
        if (response.ok) {
          return resolve(response.json);
        }
        // extract the error from the server's json
        return reject(response.json.meta.error);
      })
      .catch((error) =>
        reject({
          networkError: error.message,
        })
      );
  });
}

axios.defaults.baseURL = BASE_URL;
axios.defaults.headers.get["Accept"] = "application/json";
axios.defaults.headers.post["Accept"] = "application/json";

const apiRequest = (endpoint, options) =>
  axios(`${endpoint}`, options).then((res) => res.data);

exports.apiRequest = apiRequest;
